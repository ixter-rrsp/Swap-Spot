import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getNotifications,
  getNotificationsByCategory,
} from "@/lib/services/ServerNotificationService";
import { NotificationCategory } from "@/lib/types/Notification";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as NotificationCategory | null;

    if (category) {
      const notifications = await getNotificationsByCategory(category);
      return NextResponse.json(notifications);
    } else {
      const notifications = await getNotifications();
      return NextResponse.json(notifications);
    }
  } catch (error: unknown) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}

