"use client";

import { useMemo, useState, useEffect, useRef } from "react";

import SearchBar from "@/app/components/HomePage/SearchBar/SearchBar";
import CategoryChips from "@/app/components/HomePage/CategoryChips/CategoryChips";
import ListingGrid from "@/app/components/Listings/ListingGrid/ListingGrid";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import Spinner from "@/app/components/UI/Spinner/Spinner";

import { Listing } from "@/lib/types/Listing";
import { CONDITIONS } from "@/lib/constants/categories";

import styles from "./client.module.css";

const INITIAL_BATCH_SIZE = 6;
const BATCH_INCREMENT = 6;

interface ListingsPageClientProps {
  listings: Listing[];
}

export default function ListingsPageClient({
  listings,
}: ListingsPageClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [search, category, condition]);

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

  const visibleListings = useMemo(() => {
    return filteredListings.slice(0, visibleCount);
  }, [filteredListings, visibleCount]);

  const hasMore = visibleCount < filteredListings.length;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + BATCH_INCREMENT);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore]);

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
        listings={visibleListings}
        emptyTitle="No listings found"
        emptyDescription="Try searching with different keywords or check back later."
      />

      {hasMore && (
        <div
          ref={sentinelRef}
          style={{
            minHeight: "60px",
            margin: "20px 0 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Spinner size={28} />
          <span style={{ color: "#666", fontSize: "13px", fontWeight: 500 }}>
            Loading more listings...
          </span>
        </div>
      )}
    </>
  );
}
