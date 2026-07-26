"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { Listing } from "@/lib/types/Listing";

interface FitBoundsProps {
  listings: Listing[];
}

// Automatically zooms/pans so all listing pins are visible on load.
export default function FitBounds({ listings }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    const validListings = listings.filter(
      (listing) =>
        listing.showOnMap !== false &&
        listing.landmarkLatitude != null &&
        listing.landmarkLongitude != null
    );
    if (validListings.length === 0) return;

    const bounds = L.latLngBounds(
      validListings.map((listing) => [
        listing.landmarkLatitude!,
        listing.landmarkLongitude!,
      ] as [number, number])
    );

    const applyBounds = () => {
      map.invalidateSize({ animate: false });
      requestAnimationFrame(() => {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      });
    };

    map.whenReady(applyBounds);
    const timeoutId = window.setTimeout(applyBounds, 250);

    return () => window.clearTimeout(timeoutId);
  }, [listings, map]);

  return null;
}