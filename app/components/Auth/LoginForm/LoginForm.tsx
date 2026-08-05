"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa6";
import { useToast } from "@/app/components/UI/Toast/ToastContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@/app/components/UI/TextField/TextField";
import Spinner from "@/app/components/UI/Spinner/Spinner";
import { signIn, signInWithGoogle, resendVerificationEmail } from "@/lib/services/AuthService";
import { loginSchema, LoginFormData } from "@/lib/validations/LoginSchema";
import { getDeviceFingerprintHash } from "@/lib/utils/fingerprint";
import styles from "./LoginForm.module.css";

function mapLoginError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return "Incorrect email or password. Please try again.";
  }
  if (m.includes("email not confirmed") || m.includes("verify your email")) {
    return "Your email address has not been verified. Please check your inbox for a verification link.";
  }
  if (m.includes("user not found") || m.includes("account not found")) {
    return "No account found with that email address.";
  }
  if (m.includes("too many") || m.includes("rate limit")) {
    return "Too many login attempts. Please wait a few minutes and try again.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  return message;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [attemptedEmail, setAttemptedEmail] = useState("");

  const toast = useToast();

  useEffect(() => {
    const errorDesc = searchParams.get("error_description");
    if (errorDesc) {
      toast(decodeURIComponent(errorDesc), "error");
    }
  }, [searchParams, toast]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    setNeedsVerification(false);

    try {
      const fingerprintHash = await getDeviceFingerprintHash();
      await signIn(data.email, data.password, fingerprintHash);

      router.replace("/home");
      router.refresh();
    } catch (error) {
      const raw = error instanceof Error ? error.message : "Something went wrong.";
      const mapped = mapLoginError(raw);
      const lower = raw.toLowerCase();

      if (
        lower.includes("invalid login credentials") ||
        lower.includes("invalid email or password")
      ) {
        setError("password", { message: "Incorrect email or password." });
      }

      if (lower.includes("email not confirmed") || lower.includes("verify your email")) {
        setNeedsVerification(true);
        setAttemptedEmail(data.email);
      }

      toast(mapped, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setResending(true);
    try {
      await resendVerificationEmail(attemptedEmail);
      toast("Verification email sent — please check your inbox.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to resend verification email.",
        "error"
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className={styles.header}>
        <div className={styles.title}>Welcome Back!</div>
        <p>Sign in to continue swapping.</p>
      </div>

      <TextField
        id="login-email"
        icon={Mail}
        type="email"
        placeholder="Email"
        disabled={loading}
        error={errors.email?.message}
        {...register("email")}
      />

      <TextField
        id="login-password"
        icon={Lock}
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        disabled={loading}
        error={errors.password?.message}
        rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        onRightIconClick={() => setShowPassword((prev) => !prev)}
        rightIconLabel={showPassword ? "Hide password" : "Show password"}
        {...register("password")}
      />

      <div className={styles.forgot}>
        <Link href="/forgot-password">Forgot Password?</Link>
      </div>

      {needsVerification && (
        <div className={styles.resendVerification}>
          <p>Haven&apos;t received the verification email?</p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      )}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner size={18} />
            <span>Please wait…</span>
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <div className={styles.divider}>
        <span>OR Continue with</span>
      </div>

      <div className={styles.socials}>
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
        Don't have an account?{" "}
        <Link href="/signup">Sign Up</Link>
      </p>
    </form>
  );
}