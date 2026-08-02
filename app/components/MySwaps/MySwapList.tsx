import React from "react";
import BackButton from "@/app/components/UI/BackButton/BackButton";
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
        <div className={styles.titleRow}>
          <BackButton href="/profile" variant="inline" />
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div className={styles.headerContent}>
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