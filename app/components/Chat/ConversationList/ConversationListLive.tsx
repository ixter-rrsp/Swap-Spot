"use client";

import { Conversation } from "@/lib/types/Conversation";
import { useLiveConversations } from "@/lib/hooks/useLiveConversations";

import ConversationList from "@/app/components/Chat/ConversationList/ConversationList";

interface ConversationListLiveProps {
  initialConversations: Conversation[];
}

export default function ConversationListLive({
  initialConversations,
}: ConversationListLiveProps) {
  const { conversations, currentUserId, markConversationRead } =
    useLiveConversations(initialConversations);

  return (
    <ConversationList
      conversations={conversations}
      currentUserId={currentUserId}
      onOpenConversation={markConversationRead}
    />
  );
}