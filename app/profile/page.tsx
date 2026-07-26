import { redirect } from "next/navigation";
import ProfileHeader from "../components/Profile/ProfileHeader/ProfileHeader";
import ProfileContent from "../components/Profile/ProfileContent/ProfileContent";
import DashboardCards from "../components/Profile/DashboardCards/DashboardCards";
import ProfileReviews from "../components/Profile/ProfileReviews/ProfileReviews";
import { getProfileDashboard } from "@/lib/services/ProfileService";
import { getRecentReviews } from "@/lib/services/ServerReviewService";
import { getMyListings } from "@/lib/services/ServerListingService";
import { getCompletedAgreements } from "@/lib/services/ServerSwapAgreementService";
import { createClient } from "@/utils/supabase/server";
import { Listing } from "@/lib/types/Listing";
import styles from "./page.module.css";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dashboardData = await getProfileDashboard();
  if (!dashboardData) {
    return <div className={styles.profilePage}>Unable to load profile data.</div>;
  }

  const { profile, stats, counts } = dashboardData;

  const myOffers = await getMyListings();
  
  // Fetch completed agreements to determine what the user has received
  const completedAgreements = await getCompletedAgreements();
  const receivedOffers: Listing[] = completedAgreements.map(ag => {
    const isRequester = ag.requesterId === user.id;
    // If the current user is the requester, they received the requestedListing
    const receivedListingInfo = isRequester ? ag.requestedListing : ag.offeredListing;
    
    return {
      id: receivedListingInfo.id,
      title: receivedListingInfo.title,
      description: "Received from swap", // Fallback text
      imageUrl: receivedListingInfo.imageUrl,
      city: "",
      swapValue: 0,
      lookingFor: "",
      boosted: false,
      images: [],
      owner: {
        id: ag.otherUser.id,
        username: ag.otherUser.username,
        fullName: ag.otherUser.fullName,
        avatarUrl: ag.otherUser.avatarUrl || null,
        rating: 0,
        badge: "Member",
        city: "",
      },
    } as Listing;
  });
  
  const recentReviews = await getRecentReviews(profile.id, 5);

  return (
    <main className={styles.profilePage}>
      <ProfileHeader
        username={profile.fullName || profile.username}
        avatarUrl={profile.avatarUrl}
        city={profile.city || undefined}
        memberSince={profile.createdAt}
        rating={stats.averageRating}
        reviewsCount={stats.totalReviews}
        swapsCount={stats.completedSwaps}
        bio={profile.bio || undefined}
        badge={profile.badge || "Member"}
        showActions={false}
      />

      <DashboardCards counts={counts} />

      <ProfileContent
        myOffers={myOffers}
        receivedOffers={receivedOffers}
      />

      <ProfileReviews reviews={recentReviews} />
    </main>
  );
}