"use client";

import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";

interface MapEventsBridgeProps {
  onZoomChange: (zoom: number) => void;
  onMapReady: (zoomIn: () => void, zoomOut: () => void) => void;
}

// Tracks zoom level and exposes zoomIn/zoomOut to the parent via callback.
export default function MapEventsBridge({
  onZoomChange,
  onMapReady,
}: MapEventsBridgeProps) {
  const map = useMap();

  useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  useEffect(() => {
    const invalidate = () => {
      map.invalidateSize({ animate: false });
    };

    const schedule = () => {
      requestAnimationFrame(() => {
        invalidate();
        setTimeout(invalidate, 150);
      });
    };

    schedule();
    window.addEventListener("resize", schedule);

    onMapReady(
      () => {
        if ((map as any).isValid?.()) {
          map.invalidateSize({ animate: false });
          map.zoomIn();
        }
      },
      () => {
        if ((map as any).isValid?.()) {
          map.invalidateSize({ animate: false });
          map.zoomOut();
        }
      }
    );

    return () => {
      window.removeEventListener("resize", schedule);
    };
  }, [map, onMapReady]);

  return null;
}