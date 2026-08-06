"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface GuestModeContextValue {
  /** True once we've asked Supabase and there's no signed-in user. */
  isGuest: boolean;
  /** True until the first auth check resolves — avoids flashing guest UI. */
  loading: boolean;
  /**
   * Call before any action that requires an account (saving, messaging,
   * posting a listing, etc). Returns true if the user may proceed. If the
   * user is a guest, it sends them to sign up (preserving where they were)
   * and returns false.
   */
  requireAuth: (reason?: string) => boolean;
}

const GuestModeContext = createContext<GuestModeContextValue | null>(null);

export function useGuestMode() {
  const ctx = useContext(GuestModeContext);
  if (!ctx) {
    throw new Error("useGuestMode must be used within a GuestModeProvider.");
  }
  return ctx;
}

export default function GuestModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function check() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!cancelled) setIsGuest(!data?.user);
      } catch {
        if (!cancelled) setIsGuest(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void check();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsGuest(!session?.user);
    });

    return () => {
      cancelled = true;
      sub?.subscription.unsubscribe();
    };
  }, []);

  const requireAuth = useCallback(
    (reason?: string) => {
      if (!isGuest) return true;

      const params = new URLSearchParams();
      params.set("redirect", pathname || "/home");
      if (reason) params.set("reason", reason);

      router.push(`/signup?${params.toString()}`);
      return false;
    },
    [isGuest, pathname, router]
  );

  return (
    <GuestModeContext.Provider value={{ isGuest, loading, requireAuth }}>
      {children}
    </GuestModeContext.Provider>
  );
}
