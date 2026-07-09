"use client";

import { useState } from "react";
import styles from "./CategoryChips.module.css";

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Books",
  "Sports",
  "Toys",
  "Vehicles",
];

export default function CategoryChips() {
  const [selected, setSelected] = useState("All");

  return (
    <section className={styles.container} aria-label="Categories">
      <div className={styles.scroll}>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`${styles.chip} ${
              selected === category ? styles.active : ""
            }`}
            onClick={() => setSelected(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}