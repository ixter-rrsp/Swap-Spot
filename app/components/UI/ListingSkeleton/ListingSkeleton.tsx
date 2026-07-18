import Skeleton from "@/app/components/UI/Skeleton/Skeleton";

import styles from "./ListingSkeleton.module.css";

export default function ListingCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton
        className={styles.image}
        borderRadius="0"
      />

      <div className={styles.content}>
        <Skeleton height="20px" width="80%" />

        <Skeleton height="16px" width="50%" />

        <Skeleton height="16px" width="60%" />

        <Skeleton height="16px" width="70%" />

        <div className={styles.footer}>
          <Skeleton
            height="18px"
            width="45px"
          />
        </div>
      </div>
    </div>
  );
}