import { NextResponse } from "next/server";
import { submitDeliveryInfo } from "@/lib/services/ServerDeliveryAgreementService";
import { deliveryInfoSchema } from "@/lib/validations/DeliveryAgreementSchema";

// NOTE: agreementId in the route path is the delivery_agreements row id
// (returned as `id` on the GET .../delivery-agreements/[swapAgreementId]
// response), not the swap agreement id.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ agreementId: string }> }
) {
  try {
    const { agreementId } = await params;
    const body = await request.json();
    const parsed = deliveryInfoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid delivery info." },
        { status: 400 }
      );
    }

    const result = await submitDeliveryInfo(agreementId, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("SUBMIT DELIVERY INFO ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to submit delivery info.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
