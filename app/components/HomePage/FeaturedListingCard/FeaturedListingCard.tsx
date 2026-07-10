import Image from "next/image";
import { MapPin, Banknote, Star } from "lucide-react";

import styles from "./FeaturedListingCard.module.css";

interface ListingCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  city: string;
  swapValue: number;
  lookingFor: string;
  rating?: number;
}

export default function ListingCard({
  title,
  imageUrl,
  city,
  swapValue,
  lookingFor,
  rating,
}: ListingCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={imageUrl || "/images/placeholder.png"}
          alt={title}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 50vw, 300px"
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.infoRow}>
          <MapPin size={14} />
          <span>{city}</span>
        </div>

        <div className={styles.infoRow}>
          <Banknote size={14} />
          <span>₱{swapValue.toLocaleString()}</span>
        </div>

        <p className={styles.lookingFor}>
          Looking for: <strong>{lookingFor}</strong>
        </p>

        {rating !== undefined && (
          <div className={styles.rating}>
            <Star size={14} fill="currentColor" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </article>
  );
}