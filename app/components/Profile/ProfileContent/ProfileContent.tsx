"use client";

import { useState, useEffect } from "react";

import OfferSwitcher from "../OffSwitcher/OfferSwitcher";
import ListingGrid from "../../Listings/ListingGrid/ListingGrid";
import Spinner from "@/app/components/UI/Spinner/Spinner";

import { Listing } from "@/lib/types/Listing";

const INITIAL_LIMIT = 6;

interface ProfileContentProps {
  myOffers: Listing[];
  initialHasMore?: boolean;
  initialReceivedOffers?: Listing[];
}

export default function ProfileContent({
  myOffers: initialMyOffers,
  initialHasMore = false,
  initialReceivedOffers = [],
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<"offers" | "received">("offers");

  // My Offers — paginated state
  const [myOffers, setMyOffers] = useState<Listing[]>(initialMyOffers);
  const [hasMoreOffers, setHasMoreOffers] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  // offset starts at however many we already have server-side (INITIAL_LIMIT)
  const [offersOffset, setOffersOffset] = useState(initialMyOffers.length);

  // Received Offers — lazy loaded on tab open
  const [receivedOffers, setReceivedOffers] = useState<Listing[]>(initialReceivedOffers);
  const [loadingReceived, setLoadingReceived] = useState(false);
  const [hasFetchedReceived, setHasFetchedReceived] = useState(initialReceivedOffers.length > 0);

  // Load 6 more My Offers starting from the current offset
  async function handleViewMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/listings/my?offset=${offersOffset}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.listings)) {
          setMyOffers((prev) => [...prev, ...data.listings]);
          setOffersOffset((prev) => prev + data.listings.length);
          setHasMoreOffers(data.hasMore);
        }
      }
    } catch {
      // Keep showing the current batch on error
    } finally {
      setLoadingMore(false);
    }
  }

  // Fetch received offers lazily when the tab is first opened
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

      {activeTab === "offers" && hasMoreOffers && (
        <div style={{ display: "flex", justifyContent: "center", padding: "0 0 24px" }}>
          <button
            onClick={handleViewMore}
            disabled={loadingMore}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 28px",
              borderRadius: "999px",
              border: "1.5px solid #2563eb",
              background: "none",
              color: "#2563eb",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loadingMore ? "not-allowed" : "pointer",
              opacity: loadingMore ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loadingMore ? <Spinner size={16} /> : null}
            {loadingMore ? "Loading…" : "View More"}
          </button>
        </div>
      )}
    </>
  );
}