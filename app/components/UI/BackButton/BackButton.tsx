"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import styles from "./BackButton.module.css";

interface BackButtonProps {
  // If provided, navigates to this path via <Link> instead of going back
  // through browser history — useful when a page can be reached from
  // multiple places and should always return to one specific parent
  // (e.g. a detail page opened from a deep link).
  href?: string;

  ariaLabel?: string;

  // Extra class for one-off positioning tweaks on a specific page,
  // appended after the default styles.
  className?: string;

  // "overlay" (default): fixed circular button floating top-left of the
  // viewport, for pages with a full-bleed hero image (e.g. Listing detail).
  // "inline": sits in normal document flow as a plain icon button, for use
  // inside an existing header row (e.g. chat header, next to a name).
  variant?: "overlay" | "inline";
}

export default function BackButton({
  href,
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
      onClick={() => router.back()}
    >
      <ChevronLeft size={22} strokeWidth={2.25} />
    </button>
  );
}