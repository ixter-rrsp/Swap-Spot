import { createClient } from "@/utils/supabase/server";
import { Listing } from "@/lib/types/Listing";
import { resolveListingLandmark } from "./landmark";

function getDistanceInKm(latitude: number, longitude: number, otherLatitude: number, otherLongitude: number) {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
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

type ListingWithRelations = {
  id: string;
  title: string;
  description: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  nearby_landmark: string;
  landmark_latitude: number | null;
  landmark_longitude: number | null;
  show_on_map: boolean | null;
  swap_value: number;
  category: string;
  condition: string;
  created_at: string;
  boosted: boolean;
  boost_expires_at: string | null;
  listing_images: Array<{
    id: string;
    image_url: string;
    sort_order: number;
  }> | null;
  profiles: Array<{
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    rating: number;
    badge: string;
    city: string;
  }> | null;
};

export async function getMapVisibleListings(): Promise<Listing[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      city,
      latitude,
      longitude,
      nearby_landmark,
      landmark_latitude,
      landmark_longitude,
      show_on_map,
      swap_value,
      category,
      condition,
      created_at,
      boosted,
      boost_expires_at,
      listing_images (
        id,
        image_url,
        sort_order
      ),
      profiles!inner (
        id,
        username,
        full_name,
        avatar_url,
        rating,
        badge,
        is_verified,
        city,
        suspension_status
      )
    `)
    .eq("show_on_map", true)
    .eq("profiles.suspension_status", "none")
    .order("created_at", {
      ascending: false,
    });

  if (user) {
    query = query.neq("owner_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const listings = data as ListingWithRelations[];

  // Backfill landmark data for any listings that need it — fire-and-forget
  // so this never blocks the initial page render. The updated coordinates
  // will be visible on the next page load.
  Promise.resolve().then(async () => {
    for (const listing of listings) {
      if (listing.latitude == null || listing.longitude == null) {
        continue;
      }

      const hasPublicLandmark =
        listing.nearby_landmark != null &&
        listing.landmark_latitude != null &&
        listing.landmark_longitude != null;

      const currentDistanceKm =
        hasPublicLandmark && listing.landmark_latitude != null && listing.landmark_longitude != null
          ? getDistanceInKm(
              listing.latitude,
              listing.longitude,
              listing.landmark_latitude,
              listing.landmark_longitude
            )
          : Infinity;

      const shouldRefreshLandmark = !hasPublicLandmark || currentDistanceKm > 5;

      if (!shouldRefreshLandmark) {
        continue;
      }

      try {
        const fallbackCity = listing.profiles?.[0]?.city ?? listing.city;
        const landmarkInfo = await resolveListingLandmark(
          listing.latitude,
          listing.longitude,
          fallbackCity
        );

        if (!landmarkInfo.landmark || !landmarkInfo.landmarkLatitude || !landmarkInfo.landmarkLongitude) {
          continue;
        }

        await supabase
          .from("listings")
          .update({
            city: landmarkInfo.city || listing.city,
            nearby_landmark: landmarkInfo.landmark ?? null,
            landmark_latitude: landmarkInfo.landmarkLatitude,
            landmark_longitude: landmarkInfo.landmarkLongitude,
          })
          .eq("id", listing.id);
      } catch (updateError) {
        console.warn("Failed to backfill landmark data for listing", listing.id, updateError);
      }
    }
  }).catch((err) => {
    console.warn("[DiscoverMapService] Background landmark backfill failed", err);
  });

  return listings.map((listing): Listing => {
    const profile = listing.profiles?.[0] || null;
    const hasPublicLandmark =
      listing.nearby_landmark != null &&
      listing.landmark_latitude != null &&
      listing.landmark_longitude != null;

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      imageUrl: listing.listing_images?.[0]?.image_url,
      city: listing.city,
      latitude: hasPublicLandmark ? undefined : listing.latitude ?? undefined,
      longitude: hasPublicLandmark ? undefined : listing.longitude ?? undefined,
      landmarkLatitude: listing.landmark_latitude ?? null,
      landmarkLongitude: listing.landmark_longitude ?? null,
      nearbyLandmark: listing.nearby_landmark,
      swapValue: listing.swap_value,
      lookingFor: "",
      category: listing.category ?? "other",
      condition: listing.condition ?? "used_good",
      createdAt: listing.created_at,
      boosted:
        listing.boosted &&
        (!listing.boost_expires_at ||
          new Date(listing.boost_expires_at) > new Date()),
      boostExpiresAt: listing.boost_expires_at ?? null,
      images:
        listing.listing_images?.map((image) => ({
          id: image.id,
          url: image.image_url,
          sortOrder: image.sort_order,
        })) ?? [],
      owner: profile
        ? {
            id: profile.id,
            username: profile.username,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            rating: profile.rating,
            badge: profile.badge,
            isVerified: (profile as any).is_verified ?? false,
            city: profile.city,
          }
        : {
            id: "",
            username: "Unknown",
            fullName: "Unknown",
            avatarUrl: null,
            rating: 0,
            badge: "Member",
            isVerified: false,
            city: listing.city,
          },
      showOnMap: listing.show_on_map ?? true,
    };
  });
}