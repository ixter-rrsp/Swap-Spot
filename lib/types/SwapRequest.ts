import { SwapRequestStatus } from "./SwapRequestStatus";

export interface SwapRequest {
  id: string;

  senderId: string;

  receiverId: string;

  status: SwapRequestStatus;

  createdAt: string;

  offeredListing: SwapRequestListing;

  requestedListing: SwapRequestListing;

  sender: SwapRequestUser;

  receiver: SwapRequestUser;
}

export interface SwapRequestListing {
  id: string;

  title: string;

  imageUrl?: string;

  city: string;

  swapValue: number;
}

export interface SwapRequestUser {
  id: string;

  username: string;

  fullName: string;

  avatarUrl?: string | null;
}