"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  LoginFormData,
} from "@/lib/validations/LoginSchema";

import { signIn } from "@/lib/services/AuthService";

import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await signIn(data.email, data.password);

      alert("Login successful!");
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

      <button
        className={styles.button}
        type="submit"
      >
        Sign In
      </button>
    </form>
  );
}