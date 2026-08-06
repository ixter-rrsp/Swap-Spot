"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import styles from "./SwapAgreementCard.module.css";
import type { SwapAgreement } from "@/lib/types/SwapAgreement";

interface SwapAgreementCardProps {
  swapAgreementId: string;
}

const STATUS_LABELS: Record<SwapAgreement["status"], string> = {
  draft: "Draft",
  pending_confirmation: "Awaiting Confirmation",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLES: Record<SwapAgreement["status"], string> = {
  draft: "statusGray",
  pending_confirmation: "statusAmber",
  confirmed: "statusBlue",
  completed: "statusGreen",
  cancelled: "statusRed",
};

function getConfirmationLabel(agreement: SwapAgreement): string | null {
  if (agreement.status !== "pending_confirmation") return null;

  const requesterConfirmed = !!agreement.requesterConfirmedAt;
  const receiverConfirmed = !!agreement.receiverConfirmedAt;

  if (requesterConfirmed && !receiverConfirmed) return "Waiting for Receiver";
  if (receiverConfirmed && !requesterConfirmed) return "Waiting for Requester";
  return "Waiting for Both Parties";
}

function getCompletionLabel(agreement: SwapAgreement): string | null {
  if (agreement.status !== "confirmed") return null;

  const requesterCompleted = !!agreement.requesterCompletedAt;
  const receiverCompleted = !!agreement.receiverCompletedAt;

  if (!requesterCompleted && !receiverCompleted) return null;
  if (requesterCompleted && !receiverCompleted) return "Waiting for Receiver to confirm completion";
  if (receiverCompleted && !requesterCompleted) return "Waiting for Requester to confirm completion";
  return null;
}

export default function SwapAgreementCard({
  swapAgreementId,
}: SwapAgreementCardProps) {
  const [agreement, setAgreement] = useState<SwapAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/swap-agreements/${swapAgreementId}`);
        if (!response.ok) throw new Error("Failed to load");
        const data = await response.json();
        if (!cancelled) setAgreement(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    const intervalId = window.setInterval(() => {
      void load();
    }, 10000);

    const handleFocus = () => {
      void load();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [swapAgreementId]);

  if (loading) {
    return <div className={styles.card}>Loading agreement...</div>;
  }

  if (error || !agreement) {
    return <div className={styles.card}>Unable to load this agreement.</div>;
  }

  const confirmationLabel = getConfirmationLabel(agreement);
  const completionLabel = getCompletionLabel(agreement);

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <p className={styles.heading}>Swap Agreement</p>
        <p className={styles.deliveryMethod}>
          {agreement.deliveryMethod === "meetup" ? "Meet Up" : "Courier"}
        </p>
      </div>

      {agreement.deliveryMethod === "meetup" && (
        <div className={styles.detailsBox}>
          <p className={styles.detailLine}>
            <span className={styles.detailLineInner}>
              <MapPin size={14} className={styles.detailIcon} />
              <span>
                {agreement.meetupLocation}
                {agreement.meetupDate ? ` · ${agreement.meetupDate}` : ""}
                {agreement.meetupTime ? ` · ${agreement.meetupTime}` : ""}
              </span>
            </span>
          </p>
        </div>
      )}

      {agreement.deliveryMethod === "other_courier" && (
        <p className={styles.courierNote}>
          Pickup details will be added once this agreement is confirmed.
        </p>
      )}

      <div className={styles.statusRow}>
        <span className={`${styles.statusBadge} ${styles[STATUS_STYLES[agreement.status]]}`}>
          {STATUS_LABELS[agreement.status]}
        </span>
      </div>

      {confirmationLabel && (
        <p className={styles.subStatus}>{confirmationLabel}</p>
      )}

      {completionLabel && (
        <p className={styles.subStatus}>{completionLabel}</p>
      )}

      <Link
        href={`/agreements/${agreement.id}`}
        className={styles.viewButton}
      >
        View Agreement
      </Link>
    </div>
  );
}
