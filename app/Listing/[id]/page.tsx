import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getListingById } from "@/lib/services/ServerListingService";
import {
  hasPendingSwapRequest,
} from "@/lib/services/ServerSwapRequestService";

import { Listing } from "@/lib/types/Listing";

import ListingGallery from "@/app/components/Listings/ListingGallery/ListingGallery";
import ListingInfo from "@/app/components/Listings/ListingInfo/ListingInfo";
import OwnerCard from "@/app/components/Listings/OwnerCard/OwnerCard";
import SwapActions from "@/app/components/Listings/SwapActions/SwapActions";
import BoostReturnHandler from "@/app/components/Listings/BoostReturnHandler/BoostReturnHandler";

import { createClient } from "@/utils/supabase/server";

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


  const supabase = await createClient();


  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();


  const currentUserId = user?.id;



  let listing: Listing;


  try {

    listing = await getListingById(id);


    console.log(
      "DETAIL LISTING:",
      JSON.stringify(listing, null, 2)
    );


    console.log(
      "OWNER DATA:",
      listing.owner
    );


  } catch (error) {

    console.error(
      "GET LISTING ERROR:",
      error
    );


    notFound();

  }



  const pendingRequest =
    await hasPendingSwapRequest(listing.id);



  return (

    <main className={styles.container}>

      <Suspense fallback={null}>
        <BoostReturnHandler listingId={listing.id} />
      </Suspense>


      <ListingGallery
        images={listing.images}
        title={listing.title}
        boosted={listing.boosted}
      />



      <ListingInfo
        title={listing.title}
        location={listing.nearbyLandmark ? `Near ${listing.nearbyLandmark}` : listing.city}
        swapValue={listing.swapValue}
        lookingFor={listing.lookingFor}
        description={listing.description}
        category={listing.category}
        condition={listing.condition}
      />



      <OwnerCard
        owner={listing.owner}
      />



      {
        listing.owner.id !== currentUserId && (
          <SwapActions
            requestedListingId={listing.id}
            hasPendingRequest={pendingRequest}
            isAuthenticated={!!currentUserId}
          />
        )
      }


    </main>

  );
}