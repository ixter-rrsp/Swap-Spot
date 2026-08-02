import { NextResponse } from "next/server";
import { getDeliveryAgreementBySwapAgreementId } from "@/lib/services/ServerDeliveryAgreementService";

// agreementId here is the swap_agreement id (the id the client already
// has from /agreements/[id]) — not the delivery_agreements row id.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ agreementId: string }> }
) {
  try {
    const { agreementId } = await params;
    const result = await getDeliveryAgreementBySwapAgreementId(agreementId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET DELIVERY AGREEMENT ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load delivery agreement.";
    const status = message === "Unauthorized." ? 401 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}
