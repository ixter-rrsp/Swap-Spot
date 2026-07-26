"use client";

import { useState, useEffect } from "react";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

// Single shared source of truth for the browser's geolocation,
// so we don't call navigator.geolocation in multiple places.
export function useUserLocation(): UserLocation | null {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation unavailable:", err.message);
      }
    );
  }, []);

  return location;
}