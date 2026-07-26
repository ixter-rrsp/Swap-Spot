import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import Skeleton from "@/app/components/UI/Skeleton/Skeleton";
import ListingCardSkeleton from "@/app/components/UI/ListingSkeleton/ListingSkeleton";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <PageHeader title="Notifications" showBack={false} />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>UPDATES</span>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e5e7eb' }} />
              <div style={{ flex: 1 }}>
                <Skeleton height="16px" width="60%" />
                <div style={{ height: 6 }} />
                <Skeleton height="14px" width="40%" />
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 18 }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 72, height: 44, borderRadius: 8, background: '#e5e7eb' }} />
          <div style={{ flex: 1 }}>
            <Skeleton height="18px" width="40%" />
            <div style={{ height: 8 }} />
            <Skeleton height="14px" width="30%" />
          </div>
        </div>
      </section>

      <div style={{ marginTop: 20 }}>
        <ListingCardSkeleton />
      </div>
    </div>
  );
}
