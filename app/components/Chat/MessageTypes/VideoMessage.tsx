"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import styles from "./VideoMessage.module.css";

interface VideoMessageProps {
  videoUrl: string;
}

export default function VideoMessage({ videoUrl }: VideoMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  return (
    <>
      <button
        type="button"
        className={styles.thumbnailButton}
        onClick={() => setExpanded(true)}
      >
        <video src={videoUrl} className={styles.video} muted playsInline />
        <span className={styles.playOverlay} aria-hidden="true">
          ▶
        </span>
      </button>

      {expanded && mounted &&
        createPortal(
          <div className={styles.overlay} onClick={() => setExpanded(false)}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setExpanded(false)}
              aria-label="Close"
            >
              <X size={22} />
            </button>
            <video
              src={videoUrl}
              className={styles.fullVideo}
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  );
}
