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
} from "lucide-react";

import {
  FaGoogle,
  FaFacebookF,
} from "react-icons/fa6";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import TextField from "@/app/components/UI/TextField/TextField";

import { signInWithGoogle } from "@/lib/services/AuthService";

import {
  signupSchema,
  SignupFormData,
} from "@/lib/validations/SignupSchema";

import { signUp } from "@/lib/services/AuthService";

import { useToast } from "@/app/components/UI/Toast/ToastContext";

import styles from "./SignupForm.module.css";

import Spinner from "@/app/components/UI/Spinner/Spinner";

export default function SignupForm() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    setLoading(true);

    try {
      await signUp(data);

      toast(
        "Account created successfully! Please check your email to verify your account.",
        "success"
      );
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
    <>
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          label="Full Name"
          placeholder="Enter your full name"
          icon={User}
          disabled={loading}
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <TextField
          label="Birthday"
          type="date"
          icon={Calendar}
          disabled={loading}
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />

        <TextField
          label="Email"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
          disabled={loading}
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          label="Password"
          type={
            showPassword
              ? "text"
              : "password"
          }
          placeholder="Enter your password"
          icon={Lock}
          disabled={loading}
          rightIcon={
            showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )
          }
          onRightIconClick={() =>
            setShowPassword(!showPassword)
          }
          rightIconLabel={
            showPassword
              ? "Hide password"
              : "Show password"
          }
          error={errors.password?.message}
          {...register("password")}
        />

        <TextField
          label="Confirm Password"
          type={
            showConfirmPassword
              ? "text"
              : "password"
          }
          placeholder="Confirm your password"
          icon={Lock}
          disabled={loading}
          rightIcon={
            showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )
          }
          onRightIconClick={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
          rightIconLabel={
            showConfirmPassword
              ? "Hide password"
              : "Show password"
          }
          error={errors.confirmPassword?.message}
          {...register(
            "confirmPassword"
          )}
        />

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
        Already have an account?{" "}
        <Link href="/login">
          Log in
        </Link>
      </p>
    </>
  );
}