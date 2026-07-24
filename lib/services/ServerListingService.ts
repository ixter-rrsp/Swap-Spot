import { createClient } from "@/utils/supabase/server";
import { Listing } from "@/lib/types/Listing";

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
    boosted: listing.boosted,
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
    boosted: listing.boosted,
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
    boosted: listing.boosted,
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

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    city: data.city,
    swapValue: data.swap_value,
    lookingFor: data.looking_for,
    boosted: data.boosted,
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
      rating: data.profiles.rating,
      badge: data.profiles.badge,
      city: data.profiles.city,
    },
  };
}

export async function getListings() {
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
      )
    `)
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

  return data;
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
    swapValue: number;
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
    .select("owner_id")
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

  // Update listing details
  const { error: updateError } = await supabase
    .from("listings")
    .update({
      title: data.title,
      description: data.description,
      city: data.city,
      looking_for: data.lookingFor,
      swap_value: data.swapValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

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