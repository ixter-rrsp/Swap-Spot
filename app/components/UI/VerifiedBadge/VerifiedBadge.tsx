import { BadgeCheck } from "lucide-react";

import styles from "./VerifiedBadge.module.css";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

/**
 * Small inline "verified" indicator shown next to a user's name anywhere
 * their identity is displayed (profile page, owner card, chat header,
 * conversation list, swap request users, etc). Purely presentational —
 * callers decide whether to render it based on profile.isVerified /
 * owner.isVerified / otherUser.isVerified.
 */
export default function VerifiedBadge({
  size = 16,
  className,
}: VerifiedBadgeProps) {
  return (
    <BadgeCheck
      size={size}
      className={
        className ? `${styles.badge} ${className}` : styles.badge
      }
      aria-label="Verified account"
      role="img"
    >
      <title>Verified account</title>
    </BadgeCheck>
  );
}
