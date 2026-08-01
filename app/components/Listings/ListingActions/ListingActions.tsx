"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Rocket, Satellite } from "lucide-react";
import { useToast } from "@/app/components/UI/Toast/ToastContext";
import {
  BOOST_OPTIONS,
  BoostDuration,
  BoostOption,
} from "@/lib/pricing/boost";
import styles from "./ListingActions.module.css";

interface ListingActionsProps {
  listingId: string;
  boosted?: boolean;
  boostExpiresAt?: string | null;
}

export default function ListingActions({
  listingId,
  boosted = false,
  boostExpiresAt = null,
}: ListingActionsProps) {
  const router = useRouter();
  const toast = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [showBoostPicker, setShowBoostPicker] = useState(false);
  const [boostDuration, setBoostDuration] = useState<BoostDuration>(3);
  const [isBoosting, setIsBoosting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete listing.");
      }

      router.refresh();
    } catch (error) {
      console.error("DELETE ERROR:", error);

      toast(
        error instanceof Error ? error.message : "Something went wrong.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleBoost() {
    if (isBoosting) return;

    setIsBoosting(true);

    try {
      const response = await fetch(`/api/listings/${listingId}/boost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          durationDays: boostDuration,
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || "Failed to start boost checkout.");
      }

      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error("BOOST ERROR:", error);

      toast(
        error instanceof Error ? error.message : "Something went wrong.",
        "error"
      );

      setIsBoosting(false);
    }
  }

  const boostExpiryLabel =
    boosted && boostExpiresAt
      ? new Date(boostExpiresAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
      : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Link
          href={`/post?edit=${listingId}`}
          className={styles.edit}
          onMouseDown={() => setIsPressing(true)}
          onMouseUp={() => setIsPressing(false)}
          onMouseLeave={() => setIsPressing(false)}
        >
          <Pencil
            size={16}
            className={`${styles.icon} ${isPressing ? styles.pressed : ""}`}
          />
          <span className={styles.tooltip}>Edit listing</span>
        </Link>

        <button
          type="button"
          className={styles.delete}
          onClick={handleDelete}
          disabled={isDeleting}
          onMouseDown={() => setIsPressing(true)}
          onMouseUp={() => setIsPressing(false)}
          onMouseLeave={() => setIsPressing(false)}
        >
          <Trash2
            size={16}
            className={`${styles.icon} ${isPressing ? styles.pressed : ""}`}
          />
          <span className={styles.tooltip}>Delete listing</span>
        </button>

        {boosted ? (
          <span className={styles.boostedStatus}>
            <Satellite
              size={16}
              strokeWidth={2.2}
              className={styles.icon}
            />

            <span className={styles.tooltip}>
              {boostExpiryLabel
                ? `Boosted until ${boostExpiryLabel}`
                : "Boosted listing"}
            </span>
          </span>
        ) : (
          <button
            type="button"
            className={styles.boost}
            onClick={() => setShowBoostPicker((prev) => !prev)}
            onMouseDown={() => setIsPressing(true)}
            onMouseUp={() => setIsPressing(false)}
            onMouseLeave={() => setIsPressing(false)}
          >
            <Rocket
              size={16}
              className={`${styles.icon} ${isPressing ? styles.pressed : ""}`}
            />

            <span className={styles.tooltip}>Boost listing</span>
          </button>
        )}
      </div>

      {!boosted && showBoostPicker && (
        <div className={styles.boostPicker}>
          {(Object.values(BOOST_OPTIONS) as BoostOption[]).map((option) => (
            <label
              key={option.durationDays}
              className={`${styles.boostPickerOption} ${
                boostDuration === option.durationDays
                  ? styles.boostPickerOptionSelected
                  : ""
              }`}
            >
              <input
                type="radio"
                name={`boost-duration-${listingId}`}
                checked={boostDuration === option.durationDays}
                onChange={() => setBoostDuration(option.durationDays)}
              />

              <span>{option.label}</span>

              <strong>₱{option.price}</strong>
            </label>
          ))}

          <button
            type="button"
            className={styles.boostConfirm}
            onClick={handleBoost}
            disabled={isBoosting}
          >
            {isBoosting ? "Redirecting..." : "Boost this listing"}
          </button>
        </div>
      )}
    </div>
  );
}