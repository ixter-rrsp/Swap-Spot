"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/utils/supabase/client";
import { subscribeChannel } from "@/utils/supabase/channelRegistry";

import { Message } from "@/lib/types/Message";

import MessageInput from "../MessageInput/MessageInput";
import MessageList from "../MessageList/MessageList";

import ChatHeader from "../Header/Header";
import CreateSwapAgreement from "@/app/components/SwapRequests/CreateSwapAgreement/CreateSwapAgreement";

import styles from "./ChatRoom.module.css";


interface ChatRoomProps {
    conversationId: string;
    currentUserId: string;
    initialMessages: Message[];

    otherUser: {
        username: string;
        fullName: string | null;
        avatarUrl: string | null;
    };

    listing: {
        id: string;
        title: string;
        imageUrl: string | null;
        swapValue?: number;
    };
}

export default function ChatRoom({
    conversationId,
    currentUserId,
    initialMessages,
    otherUser,
    listing,
}: ChatRoomProps) {

    const [messages, setMessages] =
        useState<Message[]>(initialMessages);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    const [activeSwapRequestId, setActiveSwapRequestId] = useState<string | null>(() => {
        return initialMessages.find(
            (message) => message.messageType === "swap_proposal" && !!message.swapRequestId
        )?.swapRequestId ?? null;
    });
    const [activeSwapRequestStatus, setActiveSwapRequestStatus] = useState<string | null>(null);

    const bottomRef =
        useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        const supabase = createClient();
            let isActive = true;
            let unsubscribeFn: (() => void) | null = null;

            async function setupRealtime() {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!isActive || !session) {
                    return;
                }

                const channelName = `conversation:${conversationId}`;

                unsubscribeFn = subscribeChannel(
                    channelName,
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "messages",
                        filter: `conversation_id=eq.${conversationId}`,
                    },
                    (payload: any) => {
                        const newMessage = payload.new;

                        if (!newMessage?.id) {
                            return;
                        }

                        setMessages((previous) => {
                            if (
                                previous.some(
                                    (message) => message.id === newMessage.id
                                )
                            ) {
                                return previous;
                            }

                            return [
                                ...previous,
                                {
                                    id: newMessage.id,
                                    senderId: newMessage.sender_id,
                                    message: newMessage.message,
                                    isRead: newMessage.is_read,
                                    createdAt: newMessage.created_at,
                                    messageType: newMessage.message_type,
                                    imageUrl: newMessage.image_url,
                                    videoUrl: newMessage.video_url,
                                    swapRequestId: newMessage.swap_request_id,
                                    swapAgreementId: newMessage.swap_agreement_id,
                                },
                            ];
                        });
                    }
                );
            }

            void setupRealtime();

            return () => {
                isActive = false;
                try {
                    unsubscribeFn?.();
                } catch (e) {
                    // ignore
                }
            };
    }, [conversationId]);


    useEffect(() => {
        const proposalMessage = messages.find(
            (message) => message.messageType === "swap_proposal" && !!message.swapRequestId
        );

        setActiveSwapRequestId(proposalMessage?.swapRequestId ?? null);
    }, [messages]);

    // Track the actual swap request status so we can gate the
    // "Create Swap Agreement" button — a proposal existing in the
    // chat doesn't mean it's been accepted yet. Polls periodically so
    // the button unlocks shortly after the other party accepts,
    // without needing a dedicated realtime channel for this.
    useEffect(() => {
        if (!activeSwapRequestId) {
            setActiveSwapRequestStatus(null);
            return;
        }

        let cancelled = false;

        async function loadStatus() {
            try {
                const response = await fetch(`/api/swap-requests/${activeSwapRequestId}`);
                if (!response.ok) return;
                const data = await response.json();
                if (!cancelled) {
                    setActiveSwapRequestStatus(data.status);
                }
            } catch (err) {
                console.error("Failed to load swap request status:", err);
            }
        }

        void loadStatus();

        const intervalId = window.setInterval(() => {
            void loadStatus();
        }, 5000);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [activeSwapRequestId]);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages]);


    async function handleSendMessage(
        message: string,
        files?: File[],
        onProgress?: (fileIndex: number, percent: number) => void
    ) {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("message", message);

        if (files && files.length > 0) {
            files.forEach((file) => {
                formData.append("files", file);
            });
        }

        // If caller provided a progress callback, use XHR to get upload progress.
        // Return an object containing the upload promise and an abort function.
        if (onProgress) {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/messages");

            const promise = new Promise<void>((resolve, reject) => {
                xhr.upload.onprogress = (ev) => {
                    if (!ev.lengthComputable) return;
                    const loaded = ev.loaded;
                    const total = ev.total;

                    // distribute loaded bytes to files proportionally
                    const fileSizes = (files ?? []).map((f) => f.size || 0);
                    const prefixSums = fileSizes.reduce<number[]>((acc, s) => {
                        acc.push((acc.length ? acc[acc.length - 1] : 0) + s);
                        return acc;
                    }, [] as number[]);

                    for (let i = 0; i < (files ?? []).length; i++) {
                        const prevSum = i === 0 ? 0 : prefixSums[i - 1];
                        const fileSize = fileSizes[i];
                        const fileLoaded = Math.max(0, Math.min(fileSize, loaded - prevSum));
                        const percent = fileSize > 0 ? Math.round((fileLoaded / fileSize) * 100) : Math.round((loaded / (total || 1)) * 100);
                        try {
                            onProgress(i, percent);
                        } catch {}
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error(xhr.responseText || `Upload failed: ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error("Upload failed"));

                xhr.send(formData);
            });

            return { promise, abort: () => xhr.abort() };
        }

        const response = await fetch("/api/messages", { method: "POST", body: formData });

        if (!response.ok) {
            const error = await response.text();
            console.log("SERVER ERROR:", error);
            throw new Error(error);
        }
    }

    const isAgreementButtonEnabled = activeSwapRequestStatus === "accepted";

    return (

        <section className={styles.container}>

            <ChatHeader
                username={otherUser.username}
                fullName={otherUser.fullName}
                avatarUrl={otherUser.avatarUrl}
                listingId={listing.id}
                listingTitle={listing.title}
                listingImage={listing.imageUrl}
                swapValue={listing.swapValue}
            />


            <div className={styles.messageArea}>

                {messages.length === 0 ? (

                    <p>
                        No messages yet.
                    </p>

                ) : (

                    <MessageList
                        messages={messages}
                        currentUserId={currentUserId}
                    />

                )}


                <div ref={bottomRef} />

            </div>


            <div className={styles.inputArea}>
                {activeSwapRequestId && (
                    <button
                        type="button"
                        className={styles.agreementButton}
                        onClick={() => setIsAgreementModalOpen(true)}
                        disabled={!isAgreementButtonEnabled}
                        title={
                            isAgreementButtonEnabled
                                ? undefined
                                : "The swap request must be accepted before you can create an agreement."
                        }
                    >
                        Create Swap Agreement
                    </button>
                )}

                <MessageInput
                    onSend={handleSendMessage}
                />
            </div>

            {isAgreementModalOpen && activeSwapRequestId && (
                <CreateSwapAgreement
                    swapRequestId={activeSwapRequestId}
                    conversationId={conversationId}
                    onClose={() => setIsAgreementModalOpen(false)}
                />
            )}

        </section>

    );
}