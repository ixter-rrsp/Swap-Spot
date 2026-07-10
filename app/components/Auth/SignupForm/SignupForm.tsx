"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/services/AuthService";

import {
  signupSchema,
  SignupFormData,
} from "@/lib/validations/SignupSchema";

import styles from "./SignupForm.module.css";

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

    async function onSubmit(data: SignupFormData) {
    try {
        await signUp(data)

        alert(
        "Account created successfully! Please check your email to verify your account."
        );
    } catch (error) {
        alert(
        error instanceof Error
            ? error.message
            : "Something went wrong."
        );
    }
    }

  return (

    
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
    >
        <div className={styles.field}>
  <label>Full Name</label>

  <input
    type="text"
    placeholder="Juan Dela Cruz"
    {...register("fullName")}
  />

  <p>{errors.fullName?.message}</p>
</div>
<div className={styles.field}>
  <label>Date of Birth</label>

  <input
    type="date"
    {...register("dateOfBirth")}
  />

  <p>{errors.dateOfBirth?.message}</p>
</div>
      <div className={styles.field}>
        <label>Email</label>
        
        <input
          type="email"
          placeholder="you@example.com"
          {...register("email")}
        />

        <p>{errors.email?.message}</p>
      </div>

      <div className={styles.field}>
        <label>Password</label>

        <input
          type="password"
          placeholder="••••••••"
          {...register("password")}
        />

        <p>{errors.password?.message}</p>
      </div>

      <div className={styles.field}>
        <label>Confirm Password</label>

        <input
          type="password"
          placeholder="••••••••"
          {...register("confirmPassword")}
        />

        <p>{errors.confirmPassword?.message}</p>
      </div>

      <button
        className={styles.button}
        type="submit"
      >
        Create Account
      </button>
    </form>
  );
}