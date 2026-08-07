import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ServerPaymentService } from "@/lib/services/ServerPaymentService";
import { getBoostOption } from "@/lib/pricing/boost";
import { getAppOrigin } from "@/lib/utils/getAppOrigin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to boost a listing." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { durationDays } = body as { durationDays: number };

    const boostOption = getBoostOption(durationDays);
    if (!boostOption) {
      return NextResponse.json(
        { error: "Invalid boost duration. Choose 3 or 7 days." },
        { status: 400 }
      );
    }

    // Confirm the listing exists and belongs to this user
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, owner_id, title, traded, locked_at")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 }
      );
    }

    if (listing.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You can only boost your own listings." },
        { status: 403 }
      );
    }

    if (listing.traded) {
      return NextResponse.json(
        { error: "Traded listings cannot be boosted." },
        { status: 400 }
      );
    }

    if (listing.locked_at) {
      return NextResponse.json(
        { error: "This listing is involved in an accepted swap and can't be boosted right now." },
        { status: 400 }
      );
    }

    const cleanOrigin = getAppOrigin(request);

    const successUrl = `${cleanOrigin}/Listing/${listingId}?boost_status=success`;
    const cancelUrl = `${cleanOrigin}/Listing/${listingId}?boost_status=cancelled`;

    const checkoutResult = await ServerPaymentService.createCheckoutSession({
      userId: user.id,
      amount: boostOption.price,
      currency: "PHP",
      purpose: "listing_boost",
      referenceId: listingId,
      description: `SwapSpot ${boostOption.label} for "${listing.title}"`,
      lineItems: [
        {
          name: `${boostOption.label} — ${listing.title}`,
          amount: boostOption.price,
          quantity: 1,
          currency: "PHP",
          description: `Keeps this listing in the Boosted section for ${boostOption.durationDays} days.`,
        },
      ],
      metadata: {
        listing_id: listingId,
        duration_days: boostOption.durationDays,
      },
      successUrl,
      cancelUrl,
    });

    return NextResponse.json(checkoutResult, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating listing boost checkout:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create boost checkout session." },
      { status: 500 }
    );
  }
}