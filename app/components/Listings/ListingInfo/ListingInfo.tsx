import styles from "./ListingInfo.module.css";

interface ListingInfoProps {
  title: string;
  location: string;
  swapValue: number;
  lookingFor: string;
  description: string;
  rating?: number;
}

export default function ListingInfo({
  title,
  location,
  swapValue,
  lookingFor,
  description,
  rating,
}: ListingInfoProps) {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.meta}>
        <span>{location}</span>

        {rating && (
          <span>⭐ {rating.toFixed(1)}</span>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.heading}>Swap Value</h2>
        <p className={styles.value}>
          ₱{swapValue.toLocaleString()}
        </p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.heading}>Looking For</h2>
        <p>{lookingFor}</p>
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