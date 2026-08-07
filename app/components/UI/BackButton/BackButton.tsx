"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import styles from "./BackButton.module.css";

interface BackButtonProps {
  href?: string;
  onBack?: () => void;
  ariaLabel?: string;
  className?: string;
  variant?: "overlay" | "inline";
}

export default function BackButton({
  href,
  onBack,
  ariaLabel = "Go back",
  className,
  variant = "overlay",
}: BackButtonProps) {
  const router = useRouter();

  const variantClass = variant === "inline" ? styles.inline : styles.overlay;

  const combinedClassName = className
    ? `${styles.button} ${variantClass} ${className}`
    : `${styles.button} ${variantClass}`;

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClassName}
        aria-label={ariaLabel}
      >
        <ChevronLeft size={22} strokeWidth={2.25} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={combinedClassName}
      aria-label={ariaLabel}
      onClick={() => {
        if (onBack) {
          onBack();
        } else {
          router.back();
        }
      }}
    >
      <ChevronLeft size={22} strokeWidth={2.25} />
    </button>
  );
}