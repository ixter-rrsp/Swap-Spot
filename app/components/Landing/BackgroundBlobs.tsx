import styles from "./Landing.module.css";

export default function BackgroundBlobs() {
  return (
    <div className={styles.blobLayer} aria-hidden="true">
      <div className={`${styles.blob} ${styles.blobOne}`} />
      <div className={`${styles.blob} ${styles.blobTwo}`} />
      <div className={`${styles.blob} ${styles.blobThree}`} />
    </div>
  );
}
