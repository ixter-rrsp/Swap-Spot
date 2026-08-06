import MessageBubble from "../MessageBubble/MessageBubble";

import { Message } from "@/lib/types/Message";

import styles from "./MessageList.module.css";

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
    onReply?: (message: Message) => void;
    onUnsend?: (messageId: string) => void;
    onRemoveForMe?: (messageId: string) => void;
}

export default function MessageList({
    messages,
    currentUserId,
    onReply,
    onUnsend,
    onRemoveForMe,
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
                    onReply={onReply}
                    onUnsend={onUnsend}
                    onRemoveForMe={onRemoveForMe}
                />

            ))}

        </div>
    );
}
