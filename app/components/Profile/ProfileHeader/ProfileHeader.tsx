"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Heart } from "lucide-react";
import MenuDrawer from "@/app/components/UI/MenuDrawer";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans";
import MessageUserModal from "@/app/components/Profile/MessageUserModal/MessageUserModal";

import BackButton from "@/app/components/UI/BackButton/BackButton";

import styles from "./ProfileHeader.module.css";

interface ProfileHeaderProps {
  username: string;
  avatarUrl?: string | null;
  city?: string;
  memberSince?: string | number;
  rating?: number;
  reviewsCount?: number;
  swapsCount?: number;
  bio?: string;
  badge?: string;
  showActions?: boolean;
  showBackButton?: boolean;
  profileUserId?: string;
}

export default function ProfileHeader({
  username,
  avatarUrl,
  city,
  memberSince,
  rating,
  reviewsCount,
  swapsCount,
  bio,
  badge,
  showActions = true,
  showBackButton = false,
  profileUserId,
}: ProfileHeaderProps) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null | undefined>(null);
  const localAvatar = avatarUrl ?? optimisticAvatar;

  const memberSinceYear =
    memberSince === undefined
      ? undefined
      : typeof memberSince === "number"
        ? memberSince
        : new Date(memberSince).getFullYear();

  const metaLine = [
    city,
    memberSinceYear && `Member since ${memberSinceYear}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const hasStats =
    typeof rating === "number" ||
    typeof swapsCount === "number";

  // Listen for optimistic avatar updates
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      const detail = custom?.detail;
      if (detail?.avatarUrl) {
        setOptimisticAvatar(detail.avatarUrl);
      }
    };

    window.addEventListener("swapspot:avatar-updated", handler as EventListener);
    return () => window.removeEventListener("swapspot:avatar-updated", handler as EventListener);
  }, []);

  const matchedPlan = badge
    ? Object.values(SUBSCRIPTION_PLANS).find(
        (p) => p.badgeName.toUpperCase() === badge.toUpperCase()
      )
    : undefined;

  // The Free tier gets its own colored-card treatment, themed off the
  // Free plan's own configured badge color (so it stays in sync if that
  // color is ever changed) — every other tier keeps the existing plain
  // white-card look.
  const isFreeTier = matchedPlan?.id === "free";

  return (
    <>
    <section className={styles.container}>
      {showBackButton && (
        <div className={styles.headerBackAction}>
          <BackButton variant="inline" className={styles.backButtonOverride} />
        </div>
      )}

      <div className={styles.headerActions}>
        <Link
          href="/saved"
          className={styles.savedButton}
          aria-label="Saved listings"
        >
          <Heart size={20} />
        </Link>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      <div className={styles.avatar}>
        {localAvatar ? (
          <Image
            src={localAvatar}
            alt={username}
            className={styles.avatarImage}
            width={100}
            height={100}
          />
        ) : (
          <span>
            {username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <h2 className={styles.name}>{username}</h2>

      {badge && (
        <span className={styles.badge}>
          {badge}
        </span>
      )}

      {metaLine && (
        <p className={styles.meta}>{metaLine}</p>
      )}

      {hasStats && (
        <p className={styles.stats}>
          {typeof rating === "number" && (
            <>
              {rating.toFixed(1)}
              {typeof reviewsCount === "number" && (
                <>({reviewsCount} reviews)</>
              )}
            </>
          )}

          {typeof rating === "number" &&
            typeof swapsCount === "number" &&
            " · "}

          {typeof swapsCount === "number" && (
            <>{swapsCount} swaps</>
          )}
        </p>
      )}

      {showActions && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.messageButton}
            onClick={() => setMessageModalOpen(true)}
            disabled={!profileUserId}
          >
            Message
          </button>
        </div>
      )}

      {bio && (
        <p className={styles.bio}>{bio}</p>
      )}

    </section>
    <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

    {messageModalOpen && profileUserId && (
      <MessageUserModal
        profileUserId={profileUserId}
        profileUsername={username}
        onClose={() => setMessageModalOpen(false)}
      />
    )}
    </>
  );
}