import { NextResponse } from "next/server";
import { getListingsByOwner } from "@/lib/services/ServerListingService";

const PAGE_SIZE = 6;

// Public listing info for a given owner.
// Supports paginated fetching via ?offset=N for "View More".
export async function GET(
  request: Request,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  try {
    const { ownerId } = await params;
    const { searchParams } = new URL(request.url);
    const offsetParam = searchParams.get("offset");

    // If no offset param → return full listing set (backward-compatible)
    if (offsetParam === null) {
      const listings = await getListingsByOwner(ownerId);
      return NextResponse.json(listings);
    }

    // Paginated: fetch offset + PAGE_SIZE + 1 to determine hasMore
    const offset = Math.max(0, parseInt(offsetParam, 10));
    const listings = await getListingsByOwner(ownerId, offset + PAGE_SIZE + 1);
    const slice = listings.slice(offset, offset + PAGE_SIZE);
    const hasMore = listings.length > offset + PAGE_SIZE;

    return NextResponse.json({ listings: slice, hasMore });
  } catch (error) {
    console.error("GET LISTINGS BY OWNER ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load listings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
