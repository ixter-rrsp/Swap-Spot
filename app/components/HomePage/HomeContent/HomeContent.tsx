"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import styles from "./HomeContent.module.css";

import SearchBar from "../SearchBar/SearchBar";
import CategoryChips from "../CategoryChips/CategoryChips";
import BoostedSection from "../BoostedSection/BoostedSection";

import ListingGrid from "../../Listings/ListingGrid/ListingGrid";
import Spinner from "@/app/components/UI/Spinner/Spinner";

import type { Listing } from "@/lib/types/Listing";

const INITIAL_BATCH_SIZE = 4;
const BATCH_INCREMENT = 4;

interface HomeContentProps {

  listings: Listing[];

  boostedListings: Listing[];

  nearbyListings: Listing[];

}



export default function HomeContent({

  listings,

  boostedListings,

  nearbyListings,

}: HomeContentProps) {


  const router = useRouter();


  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when search or category filter changes
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [search, category]);


  function matchesFilters(listing: Listing, searchTerm: string) {
    const matchesCategory =
      category === "all" || listing.category === category;

    if (!matchesCategory) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    return (

      listing.title
        .toLowerCase()
        .includes(searchTerm)

      ||

      listing.city
        .toLowerCase()
        .includes(searchTerm)

      ||

      listing.lookingFor
        .toLowerCase()
        .includes(searchTerm)

      ||

      listing.description
        .toLowerCase()
        .includes(searchTerm)

    );
  }


  // "Listings" and "Nearby Swaps" are actually filtered — non-matching
  // items are hidden.
  const filteredListings =
    useMemo(() => {

      const searchTerm =
        search
          .trim()
          .toLowerCase();


      return listings.filter(
        (listing) => matchesFilters(listing, searchTerm)
      );


    }, [
      listings,
      search,
      category,
    ]);

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



  const filteredNearbyListings =
    useMemo(() => {

      const searchTerm =
        search
          .trim()
          .toLowerCase();


      return nearbyListings.filter(
        (listing) => matchesFilters(listing, searchTerm)
      );


    }, [
      nearbyListings,
      search,
      category,
    ]);



  // Boosted listings are never hidden by search/category — that's the
  // point of paying to be boosted. If a search or category filter is
  // active, matching listings are just bubbled to the front; everything
  // else stays visible right after them.
  const sortedBoostedListings =
    useMemo(() => {

      const searchTerm =
        search
          .trim()
          .toLowerCase();

      if (!searchTerm && category === "all") {
        return boostedListings;
      }

      return [...boostedListings].sort((a, b) => {
        const aMatches = matchesFilters(a, searchTerm) ? 0 : 1;
        const bMatches = matchesFilters(b, searchTerm) ? 0 : 1;

        return aMatches - bMatches;
      });


    }, [
      boostedListings,
      search,
      category,
    ]);



  return (
    <>

      <SearchBar
        value={search}
        onChange={setSearch}
      />


      <CategoryChips
        value={category}
        onChange={setCategory}
      />



      <BoostedSection
        listings={sortedBoostedListings}
      />



    <ListingGrid

      title="Nearby Swaps"

      listings={filteredNearbyListings.slice(0, 4)}

      actionLabel="See All"

      onActionClick={() =>
        router.push("/nearby")
      }

    />



      <ListingGrid

        title="Listings"

        listings={visibleListings}

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
