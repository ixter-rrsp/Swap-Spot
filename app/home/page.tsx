import styles from "./page.module.css";

import HomeHeader from "../components/HomePage/HomeHeader/HomeHeader";
import HomeContent from "../components/HomePage/HomeContent/HomeContent";

import { getListings, getBoostedListings } from "@/lib/services/ServerListingService";
import { getNearbyListings } from "@/lib/services/NearbyListingService";
import { getCurrentProfile } from "@/lib/services/ProfileService";

import type { Listing } from "@/lib/types/Listing";


function mapRow(row: unknown): Listing {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = row as any;

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    imageUrl: r.listing_images?.[0]?.image_url,
    images:
      r.listing_images?.map(
        (image: { id: string; image_url: string; sort_order: number }) => ({
          id: image.id,
          url: image.image_url,
          sortOrder: image.sort_order,
        })
      ) ?? [],
    city: r.city,
    swapValue: r.swap_value,
    lookingFor: r.looking_for,
    category: r.category,
    condition: r.condition,
    boosted: r.boosted,
    createdAt: r.created_at,
    owner: {
      id: r.profiles?.id ?? r.owner_id,
      username: r.profiles?.username ?? "",
      fullName: r.profiles?.full_name ?? "",
      avatarUrl: r.profiles?.avatar_url ?? null,
      rating: Number(r.profiles?.rating ?? 0),
      badge: r.profiles?.badge ?? "Member",
      isVerified: r.profiles?.is_verified ?? false,
      city: r.profiles?.city ?? r.city,
      latitude: r.profiles?.latitude ?? null,
      longitude: r.profiles?.longitude ?? null,
    },
  };
}


export default async function HomePage() {

  const rows = await getListings();
  const boostedRows = await getBoostedListings();

  const nearbyListings =
    await getNearbyListings();

  const profile =
    await getCurrentProfile();


  const listings: Listing[] = rows.map(mapRow);
  const boostedListings: Listing[] = boostedRows.map(mapRow);



  return (
    <div className={styles.container}>

      <HomeHeader
        avatarUrl={profile?.avatarUrl ?? null}
        username={profile?.username ?? null}
      />


      <HomeContent
        listings={listings}
        boostedListings={boostedListings}
        nearbyListings={nearbyListings}
      />

    </div>
  );
}