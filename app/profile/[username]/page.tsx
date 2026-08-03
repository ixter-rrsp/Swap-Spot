import { notFound } from "next/navigation";

import {
  getProfileByUsername,
} from "@/lib/services/ProfileService";

import {
  getListingsByOwner,
} from "@/lib/services/ServerListingService";

import {
  getRecentReviews,
  getProfileReviewStatistics,
} from "@/lib/services/ServerReviewService";

import { createClient } from "@/utils/supabase/server";

import ProfileHeader from "@/app/components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "@/app/components/Profile/ProfileTabs/ProfileTabs";


interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}


export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {

  const {
    username,
  } = await params;


  const profile =
    await getProfileByUsername(
      username
    );


  if (!profile) {
    notFound();
  }


  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwnProfile = user?.id === profile.id;

  const [listings, recentReviews, reviewStats] = await Promise.all([
    getListingsByOwner(profile.id),
    getRecentReviews(profile.id, 5),
    getProfileReviewStatistics(profile.id),
  ]);

  const reviews = recentReviews.map((review) => ({
    id: review.id,
    reviewerName: review.reviewer.fullName || review.reviewer.username,
    rating: review.rating,
    comment: review.comment ?? "",
  }));


  return (
    <main>

      <ProfileHeader
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        city={profile.city ?? undefined}
        memberSince={profile.createdAt}
        rating={profile.rating}
        reviewsCount={reviewStats.totalReviews}
        bio={profile.bio ?? undefined}
        showActions={!isOwnProfile}
        profileUserId={profile.id}
      />

      <ProfileTabs
        listings={listings}
        reviews={reviews}
        reviewsCount={reviewStats.totalReviews}
      />

    </main>
  );
}