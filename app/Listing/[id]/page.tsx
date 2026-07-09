import { notFound } from "next/navigation";

import listings from "@/lib/mock/listings";

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

  const listing = listings.find((listing) => listing.id === id);

  if (!listing) {
    notFound();
  }

  return (
    <main className={styles.container}>
      <ListingGallery
        imageUrl={listing.imageUrl}
        title={listing.title}
      />

      <ListingInfo
        title={listing.title}
        location={listing.location}
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