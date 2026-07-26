import { NextResponse } from "next/server";
import { cancelSwapAgreement } from "@/lib/services/ServerSwapAgreementService";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await cancelSwapAgreement(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("CANCEL SWAP AGREEMENT ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to cancel swap agreement.";
    const status = message === "Unauthorized." ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}