import { createClient } from "@/utils/supabase/server";

import { SwapRequest } from "@/lib/types/SwapRequest";

import { createNotification } from "@/lib/services/NotificationService";
import {
  createOrGetConversation,
  sendSwapProposalMessage,
} from "@/lib/services/ServerChatService";
import { cancelCompetingSwapRequests } from "@/lib/services/ServerSwapAgreementService";

export async function getIncomingRequests(): Promise<SwapRequest[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    return [];
  }

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
    `)
    .eq("receiver_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapSwapRequest);
}

export async function createSwapRequest(
  offeredListingId: string,
  requestedListingId: string
) {

  const supabase = await createClient();


  const {
    data: {
      user,
    },
    error: authError,
  } =
    await supabase.auth.getUser();


  if (authError) {
    throw new Error(
      authError.message
    );
  }


  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }



  const {
    data: requestedListing,
    error: requestedListingError,
  } =
    await supabase
      .from("listings")
      .select(`
        id,
        owner_id
      `)
      .eq(
        "id",
        requestedListingId
      )
      .single();



  if (
    requestedListingError ||
    !requestedListing
  ) {

    throw new Error(
      "Requested listing not found."
    );

  }



  if (
    requestedListing.owner_id === user.id
  ) {

    throw new Error(
      "You cannot request your own listing."
    );

  }



  const {
    data: offeredListing,
    error: offeredListingError,
  } =
    await supabase
      .from("listings")
      .select(`
        id,
        owner_id
      `)
      .eq(
        "id",
        offeredListingId
      )
      .single();



  if (
    offeredListingError ||
    !offeredListing
  ) {

    throw new Error(
      "Offered listing not found."
    );

  }



  if (
    offeredListing.owner_id !== user.id
  ) {

    throw new Error(
      "You can only offer your own listing."
    );

  }



  const {
    data: existingRequest,
  } =
    await supabase
      .from("swap_requests")
      .select("id")
      .eq(
        "offered_listing_id",
        offeredListingId
      )
      .eq(
        "requested_listing_id",
        requestedListingId
      )
      .eq(
        "status",
        "pending"
      )
      .maybeSingle();



  if (existingRequest) {

    throw new Error(
      "A pending swap request already exists."
    );

  }



  const {
    data,
    error,
  } =
    await supabase
      .from("swap_requests")
      .insert({

        sender_id: user.id,

        receiver_id:
          requestedListing.owner_id,

        offered_listing_id:
          offeredListingId,

        requested_listing_id:
          requestedListingId,

        status:"pending",

      })
      .select()
      .single();



  if(error){

    throw new Error(
      error.message
    );

  }

  const conversation = await createOrGetConversation(requestedListingId);

  await sendSwapProposalMessage(conversation.id, data.id);

  await createNotification({

    userId:
      requestedListing.owner_id,

    type:
      "swap_request",

    title:
      "New Swap Request",

    message:
      "You received a new swap request.",

    referenceId:
      data.id,

  });



  return {
    ...data,
    conversationId: conversation.id,
  };

}

export async function getOutgoingRequests(): Promise<SwapRequest[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    return [];
  }

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
    `)
    .eq("sender_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapSwapRequest);
}

export async function acceptSwapRequest(
  requestId: string
) {
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

  const { data: request, error: requestError } =
    await supabase
      .from("swap_requests")
      .select(`
        sender_id,
        receiver_id,
        offered_listing_id,
        requested_listing_id
      `)
      .eq("id", requestId)
      .single();

  if (requestError) {
    throw new Error(requestError.message);
  }

  if (request.receiver_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  const { error } = await supabase
    .from("swap_requests")
    .update({
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  // Lock both listings out of any other swap the moment this offer is
  // accepted — not just once the swap fully completes — since accepting
  // one offer means neither item is available for anyone else anymore.
  // Reusing the existing `traded` flag: every listing-visibility query in
  // the app already filters on it, so this hides both listings everywhere
  // (browse, search, saved, etc.) with no other code changes needed.
  // Unlocked again (traded: false) if this swap gets cancelled later —
  // see cancelSwapRequest and cancelSwapAgreement.
  const listingIds = [
    request.offered_listing_id,
    request.requested_listing_id,
  ].filter(Boolean);

  if (listingIds.length > 0) {
    const { error: lockError } = await supabase
      .from("listings")
      .update({ traded: true, updated_at: new Date().toISOString() })
      .in("id", listingIds);

    if (lockError) {
      console.error("Failed to lock listings after accepting swap request:", lockError);
    } else {
      // Any other pending/accepted offer touching either listing can no
      // longer go anywhere — auto-cancel those and let the affected
      // users know, both as a notification and as an in-chat system
      // message.
      await cancelCompetingSwapRequests(listingIds, requestId);
    }
  }

  await createNotification({
  userId: request.sender_id,

  type: "swap_accepted",

  title: "Swap Accepted",

  message: "Your swap request has been accepted.",

  referenceId: requestId,
});

  return {
    success: true,
  };
}

export async function declineSwapRequest(
  requestId: string
) {
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

  const { data: request, error: requestError } =
    await supabase
      .from("swap_requests")
      .select(`
        sender_id,
        receiver_id
      `)
      .eq("id", requestId)
      .single();

  if (requestError) {
    throw new Error(requestError.message);
  }

    if (request.receiver_id !== user.id) {
      throw new Error("Unauthorized.");
    }

      const { error } = await supabase
        .from("swap_requests")
        .update({
          status: "declined",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) {
        throw new Error(error.message);
      }

      await createNotification({
        userId: request.sender_id,

        type: "swap_declined",

        title: "Swap Declined",

        message: "Your swap request has been declined.",

        referenceId: requestId,
      });

      return {
        success: true,
      };

    }

function mapSwapRequest(row: any): SwapRequest {
  return {
    id: row.id,

    senderId: row.sender_id,

    receiverId: row.receiver_id,

    status: row.status,

    createdAt: row.created_at,

    sender: {
      id: row.sender.id,
      username: row.sender.username,
      fullName: row.sender.full_name,
      avatarUrl: row.sender.avatar_url,
    },

    receiver: {
      id: row.receiver.id,
      username: row.receiver.username,
      fullName: row.receiver.full_name,
      avatarUrl: row.receiver.avatar_url,
    },

    offeredListing: {
      id: row.offered_listing.id,
      title: row.offered_listing.title,
      city: row.offered_listing.city,
      swapValue: row.offered_listing.swap_value,
      imageUrl:
        row.offered_listing.listing_images?.[0]?.image_url,
    },

    requestedListing: {
      id: row.requested_listing.id,
      title: row.requested_listing.title,
      city: row.requested_listing.city,
      swapValue: row.requested_listing.swap_value,
      imageUrl:
        row.requested_listing.listing_images?.[0]?.image_url,
    },
  };
}

export async function hasPendingSwapRequest(
  requestedListingId: string
) {
  const supabase = await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();


  if (!user) {
    return false;
  }


  const {
    data,
    error,
  } = await supabase
    .from("swap_requests")
    .select("id")
    .eq("sender_id", user.id)
    .eq("requested_listing_id", requestedListingId)
    .eq("status", "pending")
    .maybeSingle();


  if (error) {
    throw new Error(error.message);
  }


  return !!data;
}

export async function cancelSwapRequest(
  requestId: string
) {

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

  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("swap_requests")
    .select(`
      status,
      sender_id,
      receiver_id,
      offered_listing_id,
      requested_listing_id
    `)
    .eq("id", requestId)
    .single();

  if (requestError) {
    throw new Error(requestError.message);
  }

  if (request.sender_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  if (["declined", "cancelled", "completed"].includes(request.status)) {
    throw new Error("This swap request can no longer be cancelled.");
  }

  const wasAccepted = request.status === "accepted";

  const { error } = await supabase
    .from("swap_requests")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  // If this had already been accepted, both listings were locked — see
  // acceptSwapRequest. Unlock them now that the swap is off.
  if (wasAccepted) {
    const listingIds = [
      request.offered_listing_id,
      request.requested_listing_id,
    ].filter(Boolean);

    if (listingIds.length > 0) {
      const { error: unlockError } = await supabase
        .from("listings")
        .update({ traded: false, updated_at: new Date().toISOString() })
        .in("id", listingIds);

      if (unlockError) {
        console.error("Failed to unlock listings after cancelling accepted swap request:", unlockError);
      }
    }
  }

  await createNotification({
    userId: request.receiver_id,

    type: "swap_cancelled",

    title: "Swap Cancelled",

    message: "The sender cancelled the swap request.",

    referenceId: requestId,
  });

  return {
    success: true,
  };

}