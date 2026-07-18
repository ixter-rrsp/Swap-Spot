import { NextResponse } from "next/server";

import {
  deleteListing,
  updateListing,
} from "@/lib/services/ServerListingService";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const listing = await updateListing(
      id,
      {
        title: body.title,
        description: body.description,
        city: body.city,
        lookingFor: body.lookingFor,
        swapValue: body.swapValue,
        images: body.images ?? [],
      }
    );

    return NextResponse.json(listing);
  } catch (error) {
    console.error(
      "UPDATE LISTING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update listing.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    await deleteListing(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE LISTING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete listing.",
      },
      {
        status: 500,
      }
    );
  }
}