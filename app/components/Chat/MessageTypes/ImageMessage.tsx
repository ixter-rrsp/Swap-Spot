"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import styles from "./ImageMessage.module.css";

interface ImageMessageProps {
  imageUrl: string;
}

export default function ImageMessage({ imageUrl }: ImageMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock page scroll and allow Escape-to-close while the lightbox is open.
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
        className={styles.thumbnailButton}
        onClick={() => setExpanded(true)}
      >
        <Image
          src={imageUrl}
          alt="Sent image"
          width={200}
          height={200}
          className={styles.thumbnail}
        />
      </button>

      {expanded && mounted &&
        createPortal(
          <div
            className={styles.overlay}
            onClick={() => setExpanded(false)}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setExpanded(false)}
              aria-label="Close"
            >
              <X size={22} />
            </button>
            <div
              className={styles.fullImageWrap}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={imageUrl}
                alt="Sent image"
                fill
                sizes="100vw"
                className={styles.fullImage}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
