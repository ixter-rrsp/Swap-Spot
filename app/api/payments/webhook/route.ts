import { NextResponse } from "next/server";
import { ServerPaymentService } from "@/lib/services/ServerPaymentService";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });

    const result = await ServerPaymentService.handleWebhook(
      rawBody,
      headersObj,
      "paymongo"
    );

    return NextResponse.json(
      { received: true, result },
      { status: result.status === "failed" ? 400 : 200 }
    );
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handling failed." },
      { status: 500 }
    );
  }
}
