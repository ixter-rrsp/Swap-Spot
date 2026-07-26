"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./SwapProposalCard.module.css";
import type { SwapRequestDetail } from "@/lib/types/SwapRequestDetail";

interface SwapProposalCardProps {
  swapRequestId: string;
  currentUserId: string;
}

export default function SwapProposalCard({
  swapRequestId,
  currentUserId,
}: SwapProposalCardProps) {
  const [detail, setDetail] = useState<SwapRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState<"accept" | "decline" | null>(null);

  async function load() {
    try {
      const response = await fetch(`/api/swap-requests/${swapRequestId}`);
      if (!response.ok) throw new Error("Failed to load");
      const data = await response.json();
      setDetail(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [swapRequestId]);

  async function handleAccept() {
    setActionLoading("accept");
    try {
      const response = await fetch(`/api/swap-requests/${swapRequestId}/accept`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to accept");
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline() {
    setActionLoading("decline");
    try {
      const response = await fetch(`/api/swap-requests/${swapRequestId}/decline`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to decline");
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <div className={styles.card}>Loading proposal...</div>;
  }

  if (error || !detail) {
    return <div className={styles.card}>Unable to load this proposal.</div>;
  }

  // Whoever received the request is the one who can act on it.
  const isReceiver = currentUserId === detail.receiver.id;
  const isPending = detail.status === "pending";

  return (
    <div className={styles.card}>
      <p className={styles.heading}>SWAP PROPOSAL</p>

      <div className={styles.items}>
        <div className={styles.item}>
          {detail.offeredListing.imageUrl && (
            <Image
              src={detail.offeredListing.imageUrl}
              alt={detail.offeredListing.title}
              width={56}
              height={56}
              className={styles.image}
            />
          )}
          <p className={styles.itemTitle}>{detail.offeredListing.title}</p>
        </div>

        <div className={styles.item}>
          {detail.requestedListing.imageUrl && (
            <Image
              src={detail.requestedListing.imageUrl}
              alt={detail.requestedListing.title}
              width={56}
              height={56}
              className={styles.image}
            />
          )}
          <p className={styles.itemTitle}>{detail.requestedListing.title}</p>
        </div>
      </div>

      {isPending && isReceiver ? (
        <div className={styles.actions}>
          <button
            className={styles.declineButton}
            onClick={handleDecline}
            disabled={actionLoading !== null}
          >
            {actionLoading === "decline" ? "Declining..." : "Decline"}
          </button>
          <button
            className={styles.acceptButton}
            onClick={handleAccept}
            disabled={actionLoading !== null}
          >
            {actionLoading === "accept" ? "Accepting..." : "Accept"}
          </button>
        </div>
      ) : (
        <Link href={`/swap-requests/${detail.id}`} className={styles.viewButton}>
          {detail.status === "pending" ? "Waiting for response" : `View Proposal (${detail.status})`}
        </Link>
      )}
    </div>
  );
}