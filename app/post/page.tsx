import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { getListingById } from "@/lib/services/ServerListingService";
import styles from "./page.module.css";
import PostListingForm from "@/app/components/PostListing/PostListingForm/PostListingForm";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

interface PostPageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function PostPage({ searchParams }: PostPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { edit: editListingId } = await searchParams;

  let listing = undefined;

  if (editListingId) {
    try {
      listing = await getListingById(editListingId);
    } catch {
      notFound();
    }

    if (listing.owner.id !== user.id) {
      // Not your listing - don't let someone edit via a guessed URL.
      redirect("/profile");
    }
  }

  return (
    <main className={styles.container}>
      <PageHeader title={listing ? "Edit Listing" : "Post a Listing"} showBack />

      <Suspense fallback={null}>
        <PostListingForm listing={listing} />
      </Suspense>
    </main>
  );
}