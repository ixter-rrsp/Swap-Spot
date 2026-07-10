"use client";

import { useRef, ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";

import styles from "./ImageUploader.module.css";

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
}

export default function ImageUploader({
  images,
  onImagesChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files) return;

    const selectedFiles = Array.from(files);

    const updatedImages = [...images, ...selectedFiles].slice(0, 5);

    onImagesChange(updatedImages);

    event.target.value = "";
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <section className={styles.container}>
      <label className={styles.label}>
        Photos
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleChange}
      />

      <div
        className={styles.uploadBox}
        onClick={handleClick}
      >
        <ImagePlus size={40} />

        <p style={{ color: "#6b7280" }}>Add Photos</p>

        <span>{images.length}/5 selected</span>
      </div>

      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((image, index) => (
            <div
              key={index}
              className={styles.preview}
            >
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className={styles.image}
                />

              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeImage(index)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}