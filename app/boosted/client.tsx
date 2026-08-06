"use client";

import { useMemo, useState } from "react";

import SearchBar from "@/app/components/HomePage/SearchBar/SearchBar";
import ListingGrid from "@/app/components/Listings/ListingGrid/ListingGrid";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

import { Listing } from "@/lib/types/Listing";
import styles from "./page.module.css";

interface BoostedPageClientProps {
  listings: Listing[];
}

export default function BoostedPageClient({
  listings,
}: BoostedPageClientProps) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredListings = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return listings.filter((listing) => {
      // 1. Search text filter
      if (searchTerm) {
        const matchesSearch =
          (listing.title && listing.title.toLowerCase().includes(searchTerm)) ||
          (listing.city && listing.city.toLowerCase().includes(searchTerm)) ||
          (listing.lookingFor && listing.lookingFor.toLowerCase().includes(searchTerm)) ||
          (listing.description && listing.description.toLowerCase().includes(searchTerm)) ||
          (listing.category && listing.category.toLowerCase().includes(searchTerm));

        if (!matchesSearch) return false;
      }

      // 2. Date posted filter
      if (dateFilter !== "all") {
        if (!listing.createdAt) return false;
        const createdAtTime = new Date(listing.createdAt).getTime();
        if (Number.isNaN(createdAtTime)) return false;

        const diffDays = (Date.now() - createdAtTime) / (1000 * 60 * 60 * 24);
        if (dateFilter === "3days" && diffDays > 3) return false;
        if (dateFilter === "7days" && diffDays > 7) return false;
        if (dateFilter === "30days" && diffDays > 30) return false;
      }

      return true;
    });
  }, [listings, search, dateFilter]);

  return (
    <>
      <SearchBar
        value={search}
        onChange={setSearch}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      <div className={styles.headerWrapper}>
        <PageHeader
          title="Boosted Swaps"
          subtitle="Featured listings boosted by their owners for maximum visibility."
        />
      </div>

      <ListingGrid
        title=""
        listings={filteredListings}
        emptyTitle="No boosted listings found"
        emptyDescription="Try clearing your search filters or check back later."
      />
    </>
  );
}
