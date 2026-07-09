import { Search, SlidersHorizontal } from "lucide-react";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  return (
    <section className={styles.container} aria-label="Search items">
      <div className={styles.searchBox}>
        <Search
          className={styles.searchIcon}
          size={20}
          aria-hidden="true"
        />

        <input
          type="search"
          placeholder="Search items to swap..."
          className={styles.input}
          aria-label="Search items"
        />

        <button
          type="button"
          className={styles.filterButton}
          aria-label="Filter search"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>
    </section>
  );
}