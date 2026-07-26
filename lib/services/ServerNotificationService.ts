import { createClient } from "@/utils/supabase/server";

import {
  Notification,
  NotificationCategory,
  NotificationCategorySummary,
  NotificationType,
  getNotificationCategory,
  notificationCategoryIcon,
  notificationCategoryOrder,
  notificationCategoryTitle,
  notificationCategoryTypes,
} from "@/lib/types/Notification";
import { getUnreadChatMessageCount } from "@/lib/services/ServerChatService";

export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapNotification);
}

function formatRelativeTime(date: string) {
  const now = Date.now();
  const created = new Date(date).getTime();
  const seconds = Math.floor((now - created) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d`;
  }

  return `${Math.floor(days / 7)}w`;
}

export async function getNotificationCategorySummaries(): Promise<
  NotificationCategorySummary[]
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    return notificationCategoryOrder.map((category) => ({
      category,
      title: notificationCategoryTitle[category],
      icon: notificationCategoryIcon[category],
      unreadCount: 0,
      totalCount: 0,
      lastActivityAt: null,
      lastActivityLabel: "No activity",
    }));
  }

  type NotificationSummaryRow = {
    type: string;
    is_read: boolean;
    created_at: string;
  };

  const summaryResult = await supabase
    .from("notifications")
    .select("type,is_read,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (summaryResult.error) {
    throw new Error(summaryResult.error.message);
  }

  const data = summaryResult.data as NotificationSummaryRow[] | null;

  const categorySummaryMap = notificationCategoryOrder.reduce(
    (acc, category) => {
      acc[category] = {
        totalCount: 0,
        unreadCount: 0,
        lastActivityAt: null as string | null,
      };
      return acc;
    },
    {} as Record<NotificationCategory, {
      totalCount: number;
      unreadCount: number;
      lastActivityAt: string | null;
    }>
  );

  for (const item of data ?? []) {
    const category = getNotificationCategory(item.type);
    const summary = categorySummaryMap[category];

    summary.totalCount += 1;

    if (!item.is_read) {
      summary.unreadCount += 1;
    }

    if (
      item.created_at &&
      (summary.lastActivityAt === null ||
        new Date(item.created_at).getTime() >
          new Date(summary.lastActivityAt).getTime())
    ) {
      summary.lastActivityAt = item.created_at;
    }
  }

  return notificationCategoryOrder.map((category) => {
    const lastActivityAt = categorySummaryMap[category].lastActivityAt;

    return {
      category,
      title: notificationCategoryTitle[category],
      icon: notificationCategoryIcon[category],
      unreadCount: categorySummaryMap[category].unreadCount,
      totalCount: categorySummaryMap[category].totalCount,
      lastActivityAt,
      lastActivityLabel: lastActivityAt
        ? formatRelativeTime(lastActivityAt)
        : "No activity",
    };
  });
}

export async function getNotificationsByCategory(
  category: NotificationCategory
): Promise<Notification[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    return [];
  }

  const query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  query.in("type", notificationCategoryTypes[category]);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapNotification);
}

export async function getUnreadActivityCount() {
  const unreadNotifications = await getUnreadNotificationCount();
  const unreadChats = await getUnreadChatMessageCount();

  return unreadNotifications + unreadChats;
}

export async function getUnreadNotificationCount() {

  const supabase = await createClient();


  const {
    data: {
      user,
    },
    error: authError,
  } =
    await supabase.auth.getUser();


  if (authError || !user) {
    return 0;
  }


  const {
    count,
    error,
  } =
    await supabase
      .from("notifications")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "is_read",
        false
      );


  if (error) {
    throw new Error(error.message);
  }


  return count ?? 0;
}

export async function markNotificationAsRead(
  notificationId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
  };
}

type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
};

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,

    userId: row.user_id,

    type: row.type,

    title: row.title,

    message: row.message,

    referenceId: row.reference_id,

    isRead: row.is_read,

    createdAt: row.created_at,
  };
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markNotificationsByCategoryAsRead(category: NotificationCategory) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const types = notificationCategoryTypes[category] ?? [];

  if (types.length === 0) return;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("type", types)
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }
}