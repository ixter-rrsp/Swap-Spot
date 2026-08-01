"use client";

import styles from "./CategoryChips.module.css";
import { CATEGORIES } from "@/lib/constants/categories";

interface CategoryChipsProps {
  /** Selected category value, or "all" for no filter. */
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryChips({
  value,
  onChange,
}: CategoryChipsProps) {
  return (
    <section className={styles.container} aria-label="Categories">
      <div className={styles.scroll}>
        <button
          type="button"
          className={`${styles.chip} ${
            value === "all" ? styles.active : ""
          }`}
          onClick={() => onChange("all")}
        >
          All
        </button>

        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            className={`${styles.chip} ${
              value === category.value ? styles.active : ""
            }`}
            onClick={() => onChange(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </section>
  );
}
