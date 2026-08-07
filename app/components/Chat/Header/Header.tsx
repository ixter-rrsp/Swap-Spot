"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import BackButton from "@/app/components/UI/BackButton/BackButton";
import VerifiedBadge from "@/app/components/UI/VerifiedBadge/VerifiedBadge";
import { subscribeChannel } from "@/utils/supabase/channelRegistry";

import styles from "./ChatHeader.module.css";

interface HeaderProps {
    otherUserId: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    isVerified?: boolean;
    lastSeenAt: string | null;
    listingId: string;
    listingTitle: string;
    listingImage: string | null;
    swapValue?: number;
}

// Anyone whose last heartbeat landed within this window counts as
// "Active now" — heartbeats fire every 45s while a tab is visible
// (see usePresenceHeartbeat), so this comfortably covers normal gaps
// between pings without flickering to "1m ago" and back.
const ACTIVE_NOW_THRESHOLD_MS = 2 * 60 * 1000;

function getActiveStatusLabel(lastSeenAt: string | null): {
    label: string;
    isActiveNow: boolean;
} {
    if (!lastSeenAt) {
        return { label: "Offline", isActiveNow: false };
    }

    const lastSeenMs = new Date(lastSeenAt).getTime();

    if (Number.isNaN(lastSeenMs)) {
        return { label: "Offline", isActiveNow: false };
    }

    const diffMs = Date.now() - lastSeenMs;

    if (diffMs < ACTIVE_NOW_THRESHOLD_MS) {
        return { label: "Active now", isActiveNow: true };
    }

    const diffMinutes = Math.floor(diffMs / (60 * 1000));

    if (diffMinutes < 60) {
        return { label: `Active ${diffMinutes}m ago`, isActiveNow: false };
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
        return { label: `Active ${diffHours}h ago`, isActiveNow: false };
    }

    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 7) {
        return { label: `Active ${diffDays}d ago`, isActiveNow: false };
    }

    return { label: "Active a while ago", isActiveNow: false };
}

export default function Header({
    otherUserId,
    username,
    fullName,
    avatarUrl,
    isVerified,
    lastSeenAt: initialLastSeenAt,
    listingId,
    listingTitle,
    listingImage,
    swapValue,
}: HeaderProps) {

    const [lastSeenAt, setLastSeenAt] = useState(initialLastSeenAt);
    const [status, setStatus] = useState(() => getActiveStatusLabel(initialLastSeenAt));

    // Keep in sync if the parent re-fetches (e.g. navigating between
    // conversations without a full remount).
    useEffect(() => {
        setLastSeenAt(initialLastSeenAt);
    }, [initialLastSeenAt]);

    // Recompute the label on a timer so "Active now" naturally ages
    // into "Active 3m ago" etc. without needing a page refresh.
    useEffect(() => {
        setStatus(getActiveStatusLabel(lastSeenAt));

        const interval = window.setInterval(() => {
            setStatus(getActiveStatusLabel(lastSeenAt));
        }, 30_000);

        return () => window.clearInterval(interval);
    }, [lastSeenAt]);

    // Live-update the instant the other person's heartbeat lands, if
    // Realtime is enabled for the profiles table. Falls back gracefully
    // to the 30s timer above if it isn't.
    useEffect(() => {
        if (!otherUserId) return;

        const unsubscribe = subscribeChannel(
            `presence:${otherUserId}`,
            {
                event: "UPDATE",
                schema: "public",
                table: "profiles",
                filter: `id=eq.${otherUserId}`,
            },
            (payload: any) => {
                const nextLastSeenAt = payload?.new?.last_seen_at;
                if (nextLastSeenAt) {
                    setLastSeenAt(nextLastSeenAt);
                }
            }
        );

        return () => {
            try {
                unsubscribe?.();
            } catch {
                // ignore
            }
        };
    }, [otherUserId]);

    return (
        <header className={styles.container}>

            <div className={styles.topRow}>

                <BackButton variant="inline" />

                <div className={styles.user}>

                    <div className={styles.avatar}>

                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={username}
                                fill
                            />
                        ) : (
                            <span>
                                {username.charAt(0).toUpperCase()}
                            </span>
                        )}

                    </div>

                    <div>
                        <h3>
                            {fullName || username}
                            {isVerified && <VerifiedBadge size={14} />}
                        </h3>

                        <p
                            className={styles.activeStatus}
                            data-offline={!status.isActiveNow}
                        >
                            <span
                                className={styles.activeDot}
                                data-offline={!status.isActiveNow}
                            />
                            {status.label}
                        </p>
                    </div>

                </div>

            </div>

            <Link href={`/Listing/${listingId}`} className={styles.listing}>

                {listingImage && (
                    <Image
                        src={listingImage}
                        alt={listingTitle}
                        width={36}
                        height={36}
                        className={styles.listingImage}
                    />
                )}

                <div className={styles.listingText}>
                    <span className={styles.listingTitle}>{listingTitle}</span>
                    {swapValue !== undefined && (
                        <span className={styles.listingValue}>
                            Swap value · {swapValue.toLocaleString()}
                        </span>
                    )}
                </div>

                <span className={styles.viewLink}>View listing</span>

            </Link>

        </header>
    );
}