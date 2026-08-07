"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { createClient } from "@/utils/supabase/client";
import { subscribeChannel } from "@/utils/supabase/channelRegistry";

// Pages that should never show the app navbar. "/" is the marketing
// landing page — it ships its own Nav component, so showing this navbar
// too would duplicate it. The rest are the informational/account pages
// reachable from the hamburger main menu — they're standalone content
// pages, not part of the app's core swipe-between-tabs flow, so the
// bottom navbar isn't needed there for either guests or signed-in users.
const HIDDEN_ON = [
  "/login",
  "/signup",
  "/register",
  "/subscriptions",
  "/profile/edit",
  "/about",
  "/how-it-works",
  "/help",
  "/trust-and-safety",
  "/terms",
  "/privacy",
  "/contact",
  "/admin-jkiqlou9xs16ceb6gya8Ilve1llt",
];
const HIDDEN_EXACT = ["/"];

interface ConditionalNavbarProps {
  unreadCount: number;
}

type SupabaseRealtimePayload<Row = Record<string, unknown>> = {
  eventType?: string;
  event?: string;
  type?: string;
  new?: Row | null;
  old?: Row | null;
};

export default function ConditionalNavbar({
  unreadCount,
}: ConditionalNavbarProps) {
  const pathname = usePathname() ?? "/";
  // Always start at 0 so the very first client render matches the server
  // render exactly, regardless of session/auth timing. The real count is
  // synced in immediately after mount via the initial state below.
  const [localUnread, setLocalUnread] = useState<number>(() => unreadCount ?? 0);

  const shouldHide =
    HIDDEN_EXACT.includes(pathname) ||
    HIDDEN_ON.some((path) => pathname.startsWith(path));

  const handleNotificationClick = () => {
    setLocalUnread(0);
    fetch("/api/notifications/unread", { method: "POST" }).catch(() => {});
  };

  useEffect(() => {
    if (pathname === "/notifications") {
      queueMicrotask(() => {
        setLocalUnread(0);
        fetch("/api/notifications/unread", { method: "POST" }).catch(() => {});
      });
    }
  }, [pathname]);

  // setup realtime subscription to update unreadCount per-user
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    let unsubUnread: (() => void) | null = null;
    let unsubMessages: (() => void) | null = null;

    async function fetchUnread() {
      try {
        const res = await fetch(`/api/notifications/unread`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setLocalUnread(data.unreadCount ?? 0);
      } catch {
        // ignore
      }
    }

    async function setup() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;


      const notifChannelName = `unread:${user.id}`;

      unsubUnread = subscribeChannel(
        notifChannelName,
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload: SupabaseRealtimePayload<{ is_read?: boolean }>) => {
          const eventType = payload?.eventType || payload?.event || payload?.type;
          const newRow = payload?.new ?? null;
          const oldRow = payload?.old ?? null;

          let delta = 0;

          if (eventType === "INSERT") {
            if (newRow && !newRow.is_read) delta += 1;
          } else if (eventType === "UPDATE") {
            if (oldRow && newRow) {
              if (!oldRow.is_read && newRow.is_read) delta -= 1;
              else if (oldRow.is_read && !newRow.is_read) delta += 1;
            }
          } else if (eventType === "DELETE") {
            if (oldRow && !oldRow.is_read) delta -= 1;
          }

          if (delta !== 0) setLocalUnread((prev) => Math.max(0, prev + delta));
        }
      );

      // also subscribe to message changes that affect unread chat count
      unsubMessages = subscribeChannel(
        `messages:${user.id}`,
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        (payload: SupabaseRealtimePayload<{ is_read?: boolean; sender_id?: string }>) => {
          const eventType = payload?.eventType || payload?.event || payload?.type;
          const newRow = payload?.new ?? null;
          const oldRow = payload?.old ?? null;

          let delta = 0;

          if (eventType === "INSERT") {
            if (newRow && !newRow.is_read && newRow.sender_id !== user.id) delta += 1;
          } else if (eventType === "UPDATE") {
            if (oldRow && newRow) {
              if (!oldRow.is_read && newRow.is_read) delta -= 1;
              else if (oldRow.is_read && !newRow.is_read && newRow.sender_id !== user.id) delta += 1;
            }
          } else if (eventType === "DELETE") {
            if (oldRow && !oldRow.is_read && oldRow.sender_id !== user.id) delta -= 1;
          }

          if (delta !== 0) setLocalUnread((prev) => Math.max(0, prev + delta));
        }
      );

      void fetchUnread();
    }

    void setup();

    return () => {
      mounted = false;
      try {
        unsubUnread?.();
      } catch {
        // ignore
      }
      try {
        unsubMessages?.();
      } catch {
        // ignore
      }
    };
  }, []);

  if (shouldHide) return null;

  return <Navbar unreadCount={localUnread} onNotificationClick={handleNotificationClick} />;
}