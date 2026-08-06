"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/app/components/UI/Toast/ToastContext";
import TextField from "@/app/components/UI/TextField/TextField";
import Spinner from "@/app/components/UI/Spinner/Spinner";
import { requestPasswordReset } from "@/lib/services/AuthService";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/lib/validations/ForgotPasswordSchema";

import styles from "./ForgotPasswordForm.module.css";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true);

    try {
      await requestPasswordReset(data.email);
      setSentTo(data.email);
      setSent(true);
    } catch (error) {
      // Never reveal whether an email is registered — always show the
      // same success state, but still surface genuine failures (rate
      // limiting, network errors) so the user isn't left guessing.
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      const lower = message.toLowerCase();

      if (lower.includes("rate limit") || lower.includes("too many")) {
        toast("Too many attempts. Please wait a few minutes and try again.", "error");
      } else if (lower.includes("network") || lower.includes("fetch")) {
        toast("Network error. Please check your connection and try again.", "error");
      } else {
        // Any other error (including "user not found", if Supabase ever
        // returns one) still resolves to the same reassuring success
        // state client-side.
        setSentTo(data.email);
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className={styles.form}>
        <div className={styles.header}>
          <div className={styles.title}>Check your email</div>
          <p>
            If an account exists for <strong>{sentTo}</strong>, we&apos;ve sent
            a link to reset your password. It may take a minute to arrive —
            don&apos;t forget to check spam.
          </p>
        </div>

        <p className={styles.footer}>
          <Link href="/login">Back to Sign In</Link>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.header}>
        <div className={styles.title}>Forgot Password?</div>
        <p>
          Enter the email address on your account and we&apos;ll send you a
          link to reset your password.
        </p>
      </div>

      <TextField
        id="forgot-password-email"
        icon={Mail}
        type="email"
        placeholder="Email"
        disabled={loading}
        error={errors.email?.message}
        {...register("email")}
      />

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? (
          <>
            <Spinner size={18} />
            <span>Sending...</span>
          </>
        ) : (
          "Send Reset Link"
        )}
      </button>

      <p className={styles.footer}>
        Remembered your password? <Link href="/login">Sign In</Link>
      </p>
    </form>
  );
}