import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

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
        owner_id,
        traded,
        locked_at
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


  if (requestedListing.traded || requestedListing.locked_at) {
    throw new Error(
      "This listing is involved in an accepted swap and can't be requested right now."
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
        owner_id,
        traded,
        locked_at
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


  if (offeredListing.traded || offeredListing.locked_at) {
    throw new Error(
      "The item you're trying to offer is involved in an accepted swap and can't be offered right now."
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

  if (request.receiver_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  if (request.status !== "pending") {
    throw new Error(
      request.status === "accepted"
        ? "This swap request has already been accepted."
        : "This swap request is no longer pending."
    );
  }

  const listingIds = [
    request.offered_listing_id,
    request.requested_listing_id,
  ].filter(Boolean);

  // Lock both listings FIRST, conditioned on them still being unlocked
  // (locked_at: null). This has to happen before touching swap_requests
  // at all, and the condition has to be checked in the same query as the
  // write — reading locked_at first and writing after leaves a window
  // where two accepts (for two different offers on the same listing) can
  // both pass the check before either commits. Requiring locked_at IS
  // NULL in the WHERE clause makes Postgres do that check-and-set
  // atomically, so only one of two concurrent accepts can ever win.
  //
  // locked_at is a dedicated column, separate from `traded` — locking
  // only hides a listing from PUBLIC browsing (see getListings,
  // getBoostedListings, getListingsByOwner), never from the owner's own
  // profile. `traded` still means "swap fully completed" and is set
  // separately, at completion time.
  const nowIso = new Date().toISOString();

  // Locking touches two listings — the accepting user's own, and the
  // other party's — in a single UPDATE. RLS on `listings` restricts
  // UPDATE to `auth.uid() = owner_id`, so under the regular per-request
  // client, only the accepting user's own listing would actually get
  // updated; the other party's row is silently filtered out of the
  // UPDATE (not an error — RLS just makes it invisible to the write),
  // which made every accept look like a false "already locked" partial
  // failure. This is a legitimate cross-user server-side write, so it
  // has to go through the service-role client, which bypasses RLS.
  const serviceSupabase = createServiceClient();
  if (!serviceSupabase) {
    throw new Error("Service role client unavailable for locking listings.");
  }

  if (listingIds.length > 0) {
    const { data: lockedRows, error: lockError } = await serviceSupabase
      .from("listings")
      .update({ locked_at: nowIso, updated_at: nowIso })
      .in("id", listingIds)
      .is("locked_at", null)
      .select("id");

    if (lockError) {
      throw new Error(lockError.message);
    }

    if (!lockedRows || lockedRows.length !== listingIds.length) {
      // The UPDATE above already committed for whichever rows in
      // listingIds still had locked_at IS NULL at the time — Postgres
      // doesn't roll that back just because we're about to throw. If any
      // of the listings involved here weren't actually free (someone
      // else's swap already had them locked), we must explicitly release
      // the ones we DID just lock, or they're stuck locked forever with
      // no accepted request behind them.
      if (lockedRows && lockedRows.length > 0) {
        await serviceSupabase
          .from("listings")
          .update({ locked_at: null, updated_at: new Date().toISOString() })
          .in(
            "id",
            lockedRows.map((row) => row.id)
          );
      }

      throw new Error(
        "One of these items was just locked into another swap. Please refresh — this offer may need to be declined."
      );
    }
  }

  // Now flip the request itself, conditioned on it still being pending —
  // same atomicity reasoning as above, in case two accept calls for this
  // exact request landed at the same time.
  const { data: acceptedRows, error } = await supabase
    .from("swap_requests")
    .update({
      status: "accepted",
      updated_at: nowIso,
    })
    .eq("id", requestId)
    .eq("status", "pending")
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  if (!acceptedRows || acceptedRows.length === 0) {
    // Roll back the listing lock we just took, since this request didn't
    // actually get accepted (someone else accepted/declined it first).
    if (listingIds.length > 0) {
      await serviceSupabase
        .from("listings")
        .update({ locked_at: null, updated_at: new Date().toISOString() })
        .in("id", listingIds);
    }
    throw new Error("This swap request is no longer pending.");
  }

  // Any other pending/accepted offer touching either listing can no
  // longer go anywhere — auto-cancel those and let the affected users
  // know, both as a notification and as an in-chat system message.
  if (listingIds.length > 0) {
    await cancelCompetingSwapRequests(listingIds, requestId);
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

interface SwapRequestRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: SwapRequest["status"];
  created_at: string;
  sender: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  receiver: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  offered_listing: {
    id: string;
    title: string;
    city: string;
    swap_value: number;
    listing_images?: { image_url: string; sort_order: number }[];
  };
  requested_listing: {
    id: string;
    title: string;
    city: string;
    swap_value: number;
    listing_images?: { image_url: string; sort_order: number }[];
  };
}

function mapSwapRequest(row: SwapRequestRow): SwapRequest {
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
      const serviceSupabase = createServiceClient();
      const unlockClient = serviceSupabase ?? supabase;

      const { error: unlockError } = await unlockClient
        .from("listings")
        .update({ locked_at: null, updated_at: new Date().toISOString() })
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