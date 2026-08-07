"use client";

import { useEffect, useState } from "react";

import styles from "./UploadTile.module.css";

interface UploadTileProps {
  id: string;
  file: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  accept?: string;
}

export default function UploadTile({
  id,
  file,
  onChange,
  label = "Upload",
  accept = "image/*",
}: UploadTileProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className={styles.tile}>
      <input
        id={id}
        type="file"
        accept={accept}
        className={styles.input}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {previewUrl ? (
        <>
          <img src={previewUrl} alt="Selected upload" className={styles.previewImg} />
          <button
            type="button"
            className={styles.remove}
            aria-label="Remove file"
            onClick={() => onChange(null)}
          >
            ×
          </button>
          <label htmlFor={id} className={styles.replace}>
            Replace
          </label>
        </>
      ) : (
        <label htmlFor={id} className={styles.placeholder}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 8.5C4 7.67157 4.67157 7 5.5 7H7.32918C7.77098 7 8.18627 6.79063 8.45 6.43333L9.15 5.48333C9.53406 4.96438 10.1445 4.65 10.79 4.65H13.21C13.8555 4.65 14.4659 4.96438 14.85 5.48333L15.55 6.43333C15.8137 6.79063 16.229 7 16.6708 7H18.5C19.3284 7 20 7.67157 20 8.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V8.5Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span>{label}</span>
        </label>
      )}
    </div>
  );
}
