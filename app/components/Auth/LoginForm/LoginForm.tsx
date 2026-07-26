"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  FaGoogle,
  FaFacebookF,
} from "react-icons/fa6";

import { useToast } from "@/app/components/UI/Toast/ToastContext";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import TextField from "@/app/components/UI/TextField/TextField";
import Spinner from "@/app/components/UI/Spinner/Spinner";

import {
  signIn,
  signInWithGoogle,
} from "@/lib/services/AuthService";

import {
  loginSchema,
  LoginFormData,
} from "@/lib/validations/LoginSchema";

import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);

    try {
      await signIn(data.email, data.password);

      router.replace("/home");
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
        "error"
      );
    } finally {
      setLoading(false);
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
        icon={Mail}
        type="email"
        placeholder="Email"
        disabled={loading}
        error={errors.email?.message}
        {...register("email")}
      />

      <TextField
        icon={Lock}
        type={
          showPassword
            ? "text"
            : "password"
        }
        placeholder="Password"
        disabled={loading}
        error={errors.password?.message}
        rightIcon={
          showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )
        }
        onRightIconClick={() =>
          setShowPassword((prev) => !prev)
        }
        rightIconLabel={
          showPassword
            ? "Hide password"
            : "Show password"
        }
        {...register("password")}
      />

      <div className={styles.forgot}>
        <Link href="/forgot-password">
          Forgot Password?
        </Link>
      </div>

      <button
        className={styles.submitButton}
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner size={18} />
            <span>Please wait...</span>
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

        <button
          type="button"
          className={styles.socialButton}
          aria-label="Continue with Facebook"
          disabled={loading}
        >
          <FaFacebookF />
        </button>
      </div>

      <p className={styles.footer}>
        Don't have an account?{" "}
        <Link href="/signup">
          Sign Up
        </Link>
      </p>
    </form>
  );
}