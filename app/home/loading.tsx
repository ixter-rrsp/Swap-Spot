import HomeHeader from "../components/HomePage/HomeHeader/HomeHeader";
import SearchBar from "../components/HomePage/SearchBar/SearchBar";

import PageLoading from "@/app/components/UI/PageLoading/PageLoading";

import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <HomeHeader />

      <section className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <div className={styles.searchPlaceholder} />
        </div>
      </section>

      <div className={styles.categoryPlaceholder}>
        <div className={styles.chipPlaceholder} />
        <div className={styles.chipPlaceholder} />
        <div className={styles.chipPlaceholder} />
      </div>

      <PageLoading />
    </div>
  );
}