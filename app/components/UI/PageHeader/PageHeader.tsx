"use client";

import BackButton from "@/app/components/UI/BackButton/BackButton";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}

export default function PageHeader({ title, subtitle, action, showBack }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.copy}>
        <div className={styles.titleRow}>
          {showBack ? (
            <BackButton variant="inline" className={styles.backButton} />
          ) : null}

          <h1 className={styles.title}>{title}</h1>
        </div>

        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}