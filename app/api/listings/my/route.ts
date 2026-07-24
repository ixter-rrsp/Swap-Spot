import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getMyListingsForSwap } from "@/lib/services/ServerListingService";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

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