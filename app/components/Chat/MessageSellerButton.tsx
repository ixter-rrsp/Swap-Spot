"use client";

import { useRouter } from "next/navigation";

interface MessageSellerButtonProps {
    listingId: string;
    className?: string;
}

export default function MessageSellerButton({
    listingId,
    className,
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
        <button className={className} onClick={handleClick}>
            Message Seller
        </button>
    );
}