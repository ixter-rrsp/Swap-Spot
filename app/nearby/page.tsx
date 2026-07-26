import styles from "./page.module.css";

import HomeHeader from "@/app/components/HomePage/HomeHeader/HomeHeader";
import ListingGrid from "@/app/components/Listings/ListingGrid/ListingGrid";
import SearchBar from "@/app/components/HomePage/SearchBar/SearchBar";
import Navbar from "@/app/components/Layout/Navbar/Navbar";

import { getNearbyListings } from "@/lib/services/NearbyListingService";

import NearbyPageClient from "./client";

export default async function NearbyPage() {
  const listings = await getNearbyListings();

  return (
    <div className={styles.container}>
      <HomeHeader />

      <main className={styles.content}>
        <NearbyPageClient listings={listings} />
      </main>

      <Navbar />
    </div>
  );
}