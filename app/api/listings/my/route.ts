import { NextResponse } from "next/server";
import { getMyListings, getMyListingsForSwap } from "@/lib/services/ServerListingService";

const PAGE_SIZE = 6;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forSwap = searchParams.get("forSwap") === "1";

    // Swap picker doesn't paginate — return full filtered set as before.
    if (forSwap) {
      const listings = await getMyListingsForSwap();
      return NextResponse.json(listings);
    }

    // Paginated fetch: fetch one extra item beyond the page to know if
    // there are more listings remaining after this slice.
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
    const listings = await getMyListings(offset + PAGE_SIZE + 1);
    const slice = listings.slice(offset, offset + PAGE_SIZE);
    const hasMore = listings.length > offset + PAGE_SIZE;

    return NextResponse.json({ listings: slice, hasMore });
  } catch (error: unknown) {
    console.error("Error fetching my listings:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch user listings." },
      { status: 500 }
    );
  }
}