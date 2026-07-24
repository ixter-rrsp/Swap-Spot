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