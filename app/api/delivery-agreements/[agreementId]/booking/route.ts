import { NextResponse } from "next/server";
import { submitCourierBooking } from "@/lib/services/ServerDeliveryAgreementService";
import { courierBookingSchema } from "@/lib/validations/DeliveryAgreementSchema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ agreementId: string }> }
) {
  try {
    const { agreementId } = await params;
    const body = await request.json();
    const parsed = courierBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid booking details." },
        { status: 400 }
      );
    }

    const result = await submitCourierBooking(agreementId, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("SUBMIT COURIER BOOKING ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to submit courier booking.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
