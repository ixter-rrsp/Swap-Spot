"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Conversation } from "@/lib/types/Conversation";
import { useLiveConversations } from "@/lib/hooks/useLiveConversations";

import ConversationList from "@/app/components/Chat/ConversationList/ConversationList";
import Spinner from "@/app/components/UI/Spinner/Spinner";

import styles from "./MessagesSection.module.css";

const INITIAL_BATCH_SIZE = 8;
const BATCH_INCREMENT = 8;

interface MessagesSectionProps {
  conversations: Conversation[];
}

export default function MessagesSection({ conversations }: MessagesSectionProps) {
  const { conversations: list, currentUserId, markConversationRead } =
    useLiveConversations(conversations);

  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleConversations = useMemo(() => {
    return list.slice(0, visibleCount);
  }, [list, visibleCount]);

  const hasMore = visibleCount < list.length;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + BATCH_INCREMENT);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore]);

  return (
    <section className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>MESSAGES</span>
      </div>

      <ConversationList
        conversations={visibleConversations}
        currentUserId={currentUserId}
        onOpenConversation={markConversationRead}
      />

      {hasMore && (
        <div
          ref={sentinelRef}
          style={{
            minHeight: "40px",
            margin: "16px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Spinner size={24} />
          <span style={{ color: "#666", fontSize: "12px", fontWeight: 500 }}>
            Loading more messages...
          </span>
        </div>
      )}
    </section>
  );
}