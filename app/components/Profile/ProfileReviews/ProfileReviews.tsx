import Image from "next/image";
import type { ReviewSummary } from "@/lib/types/Review";
import styles from "./ProfileReviews.module.css";

interface ProfileReviewsProps {
  reviews: ReviewSummary[];
}

export default function ProfileReviews({ reviews }: ProfileReviewsProps) {
  if (reviews.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Reviews</h2>
        <div className={styles.emptyState}>No reviews yet.</div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Recent Reviews</h2>
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
                  <p className={styles.reviewerName}>{review.reviewer.fullName || review.reviewer.username}</p>
                  <p className={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString("en-US", { timeZone: "UTC" })}
                  </p>
                </div>
              </div>
              <div className={styles.rating}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < review.rating ? styles.starFilled : styles.starEmpty}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            {review.comment && <p className={styles.comment}>{review.comment}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
