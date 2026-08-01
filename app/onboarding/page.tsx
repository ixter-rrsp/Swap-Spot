"use client";

import { useRouter } from "next/navigation";
import { saveUserLocation } from "@/lib/services/AuthService";
import LocationPrompt from "@/app/components/Auth/LocationPrompt/LocationPrompt";
import styles from "./page.module.css";

export default function OnboardingPage() {
  const router = useRouter();

  async function handleLocationAccepted(coords: {
    latitude: number;
    longitude: number;
    city: string;
  }) {
    try {
      await saveUserLocation(coords.latitude, coords.longitude, coords.city);
    } catch {
      // Non-fatal — location save failure should not block onboarding
    }
    router.replace("/home");
  }

  function handleLocationSkipped() {
    router.replace("/home");
  }

  return (
    <main className={styles.page}>
      <LocationPrompt
        onAccept={handleLocationAccepted}
        onSkip={handleLocationSkipped}
      />
    </main>
  );
}
