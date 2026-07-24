import { Conversation } from "@/lib/types/Conversation";

import ConversationCard from "../ConversationCard/ConversationCard";

import styles from "./ConversationList.module.css";


interface Props {

  conversations: Conversation[];

}


export default function ConversationList({
  conversations,
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
            />

          )
        )
      }

    </section>

  );
}