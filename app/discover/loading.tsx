import ListingCardSkeleton from "@/app/components/UI/ListingSkeleton/ListingSkeleton";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div style={{ height: 280, background: '#e5e7eb', borderRadius: 12, marginBottom: 16 }} />

        <section style={{ display: 'grid', gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </section>

        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e5e7eb' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: '50%', background: '#e5e7eb', borderRadius: 6 }} />
            <div style={{ height: 8 }} />
            <div style={{ height: 10, width: '30%', background: '#e5e7eb', borderRadius: 6 }} />
          </div>
        </div>
      </main>
    </div>
  );
}
