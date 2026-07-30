import styles from "./page.module.css";

import HomeHeader from "../components/HomePage/HomeHeader/HomeHeader";
import HomeContent from "../components/HomePage/HomeContent/HomeContent";

import { getListings, getBoostedListings } from "@/lib/services/ServerListingService";
import { getNearbyListings } from "@/lib/services/NearbyListingService";

import type { Listing } from "@/lib/types/Listing";


function mapRow(row: any): Listing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.listing_images?.[0]?.image_url,
    images:
      row.listing_images?.map(
        (image: { id: string; image_url: string; sort_order: number }) => ({
          id: image.id,
          url: image.image_url,
          sortOrder: image.sort_order,
        })
      ) ?? [],
    city: row.city,
    swapValue: row.swap_value,
    lookingFor: row.looking_for,
    boosted: row.boosted,
    owner: {
      id: row.profiles?.id ?? row.owner_id,
      username: row.profiles?.username ?? "",
      fullName: row.profiles?.full_name ?? "",
      avatarUrl: row.profiles?.avatar_url ?? null,
      rating: Number(row.profiles?.rating ?? 0),
      badge: row.profiles?.badge ?? "Member",
      city: row.profiles?.city ?? row.city,
      latitude: row.profiles?.latitude ?? null,
      longitude: row.profiles?.longitude ?? null,
    },
  };
}


export default async function HomePage() {

  const rows = await getListings();
  const boostedRows = await getBoostedListings();

  const nearbyListings =
    await getNearbyListings();


  const listings: Listing[] = rows.map(mapRow);
  const boostedListings: Listing[] = boostedRows.map(mapRow);



  return (
    <div className={styles.container}>

      <HomeHeader />


      <HomeContent
        listings={listings}
        boostedListings={boostedListings}
        nearbyListings={nearbyListings}
      />

    </div>
  );
}