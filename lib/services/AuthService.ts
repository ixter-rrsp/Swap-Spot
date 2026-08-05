import { createClient } from "@/utils/supabase/client";
import { SignupFormData } from "../validations/SignupSchema";
import { getDeviceFingerprintHash } from "@/lib/utils/fingerprint";

const supabase = createClient();

export async function signUp(
  data: SignupFormData,
  fingerprintHash?: string,
  turnstileToken?: string
) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      fingerprintHash,
      turnstileToken,
    }),
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.error || "Signup failed.");
  }

  return resData;
}

export async function signIn(
  email: string,
  password: string,
  fingerprintHash?: string
) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      fingerprintHash,
    }),
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.error || "Sign in failed.");
  }

  return resData;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Sends a fresh signup-verification email. Used when a user signed up
 * with email/password but lost, ignored, or never received the original
 * verification email, and is now blocked from logging in until they
 * verify. Without this, an unverified account has no way back in.
 */
export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function signInWithGoogle() {
  const fingerprintHash = await getDeviceFingerprintHash();

  if (typeof document !== "undefined" && fingerprintHash) {
    document.cookie = `sb-device-fp=${fingerprintHash}; path=/; max-age=300; SameSite=Lax`;
  }

  const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
  if (fingerprintHash) {
    redirectUrl.searchParams.set("device_fp", fingerprintHash);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl.toString(),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Saves latitude, longitude, and city to the authenticated user's profile.
 * Called after optional location grant during signup.
 */
export async function saveUserLocation(
  latitude: number,
  longitude: number,
  city: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ latitude, longitude, city, updated_at: new Date().toISOString() })
    .eq("id", user.id);
}