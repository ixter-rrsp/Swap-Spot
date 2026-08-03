import { NextResponse } from "next/server";
import {
  getSavedListingIds,
  saveListing,
} from "@/lib/services/ServerSavedListingService";

// Just the ids, for hydrating heart icons across a page.
export async function GET() {
  try {
    const ids = await getSavedListingIds();
    return NextResponse.json({ listingIds: ids });
  } catch (error) {
    console.error("GET SAVED LISTINGS ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load saved listings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const listingId = body?.listingId;

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "listingId is required." }, { status: 400 });
    }

    await saveListing(listingId);
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("SAVE LISTING ERROR:", error);
    const message = error instanceof Error ? error.message : "Failed to save listing.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
