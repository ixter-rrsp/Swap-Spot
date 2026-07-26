import { NextResponse } from "next/server";
import { completeSwapAgreement } from "@/lib/services/ServerSwapAgreementService";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await completeSwapAgreement(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("COMPLETE SWAP AGREEMENT ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to complete swap agreement.";
    const status = message === "Unauthorized." ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}