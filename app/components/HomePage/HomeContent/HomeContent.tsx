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



  const filteredListings =
    useMemo(() => {

      const searchTerm =
        search
          .trim()
          .toLowerCase();


      if (!searchTerm) {

        return listings;

      }


      return listings.filter(
        (listing) => {

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

          );

        }
      );


    }, [
      listings,
      search,
    ]);



  const filteredBoostedListings =
    useMemo(() => {

      const searchTerm =
        search
          .trim()
          .toLowerCase();


      if (!searchTerm) {

        return boostedListings;

      }


      return boostedListings.filter(
        (listing) => {

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

          );

        }
      );


    }, [
      boostedListings,
      search,
    ]);



  return (
    <>

      <SearchBar
        value={search}
        onChange={setSearch}
      />


      <CategoryChips />



      <BoostedSection
        listings={filteredBoostedListings}
      />



    <ListingGrid

      title="Nearby Swaps"

      listings={nearbyListings.slice(0, 6)}

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