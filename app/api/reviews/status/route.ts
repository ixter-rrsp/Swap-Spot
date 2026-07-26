import { NextResponse } from "next/server";
import { getAgreementReviewStatus } from "@/lib/services/ServerReviewService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agreementId = searchParams.get("agreementId");

  if (!agreementId) {
    return NextResponse.json(
      { error: "agreementId is required" },
      { status: 400 }
    );
  }

  try {
    const status = await getAgreementReviewStatus(agreementId);
    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Error fetching review status:", error);
    return NextResponse.json(
      { error: "Failed to fetch review status" },
      { status: 500 }
    );
  }
}
