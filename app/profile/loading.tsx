import Skeleton from "@/app/components/UI/Skeleton/Skeleton";
import ListingCardSkeleton from "@/app/components/UI/ListingSkeleton/ListingSkeleton";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <main className={styles.profilePage}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 0' }}>
        <div style={{ width: 96, height: 96, borderRadius: 999, background: '#e5e7eb' }} />
        <div style={{ flex: 1 }}>
          <Skeleton height="20px" width="40%" />
          <div style={{ height: 8 }} />
          <Skeleton height="14px" width="30%" />
          <div style={{ height: 12 }} />
          <Skeleton height="12px" width="50%" />
        </div>
      </header>

      <section style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Skeleton height="80px" width="100%" />
          </div>
          <div style={{ flex: 1 }}>
            <Skeleton height="80px" width="100%" />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
