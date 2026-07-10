import styles from "./page.module.css";

import PostListingForm from "@/app/components/PostListing/PostListingForm/PostListingForm";

export default function PostPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>
        Post a Listing
      </h1>

      <PostListingForm />
    </main>
  );
}