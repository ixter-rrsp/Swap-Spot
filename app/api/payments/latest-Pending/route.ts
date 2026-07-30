import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // PayMongo's success_url is fixed at session-creation time and can't carry
    // the checkout_session_id, so on landing back from checkout we look up the
    // user's most recent payment attempt instead.
    const { data: payment, error } = await supabase
      .from("payments")
      .select("checkout_session_id, status, created_at")
      .eq("user_id", user.id)
      .eq("purpose", "subscription")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching latest pending payment:", error);
      return NextResponse.json(
        { error: "Failed to look up latest payment." },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        { error: "No recent payment found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      checkoutSessionId: payment.checkout_session_id,
      status: payment.status,
    });
  } catch (error: any) {
    console.error("Error in latest-pending route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to look up latest payment." },
      { status: 500 }
    );
  }
}
