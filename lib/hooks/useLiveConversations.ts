"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { subscribeChannel } from "@/utils/supabase/channelRegistry";
import { Conversation } from "@/lib/types/Conversation";

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface RealtimeMessagePayload {
  eventType?: string;
  event?: string;
  type?: string;
  new?: MessageRow | null;
  old?: MessageRow | null;
}

// Subscribes to all `messages` INSERT/UPDATE events and applies any that
// belong to a conversation already present in the list (updating
// lastMessage + unreadCount), so ConversationCard's existing
// unreadCount-driven styling (bold text, green dot) picks it up live
// instead of only after a full page reload.
//
// NOTE: this intentionally does NOT filter the subscription itself by
// receiver_id — the `messages` table (per the project schema) has no
// receiver_id column, only sender_id, so a server-side filter on that
// column would silently never match. Filtering is done client-side
// instead by checking whether the incoming row's conversation_id is
// already in our list. The trade-off: every connected client receives
// every message insert/update app-wide and discards what's not theirs.
// Fine at this app's current scale; worth revisiting with a proper
// server-side filter (e.g. once a receiver_id or participant column
// exists) if message volume grows.
export function useLiveConversations(initialConversations: Conversation[]) {
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations ?? []
  );

  // Tracks the last initialConversations reference we've already synced,
  // so we only reset local state when the prop itself actually changes
  // (e.g. server data refreshed) — not on every render. This is React's
  // "adjust state during render" pattern rather than a useEffect, since
  // calling setState synchronously inside an effect body just to mirror
  // a prop causes an extra cascading render.
  const [syncedInitial, setSyncedInitial] = useState(initialConversations);

  if (initialConversations !== syncedInitial) {
    setSyncedInitial(initialConversations);
    setConversations(initialConversations ?? []);
  }

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let unsubscribeFn: (() => void) | null = null;

    async function setup() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      setCurrentUserId(user.id);

      const channelName = `conversations-live:${user.id}`;

      unsubscribeFn = subscribeChannel(
        channelName,
        { event: "*", schema: "public", table: "messages" },
        (payload: RealtimeMessagePayload) => {
          const eventType = payload.eventType || payload.event || payload.type;
          const newRow = payload.new ?? null;
          const oldRow = payload.old ?? null;

          const conversationId = newRow?.conversation_id ?? oldRow?.conversation_id;
          if (!conversationId) return;

          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === conversationId);

            // Not a conversation already in the list (e.g. a brand-new
            // conversation just started) — leave it for the next full
            // load rather than guessing at a whole new Conversation shape.
            if (idx === -1) return prev;

            const current = prev[idx];

            if (eventType === "INSERT" && newRow) {
              const isMine = newRow.sender_id === user.id;

              const updated: Conversation = {
                ...current,
                lastMessage: {
                  message: newRow.message,
                  createdAt: newRow.created_at,
                  senderId: newRow.sender_id,
                },
                unreadCount: isMine
                  ? current.unreadCount ?? 0
                  : (current.unreadCount ?? 0) + (newRow.is_read ? 0 : 1),
              };

              const next = prev.filter((c) => c.id !== updated.id);
              return [updated, ...next];
            }

            if (eventType === "UPDATE" && newRow && oldRow) {
              let unread = current.unreadCount ?? 0;

              if (!oldRow.is_read && newRow.is_read) {
                unread = Math.max(0, unread - 1);
              } else if (
                oldRow.is_read &&
                !newRow.is_read &&
                newRow.sender_id !== user.id
              ) {
                unread = unread + 1;
              }

              const updated: Conversation = {
                ...current,
                lastMessage: {
                  message: newRow.message,
                  createdAt: newRow.created_at,
                  senderId: newRow.sender_id,
                },
                unreadCount: unread,
              };

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

  // Optimistically clears a conversation's unread state the instant it's
  // opened, rather than waiting on the destination page's server-side
  // markMessagesAsRead call to be reflected back here (which depends on
  // this list re-fetching from the server on navigation — not guaranteed
  // to happen promptly with Next.js's client-side navigation caching).
  // The actual DB write still happens via the existing server-side call
  // in app/messages/[conversationId]/page.tsx; this only updates what
  // the list renders locally.
  function markConversationRead(conversationId: string) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }

  return { conversations, currentUserId, markConversationRead };
}