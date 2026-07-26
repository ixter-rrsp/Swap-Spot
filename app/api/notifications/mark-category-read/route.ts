import { NextResponse } from "next/server";
import { markNotificationsByCategoryAsRead } from "@/lib/services/ServerNotificationService";
import { isNotificationCategory } from "@/lib/types/Notification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category } = body ?? {};

    if (!category || !isNotificationCategory(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    await markNotificationsByCategoryAsRead(category);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
