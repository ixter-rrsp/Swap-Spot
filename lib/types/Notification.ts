export type NotificationType =
  | "new_message"
  | "swap_request"
  | "swap_accepted"
  | "swap_declined"
  | "swap_cancelled"
  | "agreement_created"
  | "agreement_updated"
  | "agreement_confirmed"
  | "agreement_completed"
  | "agreement_cancelled"
  | "delivery_info_needed"
  | "delivery_ready_to_book"
  | "delivery_booked"
  | "swap_completed";

export type NotificationCategory =
  | "requests"
  | "agreements"
  | "completed"
  | "cancelled"
  | "messages";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationCategorySummary {
  category: NotificationCategory;
  title: string;
  icon: string;
  unreadCount: number;
  totalCount: number;
  lastActivityAt: string | null;
  lastActivityLabel: string;
}

export const notificationCategoryTypes: Record<
  NotificationCategory,
  NotificationType[]
> = {
  requests: [
    "swap_request",
    "swap_accepted",
    "swap_declined",
  ],
  agreements: [
    "agreement_created",
    "agreement_updated",
    "agreement_confirmed",
    "agreement_completed",
    "agreement_cancelled",
    "delivery_info_needed",
    "delivery_ready_to_book",
    "delivery_booked",
  ],
  completed: ["swap_completed"],
  cancelled: ["swap_cancelled"],
  messages: ["new_message"],
};

export const notificationCategoryTitle: Record<
  NotificationCategory,
  string
> = {
  requests: "Requests",
  agreements: "Agreements",
  completed: "Completed",
  cancelled: "Cancelled",
  messages: "Messages",
};

export const notificationCategoryIcon: Record<
  NotificationCategory,
  string
> = {
  requests: "requests",
  agreements: "agreements",
  completed: "completed",
  cancelled: "cancelled",
  messages: "messages",
};

export const notificationCategoryOrder: NotificationCategory[] = [
  "requests",
  "agreements",
  "completed",
  "cancelled",
  "messages",
];

export function getNotificationCategory(
  type: string | null | undefined
): NotificationCategory {
  if (
    type === "agreement_created" ||
    type === "agreement_updated" ||
    type === "agreement_confirmed" ||
    type === "agreement_completed" ||
    type === "agreement_cancelled" ||
    type === "delivery_info_needed" ||
    type === "delivery_ready_to_book" ||
    type === "delivery_booked"
  ) {
    return "agreements";
  }

  if (type === "swap_completed") {
    return "completed";
  }

  if (type === "swap_cancelled") {
    return "cancelled";
  }

  if (type === "new_message") {
    return "messages";
  }

  // Fallback to requests for backwards compatibility or unknown types
  return "requests";
}

export function isNotificationCategory(
  category: string | null | undefined
): category is NotificationCategory {
  return (
    category === "requests" ||
    category === "agreements" ||
    category === "completed" ||
    category === "cancelled" ||
    category === "messages"
  );
}
