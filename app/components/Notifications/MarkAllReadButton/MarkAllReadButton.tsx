"use client";

import { useTransition } from "react";

import { markAllNotificationsAsReadAction } from "@/lib/actions/NotificationAction";

import styles from "./MarkAllReadButton.module.css";

export default function MarkAllReadButton() {
  const [isPending, startTransition] =
    useTransition();

  return (
    <button
      className={styles.button}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markAllNotificationsAsReadAction();
        })
      }
    >
      {isPending
        ? "Marking..."
        : "Mark all read"}
    </button>
  );
}