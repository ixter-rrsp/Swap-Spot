import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
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
    // user's most recent payment attempt instead. Optionally scoped to a
    // specific purpose (e.g. "subscription" or "listing_boost") and/or
    // reference id so unrelated in-flight payments don't get picked up by
    // mistake.
    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get("purpose");
    const referenceId = searchParams.get("referenceId");

    let query = supabase
      .from("payments")
      .select("checkout_session_id, status, purpose, reference_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (purpose) {
      query = query.eq("purpose", purpose);
    }

    if (referenceId) {
      query = query.eq("reference_id", referenceId);
    }

    const { data: payment, error } = await query.maybeSingle();

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
      purpose: payment.purpose,
      referenceId: payment.reference_id,
    });
  } catch (error: unknown) {
    console.error("Error in latest-pending route:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to look up latest payment." },
      { status: 500 }
    );
  }
}

