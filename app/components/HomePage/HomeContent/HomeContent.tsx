"use client";

import { useMemo, useState, useEffect, useLayoutEffect, useRef } from "react";
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


  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [visibleCount, setVisibleCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("home_scroll_state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.visibleCount === "number" && parsed.visibleCount > 0) {
            return parsed.visibleCount;
          }
        } catch {}
      }
    }
    return INITIAL_BATCH_SIZE;
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const lastScrollYRef = useRef(0);

  // Restore scroll position on initial mount
  useIsomorphicLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const saved = sessionStorage.getItem("home_scroll_state");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed.scrollY === "number" && parsed.scrollY > 0) {
        const targetY = parsed.scrollY;

        const doScroll = () => {
          window.scrollTo({ top: targetY, behavior: "instant" as ScrollBehavior });
        };

        doScroll();

        const t1 = setTimeout(doScroll, 10);
        const t2 = setTimeout(doScroll, 50);
        const t3 = setTimeout(doScroll, 150);
        const t4 = setTimeout(doScroll, 300);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          clearTimeout(t4);
        };
      }
    } catch {}
  }, []);

  // Save scroll position and visibleCount continuously (ignoring 0 scroll during page exit)
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > 0) {
        lastScrollYRef.current = y;
        sessionStorage.setItem(
          "home_scroll_state",
          JSON.stringify({ scrollY: y, visibleCount })
        );
      }
    };

    // Also capture click on any listing link BEFORE Next.js starts scrolling to top
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest("a");
      if (link && window.scrollY > 0) {
        sessionStorage.setItem(
          "home_scroll_state",
          JSON.stringify({ scrollY: window.scrollY, visibleCount })
        );
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick, { capture: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick, { capture: true });
    };
  }, [visibleCount]);

  // Reset visible count when search, category, or date filter changes (after initial mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setVisibleCount(INITIAL_BATCH_SIZE);
    sessionStorage.removeItem("home_scroll_state");
  }, [search, category, dateFilter]);

  function matchesDateFilter(listing: Listing) {
    if (dateFilter === "all") return true;
    if (!listing.createdAt) return true;

    const createdAtTime = new Date(listing.createdAt).getTime();
    if (Number.isNaN(createdAtTime)) return true;

    const now = Date.now();
    const diffDays = (now - createdAtTime) / (1000 * 60 * 60 * 24);

    if (dateFilter === "3days") return diffDays <= 3;
    if (dateFilter === "7days") return diffDays <= 7;
    if (dateFilter === "30days") return diffDays <= 30;

    return true;
  }


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
        (listing) => matchesFilters(listing, searchTerm) && matchesDateFilter(listing)
      );


    }, [
      listings,
      search,
      category,
      dateFilter,
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
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
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
