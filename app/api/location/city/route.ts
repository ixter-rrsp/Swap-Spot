import { NextResponse } from "next/server";
import { resolveCityName } from "@/lib/services/landmark";

/**
 * Resolves just the city name for exact coordinates — used when a user
 * updates their own profile location. Deliberately does NOT do the
 * nearby-landmark search or privacy coordinate-masking that listings use
 * (see /api/location/reverse); a user's own location should reflect
 * where they actually are, not a fuzzed approximation.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body ?? {};

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "latitude and longitude (numbers) are required." },
        { status: 400 }
      );
    }

    const city = await resolveCityName(latitude, longitude);

    if (!city) {
      return NextResponse.json(
        { error: "Could not determine your city from that location." },
        { status: 422 }
      );
    }

    return NextResponse.json({ city });
  } catch (error: unknown) {
    console.error("Error in /api/location/city:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to detect city." },
      { status: 500 }
    );
  }
}
