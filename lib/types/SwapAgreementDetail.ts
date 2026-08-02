import { SwapAgreement } from "./SwapAgreement";

export interface SwapAgreementDetail extends SwapAgreement {
  // The currently-authenticated user's id, included by getSwapAgreementById
  // so callers can determine requester/receiver role without a separate
  // auth lookup — mirrors the same field on SwapRequestDetail.
  currentUserId: string;

  // Only meaningful when deliveryMethod is "other_courier": whether the
  // current user has submitted their own pickup details in the Delivery
  // Agreement yet. Null for meetup swaps, where this doesn't apply.
  myDeliveryInfoSubmitted: boolean | null;
}