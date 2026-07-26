"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./ImageMessage.module.css";

interface ImageMessageProps {
  imageUrl: string;
}

export default function ImageMessage({ imageUrl }: ImageMessageProps) {
  const [expanded, setExpanded] = useState(false);

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

      {expanded && (
        <div
          className={styles.overlay}
          onClick={() => setExpanded(false)}
        >
          <Image
            src={imageUrl}
            alt="Sent image"
            width={800}
            height={800}
            className={styles.fullImage}
          />
        </div>
      )}
    </>
  );
}