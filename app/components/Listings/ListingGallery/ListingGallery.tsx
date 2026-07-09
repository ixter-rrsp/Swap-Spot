import Image from "next/image";

import styles from "./ListingGallery.module.css";

interface ListingGalleryProps {
  imageUrl?: string;
  title: string;
}

export default function ListingGallery({
  imageUrl,
  title,
}: ListingGalleryProps) {
  return (
    <section className={styles.container}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className={styles.image}
        />
      ) : (
        <div className={styles.placeholder}>
          <span>No Image Available</span>
        </div>
      )}
    </section>
  );
}