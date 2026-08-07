import crypto from "crypto";
import { PaymentProvider } from "./PaymentProvider";
import {
  CreateCheckoutSessionOptions,
  CheckoutSessionResult,
  WebhookVerificationResult,
  ParsedWebhookEvent,
  PaymentStatus,
} from "./types";

// Minimal shape of a PayMongo webhook payload — only the fields this
// provider actually reads. PayMongo's real payloads carry more fields per
// resource type, so this stays intentionally loose (optional chaining below
// still guards against missing fields) rather than modeling their full API.
interface PayMongoWebhookPayload {
  data?: {
    id?: string;
    attributes?: {
      type?: string;
      data?: {
        id?: string;
        attributes?: {
          payments?: Array<{
            id?: string;
            attributes?: {
              payment_intent_id?: string;
              payment_method_type?: string;
              paid_at?: number;
              source?: { type?: string };
            };
          }>;
          payment_intent_id?: string;
          payment_method_type?: string;
          paid_at?: number;
          source?: { type?: string };
        };
      };
    };
  };
}

interface PayMongoCheckoutSession {
  id: string;
  type: string;
  attributes: {
    checkout_url: string;
    [key: string]: unknown;
  };
}

export class PayMongoProvider implements PaymentProvider {
  readonly providerName = "paymongo";
  private baseUrl = "https://api.paymongo.com/v1";

  private getSecretKey(): string {
    const key = process.env.PAYMONGO_SECRET_KEY;
    if (!key) {
      throw new Error(
        "PAYMONGO_SECRET_KEY is not defined in environment variables."
      );
    }
    return key;
  }

  private getWebhookSecret(): string {
    return process.env.PAYMONGO_WEBHOOK_SECRET || "";
  }

  private getAuthHeader(): string {
    const secret = this.getSecretKey();
    const encoded = Buffer.from(`${secret}:`).toString("base64");
    return `Basic ${encoded}`;
  }

  async createCheckoutSession(
    options: CreateCheckoutSessionOptions
  ): Promise<CheckoutSessionResult> {
    const currency = (options.currency || "PHP").toUpperCase();

    // Convert decimal PHP amount to centavos (e.g., 150.00 -> 15000 centavos)
    const amountInCentavos = Math.round(options.amount * 100);

    const lineItems =
      options.lineItems && options.lineItems.length > 0
        ? options.lineItems.map((item) => ({
            name: item.name,
            amount: Math.round(item.amount * 100),
            quantity: item.quantity,
            currency: (item.currency || currency).toUpperCase(),
            description: item.description,
            images: item.images,
          }))
        : [
            {
              name: options.description || "SwapSpot Payment",
              amount: amountInCentavos,
              quantity: 1,
              currency,
            },
          ];

    const payload = {
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          description: options.description,
          line_items: lineItems,
          payment_method_types: options.paymentMethodTypes || [
            "gcash",
            "paymaya",
            "card",
            "grab_pay",
          ],
          success_url: options.successUrl,
          cancel_url: options.cancelUrl,
          metadata: {
            user_id: options.userId,
            purpose: options.purpose,
            reference_id: options.referenceId || null,
            ...(options.metadata || {}),
          },
        },
      },
    };

    const response = await fetch(`${this.baseUrl}/checkout_sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
      const errorMsg =
        data.errors?.[0]?.detail ||
        data.errors?.[0]?.code ||
        `PayMongo Checkout Creation failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    const session = data.data;
    const checkoutUrl = session.attributes.checkout_url;
    const checkoutSessionId = session.id;

    return {
      checkoutSessionId,
      checkoutUrl,
      provider: this.providerName,
      rawResponse: session,
    };
  }

  async verifyWebhookSignature(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookVerificationResult> {
    const signatureHeader =
      headers["paymongo-signature"] || headers["Paymongo-Signature"];

    const webhookSecret = this.getWebhookSecret();

    // If no secret configured in test/sandbox, log warning or enforce
    if (!signatureHeader || Array.isArray(signatureHeader)) {
      return {
        isValid: false,
        error: "Missing or invalid paymongo-signature header",
      };
    }

    if (!webhookSecret) {
      // Return invalid if webhook secret is required
      return {
        isValid: false,
        error: "PAYMONGO_WEBHOOK_SECRET is not configured",
      };
    }

    try {
      // Parse header: t=timestamp,te=test_signature,li=live_signature
      const parts = signatureHeader.split(",");
      let timestamp = "";
      let testSignature = "";
      let liveSignature = "";

      for (const part of parts) {
        const [key, value] = part.split("=");
        if (key === "t") timestamp = value;
        if (key === "te") testSignature = value;
        if (key === "li") liveSignature = value;
      }

      const signatureToMatch = testSignature || liveSignature;
      if (!timestamp || !signatureToMatch) {
        return {
          isValid: false,
          error: "Signature components missing from paymongo-signature header",
        };
      }

      const signedPayload = `${timestamp}.${rawBody}`;
      const computedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(signedPayload)
        .digest("hex");

      const isValid = crypto.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(signatureToMatch)
      );

      const payload = JSON.parse(rawBody);
      const eventId = payload?.data?.id;
      const eventType = payload?.data?.attributes?.type;

      return {
        isValid,
        eventId,
        eventType,
        payload,
        error: isValid ? undefined : "HMAC signature comparison failed",
      };
    } catch (err: unknown) {
      return {
        isValid: false,
        error: (err as Error).message || "Failed to verify webhook signature",
      };
    }
  }

  parseWebhookEvent(payload: PayMongoWebhookPayload): ParsedWebhookEvent | null {
    if (!payload?.data) return null;

    const eventId = payload.data.id;
    const eventType = payload.data.attributes?.type;
    const eventData = payload.data.attributes?.data;

    if (!eventId || !eventType || !eventData) return null;

    let status: PaymentStatus = "pending";
    let checkoutSessionId: string | undefined = undefined;
    let providerPaymentId: string | undefined = undefined;
    let paymentIntentId: string | undefined = undefined;
    let paymentMethodType: string | undefined = undefined;
    let paidAt: Date | undefined = undefined;

    if (eventType === "checkout_session.payment.paid") {
      status = "paid";
      checkoutSessionId = eventData.id;

      // Extract payment details inside attributes.payments array if present
      const paymentsList = eventData.attributes?.payments || [];
      if (paymentsList.length > 0) {
        const primaryPayment = paymentsList[0];
        providerPaymentId = primaryPayment.id;
        paymentIntentId = primaryPayment.attributes?.payment_intent_id;
        paymentMethodType =
          primaryPayment.attributes?.source?.type ||
          primaryPayment.attributes?.payment_method_type;

        const paidTimestamp = primaryPayment.attributes?.paid_at;
        if (paidTimestamp) {
          paidAt = new Date(paidTimestamp * 1000);
        }
      }
      if (!paidAt) {
        paidAt = new Date();
      }
    } else if (eventType === "payment.paid") {
      status = "paid";
      providerPaymentId = eventData.id;
      paymentIntentId = eventData.attributes?.payment_intent_id;
      paymentMethodType =
        eventData.attributes?.source?.type ||
        eventData.attributes?.payment_method_type;
      const paidTimestamp = eventData.attributes?.paid_at;
      if (paidTimestamp) {
        paidAt = new Date(paidTimestamp * 1000);
      } else {
        paidAt = new Date();
      }
    } else if (
      eventType === "payment.failed" ||
      eventType === "checkout_session.payment.failed"
    ) {
      status = "failed";
      checkoutSessionId = eventData.id;
    } else if (eventType === "checkout_session.expired") {
      status = "expired";
      checkoutSessionId = eventData.id;
    }

    return {
      eventId,
      eventType,
      checkoutSessionId,
      providerPaymentId,
      paymentIntentId,
      paymentMethodType,
      status,
      paidAt,
      rawPayload: payload,
    };
  }

  async getCheckoutSession(
    checkoutSessionId: string
  ): Promise<PayMongoCheckoutSession> {
    const response = await fetch(
      `${this.baseUrl}/checkout_sessions/${checkoutSessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch PayMongo checkout session ${checkoutSessionId}`
      );
    }

    const data = await response.json();
    return data.data;
  }
}