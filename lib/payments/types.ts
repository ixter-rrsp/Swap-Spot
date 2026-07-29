export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export type PaymentPurpose =
  | "subscription"
  | "listing_boost"
  | "post_fee"
  | "other"
  | string;

export interface LineItem {
  name: string;
  amount: number; // in main currency unit (e.g. 100.00 for PHP 100)
  quantity: number;
  currency?: string;
  description?: string;
  images?: string[];
}

export interface CreateCheckoutSessionOptions {
  userId: string;
  amount: number; // in main currency unit (e.g. 150.00 PHP)
  currency?: string;
  purpose: PaymentPurpose;
  referenceId?: string;
  description: string;
  lineItems?: LineItem[];
  metadata?: Record<string, any>;
  successUrl: string;
  cancelUrl: string;
  paymentMethodTypes?: string[];
}

export interface CheckoutSessionResult {
  checkoutSessionId: string;
  checkoutUrl: string;
  provider: string;
  rawResponse?: any;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventId?: string;
  eventType?: string;
  payload?: any;
  error?: string;
}

export interface ParsedWebhookEvent {
  eventId: string;
  eventType: string;
  checkoutSessionId?: string;
  providerPaymentId?: string;
  paymentIntentId?: string;
  paymentMethodType?: string;
  status: PaymentStatus;
  paidAt?: Date;
  rawPayload: any;
}
