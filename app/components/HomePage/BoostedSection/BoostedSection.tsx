import Link from "next/link";
import styles from "./BoostedSection.module.css";
import { ChevronRight } from "lucide-react";

import ListingCard from "@/app/components/Listings/ListingCard/ListingCard";
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

        <Link
          href="/boosted"
          className={styles.seeAllButton}
        >
          <span>See all</span>
          <ChevronRight size={18} />
        </Link>
      </header>

      <div className={styles.cards}>
    {listings.length === 0 ? (
      <p className={styles.emptyMessage}>
        No boosted listings available yet.
      </p>
    ) : (
      listings.map((listing) => (
        <div key={listing.id} className={styles.cardItem}>
          <ListingCard
            id={listing.id}
            title={listing.title}
            imageUrl={listing.imageUrl}
            city={listing.city}
            swapValue={listing.swapValue}
            lookingFor={listing.lookingFor}
            rating={listing.owner?.rating}
            boosted={listing.boosted}
            boostExpiresAt={listing.boostExpiresAt}
            nearbyLandmark={listing.nearbyLandmark}
          />
        </div>
      ))
    )}
  </div>
      
    </section>
  );
}