import { NextResponse } from "next/server";
import createServiceClient from "@/utils/supabase/service";

function mapStatus(providerStatus: string | null | undefined) {
  if (!providerStatus) return "unknown";
  const s = providerStatus.toString().toUpperCase();
  if (s.includes("DELIVERED") || s.includes("COMPLETED")) return "delivered";
  if (s.includes("PICKED") || s.includes("PICKUP")) return "picked_up";
  if (s.includes("IN_TRANSIT") || s.includes("IN-TRANSIT") || s.includes("ON_GOING")) return "in_transit";
  if (s.includes("CANCEL")) return "cancelled";
  return s.toLowerCase();
}

export async function POST(req: Request) {
  const supabase = createServiceClient();

  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase service credentials are not configured." }, { status: 500 });
  }

  try {
    const { data: events, error: fetchError } = await supabase
      .from("webhook_events")
      .select("*")
      .eq("provider_key", "lalamove")
      .is("processed", false)
      .order("created_at", { ascending: true })
      .limit(100);

    if (fetchError) {
      console.error("Failed to fetch webhook_events:", fetchError);
      return NextResponse.json({ ok: false, error: fetchError.message }, { status: 500 });
    }

    let processedCount = 0;

    for (const ev of events ?? []) {
      try {
        const payload = ev.payload ?? {};
        const orderId = ev.reference_order_id ?? payload?.data?.orderId ?? payload?.data?.order?.orderId ?? null;
        const providerStatus = payload?.data?.status ?? payload?.event ?? null;
        const normalized = mapStatus(providerStatus);

        if (!orderId) {
          await supabase
            .from("webhook_events")
            .update({ processed: true, processed_at: new Date().toISOString(), processed_result: "no_order_id" })
            .eq("id", ev.id);
          processedCount++;
          continue;
        }

        const { data: bookings } = await supabase
          .from("delivery_bookings")
          .select("*")
          .eq("order_id", orderId);

        if (!bookings || bookings.length === 0) {
          await supabase
            .from("webhook_events")
            .update({ processed: true, processed_at: new Date().toISOString(), processed_result: "no_matching_booking" })
            .eq("id", ev.id);
          processedCount++;
          continue;
        }

        for (const booking of bookings) {
          try {
            await supabase
              .from("delivery_bookings")
              .update({
                provider_event_time: payload?.timestamp ?? new Date().toISOString(),
                status: providerStatus ?? ev.event ?? null,
                normalized_status: normalized,
                response: payload,
                updated_at: new Date().toISOString(),
              })
              .eq("id", booking.id);

            // Create notifications for agreement participants (best-effort)
            if (booking.agreement_id) {
              const { data: agreement } = await supabase
                .from("swap_agreements")
                .select("requester_id, receiver_id, conversation_id")
                .eq("id", booking.agreement_id)
                .maybeSingle();

              const title = "Delivery update";
              const message = `Delivery ${normalized} for agreement ${booking.agreement_id}`;

              const recipients = [agreement?.requester_id, agreement?.receiver_id].filter(Boolean) as string[];
              for (const recipientId of recipients) {
                await supabase.from("notifications").insert({
                  user_id: recipientId,
                  type: "agreement_updated",
                  title,
                  message,
                  reference_id: booking.agreement_id,
                });
              }

              if (agreement?.conversation_id) {
                const senderId = agreement.requester_id ?? agreement.receiver_id;
                if (senderId) {
                  await supabase.from("messages").insert({
                    conversation_id: agreement.conversation_id,
                    sender_id: senderId,
                    message,
                    message_type: "system",
                    swap_agreement_id: booking.agreement_id,
                  });
                }
              }
            }
          } catch (updateError) {
            console.error("Failed to update booking:", updateError);
          }
        }

        await supabase
          .from("webhook_events")
          .update({ processed: true, processed_at: new Date().toISOString(), processed_result: "ok" })
          .eq("id", ev.id);

        processedCount++;
      } catch (inner) {
        console.error("Error processing webhook event:", inner);
      }
    }

    return NextResponse.json({ ok: true, processed: processedCount });
  } catch (err) {
    console.error("Reconcile worker failed:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
