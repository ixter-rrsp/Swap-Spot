import { ReactNode } from "react";

import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;

  actionLabel?: string;
  onActionClick?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      {icon && (
        <div className={styles.icon}>
          {icon}
        </div>
      )}

      <h3 className={styles.title}>
        {title}
      </h3>

      <p className={styles.description}>
        {description}
      </p>

      {actionLabel && onActionClick && (
        <button
          className={styles.button}
          onClick={onActionClick}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}