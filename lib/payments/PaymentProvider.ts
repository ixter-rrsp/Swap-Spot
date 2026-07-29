import {
  CreateCheckoutSessionOptions,
  CheckoutSessionResult,
  WebhookVerificationResult,
  ParsedWebhookEvent,
} from "./types";

export interface PaymentProvider {
  readonly providerName: string;

  /**
   * Create a checkout session with the payment gateway sandbox/live API.
   */
  createCheckoutSession(
    options: CreateCheckoutSessionOptions
  ): Promise<CheckoutSessionResult>;

  /**
   * Verify incoming webhook headers and raw body signature.
   */
  verifyWebhookSignature(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookVerificationResult>;

  /**
   * Parse the webhook event payload into standard payment attributes.
   */
  parseWebhookEvent(payload: any): ParsedWebhookEvent | null;

  /**
   * Fetch current checkout session status directly from provider API.
   */
  getCheckoutSession(checkoutSessionId: string): Promise<any>;
}
