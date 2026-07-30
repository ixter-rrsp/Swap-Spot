import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";
import PostListingForm from "@/app/components/PostListing/PostListingForm/PostListingForm";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

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
      <PageHeader title="Post a Listing" />

      <Suspense fallback={null}>
        <PostListingForm />
      </Suspense>
    </main>
  );
}