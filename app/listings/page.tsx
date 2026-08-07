import styles from "./page.module.css";

import HomeHeader from "@/app/components/HomePage/HomeHeader/HomeHeader";
import Navbar from "@/app/components/Layout/Navbar/Navbar";

import { getListings } from "@/lib/services/ServerListingService";
import type { Listing } from "@/lib/types/Listing";

import ListingsPageClient from "./client";

export default async function ListingsPage() {
  const rows = await getListings();

  const listings: Listing[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.listing_images?.[0]?.image_url,
    images:
      row.listing_images?.map(
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
    city: row.city,
    distance: row.distance,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    landmarkLatitude: row.landmark_latitude ?? null,
    landmarkLongitude: row.landmark_longitude ?? null,
    nearbyLandmark: row.nearby_landmark ?? null,
    swapValue: row.swap_value,
    lookingFor: row.looking_for,
    category: row.category,
    condition: row.condition,
    boosted: row.boosted,
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
  }));

  return (
    <div className={styles.container}>
      <HomeHeader />

      <main className={styles.content}>
        <ListingsPageClient listings={listings} />
      </main>

      <Navbar />
    </div>
  );
}

