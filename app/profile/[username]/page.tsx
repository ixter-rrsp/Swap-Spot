import { notFound } from "next/navigation";

import {
  getProfileByUsername,
} from "@/lib/services/ProfileService";

import {
  getListingsByOwner,
} from "@/lib/services/ServerListingService";

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


  const listings =
    await getListingsByOwner(
      profile.id
    );


  return (
    <main>

      <ProfileHeader
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        city={profile.city ?? undefined}
        memberSince={profile.createdAt}
        rating={profile.rating}
        bio={profile.bio ?? undefined}
      />

      <ProfileTabs
        listings={listings}
      />

    </main>
  );
}