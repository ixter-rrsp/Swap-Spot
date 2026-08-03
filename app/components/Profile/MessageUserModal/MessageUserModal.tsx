"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./MessageUserModal.module.css";
import { Listing } from "@/lib/types/Listing";

interface MessageUserModalProps {
  profileUserId: string;
  profileUsername: string;
  onClose: () => void;
}

export default function MessageUserModal({
  profileUserId,
  profileUsername,
  onClose,
}: MessageUserModalProps) {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        const response = await fetch(`/api/listings/by-owner/${profileUserId}`);

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setListings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load listings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadListings();

    return () => {
      cancelled = true;
    };
  }, [profileUserId, router]);

  async function handleSubmit() {
    if (!selectedListing) {
      setError("Please select a listing.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: selectedListing }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to start conversation.");
      }

      const conversation = await response.json();
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to start conversation.");
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>

        <h2 className={styles.title}>Message {profileUsername}</h2>
        <p className={styles.subtitle}>
          Which listing are you interested in?
        </p>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <p>Loading listings...</p>
        ) : listings.length === 0 ? (
          <p>{profileUsername} doesn&apos;t have any active listings right now.</p>
        ) : (
          <div className={styles.list}>
            {listings.map((listing) => (
              <button
                key={listing.id}
                className={
                  selectedListing === listing.id ? styles.selected : styles.item
                }
                onClick={() => {
                  setSelectedListing(listing.id);
                  setError(null);
                }}
              >
                <div>
                  <strong>{listing.title}</strong>
                  <p className={styles.itemMeta}>{listing.city || "No location set"}</p>
                </div>
                <span className={styles.itemValue}>
                  {listing.swapValue.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}

        {listings.length > 0 && (
          <button
            className={styles.submit}
            disabled={!selectedListing || submitting || loading}
            onClick={handleSubmit}
          >
            {submitting ? "Starting..." : "Start Conversation"}
          </button>
        )}
      </div>
    </div>
  );
}
