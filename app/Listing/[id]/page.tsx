import { notFound } from "next/navigation";

import { getListingById } from "@/lib/services/ListingService";
import { Listing } from "@/lib/types/Listing";

import ListingGallery from "@/app/components/Listings/ListingGallery/ListingGallery";
import ListingInfo from "@/app/components/Listings/ListingInfo/ListingInfo";
import OwnerCard from "@/app/components/Listings/OwnerCard/OwnerCard";
import SwapActions from "@/app/components/Listings/SwapActions/SwapActions";

import styles from "./page.module.css";

interface ListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ListingPage({
  params,
}: ListingPageProps) {
  const { id } = await params;

  let row;

  try {
    row = await getListingById(id);
  } catch {
    notFound();
  }

  const listing: Listing = {
    id: row.id,
    title: row.title,
    description: row.description,
    city: row.city,
    swapValue: row.swap_value,
    lookingFor: row.looking_for,
    boosted: row.boosted,
    rating: 0,

    owner: {
      id: row.owner_id,
      name: "Unknown User",
      rating: 0,
    },

    imageUrl: row.listing_images?.[0]?.image_url,
  };

  return (
    <main className={styles.container}>
      <ListingGallery
        imageUrl={listing.imageUrl}
        title={listing.title}
      />

      <ListingInfo
        title={listing.title}
        location={listing.city}
        swapValue={listing.swapValue}
        lookingFor={listing.lookingFor}
        description={listing.description}
        rating={listing.rating}
      />

      <OwnerCard
        name={listing.owner.name}
        rating={listing.owner.rating}
      />

      <SwapActions />
    </main>
  );
}