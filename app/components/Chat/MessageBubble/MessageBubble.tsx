"use client";

import { useRef, useState } from "react";
import { Reply } from "lucide-react";

import { Message, MessageReplyPreview } from "@/lib/types/Message";

import ImageMessage from "../MessageTypes/ImageMessage";
import VideoMessage from "../MessageTypes/VideoMessage";
import SwapProposalCard from "../MessageTypes/SwapProposalCard";
import SwapAgreementCard from "../MessageTypes/SwapAgreementCard";
import SystemMessage from "../MessageTypes/SystemMessage";
import ReviewRequestCard from "../MessageTypes/ReviewRequestCard";

import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
    currentUserId: string;
    onReply?: (message: Message) => void;
    onUnsend?: (messageId: string) => void;
    onRemoveForMe?: (messageId: string) => void;
    highlighted?: boolean;
}

const SWIPE_TRIGGER_DISTANCE = 56; // px of drag before a swipe counts as "reply"
const SWIPE_MAX_DISTANCE = 72; // px the bubble is allowed to visually travel
const LONG_PRESS_MS = 450;
const MOVE_CANCELS_LONG_PRESS_PX = 8;

function replyPreviewText(message: MessageReplyPreview): string {
    if (message.messageType === "image") return "📷 Photo";
    if (message.messageType === "video") return "🎥 Video";
    if (message.messageType === "swap_proposal") return "Swap proposal";
    if (message.messageType === "swap_agreement") return "Swap agreement";
    if (message.messageType === "review_request") return "Review request";
    return message.message || "Message";
}

export default function MessageBubble({
    message,
    isMine,
    currentUserId,
    onReply,
    onUnsend,
    onRemoveForMe,
    highlighted,
}: MessageBubbleProps) {
    const [dragX, setDragX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const rowRef = useRef<HTMLDivElement | null>(null);
    const startXRef = useRef<number | null>(null);
    const startYRef = useRef<number | null>(null);
    const longPressTimerRef = useRef<number | null>(null);
    const swipeCommittedRef = useRef(false);

    function clearLongPressTimer() {
        if (longPressTimerRef.current) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }

    function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
        if (message.unsentAt) return; // nothing to do with an unsent message

        startXRef.current = event.clientX;
        startYRef.current = event.clientY;
        swipeCommittedRef.current = false;

        clearLongPressTimer();
        longPressTimerRef.current = window.setTimeout(() => {
            setMenuOpen(true);
        }, LONG_PRESS_MS);

        rowRef.current?.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
        if (startXRef.current === null || startYRef.current === null) return;
        if (message.unsentAt) return;

        const deltaX = event.clientX - startXRef.current;
        const deltaY = event.clientY - startYRef.current;

        if (
            Math.abs(deltaX) > MOVE_CANCELS_LONG_PRESS_PX ||
            Math.abs(deltaY) > MOVE_CANCELS_LONG_PRESS_PX
        ) {
            clearLongPressTimer();
        }

        // Mostly-vertical drags are a scroll gesture, not a swipe — bail out.
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;

        // Swipe right on their message, swipe left on your own message —
        // the opposite direction is just ignored (no visual movement).
        const allowedDirection = isMine ? deltaX < 0 : deltaX > 0;
        if (!allowedDirection) {
            setDragX(0);
            return;
        }

        const clamped = Math.max(
            -SWIPE_MAX_DISTANCE,
            Math.min(SWIPE_MAX_DISTANCE, deltaX)
        );
        setDragging(true);
        setDragX(clamped);

        if (Math.abs(clamped) >= SWIPE_TRIGGER_DISTANCE) {
            swipeCommittedRef.current = true;
        } else {
            swipeCommittedRef.current = false;
        }
    }

    function handlePointerUp() {
        clearLongPressTimer();

        if (swipeCommittedRef.current && onReply && !message.unsentAt) {
            onReply(message);
        }

        setDragging(false);
        setDragX(0);
        startXRef.current = null;
        startYRef.current = null;
        swipeCommittedRef.current = false;
    }

    function scrollToReplyTarget() {
        if (!message.replyPreview) return;
        const target = document.getElementById(`message-${message.replyPreview.id}`);
        if (!target) return;

        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add(styles.flashHighlight);
        window.setTimeout(() => {
            target.classList.remove(styles.flashHighlight);
        }, 1200);
    }

    // System messages render centered, without the mine/theirs bubble wrapper.
    if (message.messageType === "system") {
        return <SystemMessage text={message.message} isMine={isMine} />;
    }

    if (message.unsentAt) {
        return (
            <div
                id={`message-${message.id}`}
                className={isMine ? styles.mineRow : styles.theirsRow}
            >
                <div className={styles.unsentBubble}>
                    <em>This message was unsent</em>
                </div>
            </div>
        );
    }

    return (
        <div
            id={`message-${message.id}`}
            ref={rowRef}
            className={`${isMine ? styles.mineRow : styles.theirsRow} ${
                highlighted ? styles.flashHighlight : ""
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {!isMine && (
                <div
                    className={styles.replyIcon}
                    style={{ opacity: Math.min(1, Math.abs(dragX) / SWIPE_TRIGGER_DISTANCE) }}
                >
                    <Reply size={18} />
                </div>
            )}

            <div
                className={isMine ? styles.mine : styles.theirs}
                style={{
                    transform: `translateX(${dragX}px)`,
                    transition: dragging ? "none" : "transform 0.15s ease",
                }}
            >
                {message.replyPreview && (
                    <button
                        type="button"
                        className={styles.quotedReply}
                        onClick={scrollToReplyTarget}
                    >
                        <span className={styles.quotedReplySender}>
                            {message.replyPreview.senderId === currentUserId
                                ? "You"
                                : "Them"}
                        </span>
                        <span className={styles.quotedReplyText}>
                            {replyPreviewText(message.replyPreview)}
                        </span>
                    </button>
                )}

                {message.messageType === "image" && message.imageUrl ? (
                    <ImageMessage imageUrl={message.imageUrl} />
                ) : message.messageType === "video" && message.videoUrl ? (
                    <VideoMessage videoUrl={message.videoUrl} />
                ) : message.messageType === "swap_proposal" && message.swapRequestId ? (
                    <SwapProposalCard
                        swapRequestId={message.swapRequestId}
                        currentUserId={currentUserId}
                    />
                ) : message.messageType === "swap_agreement" && message.swapAgreementId ? (
                    <SwapAgreementCard swapAgreementId={message.swapAgreementId} />
                ) : message.messageType === "review_request" && message.swapAgreementId ? (
                    <ReviewRequestCard swapAgreementId={message.swapAgreementId} />
                ) : (
                    <p>
                        {message.message}
                    </p>
                )}

                <span>
                    {new Date(
                        message.createdAt
                    ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>

            {isMine && (
                <div
                    className={styles.replyIcon}
                    style={{ opacity: Math.min(1, Math.abs(dragX) / SWIPE_TRIGGER_DISTANCE) }}
                >
                    <Reply size={18} />
                </div>
            )}

            {menuOpen && (
                <>
                    <div
                        className={styles.menuBackdrop}
                        onClick={() => setMenuOpen(false)}
                    />
                    <div
                        className={isMine ? styles.menuMine : styles.menuTheirs}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                onReply?.(message);
                                setMenuOpen(false);
                            }}
                        >
                            Reply
                        </button>

                        {isMine && (
                            <button
                                type="button"
                                className={styles.destructive}
                                onClick={() => {
                                    onUnsend?.(message.id);
                                    setMenuOpen(false);
                                }}
                            >
                                Unsend
                            </button>
                        )}

                        <button
                            type="button"
                            className={styles.destructive}
                            onClick={() => {
                                onRemoveForMe?.(message.id);
                                setMenuOpen(false);
                            }}
                        >
                            Remove for You
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
