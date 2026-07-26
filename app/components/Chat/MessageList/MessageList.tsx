import MessageBubble from "../MessageBubble/MessageBubble";

import { Message } from "@/lib/types/Message";

import styles from "./MessageList.module.css";

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
}

export default function MessageList({
    messages,
    currentUserId,
}: MessageListProps) {

    return (
        <div className={styles.container}>

            {messages.map((message) => (

                <MessageBubble
                    key={message.id}
                    message={message}
                    isMine={
                        message.senderId === currentUserId
                    }
                    currentUserId={currentUserId}
                />

            ))}

        </div>
    );
}