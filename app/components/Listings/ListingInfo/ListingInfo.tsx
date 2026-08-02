import styles from "./ListingInfo.module.css";
import { getCategoryLabel, getConditionLabel } from "@/lib/constants/categories";

interface ListingInfoProps {
  title: string;
  location: string;
  swapValue: number;
  lookingFor: string;
  description: string;
  category?: string;
  condition?: string;
  rating?: number;
}

export default function ListingInfo({
  title,
  location,
  swapValue,
  lookingFor,
  description,
  category,
  condition,
  rating,
}: ListingInfoProps) {

  const lookingForTags = lookingFor
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);


  return (
    <section className={styles.container}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{title}</h2>

        <p className={styles.value}>
          {swapValue.toLocaleString()}
        </p>
      </div>

      <div className={styles.meta}>
        <span className={styles.location}>
          <PinIcon />
          {location}
        </span>

        {(category || condition) && (
          <span className={styles.ratingBadge}>
            {[getCategoryLabel(category), getConditionLabel(condition)]
              .filter(Boolean)
              .join(" · ")}
          </span>
        )}

        {rating && (
          <span className={styles.ratingBadge}>
            <StarIcon />
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.heading}>Looking For</h2>

        <div className={styles.tags}>
          {lookingForTags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.heading}>Description</h2>
        <p className={styles.description}>
          {description}
        </p>
      </div>
    </section>
  );
}


function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22s7-6.6 7-12A7 7 0 0 0 5 10c0 5.4 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}


function StarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.9l-6.1 3.1 1.5-6.8-5.2-4.7 6.9-.7L12 2.5Z" />
    </svg>
  );
}