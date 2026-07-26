import { NextResponse } from "next/server";
import { resolveListingLandmark } from "@/lib/services/landmark";

export async function POST(request: Request) {
  try {
    const { latitude, longitude, fallbackCity } =
      await request.json();

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return NextResponse.json(
        {
          error: "Invalid coordinates.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await resolveListingLandmark(latitude, longitude, fallbackCity);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to determine city.",
      },
      {
        status: 500,
      }
    );
  }
}