import { createClient as createServerClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { PaymentFactory } from "@/lib/payments/PaymentFactory";
import { ServerSubscriptionService } from "@/lib/services/ServerSubscriptionService";
import {
  CreateCheckoutSessionOptions,
  CheckoutSessionResult,
  PaymentStatus,
} from "@/lib/payments/types";

export interface CreatePaymentParams {
  userId: string;
  amount: number; // in PHP
  currency?: string;
  purpose: string;
  referenceId?: string;
  description: string;
  lineItems?: Array<{
    name: string;
    amount: number;
    quantity: number;
    currency?: string;
    description?: string;
    images?: string[];
  }>;
  metadata?: Record<string, any>;
  successUrl: string;
  cancelUrl: string;
  paymentMethodTypes?: string[];
  providerName?: string;
}

export class ServerPaymentService {
  /**
   * Create a checkout session with the payment provider and save a pending payment record in DB.
   */
  static async createCheckoutSession(
    params: CreatePaymentParams
  ): Promise<{ paymentId: string; checkoutUrl: string; checkoutSessionId: string }> {
    const supabase = await createServerClient();

    // Ensure authenticated user matches request
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== params.userId) {
      throw new Error("Unauthorized payment creation request.");
    }

    const provider = PaymentFactory.getProvider(params.providerName);

    const sessionOptions: CreateCheckoutSessionOptions = {
      userId: params.userId,
      amount: params.amount,
      currency: params.currency || "PHP",
      purpose: params.purpose,
      referenceId: params.referenceId,
      description: params.description,
      lineItems: params.lineItems,
      metadata: params.metadata,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      paymentMethodTypes: params.paymentMethodTypes,
    };

    // 1. Create checkout session via PayMongo / Provider API
    const sessionResult: CheckoutSessionResult =
      await provider.createCheckoutSession(sessionOptions);

    // 2. Save pending payment record in database
    const { data: paymentRecord, error } = await supabase
      .from("payments")
      .insert({
        user_id: params.userId,
        amount: params.amount,
        currency: params.currency || "PHP",
        status: "pending",
        provider: provider.providerName,
        checkout_session_id: sessionResult.checkoutSessionId,
        checkout_url: sessionResult.checkoutUrl,
        purpose: params.purpose,
        reference_id: params.referenceId || null,
        metadata: params.metadata || {},
      })
      .select("id")
      .single();

    if (error || !paymentRecord) {
      console.error("Failed to insert pending payment record:", error);
      throw new Error(
        `Database error while recording pending payment: ${error?.message || "Unknown error"}`
      );
    }

    return {
      paymentId: paymentRecord.id,
      checkoutUrl: sessionResult.checkoutUrl,
      checkoutSessionId: sessionResult.checkoutSessionId,
    };
  }

  /**
   * Handle and process incoming raw webhook from payment provider.
   * Uses service role client to bypass RLS for payment updates and webhook auditing.
   */
  static async handleWebhook(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    providerName: string = "paymongo"
  ): Promise<{ status: string; eventId?: string; message?: string }> {
    const serviceClient = createServiceClient();
    if (!serviceClient) {
      throw new Error("Service role client unavailable for webhook execution.");
    }

    const provider = PaymentFactory.getProvider(providerName);

    // 1. Verify webhook signature
    const verification = await provider.verifyWebhookSignature(rawBody, headers);

    if (!verification.isValid || !verification.payload) {
      console.error("Webhook signature verification failed:", verification.error);
      return { status: "failed", message: verification.error || "Invalid signature" };
    }

    const parsedEvent = provider.parseWebhookEvent(verification.payload);

    if (!parsedEvent) {
      return { status: "ignored", message: "Unhandled event type or incomplete data" };
    }

    // 2. Check webhook idempotency (has event_id already been processed?)
    const { data: existingWebhook } = await serviceClient
      .from("payment_webhooks")
      .select("id, status")
      .eq("event_id", parsedEvent.eventId)
      .maybeSingle();

    if (existingWebhook) {
      return {
        status: "ignored",
        eventId: parsedEvent.eventId,
        message: "Duplicate event received - already processed.",
      };
    }

    // 3. Update payment status in database if matching checkout session or provider payment ID is found
    let paymentUpdateError: string | null = null;

    try {
      if (parsedEvent.checkoutSessionId || parsedEvent.providerPaymentId) {
        const updatePayload: Record<string, any> = {
          status: parsedEvent.status,
          updated_at: new Date().toISOString(),
        };

        if (parsedEvent.providerPaymentId) {
          updatePayload.provider_payment_id = parsedEvent.providerPaymentId;
        }

        if (parsedEvent.paymentIntentId) {
          updatePayload.payment_intent_id = parsedEvent.paymentIntentId;
        }

        if (parsedEvent.paymentMethodType) {
          updatePayload.payment_method_type = parsedEvent.paymentMethodType;
        }

        if (parsedEvent.paidAt) {
          updatePayload.paid_at = parsedEvent.paidAt.toISOString();
        }

        // Query by checkout_session_id first, fallback to provider_payment_id
        let query = serviceClient.from("payments").update(updatePayload);

        if (parsedEvent.checkoutSessionId) {
          query = query.eq("checkout_session_id", parsedEvent.checkoutSessionId);
        } else if (parsedEvent.providerPaymentId) {
          query = query.eq("provider_payment_id", parsedEvent.providerPaymentId);
        }

        const { error } = await query;
        if (error) {
          paymentUpdateError = error.message;
          console.error("Failed to update payment record:", error);
        } else if (parsedEvent.status === "paid") {
          try {
            const { data: updatedPayment } = await serviceClient
              .from("payments")
              .select("id, user_id, purpose, metadata")
              .or(`checkout_session_id.eq.${parsedEvent.checkoutSessionId},provider_payment_id.eq.${parsedEvent.providerPaymentId}`)
              .maybeSingle();

            if (
              updatedPayment &&
              updatedPayment.purpose === "subscription" &&
              updatedPayment.metadata?.plan_id
            ) {
              await ServerSubscriptionService.activateSubscription(
                updatedPayment.user_id,
                updatedPayment.metadata.plan_id,
                updatedPayment.id
              );
            }

            if (
              updatedPayment &&
              updatedPayment.purpose === "listing_boost" &&
              updatedPayment.metadata?.listing_id &&
              updatedPayment.metadata?.duration_days
            ) {
              const durationDays = Number(updatedPayment.metadata.duration_days);
              const boostExpiresAt = new Date();
              boostExpiresAt.setDate(boostExpiresAt.getDate() + durationDays);

              await serviceClient
                .from("listings")
                .update({
                  boosted: true,
                  boost_expires_at: boostExpiresAt.toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", updatedPayment.metadata.listing_id);
            }
          } catch (subErr) {
            console.error("Failed to activate subscription after payment:", subErr);
          }
        }
      }
    } catch (err: any) {
      paymentUpdateError = err.message || "Failed to update payment";
    }

    // 4. Record webhook in payment_webhooks table for audit and idempotency
    const { error: webhookInsertError } = await serviceClient
      .from("payment_webhooks")
      .insert({
        event_id: parsedEvent.eventId,
        event_type: parsedEvent.eventType,
        payload: verification.payload,
        status: paymentUpdateError ? "failed" : "processed",
        error_message: paymentUpdateError,
        processed_at: new Date().toISOString(),
      });

    if (webhookInsertError) {
      console.error("Failed to log webhook event:", webhookInsertError);
    }

    return {
      status: paymentUpdateError ? "failed" : "processed",
      eventId: parsedEvent.eventId,
      message: paymentUpdateError || undefined,
    };
  }

  /**
   * Verify and return payment status for client polling/verification.
   */
  static async verifyPayment(
    checkoutSessionId: string,
    userId: string
  ): Promise<{
    id: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    purpose: string;
    referenceId?: string | null;
    metadata?: any;
    paidAt?: string | null;
  }> {
    const supabase = await createServerClient();

    // 1. Fetch payment record
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("checkout_session_id", checkoutSessionId)
      .eq("user_id", userId)
      .single();

    if (error || !payment) {
      throw new Error("Payment record not found or access denied.");
    }

    // 2. If status is still pending, query provider API to fallback check if checkout was completed
    if (payment.status === "pending") {
      try {
        const provider = PaymentFactory.getProvider(payment.provider);
        const sessionData = await provider.getCheckoutSession(checkoutSessionId);

        const paymentsList = sessionData?.attributes?.payments || [];
        if (paymentsList.length > 0) {
          const primaryPayment = paymentsList[0];
          const paymentStatus = primaryPayment.attributes?.status;

          if (paymentStatus === "paid") {
            const serviceClient = createServiceClient();
            if (serviceClient) {
              const paidAt = primaryPayment.attributes?.paid_at
                ? new Date(primaryPayment.attributes.paid_at * 1000).toISOString()
                : new Date().toISOString();

              await serviceClient
                .from("payments")
                .update({
                  status: "paid",
                  provider_payment_id: primaryPayment.id,
                  payment_intent_id: primaryPayment.attributes?.payment_intent_id,
                  payment_method_type:
                    primaryPayment.attributes?.source?.type ||
                    primaryPayment.attributes?.payment_method_type,
                  paid_at: paidAt,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", payment.id);

              payment.status = "paid";
              payment.paid_at = paidAt;

              if (payment.purpose === "subscription" && payment.metadata?.plan_id) {
                try {
                  await ServerSubscriptionService.activateSubscription(
                    payment.user_id,
                    payment.metadata.plan_id,
                    payment.id
                  );
                } catch (subErr) {
                  console.error("Subscription activation during fallback verification failed:", subErr);
                }
              }

              if (
                payment.purpose === "listing_boost" &&
                payment.metadata?.listing_id &&
                payment.metadata?.duration_days
              ) {
                try {
                  const durationDays = Number(payment.metadata.duration_days);
                  const boostExpiresAt = new Date();
                  boostExpiresAt.setDate(boostExpiresAt.getDate() + durationDays);

                  await serviceClient
                    .from("listings")
                    .update({
                      boosted: true,
                      boost_expires_at: boostExpiresAt.toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", payment.metadata.listing_id);
                } catch (boostErr) {
                  console.error("Boost activation during fallback verification failed:", boostErr);
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("Fallback provider checkout check failed:", err);
      }
    }

    // 3. Safety net: if this payment is paid but somehow has no matching
    // active subscription (e.g. the webhook or the fallback check above
    // updated the status but a subsequent activation step failed), retry
    // activation here. This makes activation idempotent regardless of
    // which path (webhook vs. this endpoint) first marked the payment paid.
    if (
      payment.status === "paid" &&
      payment.purpose === "subscription" &&
      payment.metadata?.plan_id
    ) {
      try {
        const serviceClient = createServiceClient();
        if (serviceClient) {
          const { data: existingSub } = await serviceClient
            .from("user_subscriptions")
            .select("id")
            .eq("payment_id", payment.id)
            .maybeSingle();

          if (!existingSub) {
            await ServerSubscriptionService.activateSubscription(
              payment.user_id,
              payment.metadata.plan_id,
              payment.id
            );
          }
        }
      } catch (activationErr) {
        console.error(
          "Idempotent subscription activation retry failed:",
          activationErr
        );
      }
    }

    return {
      id: payment.id,
      status: payment.status as PaymentStatus,
      amount: Number(payment.amount),
      currency: payment.currency,
      purpose: payment.purpose,
      referenceId: payment.reference_id,
      metadata: payment.metadata,
      paidAt: payment.paid_at,
    };
  }
}
