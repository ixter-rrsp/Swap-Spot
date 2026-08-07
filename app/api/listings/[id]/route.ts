import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getListingById,
  updateListing,
  deleteListing,
} from "@/lib/services/ServerListingService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await getListingById(id);
    return NextResponse.json(listing, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/listings/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Listing not found." },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const updated = await updateListing(id, {
      title: body.title,
      description: body.description,
      city: body.city ?? "",
      lookingFor: body.lookingFor,
      category: body.category,
      condition: body.condition,
      swapValue: body.swapValue,
      showOnMap: body.showOnMap ?? true,
      images: body.images ?? [],
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error("PATCH /api/listings/[id] error:", error);

    const isForbidden = (error as Error).message?.includes("not allowed");
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update listing." },
      { status: isForbidden ? 403 : 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    await deleteListing(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("DELETE /api/listings/[id] error:", error);

    const isForbidden = (error as Error).message?.includes("not allowed");
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete listing." },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
