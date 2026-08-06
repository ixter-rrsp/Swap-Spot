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
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const userLocation = useUserLocation();

  const filteredListings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return listings.filter((listing) => {
      // Search term filter
      if (term) {
        const matchesSearch =
          (listing.title && listing.title.toLowerCase().includes(term)) ||
          (listing.city && listing.city.toLowerCase().includes(term)) ||
          (listing.lookingFor && listing.lookingFor.toLowerCase().includes(term)) ||
          (listing.description && listing.description.toLowerCase().includes(term)) ||
          (listing.category && listing.category.toLowerCase().includes(term));

        if (!matchesSearch) return false;
      }

      // Date posted filter
      if (dateFilter !== "all" && listing.createdAt) {
        const createdAtTime = new Date(listing.createdAt).getTime();
        if (!Number.isNaN(createdAtTime)) {
          const diffDays = (Date.now() - createdAtTime) / (1000 * 60 * 60 * 24);
          if (dateFilter === "3days" && diffDays > 3) return false;
          if (dateFilter === "7days" && diffDays > 7) return false;
          if (dateFilter === "30days" && diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [listings, search, dateFilter]);

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
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
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
            {search.trim() || dateFilter !== "all"
              ? "No items visible on the map match your selected filters."
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