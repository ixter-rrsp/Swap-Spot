import styles from "./loading.module.css";

export default function NotificationsLoading() {
  return (
    <div className={styles.page}>
      {/* Header skeleton */}
      <div className={styles.header}>
        <div className={styles.title} />
        <div className={styles.tabsRow}>
          <div className={styles.tab} />
          <div className={styles.tab} />
        </div>
      </div>

      {/* Category summaries / notification list skeleton */}
      <div className={styles.list}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.card}>
            <div className={styles.icon} />
            <div className={styles.content}>
              <div className={styles.line1} />
              <div className={styles.line2} />
            </div>
            <div className={styles.badge} />
          </div>
        ))}
      </div>
    </div>
  );
}
