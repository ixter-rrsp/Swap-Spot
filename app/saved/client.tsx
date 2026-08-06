"use client";

import ListingGrid from "@/app/components/Listings/ListingGrid/ListingGrid";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import { Listing } from "@/lib/types/Listing";
import styles from "./page.module.css";

interface SavedPageClientProps {
  listings: Listing[];
}

export default function SavedPageClient({ listings }: SavedPageClientProps) {
  return (
    <>
      <div className={styles.headerWrapper}>
        <PageHeader title="Saved Listings" subtitle="Items you've saved for later." />
      </div>

      <ListingGrid
        title=""
        listings={listings}
        emptyTitle="No saved listings yet"
        emptyDescription="Tap the heart on any listing to save it here."
      />
    </>
  );
}
