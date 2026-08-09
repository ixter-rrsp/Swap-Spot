"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    // Position for the portaled menu, computed fresh each time it opens
    // from the row's actual on-screen rect. Rendering the menu into a
    // portal with position: fixed (instead of position: absolute inside
    // the message row) means it's never clipped by .messageArea's
    // overflow-y: auto, no matter how close to the top/bottom of the
    // scroll area the long-pressed message is.
    const [menuPosition, setMenuPosition] = useState<{
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    } | null>(null);

    const rowRef = useRef<HTMLDivElement | null>(null);
    const startXRef = useRef<number | null>(null);
    const startYRef = useRef<number | null>(null);
    const longPressTimerRef = useRef<number | null>(null);
    const swipeCommittedRef = useRef(false);

    // Rough height of the options menu (Reply / Unsend / Remove for You,
    // ~3 rows) plus a little breathing room — used to decide whether to
    // anchor the menu above or below the long-pressed row.
    const MENU_ESTIMATED_HEIGHT = 160;
    const MENU_MARGIN = 8;

    function openMenu() {
        const rect = rowRef.current?.getBoundingClientRect();

        if (!rect) {
            setMenuOpen(true);
            return;
        }

        const notEnoughRoomAbove = rect.top < MENU_ESTIMATED_HEIGHT;

        const horizontal = isMine
            ? { right: Math.max(MENU_MARGIN, window.innerWidth - rect.right) }
            : { left: Math.max(MENU_MARGIN, rect.left) };

        const vertical = notEnoughRoomAbove
            ? { top: rect.bottom + MENU_MARGIN }
            : { bottom: window.innerHeight - rect.top + MENU_MARGIN };

        setMenuPosition({ ...horizontal, ...vertical });
        setMenuOpen(true);
    }

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
            openMenu();
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
                className={
                    message.messageType === "image" || message.messageType === "video"
                        ? isMine
                            ? styles.mineMedia
                            : styles.theirsMedia
                        : isMine
                        ? styles.mine
                        : styles.theirs
                }
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
                        <span className={styles.quotedReplyText}>
                            {replyPreviewText(message.replyPreview)}
                        </span>
                    </button>
                )}

                {message.messageType === "image" && message.imageUrl ? (
                    <div className={styles.mediaWrap}>
                        <ImageMessage imageUrl={message.imageUrl} />
                        <span className={styles.mediaTimestamp}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                ) : message.messageType === "video" && message.videoUrl ? (
                    <div className={styles.mediaWrap}>
                        <VideoMessage videoUrl={message.videoUrl} />
                        <span className={styles.mediaTimestamp}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
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
                    <p className={styles.messageText}>
                        {message.message}
                    </p>
                )}

                {message.messageType !== "image" && message.messageType !== "video" && (
                    <span>
                        {new Date(
                            message.createdAt
                        ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                )}
            </div>

            {isMine && (
                <div
                    className={styles.replyIcon}
                    style={{ opacity: Math.min(1, Math.abs(dragX) / SWIPE_TRIGGER_DISTANCE) }}
                >
                    <Reply size={18} />
                </div>
            )}

            {menuOpen &&
                createPortal(
                    <>
                        <div
                            className={styles.menuBackdrop}
                            onClick={() => setMenuOpen(false)}
                        />
                        <div
                            className={styles.menuPortal}
                            style={{
                                top: menuPosition?.top,
                                bottom: menuPosition?.bottom,
                                left: menuPosition?.left,
                                right: menuPosition?.right,
                            }}
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
                    </>,
                    document.body
                )}
        </div>
    );
}