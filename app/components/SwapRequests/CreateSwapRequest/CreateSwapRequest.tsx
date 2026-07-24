"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CreateSwapRequest.module.css";
import { Listing } from "@/lib/types/Listing";

interface Props {
  requestedListingId: string;
  onClose: () => void;
}

export default function CreateSwapRequest({
  requestedListingId,
  onClose,
}: Props) {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    async function loadListings() {
      try {
        const response = await fetch("/api/listings/my");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setListings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, [router]);

  async function handleSubmit() {
    if (!selectedListing) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/swap-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offeredListingId: selectedListing,
            requestedListingId,
          }),
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send swap request.");
      }

      setSent(true);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to send swap request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button
          className={styles.close}
          onClick={onClose}
        >
          ×
        </button>

        <h2>
          Choose your offer
        </h2>

        {loading ? (
          <p>
            Loading listings...
          </p>
        ) : listings.length === 0 ? (
          <p>
            You have no listings.
          </p>
        ) : (
          <div className={styles.list}>
            {listings.map((listing) => (
              <button
                key={listing.id}
                className={
                  selectedListing === listing.id
                    ? styles.selected
                    : styles.item
                }
                onClick={() =>
                  setSelectedListing(
                    listing.id
                  )
                }
              >
                <strong>
                  {listing.title}
                </strong>
                <span>
                  ₱
                  {listing.swapValue.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}

        <button
        className={styles.submit}
        disabled={
            !selectedListing ||
            submitting ||
            sent
        }
        onClick={handleSubmit}
        >
        {
            sent
            ? "Request Sent ✓"
            : submitting
                ? "Sending..."
                : "Send Request"
        }
        </button>
      </div>
    </div>
  );
}