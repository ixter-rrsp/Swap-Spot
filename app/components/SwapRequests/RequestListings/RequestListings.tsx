import Image from "next/image";

import styles from "./RequestListings.module.css";

import {
  ArrowUpDown,
} from "lucide-react";

interface ListingCard {
  id: string;
  title: string;
  description: string;
  city: string;
  lookingFor: string;
  swapValue: number;
  imageUrl?: string;
}

interface RequestListingsProps {
  offeredListing: ListingCard;
  requestedListing: ListingCard;
}

export default function RequestListings({
  offeredListing,
  requestedListing,
}: RequestListingsProps) {
  return (
    <section className={styles.container}>

      <ListingCard
        label="Offered Item"
        listing={offeredListing}
      />

      <div className={styles.swapIcon}>
        <ArrowUpDown/>
      </div>

      <ListingCard
        label="Requested Item"
        listing={requestedListing}
      />

    </section>
  );
}

interface ListingCardProps {
  label: string;
  listing: ListingCard;
}

function ListingCard({
  label,
  listing,
}: ListingCardProps) {
  return (
    <div className={styles.card}>

      <p className={styles.label}>
        {label}
      </p>

      <div className={styles.imageWrapper}>
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
          />
        ) : (
          <div className={styles.placeholder}>
            No Image
          </div>
        )}
      </div>

      <h3>{listing.title}</h3>

      <p className={styles.city}>
        {listing.city}
      </p>

      <p className={styles.value}>
        <strong>
          {listing.swapValue.toLocaleString()}
        </strong>
      </p>

      <div className={styles.section}>
        <span className={styles.heading}>
          Looking For
        </span>

        <p>{listing.lookingFor}</p>
      </div>

      <div className={styles.section}>
        <span className={styles.heading}>
          Description
        </span>

        <p>{listing.description}</p>
      </div>

    </div>
  );
}