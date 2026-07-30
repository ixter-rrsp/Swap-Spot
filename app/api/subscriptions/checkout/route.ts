import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ServerPaymentService } from "@/lib/services/ServerPaymentService";
import { SUBSCRIPTION_PLANS, PlanId } from "@/lib/subscriptions/plans";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to subscribe." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId } = body as { planId: PlanId };

    if (!planId || !SUBSCRIPTION_PLANS[planId]) {
      return NextResponse.json(
        { error: "Invalid or unsupported subscription plan." },
        { status: 400 }
      );
    }

    const targetPlan = SUBSCRIPTION_PLANS[planId];
    if (targetPlan.price <= 0) {
      return NextResponse.json(
        { error: "The Free plan is default and does not require payment." },
        { status: 400 }
      );
    }

    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const cleanOrigin = origin.replace(/\/$/, "");

    const successUrl = `${cleanOrigin}/subscriptions?status=success`;
    const cancelUrl = `${cleanOrigin}/subscriptions?status=cancelled`;

    const checkoutResult = await ServerPaymentService.createCheckoutSession({
      userId: user.id,
      amount: targetPlan.price,
      currency: "PHP",
      purpose: "subscription",
      description: `SwapSpot ${targetPlan.name} Subscription Plan`,
      lineItems: [
        {
          name: `SwapSpot ${targetPlan.name} Membership`,
          amount: targetPlan.price,
          quantity: 1,
          currency: "PHP",
          description: `${targetPlan.durationMonths}-Month access to ${targetPlan.name} tier benefits.`,
        },
      ],
      metadata: {
        plan_id: planId,
      },
      successUrl,
      cancelUrl,
    });

    return NextResponse.json(checkoutResult, { status: 201 });
  } catch (error: any) {
    console.error("Error creating subscription checkout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription checkout session." },
      { status: 500 }
    );
  }
}
