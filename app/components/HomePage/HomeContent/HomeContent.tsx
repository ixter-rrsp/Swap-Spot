"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./HomeContent.module.css";

import SearchBar from "../SearchBar/SearchBar";
import CategoryChips from "../CategoryChips/CategoryChips";
import BoostedSection from "../BoostedSection/BoostedSection";

import ListingGrid from "../../Listings/ListingGrid/ListingGrid";

import type { Listing } from "@/lib/types/Listing";


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

      listings={filteredNearbyListings.slice(0, 6)}

      actionLabel="See All"

      onActionClick={() =>
        router.push("/nearby")
      }

    />



      <ListingGrid

        title="Listings"

        listings={filteredListings.slice(0, 8)}

        actionLabel="See All"

        onActionClick={() =>
          router.push("/listings")
        }

      />


    </>
  );
}
