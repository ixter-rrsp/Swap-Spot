export interface Notification {
  id: string;

  userId: string;

  type:
    | "swap_request"
    | "swap_accepted"
    | "swap_declined";

  title: string;

  message: string;

  referenceId?: string | null;

  isRead: boolean;

  createdAt: string;
}