"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ReviewSummary } from "@/lib/types/Review";
import Spinner from "@/app/components/UI/Spinner/Spinner";
import styles from "./ProfileReviews.module.css";

interface ProfileReviewsProps {
  userId: string;
}

export default function ProfileReviews({ userId }: ProfileReviewsProps) {
  const [reviews, setReviews] = useState<ReviewSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || hasEnteredViewport) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasEnteredViewport(true);
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [hasEnteredViewport]);

  useEffect(() => {
    if (!hasEnteredViewport) return;

    let active = true;
    setLoading(true);

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setReviews(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (active) setReviews([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchReviews();

    return () => {
      active = false;
    };
  }, [hasEnteredViewport, userId]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <h2 className={styles.sectionTitle}>Recent Reviews</h2>

      {loading && (
        <div style={{ padding: "20px 0", display: "flex", justifyContent: "center" }}>
          <Spinner size={24} />
        </div>
      )}

      {!loading && reviews !== null && reviews.length === 0 && (
        <div className={styles.emptyState}>No reviews yet.</div>
      )}

      {!loading && reviews !== null && reviews.length > 0 && (
        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  {review.reviewer.avatarUrl ? (
                    <Image
                      src={review.reviewer.avatarUrl}
                      alt={review.reviewer.username}
                      width={40}
                      height={40}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {review.reviewer.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className={styles.reviewerName}>
                      {review.reviewer.fullName || review.reviewer.username}
                    </p>
                    <p className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })}
                    </p>
                  </div>
                </div>
                <div className={styles.rating}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating ? styles.starFilled : styles.starEmpty
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              {review.comment && <p className={styles.comment}>{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
