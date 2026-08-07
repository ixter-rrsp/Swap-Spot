import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { markNotificationsByCategoryAsRead } from "@/lib/services/ServerNotificationService";
import { NotificationCategory } from "@/lib/types/Notification";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category } = (await request.json()) as {
      category?: NotificationCategory;
    };

    if (!category) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }

    await markNotificationsByCategoryAsRead(category);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error marking category as read:", error);
    return NextResponse.json(
      {
        error:
          (error as Error).message || "Failed to mark category as read.",
      },
      { status: 500 }
    );
  }
}
