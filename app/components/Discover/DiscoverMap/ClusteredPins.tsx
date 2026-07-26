"use client";

import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Listing } from "@/lib/types/Listing";
import { buildPinIcon } from "./PinIcon";

interface ClusteredPinsProps {
  listings: Listing[];
  selectedListing: Listing | null;
  onSelectListing: (listing: Listing) => void;
}

export default function ClusteredPins({
  listings,
  selectedListing,
  onSelectListing,
}: ClusteredPinsProps) {
  const validListings = listings.filter(
    (listing) =>
      listing.showOnMap !== false &&
      listing.landmarkLatitude != null &&
      listing.landmarkLongitude != null
  );

  return (
    <MarkerClusterGroup
      chunkedLoading
      showCoverageOnHover={false}
      maxClusterRadius={50}
    >
      {validListings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.landmarkLatitude!, listing.landmarkLongitude!]}
          icon={buildPinIcon(listing, selectedListing?.id === listing.id)}
          eventHandlers={{
            click: () => {
              console.log("Pin clicked:", listing.id, listing.title);
              onSelectListing(listing);
            },
          }}
        />
      ))}
    </MarkerClusterGroup>
  );
}