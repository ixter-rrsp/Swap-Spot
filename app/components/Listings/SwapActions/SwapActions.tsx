"use client";

import styles from "./SwapActions.module.css";

interface SwapActionsProps {
  onRequestSwap?: () => void;
  onChat?: () => void;
}

export default function SwapActions({
  onRequestSwap,
  onChat,
}: SwapActionsProps) {
  return (
    <section className={styles.container}>
      <button
        className={styles.primaryButton}
        onClick={onRequestSwap}
      >
        Request Swap
      </button>

      <button
        className={styles.secondaryButton}
        onClick={onChat}
      >
        Chat Owner
      </button>
    </section>
  );
}