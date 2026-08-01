"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Calendar,
  Eye,
  EyeOff,
  AtSign,
} from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { FaGoogle } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import TextField from "@/app/components/UI/TextField/TextField";
import LocationPrompt from "@/app/components/Auth/LocationPrompt/LocationPrompt";
import { signInWithGoogle, signUp, saveUserLocation } from "@/lib/services/AuthService";
import { signupSchema, SignupFormData } from "@/lib/validations/SignupSchema";
import { getDeviceFingerprintHash } from "@/lib/utils/fingerprint";
import { useToast } from "@/app/components/UI/Toast/ToastContext";
import styles from "./SignupForm.module.css";
import Spinner from "@/app/components/UI/Spinner/Spinner";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

type Step = "form" | "location" | "done";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");

  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    if (!turnstileToken) {
      toast("Please complete the security check.", "error");
      return;
    }

    setLoading(true);

    try {
      const fingerprintHash = await getDeviceFingerprintHash();
      if (!fingerprintHash) {
        toast(
          "Could not generate device fingerprint. Please ensure browser extensions are not blocking scripts.",
          "error"
        );
        return;
      }

      await signUp(data, fingerprintHash, turnstileToken);
      setStep("location");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Something went wrong.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLocationAccepted(coords: {
    latitude: number;
    longitude: number;
    city: string;
  }) {
    try {
      await saveUserLocation(coords.latitude, coords.longitude, coords.city);
    } catch {
      // Non-fatal — location save failure should not block signup completion
    }
    setStep("done");
    toast(
      "Account created! Please check your email to verify your account.",
      "success"
    );
  }

  function handleLocationSkipped() {
    setStep("done");
    toast(
      "Account created! Please check your email to verify your account.",
      "success"
    );
  }

  if (step === "done") {
    return (
      <div className={styles.doneState}>
        <p className={styles.doneText}>
          ✅ Account created! Check your inbox for a verification email, then{" "}
          <Link href="/login">sign in</Link>.
        </p>
      </div>
    );
  }

  return (
    <>
      {step === "location" && (
        <LocationPrompt
          onAccept={handleLocationAccepted}
          onSkip={handleLocationSkipped}
        />
      )}

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          label="Full Name"
          id="signup-fullname"
          placeholder="Enter your full name"
          icon={User}
          disabled={loading}
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <TextField
          label="Username"
          id="signup-username"
          placeholder="e.g. jane_swaps"
          icon={AtSign}
          disabled={loading}
          error={errors.username?.message}
          {...register("username")}
        />

        <TextField
          label="Birthday"
          id="signup-dob"
          type="date"
          icon={Calendar}
          disabled={loading}
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />

        <TextField
          label="Email"
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
          disabled={loading}
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          label="Password"
          id="signup-password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 chars, upper, lower, number"
          icon={Lock}
          disabled={loading}
          rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          rightIconLabel={showPassword ? "Hide password" : "Show password"}
          error={errors.password?.message}
          {...register("password")}
        />

        <TextField
          label="Confirm Password"
          id="signup-confirm-password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your password"
          icon={Lock}
          disabled={loading}
          rightIcon={
            showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />
          }
          onRightIconClick={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          rightIconLabel={
            showConfirmPassword ? "Hide password" : "Show password"
          }
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div style={{ margin: "12px 0", display: "flex", justifyContent: "center" }}>
          <Turnstile
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>

        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading || !turnstileToken}
        >
          {loading ? (
            <>
              <Spinner size={18} />
              <span>Please wait…</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className={styles.divider}>
        <span>OR Continue with</span>
      </div>

      <div className={styles.socialButtons}>
        <button
          type="button"
          className={styles.socialButton}
          onClick={signInWithGoogle}
          disabled={loading}
          aria-label="Continue with Google"
        >
          <FaGoogle />
        </button>
      </div>

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link href="/login">Log in</Link>
      </p>
    </>
  );
}