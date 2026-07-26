import { NextRequest, NextResponse } from "next/server";

import {
  getNotificationCategorySummaries,
  getNotificationsByCategory,
} from "@/lib/services/ServerNotificationService";
import { isNotificationCategory } from "@/lib/types/Notification";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category");

    if (category) {
      if (!isNotificationCategory(category)) {
        return NextResponse.json(
          {
            error: "Unsupported notification category.",
          },
          {
            status: 400,
          }
        );
      }

      const notifications = await getNotificationsByCategory(
        category
      );

      return NextResponse.json({ notifications });
    }

    const categories = await getNotificationCategorySummaries();

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications.",
      },
      {
        status: 500,
      }
    );
  }
}
