import { NextResponse } from "next/server";
import { getUnreadActivityCount } from "@/lib/services/ServerNotificationService";

export async function GET() {
  try {
    const count = await getUnreadActivityCount();
    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
