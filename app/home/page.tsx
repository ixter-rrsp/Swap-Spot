import styles from "./page.module.css";

import HomeHeader from "../components/HomePage/HomeHeader/HomeHeader";
import SearchBar from "../components/HomePage/SearchBar/SearchBar";
import CategoryChips from "../components/HomePage/CategoryChips/CategoryChips";
import BoostedSection from "../components/HomePage/BoostedSection/BoostedSection";
import ListingGrid from "../components/Listings/ListingGrid/ListingGrid";
import { getListings } from "@/lib/services/ListingService";
import { Listing } from "@/lib/types/Listing";

export default async function HomePage() {
const rows = await getListings();

const listings: Listing[] = rows.map((row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  city: row.city,
  swapValue: row.swap_value,
  lookingFor: row.looking_for,
  boosted: row.boosted,
  rating: 0,

  owner: {
    id: row.owner_id,
    name: "Unknown User",
    rating: 0,
  },

  imageUrl: row.listing_images?.[0]?.image_url,
}));

const nearbyListings = listings.slice(0, 4);
const recommendedListings = listings.slice(4, 8);
const newestListings = listings.slice(8, 12);
const boostedListings = listings.filter(
  (listing) => listing.boosted
);

  return (
    <div className={styles.container}>
      <HomeHeader />

      <SearchBar />

      <CategoryChips />

      <BoostedSection
      listings={boostedListings}
    />

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