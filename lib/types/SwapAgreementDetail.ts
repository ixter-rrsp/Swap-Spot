import { SwapAgreement } from "./SwapAgreement";

export interface SwapAgreementDetail extends SwapAgreement {
  // The currently-authenticated user's id, included by getSwapAgreementById
  // so callers can determine requester/receiver role without a separate
  // auth lookup — mirrors the same field on SwapRequestDetail.
  currentUserId: string;
}