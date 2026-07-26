import React from "react";
import Link from "next/link";
import styles from "./MySwapList.module.css";

interface MySwapListProps {
  title: string;
  emptyMessage: string;
  children: React.ReactNode;
  isEmpty: boolean;
}

export default function MySwapList({ title, emptyMessage, children, isEmpty }: MySwapListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/profile" className={styles.backButton}>
          ← Back to Dashboard
        </Link>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>
            Keep track of the latest status and next step for each swap in one place.
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className={styles.emptyState}>{emptyMessage}</div>
      ) : (
        <div className={styles.list}>{children}</div>
      )}
    </div>
  );
}
