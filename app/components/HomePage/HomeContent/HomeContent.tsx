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

  nearbyListings: Listing[];

}



export default function HomeContent({

  listings,

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



  const recommendedListings =
    filteredListings.slice(0, 4);



  const newestListings =
    filteredListings.slice(4, 8);



  const boostedListings =
    filteredListings.filter(
      (listing) =>
        listing.boosted
    );



  return (
    <>

      <SearchBar
        value={search}
        onChange={setSearch}
      />


      <CategoryChips />



      <BoostedSection
        listings={boostedListings}
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

        title="Recommended for You"

        listings={recommendedListings}

        actionLabel="See All"

      />



      <ListingGrid

        title="Newest Listings"

        listings={newestListings}

        actionLabel="See All"

      />


    </>
  );
}