import Image from "next/image";
import Link from "next/link";

import styles from "./ConversationCard.module.css";

import { Conversation } from "@/lib/types/Conversation";


interface Props {
  conversation: Conversation;
  currentUserId?: string | null;
  onOpen?: () => void;
}


export default function ConversationCard({
  conversation,
  currentUserId = null,
  onOpen,
}: Props) {

  const {
    otherUser,
    lastMessage,
    unreadCount = 0,
  } = conversation;

  const isUnread = unreadCount > 0;
  const displayName = otherUser.fullName || otherUser.username;

  const isMine =
    !!lastMessage &&
    !!currentUserId &&
    lastMessage.senderId === currentUserId;

  return (

    <Link
      href={`/messages/${conversation.id}`}
      className={`${styles.card} ${isUnread ? styles.unreadCard : ""}`}
      onClick={onOpen}
    >

      <div className={styles.avatar}>

        {otherUser.avatarUrl ? (

          <Image
            src={otherUser.avatarUrl}
            alt={otherUser.username}
            fill
          />

        ) : (

          <span>
            {
              displayName
                .charAt(0)
                .toUpperCase()
            }
          </span>

        )}

      </div>

      <div className={styles.content}>

        <h3 className={isUnread ? styles.unreadText : ""}>
          {displayName}
        </h3>

        <p className={`${styles.message} ${isUnread ? styles.unreadMessage : ""}`}>

          {
            lastMessage
              ? `${isMine ? "You: " : ""}${lastMessage.message}`
              : "No messages yet"
          }

        </p>

      </div>

      {
        lastMessage && (

          <time className={`${styles.time} ${isUnread ? styles.unreadTime : ""}`}>

            {
              new Date(
                lastMessage.createdAt
              )
                .toLocaleDateString("en-US", { timeZone: "UTC" })
            }

          </time>

        )
      }

      {isUnread && <span className={styles.unreadDot} aria-label="Unread message" />}

    </Link>

  );
}