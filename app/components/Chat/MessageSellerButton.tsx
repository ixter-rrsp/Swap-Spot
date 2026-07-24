"use client";

import { useRouter } from "next/navigation";

interface MessageSellerButtonProps {
    listingId: string;
}

export default function MessageSellerButton({
    listingId,
}: MessageSellerButtonProps) {
    const router = useRouter();

    async function handleClick() {
        try {
            const response = await fetch("/api/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    listingId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create conversation.");
            }

            const conversation = await response.json();

            router.push(`/messages/${conversation.id}`);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <button onClick={handleClick}>
            Message Seller
        </button>
    );
}