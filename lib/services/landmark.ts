const LANDMARK_KEYS = [
  "mall",
  "shopping_centre",
  "university",
  "college",
  "school",
  "hospital",
  "marketplace",
  "park",
  "plaza",
  "transport_station",
  "tourism",
  "attraction",
  "suburb",
  "neighbourhood",
  "village",
  "town",
] as const;

const FALLBACK_KEYS = [
  "neighbourhood",
  "suburb",
  "quarter",
  "city_district",
  "district",
  "village",
  "barangay",
  "city",
] as const;

const IGNORED_KEYS = new Set([
  "house",
  "building",
  "residential",
  "road",
  "street",
  "unit",
  "apartment",
]);

const SEARCH_TERMS = [
  "mall",
  "shopping center",
  "university",
  "college",
  "school",
  "hospital",
  "market",
  "park",
  "plaza",
  "station",
  "tourist spot",
  "attraction",
];

const CITY_COORDINATE_FALLBACKS: Record<string, { lat: number; lon: number }> = {
  manila: { lat: 14.5995, lon: 120.9842 },
  "quezon city": { lat: 14.6760, lon: 121.0437 },
  makati: { lat: 14.5547, lon: 121.0244 },
  taguig: { lat: 14.5176, lon: 121.0497 },
  pasig: { lat: 14.5764, lon: 121.0851 },
  mandaluyong: { lat: 14.5794, lon: 121.0359 },
  caloocan: { lat: 14.6578, lon: 120.9832 },
  pasay: { lat: 14.5378, lon: 121.0014 },
  muntinlupa: { lat: 14.3885, lon: 121.0419 },
  paranaque: { lat: 14.4793, lon: 121.0198 },
  malabon: { lat: 14.6628, lon: 120.9598 },
  valenzuela: { lat: 14.6987, lon: 120.9833 },
  marikina: { lat: 14.6507, lon: 121.1021 },
  "san juan": { lat: 14.6037, lon: 121.0351 },
  antipolo: { lat: 14.5852, lon: 121.1763 },
  bacoor: { lat: 14.4574, lon: 120.9422 },
  cebu: { lat: 10.3157, lon: 123.8854 },
  "cebu city": { lat: 10.3157, lon: 123.8854 },
  davao: { lat: 7.1907, lon: 125.4553 },
  "davao city": { lat: 7.1907, lon: 125.4553 },
  iloilo: { lat: 10.7202, lon: 122.5621 },
  "iloilo city": { lat: 10.7202, lon: 122.5621 },
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceInKm(latitude: number, longitude: number, otherLatitude: number, otherLongitude: number) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(otherLatitude - latitude);
  const deltaLongitude = toRadians(otherLongitude - longitude);
  const startLatitude = toRadians(latitude);
  const endLatitude = toRadians(otherLatitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * centralAngle;
}

function buildMaskedCoordinate(latitude: number, longitude: number) {
  return {
    lat: latitude + 0.003,
    lon: longitude + 0.003,
  };
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function directValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCoordinate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeCityKey(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getFallbackCityCoordinates(city: string | null | undefined) {
  const normalized = normalizeCityKey(city);
  if (!normalized) {
    return null;
  }

  return CITY_COORDINATE_FALLBACKS[normalized] ?? null;
}

function pickLandmarkName(
  address: Record<string, unknown>,
  data: Record<string, unknown>
): string | null {
  for (const key of LANDMARK_KEYS) {
    const value = directValue(address[key]);
    if (value) {
      return toTitleCase(value);
    }
  }

  const type = typeof data.type === "string" ? data.type.toLowerCase() : "";
  const className = typeof data.class === "string" ? data.class.toLowerCase() : "";

  if (LANDMARK_KEYS.includes(type as (typeof LANDMARK_KEYS)[number])) {
    const name = directValue(data.name);
    if (name) {
      return toTitleCase(name);
    }
  }

  if (LANDMARK_KEYS.includes(className as (typeof LANDMARK_KEYS)[number])) {
    const name = directValue(data.name);
    if (name) {
      return toTitleCase(name);
    }
  }

  for (const [key, value] of Object.entries(address)) {
    if (IGNORED_KEYS.has(key)) {
      continue;
    }

    const trimmed = directValue(value);
    if (!trimmed) {
      continue;
    }

    if (FALLBACK_KEYS.includes(key as (typeof FALLBACK_KEYS)[number])) {
      return toTitleCase(trimmed);
    }
  }

  return null;
}

async function searchNearbyLandmarks(latitude: number, longitude: number) {
  const padding = 0.02;
  const minLat = latitude - padding;
  const maxLat = latitude + padding;
  const minLon = longitude - padding;
  const maxLon = longitude + padding;

  const viewbox = `${minLon},${maxLat},${maxLon},${minLat}`;

  for (const term of SEARCH_TERMS) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&addressdetails=1&accept-language=en&lat=${latitude}&lon=${longitude}&zoom=16&bounded=1&viewbox=${viewbox}&q=${encodeURIComponent(term)}`,
        {
          headers: {
            "User-Agent": "SwapSpot/1.0",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        continue;
      }

      const results = (await response.json()) as Array<Record<string, unknown>>;

      const firstResult = results.find((result) => {
        const address = (result.address ?? {}) as Record<string, unknown>;
        return Boolean(pickLandmarkName(address, result));
      });

      if (firstResult) {
        return firstResult;
      }
    } catch (error) {
      console.warn("Failed to search nearby landmark", term, error);
    }
  }

  return null;
}

async function searchLocalityCoordinates(query: string | null | undefined) {
  if (!query) {
    return null;
  }

  const fallbackCoordinates = getFallbackCityCoordinates(query);
  if (fallbackCoordinates) {
    return fallbackCoordinates;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&accept-language=en&q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "SwapSpot/1.0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const results = (await response.json()) as Array<Record<string, unknown>>;
    const firstResult = results[0];
    const lat = normalizeCoordinate(firstResult?.lat);
    const lon = normalizeCoordinate(firstResult?.lon);

    if (lat != null && lon != null) {
      return { lat, lon };
    }
  } catch (error) {
    console.warn("Failed to geocode locality", query, error);
  }

  return null;
}

export async function resolveListingLandmark(
  latitude: number,
  longitude: number,
  fallbackCity?: string
) {
  const fallbackCityName = fallbackCity || "";
  const fallbackCoordinates = getFallbackCityCoordinates(fallbackCityName);

  console.log("[landmark] resolving", { latitude, longitude, fallbackCity });

  if (typeof window !== "undefined") {
    const response = await fetch("/api/location/reverse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude, longitude, fallbackCity }),
    });

    if (!response.ok) {
      return {
        city: fallbackCityName,
        landmark: fallbackCityName || null,
        landmarkLatitude: fallbackCoordinates?.lat ?? null,
        landmarkLongitude: fallbackCoordinates?.lon ?? null,
      };
    }

    const result = await response.json();
    console.log("[landmark] response", result);

    return {
      city: typeof result.city === "string" ? result.city : "",
      landmark: typeof result.landmark === "string" ? result.landmark : null,
      landmarkLatitude:
        typeof result.landmarkLatitude === "number"
          ? result.landmarkLatitude
          : null,
      landmarkLongitude:
        typeof result.landmarkLongitude === "number"
          ? result.landmarkLongitude
          : null,
    };
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
    {
      headers: {
        "User-Agent": "SwapSpot/1.0",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    console.log("[landmark] reverse geocode failed", { status: response.status, fallbackCityName });
    const fallbackLandmark = fallbackCityName || "City";
    return {
      city: fallbackCityName || "",
      landmark: fallbackLandmark,
      landmarkLatitude: fallbackCoordinates?.lat ?? null,
      landmarkLongitude: fallbackCoordinates?.lon ?? null,
    };
  }

  const data = (await response.json()) as Record<string, unknown>;
  console.log("[landmark] reverse payload", data);
  const address = (data.address ?? {}) as Record<string, unknown>;

  const city =
    directValue(address.city) ??
    directValue(address.town) ??
    directValue(address.municipality) ??
    directValue(address.village) ??
    directValue(address.county) ??
    fallbackCityName ??
    "";

  const localityName =
    directValue(address.neighbourhood) ??
    directValue(address.suburb) ??
    directValue(address.quarter) ??
    directValue(address.city_district) ??
    directValue(address.district) ??
    directValue(address.village) ??
    directValue(address.barangay) ??
    (city || null);

  const fallbackLandmark = pickLandmarkName(address, data);
  let landmark = fallbackLandmark;
  let landmarkLatitude: number | null = null;
  let landmarkLongitude: number | null = null;

  const nearbyLandmark = await searchNearbyLandmarks(latitude, longitude);
  if (nearbyLandmark) {
    const nearbyAddress = (nearbyLandmark.address ?? {}) as Record<string, unknown>;
    const nearbyName = pickLandmarkName(nearbyAddress, nearbyLandmark);
    const nearbyLatitude = normalizeCoordinate(nearbyLandmark.lat);
    const nearbyLongitude = normalizeCoordinate(nearbyLandmark.lon);

    if (nearbyName) {
      landmark = nearbyName;
    }

    if (nearbyLatitude != null && nearbyLongitude != null) {
      landmarkLatitude = nearbyLatitude;
      landmarkLongitude = nearbyLongitude;
    }
  }

  if (!landmark) {
    landmark =
      directValue(address.neighbourhood) ??
      directValue(address.suburb) ??
      directValue(address.quarter) ??
      directValue(address.city_district) ??
      directValue(address.district) ??
      directValue(address.village) ??
      directValue(address.barangay) ??
      directValue(data.name) ??
      directValue(data.display_name) ??
      (city || null);
  }

  if (landmarkLatitude == null || landmarkLongitude == null) {
    const localityCoordinates = await searchLocalityCoordinates(localityName);
    if (localityCoordinates) {
      const distanceToLocality = getDistanceInKm(
        latitude,
        longitude,
        localityCoordinates.lat,
        localityCoordinates.lon
      );

      if (distanceToLocality <= 15) {
        landmarkLatitude = localityCoordinates.lat;
        landmarkLongitude = localityCoordinates.lon;
      }
    }
  }

  if ((landmarkLatitude == null || landmarkLongitude == null) && city) {
    const cityCoordinates = await searchLocalityCoordinates(city);
    if (cityCoordinates) {
      const distanceToCity = getDistanceInKm(latitude, longitude, cityCoordinates.lat, cityCoordinates.lon);
      if (distanceToCity <= 15) {
        landmarkLatitude = cityCoordinates.lat;
        landmarkLongitude = cityCoordinates.lon;
      }
    }
  }

  if (landmarkLatitude == null || landmarkLongitude == null) {
    const maskedCoordinate = buildMaskedCoordinate(latitude, longitude);
    landmarkLatitude = maskedCoordinate.lat;
    landmarkLongitude = maskedCoordinate.lon;
  }

  console.log("[landmark] resolved", {
    city,
    landmark: landmark ? landmark.trim() : null,
    landmarkLatitude,
    landmarkLongitude,
  });

  return {
    city,
    landmark: landmark ? landmark.trim() : null,
    landmarkLatitude,
    landmarkLongitude,
  };
}
