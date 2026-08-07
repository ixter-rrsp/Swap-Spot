import Link from "next/link";

import VerifiedBadge from "@/app/components/UI/VerifiedBadge/VerifiedBadge";

import styles from "./OwnerCard.module.css";

interface OwnerCardProps {
  owner: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string | null;
    rating: number;
    badge?: string;
    isVerified?: boolean;
    city?: string;
  };
}

export default function OwnerCard({
  owner,
}: OwnerCardProps) {

  const displayName =
    owner.username || owner.fullName;

  const subtitle = [owner.city, owner.badge || "Member"]
    .filter(Boolean)
    .join(" · ");

  const hasRating = owner.rating > 0;


  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>
        Owner
      </h2>

      <Link
        href={`/profile/${owner.username}`}
        className={styles.card}
      >

        <div className={styles.avatar}>
          {owner.avatarUrl ? (
            <img
              src={owner.avatarUrl}
              alt={displayName}
              className={styles.image}
            />
          ) : (
            <span>
              {displayName
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
        </div>


        <div className={styles.info}>
          <h3 className={styles.name}>
            {displayName}
            {owner.isVerified && <VerifiedBadge size={15} />}
          </h3>

          {subtitle && (
            <p className={styles.subtitle}>
              {subtitle}
            </p>
          )}

          <p className={styles.rating}>
            <StarIcon filled={hasRating} />
            {hasRating
              ? `${owner.rating.toFixed(1)}`
              : "No ratings yet"}
          </p>

        </div>

        <ChevronIcon />

      </Link>

    </section>
  );
}


function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.chevron}
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinejoin="round"
        d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.9l-6.1 3.1 1.5-6.8-5.2-4.7 6.9-.7L12 2.5Z"
      />
    </svg>
  );
}