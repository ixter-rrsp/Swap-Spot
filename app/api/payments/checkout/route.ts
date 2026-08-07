import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ServerPaymentService } from "@/lib/services/ServerPaymentService";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to create a checkout session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      amount,
      purpose,
      referenceId,
      description,
      lineItems,
      metadata,
      successUrl,
      cancelUrl,
      paymentMethodTypes,
      providerName,
    } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    if (!purpose || typeof purpose !== "string") {
      return NextResponse.json(
        { error: "Payment purpose is required." },
        { status: 400 }
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "successUrl and cancelUrl are required." },
        { status: 400 }
      );
    }

    const checkoutResult = await ServerPaymentService.createCheckoutSession({
      userId: user.id,
      amount,
      purpose,
      referenceId,
      description: description || `Payment for ${purpose}`,
      lineItems,
      metadata,
      successUrl,
      cancelUrl,
      paymentMethodTypes,
      providerName,
    });

    return NextResponse.json(checkoutResult, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating payment checkout session:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create payment checkout session." },
      { status: 500 }
    );
  }
}

