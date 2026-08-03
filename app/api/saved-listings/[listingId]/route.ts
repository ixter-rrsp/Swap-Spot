import { NextResponse } from "next/server";
import { unsaveListing } from "@/lib/services/ServerSavedListingService";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    await unsaveListing(listingId);
    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error("UNSAVE LISTING ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to unsave listing.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
