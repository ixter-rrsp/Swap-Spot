import { redirect } from "next/navigation";
import ProfileHeader from "../components/Profile/ProfileHeader/ProfileHeader";
import ProfileStats from "../components/Profile/ProfileStats/ProfileStats";
import ProgressCard from "../components/Profile/ProgressCard/ProgressCard";
import ProfileContent from "../components/Profile/ProfileContent/ProfileContent";
import DashboardCards from "../components/Profile/DashboardCards/DashboardCards";
import ProfileReviews from "../components/Profile/ProfileReviews/ProfileReviews";
import { getProfileDashboard } from "@/lib/services/ProfileService";
import { getMyListings } from "@/lib/services/ServerListingService";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";

// Always fetch fresh — this page shows counts (accepted/completed swaps,
// received offers) that change the moment a swap agreement is completed
// elsewhere in the app. Without this, Next.js's client-side router cache
// can serve a stale snapshot of this page after navigating back to it.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Run both fetches in parallel — they're fully independent of each other.
  const [dashboardData, myOffers] = await Promise.all([
    getProfileDashboard(),
    getMyListings(6),
  ]);

  if (!dashboardData) {
    return <div className={styles.profilePage}>Unable to load profile data.</div>;
  }

  const { profile, stats, counts, reliability } = dashboardData;

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

      <ProgressCard
        completed={reliability.completed}
        accepted={reliability.accepted}
      />

      <ProfileContent myOffers={myOffers} initialHasMore={myOffers.length === 6} />

      <ProfileReviews userId={profile.id} />
    </main>
  );
}