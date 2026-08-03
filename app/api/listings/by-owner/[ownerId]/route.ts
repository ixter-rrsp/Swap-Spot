import { NextResponse } from "next/server";
import { getListingsByOwner } from "@/lib/services/ServerListingService";

// Public listing info for a given owner — used to populate "which
// listing are you messaging about" pickers (e.g. from a profile page).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  try {
    const { ownerId } = await params;
    const listings = await getListingsByOwner(ownerId);
    return NextResponse.json(listings);
  } catch (error) {
    console.error("GET LISTINGS BY OWNER ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load listings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
