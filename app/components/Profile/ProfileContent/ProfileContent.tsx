"use client";

import { useState, useEffect } from "react";

import OfferSwitcher from "../OffSwitcher/OfferSwitcher";
import ListingGrid from "../../Listings/ListingGrid/ListingGrid";
import Spinner from "@/app/components/UI/Spinner/Spinner";

import { Listing } from "@/lib/types/Listing";

interface ProfileContentProps {
  myOffers: Listing[];
  initialReceivedOffers?: Listing[];
}

export default function ProfileContent({
  myOffers,
  initialReceivedOffers = [],
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<"offers" | "received">("offers");
  const [receivedOffers, setReceivedOffers] = useState<Listing[]>(initialReceivedOffers);
  const [loadingReceived, setLoadingReceived] = useState(false);
  const [hasFetchedReceived, setHasFetchedReceived] = useState(initialReceivedOffers.length > 0);

  useEffect(() => {
    if (activeTab === "received" && !hasFetchedReceived) {
      let active = true;
      setLoadingReceived(true);

      async function fetchReceived() {
        try {
          const res = await fetch("/api/listings/received");
          if (res.ok) {
            const data = await res.json();
            if (active) {
              setReceivedOffers(Array.isArray(data) ? data : []);
              setHasFetchedReceived(true);
            }
          }
        } catch (e) {
          if (active) setReceivedOffers([]);
        } finally {
          if (active) setLoadingReceived(false);
        }
      }

      fetchReceived();

      return () => {
        active = false;
      };
    }
  }, [activeTab, hasFetchedReceived]);

  const listings = activeTab === "offers" ? myOffers : receivedOffers;

  return (
    <>
      <OfferSwitcher active={activeTab} onChange={setActiveTab} />

      {activeTab === "received" && loadingReceived ? (
        <div style={{ padding: "40px 0", display: "flex", justifyContent: "center" }}>
          <Spinner size={28} />
        </div>
      ) : (
        <ListingGrid
          title={activeTab === "offers" ? "My Offers" : "Received Offers"}
          listings={listings}
          showActions={activeTab === "offers"}
          disableFavorite={activeTab === "received"}
        />
      )}
    </>
  );
}