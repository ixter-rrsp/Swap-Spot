"use client";

import { useState } from "react";

import { MapPinned } from "lucide-react";

import styles from "./LocationCard.module.css";

interface LocationCardProps {
  latitude: number | null;
  longitude: number | null;
  city?: string | null;

  onLocationChange: (data: {
    latitude: number;
    longitude: number;
    city: string;
  }) => void;
}

export default function LocationCard({
  latitude,
  longitude,
  city,
  onLocationChange,
}: LocationCardProps) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const hasLocation =
    latitude !== null &&
    longitude !== null;


  async function getCityFromCoordinates(
    latitude: number,
    longitude: number
  ) {
    const response = await fetch(
      "/api/location/reverse",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ??
          "Failed to detect city."
      );
    }

    return data.city as string;
  }


  function handleGetLocation() {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }


    setLoading(true);
    setError("");


    navigator.geolocation.getCurrentPosition(

      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;


          const city =
            await getCityFromCoordinates(
              latitude,
              longitude
            );


          onLocationChange({
            latitude,
            longitude,
            city,
          });

        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to detect location."
          );
        } finally {
          setLoading(false);
        }
      },


      () => {
        setLoading(false);

        setError(
          "Unable to retrieve your location."
        );
      },


      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }


  return (
    <section className={styles.container}>

      <h3 className={styles.title}>
        Location
      </h3>


      <p className={styles.description}>
        Use your current location to
        find nearby swaps.
      </p>


      <div className={styles.status}>

        <MapPinned size={18} />


        <span>
          {city
            ? city
            : hasLocation
            ? "GPS location saved"
            : "Location not set"}
        </span>

      </div>


      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}


      <button
        type="button"
        className={styles.button}
        onClick={handleGetLocation}
        disabled={loading}
      >
        {loading
          ? "Detecting Location..."
          : hasLocation
          ? "Update Location"
          : "Use Current Location"}
      </button>

    </section>
  );
}