import Link from "next/link";
import Image from "next/image";

import {
  Heart,
  MapPin,
  Banknote,
  Navigation,
} from "lucide-react";

import ListingActions from "../ListingActions/ListingActions";
import { getConditionLabel } from "@/lib/constants/categories";

import styles from "./ListingCard.module.css";


interface ListingCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  city: string;
  swapValue: number;
  lookingFor: string;
  condition?: string;
  rating?: number;
  boosted?: boolean;
  boostExpiresAt?: string | null;

  distance?: number;
  nearbyLandmark?: string | null;

  showActions?: boolean;
}


// Distance is only ever populated for nearby listings (see
// getNearbyListings), so its presence is what distinguishes a nearby
// card from a regular one — regular listings never carry a distance.
function getNearbyDistanceLabel(distance: number): string {
  if (Number.isNaN(distance)) {
    return "Distance unavailable";
  }

  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    return `${meters}m away`;
  }

  return `${distance.toFixed(1)}km away`;
}


export default function ListingCard({
  id,
  title,
  imageUrl,
  city,
  swapValue,
  condition,
  boosted = false,
  boostExpiresAt = null,
  distance,
  showActions = false,
}: ListingCardProps)
 {
  const isNearby = distance !== undefined;

  return (
    <article
      className={`${styles.card} ${boosted ? styles.boosted : ""}`}
    >

      <Link href={`/Listing/${id}`}>

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
            type="button"
          >
            <Heart size={18} />
          </button>


          {boosted && (
            <span className={styles.boostBadge}>
              Boosted
            </span>
          )}

          {condition && (
            <span className={styles.conditionBadge}>
              {getConditionLabel(condition)}
            </span>
          )}

        </div>


        <div className={styles.content}>

          <h3 className={styles.title}>
            {title}
          </h3>


          {isNearby ? (
            <div className={styles.info}>
              <Navigation size={16} />
              <span>
                {getNearbyDistanceLabel(distance!)}
              </span>
            </div>
          ) : (
            <div className={styles.info}>
              <MapPin size={16} />
              <span>
                Location: {city}
              </span>
            </div>
          )}


          <div className={styles.info}>
            <Banknote size={16} />
            <span>
              {swapValue.toLocaleString()}
            </span>
          </div>

        </div>

      </Link>


      {showActions && (
        <ListingActions
          listingId={id}
          boosted={boosted}
          boostExpiresAt={boostExpiresAt}
        />
      )}

    </article>
  );
}