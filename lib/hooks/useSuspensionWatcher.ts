"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { subscribeChannel } from "@/utils/supabase/channelRegistry";
import { signOut } from "@/lib/services/AuthService";
import { useToast } from "@/app/components/UI/Toast/ToastContext";

// How long the suspension notice stays on screen before we actually sign
// the account out. Long enough to read, short enough that a hard-suspended
// user can't keep using the app in the meantime.
const NOTICE_DURATION_MS = 6000;

const SUSPENSION_MESSAGE =
  "Your account has been suspended due to concerning activity. Contact support@swapspot.com to appeal.";

const POLL_INTERVAL_MS = 60_000;

interface SuspensionRow {
  suspension_status: string | null;
}

// Global, app-wide watcher: as soon as an admin escalates an account to a
// hard suspension, this signs the user out — wherever they currently are,
// not just on protected routes — after giving them a moment to read why.
// Two detection paths, since Realtime may not be enabled for `profiles`:
//   1. A `postgres_changes` subscription on this user's own profile row.
//   2. A low-frequency poll + a check whenever the tab regains focus.
// Middleware still hard-blocks protected routes server-side as a backstop;
// this hook is what makes the logout (and the message) actually happen.
export default function useSuspensionWatcher() {
  const router = useRouter();
  const toast = useToast();
  const triggeredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    let userId: string | null = null;
    let unsubscribeRealtime: (() => void) | null = null;

    function handleHardSuspension() {
      if (triggeredRef.current) return;
      triggeredRef.current = true;

      toast(SUSPENSION_MESSAGE, "error", undefined, NOTICE_DURATION_MS);

      window.setTimeout(() => {
        void signOut()
          .catch(() => {
            // Best-effort — even if the sign-out call fails, drop them
            // onto the login screen so they can't keep browsing signed in.
          })
          .finally(() => {
            router.replace("/login");
            router.refresh();
          });
      }, NOTICE_DURATION_MS);
    }

    async function checkOnce() {
      if (!userId || cancelled || triggeredRef.current) return;

      const { data } = await supabase
        .from("profiles")
        .select("suspension_status")
        .eq("id", userId)
        .maybeSingle<SuspensionRow>();

      if (!cancelled && data?.suspension_status === "hard") {
        handleHardSuspension();
      }
    }

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled || !user) return;

      userId = user.id;

      await checkOnce();
      if (cancelled || triggeredRef.current) return;

      unsubscribeRealtime = subscribeChannel(
        `profile-suspension-${userId}`,
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        (payload: { new?: SuspensionRow }) => {
          if (payload?.new?.suspension_status === "hard") {
            handleHardSuspension();
          }
        }
      );
    }

    void init();

    const poll = window.setInterval(() => {
      void checkOnce();
    }, POLL_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void checkOnce();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribeRealtime?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
