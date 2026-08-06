"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, ElementType } from "react";
import styles from "./Reveal.module.css";

interface RevealProps {
  children: ReactNode;
  /** Visual style of the reveal animation. */
  variant?: "up" | "fade" | "left" | "right" | "scale";
  /** Delay in ms before the animation starts, once visible. Useful for staggering. */
  delay?: number;
  /** Element/tag to render as. Defaults to div. */
  as?: ElementType;
  className?: string;
  /** Only ever animate in once (default) or re-trigger every time it scrolls into view. */
  once?: boolean;
}

export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  as: Tag = "div",
  className = "",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect users who've asked for less motion — just show content.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${styles[variant]} ${
        visible ? styles.visible : ""
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
