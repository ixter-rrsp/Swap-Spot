"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Inbox, FileSignature, BadgeCheck, History } from "lucide-react";
import styles from "./DashboardCards.module.css";
import { createClient } from "@/utils/supabase/client";
import { subscribeChannel } from "@/utils/supabase/channelRegistry";

interface DashboardCounts {
  sentRequests: number;
  toAccept: number;
  toConfirm: number;
  toComplete: number;
  history: number;
}

export default function DashboardCards({ counts }: { counts: DashboardCounts }) {
  const [localCounts, setLocalCounts] = useState<DashboardCounts>(counts);

  useEffect(() => {
    setLocalCounts(counts);
  }, [counts]);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    const unsubs: Array<() => void> = [];

    async function fetchCounts() {
      try {
        const res = await fetch("/api/profile/dashboard");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (data?.counts) setLocalCounts(data.counts);
      } catch (err) {
        // ignore
      }
    }

    // subscribe to changes on relevant tables and refetch counts
    async function setup() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;


      const subscribeWithFilter = (table: string, filter: string) => {
        const channelName = `dashboard:${table}:${filter}`;
        const unsub = subscribeChannel(
          channelName,
          { event: "*", schema: "public", table, filter },
          () => void fetchCounts()
        );
        unsubs.push(unsub);
      };

      // subscribe to rows relevant to the current user
      subscribeWithFilter("swap_requests", `sender_id=eq.${user.id}`);
      subscribeWithFilter("swap_requests", `receiver_id=eq.${user.id}`);

      subscribeWithFilter("swap_agreements", `requester_id=eq.${user.id}`);
      subscribeWithFilter("swap_agreements", `receiver_id=eq.${user.id}`);

      subscribeWithFilter("listings", `owner_id=eq.${user.id}`);

      subscribeWithFilter("reviews", `reviewee_id=eq.${user.id}`);

      subscribeWithFilter("notifications", `recipient_id=eq.${user.id}`);

      // initial fetch
      void fetchCounts();

      return () => {
        for (const u of unsubs) {
          try {
            u();
          } catch (e) {
            // ignore
          }
        }
      };
    }

    void setup();

    return () => {
      mounted = false;
      try {
        supabase.removeAllChannels?.();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const router = useRouter();

  const handleCardClick = (
    e: React.MouseEvent,
    key: keyof DashboardCounts,
    href: string
  ) => {
    e.preventDefault();

    // optimistic UI update: hide badge immediately
    setLocalCounts((prev) => ({
      ...prev,
      [key]: 0,
    }));

    // Fire-and-forget request to refresh server counts and reconcile in background
    (async () => {
      try {
        await fetch("/api/profile/dashboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
        const res = await fetch("/api/profile/dashboard");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.counts) setLocalCounts(data.counts);
      } catch (e) {
        // ignore
      }
    })();

    // navigate after optimistic update
    router.push(href);
  };

  const cards = [
    {
      title: "Sent Requests",
      key: "sentRequests" as keyof DashboardCounts,
      count: localCounts.sentRequests,
      icon: <Send size={24} strokeWidth={1.5} />,
      href: "/my-swaps/sent",
    },
    {
      title: "To Accept",
      key: "toAccept" as keyof DashboardCounts,
      count: localCounts.toAccept,
      icon: <Inbox size={24} strokeWidth={1.5} />,
      href: "/my-swaps/accept",
    },
    {
      title: "To Confirm",
      key: "toConfirm" as keyof DashboardCounts,
      count: localCounts.toConfirm,
      icon: <FileSignature size={24} strokeWidth={1.5} />,
      href: "/my-swaps/confirm",
    },
    {
      title: "To Complete",
      key: "toComplete" as keyof DashboardCounts,
      count: localCounts.toComplete,
      icon: <BadgeCheck size={24} strokeWidth={1.5} />,
      href: "/my-swaps/complete",
    },
    {
      title: "History",
      key: "history" as keyof DashboardCounts,
      count: localCounts.history,
      icon: <History size={24} strokeWidth={1.5} />,
      href: "/my-swaps/history",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {cards.map((card) => (
          <Link
            href={card.href}
            key={card.title}
            className={styles.card}
            onClick={(e) => handleCardClick(e, card.key, card.href)}
          >
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>{card.icon}</span>
              {card.count > 0 && (
                <span className={styles.badge}>{card.count}</span>
              )}
            </div>
            <p className={styles.cardTitle}>{card.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
