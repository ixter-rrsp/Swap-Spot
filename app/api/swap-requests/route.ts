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


  console.log(
    "API USER:",
    user
  );


  try {

    const body =
      await request.json();


    const result =
      await createSwapRequest(
        body.offeredListingId,
        body.requestedListingId
      );


    return NextResponse.json(
      result
    );


  } catch(error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed",
      },
      {
        status:500,
      }
    );

  }

}