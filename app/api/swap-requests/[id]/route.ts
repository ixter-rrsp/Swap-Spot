import { NextResponse } from "next/server";
import { getSwapRequestById } from "@/lib/services/ServerSwapRequestDetail";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await getSwapRequestById(id);
    return NextResponse.json(detail);
  } catch (error) {
    console.error("GET SWAP REQUEST ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load swap request.";
    const status = message === "Unauthorized." ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}