import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MapPin,
  Banknote,
  RefreshCcw,
  Star,
} from "lucide-react";

import styles from "./ListingCard.module.css";

interface ListingCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  location: string;
  swapValue: number;
  lookingFor: string;
  rating?: number;
  boosted?: boolean;
}

export default function ListingCard({
  id,
  title,
  imageUrl,
  location,
  swapValue,
  lookingFor,
  rating = 0,
  boosted = false,
}: ListingCardProps) {
  return (
    <Link href={`/Listing/${id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            No Image
          </div>
        )}

        <button
          className={styles.favoriteButton}
          aria-label="Add to favorites"
        >
          <Heart size={18} />
        </button>

        {boosted && (
          <span className={styles.boostBadge}>
            Boosted
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.info}>
          <MapPin size={16} />
          <span>{location}</span>
        </div>

        <div className={styles.info}>
          <Banknote size={16} />
          <span>₱{swapValue.toLocaleString()}</span>
        </div>

        <div className={styles.info}>
          <RefreshCcw size={16} />
          <span>{lookingFor}</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.rating}>
            <Star size={15} fill="currentColor" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}