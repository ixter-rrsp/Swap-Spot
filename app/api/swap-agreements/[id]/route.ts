import { NextResponse } from "next/server";
import { getSwapAgreementById } from "@/lib/services/ServerSwapAgreementService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getSwapAgreementById(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET SWAP AGREEMENT ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load swap agreement.";
    const status = message === "Unauthorized." ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}