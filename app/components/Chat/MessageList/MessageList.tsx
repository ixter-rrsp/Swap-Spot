import MessageBubble from "../MessageBubble/MessageBubble";

import { Message, ReactionType } from "@/lib/types/Message";

import styles from "./MessageList.module.css";

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
    onReply?: (message: Message) => void;
    onUnsend?: (messageId: string) => void;
    onRemoveForMe?: (messageId: string) => void;
    onReact?: (messageId: string, reaction: ReactionType) => void;
}

export default function MessageList({
    messages,
    currentUserId,
    onReply,
    onUnsend,
    onRemoveForMe,
    onReact,
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
                    onReact={onReact}
                />

            ))}

        </div>
    );
}
