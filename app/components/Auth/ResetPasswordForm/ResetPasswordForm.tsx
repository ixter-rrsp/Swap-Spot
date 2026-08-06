"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/app/components/UI/Toast/ToastContext";
import TextField from "@/app/components/UI/TextField/TextField";
import Spinner from "@/app/components/UI/Spinner/Spinner";
import { updatePassword } from "@/lib/services/AuthService";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/lib/validations/ResetPasswordSchema";
import { createClient } from "@/utils/supabase/client";

import styles from "./ResetPasswordForm.module.css";

type SessionState = "checking" | "ready" | "invalid" | "success";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const supabase = createClient();
    let resolved = false;

    // Two things can bring a user here with a valid recovery attempt,
    // depending on which flow Supabase's email link used:
    // 1. PKCE: a `?code=...` query param we need to exchange ourselves.
    // 2. Implicit/hash flow: supabase-js auto-detects the token in the
    //    URL fragment on load and fires a PASSWORD_RECOVERY auth event.
    // Handle both rather than assuming one.
    const code = searchParams.get("code");

    async function exchangeCode(authCode: string) {
      const { error } = await supabase.auth.exchangeCodeForSession(authCode);
      if (resolved) return;
      resolved = true;

      if (error) {
        setSessionState("invalid");
      } else {
        setSessionState("ready");
      }
    }

    if (code) {
      exchangeCode(code);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && !resolved) {
        resolved = true;
        setSessionState("ready");
      }
    });

    // If neither the code exchange nor the auth event resolves things
    // quickly, the link is most likely missing/expired/already used —
    // don't leave the user staring at a spinner forever.
    const timeoutId = window.setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setSessionState((current) => (current === "checking" ? "invalid" : current));
      }
    }, 4000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeoutId);
    };
  }, [searchParams]);

  async function onSubmit(data: ResetPasswordFormData) {
    setSubmitting(true);

    try {
      await updatePassword(data.password);
      setSessionState("success");
      toast("Password updated successfully.", "success");

      window.setTimeout(() => {
        router.replace("/home");
        router.refresh();
      }, 1500);
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to update password.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sessionState === "checking") {
    return (
      <div className={styles.centered}>
        <Spinner size={24} />
        <p>Verifying your reset link...</p>
      </div>
    );
  }

  if (sessionState === "invalid") {
    return (
      <div className={styles.form}>
        <div className={styles.header}>
          <div className={styles.title}>Link Expired</div>
          <p>
            This password reset link is invalid or has expired. Reset links
            only work once and expire after a while for your security.
          </p>
        </div>

        <Link href="/forgot-password" className={styles.submitButton}>
          Request a New Link
        </Link>

        <p className={styles.footer}>
          <Link href="/login">Back to Sign In</Link>
        </p>
      </div>
    );
  }

  if (sessionState === "success") {
    return (
      <div className={styles.form}>
        <div className={styles.header}>
          <div className={styles.title}>Password Updated</div>
          <p>Taking you to your account...</p>
        </div>
        <div className={styles.centered}>
          <Spinner size={24} />
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.header}>
        <div className={styles.title}>Set a New Password</div>
        <p>Choose a new password for your account.</p>
      </div>

      <TextField
        id="reset-password-password"
        icon={Lock}
        type={showPassword ? "text" : "password"}
        placeholder="New Password"
        disabled={submitting}
        error={errors.password?.message}
        rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        onRightIconClick={() => setShowPassword((prev) => !prev)}
        rightIconLabel={showPassword ? "Hide password" : "Show password"}
        {...register("password")}
      />

      <TextField
        id="reset-password-confirm"
        icon={Lock}
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Confirm New Password"
        disabled={submitting}
        error={errors.confirmPassword?.message}
        rightIcon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        onRightIconClick={() => setShowConfirmPassword((prev) => !prev)}
        rightIconLabel={showConfirmPassword ? "Hide password" : "Show password"}
        {...register("confirmPassword")}
      />

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner size={18} />
            <span>Updating...</span>
          </>
        ) : (
          "Update Password"
        )}
      </button>
    </form>
  );
}