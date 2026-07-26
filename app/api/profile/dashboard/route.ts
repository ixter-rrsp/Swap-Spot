import { NextResponse } from "next/server";
import { getProfileDashboard } from "@/lib/services/ProfileService";

export async function GET() {
  try {
    const data = await getProfileDashboard();

    if (!data) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ counts: data.counts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Accept an optional body for future use (e.g., mark-as-read), but currently just return refreshed counts
    const data = await getProfileDashboard();

    if (!data) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ counts: data.counts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
