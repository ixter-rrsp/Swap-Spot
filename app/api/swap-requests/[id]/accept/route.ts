import { NextResponse } from "next/server";

import {
  acceptSwapRequest,
} from "@/lib/services/ServerSwapRequestService";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {

  try {

    const { id } = await params;

    await acceptSwapRequest(id);

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );

  }

}