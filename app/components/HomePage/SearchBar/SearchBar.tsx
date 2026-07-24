import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  disabled = false,
}: SearchBarProps) {
  return (
    <section
      className={styles.container}
      aria-label="Search items"
    >
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />

        {value.trim() ? (
          <button
            type="button"
            className={styles.filterButton}
            aria-label="Clear search"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <X size={20} />
          </button>
        ) : (
          <button
            type="button"
            className={styles.filterButton}
            aria-label="Filter search"
            disabled={disabled}
          >
            <SlidersHorizontal size={20} />
          </button>
        )}
      </div>
    </section>
  );
}