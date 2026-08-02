import { createClient } from "@/utils/supabase/server";

import { SwapRequestDetail } from "@/lib/types/SwapRequestDetail";

export async function getSwapRequestById(
  requestId: string
): Promise<SwapRequestDetail> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { data, error } = await supabase
    .from("swap_requests")
    .select(`
      *,
      sender:profiles!swap_requests_sender_id_fkey(
        id,
        username,
        full_name,
        avatar_url,
        badge,
        rating,
        city
      ),
      receiver:profiles!swap_requests_receiver_id_fkey(
        id,
        username,
        full_name,
        avatar_url,
        badge,
        rating,
        city
      ),
      offered_listing:listings!swap_requests_offered_listing_id_fkey(
        id,
        title,
        description,
        city,
        looking_for,
        swap_value,
        condition,
        listing_images(
          image_url,
          sort_order
        )
      ),
      requested_listing:listings!swap_requests_requested_listing_id_fkey(
        id,
        title,
        description,
        city,
        looking_for,
        swap_value,
        condition,
        listing_images(
          image_url,
          sort_order
        )
      )
    `)
    .eq("id", requestId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (
    data.sender_id !== user.id &&
    data.receiver_id !== user.id
  ) {
    throw new Error("Unauthorized.");
  }

  return {
    id: data.id,

    status: data.status,

    message: data.message,

    createdAt: data.created_at,

    currentUserId: user.id,

    sender: {
      id: data.sender.id,
      username: data.sender.username,
      fullName: data.sender.full_name,
      avatarUrl: data.sender.avatar_url,
      badge: data.sender.badge,
      rating: data.sender.rating,
      city: data.sender.city,
    },

    receiver: {
      id: data.receiver.id,
      username: data.receiver.username,
      fullName: data.receiver.full_name,
      avatarUrl: data.receiver.avatar_url,
      badge: data.receiver.badge,
      rating: data.receiver.rating,
      city: data.receiver.city,
    },

    offeredListing: {
      id: data.offered_listing.id,
      title: data.offered_listing.title,
      description: data.offered_listing.description,
      city: data.offered_listing.city,
      lookingFor: data.offered_listing.looking_for,
      swapValue: data.offered_listing.swap_value,
      condition: data.offered_listing.condition,
      imageUrl:
        data.offered_listing.listing_images?.[0]?.image_url,
    },

    requestedListing: {
      id: data.requested_listing.id,
      title: data.requested_listing.title,
      description: data.requested_listing.description,
      city: data.requested_listing.city,
      lookingFor: data.requested_listing.looking_for,
      swapValue: data.requested_listing.swap_value,
      condition: data.requested_listing.condition,
      imageUrl:
        data.requested_listing.listing_images?.[0]?.image_url,
    },
  };
}