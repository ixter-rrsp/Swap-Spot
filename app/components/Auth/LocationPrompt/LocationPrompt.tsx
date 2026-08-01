"use client";

import { useState } from "react";
import { MapPin, CheckCircle, Map, Star } from "lucide-react";
import Spinner from "@/app/components/UI/Spinner/Spinner";
import styles from "./LocationPrompt.module.css";

interface LocationPromptProps {
  onAccept: (coords: { latitude: number; longitude: number; city: string }) => void;
  onSkip: () => void;
}

export default function LocationPrompt({ onAccept, onSkip }: LocationPromptProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleEnable() {
    setLoading(true);
    setStatus("Requesting location permission…");
    setIsError(false);

    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser.");
      setIsError(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatus("Resolving your city…");

        try {
          const res = await fetch("/api/location/city", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await res.json();
          const city: string = res.ok ? (data.city ?? "") : "";

          onAccept({ latitude, longitude, city });
        } catch {
          // Couldn't resolve city but we still have coords — proceed
          onAccept({ latitude, longitude, city: "" });
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setStatus("Location permission was denied. You can enable it later from Edit Profile.");
        } else {
          setStatus("Could not detect your location. You can set it later from Edit Profile.");
        }
        setIsError(true);
        // Auto-skip after 2.5s
        setTimeout(() => onSkip(), 2500);
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <MapPin size={30} />
        </div>

        <h2 className={styles.title}>Enable Location?</h2>
        <p className={styles.subtitle}>
          Sharing your location unlocks a better SwapSpot experience. You can always update this later from Edit Profile.
        </p>

        <ul className={styles.benefits}>
          <li className={styles.benefit}>
            <Map size={16} className={styles.benefitIcon} />
            <span>See nearby listings on the Discovery page.</span>
          </li>
          <li className={styles.benefit}>
            <Star size={16} className={styles.benefitIcon} />
            <span>Get more accurate item recommendations.</span>
          </li>
          <li className={styles.benefit}>
            <CheckCircle size={16} className={styles.benefitIcon} />
            <span>Show listings closest to you first.</span>
          </li>
        </ul>

        <div className={styles.actions}>
          <button
            className={styles.enableBtn}
            onClick={handleEnable}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size={16} />
                <span>Detecting…</span>
              </>
            ) : (
              <>
                <MapPin size={16} />
                <span>Enable Location</span>
              </>
            )}
          </button>

          <button
            className={styles.skipBtn}
            onClick={onSkip}
            disabled={loading}
          >
            Skip for now
          </button>
        </div>

        {status && (
          <p className={`${styles.status} ${isError ? styles.errorStatus : ""}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
