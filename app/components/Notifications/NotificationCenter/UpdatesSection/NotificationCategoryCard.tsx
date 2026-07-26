"use client";

import { Notification, NotificationCategorySummary } from "@/lib/types/Notification";
import NotificationList from "@/app/components/Notifications/NotificationList/NotificationList";
import { Repeat, FileText, BadgeCheck, XCircle, MessageCircle } from "lucide-react";

import styles from "./NotificationCategoryCard.module.css";

interface NotificationCategoryCardProps {
  summary: NotificationCategorySummary;
  selected: boolean;
  onClick: () => void;
  notifications: Notification[] | null;
  isLoading: boolean;
  error: string | null;
}

export default function NotificationCategoryCard({
  summary,
  selected,
  onClick,
  notifications,
  isLoading,
  error,
}: NotificationCategoryCardProps) {

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "requests":
        return <Repeat size={24} strokeWidth={1.5} />;
      case "agreements":
        return <FileText size={24} strokeWidth={1.5} />;
      case "completed":
        return <BadgeCheck size={24} strokeWidth={1.5} />;
      case "cancelled":
        return <XCircle size={24} strokeWidth={1.5} />;
      case "messages":
        return <MessageCircle size={24} strokeWidth={1.5} />;
      default:
        return <FileText size={24} strokeWidth={1.5} />;
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.row} ${selected ? styles.selected : ""}`}
        onClick={onClick}
      >
        <span className={styles.icon}>{getIcon(summary.icon)}</span>

        <div className={styles.textBlock}>
          <h3>{summary.title}</h3>
          <p>{summary.lastActivityLabel}</p>
        </div>

        {summary.unreadCount > 0 && (
          <span className={styles.badge}>{summary.unreadCount}</span>
        )}
      </button>

      {selected ? (
        <div className={styles.expanded}>
          {isLoading ? (
            <p className={styles.statusMessage}>Loading notifications…</p>
          ) : error ? (
            <p className={styles.errorMessage}>{error}</p>
          ) : (
            <NotificationList
              notifications={notifications ?? []}
              compact
            />
          )}
        </div>
      ) : null}
    </div>
  );
}