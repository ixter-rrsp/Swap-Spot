"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/app/components/UI/Toast/ToastContext";

interface SavedListingsContextValue {
  isSaved: (listingId: string) => boolean;
  toggleSaved: (listingId: string) => void;
  loaded: boolean;
}

const SavedListingsContext = createContext<SavedListingsContextValue | null>(
  null
);

export function useSavedListings() {
  const ctx = useContext(SavedListingsContext);
  if (!ctx) {
    throw new Error(
      "useSavedListings must be used within a SavedListingsProvider."
    );
  }
  return ctx;
}

export default function SavedListingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Guards against a slow unsave response clobbering a faster re-save
  // (or vice versa) for the same listing.
  const pendingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/saved-listings");
        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled && Array.isArray(data.listingIds)) {
          setSavedIds(new Set(data.listingIds));
        }
      } catch (error) {
        console.error("Failed to load saved listings:", error);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const isSaved = useCallback(
    (listingId: string) => savedIds.has(listingId),
    [savedIds]
  );

  const toggleSaved = useCallback(
    (listingId: string) => {
      if (pendingRef.current.has(listingId)) return;
      pendingRef.current.add(listingId);

      const wasSaved = savedIds.has(listingId);

      // Optimistic update.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) {
          next.delete(listingId);
        } else {
          next.add(listingId);
        }
        return next;
      });

      const request = wasSaved
        ? fetch(`/api/saved-listings/${listingId}`, { method: "DELETE" })
        : fetch("/api/saved-listings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listingId }),
          });

      request
        .then((response) => {
          if (response.status === 401) {
            // Guest attempting to save — don't just roll back silently,
            // send them to log in and preserve where they were.
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            throw new Error("Unauthorized.");
          }
          if (!response.ok) throw new Error("Request failed.");
        })
        .catch((error) => {
          console.error("Failed to update saved listing:", error);
          // Roll back.
          setSavedIds((prev) => {
            const next = new Set(prev);
            if (wasSaved) {
              next.add(listingId);
            } else {
              next.delete(listingId);
            }
            return next;
          });
          if (error?.message !== "Unauthorized.") {
            toast("Couldn't update saved listings. Try again.", "error");
          }
        })
        .finally(() => {
          pendingRef.current.delete(listingId);
        });
    },
    [savedIds, toast, router, pathname]
  );

  return (
    <SavedListingsContext.Provider value={{ isSaved, toggleSaved, loaded }}>
      {children}
    </SavedListingsContext.Provider>
  );
}
