"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./SwapProposalCard.module.css";
import type { SwapRequestDetail } from "@/lib/types/SwapRequestDetail";
import ConfirmDialog from "@/app/components/UI/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/app/components/UI/Toast/ToastContext";

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
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const toast = useToast();

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
    let cancelled = false;

    async function poll() {
      if (!cancelled) await load();
    }

    poll();

    const intervalId = window.setInterval(poll, 10000);
    const handleFocus = () => void poll();
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [swapRequestId]);

  async function handleAccept() {
    setShowAcceptConfirm(false);
    setActionLoading("accept");
    try {
      const response = await fetch(`/api/swap-requests/${swapRequestId}/accept`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to accept");
      }
      await load();
    } catch (err) {
      console.error(err);
      toast(
        err instanceof Error ? err.message : "Failed to accept swap request.",
        "error"
      );
      // The listing may have just been locked by a competing accept, or
      // this request may no longer be pending — reload to reflect the
      // real current state instead of leaving stale buttons up.
      await load();
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
            onClick={() => setShowAcceptConfirm(true)}
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

      {showAcceptConfirm && (
        <ConfirmDialog
          title="Accept this swap?"
          message="Once you accept, your item will be hidden from other users and unavailable for other swaps unless this one is cancelled."
          confirmLabel="Accept Swap"
          confirmDisabled={actionLoading !== null}
          onConfirm={handleAccept}
          onCancel={() => setShowAcceptConfirm(false)}
        />
      )}
    </div>
  );
}