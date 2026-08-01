"use client";

import { ChangeEvent, useRef } from "react";
import { ImagePlus, X } from "lucide-react";

import type { ListingImage } from "@/lib/types/ListingImage";

import styles from "./ImageUploader.module.css";

interface ImageUploaderProps {
  images: ListingImage[];
  onImagesChange: (images: ListingImage[]) => void;
  disabled?: boolean;
}

export default function ImageUploader({
  images,
  onImagesChange,
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);


  function openPicker() {
    if (disabled) return;

    inputRef.current?.click();
  }


  function getImageSource(image: ListingImage) {
    if (image.existing) {
      return image.preview;
    }

    return image.preview;
  }


  function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files) return;


    const selected: ListingImage[] =
      Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        existing: false,
        file,
      }));


    const updated = [
      ...images,
      ...selected,
    ].slice(0, 5);


    onImagesChange(updated);

    event.target.value = "";
  }


  function removeImage(index: number) {

    const removed = images[index];


    if (
      removed &&
      !removed.existing &&
      removed.preview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        removed.preview
      );
    }


    const updated =
      images.filter(
        (_, i) => i !== index
      );


    onImagesChange(updated);
  }


  function setFeaturedImage(index: number) {
    if (index === 0) return;


    const updated = [...images];

    const [selected] =
      updated.splice(index, 1);


    updated.unshift(selected);


    onImagesChange(updated);
  }


  return (
    <section className={styles.container}>

      <input
        ref={inputRef}
        hidden
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
      />


      {images.length === 0 ? (

        <button
          type="button"
          className={styles.uploadBox}
          onClick={openPicker}
          disabled={disabled}
        >
          <ImagePlus size={54} />

          <span>
            Tap to add photo
          </span>

          <small>
            Maximum 5 photos
          </small>

        </button>

      ) : (

        <>

          {/* Featured Image */}

          <div className={styles.featuredPreview}>

            <img
              src={getImageSource(images[0])}
              alt="Featured"
            />


            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removeImage(0)}
              disabled={disabled}
            >
              <X size={18} />
            </button>

          </div>



          {/* Thumbnail Row */}

          <div className={styles.thumbnailRow}>

            {images.slice(1).map(
              (image, index) => (

              <button
                key={image.id}
                type="button"
                className={styles.thumbnail}
                onClick={() =>
                  setFeaturedImage(index + 1)
                }
                title="Make cover photo"
                disabled={disabled}
              >

                <img
                  src={getImageSource(image)}
                  alt=""
                />

              </button>

            ))}



            {images.length < 5 && (

              <button
                type="button"
                className={styles.addThumbnail}
                onClick={openPicker}
                disabled={disabled}
              >
                <ImagePlus size={22} />
              </button>

            )}

          </div>



          <small className={styles.counter}>
            {images.length} of 5 photos selected
          </small>

        </>

      )}

    </section>
  );
}