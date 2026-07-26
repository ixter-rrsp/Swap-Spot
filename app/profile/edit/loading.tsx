import Skeleton from "@/app/components/UI/Skeleton/Skeleton";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 96, height: 96, borderRadius: 999, background: '#e5e7eb' }} />
        <div style={{ flex: 1 }}>
          <Skeleton height="24px" width="40%" />
          <div style={{ height: 8 }} />
          <Skeleton height="16px" width="60%" />
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="44px" width="100%" />
        ))}
      </div>
    </div>
  );
}
