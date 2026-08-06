import { createClient } from "@/utils/supabase/server";
import { Listing } from "@/lib/types/Listing";
import { haversineDistance } from "@/lib/utils/distance";
import { getFallbackCityCoordinates, resolveListingLandmark } from "./landmark";

interface ListingRowProfile {
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
  latitude?: number | null;
  longitude?: number | null;
  landmark_latitude?: number | null;
  landmark_longitude?: number | null;
  nearby_landmark?: string | null;
  swap_value: number;
  looking_for: string;
  category: string;
  condition: string;
  boosted?: boolean;
  boost_expires_at?: string | null;
  listing_images?: Array<{
    id: string;
    image_url: string;
    sort_order: number;
  }> | null;
  profiles?: ListingRowProfile[] | null;
}

export async function getMyListings(): Promise<Listing[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_images (
        id,
        image_url,
        sort_order
      )
    `)
    .eq("owner_id", user.id)
    .eq("traded", false)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((listing): Listing => ({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    imageUrl: listing.listing_images?.[0]?.image_url,
    city: listing.city,
    swapValue: listing.swap_value,
    lookingFor: listing.looking_for,
    category: listing.category,
    condition: listing.condition,
    boosted:
      listing.boosted &&
      (!listing.boost_expires_at ||
        new Date(listing.boost_expires_at) > new Date()),
    boostExpiresAt: listing.boost_expires_at ?? null,
    images:
      listing.listing_images?.map(
        (image: {
          id: string;
          image_url: string;
          sort_order: number;
        }) => ({
          id: image.id,
          url: image.image_url,
          sortOrder: image.sort_order,
        })
      ) ?? [],
    owner: {
      id: user.id,
      username: "",
      fullName: "",
      avatarUrl: null,
      rating: 0,
      badge: "Member",
      city: listing.city,
    },
  }));
}

export async function getMyListingsForSwap(): Promise<Listing[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_images (
        id,
        image_url,
        sort_order
      )
    `)
    .eq("owner_id", user.id)
    .eq("traded", false)
    .is("locked_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((listing): Listing => ({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    imageUrl: listing.listing_images?.[0]?.image_url,
    city: listing.city,
    swapValue: listing.swap_value,
    lookingFor: listing.looking_for,
    category: listing.category,
    condition: listing.condition,
    boosted:
      listing.boosted &&
      (!listing.boost_expires_at ||
        new Date(listing.boost_expires_at) > new Date()),
    boostExpiresAt: listing.boost_expires_at ?? null,
    images:
      listing.listing_images?.map(
        (image: {
          id: string;
          image_url: string;
          sort_order: number;
        }) => ({
          id: image.id,
          url: image.image_url,
          sortOrder: image.sort_order,
        })
      ) ?? [],
    owner: {
      id: user.id,
      username: "",
      fullName: "",
      avatarUrl: null,
      rating: 0,
      badge: "Member",
      city: listing.city,
    },
  }));
}

export async function getListingsByOwner(ownerId: string): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_images (
        id,
        image_url,
        sort_order
      )
    `)
    .eq("owner_id", ownerId)
    .eq("traded", false)
    .is("locked_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((listing): Listing => ({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    imageUrl: listing.listing_images?.[0]?.image_url,
    city: listing.city,
    swapValue: listing.swap_value,
    lookingFor: listing.looking_for,
    category: listing.category,
    condition: listing.condition,
    boosted:
      listing.boosted &&
      (!listing.boost_expires_at ||
        new Date(listing.boost_expires_at) > new Date()),
    boostExpiresAt: listing.boost_expires_at ?? null,
    images:
      listing.listing_images?.map(
        (image: {
          id: string;
          image_url: string;
          sort_order: number;
        }) => ({
          id: image.id,
          url: image.image_url,
          sortOrder: image.sort_order,
        })
      ) ?? [],
    owner: {
      id: ownerId,
      username: "",
      fullName: "",
      avatarUrl: null,
      rating: 0,
      badge: "Member",
      city: listing.city,
    },
  }));
}

export async function getListingById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_images (
        id,
        image_url,
        sort_order
      ),
      profiles (
        id,
        username,
        full_name,
        avatar_url,
        rating,
        badge,
        city
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.profiles) {
    throw new Error("Owner profile not found.");
  }

  // `profiles.rating` is a stored column that's never actually written to
  // when reviews come in — it stays at its default forever. The rating
  // shown on the listing's Owner card needs to match what the profile
  // page itself shows, which computes it live from the reviews table
  // instead of trusting that stale column.
  const { data: ownerReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", data.profiles.id);

  const liveRating =
    ownerReviews && ownerReviews.length > 0
      ? ownerReviews.reduce((sum, r) => sum + r.rating, 0) / ownerReviews.length
      : 0;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    city: data.city,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    landmarkLatitude: data.landmark_latitude ?? null,
    landmarkLongitude: data.landmark_longitude ?? null,
    nearbyLandmark: data.nearby_landmark ?? null,
    swapValue: data.swap_value,
    lookingFor: data.looking_for,
    category: data.category,
    condition: data.condition,
    boosted:
      data.boosted &&
      (!data.boost_expires_at ||
        new Date(data.boost_expires_at) > new Date()),
    boostExpiresAt: data.boost_expires_at ?? null,
    images:
      data.listing_images?.map(
        (image: {
          id: string;
          image_url: string;
          sort_order: number;
        }) => ({
          id: image.id,
          url: image.image_url,
          sortOrder: image.sort_order,
        })
      ) ?? [],
    owner: {
      id: data.profiles.id,
      username: data.profiles.username,
      fullName: data.profiles.full_name,
      avatarUrl: data.profiles.avatar_url,
      rating: Number(liveRating.toFixed(1)),
      badge: data.profiles.badge,
      city: data.profiles.city,
    },
  };
}

export interface GetListingsOptions {
  /** Free-text search across title, description, looking_for and category. */
  search?: string;
  /** Restrict to a single category value (see lib/constants/categories.ts). */
  category?: string;
  /** Restrict to a single condition value (see lib/constants/categories.ts). */
  condition?: string;
}

export async function getListings(options: GetListingsOptions = {}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("listings")
    .select(`
      *,
      listing_images (
        id,
        image_url,
        sort_order
      ),
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          rating,
          badge,
          city,
          latitude,
          longitude
        )
    `)
    .eq("traded", false)
    .is("locked_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (user) {
    query = query.neq("owner_id", user.id);
  }

  if (options.category) {
    query = query.eq("category", options.category);
  }

  if (options.condition) {
    query = query.eq("condition", options.condition);
  }

  const searchTerm = options.search?.trim();

  if (searchTerm) {
    // Uses the generated `search_vector` column (see migration
    // 20260801_add_category_condition_search.sql) for ranked full-text
    // search across title, category, looking_for and description.
    const sanitized = searchTerm.replace(/[^\w\s]/g, " ").trim();

    if (sanitized) {
      query = query.textSearch("search_vector", sanitized, {
        type: "websearch",
        config: "english",
      });
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  let currentUserLocation: { latitude: number; longitude: number } | null = null;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("latitude, longitude")
      .eq("id", user.id)
      .maybeSingle();

    if (profileData?.latitude != null && profileData?.longitude != null) {
      currentUserLocation = {
        latitude: profileData.latitude,
        longitude: profileData.longitude,
      };
    }
  }

  return (data ?? []).map((row: ListingRow) => {
    const ownerProfile: ListingRowProfile | null = row.profiles?.[0] ?? null;
    let distance: number | undefined;

    if (
      currentUserLocation &&
      ownerProfile?.latitude != null &&
      ownerProfile?.longitude != null
    ) {
      distance = haversineDistance(
        currentUserLocation.latitude,
        currentUserLocation.longitude,
        ownerProfile.latitude,
        ownerProfile.longitude
      );
    }

    return {
      ...row,
      distance,
      profiles: ownerProfile,
    };
  });
}

/**
 * Boosted listings for the homepage "Boosted Swaps" section. Like
 * getListings() (used for the browse/swap grids), this excludes the
 * current user's own listings — boosting is meant to increase visibility
 * to other browsers, not to yourself.
 */
export async function getBoostedListings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nowIso = new Date().toISOString();

  let query = supabase
    .from("listings")
    .select(`
      *,
      listing_images (
        id,
        image_url,
        sort_order
      ),
      profiles (
        id,
        username,
        full_name,
        avatar_url,
        rating,
        badge,
        city,
        latitude,
        longitude
      )
    `)
    .eq("traded", false)
    .is("locked_at", null)
    .eq("boosted", true)
    .gt("boost_expires_at", nowIso)
    .order("boost_expires_at", { ascending: false });

  if (user) {
    query = query.neq("owner_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: ListingRow) => ({
    ...row,
    profiles: row.profiles?.[0] ?? null,
  }));
}

export async function deleteListing(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const {
    data: listing,
    error: listingError,
  } = await supabase
    .from("listings")
    .select(`
      owner_id,
      listing_images (
        image_url
      )
    `)
    .eq("id", id)
    .single();

  if (listingError) {
    throw new Error(listingError.message);
  }

  if (listing.owner_id !== user.id) {
    throw new Error("You are not allowed to delete this listing.");
  }

  const filePaths =
    listing.listing_images?.map(
      (image) => image.image_url.split("/listing-images/")[1]
    ) ?? [];

  if (filePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("listing-images")
      .remove(filePaths);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error: deleteError } = await supabase
    .from("listings")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}

export async function updateListing(
  id: string,
  data: {
    title: string;
    description: string;
    city: string;
    lookingFor: string;
    category?: string;
    condition?: string;
    swapValue: number;
    showOnMap?: boolean;
    images: string[];
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const {
    data: listing,
    error: listingError,
  } = await supabase
    .from("listings")
    .select("owner_id, city")
    .eq("id", id)
    .single();

  if (listingError) {
    throw new Error(listingError.message);
  }

  if (listing.owner_id !== user.id) {
    throw new Error("You are not allowed to edit this listing.");
  }

  // Remove old images from storage
  const { data: oldImages, error: oldImagesError } = await supabase
    .from("listing_images")
    .select("image_url")
    .eq("listing_id", id);

  if (oldImagesError) {
    throw new Error(oldImagesError.message);
  }

  const removedImages =
    oldImages
      ?.filter((oldImage) => !data.images.includes(oldImage.image_url))
      .map((image) => image.image_url.split("/listing-images/")[1])
      .filter(Boolean) ?? [];

  if (removedImages.length > 0) {
    const { error: storageDeleteError } = await supabase.storage
      .from("listing-images")
      .remove(removedImages);

    if (storageDeleteError) {
      throw new Error(storageDeleteError.message);
    }
  }

  console.log("[updateListing] input", { id, data });

  const profileLocation = await supabase
    .from("profiles")
    .select("city, latitude, longitude")
    .eq("id", user.id)
    .single();

  let landmarkUpdate = {};

  const fallbackCity = profileLocation.data?.city || data.city || listing.city || "";
  const fallbackCoordinates = getFallbackCityCoordinates(fallbackCity);

  if (!profileLocation.error && profileLocation.data?.latitude != null && profileLocation.data?.longitude != null) {
    const landmarkInfo = await resolveListingLandmark(
      profileLocation.data.latitude,
      profileLocation.data.longitude,
      fallbackCity
    );
    const resolvedCity = landmarkInfo.city || fallbackCity || "";
    const resolvedLandmark = landmarkInfo.landmark || fallbackCity || null;
    const resolvedLatitude = landmarkInfo.landmarkLatitude ?? fallbackCoordinates?.lat ?? null;
    const resolvedLongitude = landmarkInfo.landmarkLongitude ?? fallbackCoordinates?.lon ?? null;

    console.log("[updateListing] landmark info", {
      landmarkInfo,
      fallbackCity,
      resolvedCity,
      resolvedLandmark,
      resolvedLatitude,
      resolvedLongitude,
    });

    landmarkUpdate = {
      city: resolvedCity,
      nearby_landmark: resolvedLandmark,
      landmark_latitude: resolvedLatitude,
      landmark_longitude: resolvedLongitude,
    };
  } else {
    landmarkUpdate = {
      city: fallbackCity,
      nearby_landmark: fallbackCity || null,
      landmark_latitude: fallbackCoordinates?.lat ?? null,
      landmark_longitude: fallbackCoordinates?.lon ?? null,
    };
  }

  // Update listing details
  const { error: updateError } = await supabase
    .from("listings")
    .update({
      title: data.title,
      description: data.description,
      city: data.city,
      looking_for: data.lookingFor,
      ...(data.category ? { category: data.category } : {}),
      ...(data.condition ? { condition: data.condition } : {}),
      swap_value: data.swapValue,
      show_on_map: data.showOnMap ?? true,
      ...landmarkUpdate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  console.log("[updateListing] update result", { updateError });

  if (updateError) {
    throw new Error(updateError.message);
  }

  // Delete old image records
  const { error: deleteImagesError } = await supabase
    .from("listing_images")
    .delete()
    .eq("listing_id", id);

  if (deleteImagesError) {
    throw new Error(deleteImagesError.message);
  }

  // Insert new images
  if (data.images.length > 0) {
    const imageRows = data.images.map((url, index) => ({
      listing_id: id,
      image_url: url,
      sort_order: index,
    }));

    const { error: imageError } = await supabase
      .from("listing_images")
      .insert(imageRows);

    if (imageError) {
      throw new Error(imageError.message);
    }
  }

  return { success: true };
}