"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ReviewRequestCard.module.css";
import { Check } from "lucide-react";

interface ReviewRequestCardProps {
  swapAgreementId: string;
}

export default function ReviewRequestCard({
  swapAgreementId,
}: ReviewRequestCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<{
    currentUserReviewed: boolean;
    bothReviewed: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch(`/api/reviews/status?agreementId=${swapAgreementId}`);
        if (!response.ok) throw new Error("Failed to load review status");
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, [swapAgreementId]);

  if (loading) {
    return <div className={styles.card}>Loading review status...</div>;
  }

  if (error || !status) {
    return <div className={styles.card}>Unable to load review status.</div>;
  }

  return (
    <div className={styles.card}>
      <p className={styles.heading}>SWAP COMPLETED</p>
      
      <p className={styles.body}>
        Rate your swap partner to help build a trusted community.
      </p>

      <div className={styles.actions}>
        {status.bothReviewed ? (
          <div className={styles.completedState}>
            Both Reviews Completed <Check size={16} />
          </div>
        ) : status.currentUserReviewed ? (
          <div className={styles.completedState}>
            Review Submitted <Check size={16} />
          </div>
        ) : (
          <Link href={`/reviews/${swapAgreementId}`} className={styles.reviewButton}>
            Leave Review
          </Link>
        )}
      </div>
    </div>
  );
}