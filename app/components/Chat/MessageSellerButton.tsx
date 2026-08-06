"use client";

import { useRouter, usePathname } from "next/navigation";

interface MessageSellerButtonProps {
    listingId: string;
    className?: string;
    isAuthenticated?: boolean;
}

export default function MessageSellerButton({
    listingId,
    className,
    isAuthenticated = true,
}: MessageSellerButtonProps) {
    const router = useRouter();
    const pathname = usePathname();

    async function handleClick() {
        if (!isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

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

            if (response.status === 401) {
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                return;
            }

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
