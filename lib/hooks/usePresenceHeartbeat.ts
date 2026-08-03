"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 45_000;

// Pings /api/presence/heartbeat on mount, on a timer while the tab is
// visible, and whenever the tab regains focus/visibility — this is
// what keeps profiles.last_seen_at fresh for anyone currently using
// the app, which the chat header's "Active now" / "Active Xm ago"
// reads from. No-ops silently for signed-out visitors.
export default function usePresenceHeartbeat() {
  useEffect(() => {
    let cancelled = false;

    function sendHeartbeat() {
      if (document.visibilityState !== "visible") return;

      fetch("/api/presence/heartbeat", { method: "POST" }).catch(() => {
        // Best-effort — presence isn't critical path.
      });
    }

    sendHeartbeat();

    const interval = window.setInterval(() => {
      if (!cancelled) sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}
