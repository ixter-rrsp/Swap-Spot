"use client";

import { useState } from "react";

import ListingGrid from "../../Listings/ListingGrid/ListingGrid";

import { Listing } from "@/lib/types/Listing";

import styles from "./ProfileTabs.module.css";


interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
}


interface ProfileTabsProps {
  listings: Listing[];
  reviews?: Review[];
  reviewsCount?: number;
}


export default function ProfileTabs({
  listings,
  reviews = [],
  reviewsCount,
}: ProfileTabsProps) {

  const [activeTab, setActiveTab] =
    useState<"listing" | "reviews">("listing");

  const resolvedReviewsCount =
    reviewsCount ?? reviews.length;


  return (
    <div className={styles.wrapper}>

      <div className={styles.tabs}>
        <button
          type="button"
          className={
            activeTab === "listing"
              ? styles.activeTab
              : styles.tab
          }
          onClick={() => setActiveTab("listing")}
        >
          Listing ({listings.length})
        </button>

        <button
          type="button"
          className={
            activeTab === "reviews"
              ? styles.activeTab
              : styles.tab
          }
          onClick={() => setActiveTab("reviews")}
        >
          Reviews ({resolvedReviewsCount})
        </button>
      </div>

      {activeTab === "listing" ? (
        <ListingGrid
          title=""
          listings={listings}
        />
      ) : (
        <div className={styles.reviews}>
          {reviews.length === 0 ? (
            <p className={styles.emptyState}>
              No reviews yet.
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className={styles.reviewCard}
              >
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewerName}>
                    {review.reviewerName}
                  </span>

                  <span className={styles.reviewRating}>
                    ⭐ {review.rating.toFixed(1)}
                  </span>
                </div>

                <p className={styles.reviewComment}>
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}