"use client";

import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Listing } from "@/lib/types/Listing";
import MapControls from "../MapControls/MapControls";
import FitBounds from "./FitBound";
import UserLocationMarker from "./UserLocationMarker";
import ClusteredPins from "./ClusteredPins";
import MapEventsBridge from "./MapEventsBridge";
import styles from "./DiscoverMap.module.css";

interface DiscoverMapProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  selectedListing: Listing | null;
}

const MAP_DEFAULT_ZOOM = 13;
const MAP_DEFAULT_CENTER: [number, number] = [14.5994, 120.9842]; // Metro Manila fallback

export default function DiscoverMap({
  listings,
  onSelectListing,
  selectedListing,
}: DiscoverMapProps) {
  const [currentZoom, setCurrentZoom] = useState(MAP_DEFAULT_ZOOM);
  const zoomInRef = React.useRef<() => void>(() => {});
  const zoomOutRef = React.useRef<() => void>(() => {});

  const handleMapReady = useCallback(
    (zoomIn: () => void, zoomOut: () => void) => {
      zoomInRef.current = zoomIn;
      zoomOutRef.current = zoomOut;
    },
    []
  );

  const handleZoom = (direction: "in" | "out") => {
    if (direction === "in") zoomInRef.current();
    else zoomOutRef.current();
  };

  return (
    <div className={styles.container}>
      <MapContainer
        center={MAP_DEFAULT_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        zoomControl={false}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds listings={listings} />
        <MapEventsBridge onZoomChange={setCurrentZoom} onMapReady={handleMapReady} />
        <UserLocationMarker />
        <ClusteredPins
          listings={listings}
          selectedListing={selectedListing}
          onSelectListing={onSelectListing}
        />
      </MapContainer>

      <MapControls zoom={currentZoom} onZoom={handleZoom} />
    </div>
  );
}