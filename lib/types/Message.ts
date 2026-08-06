export type MessageType =
  | "text"
  | "image"
  | "video"
  | "swap_proposal"
  | "swap_agreement"
  | "system"
  | "review_request";

export interface MessageReplyPreview {
  id: string;
  senderId: string;
  message: string;
  messageType: MessageType;
}

export interface Message {
  id: string;
  senderId: string;
  message: string;
  isRead: boolean;
  createdAt: string;

  messageType: MessageType;
  imageUrl?: string | null;
  videoUrl?: string | null;
  swapRequestId?: string | null;
  swapAgreementId?: string | null;

  unsentAt?: string | null;
  replyToId?: string | null;
  replyPreview?: MessageReplyPreview | null;
}