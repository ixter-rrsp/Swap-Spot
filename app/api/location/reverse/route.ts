import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { latitude, longitude } =
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

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          "User-Agent":
            "SwapSpot/1.0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to retrieve location."
      );
    }

    const data = await response.json();

    const address = data.address ?? {};

    const city =
      address.city ??
      address.town ??
      address.municipality ??
      address.village ??
      address.county ??
      "";

    return NextResponse.json({
      city,
    });
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