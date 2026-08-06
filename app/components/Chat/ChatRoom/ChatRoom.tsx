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
        id: string;
        username: string;
        fullName: string | null;
        avatarUrl: string | null;
        lastSeenAt: string | null;
    };

    listing: {
        id: string;
        title: string;
        imageUrl: string | null;
        swapValue?: number;
    };
}

function replyPreviewLabel(message: Message): string {
    if (message.messageType === "image") return "📷 Photo";
    if (message.messageType === "video") return "🎥 Video";
    if (message.messageType === "swap_proposal") return "Swap proposal";
    if (message.messageType === "swap_agreement") return "Swap agreement";
    if (message.messageType === "review_request") return "Review request";
    return message.message || "Message";
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
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [activeSwapRequestId, setActiveSwapRequestId] = useState<string | null>(() => {
        return initialMessages.find(
            (message) => message.messageType === "swap_proposal" && !!message.swapRequestId
        )?.swapRequestId ?? null;
    });
    const [activeSwapRequestStatus, setActiveSwapRequestStatus] = useState<string | null>(null);

    const bottomRef =
        useRef<HTMLDivElement | null>(null);

    // Kept in sync with `messages` so the realtime INSERT handler can build
    // a reply preview from a message that's already loaded, without an
    // extra round trip for the common case of replying to something recent.
    const messagesRef = useRef<Message[]>(initialMessages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);


    useEffect(() => {
        const supabase = createClient();
            let isActive = true;
            let unsubscribeInsert: (() => void) | null = null;
            let unsubscribeUpdate: (() => void) | null = null;

            async function setupRealtime() {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!isActive || !session) {
                    return;
                }

                const channelName = `conversation:${conversationId}`;

                unsubscribeInsert = subscribeChannel(
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

                            const replySource = newMessage.reply_to_id
                                ? messagesRef.current.find(
                                      (m) => m.id === newMessage.reply_to_id
                                  )
                                : null;

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
                                    unsentAt: newMessage.unsent_at,
                                    replyToId: newMessage.reply_to_id,
                                    replyPreview: replySource
                                        ? {
                                              id: replySource.id,
                                              senderId: replySource.senderId,
                                              message: replySource.message,
                                              messageType: replySource.messageType,
                                          }
                                        : null,
                                },
                            ];
                        });
                    }
                );

                // Reflects unsend / remove-for-me across both participants'
                // screens in real time (the sender's own optimistic update
                // already happened locally, but this is what makes it show
                // up live for the OTHER participant too).
                unsubscribeUpdate = subscribeChannel(
                    channelName,
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "messages",
                        filter: `conversation_id=eq.${conversationId}`,
                    },
                    (payload: any) => {
                        const updated = payload.new;
                        if (!updated?.id) return;

                        setMessages((previous) => {
                            const deletedFor: string[] = updated.deleted_for ?? [];

                            // If this update is the OTHER user removing the
                            // message for themselves, that shouldn't affect
                            // what WE see — only act on it if it affects us.
                            if (deletedFor.includes(currentUserId)) {
                                return previous.filter((m) => m.id !== updated.id);
                            }

                            return previous.map((m) =>
                                m.id === updated.id
                                    ? { ...m, unsentAt: updated.unsent_at }
                                    : m
                            );
                        });
                    }
                );
            }

            void setupRealtime();

            return () => {
                isActive = false;
                try {
                    unsubscribeInsert?.();
                    unsubscribeUpdate?.();
                } catch (e) {
                    // ignore
                }
            };
    }, [conversationId, currentUserId]);


    useEffect(() => {
        const proposalMessage = messages.find(
            (message) => message.messageType === "swap_proposal" && !!message.swapRequestId
        );

        setActiveSwapRequestId(proposalMessage?.swapRequestId ?? null);
    }, [messages]);

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
        onProgress?: (fileIndex: number, percent: number) => void,
        replyToId?: string | null
    ) {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("message", message);
        if (replyToId) {
            formData.append("replyToId", replyToId);
        }

        if (files && files.length > 0) {
            files.forEach((file) => {
                formData.append("files", file);
            });
        }

        if (onProgress) {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/messages");

            const promise = new Promise<void>((resolve, reject) => {
                xhr.upload.onprogress = (ev) => {
                    if (!ev.lengthComputable) return;
                    const loaded = ev.loaded;
                    const total = ev.total;

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

    function handleReply(message: Message) {
        setReplyingTo(message);
    }

    function handleCancelReply() {
        setReplyingTo(null);
    }

    async function handleUnsend(messageId: string) {
        // Optimistic: mark unsent locally right away, roll back on failure.
        const previous = messages;
        setMessages((prev) =>
            prev.map((m) =>
                m.id === messageId
                    ? { ...m, unsentAt: new Date().toISOString() }
                    : m
            )
        );

        try {
            const response = await fetch(`/api/messages/${messageId}/unsend`, {
                method: "PATCH",
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
        } catch (err) {
            console.error("Failed to unsend message:", err);
            setMessages(previous);
        }
    }

    async function handleRemoveForMe(messageId: string) {
        const previous = messages;
        setMessages((prev) => prev.filter((m) => m.id !== messageId));

        try {
            const response = await fetch(`/api/messages/${messageId}/remove-for-me`, {
                method: "PATCH",
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
        } catch (err) {
            console.error("Failed to remove message:", err);
            setMessages(previous);
        }
    }

    const isAgreementButtonEnabled = activeSwapRequestStatus === "accepted";

    return (

        <section className={styles.container}>

            <ChatHeader
                otherUserId={otherUser.id}
                username={otherUser.username}
                fullName={otherUser.fullName}
                avatarUrl={otherUser.avatarUrl}
                lastSeenAt={otherUser.lastSeenAt}
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
                        onReply={handleReply}
                        onUnsend={handleUnsend}
                        onRemoveForMe={handleRemoveForMe}
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
                    replyingTo={replyingTo}
                    onCancelReply={handleCancelReply}
                    getReplyPreviewLabel={replyPreviewLabel}
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
