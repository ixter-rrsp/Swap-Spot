import styles from "./ListingGrid.module.css";

import ListingCard from "../ListingCard/ListingCard";

import { Listing } from "@/lib/types/Listing";

import EmptyState from "@/app/components/UI/EmptyState/EmptyState";

interface ListingGridProps {
  title: string;
  listings: Listing[];

  actionLabel?: string;
  onActionClick?: () => void;

  showActions?: boolean;
  disableFavorite?: boolean;

  emptyTitle?: string;
  emptyDescription?: string;
}

export default function ListingGrid({
  title,
  listings,
  actionLabel,
  onActionClick,
  showActions = false,
  disableFavorite = false,
  emptyTitle,
  emptyDescription,
}: ListingGridProps) {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {title}
        </h2>

        {actionLabel && (
          <button
            className={styles.action}
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        )}
      </header>

      {listings.length === 0 ? (
        <EmptyState
          title={
            emptyTitle ??
            "No listings found"
          }
          description={
            emptyDescription ??
            "Check back later or be the first to post an item."
          }
        />
      ) : (
        <div className={styles.grid}>
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              {...listing}
              rating={listing.owner?.rating}
              showActions={showActions}
              disableFavorite={disableFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
}