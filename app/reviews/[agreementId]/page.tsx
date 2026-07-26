"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { submitReviewAction } from "@/lib/actions/reviewActions";
import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function ReviewFormPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = Array.isArray(params.agreementId) ? params.agreementId[0] : params.agreementId;

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!agreementId) {
    return <div className={styles.container}>Invalid Agreement ID</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await submitReviewAction(agreementId as string, rating, comment);

    if (result.success) {
      router.push("/profile");
    } else {
      setError(result.error || "Failed to submit review");
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.formCard}>
        <PageHeader title="Rate Your Experience" subtitle="How was your swap?" />

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.ratingGroup}>
            <label className={styles.label}>Overall Rating</label>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={star <= rating ? styles.starActive : styles.starInactive}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="comment" className={styles.label}>Comment (Optional)</label>
            <textarea
              id="comment"
              className={styles.textarea}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your swap experience..."
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </main>
  );
}
