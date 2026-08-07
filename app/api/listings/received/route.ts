import { NextResponse } from "next/server";
import { getCompletedAgreements } from "@/lib/services/ServerSwapAgreementService";
import { createClient } from "@/utils/supabase/server";
import { Listing } from "@/lib/types/Listing";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const completedAgreements = await getCompletedAgreements();
    const receivedOffers: Listing[] = completedAgreements.map((ag) => {
      const isRequester = ag.requesterId === user.id;
      const receivedListingInfo = isRequester
        ? ag.requestedListing
        : ag.offeredListing;

      return {
        id: receivedListingInfo.id,
        title: receivedListingInfo.title,
        description: "Received from swap",
        imageUrl: receivedListingInfo.imageUrl,
        city: receivedListingInfo.city || "",
        swapValue: receivedListingInfo.swapValue ?? 0,
        lookingFor: "",
        category:
          (receivedListingInfo.category as Listing["category"]) || "other",
        condition:
          (receivedListingInfo.condition as Listing["condition"]) ||
          "used_good",
        boosted: false,
        images: [],
        owner: {
          id: ag.otherUser.id,
          username: ag.otherUser.username,
          fullName: ag.otherUser.fullName,
          avatarUrl: ag.otherUser.avatarUrl || null,
          rating: 0,
          badge: "Member",
          city: "",
          isVerified: false,
        },
      } as Listing;
    });

    return NextResponse.json(receivedOffers);
  } catch (error: unknown) {
    console.error("Error fetching received offers:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch received offers" },
      { status: 500 }
    );
  }
}
