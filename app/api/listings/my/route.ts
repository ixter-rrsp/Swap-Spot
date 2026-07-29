import { NextResponse } from "next/server";
import { getMyListingsForSwap } from "@/lib/services/ServerListingService";

export async function GET() {
  try {
    const listings = await getMyListingsForSwap();
    return NextResponse.json(listings);
  } catch (error: any) {
    console.error("Error fetching my listings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user listings." },
      { status: 500 }
    );
  }
}
