import { Listing, ListingImage, ListingOwner } from "@/lib/types/Listing";

interface ListingImageRow {
  id: string;
  image_url: string;
  sort_order: number;
}

interface ProfileRow {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  badge: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface ListingRow {
  id: string;
  title: string;
  description: string;
  city: string;
  swap_value: number;
  looking_for: string;
  category: string;
  condition: string;
  boosted: boolean;
  boost_expires_at?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  nearby_landmark?: string | null;
  landmark_latitude?: number | null;
  landmark_longitude?: number | null;

  owner_id: string;

  listing_images?: ListingImageRow[];

  profiles?: ProfileRow | null;

  distance?: number;
}

interface MapListingOptions {
  owner?: ListingOwner;
}

export function mapListing(
  listing: ListingRow,
  options?: MapListingOptions
): Listing {
  const images: ListingImage[] =
    listing.listing_images?.map((image) => ({
      id: image.id,
      url: image.image_url,
      sortOrder: image.sort_order,
    })) ?? [];

  const owner =
    options?.owner ??
    (listing.profiles
      ? {
          id: listing.profiles.id,
          username: listing.profiles.username,
          fullName: listing.profiles.full_name,
          avatarUrl: listing.profiles.avatar_url,
          rating: Number(listing.profiles.rating),
          badge: listing.profiles.badge,
          city: listing.profiles.city,
          latitude: listing.profiles.latitude,
          longitude: listing.profiles.longitude,
        }
      : {
          id: listing.owner_id,
          username: "",
          fullName: "",
          avatarUrl: null,
          rating: 0,
          badge: "Member",
          city: listing.city,
        });

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,

    imageUrl: images[0]?.url,

    images,

    city: listing.city,

    swapValue: listing.swap_value,

    lookingFor: listing.looking_for,

    category: listing.category,

    condition: listing.condition,

    // Defensive check: treat an expired boost as inactive even if the
    // background sweep (expire_stale_boosts) hasn't flipped the flag yet.
    boosted:
      listing.boosted &&
      (!listing.boost_expires_at ||
        new Date(listing.boost_expires_at) > new Date()),

    boostExpiresAt: listing.boost_expires_at ?? null,

    distance: listing.distance,

    latitude: listing.latitude ?? null,

    longitude: listing.longitude ?? null,

    landmarkLatitude: listing.landmark_latitude ?? null,

    landmarkLongitude: listing.landmark_longitude ?? null,

    nearbyLandmark: listing.nearby_landmark ?? null,

    owner,
  };
}