import type { Profile } from "@/lib/types/Profile";
import { createClient } from "@/utils/supabase/server";

function mapProfile(data: any): Profile {
  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    city: data.city,
    bio: data.bio,

    rating: Number(data.rating),
    badge: data.badge,
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

  if (authError) {
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

  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", user.id);

  const { data: completedAgreementsData } = await supabase
    .from("swap_agreements")
    .select("id")
    .eq("status", "completed")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

  let averageRating = 0;
  let totalReviews = reviewsData?.length || 0;
  if (totalReviews > 0 && reviewsData) {
    const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
    averageRating = Number((sum / totalReviews).toFixed(1));
  }

  const { count: activeListings } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .eq("status", "active");

  const { count: sentRequests } = await supabase
    .from("swap_requests")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", user.id)
    .eq("status", "pending");

  const { count: toAccept } = await supabase
    .from("swap_requests")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  // Reliability tracker: how many swap requests this user was part of
  // ever reached "accepted", versus how many of those went all the way
  // to "completed". A swap that reached "completed" was, by definition,
  // accepted at some earlier point — so it counts toward both.
  const { count: acceptedCount } = await supabase
    .from("swap_requests")
    .select("id", { count: "exact", head: true })
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .in("status", ["accepted", "completed"]);

  const { count: completedRequestCount } = await supabase
    .from("swap_requests")
    .select("id", { count: "exact", head: true })
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq("status", "completed");

  const { data: agreements } = await supabase
    .from("swap_agreements")
    .select("*")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

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
      completed: completedRequestCount || 0,
    },
  };
}