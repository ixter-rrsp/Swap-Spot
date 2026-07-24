import styles from "./page.module.css";

import HomeHeader from "@/app/components/HomePage/HomeHeader/HomeHeader";
import ListingGrid from "@/app/components/Listings/ListingGrid/ListingGrid";
import Navbar from "@/app/components/Layout/Navbar/Navbar";

import { getListings } from "@/lib/services/ServerListingService";
import { getNearbyListings } from "@/lib/services/NearbyListingService";



export default async function NearbyPage() {

  const listings =
    await getNearbyListings();


  return (
    <div className={styles.container}>

      <HomeHeader />


      <main className={styles.content}>

        <div className={styles.pageHeader}>
          <h1>
            Nearby Swaps
          </h1>

          <p>
            Discover items available near your location.
          </p>
        </div>


        <ListingGrid
          title=""
          listings={listings}
          emptyTitle="No nearby swaps found"
          emptyDescription="Try increasing your swap radius or check again later."
        />

      </main>


      <Navbar />

    </div>
  );
}