"use client";

import { CircleMarker } from "react-leaflet";
import { useUserLocation } from "@/lib/hooks/useUserLocation";

// Shows the user's current location as a native Leaflet layer,
// so it pans/zooms smoothly with the map instead of lagging behind.
export default function UserLocationMarker() {
  const location = useUserLocation();

  if (!location) return null;

  return (
    <CircleMarker
      center={[location.latitude, location.longitude]}
      radius={8}
      pathOptions={{
        color: "white",
        weight: 3,
        fillColor: "#4285F4",
        fillOpacity: 1,
      }}
    />
  );
}