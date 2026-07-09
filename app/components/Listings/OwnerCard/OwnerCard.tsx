import styles from "./OwnerCard.module.css";

interface OwnerCardProps {
  name: string;
  rating: number;
  avatarUrl?: string;
}

export default function OwnerCard({
  name,
  rating,
  avatarUrl,
}: OwnerCardProps) {
  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>Owner</h2>

      <div className={styles.card}>
        <div className={styles.avatar}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className={styles.image}
            />
          ) : (
            <span>{name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className={styles.info}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.rating}>Rating: {rating.toFixed(1)}</p>
        </div>
      </div>
    </section>
  );
}