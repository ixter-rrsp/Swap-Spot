"use client";

import React from "react";
import { Listing } from "@/lib/types/Listing";
import { MapPin } from "lucide-react";
import styles from "./ListingPin.module.css";

interface ListingPinProps {
  listing: Listing;
  x: number;
  y: number;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ListingPin({
  listing,
  x,
  y,
  isSelected,
  onSelect,
}: ListingPinProps) {
  return (
    <button
      className={`${styles.pin} ${isSelected ? styles.selected : ""}`}
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onSelect}
      title={listing.title}
    >
      <div className={styles.pinOuter}>
        <div className={styles.pinInner}>
          <MapPin size={16} />
        </div>
      </div>

      {listing.imageUrl && (
        <div className={styles.pinImage}>
          <img
            src={listing.imageUrl}
            alt={listing.title}
            loading="lazy"
          />
        </div>
      )}
    </button>
  );
}
