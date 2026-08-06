import styles from "./loading.module.css";

export default function DiscoverLoading() {
  return (
    <div className={styles.page}>
      {/* Search bar floating overlay skeleton */}
      <div className={styles.searchBarWrap}>
        <div className={styles.searchBox}>
          <div className={styles.searchIcon} />
          <div className={styles.searchInput} />
          <div className={styles.filterBtn} />
        </div>
      </div>

      {/* Full screen map skeleton */}
      <div className={styles.mapSkeleton} />
    </div>
  );
}
