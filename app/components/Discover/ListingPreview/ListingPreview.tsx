"use client";

import React from "react";
import Link from "next/link";
import { Listing } from "@/lib/types/Listing";
import { X, MapPin } from "lucide-react";
import styles from "./ListingPreview.module.css";

interface ListingPreviewProps {
  listing: Listing;
  onClose: () => void;
}

export default function ListingPreview({
  listing,
  onClose,
}: ListingPreviewProps) {
  const getApproximateDistance = (distance?: number): string => {
    if (distance === undefined || Number.isNaN(distance)) return "Distance unavailable";
    if (distance < 0.1) return "Less than 100m away";
    return `${distance.toFixed(1)} km away`;
  };

  const getLocationName = (): string => {
    if (listing.nearbyLandmark) {
      return `Near ${listing.nearbyLandmark}`;
    }

    return listing.city ? `Near ${listing.city}` : "Nearby";
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.preview} ${listing.boosted ? styles.previewBoosted : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close preview"
        >
          <X size={24} strokeWidth={2} />
        </button>

        {/* Listing image */}
        {listing.imageUrl && (
          <div className={styles.imageContainer}>
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className={styles.image}
            />
            {listing.boosted && (
              <div className={styles.boostedBadge}>
                ⚡ Boosted
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          {/* Title */}
          <h2 className={styles.title}>
            {listing.title}
          </h2>

          {/* Location info */}
          <div className={styles.locationInfo}>
            <p className={styles.location}>
              <MapPin
                size={14}
                style={{ verticalAlign: "-2px", marginRight: "4px" }}
              />
              {getLocationName()}
            </p>
            <p className={styles.distance}>
              {getApproximateDistance(listing.distance)}
            </p>
          </div>

          {/* Swap value */}
          <div className={styles.swapValue}>
            <span className={styles.label}>
              Swap Value:
            </span>
            <span className={styles.value}>
              {listing.swapValue.toLocaleString()}
            </span>
          </div>

          {/* View Listing button */}
          <Link
            href={`/Listing/${listing.id}`}
            className={styles.viewButton}
            onClick={onClose}
          >
            View Listing
          </Link>

          {/* Description preview */}
          {listing.description && (
            <p className={styles.description}>
              {listing.description.substring(0, 100)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
