import { NextResponse } from "next/server";
import createServiceClient from "@/utils/supabase/service";
import LalamoveService from "@/lib/services/ServerLalamoveService";

async function buildQuotationPayload(body: any) {
  const supabase = createServiceClient();
  const agreementId = body?.agreement_id;

  if (!agreementId || !supabase) {
    return body;
  }

  const { data, error } = await supabase
    .from("swap_agreements")
    .select("pickup_address, dropoff_address, requester_id, receiver_id")
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
    user_id: body?.user_id,
    agreement_id: agreementId,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = await buildQuotationPayload(body);

    const quote = await LalamoveService.createQuotation(payload);

    const supabase = createServiceClient();
    // best-effort persistence — if DB insert fails, we still return the quote
    try {
      if (supabase) {
        await supabase.from("provider_quotations").insert({
          agreement_id: body?.agreement_id ?? null,
          user_id: body?.user_id ?? null,
          provider_key: "lalamove",
          provider_quotation_id: quote?.id ?? quote?.quotationId ?? null,
          payload,
          response: quote,
        });
      }
    } catch (e) {
      console.error("Failed saving provider_quotation:", e);
    }

    return NextResponse.json({ ok: true, quotation: quote });
  } catch (err) {
    console.error("Create quotation error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
