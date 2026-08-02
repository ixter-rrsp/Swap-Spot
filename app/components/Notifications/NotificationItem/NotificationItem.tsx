"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import styles from "./NotificationItem.module.css";

import { Notification } from "@/lib/types/Notification";
import { MessageSquare, Repeat, CheckCircle2, XCircle, Bell } from "lucide-react";

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
        return <Repeat size={20} color="#059669" />;

      case "swap_accepted":
        return <CheckCircle2 size={20} color="#16a34a" />;

      case "swap_declined":
        return <XCircle size={20} color="#dc2626" />;

      default:
        return <Bell size={20} color="#d97706" />;
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
        await markNotificationAsReadAction(notification.id);
      }

      if (notification.referenceId) {
        if (notification.type === "new_message") {
          router.push(`/messages/${notification.referenceId}`);
          return;
        }

        if (notification.type === "swap_request") {
          router.push(`/swap-requests/${notification.referenceId}`);
          return;
        }

        if (
          notification.type === "swap_accepted" ||
          notification.type === "swap_declined" ||
          notification.type === "swap_cancelled"
        ) {
          router.push(`/swap-requests/${notification.referenceId}`);
          return;
        }

        if (
          notification.type === "agreement_created" ||
          notification.type === "agreement_confirmed" ||
          notification.type === "agreement_completed" ||
          notification.type === "agreement_cancelled"
        ) {
          router.push(`/agreements/${notification.referenceId}`);
          return;
        }

        if (
          notification.type === "delivery_info_needed" ||
          notification.type === "delivery_ready_to_book" ||
          notification.type === "delivery_booked"
        ) {
          router.push(`/agreements/${notification.referenceId}/delivery`);
          return;
        }
      }

      router.push("/notifications");
    });
  }

  return (
    <article
      className={styles.card}
      onClick={handleClick}
    >
      <div className={styles.iconContainer}>
        <span className={styles.icon}>
          {getIcon()}
        </span>
      </div>

      <div className={styles.content}>
        <h3>{notification.title}</h3>

        <p>{notification.message}</p>
      </div>

      <div className={styles.meta}>
        <span className={styles.time}>
          {isPending
            ? "..."
            : getRelativeTime(
              notification.createdAt
            )}
        </span>

        {!notification.isRead && (
          <span className={styles.dot} />
        )}
      </div>
    </article>
  );
}