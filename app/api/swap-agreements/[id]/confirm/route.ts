import { NextResponse } from "next/server";
import { confirmSwapAgreement } from "@/lib/services/ServerSwapAgreementService";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await confirmSwapAgreement(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("CONFIRM SWAP AGREEMENT ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to confirm swap agreement.";
    const status = message === "Unauthorized." ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}