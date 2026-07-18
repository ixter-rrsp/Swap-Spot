import { ListingOwner } from "./Listing";

export interface SwapRequestDetail {
  id: string;
  currentUserId: string;
  status:
    | "pending"
    | "accepted"
    | "declined"
    | "completed"
    | "cancelled";

  message?: string;

  createdAt: string;

  sender: ListingOwner;

  receiver: ListingOwner;

  offeredListing: {
    id: string;
    title: string;
    city: string;
    swapValue: number;
    imageUrl?: string;
  };

  requestedListing: {
    id: string;
    title: string;
    city: string;
    swapValue: number;
    imageUrl?: string;
  };
}