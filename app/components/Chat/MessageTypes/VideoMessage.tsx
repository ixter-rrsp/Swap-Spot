"use client";

import styles from "./VideoMessage.module.css";

interface VideoMessageProps {
  videoUrl: string;
}

export default function VideoMessage({ videoUrl }: VideoMessageProps) {
  return (
    <video
      src={videoUrl}
      controls
      className={styles.video}
    />
  );
}