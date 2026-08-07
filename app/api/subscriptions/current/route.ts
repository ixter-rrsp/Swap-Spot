import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ServerSubscriptionService } from "@/lib/services/ServerSubscriptionService";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const subscription = await ServerSubscriptionService.getActiveSubscription(user.id);
    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching current subscription:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch active subscription." },
      { status: 500 }
    );
  }
}

