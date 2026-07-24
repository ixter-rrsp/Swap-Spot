import styles from "./RequestStatus.module.css";

interface RequestStatusProps {
  status: string;
}

export default function RequestStatus({
  status,
}: RequestStatusProps) {

  const label =
    status.charAt(0).toUpperCase() +
    status.slice(1);

  return (
    <section className={styles.container}>

      <span
        className={`${styles.badge} ${
          styles[status]
        }`}
      >
        {label}
      </span>

    </section>
  );
}