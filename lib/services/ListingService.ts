import { createClient } from "@/utils/supabase/client";

import { ListingFormData } from "../validations/ListingSchema";
import { uploadListingImages } from "./StorageService";

export async function createListing(
  data: ListingFormData,
  images: File[]
) {
  const supabase = createClient();

  // Get the logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to post a listing.");
  }

  // Upload images
  const imageUrls = await uploadListingImages(images);

  // Create listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      title: data.title,
      description: data.description,
      city: data.city,
      looking_for: data.lookingFor,
      swap_value: data.swapValue,
      boosted: false,
    })
    .select()
    .single();

  if (listingError) {
    throw new Error(listingError.message);
  }

  // Save image URLs
  const imageRows = imageUrls.map((url, index) => ({
    listing_id: listing.id,
    image_url: url,
    sort_order: index,
  }));

  const { error: imageError } = await supabase
    .from("listing_images")
    .insert(imageRows);

  if (imageError) {
    throw new Error(imageError.message);
  }

  return listing;
}

export async function getListings() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_images (
        image_url,
        sort_order
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getListingById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_images (
        image_url,
        sort_order
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}