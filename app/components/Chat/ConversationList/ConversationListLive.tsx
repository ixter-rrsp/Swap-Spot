"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Conversation } from "@/lib/types/Conversation";
import { useLiveConversations } from "@/lib/hooks/useLiveConversations";

import ConversationList from "@/app/components/Chat/ConversationList/ConversationList";
import Spinner from "@/app/components/UI/Spinner/Spinner";

const INITIAL_BATCH_SIZE = 8;
const BATCH_INCREMENT = 8;

interface ConversationListLiveProps {
  initialConversations: Conversation[];
}

export default function ConversationListLive({
  initialConversations,
}: ConversationListLiveProps) {
  const { conversations, currentUserId, markConversationRead } =
    useLiveConversations(initialConversations);

  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleConversations = useMemo(() => {
    return conversations.slice(0, visibleCount);
  }, [conversations, visibleCount]);

  const hasMore = visibleCount < conversations.length;

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
    <>
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
            margin: "20px 0 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Spinner size={26} />
          <span style={{ color: "#666", fontSize: "13px", fontWeight: 500 }}>
            Loading more conversations...
          </span>
        </div>
      )}
    </>
  );
}