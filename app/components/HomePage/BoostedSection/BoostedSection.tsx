import styles from "./BoostedSection.module.css";
import { ChevronRight } from "lucide-react";

import FeaturedListingCard from "@/app/components/HomePage/FeaturedListingCard/FeaturedListingCard";
import listings from "@/lib/mock/listings";

const featuredListings = listings.filter(
  (listing) => listing.boosted
);

export default function BoostedSection() {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Boosted Swaps</h2>

        <button type="button" className={styles.seeAllButton}>
          <span>See all</span>
          <ChevronRight size={18} />
        </button>
      </header>

      <div className={styles.cards}>
        {featuredListings.map((listing) => (
          <FeaturedListingCard
            key={listing.id}
            {...listing}
          />
        ))}
      </div>
    </section>
  );
}