import { SwapAgreementStatus } from "./SwapAgreementStatus";

export type DeliveryMethod = "meetup" | "other_courier";
export type ItemCondition =
  | "new"
  | "like_new"
  | "good"
  | "fair"
  | "needs_repair";

export interface SwapAgreement {
  id: string;

  swapRequestId: string;
  conversationId: string;

  requesterId: string;
  receiverId: string;

  deliveryMethod: DeliveryMethod;

  meetupLocation?: string | null;
  meetupDate?: string | null;
  meetupTime?: string | null;

  pickupAddress?: string | null;
  dropoffAddress?: string | null;

  phoneRequester?: string | null;
  phoneReceiver?: string | null;
  emailRequester?: string | null;
  emailReceiver?: string | null;

  requesterCondition?: ItemCondition | null;
  receiverCondition?: ItemCondition | null;

  requesterAccessories?: string | null;
  receiverAccessories?: string | null;

  notes?: string | null;

  requesterConfirmedAt?: string | null;
  receiverConfirmedAt?: string | null;

  requesterCompletedAt?: string | null;
  receiverCompletedAt?: string | null;

  status: SwapAgreementStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateSwapAgreementInput {
  swapRequestId: string;
  conversationId: string;

  deliveryMethod: DeliveryMethod;

  meetupLocation?: string;
  meetupDate?: string;
  meetupTime?: string;

  pickupAddress?: string;
  dropoffAddress?: string;

  phoneRequester?: string;
  phoneReceiver?: string;
  emailRequester?: string;
  emailReceiver?: string;

  requesterCondition?: ItemCondition;
  receiverCondition?: ItemCondition;

  requesterAccessories?: string;
  receiverAccessories?: string;

  notes?: string;
}