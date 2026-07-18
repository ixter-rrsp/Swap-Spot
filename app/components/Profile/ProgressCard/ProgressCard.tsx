import styles from "./ProgressCard.module.css";

interface ProgressCardProps {
  completed: number;
  confirmed: number;
}

export default function ProgressCard({
  completed,
  confirmed,
}: ProgressCardProps) {
  const percentage =
    confirmed === 0
      ? 0
      : (completed / confirmed) * 100;

  return (
    <section className={styles.container}>
      <div
        className={styles.progress}
        style={{
          background: `conic-gradient(
            #65a30d ${percentage * 3.6}deg,
            #e5e7eb 0deg
          )`,
        }}
      >
        <div className={styles.inner}>
          <span className={styles.value}>
            {completed}
          </span>

          <span className={styles.total}>
            of {confirmed}
          </span>
        </div>
      </div>

      <div className={styles.info}>
        <h3>Finished Transactions</h3>

        <p>
          Tracked over all confirmed swaps.
        </p>
      </div>
    </section>
  );
}