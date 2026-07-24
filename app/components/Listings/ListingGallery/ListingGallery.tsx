"use client";

import { useState } from "react";
import Image from "next/image";

import { ListingImage } from "@/lib/types/Listing";

import styles from "./ListingGallery.module.css";


interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
}


const MAX_VISIBLE_THUMBNAILS = 4;


export default function ListingGallery({
  images,
  title,
}: ListingGalleryProps) {

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex]?.url;


  if (!selectedImage) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.placeholder}>
            <span>No Image Available</span>
          </div>
        </div>
      </section>
    );
  }


  const visibleThumbnails = images.slice(0, MAX_VISIBLE_THUMBNAILS);
  const overflowCount = images.length - MAX_VISIBLE_THUMBNAILS;
  const hasOverflow = overflowCount > 0;


  return (
    <section className={styles.wrapper}>

      <div className={styles.container}>
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

          {visibleThumbnails.map((image, index) => {
            const isLastVisible =
              hasOverflow && index === MAX_VISIBLE_THUMBNAILS - 1;

            return (
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

                {isLastVisible && (
                  <span className={styles.overflowOverlay}>
                    +{overflowCount}
                  </span>
                )}

              </button>
            );
          })}

        </div>
      )}

    </section>
  );
}