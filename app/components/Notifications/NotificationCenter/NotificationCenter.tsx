"use client";

import { useEffect, useMemo, useState } from "react";

import NotificationList from "@/app/components/Notifications/NotificationList/NotificationList";
import MarkAllReadButton from "@/app/components/Notifications/MarkAllReadButton/MarkAllReadButton";
import UpdatesSection from "./UpdatesSection/UpdatesSection";
import MessagesSection from "./MessagesSection/MessagesSection";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import { createClient } from "@/utils/supabase/client";
import { subscribeChannel } from "@/utils/supabase/channelRegistry";

import { Conversation } from "@/lib/types/Conversation";
import {
  Notification,
  NotificationCategory,
  NotificationCategorySummary,
  getNotificationCategory,
} from "@/lib/types/Notification";

import styles from "./NotificationCenter.module.css";

interface NotificationCenterProps {
  categories: NotificationCategorySummary[];
  conversations: Conversation[];
}

// "Messages" is intentionally excluded here — the conversation list
// already renders below via MessagesSection, so surfacing it again
// as a notification category would just be a redundant duplicate.
function excludeMessagesCategory(
  list: NotificationCategorySummary[]
): NotificationCategorySummary[] {
  return list.filter(
    (summary) => summary.category !== "messages" && summary.icon !== "messages"
  );
}

export default function NotificationCenter({
  categories,
  conversations,
}: NotificationCenterProps) {
  const [categoriesState, setCategoriesState] = useState(
    excludeMessagesCategory(categories)
  );
  const [selectedCategory, setSelectedCategory] =
    useState<NotificationCategory | null>(null);
  const [notifications, setNotifications] =
    useState<Notification[] | null>(null);
  const [categoryCache, setCategoryCache] = useState<
    Partial<Record<NotificationCategory, Notification[]>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    if (categoryCache[selectedCategory]) {
      setNotifications(categoryCache[selectedCategory]!);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    async function loadNotifications() {
      try {
        const response = await fetch(
          `/api/notifications?category=${selectedCategory}`
        );

        if (!response.ok) {
          throw new Error("Failed to load notifications.");
        }

        const data = await response.json();
        const loadedList = Array.isArray(data) ? data : [];

        if (!active) {
          return;
        }

        setCategoryCache((prev) => ({
          ...prev,
          [selectedCategory!]: loadedList,
        }));
        setNotifications(loadedList);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load notifications."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [selectedCategory, categoryCache]);

  function handleCategoryClick(category: NotificationCategory) {
    setSelectedCategory((current) => {
      const nextCategory = current === category ? null : category;

      if (!nextCategory) {
        setNotifications(null);
        setError(null);
        setIsLoading(false);
      } else {
        if (!categoryCache[category]) {
          setIsLoading(true);
        }
        setError(null);

        // optimistic: clear unread for this category locally
        setCategoriesState((prev) =>
          prev.map((s) =>
            s.category === category
              ? { ...s, unreadCount: 0 }
              : s
          )
        );

        // persistently mark notifications of this category as read
        void (async () => {
          try {
            await fetch("/api/notifications/mark-category-read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ category }),
            });
          } catch (e) {
            // ignore — realtime subscription will reconcile
          }
        })();
      }

      return nextCategory;
    });
  }

  // Realtime subscription for notification category updates (per-user)
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    let unsubscribeFn: (() => void) | null = null;

    function relativeLabel(dateStr?: string | null) {
      if (!dateStr) return "No activity";
      const now = Date.now();
      const created = new Date(dateStr).getTime();
      const seconds = Math.floor((now - created) / 1000);
      if (seconds < 60) return "Just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d`;
      return `${Math.floor(days / 7)}w`;
    }

    async function setup() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      const channelName = `notifications:${user.id}`;

      unsubscribeFn = subscribeChannel(
        channelName,
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          // payload contains { eventType, new, old }
          const eventType = payload?.eventType || payload?.event || payload?.type || payload?.eventType;
          const newRow = payload?.new ?? null;
          const oldRow = payload?.old ?? null;

          // determine affected category
          const kind = (newRow?.type ?? oldRow?.type) as string | undefined;
          if (!kind) {
            return;
          }

          const category = getNotificationCategory(kind as any);

          // Skip updates for the messages category entirely — it's
          // intentionally not rendered here.
          if (category === "messages") {
            return;
          }

          setCategoriesState((prev) => {
            return prev.map((s) => {
              if (s.category !== category) return s;

              let unread = s.unreadCount;
              let total = s.totalCount;
              let lastActivityAt = s.lastActivityAt;

              if (eventType === "INSERT") {
                total = (total || 0) + 1;
                if (newRow && !newRow.is_read) unread = (unread || 0) + 1;
                lastActivityAt = newRow?.created_at ?? lastActivityAt;
              } else if (eventType === "UPDATE") {
                // handle read toggles
                if (oldRow && newRow) {
                  if (!oldRow.is_read && newRow.is_read) {
                    unread = Math.max(0, (unread || 0) - 1);
                  } else if (oldRow.is_read && !newRow.is_read) {
                    unread = (unread || 0) + 1;
                  }
                  if (newRow.created_at && (!lastActivityAt || new Date(newRow.created_at).getTime() > new Date(lastActivityAt).getTime())) {
                    lastActivityAt = newRow.created_at;
                  }
                }
              } else if (eventType === "DELETE") {
                total = Math.max(0, (total || 0) - 1);
                if (oldRow && !oldRow.is_read) unread = Math.max(0, (unread || 0) - 1);
              }

              return {
                ...s,
                unreadCount: unread,
                totalCount: total,
                lastActivityAt,
                lastActivityLabel: relativeLabel(lastActivityAt),
              };
            });
          });

          // If the user currently has this category open, update the notifications list incrementally
          if (selectedCategory === category) {
            setNotifications((prev) => {
              const makeNotification = (row: any): Notification => ({
                id: row.id,
                userId: row.user_id,
                type: row.type,
                title: row.title,
                message: row.message,
                referenceId: row.reference_id ?? null,
                isRead: !!row.is_read,
                createdAt: row.created_at,
              });

              if (eventType === "INSERT") {
                const newNotif = newRow ? makeNotification(newRow) : null;
                if (!newNotif) return prev ?? [];
                return [newNotif, ...(prev ?? [])];
              }

              if (eventType === "UPDATE") {
                if (!newRow) return prev;
                return (prev ?? []).map((n) => (n.id === newRow.id ? makeNotification(newRow) : n));
              }

              if (eventType === "DELETE") {
                if (!oldRow) return prev;
                return (prev ?? []).filter((n) => n.id !== oldRow.id);
              }

              return prev;
            });
          }
        }
      );

      // initial fetch
      try {
        const res = await fetch(`/api/notifications`);
        if (res.ok) {
          const data = await res.json();
          if (data?.categories) setCategoriesState(excludeMessagesCategory(data.categories));
        }
      } catch (e) {
        // ignore
      }
    }

    void setup();

    return () => {
        try {
          unsubscribeFn?.();
        } catch (e) {
          // ignore
        }
    };
  }, []);

  return (
    <div className={styles.container}>
      <PageHeader title="Notifications" action={<MarkAllReadButton />} />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>UPDATES</span>
        </div>

        <UpdatesSection
          categories={categoriesState}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryClick}
          notifications={selectedCategory ? notifications : null}
          isLoading={isLoading}
          error={error}
        />
      </section>

      <MessagesSection conversations={conversations} />
    </div>
  );
}