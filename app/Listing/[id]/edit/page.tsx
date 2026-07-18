import { notFound } from "next/navigation";
import { getListingById } from "@/lib/services/ServerListingService";
import { Listing } from "@/lib/types/Listing";
import PostListingForm from "@/app/components/PostListing/PostListingForm/PostListingForm";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css"

interface EditListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {

  const { id } = await params;

  let listing: Listing;

  try {
    listing = await getListingById(id);
    console.log("DETAIL LISTING:", JSON.stringify(listing, null, 2));
  } catch (error) {
    console.error("GET LISTING ERROR:", error);
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || listing.owner.id !== user.id) {
    notFound();
  }

  return (
    <main className={styles.container}> {/* Add className here */}
      <PostListingForm listing={listing} />
    </main>
  );
}