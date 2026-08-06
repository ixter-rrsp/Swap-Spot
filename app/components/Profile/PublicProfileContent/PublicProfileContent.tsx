"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ListingGrid from "../../Listings/ListingGrid/ListingGrid";
import Spinner from "@/app/components/UI/Spinner/Spinner";
import type { Listing } from "@/lib/types/Listing";
import type { ReviewSummary } from "@/lib/types/Review";
import styles from "./PublicProfileContent.module.css";

interface PublicProfileContentProps {
  ownerId: string;
  initialListings: Listing[];
  initialHasMore: boolean;
  totalListingsCount: number;
  reviewsCount: number;
}

export default function PublicProfileContent({
  ownerId,
  initialListings,
  initialHasMore,
  totalListingsCount,
  reviewsCount,
}: PublicProfileContentProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");

  // Listings state
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(initialListings.length);

  // Reviews — lazy loaded on tab click
  const [reviews, setReviews] = useState<ReviewSummary[] | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [fetchedReviews, setFetchedReviews] = useState(false);

  // Load more listings (6 at a time)
  async function handleViewMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/listings/by-owner/${ownerId}?offset=${offset}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.listings)) {
          setListings((prev) => [...prev, ...data.listings]);
          setOffset((prev) => prev + data.listings.length);
          setHasMore(data.hasMore);
        }
      }
    } catch {
      // keep existing listings on error
    } finally {
      setLoadingMore(false);
    }
  }

  // Lazy-load reviews on tab open
  useEffect(() => {
    if (activeTab !== "reviews" || fetchedReviews) return;

    let active = true;
    setLoadingReviews(true);

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?userId=${ownerId}`);
        if (res.ok && active) {
          const data = await res.json();
          setReviews(Array.isArray(data) ? data : []);
          setFetchedReviews(true);
        }
      } catch {
        if (active) setReviews([]);
      } finally {
        if (active) setLoadingReviews(false);
      }
    }

    fetchReviews();
    return () => {
      active = false;
    };
  }, [activeTab, fetchedReviews, ownerId]);

  return (
    <div className={styles.wrapper}>
      {/* Tab switcher */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={activeTab === "listings" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("listings")}
        >
          Listings ({totalListingsCount})
        </button>
        <button
          type="button"
          className={activeTab === "reviews" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews ({reviewsCount})
        </button>
      </div>

      {/* Listings tab */}
      {activeTab === "listings" && (
        <>
          {listings.length === 0 ? (
            <p className={styles.empty}>No listings yet.</p>
          ) : (
            <ListingGrid title="" listings={listings} />
          )}

          {hasMore && (
            <div className={styles.viewMoreRow}>
              <button
                type="button"
                className={styles.viewMoreBtn}
                onClick={handleViewMore}
                disabled={loadingMore}
              >
                {loadingMore ? <Spinner size={16} /> : null}
                {loadingMore ? "Loading…" : "View More"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div className={styles.reviewsSection}>
          {loadingReviews && (
            <div className={styles.spinnerRow}>
              <Spinner size={28} />
            </div>
          )}

          {!loadingReviews && reviews !== null && reviews.length === 0 && (
            <p className={styles.empty}>No reviews yet.</p>
          )}

          {!loadingReviews && reviews !== null && reviews.length > 0 && (
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
                          className={i < review.rating ? styles.starFilled : styles.starEmpty}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className={styles.comment}>{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
