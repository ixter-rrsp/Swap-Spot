"use client";

import styles from "./NotificationList.module.css";

import NotificationItem from "../NotificationItem/NotificationItem";

import { Notification } from "@/lib/types/Notification";

interface NotificationListProps {
  notifications: Notification[];
}

export default function NotificationList({
  notifications,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <section className={styles.empty}>
        <span className={styles.icon}>
          🔔
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