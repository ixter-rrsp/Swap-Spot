import { NextResponse } from "next/server";
import { markDeliveryPickedUp } from "@/lib/services/ServerDeliveryAgreementService";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ agreementId: string }> }
) {
  try {
    const { agreementId } = await params;
    const result = await markDeliveryPickedUp(agreementId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("MARK PICKED UP ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to mark as picked up.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
