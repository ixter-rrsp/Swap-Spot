import styles from "./page.module.css";

import HomeHeader from "../components/HomePage/HomeHeader/HomeHeader";
import SearchBar from "../components/HomePage/SearchBar/SearchBar";
import CategoryChips from "../components/HomePage/CategoryChips/CategoryChips";
import BoostedSection from "../components/HomePage/BoostedSection/BoostedSection";
import ListingGrid from "../components/Listings/ListingGrid/ListingGrid";

import listings from "@/lib/mock/listings";

export default function HomePage() {
  const nearbyListings = listings.slice(0, 4);
  const recommendedListings = listings.slice(4, 8);
  const newestListings = listings.slice(8, 12);

  return (
    <div className={styles.container}>
      <HomeHeader />

      <SearchBar />

      <CategoryChips />

      <BoostedSection />

      <ListingGrid
        title="Nearby Swaps"
        listings={nearbyListings}
        actionLabel="See All"
      />

      <ListingGrid
        title="Recommended for You"
        listings={recommendedListings}
        actionLabel="See All"
      />

      <ListingGrid
        title="Newest Listings"
        listings={newestListings}
        actionLabel="See All"
      />
    </div>
  );
}