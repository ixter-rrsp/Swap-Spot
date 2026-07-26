"use client";

import { useMemo, useState } from "react";

import SearchBar from "@/app/components/HomePage/SearchBar/SearchBar";
import ListingGrid from "@/app/components/Listings/ListingGrid/ListingGrid";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

import { Listing } from "@/lib/types/Listing";

interface ListingsPageClientProps {
  listings: Listing[];
}

export default function ListingsPageClient({
  listings,
}: ListingsPageClientProps) {
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
        <PageHeader title="All Listings" subtitle="Browse all available swaps" />
      </div>

      <ListingGrid
        title=""
        listings={filteredListings}
        emptyTitle="No listings found"
        emptyDescription="Try searching with different keywords or check back later."
      />
    </>
  );
}
