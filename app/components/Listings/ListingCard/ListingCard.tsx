"use client";

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
import { useSavedListings } from "@/app/components/Providers/SavedListingsContext";

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
  disableFavorite?: boolean;
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
  disableFavorite = false,
}: ListingCardProps)
 {
  const isNearby = distance !== undefined;
  const { isSaved, toggleSaved } = useSavedListings();
  const saved = isSaved(id);

  function handleFavoriteClick(event: React.MouseEvent<HTMLButtonElement>) {
    // The button lives inside the card's <Link> — stop the click from
    // also triggering navigation to the listing page.
    event.preventDefault();
    event.stopPropagation();
    toggleSaved(id);
  }

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
              loading="lazy"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              No Image
            </div>
          )}


          {!disableFavorite && (
            <button
              className={`${styles.favoriteButton} ${saved ? styles.favoriteButtonSaved : ""}`}
              aria-label={saved ? "Remove from saved" : "Add to saved"}
              aria-pressed={saved}
              type="button"
              onClick={handleFavoriteClick}
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          )}


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


        <div className={`${styles.content} ${boosted ? styles.boostedContent : ""}`}>

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


          <div className={`${styles.info} ${styles.priceInfo}`}>
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