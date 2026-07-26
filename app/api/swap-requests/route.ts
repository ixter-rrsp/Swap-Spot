import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

import {
 createSwapRequest
} from "@/lib/services/ServerSwapRequestService";


export async function POST(
  request: Request
) {

  const supabase =
    await createClient();


  const {
    data:{
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    if (!body?.offeredListingId || !body?.requestedListingId) {
      return NextResponse.json(
        { error: "Both listing IDs are required." },
        { status: 400 }
      );
    }

    const result = await createSwapRequest(
      body.offeredListingId,
      body.requestedListingId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to create swap request.";
    const status = message === "Unauthorized." || message === "You must be logged in." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }

}