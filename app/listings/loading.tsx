import ListingCardSkeleton from "@/app/components/UI/ListingSkeleton/ListingSkeleton";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div style={{ display: 'grid', gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
