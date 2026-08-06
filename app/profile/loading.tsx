import styles from "./loading.module.css";

export default function ProfileLoading() {
  return (
    <div className={styles.page}>
      {/* ── ProfileHeader Skeleton ── */}
      <div className={styles.header}>
        <div className={styles.avatar} />
        <div className={styles.name} />
        <div className={styles.subtext} />
        <div className={styles.ratingRow} />
        <div className={styles.badge} />
      </div>

      {/* ── DashboardCards Skeleton ── */}
      <div className={styles.cardsRow}>
        <div className={styles.dashCard} />
        <div className={styles.dashCard} />
      </div>

      {/* ── ProgressCard Skeleton ── */}
      <div className={styles.progressCard}>
        <div className={styles.progressHeader} />
        <div className={styles.progressBar} />
      </div>

      {/* ── OfferSwitcher & Grid Skeleton ── */}
      <div className={styles.tabsRow}>
        <div className={styles.tab} />
        <div className={styles.tab} />
      </div>

      <div className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardImage} />
            <div className={styles.cardBody}>
              <div className={styles.cardTitle} />
              <div className={styles.cardSub} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
