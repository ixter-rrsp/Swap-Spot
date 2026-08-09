import Image from "next/image";
import Link from "next/link";

import VerifiedBadge from "@/app/components/UI/VerifiedBadge/VerifiedBadge";

import styles from "./ConversationCard.module.css";

import { Conversation } from "@/lib/types/Conversation";

interface Props {
  conversation: Conversation;
  currentUserId?: string | null;
  onOpen?: () => void;
}

// Computed at render time (rather than trusting a string baked in by the
// server on initial load) so it stays accurate as time passes and as
// useLiveConversations patches in newer messages — a stale "3h" that
// never becomes "1d" was part of what made this list feel inconsistent.
function formatTimestamp(iso: string): string {
  const created = new Date(iso);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  // Same calendar day in the viewer's LOCAL time (not UTC — comparing in
  // UTC is what previously made a message from, say, 11pm local read as
  // "yesterday", or vice versa, depending on the viewer's timezone).
  const isSameLocalDay =
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth() &&
    created.getDate() === now.getDate();

  if (isSameLocalDay) {
    return created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  // Older than a week: a real date is more useful than "3w", and this
  // renders in the viewer's own local timezone.
  const sameYear = created.getFullYear() === now.getFullYear();
  return created.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

function previewText(lastMessage: Conversation["lastMessage"], isMine: boolean): string {
  if (!lastMessage) return "No messages yet";

  const prefix = isMine ? "You: " : "";

  if (lastMessage.messageType === "image") return `${prefix}Photo`;
  if (lastMessage.messageType === "video") return `${prefix}Video`;
  if (lastMessage.messageType === "swap_proposal") return `${prefix}Swap proposal`;
  if (lastMessage.messageType === "swap_agreement") return `${prefix}Swap agreement`;
  if (lastMessage.messageType === "review_request") return `${prefix}Review request`;
  if (lastMessage.messageType === "system") return lastMessage.message;

  return `${prefix}${lastMessage.message}`;
}

export default function ConversationCard({
  conversation,
  currentUserId = null,
  onOpen,
}: Props) {
  const { otherUser, lastMessage, unreadCount = 0 } = conversation;

  const isUnread = unreadCount > 0;
  const displayName = otherUser.fullName || otherUser.username;

  const isMine =
    !!lastMessage && !!currentUserId && lastMessage.senderId === currentUserId;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={`${styles.card} ${isUnread ? styles.unreadCard : ""}`}
      onClick={onOpen}
    >
      <div className={styles.avatar}>
        {otherUser.avatarUrl ? (
          <Image src={otherUser.avatarUrl} alt={otherUser.username} fill />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={isUnread ? styles.unreadText : ""}>
          {displayName}
          {otherUser.isVerified && <VerifiedBadge size={13} />}
        </h3>

        <p className={`${styles.message} ${isUnread ? styles.unreadMessage : ""}`}>
          {previewText(lastMessage, isMine)}
        </p>
      </div>

      {lastMessage && (
        <time
          className={`${styles.time} ${isUnread ? styles.unreadTime : ""}`}
          dateTime={lastMessage.createdAt}
        >
          {formatTimestamp(lastMessage.createdAt)}
        </time>
      )}

      {isUnread && <span className={styles.unreadDot} aria-label="Unread message" />}
    </Link>
  );
}
