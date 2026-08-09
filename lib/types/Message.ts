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

export type ReactionType =
  | "heart"
  | "haha"
  | "wow"
  | "sad"
  | "angry"
  | "like";

export const REACTION_EMOJI: Record<ReactionType, string> = {
  heart: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😠",
  like: "👍",
};

export const REACTION_TYPES: ReactionType[] = [
  "heart",
  "haha",
  "wow",
  "sad",
  "angry",
  "like",
];

export interface MessageReaction {
  userId: string;
  reaction: ReactionType;
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

  reactions?: MessageReaction[];
}