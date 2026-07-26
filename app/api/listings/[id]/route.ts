import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
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
    console.log("[PATCH /api/listings] handler start");
    const { id } = await params;

    const body = await request.json();
    console.log("[PATCH /api/listings] body", body);

    const listing = await updateListing(
      id,
      {
        title: body.title,
        description: body.description,
        city: body.city,
        lookingFor: body.lookingFor,
        swapValue: body.swapValue,
        showOnMap: body.showOnMap ?? true,
        images: body.images ?? [],
      }
    );

    console.log("[PATCH /api/listings] response", listing);

    return NextResponse.json(listing);
  } catch (error) {
    console.error(
      "UPDATE LISTING ERROR:",
      error
    );

    const message = error instanceof Error ? error.message : "Failed to update listing.";
    const status = message.toLowerCase().includes("not authenticated") ? 401 : 500;

    return NextResponse.json(
      { error: message },
      { status }
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

    const message = error instanceof Error ? error.message : "Failed to delete listing.";
    const status = message.toLowerCase().includes("not authenticated") ? 401 : 500;

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}