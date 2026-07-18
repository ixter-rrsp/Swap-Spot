import { NextResponse } from "next/server";

import { getMyListingsForSwap } from "@/lib/services/ServerListingService";


export async function GET() {
  try {
    const listings =
      await getMyListingsForSwap();

    return NextResponse.json(listings);

  } catch (error) {

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch listings",
      },
      {
        status: 500,
      }
    );

  }
}