export interface ClientCheckoutParams {
  amount: number;
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
}

export class PaymentService {
  /**
   * Client-side function to initiate checkout session.
   */
  static async createCheckoutSession(params: ClientCheckoutParams): Promise<{
    paymentId: string;
    checkoutUrl: string;
    checkoutSessionId: string;
  }> {
    const response = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create checkout session");
    }

    return data;
  }

  /**
   * Client-side function to check payment status after redirect.
   */
  static async verifyPayment(checkoutSessionId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    purpose: string;
    referenceId?: string | null;
    metadata?: any;
    paidAt?: string | null;
  }> {
    const response = await fetch(
      `/api/payments/verify?checkout_session_id=${encodeURIComponent(
        checkoutSessionId
      )}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to verify payment status");
    }

    return data;
  }
}
