"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import styles from "./ListingActions.module.css";

interface ListingActionsProps {
  listingId: string;
}

export default function ListingActions({ listingId }: ListingActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete listing.");
      }

      router.refresh();
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className={styles.container}>
      <Link
        href={`/Listing/${listingId}/edit`}
        className={styles.edit}
        onMouseDown={() => setIsPressing(true)}
        onMouseUp={() => setIsPressing(false)}
        onMouseLeave={() => setIsPressing(false)}
      >
        <Pencil 
          size={16} 
          className={`${styles.icon} ${isPressing ? styles.pressed : ''}`}
        />
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
          className={`${styles.icon} ${isPressing ? styles.pressed : ''}`}
        />
      </button>
    </div>
  );
}