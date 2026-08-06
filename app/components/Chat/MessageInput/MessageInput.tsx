"use client";

import { useRef, useState, useEffect } from "react";
import { Paperclip, SendHorizontal, LoaderCircle, X } from "lucide-react";
import { Message } from "@/lib/types/Message";

import styles from "./MessageInput.module.css";

interface FileMeta {
    file: File;
    previewUrl: string;
    progress: number; // 0-100
}

interface SendResult {
    promise: Promise<void>;
    abort?: () => void;
}

interface MessageInputProps {
    onSend: (
        message: string,
        files?: File[],
        onProgress?: (fileIndex: number, percent: number) => void,
        replyToId?: string | null
    ) => Promise<SendResult | void>;
    replyingTo?: Message | null;
    onCancelReply?: () => void;
    getReplyPreviewLabel?: (message: Message) => string;
}

// Roughly 5-6 lines at the app's base font size/line-height before the
// textarea stops growing and starts scrolling internally instead.
const MAX_TEXTAREA_HEIGHT = 140;

export default function MessageInput({
    onSend,
    replyingTo,
    onCancelReply,
    getReplyPreviewLabel,
}: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileMeta[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const [abortFn, setAbortFn] = useState<(() => void) | null>(null);
    const pendingPercentsRef = useRef<Record<number, number>>({});
    const timersRef = useRef<Record<number, number>>({});

    function resizeTextarea() {
        const el = textareaRef.current;
        if (!el) return;
        // Reset height first so shrinking (e.g. after deleting text or
        // sending) is measured correctly, not just growth.
        el.style.height = "auto";
        const nextHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
        el.style.height = `${nextHeight}px`;
        el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    }

    useEffect(() => {
        resizeTextarea();
    }, [message]);

    // Focus the input and keep the cursor visible whenever a reply target
    // is chosen, matching Instagram/Messenger behavior of jumping straight
    // into typing the reply.
    useEffect(() => {
        if (replyingTo) {
            textareaRef.current?.focus();
        }
    }, [replyingTo]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage && selectedFiles.length === 0) {
            return;
        }

        try {
            setLoading(true);

            const result = await onSend(
                trimmedMessage,
                selectedFiles.map((s) => s.file),
                (fileIndex: number, percent: number) => {
                    pendingPercentsRef.current[fileIndex] = percent;

                    if (timersRef.current[fileIndex]) return;

                    timersRef.current[fileIndex] = window.setTimeout(() => {
                        const pending = pendingPercentsRef.current[fileIndex];

                        setSelectedFiles((prev) => {
                            const next = [...prev];
                            const meta = next[fileIndex];
                            if (!meta) return prev;

                            const current = meta.progress || 0;

                            if (Math.abs(pending - current) >= 3 || pending === 100) {
                                next[fileIndex] = { ...meta, progress: pending };
                            }

                            return next;
                        });

                        delete pendingPercentsRef.current[fileIndex];
                        clearTimeout(timersRef.current[fileIndex]);
                        delete timersRef.current[fileIndex];
                    }, 100);
                },
                replyingTo?.id ?? null
            );

            if (result && result.promise) {
                setUploading(true);
                setAbortFn(() => result.abort ?? null);

                try {
                    await result.promise;
                } finally {
                    setUploading(false);
                    setAbortFn(null);
                }
            }

            setMessage("");
            onCancelReply?.();

            selectedFiles.forEach((s) => URL.revokeObjectURL(s.previewUrl));

            setSelectedFiles([]);
        } finally {
            setLoading(false);
            setUploading(false);
            setAbortFn(null);
        }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        // Enter sends, Shift+Enter inserts a newline — standard messaging
        // app convention, and necessary now that this is a multiline field.
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
        }
    }

    function handleFileSelection(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const files = Array.from(event.target.files ?? []);
        const acceptedFiles = files.filter((file) => {
            const type = file.type.toLowerCase();
            return (
                ["image/jpeg", "image/png", "image/webp"].includes(type) ||
                ["video/mp4", "video/quicktime", "video/webm"].includes(type)
            );
        });

        if (acceptedFiles.length > 0) {
            const metas = acceptedFiles.map((file) => ({
                file,
                previewUrl: URL.createObjectURL(file),
                progress: 0,
            }));

            setSelectedFiles((previous) => [...previous, ...metas]);
        }

        event.target.value = "";
    }

    useEffect(() => {
        return () => {
            selectedFiles.forEach((s) => {
                try {
                    URL.revokeObjectURL(s.previewUrl);
                } catch (e) {
                    // ignore
                }
            });

            Object.values(timersRef.current).forEach((t) => clearTimeout(t));
            timersRef.current = {};
            pendingPercentsRef.current = {};
        };
    }, []);

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
        >
            {replyingTo && (
                <div className={styles.replyPreview}>
                    <div className={styles.replyPreviewBar} />
                    <div className={styles.replyPreviewContent}>
                        <span className={styles.replyPreviewLabel}>
                            {getReplyPreviewLabel
                                ? getReplyPreviewLabel(replyingTo)
                                : replyingTo.message || "Attachment"}
                        </span>
                    </div>
                    <button
                        type="button"
                        aria-label="Cancel reply"
                        className={styles.replyPreviewClose}
                        onClick={onCancelReply}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {selectedFiles.length > 0 && (
                <div className={styles.previewList}>
                    {selectedFiles.map((meta, index) => (
                        <div key={`${meta.file.name}-${index}`} className={styles.previewChip}>
                            <div className={styles.previewInner}>
                                {meta.file.type.startsWith("image/") ? (
                                    <img src={meta.previewUrl} alt={meta.file.name} className={styles.previewImage} />
                                ) : meta.file.type.startsWith("video/") ? (
                                    <video src={meta.previewUrl} className={styles.previewImage} muted />
                                ) : (
                                    <span className={styles.previewName}>{meta.file.name}</span>
                                )}

                                <button
                                    type="button"
                                    aria-label={`Remove ${meta.file.name}`}
                                    className={styles.removeButton}
                                    onClick={() => {
                                        try {
                                            URL.revokeObjectURL(meta.previewUrl);
                                        } catch (e) {
                                            // ignore
                                        }

                                        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                                    }}
                                >
                                    <X size={14} />
                                </button>

                                <div className={styles.progressWrap}>
                                    <div className={styles.progressBar} style={{ width: `${meta.progress}%` }} />
                                </div>

                                {uploading && (
                                    <div className={styles.uploadOverlay}>
                                        <LoaderCircle size={18} />
                                        {abortFn && (
                                            <button
                                                type="button"
                                                className={styles.cancelUpload}
                                                onClick={() => {
                                                    try {
                                                        abortFn();
                                                    } catch (e) {}

                                                    setUploading(false);
                                                    setAbortFn(null);
                                                    selectedFiles.forEach((s) => {
                                                        try {
                                                            URL.revokeObjectURL(s.previewUrl);
                                                        } catch {}
                                                    });
                                                    setSelectedFiles([]);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.inputRow}>
                <button
                    type="button"
                    className={styles.attachmentButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                >
                    <Paperclip size={18} />
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                    multiple
                    hidden
                    onChange={handleFileSelection}
                />

                <textarea
                    ref={textareaRef}
                    className={styles.textInput}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message…"
                    disabled={loading}
                    rows={1}
                />

                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={loading}
                >
                    {loading ? <LoaderCircle size={18} className={styles.spinner} /> : <SendHorizontal size={18} />}
                </button>
            </div>
        </form>
    );
}
