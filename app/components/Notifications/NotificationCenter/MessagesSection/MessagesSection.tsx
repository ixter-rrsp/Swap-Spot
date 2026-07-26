"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { subscribeChannel } from "@/utils/supabase/channelRegistry";
import { Conversation } from "@/lib/types/Conversation";

import ConversationList from "@/app/components/Chat/ConversationList/ConversationList";

import styles from "./MessagesSection.module.css";

interface MessagesSectionProps {
  conversations: Conversation[];
}

export default function MessagesSection({ conversations }: MessagesSectionProps) {
  const [list, setList] = useState<Conversation[]>(conversations ?? []);

  useEffect(() => {
    setList(conversations ?? []);
  }, [conversations]);

  useEffect(() => {
    const supabase = createClient();
    let unsubscribeFn: (() => void) | null = null;

    async function setup() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      const channelName = `messages:${user.id}`;

      unsubscribeFn = subscribeChannel(
        channelName,
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        (payload: any) => {
          const eventType = payload?.eventType || payload?.event || payload?.type;
          const newRow = payload?.new ?? null;
          const oldRow = payload?.old ?? null;

          setList((prev) => {
            if (eventType === "INSERT" && newRow) {
              const idx = prev.findIndex((c) => c.id === newRow.conversation_id);
              const updatedItem = {
                ...(prev[idx] ?? {
                  id: newRow.conversation_id,
                  listing: { id: "", title: "", imageUrl: undefined },
                  otherUser: { id: newRow.sender_id, username: "", fullName: "", avatarUrl: null },
                  lastMessage: null,
                  unreadCount: 0,
                }),
                lastMessage: { message: newRow.message, createdAt: newRow.created_at },
                unreadCount: ((prev[idx]?.unreadCount ?? 0) + (newRow.sender_id !== user.id && !newRow.is_read ? 1 : 0)),
              } as Conversation;

              const next = prev.filter((c) => c.id !== updatedItem.id);
              return [updatedItem, ...next];
            }

            if (eventType === "UPDATE" && newRow && oldRow) {
              const idx = prev.findIndex((c) => c.id === newRow.conversation_id);
              if (idx === -1) return prev;

              const current = prev[idx];
              let unread = current.unreadCount ?? 0;
              if (!oldRow.is_read && newRow.is_read) unread = Math.max(0, unread - 1);
              else if (oldRow.is_read && !newRow.is_read && newRow.sender_id !== user.id) unread = unread + 1;

              const updated = { ...current, lastMessage: { message: newRow.message, createdAt: newRow.created_at }, unreadCount: unread };
              return prev.map((c) => (c.id === updated.id ? updated : c));
            }

            if (eventType === "DELETE" && oldRow) {
              const idx = prev.findIndex((c) => c.id === oldRow.conversation_id);
              if (idx === -1) return prev;
              const current = prev[idx];
              let unread = current.unreadCount ?? 0;
              if (!oldRow.is_read && oldRow.sender_id !== user.id) unread = Math.max(0, unread - 1);
              const updated = { ...current, unreadCount: unread };
              return prev.map((c) => (c.id === updated.id ? updated : c));
            }

            return prev;
          });
        }
      );
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
    <section className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>MESSAGES</span>
      </div>

      <ConversationList conversations={list} />
    </section>
  );
}
