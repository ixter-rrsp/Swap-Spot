import styles from "./page.module.css";
import Navbar from "@/app/components/Layout/Navbar/Navbar";
import DiscoverPageClient from "./client";
import { getMapVisibleListings } from "@/lib/services/DiscoverMapService";

export default async function DiscoverPage() {
  const listings = await getMapVisibleListings();

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <DiscoverPageClient listings={listings} />
      </main>

      <Navbar />
    </div>
  );
}
