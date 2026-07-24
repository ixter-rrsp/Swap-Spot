import { Message } from "@/lib/types/Message";

import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
}

export default function MessageBubble({
    message,
    isMine,
}: MessageBubbleProps) {

    return (
        <div
            className={
                isMine
                    ? styles.mine
                    : styles.theirs
            }
        >

            <p>
                {message.message}
            </p>

            <span>
                {new Date(
                    message.createdAt
                ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </span>

        </div>
    );
}