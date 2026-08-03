import { createClient } from "@/utils/supabase/server";

import { SwapAgreement, CreateSwapAgreementInput } from "@/lib/types/SwapAgreement";
import { SwapAgreementDetail } from "@/lib/types/SwapAgreementDetail";

import { createNotification } from "@/lib/services/NotificationService";
import {
  sendSwapAgreementMessage,
  sendSystemMessage,
  sendReviewRequestMessage,
} from "@/lib/services/ServerChatService";
import { createDeliveryAgreementForSwapAgreement } from "@/lib/services/ServerDeliveryAgreementService";

function mapSwapAgreement(row: any): SwapAgreement {
  return {
    id: row.id,
    swapRequestId: row.swap_request_id,
    conversationId: row.conversation_id,
    requesterId: row.requester_id,
    receiverId: row.receiver_id,
    deliveryMethod: row.delivery_method,
    meetupLocation: row.meetup_location,
    meetupDate: row.meetup_date,
    meetupTime: row.meetup_time,
    pickupAddress: row.pickup_address,
    dropoffAddress: row.dropoff_address,
    phoneRequester: row.phone_requester,
    phoneReceiver: row.phone_receiver,
    emailRequester: row.email_requester,
    emailReceiver: row.email_receiver,
    requesterCondition: row.requester_condition,
    receiverCondition: row.receiver_condition,
    requesterAccessories: row.requester_accessories,
    receiverAccessories: row.receiver_accessories,
    notes: row.notes,
    requesterConfirmedAt: row.requester_confirmed_at,
    receiverConfirmedAt: row.receiver_confirmed_at,
    requesterCompletedAt: row.requester_completed_at,
    receiverCompletedAt: row.receiver_completed_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Verifies the current user is authenticated and is a participant
// (requester or receiver) on the given agreement. Returns both.
async function requireAgreementParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  agreementId: string
) {
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

  const { data: agreement, error } = await supabase
    .from("swap_agreements")
    .select("*")
    .eq("id", agreementId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (agreement.requester_id !== user.id && agreement.receiver_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  return { user, agreement };
}

export async function createSwapAgreement(
  input: CreateSwapAgreementInput
): Promise<SwapAgreement> {
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

  // Derive requester/receiver from the swap request itself, never trust
  // the client for who's who — same pattern as createSwapRequest.
  const { data: swapRequest, error: swapRequestError } = await supabase
    .from("swap_requests")
    .select("id, sender_id, receiver_id, status")
    .eq("id", input.swapRequestId)
    .single();

  if (swapRequestError || !swapRequest) {
    throw new Error("Swap request not found.");
  }

  if (
    swapRequest.sender_id !== user.id &&
    swapRequest.receiver_id !== user.id
  ) {
    throw new Error("You are not part of this swap request.");
  }

  // Agreements can only be created once both parties have agreed to the
  // swap itself — creating one against a pending/declined/cancelled
  // request would let someone lock in delivery details for a swap that
  // was never actually accepted.
  if (swapRequest.status !== "accepted") {
    throw new Error("This swap request must be accepted before an agreement can be created.");
  }

  const { data: existingAgreement, error: existingAgreementError } = await supabase
    .from("swap_agreements")
    .select("id")
    .eq("swap_request_id", input.swapRequestId)
    .neq("status", "cancelled")
    .maybeSingle();

  if (existingAgreementError) {
    throw new Error(existingAgreementError.message);
  }

  if (existingAgreement) {
    throw new Error("An agreement already exists for this swap request.");
  }

  const { data, error } = await supabase
    .from("swap_agreements")
    .insert({
      swap_request_id: input.swapRequestId,
      conversation_id: input.conversationId,

      requester_id: swapRequest.sender_id,
      receiver_id: swapRequest.receiver_id,

      delivery_method: input.deliveryMethod,

      meetup_location: input.meetupLocation ?? null,
      meetup_date: input.meetupDate ?? null,
      meetup_time: input.meetupTime ?? null,

      pickup_address: input.pickupAddress ?? null,
      dropoff_address: input.dropoffAddress ?? null,

      phone_requester: input.phoneRequester ?? null,
      phone_receiver: input.phoneReceiver ?? null,
      email_requester: input.emailRequester ?? null,
      email_receiver: input.emailReceiver ?? null,

      requester_condition: input.requesterCondition ?? null,
      receiver_condition: input.receiverCondition ?? null,

      requester_accessories: input.requesterAccessories ?? null,
      receiver_accessories: input.receiverAccessories ?? null,

      notes: input.notes ?? null,

      status: "pending_confirmation",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const otherUserId =
    user.id === swapRequest.sender_id
      ? swapRequest.receiver_id
      : swapRequest.sender_id;

  if (input.deliveryMethod === "other_courier") {
    try {
      await createDeliveryAgreementForSwapAgreement({
        swapAgreementId: data.id,
        conversationId: input.conversationId,
        requesterId: swapRequest.sender_id,
        receiverId: swapRequest.receiver_id,
      });
    } catch (deliveryAgreementError) {
      console.error("Failed to create delivery agreement:", deliveryAgreementError);
    }
  }

  try {
    await sendSwapAgreementMessage(input.conversationId, data.id);

    await createNotification({
      userId: otherUserId,
      type: "agreement_created",
      title: "New Swap Agreement",
      message: "A swap agreement has been proposed. Review and confirm.",
      referenceId: data.id,
    });
  } catch (sideEffectError) {
    console.error(
      "Failed to send agreement message/notification:",
      sideEffectError
    );
  }

  return mapSwapAgreement(data);
}

export async function getSwapAgreementById(
  agreementId: string
): Promise<SwapAgreementDetail> {
  const supabase = await createClient();

  const { user, agreement } = await requireAgreementParticipant(
    supabase,
    agreementId
  );

  let myDeliveryInfoSubmitted: boolean | null = null;
  let myItemPickedUp: boolean | null = null;
  let otherItemPickedUp: boolean | null = null;

  if (agreement.delivery_method === "other_courier") {
    const isRequester = user.id === agreement.requester_id;

    const { data: deliveryAgreement } = await supabase
      .from("delivery_agreements")
      .select(
        "requester_info_submitted_at, receiver_info_submitted_at, requester_picked_up_at, receiver_picked_up_at"
      )
      .eq("swap_agreement_id", agreementId)
      .maybeSingle();

    myDeliveryInfoSubmitted = isRequester
      ? !!deliveryAgreement?.requester_info_submitted_at
      : !!deliveryAgreement?.receiver_info_submitted_at;

    myItemPickedUp = isRequester
      ? !!deliveryAgreement?.requester_picked_up_at
      : !!deliveryAgreement?.receiver_picked_up_at;

    otherItemPickedUp = isRequester
      ? !!deliveryAgreement?.receiver_picked_up_at
      : !!deliveryAgreement?.requester_picked_up_at;
  }

  return {
    ...mapSwapAgreement(agreement),
    currentUserId: user.id,
    myDeliveryInfoSubmitted,
    myItemPickedUp,
    otherItemPickedUp,
  };
}

export async function confirmSwapAgreement(
  agreementId: string
): Promise<SwapAgreement> {
  const supabase = await createClient();

  const { user, agreement } = await requireAgreementParticipant(
    supabase,
    agreementId
  );

  if (agreement.status !== "pending_confirmation") {
    throw new Error("This agreement is not awaiting confirmation.");
  }

  const isRequester = user.id === agreement.requester_id;

  const alreadyConfirmed = isRequester
    ? !!agreement.requester_confirmed_at
    : !!agreement.receiver_confirmed_at;

  if (alreadyConfirmed) {
    throw new Error("You have already confirmed this agreement.");
  }

  if (agreement.delivery_method === "other_courier") {
    const { data: deliveryAgreement, error: deliveryError } = await supabase
      .from("delivery_agreements")
      .select("requester_info_submitted_at, receiver_info_submitted_at")
      .eq("swap_agreement_id", agreementId)
      .maybeSingle();

    if (deliveryError) {
      throw new Error(deliveryError.message);
    }

    const myDeliveryInfoSubmitted = isRequester
      ? !!deliveryAgreement?.requester_info_submitted_at
      : !!deliveryAgreement?.receiver_info_submitted_at;

    if (!myDeliveryInfoSubmitted) {
      throw new Error(
        "Please fill in your delivery details in Manage Delivery before confirming this agreement."
      );
    }
  }

  const now = new Date().toISOString();

  const updates: Record<string, any> = isRequester
    ? { requester_confirmed_at: now }
    : { receiver_confirmed_at: now };

  const bothConfirmedAfterThis = isRequester
    ? !!agreement.receiver_confirmed_at
    : !!agreement.requester_confirmed_at;

  if (bothConfirmedAfterThis) {
    updates.status = "confirmed";
  }

  const { data, error } = await supabase
    .from("swap_agreements")
    .update(updates)
    .eq("id", agreementId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const otherUserId = isRequester
    ? agreement.receiver_id
    : agreement.requester_id;

  try {
    if (bothConfirmedAfterThis) {
      await sendSystemMessage(agreement.conversation_id, "Agreement confirmed.");
      await createNotification({
        userId: agreement.requester_id,
        type: "agreement_confirmed",
        title: "Agreement Confirmed",
        message: "Both parties have confirmed the swap agreement.",
        referenceId: agreementId,
      });
      await createNotification({
        userId: agreement.receiver_id,
        type: "agreement_confirmed",
        title: "Agreement Confirmed",
        message: "Both parties have confirmed the swap agreement.",
        referenceId: agreementId,
      });
    } else {
      await createNotification({
        userId: otherUserId,
        type: "agreement_confirmed",
        title: "Agreement Updated",
        message: "The other party confirmed the swap agreement. Your confirmation is needed.",
        referenceId: agreementId,
      });
    }
  } catch (sideEffectError) {
    console.error("Failed to send confirmation side effects:", sideEffectError);
  }

  return mapSwapAgreement(data);
}

export async function completeSwapAgreement(
  agreementId: string
): Promise<SwapAgreement> {
  const supabase = await createClient();

  const { user, agreement } = await requireAgreementParticipant(
    supabase,
    agreementId
  );

  if (agreement.status !== "confirmed") {
    throw new Error("This agreement must be confirmed before it can be completed.");
  }

  const isRequester = user.id === agreement.requester_id;

  const alreadyCompleted = isRequester
    ? !!agreement.requester_completed_at
    : !!agreement.receiver_completed_at;

  if (alreadyCompleted) {
    throw new Error("You have already marked this swap as completed.");
  }

  if (agreement.delivery_method === "other_courier") {
    const { data: deliveryAgreement, error: deliveryError } = await supabase
      .from("delivery_agreements")
      .select("requester_picked_up_at, receiver_picked_up_at")
      .eq("swap_agreement_id", agreementId)
      .maybeSingle();

    if (deliveryError) {
      throw new Error(deliveryError.message);
    }

    const myItemPickedUp = isRequester
      ? !!deliveryAgreement?.requester_picked_up_at
      : !!deliveryAgreement?.receiver_picked_up_at;

    const otherItemPickedUp = isRequester
      ? !!deliveryAgreement?.receiver_picked_up_at
      : !!deliveryAgreement?.requester_picked_up_at;

    if (!myItemPickedUp) {
      throw new Error(
        "You must mark your item as picked up before completing this swap."
      );
    }

    if (!otherItemPickedUp) {
      throw new Error(
        "The other party must mark their item as picked up before this swap can be completed."
      );
    }
  }

  const now = new Date().toISOString();

  const updates: Record<string, any> = isRequester
    ? { requester_completed_at: now }
    : { receiver_completed_at: now };

  const bothCompletedAfterThis = isRequester
    ? !!agreement.receiver_completed_at
    : !!agreement.requester_completed_at;

  if (bothCompletedAfterThis) {
    updates.status = "completed";
  }

  const { data, error } = await supabase
    .from("swap_agreements")
    .update(updates)
    .eq("id", agreementId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (bothCompletedAfterThis) {
    const { error: swapRequestError } = await supabase
      .from("swap_requests")
      .update({ status: "completed", updated_at: now })
      .eq("id", agreement.swap_request_id);

    if (swapRequestError) {
      console.error(
        "Failed to update swap_requests status to completed:",
        swapRequestError
      );
    }

    try {
      const { data: swapRequestData, error: swapRequestLookupError } = await supabase
        .from("swap_requests")
        .select("offered_listing_id, requested_listing_id")
        .eq("id", agreement.swap_request_id)
        .single();

      if (!swapRequestLookupError && swapRequestData) {
        const listingIds = [swapRequestData.offered_listing_id, swapRequestData.requested_listing_id].filter(Boolean);

        if (listingIds.length > 0) {
          const { error: tradeUpdateError } = await supabase
            .from("listings")
            .update({ traded: true, updated_at: now })
            .in("id", listingIds);

          if (tradeUpdateError) {
            console.error("Failed to mark listings as traded:", tradeUpdateError);
          }
        }
      }

      await sendSystemMessage(agreement.conversation_id, "⭐ Swap Completed");

      await createNotification({
        userId: agreement.requester_id,
        type: "agreement_completed",
        title: "Swap Completed",
        message: "Your swap has been marked as completed by both parties.",
        referenceId: agreementId,
      });
      await createNotification({
        userId: agreement.receiver_id,
        type: "agreement_completed",
        title: "Swap Completed",
        message: "Your swap has been marked as completed by both parties.",
        referenceId: agreementId,
      });

      // Insert review request card for both parties
      await sendReviewRequestMessage(agreement.conversation_id, agreementId);
    } catch (sideEffectError) {
      console.error("Failed to send completion side effects:", sideEffectError);
    }
  } else {
    const otherUserId = isRequester ? agreement.receiver_id : agreement.requester_id;

    try {
      await createNotification({
        userId: otherUserId,
        type: "agreement_completed",
        title: "Swap Marked as Completed",
        message: "The other party marked the swap as completed. Please confirm.",
        referenceId: agreementId,
      });
    } catch (sideEffectError) {
      console.error("Failed to send completion notification:", sideEffectError);
    }
  }

  return mapSwapAgreement(data);
}

export async function cancelSwapAgreement(
  agreementId: string
): Promise<SwapAgreement> {
  const supabase = await createClient();

  const { user, agreement } = await requireAgreementParticipant(
    supabase,
    agreementId
  );

  if (agreement.status === "completed" || agreement.status === "cancelled") {
    throw new Error("This agreement can no longer be cancelled.");
  }

  const { data, error } = await supabase
    .from("swap_agreements")
    .update({ status: "cancelled" })
    .eq("id", agreementId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: swapRequestError } = await supabase
    .from("swap_requests")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", agreement.swap_request_id);

  if (swapRequestError) {
    console.error("Failed to update swap_requests status to cancelled:", swapRequestError);
  }

  const otherUserId =
    user.id === agreement.requester_id
      ? agreement.receiver_id
      : agreement.requester_id;

  try {
    await sendSystemMessage(agreement.conversation_id, "Swap agreement cancelled.");

    await createNotification({
      userId: otherUserId,
      type: "agreement_cancelled",
      title: "Agreement Cancelled",
      message: "The swap agreement was cancelled.",
      referenceId: agreementId,
    });
  } catch (sideEffectError) {
    console.error("Failed to send cancellation side effects:", sideEffectError);
  }

  return mapSwapAgreement(data);
}

export interface SwapAgreementListDetail extends SwapAgreement {
  otherUser: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
  offeredListing: {
    id: string;
    title: string;
    imageUrl?: string;
  };
  requestedListing: {
    id: string;
    title: string;
    imageUrl?: string;
  };
}

async function getAgreementDetailsList(
  statusFilter: string,
  notConfirmedByMe?: boolean,
  notCompletedByMe?: boolean
): Promise<SwapAgreementListDetail[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  let query = supabase
    .from("swap_agreements")
    .select(`
      *,
      swap_requests!inner(
        id,
        offered_listing:listings!swap_requests_offered_listing_id_fkey(id, title, listing_images(image_url, sort_order)),
        requested_listing:listings!swap_requests_requested_listing_id_fkey(id, title, listing_images(image_url, sort_order)),
        sender:profiles!swap_requests_sender_id_fkey(id, username, full_name, avatar_url),
        receiver:profiles!swap_requests_receiver_id_fkey(id, username, full_name, avatar_url)
      )
    `)
    .eq("status", statusFilter)
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (notConfirmedByMe) {
    query = query.or(`and(requester_id.eq.${user.id},requester_confirmed_at.is.null),and(receiver_id.eq.${user.id},receiver_confirmed_at.is.null)`);
  }

  if (notCompletedByMe) {
    query = query.or(`and(requester_id.eq.${user.id},requester_completed_at.is.null),and(receiver_id.eq.${user.id},receiver_completed_at.is.null)`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map((row: any) => {
    const sr = row.swap_requests;
    const isRequester = row.requester_id === user.id;
    // The other user in the agreement context
    const otherUserRaw = isRequester ? sr.receiver : sr.sender;

    return {
      ...mapSwapAgreement(row),
      otherUser: {
        id: otherUserRaw.id,
        username: otherUserRaw.username,
        fullName: otherUserRaw.full_name,
        avatarUrl: otherUserRaw.avatar_url,
      },
      offeredListing: {
        id: sr.offered_listing.id,
        title: sr.offered_listing.title,
        imageUrl: sr.offered_listing.listing_images?.[0]?.image_url,
      },
      requestedListing: {
        id: sr.requested_listing.id,
        title: sr.requested_listing.title,
        imageUrl: sr.requested_listing.listing_images?.[0]?.image_url,
      }
    };
  });
}

export async function getPendingConfirmationAgreements(): Promise<SwapAgreementListDetail[]> {
  return getAgreementDetailsList("pending_confirmation", true, false);
}

export async function getPendingCompletionAgreements(): Promise<SwapAgreementListDetail[]> {
  return getAgreementDetailsList("confirmed", false, true);
}

export async function getCompletedAgreements(): Promise<SwapAgreementListDetail[]> {
  return getAgreementDetailsList("completed");
}
