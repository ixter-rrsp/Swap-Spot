"use client";

import BackButton from "@/app/components/UI/BackButton/BackButton";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
  align?: "left" | "center";
}

export default function PageHeader({ title, subtitle, action, showBack, align = "left" }: PageHeaderProps) {
  const isCentered = align === "center";

  return (
    <div className={`${styles.header} ${isCentered ? styles.headerCentered : ""}`}>
      {/* Back button — always in flow, never absolute */}
      {showBack && (
        <div className={styles.backButtonWrap}>
          <BackButton variant="inline" className={styles.backButton} />
        </div>
      )}

      <div className={`${styles.copy} ${isCentered ? styles.copyCentered : ""}`}>
        <div className={`${styles.titleRow} ${isCentered ? styles.titleRowCentered : ""}`}>
          <h1 className={styles.title}>{title}</h1>
        </div>

        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>

      {/* Spacer mirrors the back button on the right so title stays centred */}
      {showBack && isCentered && <div className={styles.spacer} aria-hidden="true" />}

      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}