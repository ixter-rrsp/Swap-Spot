import { NextResponse } from "next/server";
import createServiceClient from "@/utils/supabase/service";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const providerKey = "lalamove";
    const eventType = payload?.type || payload?.event || "unknown";
    const referenceOrderId = payload?.data?.orderId ?? payload?.data?.order?.orderId ?? null;
    const providerEventTime = payload?.timestamp ? new Date(payload.timestamp).toISOString() : null;

    const supabase = createServiceClient();

    if (!supabase) {
      return NextResponse.json({ ok: false, error: "Supabase service credentials are not configured." }, { status: 500 });
    }

    const { error } = await supabase
      .from("webhook_events")
      .insert({
        provider_key: providerKey,
        event_type: eventType,
        provider_event_time: providerEventTime,
        payload,
        reference_order_id: referenceOrderId,
      });

    if (error) {
      console.error("Failed to insert webhook_event:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}
