import type { Profile } from "@/lib/types/Profile";
import { createClient } from "@/utils/supabase/server";

interface RawProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  rating: number | string | null;
  badge: string | null;
  date_of_birth: string | null;
  swap_radius?: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string | null;
}

function mapProfile(data: RawProfileData): Profile {
  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    city: data.city,
    bio: data.bio,

    rating: Number(data.rating),
    badge: data.badge ?? "",
    dateOfBirth: data.date_of_birth,

    swapRadius: data.swap_radius ?? 10,

    latitude: data.latitude,
    longitude: data.longitude,

    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // A guest has no session at all — Supabase surfaces that as an
  // "Auth session missing!" error rather than just user: null. That's
  // expected on public pages like /home, not a real failure.
  if (authError && authError.message !== "Auth session missing!") {
    throw new Error(authError.message);
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}


export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return mapProfile(data);
}


interface UpdateProfileData {
  username: string;
  bio?: string;
  city?: string;
  swapRadius: number;

  latitude?: number | null;
  longitude?: number | null;
}


export async function updateProfile(
  {
    username,
    bio,
    city,
    swapRadius,
    latitude,
    longitude,
  }: UpdateProfileData
): Promise<void> {

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();


  if (authError) {
    throw new Error(authError.message);
  }


  if (!user) {
    throw new Error("User not authenticated.");
  }


  const {
    data: existingProfile,
    error: usernameError,
  } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();


  if (usernameError) {
    throw new Error(usernameError.message);
  }


  if (
    existingProfile &&
    existingProfile.id !== user.id
  ) {
    throw new Error(
      "Username is already taken."
    );
  }


  const {
    error: updateError,
  } = await supabase
    .from("profiles")
    .update({
      username,
      bio,
      city,
      swap_radius: swapRadius,

      latitude,
      longitude,

      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);


  if (updateError) {
    throw new Error(updateError.message);
  }
}

export interface ProfileDashboardData {
  profile: Profile;
  stats: {
    averageRating: number;
    totalReviews: number;
    completedSwaps: number;
    activeListings: number;
  };
  counts: {
    sentRequests: number;
    toAccept: number;
    toConfirm: number;
    toComplete: number;
    history: number;
  };
}

export interface ProfileDashboardData {
  profile: Profile;
  stats: {
    averageRating: number;
    totalReviews: number;
    completedSwaps: number;
    activeListings: number;
  };
  counts: {
    sentRequests: number;
    toAccept: number;
    toConfirm: number;
    toComplete: number;
    history: number;
  };
  reliability: {
    accepted: number;
    completed: number;
  };
}

export async function getProfileDashboard(): Promise<ProfileDashboardData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Run profile fetch and all independent DB queries in parallel to eliminate
  // the staircase of sequential round-trips that was blocking the initial render.
  const [
    profile,
    { data: reviewsData },
    { data: completedAgreementsData },
    { count: activeListings },
    { count: sentRequests },
    { count: toAccept },
    { count: acceptedCount },
    { data: agreements },
  ] = await Promise.all([
    getCurrentProfile(),
    supabase.from("reviews").select("rating").eq("reviewee_id", user.id),
    supabase
      .from("swap_agreements")
      .select("id")
      .eq("status", "completed")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("traded", false),
    supabase
      .from("swap_requests")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("swap_requests")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("status", "pending"),
    // Reliability tracker: how many swap requests this user was part of
    // ever reached "accepted", versus how many of those went all the way
    // to "completed". A swap that reached "completed" was, by definition,
    // accepted at some earlier point — so it counts toward both.
    supabase
      .from("swap_requests")
      .select("id", { count: "exact", head: true })
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .in("status", ["accepted", "completed"]),
    // Completed count comes from swap_agreements.status = "completed"
    // (completedAgreementsData, fetched above) rather than re-querying
    // swap_requests — that column only gets synced to "completed" as a
    // side effect of the agreement finishing, so relying on it directly
    // here was silently undercounting whenever that sync hadn't (or
    // couldn't) run. swap_agreements is the source of truth.
    supabase
      .from("swap_agreements")
      .select("*")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
  ]);

  if (!profile) return null;

  let averageRating = 0;
  const totalReviews = reviewsData?.length || 0;
  if (totalReviews > 0 && reviewsData) {
    const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
    averageRating = Number((sum / totalReviews).toFixed(1));
  }

  let toConfirm = 0;
  let toComplete = 0;
  let history = 0;

  if (agreements) {
    for (const ag of agreements) {
      if (ag.status === "pending_confirmation") {
        const isRequester = ag.requester_id === user.id;
        const hasConfirmed = isRequester ? ag.requester_confirmed_at : ag.receiver_confirmed_at;
        if (!hasConfirmed) toConfirm++;
      } else if (ag.status === "confirmed") {
        const isRequester = ag.requester_id === user.id;
        const hasCompleted = isRequester ? ag.requester_completed_at : ag.receiver_completed_at;
        if (!hasCompleted) toComplete++;
      } else if (ag.status === "completed") {
        history++;
      }
    }
  }

  return {
    profile,
    stats: {
      averageRating,
      totalReviews,
      completedSwaps: completedAgreementsData?.length || history,
      activeListings: activeListings || 0,
    },
    counts: {
      sentRequests: sentRequests || 0,
      toAccept: toAccept || 0,
      toConfirm,
      toComplete,
      history,
    },
    reliability: {
      accepted: acceptedCount || 0,
      completed: completedAgreementsData?.length || 0,
    },
  };
}