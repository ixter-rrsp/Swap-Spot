import ListingCardSkeleton from "@/app/components/UI/ListingSkeleton/ListingSkeleton";
import Skeleton from "@/app/components/UI/Skeleton/Skeleton";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <main className={styles.container}>
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: 220, height: 140, background: '#e5e7eb', borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <Skeleton height="22px" width="60%" />
            <div style={{ height: 8 }} />
            <Skeleton height="14px" width="40%" />
            <div style={{ height: 12 }} />
            <Skeleton height="14px" width="30%" />
          </div>
        </div>

        <ListingCardSkeleton />
      </div>
    </main>
  );
}
