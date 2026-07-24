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
    listing,
    lastMessage,
  } = conversation;


  return (

    <Link
      href={`/messages/${conversation.id}`}
      className={styles.card}
    >

      {/* User Avatar */}

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
              otherUser.username
                .charAt(0)
                .toUpperCase()
            }
          </span>

        )}

      </div>



      <div className={styles.content}>


        <div className={styles.top}>


          <div>

            <h3>
              {
                otherUser.fullName ||
                otherUser.username
              }
            </h3>


            <p>
              @{otherUser.username}
            </p>

          </div>



          {
            lastMessage && (

              <time>

                {
                  new Date(
                    lastMessage.createdAt
                  )
                    .toLocaleDateString()
                }

              </time>

            )
          }


        </div>



        <div className={styles.listing}>


          {
            listing.imageUrl && (

              <Image
                src={listing.imageUrl}
                alt={listing.title}
                width={45}
                height={45}
              />

            )
          }


          <span>
            {listing.title}
          </span>


        </div>




        <p className={styles.message}>

          {
            lastMessage
              ? lastMessage.message
              : "No messages yet"
          }

        </p>



      </div>


    </Link>

  );
}