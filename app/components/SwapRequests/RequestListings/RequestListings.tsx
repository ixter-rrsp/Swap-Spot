import Image from "next/image";

import styles from "./RequestListings.module.css";

interface ListingCard {
  id: string;
  title: string;
  city: string;
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

      <div className={styles.card}>
        <p className={styles.label}>
          Offered Item
        </p>

        <div className={styles.imageWrapper}>
          {offeredListing.imageUrl ? (
            <Image
              src={offeredListing.imageUrl}
              alt={offeredListing.title}
              fill
            />
          ) : (
            <div className={styles.placeholder}>
              No Image
            </div>
          )}
        </div>

        <h3>{offeredListing.title}</h3>

        <p>{offeredListing.city}</p>

        <strong>
          ₱{offeredListing.swapValue.toLocaleString()}
        </strong>
      </div>

      <div className={styles.swapIcon}>
        ⇅
      </div>

      <div className={styles.card}>
        <p className={styles.label}>
          Requested Item
        </p>

        <div className={styles.imageWrapper}>
          {requestedListing.imageUrl ? (
            <Image
              src={requestedListing.imageUrl}
              alt={requestedListing.title}
              fill
            />
          ) : (
            <div className={styles.placeholder}>
              No Image
            </div>
          )}
        </div>

        <h3>{requestedListing.title}</h3>

        <p>{requestedListing.city}</p>

        <strong>
          ₱{requestedListing.swapValue.toLocaleString()}
        </strong>
      </div>

    </section>
  );
}