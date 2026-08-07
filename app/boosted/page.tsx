import styles from "./page.module.css";

import HomeHeader from "@/app/components/HomePage/HomeHeader/HomeHeader";
import Navbar from "@/app/components/Layout/Navbar/Navbar";
import { getBoostedListings } from "@/lib/services/ServerListingService";
import { Listing } from "@/lib/types/Listing";

import BoostedPageClient from "./client";

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
    category: row.category,
    condition: row.condition,
    boosted: row.boosted,
    createdAt: row.created_at,
    owner: {
      id: row.profiles?.id ?? row.owner_id,
      username: row.profiles?.username ?? "",
      fullName: row.profiles?.full_name ?? "",
      avatarUrl: row.profiles?.avatar_url ?? null,
      rating: Number(row.profiles?.rating ?? 0),
      badge: row.profiles?.badge ?? "Member",
      isVerified: row.profiles?.is_verified ?? false,
      city: row.profiles?.city ?? row.city,
      latitude: row.profiles?.latitude ?? null,
      longitude: row.profiles?.longitude ?? null,
    },
  };
}

export default async function BoostedPage() {
  const boostedRows = await getBoostedListings();
  const listings: Listing[] = boostedRows.map(mapRow);

  return (
    <div className={styles.container}>
      <HomeHeader />

      <main className={styles.content}>
        <BoostedPageClient listings={listings} />
      </main>

      <Navbar />
    </div>
  );
}
