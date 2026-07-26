import { NextResponse } from "next/server";
import { createSwapAgreement } from "@/lib/services/ServerSwapAgreementService";
import { CreateSwapAgreementInput } from "@/lib/types/SwapAgreement";

export async function POST(request: Request) {
  try {
    const body: CreateSwapAgreementInput = await request.json();

    if (!body?.swapRequestId || !body?.conversationId) {
      return NextResponse.json(
        { error: "Swap request ID and conversation ID are required." },
        { status: 400 }
      );
    }

    const result = await createSwapAgreement(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("CREATE SWAP AGREEMENT ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create swap agreement.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}