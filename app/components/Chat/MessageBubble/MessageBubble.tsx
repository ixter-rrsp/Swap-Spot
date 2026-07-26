import { Message } from "@/lib/types/Message";

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
}

export default function MessageBubble({
    message,
    isMine,
    currentUserId,
}: MessageBubbleProps) {

    // System messages render centered, without the mine/theirs bubble wrapper.
    if (message.messageType === "system") {
        return <SystemMessage text={message.message} />;
    }

    return (
        <div
            className={
                isMine
                    ? styles.mine
                    : styles.theirs
            }
        >

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
    );
}