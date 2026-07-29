"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import MenuDrawer from "@/app/components/UI/MenuDrawer";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans";

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
  isFollowing?: boolean;
  showActions?: boolean;
  onMessage?: () => void;
  onToggleFollow?: (next: boolean) => void;
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
  isFollowing = false,
  showActions = true,
  onMessage,
  onToggleFollow,
}: ProfileHeaderProps) {

  const [following, setFollowing] = useState(isFollowing);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null | undefined>(avatarUrl ?? null);

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

  const handleFollowClick = () => {
    const next = !following;
    setFollowing(next);
    onToggleFollow?.(next);
  };

  // Listen for optimistic avatar updates
  useEffect(() => {
    setLocalAvatar(avatarUrl ?? null);
  }, [avatarUrl]);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      const detail = custom?.detail;
      if (detail?.avatarUrl) {
        setLocalAvatar(detail.avatarUrl);
      }
    };

    window.addEventListener("swapspot:avatar-updated", handler as EventListener);
    return () => window.removeEventListener("swapspot:avatar-updated", handler as EventListener);
  }, []);


  return (
    <>
    <section className={styles.container} style={{ position: "relative" }}>
      <button
        type="button"
        className={styles.menuButton}
        aria-label="Open menu"
        onClick={() => setMenuOpen(true)}
      >
        <Menu size={22} />
      </button>

      <div className={styles.avatar}>
        {localAvatar ? (
          <img src={localAvatar} alt={username} className={styles.avatarImage} />
        ) : (
          <span>{username.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <h2 className={styles.name}>{username}</h2>

      {badge && (() => {
        // Find the matching plan by badgeName for correct styling
        const matchedPlan = Object.values(SUBSCRIPTION_PLANS).find(
          (p) => p.badgeName.toUpperCase() === badge.toUpperCase()
        );
        return (
          <span
            className={styles.badge}
            style={matchedPlan ? {
              backgroundColor: matchedPlan.badgeBg,
              color: matchedPlan.badgeColor,
            } : undefined}
          >
            {badge}
          </span>
        );
      })()}

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
            onClick={onMessage}
          >
            Message
          </button>

          <button
            type="button"
            className={
              following
                ? styles.followingButton
                : styles.followButton
            }
            onClick={handleFollowClick}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>
      )}

      {bio && (
        <p className={styles.bio}>{bio}</p>
      )}

    </section>
    <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}