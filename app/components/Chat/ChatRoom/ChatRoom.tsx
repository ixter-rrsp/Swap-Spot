"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/utils/supabase/client";
import { subscribeChannel } from "@/utils/supabase/channelRegistry";

import { Message } from "@/lib/types/Message";

import MessageInput from "../MessageInput/MessageInput";
import MessageList from "../MessageList/MessageList";

import ChatHeader from "../Header/Header";
import CreateSwapAgreement from "@/app/components/SwapRequests/CreateSwapAgreement/CreateSwapAgreement";
import Spinner from "@/app/components/UI/Spinner/Spinner";

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

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(initialMessages.length >= 15);
    const messageAreaRef = useRef<HTMLDivElement | null>(null);

    // Track scroll height before prepend to maintain exact scroll position
    const prependingRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
    const isInitialMount = useRef(true);

    // Initial scroll to bottom on mount
    useEffect(() => {
        if (isInitialMount.current && messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: "instant" as any });
            isInitialMount.current = false;
        }
    }, [messages]);

    // Handle scroll position adjustment after prepending older messages
    useEffect(() => {
        if (prependingRef.current && messageAreaRef.current) {
            const container = messageAreaRef.current;
            const newScrollHeight = container.scrollHeight;
            const diff = newScrollHeight - prependingRef.current.scrollHeight;
            container.scrollTop = prependingRef.current.scrollTop + diff;
            prependingRef.current = null;
        }
    }, [messages]);

    async function loadOlderMessages() {
        if (isLoadingMore || !hasMoreMessages || messages.length === 0) return;

        const oldestMessage = messages[0];
        if (!oldestMessage) return;

        setIsLoadingMore(true);

        if (messageAreaRef.current) {
            prependingRef.current = {
                scrollHeight: messageAreaRef.current.scrollHeight,
                scrollTop: messageAreaRef.current.scrollTop,
            };
        }

        try {
            const response = await fetch(
                `/api/messages?conversationId=${conversationId}&limit=15&before=${encodeURIComponent(oldestMessage.createdAt)}`
            );
            if (response.ok) {
                const olderMessages: Message[] = await response.json();
                if (olderMessages.length < 15) {
                    setHasMoreMessages(false);
                }
                if (olderMessages.length > 0) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const uniqueOlder = olderMessages.filter((m) => !existingIds.has(m.id));
                        return [...uniqueOlder, ...prev];
                    });
                }
            }
        } catch (err) {
            console.error("Failed to load older messages:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }

    function handleScroll() {
        if (!messageAreaRef.current || isLoadingMore || !hasMoreMessages) return;

        if (messageAreaRef.current.scrollTop <= 80) {
            void loadOlderMessages();
        }
    }

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
                    if (ev.lengthComputable && files && files.length > 0) {
                        const fileIndex = 0;
                        const percent = Math.round((ev.loaded / ev.total) * 100);
                        onProgress(fileIndex, percent);
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

        // Scroll to bottom on user send
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
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


            <div
                ref={messageAreaRef}
                className={styles.messageArea}
                onScroll={handleScroll}
            >
                {isLoadingMore && (
                    <div style={{ padding: "10px 0", display: "flex", justifyContent: "center" }}>
                        <Spinner size={20} />
                    </div>
                )}

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
