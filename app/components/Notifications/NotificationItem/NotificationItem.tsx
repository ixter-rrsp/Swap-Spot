"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import styles from "./NotificationItem.module.css";

import { Notification } from "@/lib/types/Notification";

import { markNotificationAsReadAction } from "@/lib/actions/NotificationAction";

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  function getIcon() {
    switch (notification.type) {
      case "swap_request":
        return "🔄";

      case "swap_accepted":
        return "✅";

      case "swap_declined":
        return "❌";

      default:
        return "📢";
    }
  }

  function getRelativeTime(date: string) {
    const now = new Date().getTime();

    const created = new Date(date).getTime();

    const seconds = Math.floor(
      (now - created) / 1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d`;
    }

    return `${Math.floor(days / 7)}w`;
  }

    function handleClick() {
    startTransition(async () => {

        if (!notification.isRead) {
        await markNotificationAsReadAction(
            notification.id
        );
        }


        if (
        notification.type === "swap_request" &&
        notification.referenceId
        ) {

        router.push(
            `/swap-requests/${notification.referenceId}`
        );

        return;

        }


        router.push("/notifications");

    });
    }

  return (
    <article
      className={`${styles.card} ${
        !notification.isRead
          ? styles.unread
          : ""
      }`}
      onClick={handleClick}
    >
      <div className={styles.iconContainer}>
        <span className={styles.icon}>
          {getIcon()}
        </span>

        {!notification.isRead && (
          <span className={styles.dot} />
        )}
      </div>

      <div className={styles.content}>
        <h3>{notification.title}</h3>

        <p>{notification.message}</p>
      </div>

      <span className={styles.time}>
        {isPending
          ? "..."
          : getRelativeTime(
              notification.createdAt
            )}
      </span>
    </article>
  );
}