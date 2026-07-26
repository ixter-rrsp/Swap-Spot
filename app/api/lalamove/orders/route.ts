import { NextResponse } from "next/server";
import createServiceClient from "@/utils/supabase/service";
import LalamoveService from "@/lib/services/ServerLalamoveService";

async function buildOrderPayload(body: any) {
  const supabase = createServiceClient();
  const agreementId = body?.agreement_id;

  if (!agreementId || !supabase) {
    return body;
  }

  const { data, error } = await supabase
    .from("swap_agreements")
    .select("pickup_address, dropoff_address")
    .eq("id", agreementId)
    .single();

  if (error || !data) {
    return body;
  }

  return {
    ...body,
    pickup_address: body?.pickup_address ?? data.pickup_address,
    dropoff_address: body?.dropoff_address ?? data.dropoff_address,
    pickup: {
      address: body?.pickup_address ?? data.pickup_address,
    },
    dropoff: {
      address: body?.dropoff_address ?? data.dropoff_address,
    },
    agreement_id: agreementId,
    user_id: body?.user_id,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = await buildOrderPayload(body);

    const order = await LalamoveService.placeOrder(payload);

    const supabase = createServiceClient();
    try {
      if (supabase) {
        await supabase.from("delivery_bookings").insert({
          provider_key: "lalamove",
          order_id: order?.id ?? order?.orderId ?? null,
          payload,
          response: order,
          agreement_id: body?.agreement_id ?? null,
          user_id: body?.user_id ?? null,
        });
      }
    } catch (e) {
      console.error("Failed saving delivery_booking:", e);
    }

    return NextResponse.json({ ok: true, order });
  } catch (err) {
    console.error("Place order error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
