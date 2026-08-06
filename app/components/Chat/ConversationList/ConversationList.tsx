import { Conversation } from "@/lib/types/Conversation";

import ConversationCard from "../ConversationCard/ConversationCard";

import styles from "./ConversationList.module.css";


interface Props {

  conversations: Conversation[];

  currentUserId?: string | null;

  onOpenConversation?: (conversationId: string) => void;

}


export default function ConversationList({
  conversations,
  currentUserId = null,
  onOpenConversation,
}: Props) {


  if (conversations.length === 0) {
    return <p className={styles.empty}>No conversations yet.</p>;
  }

  return (

    <section className={styles.container}>

      {
        conversations.map(
          (conversation) => (

            <ConversationCard
              key={
                conversation.id
              }
              conversation={
                conversation
              }
              currentUserId={currentUserId}
              onOpen={
                onOpenConversation
                  ? () => onOpenConversation(conversation.id)
                  : undefined
              }
            />

          )
        )
      }

    </section>

  );
}