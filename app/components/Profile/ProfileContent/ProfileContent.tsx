"use client";

import { useState } from "react";

import OfferSwitcher from "../OffSwitcher/OfferSwitcher";
import ListingGrid from "../../Listings/ListingGrid/ListingGrid";

import { Listing } from "@/lib/types/Listing";


interface ProfileContentProps {
  myOffers: Listing[];
  receivedOffers: Listing[];
}


export default function ProfileContent({
  myOffers,
  receivedOffers,
}: ProfileContentProps) {

  const [activeTab, setActiveTab] =
    useState<"offers" | "received">(
      "offers"
    );


  const listings =
    activeTab === "offers"
      ? myOffers
      : receivedOffers;


  return (
    <>

      <OfferSwitcher
        active={activeTab}
        onChange={setActiveTab}
      />


      <ListingGrid
        title={
          activeTab === "offers"
            ? "My Offers"
            : "Received Offers"
        }
        listings={listings}
        showActions={
          activeTab === "offers"
        }
      />

    </>
  );
}