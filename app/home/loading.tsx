import HomeHeader from "../components/HomePage/HomeHeader/HomeHeader";
import SearchBar from "../components/HomePage/SearchBar/SearchBar";
import CategoryChips from "../components/HomePage/CategoryChips/CategoryChips";

import ListingCardSkeleton from "../components/UI/ListingSkeleton/ListingSkeleton";

import styles from "./page.module.css";
import skeletonStyles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <HomeHeader />

      <section className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <div className={styles.searchPlaceholder} />
        </div>
      </section>

      <CategoryChips />

      <Section title="Boosted Listings" />

      <Section title="Nearby Swaps" />

      <Section title="Recommended for You" />

      <Section title="Newest Listings" />
    </div>
  );
}

function Section({
  title,
}: {
  title: string;
}) {
  return (
    <section className={skeletonStyles.section}>
      <div className={skeletonStyles.header}>
        <h2>{title}</h2>

        <span>See All</span>
      </div>

      <div className={skeletonStyles.grid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <ListingCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}