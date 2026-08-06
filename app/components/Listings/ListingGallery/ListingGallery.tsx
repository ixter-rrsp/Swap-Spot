"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { ListingImage } from "@/lib/types/Listing";

import styles from "./ListingGallery.module.css";


interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
  boosted?: boolean;
}


// A swipe shorter than this (in pixels) is treated as a tap/scroll, not a
// deliberate "go to next/prev image" gesture.
const SWIPE_THRESHOLD = 40;


export default function ListingGallery({
  images,
  title,
  boosted = false,
}: ListingGalleryProps) {

  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const selectedImage = images[selectedIndex]?.url;

  const containerClassName = `${styles.container} ${boosted ? styles.boosted : ""}`;

  if (!selectedImage) {
    return (
      <section className={styles.wrapper}>
        <div className={containerClassName}>
          <div className={styles.placeholder}>
            <span>No Image Available</span>
          </div>
        </div>
      </section>
    );
  }

  function goToNext() {
    setSelectedIndex((index) => (index + 1) % images.length);
  }

  function goToPrevious() {
    setSelectedIndex((index) => (index - 1 + images.length) % images.length);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || images.length <= 1) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    if (deltaX < 0) {
      goToNext(); // swiped left -> next image
    } else {
      goToPrevious(); // swiped right -> previous image
    }
  }


  return (
    <section className={styles.wrapper}>

      <div
        className={containerClassName}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={selectedImage}
          alt={title}
          fill
          priority
          className={styles.image}
        />

        {images.length > 1 && (
          <span className={styles.counter}>
            {selectedIndex + 1} of {images.length}
          </span>
        )}
      </div>


      {images.length > 1 && (
        <div className={styles.thumbnails}>

          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={
                selectedIndex === index
                  ? styles.activeThumbnail
                  : styles.thumbnail
              }
            >

              <Image
                src={image.url}
                alt={title}
                fill
                className={styles.thumbnailImage}
              />

            </button>
          ))}

        </div>
      )}

    </section>
  );
}