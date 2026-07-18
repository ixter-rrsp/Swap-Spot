import ProfileHeader from "../components/Profile/ProfileHeader/ProfileHeader";
import ProfileStats from "../components/Profile/ProfileStats/ProfileStats";
import ProgressCard from "../components/Profile/ProgressCard/ProgressCard";
import ProfileContent from "../components/Profile/ProfileContent/ProfileContent";
import { createClient } from "@/utils/supabase/server";
import { Listing } from "@/lib/types/Listing";
import { getCurrentProfile } from "@/lib/services/ProfileService";
import { getMyListings } from "@/lib/services/ServerListingService";
import styles from "./page.module.css";


export default async function ProfilePage() {
  const supabase = await createClient();

  // Run the test query first
  const { data, error } = await supabase
    .from("swap_requests")
    .select(`
      *,
      sender:profiles!swap_requests_sender_id_fkey(
        id,
        username,
        full_name,
        avatar_url
      ),
      receiver:profiles!swap_requests_receiver_id_fkey(
        id,
        username,
        full_name,
        avatar_url
      ),
      offered_listing:listings!swap_requests_offered_listing_id_fkey(
        id,
        title,
        city,
        swap_value,
        listing_images(
          image_url,
          sort_order
        )
      ),
      requested_listing:listings!swap_requests_requested_listing_id_fkey(
        id,
        title,
        city,
        swap_value,
        listing_images(
          image_url,
          sort_order
        )
      )
    `);

  console.log("SWAP REQUEST TEST");
  console.log(JSON.stringify(data, null, 2));

  if (error) {
    console.error("ERROR:", error);
  }

  // Now get the profile and listings data
  const profile = await getCurrentProfile();
  const myOffers = await getMyListings();
  const receivedOffers: Listing[] = [];

  return (
    <main className={styles.profilePage}>
      <ProfileHeader
        username={profile?.username ?? "Unknown User"}
        avatarUrl={profile?.avatarUrl}
        badge={profile?.badge ?? "Member"}
        showActions={false}
      />

      <ProfileStats />

      <ProgressCard
        completed={18}
        confirmed={20}
      />

      <ProfileContent
        myOffers={myOffers}
        receivedOffers={receivedOffers}
      />
    </main>
  );
}