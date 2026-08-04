"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CreateSwapRequest.module.css";
import { Listing } from "@/lib/types/Listing";
import { createSwapRequest } from "@/lib/services/SwapRequestService";
import ConfirmDialog from "@/app/components/UI/ConfirmDialog/ConfirmDialog";

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
  const [error, setError] = useState<string | null>(null);
  const [lockedError, setLockedError] = useState<string | null>(null);

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
        setError("Failed to load your listings.");
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, [router]);

  async function handleSubmit() {
    if (!selectedListing) {
      setError("Please select a listing to offer.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const result = await createSwapRequest(selectedListing, requestedListingId);

      setSent(true);

      if (result?.conversationId) {
        router.push(`/messages/${result.conversationId}`);
        return;
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to send swap request.";
      setSubmitting(false);

      // The listing picker only shows listings that were available when
      // this modal loaded — but the item could get locked into someone
      // else's accepted swap in the moment between then and hitting
      // Send. Surface that specific case as a pop-up instead of the
      // inline error strip, since it's a meaningfully different
      // situation from a generic failure.
      if (message.toLowerCase().includes("accepted swap")) {
        setLockedError(message);
        setSelectedListing("");
        // Re-fetch so the now-locked listing (correctly excluded server
        // side) drops out of the picker instead of staying selectable.
        try {
          const response = await fetch("/api/listings/my");
          const data = await response.json();
          setListings(Array.isArray(data) ? data : []);
        } catch (refreshError) {
          console.error(refreshError);
        }
      } else {
        setError(message);
      }
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

        <h2 className={styles.title}>
          Choose your offer
        </h2>
        <p className={styles.subtitle}>Select the item you want to trade for this listing.</p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {loading ? (
          <p>
            Loading listings...
          </p>
        ) : listings.length === 0 ? (
          <p>
            You have no listings. Please create a listing first before making swap requests.
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
                onClick={() => {
                  setSelectedListing(listing.id);
                  setError(null);
                }}
              >
                <div>
                  <strong>
                    {listing.title}
                  </strong>
                  <p className={styles.itemMeta}>{listing.city || "No location set"}</p>
                </div>
                <span className={styles.itemValue}>
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
            sent ||
            loading
          }
          onClick={handleSubmit}
        >
          {submitting
            ? "Sending..."
            : "Send Request"
          }
        </button>
      </div>

      {lockedError && (
        <ConfirmDialog
          title="Item Unavailable"
          message={lockedError}
          confirmLabel="OK"
          hideCancel
          onConfirm={() => setLockedError(null)}
          onCancel={() => setLockedError(null)}
        />
      )}
    </div>
  );
}