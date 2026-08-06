import { notFound } from "next/navigation";

import { getProfileByUsername } from "@/lib/services/ProfileService";
import { getListingsByOwner } from "@/lib/services/ServerListingService";
import { getProfileReviewStatistics } from "@/lib/services/ServerReviewService";
import { createClient } from "@/utils/supabase/server";

import ProfileHeader from "@/app/components/Profile/ProfileHeader/ProfileHeader";
import PublicProfileContent from "@/app/components/Profile/PublicProfileContent/PublicProfileContent";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;

  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwnProfile = user?.id === profile.id;

  // Run initial 6 listings fetch, total count query, and review stats in parallel
  const [initialListings, reviewStats, listingsCountResult] = await Promise.all([
    getListingsByOwner(profile.id, 6),
    getProfileReviewStatistics(profile.id),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", profile.id)
      .eq("traded", false)
      .is("locked_at", null),
  ]);

  const totalListingsCount = listingsCountResult.count ?? initialListings.length;

  return (
    <main>
      <ProfileHeader
        username={profile.fullName || profile.username}
        avatarUrl={profile.avatarUrl}
        city={profile.city ?? undefined}
        memberSince={profile.createdAt}
        rating={profile.rating}
        reviewsCount={reviewStats.totalReviews}
        bio={profile.bio ?? undefined}
        badge={profile.badge || "Member"}
        showActions={!isOwnProfile}
        showBackButton={true}
        profileUserId={profile.id}
      />

      <PublicProfileContent
        ownerId={profile.id}
        initialListings={initialListings}
        initialHasMore={initialListings.length === 6 && totalListingsCount > 6}
        totalListingsCount={totalListingsCount}
        reviewsCount={reviewStats.totalReviews}
      />
    </main>
  );
}