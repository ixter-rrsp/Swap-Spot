"use client";

import { useMemo, useState } from "react";

import SearchBar from "@/app/components/HomePage/SearchBar/SearchBar";
import ListingGrid from "@/app/components/Listings/ListingGrid/ListingGrid";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

import { Listing } from "@/lib/types/Listing";

interface NearbyPageClientProps {
  listings: Listing[];
}

export default function NearbyPageClient({
  listings,
}: NearbyPageClientProps) {
  const [search, setSearch] = useState("");

  const filteredListings = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return listings;
    }

    return listings.filter((listing) => {
      return (
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.city.toLowerCase().includes(searchTerm) ||
        listing.lookingFor.toLowerCase().includes(searchTerm)
      );
    });
  }, [listings, search]);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />

      <div style={{ padding: "20px" }}>
        <PageHeader title="Nearby Swaps" subtitle="Discover items available near your location." />
      </div>

      <ListingGrid
        title=""
        listings={filteredListings}
        emptyTitle="No nearby swaps found"
        emptyDescription="Try increasing your swap radius or check again later."
      />
    </>
  );
}
