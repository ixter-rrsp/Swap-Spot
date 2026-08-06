"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Listing } from "@/lib/types/Listing";
import ListingPreview from "@/app/components/Discover/ListingPreview/ListingPreview";
import SearchBar from "@/app/components/HomePage/SearchBar/SearchBar";
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const userLocation = useUserLocation();

  const filteredListings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return listings;

    return listings.filter((listing) => {
      return (
        (listing.title && listing.title.toLowerCase().includes(term)) ||
        (listing.city && listing.city.toLowerCase().includes(term)) ||
        (listing.lookingFor && listing.lookingFor.toLowerCase().includes(term)) ||
        (listing.description && listing.description.toLowerCase().includes(term)) ||
        (listing.category && listing.category.toLowerCase().includes(term))
      );
    });
  }, [listings, search]);

  const handleSelectListing = (listing: Listing) => {
    if (userLocation) {
      const targetLat = listing.latitude ?? listing.landmarkLatitude;
      const targetLng = listing.longitude ?? listing.landmarkLongitude;

      if (
        targetLat !== undefined &&
        targetLat !== null &&
        targetLng !== undefined &&
        targetLng !== null
      ) {
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
      <div className={styles.searchOverlay}>
        <SearchBar
          value={search}
          onChange={setSearch}
          className={styles.searchBarOverride}
        />
      </div>

      <DiscoverMap
        listings={filteredListings}
        onSelectListing={handleSelectListing}
        selectedListing={selectedListing}
      />

      {filteredListings.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No Listings Found</h2>
          <p>
            {search.trim()
              ? `No items visible on the map match "${search}".`
              : "There are currently no listings visible on the Discover map."}
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