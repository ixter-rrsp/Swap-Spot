import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ServerPaymentService } from "@/lib/services/ServerPaymentService";
import { LISTING_OVERAGE_PRICE } from "@/lib/pricing/boost";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to post a listing." },
        { status: 401 }
      );
    }

    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const cleanOrigin = origin.replace(/\/$/, "");

    const successUrl = `${cleanOrigin}/post?overage_status=success`;
    const cancelUrl = `${cleanOrigin}/post?overage_status=cancelled`;

    // No referenceId yet - the listing doesn't exist until after payment.
    // ListingService.createListing looks up this payment by (user_id, purpose,
    // status=paid, consumed=false) and marks it consumed once the listing is created.
    const checkoutResult = await ServerPaymentService.createCheckoutSession({
      userId: user.id,
      amount: LISTING_OVERAGE_PRICE,
      currency: "PHP",
      purpose: "post_fee",
      description: "SwapSpot - Extra listing post (Free plan)",
      lineItems: [
        {
          name: "Extra listing post",
          amount: LISTING_OVERAGE_PRICE,
          quantity: 1,
          currency: "PHP",
          description:
            "Lets you post one listing beyond your Free plan's active listing limit.",
        },
      ],
      metadata: {
        consumed: false,
      },
      successUrl,
      cancelUrl,
    });

    return NextResponse.json(checkoutResult, { status: 201 });
  } catch (error: any) {
    console.error("Error creating listing overage checkout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create overage checkout session." },
      { status: 500 }
    );
  }
}
