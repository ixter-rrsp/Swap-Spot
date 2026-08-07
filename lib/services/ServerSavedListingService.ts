import { createClient } from "@/utils/supabase/server";
import { Listing } from "@/lib/types/Listing";

// Just the ids — cheap, used to hydrate every heart icon on a page in
// one request instead of one query per card.
export async function getSavedListingIds(): Promise<string[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((row) => row.listing_id);
}

// Full listing rows for the /saved page, in the same shape every other
// listing grid expects.
export async function getSavedListings(): Promise<Listing[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("saved_listings")
    .select(
      `
      created_at,
      listings (
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
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data
    .map((row) => row.listings)
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing))
    // A listing can be saved and later deleted, marked traded, or
    // locked into someone else's accepted swap — don't show those on
    // the saved page.
    .filter((listing: any) => !listing.traded && !listing.locked_at)
    .map(
      (listing: any): Listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        imageUrl: listing.listing_images?.[0]?.image_url,
        images:
          listing.listing_images?.map(
            (image: { id: string; image_url: string; sort_order: number }) => ({
              id: image.id,
              url: image.image_url,
              sortOrder: image.sort_order,
            })
          ) ?? [],
        city: listing.city,
        latitude: listing.latitude ?? null,
        longitude: listing.longitude ?? null,
        landmarkLatitude: listing.landmark_latitude ?? null,
        landmarkLongitude: listing.landmark_longitude ?? null,
        nearbyLandmark: listing.nearby_landmark ?? null,
        swapValue: listing.swap_value,
        lookingFor: listing.looking_for,
        category: listing.category,
        condition: listing.condition,
        boosted:
          listing.boosted &&
          (!listing.boost_expires_at ||
            new Date(listing.boost_expires_at) > new Date()),
        boostExpiresAt: listing.boost_expires_at ?? null,
        owner: {
          id: listing.profiles?.id ?? listing.owner_id,
          username: listing.profiles?.username ?? "",
          fullName: listing.profiles?.full_name ?? "",
          avatarUrl: listing.profiles?.avatar_url ?? null,
          rating: Number(listing.profiles?.rating ?? 0),
          badge: listing.profiles?.badge ?? "Member",
          isVerified: listing.profiles?.is_verified ?? false,
          city: listing.profiles?.city ?? listing.city,
          latitude: listing.profiles?.latitude ?? null,
          longitude: listing.profiles?.longitude ?? null,
        },
      })
    );
}

export async function saveListing(listingId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("Unauthorized.");

  const { error } = await supabase
    .from("saved_listings")
    .upsert(
      { user_id: user.id, listing_id: listingId },
      { onConflict: "user_id,listing_id", ignoreDuplicates: true }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function unsaveListing(listingId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("Unauthorized.");

  const { error } = await supabase
    .from("saved_listings")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  if (error) {
    throw new Error(error.message);
  }
}
