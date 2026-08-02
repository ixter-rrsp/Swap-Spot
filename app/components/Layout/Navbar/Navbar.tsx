"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import {
  House,
  Compass,
  User,
  Bell,
  Repeat,
  Recycle,
} from "lucide-react";

import styles from "./Navbar.module.css";

const navItems = [
  {
    href: "/home",
    icon: House,
  },
  {
    href: "/discover",
    icon: Compass,
  },
  {
    href: "/notifications",
    icon: Bell,
  },
  {
    href: "/profile",
    icon: User,
  },
];

interface NavbarProps {
  unreadCount?: number;
  onNotificationClick?: () => void;
}

// Drag tuning — mirrors the spec's suggested thresholds.
const CLOSE_THRESHOLD = 90; // px dragged down (from open) to snap closed
const DEAD_ZONE = 90; // px of upward drag before anything moves at all — harder to trigger by accident
const RUBBER_BAND_RATIO = 0.5; // dampening applied past the dead zone — harder to drag all the way open
const FULL_OPEN_EPSILON = 2; // px tolerance to count as "fully open" at release
const DRAG_ENGAGE_DISTANCE = 8; // px of movement before we commit to "this is a drag"
const FALLBACK_FOOTER_HEIGHT = 220; // used until the real footer is measured

export default function Navbar({
  unreadCount = 0,
  onNotificationClick,
}: NavbarProps) {

  const pathname = usePathname();

  // Only these two states exist — no partial resting states.
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const footerHeightRef = useRef(FALLBACK_FOOTER_HEIGHT);

  // Drag bookkeeping lives entirely in refs so dragging never triggers
  // a re-render — only the final open/closed transition does.
  const pointerIdRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const openAtDragStartRef = useRef(false);
  const currentTranslateRef = useRef(FALLBACK_FOOTER_HEIGHT);

  const [isDraggingUI, setIsDraggingUI] = useState(false);

  const restingTransform = useCallback((isOpen: boolean) => {
    // Closed: shifted down by the footer's height, tucking it below the
    // viewport. Open: shifted back up to 0, revealing the footer where
    // the navbar used to sit.
    return isOpen ? 0 : footerHeightRef.current;
  }, []);

  const applyTransform = useCallback((y: number) => {
    currentTranslateRef.current = y;
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translateY(${y}px)`;
    }
  }, []);

  // Measure the footer's real height so the closed position always
  // tucks it exactly out of view, regardless of content/viewport size.
  useLayoutEffect(() => {
    const measure = () => {
      if (footerRef.current) {
        footerHeightRef.current = footerRef.current.offsetHeight || FALLBACK_FOOTER_HEIGHT;
        if (!isDraggingRef.current) {
          applyTransform(restingTransform(open));
        }
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (footerRef.current) observer.observe(footerRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the resting transform in sync whenever `open` changes.
  useEffect(() => {
    if (!isDraggingRef.current) {
      applyTransform(restingTransform(open));
    }
  }, [open, applyTransform, restingTransform]);

  const setDraggingClass = (dragging: boolean) => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.toggle(styles.dragging, dragging);
    }
    setIsDraggingUI(dragging);
  };

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only the primary pointer/finger initiates a drag.
    if (e.button !== undefined && e.button !== 0) return;

    pointerIdRef.current = e.pointerId;
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    isDraggingRef.current = false;
    openAtDragStartRef.current = open;
  }, [open]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === null || pointerIdRef.current !== e.pointerId) return;

    const dy = e.clientY - startYRef.current; // negative = moved up
    const dx = e.clientX - startXRef.current;

    if (!isDraggingRef.current) {
      // Don't commit to a drag until the movement is clearly intentional
      // and predominantly vertical — this is what keeps normal taps
      // (link navigation) and horizontal gestures unaffected, so normal
      // use of the navbar never accidentally triggers the easter egg.
      const distance = Math.hypot(dx, dy);
      if (distance < DRAG_ENGAGE_DISTANCE || Math.abs(dy) < Math.abs(dx)) {
        return;
      }
      isDraggingRef.current = true;
      setDraggingClass(true);
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture isn't critical — ignore if unsupported.
      }
    }

    e.preventDefault();

    const footerHeight = footerHeightRef.current;

    if (!openAtDragStartRef.current) {
      // Closed → dragging upward reveals the footer.
      const upward = Math.max(0, -dy);

      let translate = footerHeight;
      if (upward > DEAD_ZONE) {
        const eased = (upward - DEAD_ZONE) * RUBBER_BAND_RATIO;
        translate = Math.max(0, footerHeight - eased);
      }
      applyTransform(translate);
    } else {
      // Open → dragging downward tucks the footer back away.
      const downward = Math.max(0, dy);
      const translate = Math.min(footerHeight, downward * RUBBER_BAND_RATIO);
      applyTransform(translate);
    }
  }, [applyTransform]);

  const finishDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === null || pointerIdRef.current !== e.pointerId) return;

    const wasDragging = isDraggingRef.current;
    pointerIdRef.current = null;
    isDraggingRef.current = false;
    setDraggingClass(false);

    if (!wasDragging) {
      applyTransform(restingTransform(open));
      return;
    }

    const dy = e.clientY - startYRef.current;

    if (!openAtDragStartRef.current) {
      // No snapping open on a partial drag — the footer only opens if
      // the user actually pulled it all the way to fully revealed.
      // Anything short of that springs back closed.
      const isNowOpen = currentTranslateRef.current <= FULL_OPEN_EPSILON;
      applyTransform(restingTransform(isNowOpen));
      setOpen(isNowOpen);
    } else {
      const downward = Math.max(0, dy);
      const isNowOpen = !(downward > CLOSE_THRESHOLD);
      applyTransform(restingTransform(isNowOpen));
      setOpen(isNowOpen);
    }
  }, [applyTransform, restingTransform]);

  const handlePointerCancel = useCallback(() => {
    pointerIdRef.current = null;
    isDraggingRef.current = false;
    setDraggingClass(false);
    applyTransform(restingTransform(open));
  }, [open, applyTransform, restingTransform]);

  return (
    <div
      ref={wrapperRef}
      className={styles.navWrapper}
      style={{ transform: `translateY(${FALLBACK_FOOTER_HEIGHT}px)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={handlePointerCancel}
    >
      <div
        className={`${styles.dragHandle} ${isDraggingUI ? styles.active : ""}`}
        aria-hidden="true"
      />

      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.active : ""
                  }`}
              >
                <div className={styles.iconWrapper}>
                  <Icon size={22} strokeWidth={2} />

                  {item.href === "/notifications" &&
                    unreadCount > 0 && (
                      <span className={styles.badge}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                </div>
              </Link>
            );
          })}

          {/* Spacer for Floating Button */}
          <div className={styles.centerSpacer} />

          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.active : ""
                  }`}
                onClick={item.href === "/notifications" ? onNotificationClick : undefined}
              >
                <div className={styles.iconWrapper}>
                  <Icon size={22} strokeWidth={2} />

                  {item.href === "/notifications" &&
                    unreadCount > 0 && (
                      <span className={styles.badge}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/post"
          className={styles.postButton}
          aria-label="Create new listing"
        >
          <span className={`${styles.postButtonIcon} ${open ? styles.flipped : ""}`}>
            <Repeat size={32} strokeWidth={2.5} />
          </span>
        </Link>
      </nav>

      <div className={styles.hiddenFooter} ref={footerRef} aria-hidden="true">
        <p className={styles.footerBrand}>SwapSpot</p>
        <p className={styles.footerTagline}>Your Spot to Swap.</p>
        <p className={styles.footerDescription}>
          <Recycle size={14}/>Give great items a second life through trusted bartering.
        </p>

        <p className={styles.footerMeta}>Version 1.0.0</p>

        <p className={styles.footerCredit}>
          Created by <strong>Team SwapSpot</strong>
        </p>

        <p className={styles.footerQuote}>
          &ldquo;Every great swap starts with a conversation.&rdquo;
        </p>
      </div>
    </div>
  );
} 