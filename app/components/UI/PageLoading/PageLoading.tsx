import ListingCardSkeleton from "@/app/components/UI/ListingSkeleton/ListingSkeleton";
import styles from "./PageLoading.module.css";

interface PageLoadingProps {
  sections?: string[];
}

export default function PageLoading({ sections }: PageLoadingProps) {
  const titles = sections ?? ["Boosted Listings", "Nearby Swaps", "Recommended for You", "Newest Listings"];

  return (
    <>
      {titles.map((title) => (
        <section className={styles.section} key={title}>
          <div className={styles.header}>
            <h2>{title}</h2>
            <span>See All</span>
          </div>

          <div className={styles.grid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
