"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Listing } from "@/lib/types/Listing";
import ListingPreview from "@/app/components/Discover/ListingPreview/ListingPreview";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { haversineDistance } from "@/lib/utils/distance";
import styles from "./client.module.css";

const DiscoverMap = dynamic(
  () => import("@/app/components/Discover/DiscoverMap/DiscoverMap"),
  {
    ssr: false,
    loading: () => <div className={styles.skeletonMap} />,
  }
);

interface DiscoverPageClientProps {
  listings: Listing[];
}

export default function DiscoverPageClient({
  listings,
}: DiscoverPageClientProps) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const userLocation = useUserLocation();

  const handleSelectListing = (listing: Listing) => {
    if (userLocation) {
      const targetLat = listing.latitude ?? listing.landmarkLatitude;
      const targetLng = listing.longitude ?? listing.landmarkLongitude;

      if (targetLat !== undefined && targetLat !== null && targetLng !== undefined && targetLng !== null) {
        const distance = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          targetLat,
          targetLng
        );
        setSelectedListing({ ...listing, distance });
        return;
      }
    }
    
    setSelectedListing(listing);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonMap} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DiscoverMap
        listings={listings}
        onSelectListing={handleSelectListing}
        selectedListing={selectedListing}
      />

      {listings.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No Listings Available</h2>
          <p>
            There are currently no listings visible on the Discover map.
          </p>
        </div>
      ) : null}

      {selectedListing && (
        <ListingPreview
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}