import { createClient } from "@/utils/supabase/server";

import type { Listing } from "@/lib/types/Listing";


function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371; // KM

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;


  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  return Number(
    (
      earthRadius * c
    ).toFixed(1)
  );
}



export async function getNearbyListings(): Promise<Listing[]> {

  const supabase = await createClient();


  // Get logged-in user
  const {
    data: {
      user,
    },
    error: authError,
  } =
    await supabase.auth.getUser();


  if (authError) {
    throw new Error(
      authError.message
    );
  }


  if (!user) {
    return [];
  }



  // Get user's location
    const {
    data: profile,
    error: profileError,
    } =
    await supabase
        .from("profiles")
        .select(`
        latitude,
        longitude,
        swap_radius
        `)
        .eq(
        "id",
        user.id
        )
        .single();



  if (profileError) {
    throw new Error(
      profileError.message
    );
  }



  if (
    profile.latitude == null ||
    profile.longitude == null
  ) {
    return [];
  }

const userRadius =
  Number(profile.swap_radius ?? 10);



  // Get listings with owners
  const {
    data,
    error,
  } =
    await supabase
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
      .neq(
        "owner_id",
        user.id
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );



  if (error) {
    throw new Error(
      error.message
    );
  }



  const listings: Listing[] =
    data
      .map((listing) => {


        if (
          !listing.profiles ||
          listing.profiles.latitude == null ||
          listing.profiles.longitude == null
        ) {
          return null;
        }



        const distance =
          calculateDistance(
            profile.latitude,
            profile.longitude,
            listing.profiles.latitude,
            listing.profiles.longitude
          );
          if (distance > userRadius) {
        return null;
        }



        return {
          id: listing.id,

          title: listing.title,

          description:
            listing.description,


          imageUrl:
            listing.listing_images?.[0]
              ?.image_url,


          images:
            listing.listing_images?.map(
              (image: any) => ({
                id: image.id,
                url: image.image_url,
                sortOrder:
                  image.sort_order,
              })
            ) ?? [],


          city: listing.city,


          swapValue:
            listing.swap_value,


          lookingFor:
            listing.looking_for,


          boosted:
            listing.boosted,


          distance,


          owner: {
            id:
              listing.profiles.id,

            username:
              listing.profiles.username,

            fullName:
              listing.profiles.full_name,

            avatarUrl:
              listing.profiles.avatar_url,

            rating:
              Number(
                listing.profiles.rating
              ),

            badge:
              listing.profiles.badge,


            city:
              listing.profiles.city,


            latitude:
              listing.profiles.latitude,


            longitude:
              listing.profiles.longitude,
          },
        };
      })
      .filter(Boolean) as Listing[];



  // Nearest first
  return listings.sort(
    (a, b) =>
      (a.distance ?? 9999) -
      (b.distance ?? 9999)
  );
}