"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}

export default function PageHeader({ title, subtitle, action, showBack }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={styles.header}>
      <div className={styles.copy}>
        {showBack ? (
          <button
            aria-label="Back"
            className={styles.backButton}
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>
        ) : null}

        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
