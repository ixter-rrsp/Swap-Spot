"use client";

import { useMemo, useState } from "react";

import SearchBar from "@/app/components/HomePage/SearchBar/SearchBar";
import ListingGrid from "@/app/components/Listings/ListingGrid/ListingGrid";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

import { Listing } from "@/lib/types/Listing";

interface SavedPageClientProps {
  listings: Listing[];
}

export default function SavedPageClient({ listings }: SavedPageClientProps) {
  const [search, setSearch] = useState("");

  const filteredListings = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) return listings;

    return listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.city.toLowerCase().includes(searchTerm) ||
        listing.lookingFor.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm)
    );
  }, [listings, search]);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />

      <div style={{ padding: "20px" }}>
        <PageHeader title="Saved Listings" subtitle="Items you've saved for later" />
      </div>

      <ListingGrid
        title=""
        listings={filteredListings}
        emptyTitle="No saved listings yet"
        emptyDescription="Tap the heart on any listing to save it here."
      />
    </>
  );
}
