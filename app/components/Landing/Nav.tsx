"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "./Landing.module.css";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "why", label: "Why SwapSpot" },
  { id: "how-it-works", label: "How It Works" },
  { id: "faq", label: "FAQ" },
];

export default function Nav() {
  const [activeId, setActiveId] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el
    );

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the entry that's most visible right now, rather than just
        // reacting to the first one that crosses the threshold — this is
        // what keeps the highlight accurate while scrolling fast.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  function scrollToSection(id: string) {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.navInner}>
        <a
          href="#hero"
          className={styles.navLogo}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("hero");
          }}
        >
          Swap<span>Spot</span>
        </a>

        <ul className={styles.navLinks}>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                className={`${styles.navLinkButton} ${
                  activeId === section.id ? styles.navLinkActive : ""
                }`}
                aria-current={activeId === section.id ? "true" : undefined}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLoginLink}>
            Log In
          </Link>
          <Link href="/signup" className={styles.navSignupLink}>
            Sign Up
          </Link>

          <button
            type="button"
            className={styles.navMenuButton}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`${styles.navMobilePanel} ${styles.navMobilePanelOpen}`}>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.navLinkButton} ${
                activeId === section.id ? styles.navLinkActive : ""
              }`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </button>
          ))}
          <Link href="/login" className={styles.navLoginLink} onClick={() => setMobileOpen(false)}>
            Log In
          </Link>
        </div>
      )}
    </nav>
  );
}
