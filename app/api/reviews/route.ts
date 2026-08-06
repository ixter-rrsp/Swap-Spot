import { NextResponse } from "next/server";
import { getRecentReviews } from "@/lib/services/ServerReviewService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  try {
    const reviews = await getRecentReviews(userId, 5);
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("Error fetching recent reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
