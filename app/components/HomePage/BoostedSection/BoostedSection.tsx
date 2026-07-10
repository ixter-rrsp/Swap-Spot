import styles from "./BoostedSection.module.css";
import { ChevronRight } from "lucide-react";

import FeaturedListingCard from "@/app/components/HomePage/FeaturedListingCard/FeaturedListingCard";
import { Listing } from "@/lib/types/Listing";

interface BoostedSectionProps {
  listings: Listing[];
}

export default function BoostedSection({
  listings,
}: BoostedSectionProps) {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Boosted Swaps</h2>

        <button
          type="button"
          className={styles.seeAllButton}
        >
          <span>See all</span>
          <ChevronRight size={18} />
        </button>
      </header>

      <div className={styles.cards}>
    {listings.length === 0 ? (
      <p className={styles.emptyMessage}>
        No boosted listings available yet.
      </p>
    ) : (
      listings.map((listing) => (
        <FeaturedListingCard
          key={listing.id}
          {...listing}
        />
      ))
    )}
  </div>
      
    </section>
  );
}