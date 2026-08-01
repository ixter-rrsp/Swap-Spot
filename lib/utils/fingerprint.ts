import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpPromise: Promise<import("@fingerprintjs/fingerprintjs").Agent> | null = null;

/**
 * Generates a browser fingerprint using FingerprintJS Community
 * and hashes it client-side with SHA-256 before returning.
 * The raw fingerprint is never returned or stored.
 */
export async function getDeviceFingerprintHash(): Promise<string> {
  if (typeof window === "undefined") return "";

  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    const fp = await fpPromise;
    const result = await fp.get();
    const rawFingerprint = result.visitorId;

    // SHA-256 hash the fingerprint client-side
    const encoder = new TextEncoder();
    const data = encoder.encode(rawFingerprint);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (err) {
    console.error("Failed to generate device fingerprint hash:", err);
    return "";
  }
}
