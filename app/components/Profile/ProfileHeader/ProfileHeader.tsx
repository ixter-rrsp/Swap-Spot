"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import MenuDrawer from "@/app/components/UI/MenuDrawer";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans";
import MessageUserModal from "@/app/components/Profile/MessageUserModal/MessageUserModal";

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
  // The profile owner's id — conversations are attached to one of
  // their listings, so the Message button opens a picker asking which
  // listing you're messaging about (same pattern as Propose a Swap).
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
  profileUserId,
}: ProfileHeaderProps) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
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