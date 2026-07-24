"use client";

import { useState } from "react";

import styles from "./MessageInput.module.css";

interface MessageInputProps {
    onSend: (message: string) => Promise<void>;
}

export default function MessageInput({
    onSend,
}: MessageInputProps) {

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
            return;
        }

        try {
            setLoading(true);

            await onSend(trimmedMessage);

            setMessage("");

        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
        >
            <input
                value={message}
                onChange={(event) =>
                    setMessage(event.target.value)
                }
                placeholder="Type a message..."
                disabled={loading}
            />

            <button
                type="submit"
                disabled={loading}
            >
                Send
            </button>
        </form>
    );
}