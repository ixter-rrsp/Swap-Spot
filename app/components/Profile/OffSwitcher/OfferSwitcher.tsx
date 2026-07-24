"use client";

import styles from "./OfferSwitcher.module.css";

interface OfferSwitcherProps {
  active: "offers" | "received";
  onChange: (
    value: "offers" | "received"
  ) => void;
}

export default function OfferSwitcher({
  active,
  onChange,
}: OfferSwitcherProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${
          active === "offers"
            ? styles.active
            : ""
        }`}
        onClick={() =>
          onChange("offers")
        }
      >
        My Offers
      </button>

      <button
        className={`${styles.button} ${
          active === "received"
            ? styles.active
            : ""
        }`}
        onClick={() =>
          onChange("received")
        }
      >
        Received Offers
      </button>
    </div>
  );
}