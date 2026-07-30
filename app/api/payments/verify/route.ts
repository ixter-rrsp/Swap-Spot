import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ServerPaymentService } from "@/lib/services/ServerPaymentService";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const checkoutSessionId = searchParams.get("checkout_session_id");

    if (!checkoutSessionId) {
      return NextResponse.json(
        { error: "Missing required checkout_session_id parameter." },
        { status: 400 }
      );
    }

    const verificationResult = await ServerPaymentService.verifyPayment(
      checkoutSessionId,
      user.id
    );

    return NextResponse.json(verificationResult, { status: 200 });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
