import Link from "next/link";
import styles from "./ProgressCard.module.css";

interface ProgressCardProps {
  completed: number;
  accepted: number;
  href?: string;
}

export default function ProgressCard({
  completed,
  accepted,
  href = "#",
}: ProgressCardProps) {
  const percentage =
    accepted === 0
      ? 0
      : (completed / accepted) * 100;

  return (
    <Link href={href} className={styles.container}>
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
            of {accepted}
          </span>
        </div>
      </div>

      <div className={styles.info}>
        <h3>Finished Transactions</h3>

        <p>
          Swaps completed out of swaps accepted.
        </p>
      </div>
    </Link>
  );
}