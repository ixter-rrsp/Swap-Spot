"use client";

import { useState } from "react";

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


  return (
    <section className={styles.container}>

      <div className={styles.avatar}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className={styles.avatarImage}
          />
        ) : (
          <span>{username.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <h2 className={styles.name}>{username}</h2>

      {badge && (
        <span className={styles.badge}>{badge}</span>
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
  );
}