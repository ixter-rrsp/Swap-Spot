import styles from "./page.module.css";

import HomeHeader from "@/app/components/HomePage/HomeHeader/HomeHeader";
import Navbar from "@/app/components/Layout/Navbar/Navbar";

import { getSavedListings } from "@/lib/services/ServerSavedListingService";

import SavedPageClient from "./client";

export default async function SavedPage() {
  const listings = await getSavedListings();

  return (
    <div className={styles.container}>
      <HomeHeader />

      <main className={styles.content}>
        <SavedPageClient listings={listings} />
      </main>

      <Navbar />
    </div>
  );
}
