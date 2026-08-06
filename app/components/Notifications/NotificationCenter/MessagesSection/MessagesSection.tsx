"use client";

import { Conversation } from "@/lib/types/Conversation";
import { useLiveConversations } from "@/lib/hooks/useLiveConversations";

import ConversationList from "@/app/components/Chat/ConversationList/ConversationList";

import styles from "./MessagesSection.module.css";

interface MessagesSectionProps {
  conversations: Conversation[];
}

export default function MessagesSection({ conversations }: MessagesSectionProps) {
  const { conversations: list, currentUserId, markConversationRead } =
    useLiveConversations(conversations);

  return (
    <section className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>MESSAGES</span>
      </div>

      <ConversationList
        conversations={list}
        currentUserId={currentUserId}
        onOpenConversation={markConversationRead}
      />
    </section>
  );
}