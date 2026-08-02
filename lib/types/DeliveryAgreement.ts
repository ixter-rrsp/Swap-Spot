export type DeliveryAgreementStatus =
  | "awaiting_info"
  | "ready_to_book"
  | "booked"
  | "picked_up";

export type CourierProvider =
  | "lalamove"
  | "grabexpress"
  | "borzo"
  | "lbc"
  | "jt"
  | "other";

export interface DeliveryPartyInfo {
  fullName?: string | null;
  mobileNumber?: string | null;
  pickupAddress?: string | null;
  unitFloor?: string | null;
  landmark?: string | null;
  pickupNotes?: string | null;
  infoSubmittedAt?: string | null;

  courier?: CourierProvider | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  bookingSubmittedAt?: string | null;

  pickedUpAt?: string | null;
}

export interface DeliveryAgreement {
  id: string;
  swapAgreementId: string;
  conversationId: string;

  requesterId: string;
  receiverId: string;

  status: DeliveryAgreementStatus;

  requester: DeliveryPartyInfo;
  receiver: DeliveryPartyInfo;

  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAgreementDetail extends DeliveryAgreement {
  // The authenticated caller's id + their role, so the client never has
  // to guess which side ("requester" vs "receiver") it is.
  currentUserId: string;
  isRequester: boolean;

  // Only populated once both parties have submitted their info — the
  // instructions the CURRENT user needs in order to book their own leg.
  myBookingInstructions: BookingInstructions | null;
}

export interface BookingInstructions {
  itemTitle: string;
  pickup: {
    name: string;
    phone: string;
    address: string;
    unitOrLandmark?: string | null;
  };
  receiver: {
    name: string;
    phone: string;
  };
  dropoffAddress: string;
  notes?: string | null;
}

export interface SubmitDeliveryInfoInput {
  fullName: string;
  mobileNumber: string;
  pickupAddress: string;
  unitFloor?: string;
  landmark?: string;
  pickupNotes?: string;
}

export interface SubmitCourierBookingInput {
  courier: CourierProvider;
  trackingNumber: string;
  trackingUrl?: string;
}
