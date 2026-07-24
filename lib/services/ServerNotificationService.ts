import { createClient } from "@/utils/supabase/server";

import { Notification } from "@/lib/types/Notification";

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

function mapNotification(row: any): Notification {
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