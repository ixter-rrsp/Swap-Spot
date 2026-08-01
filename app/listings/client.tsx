"use client";

import { useMemo, useState } from "react";

import SearchBar from "@/app/components/HomePage/SearchBar/SearchBar";
import CategoryChips from "@/app/components/HomePage/CategoryChips/CategoryChips";
import ListingGrid from "@/app/components/Listings/ListingGrid/ListingGrid";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

import { Listing } from "@/lib/types/Listing";
import { CONDITIONS } from "@/lib/constants/categories";

import styles from "./client.module.css";

interface ListingsPageClientProps {
  listings: Listing[];
}

export default function ListingsPageClient({
  listings,
}: ListingsPageClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");

  const filteredListings = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return listings.filter((listing) => {
      if (category !== "all" && listing.category !== category) {
        return false;
      }

      if (condition !== "all" && listing.condition !== condition) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      return (
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.city.toLowerCase().includes(searchTerm) ||
        listing.lookingFor.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm)
      );
    });
  }, [listings, search, category, condition]);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />

      <CategoryChips value={category} onChange={setCategory} />

      <div style={{ padding: "20px" }}>
        <PageHeader title="All Listings" subtitle="Browse all available swaps" />

        <div className={styles.conditionRow}>
          <label htmlFor="conditionFilter" className={styles.conditionLabel}>
            Condition
          </label>

          <select
            id="conditionFilter"
            className={styles.conditionSelect}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="all">All conditions</option>
            {CONDITIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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
