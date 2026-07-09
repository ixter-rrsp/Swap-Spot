import styles from "./ListingGrid.module.css";

import ListingCard from "../ListingCard/ListingCard";

import { Listing } from "@/lib/types/Listing";


interface ListingGridProps {
  title: string;
  listings: Listing[];

  actionLabel?: string;
  onActionClick?: () => void;

  loading?: boolean;
}


export default function ListingGrid({
  title,
  listings,
  actionLabel,
  onActionClick,
  loading = false,
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



      {loading ? (

        <div className={styles.message}>
          Loading listings...
        </div>


      ) : listings.length === 0 ? (

        <div className={styles.message}>
          No listings available.
        </div>


      ) : (

        <div className={styles.grid}>

          {listings.map((listing) => (

            <ListingCard
              key={listing.id}
              {...listing}
            />

          ))}

        </div>

      )}

    </section>
  );
}