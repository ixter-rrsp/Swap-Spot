"use client";

import styles from "./NotificationList.module.css";

import NotificationItem from "../NotificationItem/NotificationItem";

import { Notification } from "@/lib/types/Notification";
import { BellOff } from "lucide-react";

interface NotificationListProps {
  notifications: Notification[];
  compact?: boolean;
}

export default function NotificationList({
  notifications,
  compact = false,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <section className={`${styles.empty} ${compact ? styles.compact : ""}`}>
        <span className={styles.icon}>
          <BellOff size={48} strokeWidth={1.5} color="#9ca3af" />
        </span>

        <h2>
          No notifications yet
        </h2>

        <p>
          We'll notify you whenever someone
          sends a swap request or responds to
          one of your requests.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.list}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
        />
      ))}
    </section>
  );
}