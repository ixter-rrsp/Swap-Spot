import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { paymentId } = body as { paymentId: string };

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required." },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    if (!serviceClient) {
      return NextResponse.json(
        { error: "Service unavailable." },
        { status: 500 }
      );
    }

    const { data: payment, error } = await serviceClient
      .from("payments")
      .select("id, user_id, purpose, status, metadata")
      .eq("id", paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: "Payment not found." },
        { status: 404 }
      );
    }

    if (payment.user_id !== user.id) {
      return NextResponse.json(
        { error: "This payment does not belong to you." },
        { status: 403 }
      );
    }

    if (payment.purpose !== "post_fee") {
      return NextResponse.json(
        { error: "This payment is not an overage listing fee." },
        { status: 400 }
      );
    }

    if (payment.status !== "paid") {
      return NextResponse.json(
        { error: "This payment has not been completed yet." },
        { status: 400 }
      );
    }

    if (payment.metadata?.consumed === true) {
      return NextResponse.json(
        { error: "This payment has already been used to post a listing." },
        { status: 400 }
      );
    }

    const { error: updateError } = await serviceClient
      .from("payments")
      .update({
        metadata: { ...payment.metadata, consumed: true },
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to consume payment." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error consuming overage payment:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to consume overage payment." },
      { status: 500 }
    );
  }
}
