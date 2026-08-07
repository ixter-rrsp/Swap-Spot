import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUnreadActivityCount, markAllNotificationsAsRead } from "@/lib/services/ServerNotificationService";

export async function GET() {
  try {
    const unreadCount = await getUnreadActivityCount();
    return NextResponse.json({ unreadCount });
  } catch (error: unknown) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch unread count." },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await markAllNotificationsAsRead();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to mark notifications as read." },
      { status: 500 }
    );
  }
}

