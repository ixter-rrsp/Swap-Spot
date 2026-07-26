import Image from "next/image";
import Link from "next/link";

import styles from "./ConversationCard.module.css";

import { Conversation } from "@/lib/types/Conversation";


interface Props {
  conversation: Conversation;
}


export default function ConversationCard({
  conversation,
}: Props) {

  const {
    otherUser,
    lastMessage,
  } = conversation;

  const displayName = otherUser.fullName || otherUser.username;

  return (

    <Link
      href={`/messages/${conversation.id}`}
      className={styles.card}
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

        <h3>
          {displayName}
        </h3>

        <p className={styles.message}>

          {
            lastMessage
              ? lastMessage.message
              : "No messages yet"
          }

        </p>

      </div>

      {
        lastMessage && (

          <time className={styles.time}>

            {
              new Date(
                lastMessage.createdAt
              )
                .toLocaleDateString()
            }

          </time>

        )
      }

    </Link>

  );
}