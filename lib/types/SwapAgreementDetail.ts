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

  // Only meaningful when deliveryMethod is "other_courier": whether the
  // current user has marked their item as picked up in the Delivery
  // Agreement yet. Null for meetup swaps, where this doesn't apply.
  // A swap can't be completed by this user until this is true.
  myItemPickedUp: boolean | null;

  // Only meaningful when deliveryMethod is "other_courier": whether the
  // OTHER party has marked their item as picked up. Both sides must be
  // true before the swap can be completed by either party.
  otherItemPickedUp: boolean | null;
}