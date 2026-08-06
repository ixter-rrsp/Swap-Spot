import styles from "./loading.module.css";

/* ─── shimmer keyframes live in globals.css already ────────────────── */

export default function Loading() {
  return (
    <div className={styles.page}>
      {/* ── HomeHeader skeleton ── */}
      <div className={styles.header}>
        <div className={styles.headerTopRow}>
          <div className={styles.headerLogo} />
          <div className={styles.headerAvatarRow}>
            <div className={styles.headerIcon} />
            <div className={styles.headerAvatar} />
          </div>
        </div>
        <div className={styles.headerTagline} />
      </div>

      {/* ── SearchBar skeleton (floats over header) ── */}
      <div className={styles.searchBarWrap}>
        <div className={styles.searchBox}>
          <div className={styles.searchIcon} />
          <div className={styles.searchInput} />
          <div className={styles.filterBtn} />
        </div>
      </div>

      {/* ── CategoryChips skeleton ── */}
      <div className={styles.chipsRow}>
        {[80, 96, 68, 110, 76, 88].map((w, i) => (
          <div key={i} className={styles.chip} style={{ width: w }} />
        ))}
      </div>

      {/* ── BoostedSection skeleton ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle} />
          <div className={styles.sectionLink} />
        </div>
        <div className={styles.carousel}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.boostedCard}>
              <div className={styles.boostedImage} />
              <div className={styles.boostedBody}>
                <div className={styles.boostedBadge} />
                <div className={styles.boostedName} />
                <div className={styles.boostedSub} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Nearby Swaps grid skeleton ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle} />
          <div className={styles.sectionLink} />
        </div>
        <div className={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardImage} />
              <div className={styles.cardBody}>
                <div className={styles.cardTitle} />
                <div className={styles.cardSub} />
                <div className={styles.cardMeta} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Listings grid skeleton ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle} />
        </div>
        <div className={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardImage} />
              <div className={styles.cardBody}>
                <div className={styles.cardTitle} />
                <div className={styles.cardSub} />
                <div className={styles.cardMeta} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}