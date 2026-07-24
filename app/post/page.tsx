import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";
import PostListingForm from "@/app/components/PostListing/PostListingForm/PostListingForm";

export default async function PostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>
        Post a Listing
      </h1>

      <PostListingForm />
    </main>
  );
}