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
      <div className={styles.topBar}>
        <BackButton href="/profile" variant="inline" className={styles.topBarBack} />
        <h1 className={styles.topBarTitle}>{title}</h1>
      </div>

      {isEmpty ? (
        <div className={styles.emptyState}>{emptyMessage}</div>
      ) : (
        <div className={styles.list}>{children}</div>
      )}
    </div>
  );
}
