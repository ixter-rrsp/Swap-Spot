import { createClient } from "@/utils/supabase/client";

import type { ListingFormData } from "../validations/ListingSchema";

import {
  uploadListingImages,
  deleteListingImages,
} from "./StorageService";

export async function createListing(
  data: ListingFormData,
  images: File[]
) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "You must be logged in to post a listing."
    );
  }

  // Get owner's saved location
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      city,
      latitude,
      longitude
    `)
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(
      "Failed to get profile location."
    );
  }

  if (
    profile.latitude == null ||
    profile.longitude == null
  ) {
    throw new Error(
      "Please set your location before posting a listing."
    );
  }

  let imageUrls: string[] = [];
  let createdListingId: string | null = null;

  try {
    // Upload images
    imageUrls = await uploadListingImages(
      images
    );

    // Create listing
    const {
      data: listing,
      error: listingError,
    } = await supabase
      .from("listings")
      .insert({
        owner_id: user.id,

        title: data.title,
        description: data.description,

        city: profile.city,
        latitude: profile.latitude,
        longitude: profile.longitude,

        looking_for: data.lookingFor,
        swap_value: data.swapValue,

        boosted: false,
      })
      .select()
      .single();

    if (listingError) {
      throw new Error(
        listingError.message
      );
    }

    createdListingId = listing.id;

    // Save image rows
    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map(
        (url, index) => ({
          listing_id: listing.id,
          image_url: url,
          sort_order: index,
        })
      );

      const {
        error: imageError,
      } = await supabase
        .from("listing_images")
        .insert(imageRows);

      if (imageError) {
        throw new Error(
          imageError.message
        );
      }
    }

    return listing;
  } catch (error) {
    // Delete created listing if it exists
    if (createdListingId) {
      try {
        await supabase
          .from("listings")
          .delete()
          .eq("id", createdListingId);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up listing:",
          cleanupError
        );
      }
    }

    // Delete uploaded images
    if (imageUrls.length > 0) {
      try {
        await deleteListingImages(
          imageUrls
        );
      } catch (cleanupError) {
        console.error(
          "Failed to clean up uploaded images:",
          cleanupError
        );
      }
    }

    throw error;
  }
}

export async function updateListing(
  id: string,
  data: ListingFormData,
  images: string[]
) {
  const response = await fetch(
    `/api/listings/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        ...data,
        images,
      }),
    }
  );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Failed to update listing."
    );
  }

  return result;
}