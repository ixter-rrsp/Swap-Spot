import { NextResponse } from "next/server";
import { resolveListingLandmark } from "@/lib/services/landmark";

/**
 * Resolves a masked/nearby landmark (+ coordinates) for a listing, given
 * the owner's exact profile coordinates. This intentionally fuzzes the
 * location for privacy — see resolveCityName / /api/location/city for the
 * unmasked version used for a user's own profile location.
 *
 * This route exists so that resolveListingLandmark() can run its full
 * Nominatim-based resolution server-side (avoiding CORS issues and keeping
 * the User-Agent header) when called from the browser during listing
 * creation/edit. The client-side branch of resolveListingLandmark() calls
 * this route; this handler just runs the same function again, which -
 * since `window` is undefined here - executes the direct server logic.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, fallbackCity } = body ?? {};

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "latitude and longitude (numbers) are required." },
        { status: 400 }
      );
    }

    const result = await resolveListingLandmark(
      latitude,
      longitude,
      typeof fallbackCity === "string" ? fallbackCity : undefined
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/location/reverse:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resolve location." },
      { status: 500 }
    );
  }
}