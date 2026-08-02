import { createClient } from "@/utils/supabase/server";
import createServiceClient from "@/utils/supabase/service";

import {
  DeliveryAgreement,
  DeliveryAgreementDetail,
  BookingInstructions,
} from "@/lib/types/DeliveryAgreement";
import {
  SubmitDeliveryInfoInput,
  SubmitCourierBookingInput,
} from "@/lib/types/DeliveryAgreement";

import { createNotification } from "@/lib/services/NotificationService";
import { sendSystemMessage } from "@/lib/services/ServerChatService";

function mapDeliveryAgreement(row: any): DeliveryAgreement {
  return {
    id: row.id,
    swapAgreementId: row.swap_agreement_id,
    conversationId: row.conversation_id,
    requesterId: row.requester_id,
    receiverId: row.receiver_id,
    status: row.status,
    requester: {
      fullName: row.requester_full_name,
      mobileNumber: row.requester_mobile_number,
      pickupAddress: row.requester_pickup_address,
      unitFloor: row.requester_unit_floor,
      landmark: row.requester_landmark,
      pickupNotes: row.requester_pickup_notes,
      infoSubmittedAt: row.requester_info_submitted_at,
      courier: row.requester_courier,
      trackingNumber: row.requester_tracking_number,
      trackingUrl: row.requester_tracking_url,
      bookingSubmittedAt: row.requester_booking_submitted_at,
      pickedUpAt: row.requester_picked_up_at,
    },
    receiver: {
      fullName: row.receiver_full_name,
      mobileNumber: row.receiver_mobile_number,
      pickupAddress: row.receiver_pickup_address,
      unitFloor: row.receiver_unit_floor,
      landmark: row.receiver_landmark,
      pickupNotes: row.receiver_pickup_notes,
      infoSubmittedAt: row.receiver_info_submitted_at,
      courier: row.receiver_courier,
      trackingNumber: row.receiver_tracking_number,
      trackingUrl: row.receiver_tracking_url,
      bookingSubmittedAt: row.receiver_booking_submitted_at,
      pickedUpAt: row.receiver_picked_up_at,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Each user books the item they're RECEIVING: pickup = the other party's
// saved address, drop-off = their own saved address. This keeps either
// side from ever being able to set the other's drop-off, which is the
// whole point of collecting this info separately per user.
function buildBookingInstructions(
  row: any,
  itemTitle: string,
  forRequester: boolean
): BookingInstructions | null {
  const me = forRequester
    ? {
        name: row.requester_full_name,
        phone: row.requester_mobile_number,
        address: row.receiver_pickup_address,
        unitOrLandmark: [row.receiver_unit_floor, row.receiver_landmark]
          .filter(Boolean)
          .join(" · "),
        notes: row.receiver_pickup_notes,
      }
    : {
        name: row.receiver_full_name,
        phone: row.receiver_mobile_number,
        address: row.requester_pickup_address,
        unitOrLandmark: [row.requester_unit_floor, row.requester_landmark]
          .filter(Boolean)
          .join(" · "),
        notes: row.requester_pickup_notes,
      };

  const other = forRequester
    ? { name: row.requester_full_name, phone: row.requester_mobile_number, dropoff: row.requester_pickup_address }
    : { name: row.receiver_full_name, phone: row.receiver_mobile_number, dropoff: row.receiver_pickup_address };

  if (!me.address || !me.name) return null;

  return {
    itemTitle,
    pickup: {
      name: me.name,
      phone: me.phone,
      address: me.address,
      unitOrLandmark: me.unitOrLandmark || null,
    },
    receiver: {
      name: other.name,
      phone: other.phone,
    },
    dropoffAddress: other.dropoff,
    notes: me.notes || null,
  };
}

async function requireDeliveryParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  deliveryAgreementId: string
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("Unauthorized.");

  const { data: row, error } = await supabase
    .from("delivery_agreements")
    .select("*")
    .eq("id", deliveryAgreementId)
    .single();

  if (error || !row) throw new Error("Delivery agreement not found.");

  if (row.requester_id !== user.id && row.receiver_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  return { user, row };
}

// Creates the delivery_agreements row for a swap agreement (idempotent).
// Called right after a swap agreement is created with deliveryMethod
// "other_courier". Uses the service client since this runs as a
// side-effect of an insert the current user already has rights to.
export async function createDeliveryAgreementForSwapAgreement(params: {
  swapAgreementId: string;
  conversationId: string;
  requesterId: string;
  receiverId: string;
}): Promise<void> {
  const serviceSupabase = createServiceClient();
  if (!serviceSupabase) return;

  const { data: existing } = await serviceSupabase
    .from("delivery_agreements")
    .select("id")
    .eq("swap_agreement_id", params.swapAgreementId)
    .maybeSingle();

  if (existing) return;

  const { error } = await serviceSupabase.from("delivery_agreements").insert({
    swap_agreement_id: params.swapAgreementId,
    conversation_id: params.conversationId,
    requester_id: params.requesterId,
    receiver_id: params.receiverId,
    status: "awaiting_info",
  });

  if (error) {
    console.error("Failed to create delivery agreement:", error);
  }
}

export async function getDeliveryAgreementBySwapAgreementId(
  swapAgreementId: string
): Promise<DeliveryAgreementDetail> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("Unauthorized.");

  const { data: row, error } = await supabase
    .from("delivery_agreements")
    .select("*, swap_agreements!inner(id, status, swap_request_id)")
    .eq("swap_agreement_id", swapAgreementId)
    .single();

  if (error || !row) {
    throw new Error("Delivery agreement not found.");
  }

  if (row.requester_id !== user.id && row.receiver_id !== user.id) {
    throw new Error("Unauthorized.");
  }

  const isRequester = row.requester_id === user.id;

  let itemTitle = "your item";
  const swapRequestId = row.swap_agreements?.swap_request_id;
  if (swapRequestId) {
    const { data: sr } = await supabase
      .from("swap_requests")
      .select(
        "offered_listing:listings!swap_requests_offered_listing_id_fkey(title), requested_listing:listings!swap_requests_requested_listing_id_fkey(title)"
      )
      .eq("id", swapRequestId)
      .single();

    const listing = isRequester
      ? (sr as any)?.requested_listing
      : (sr as any)?.offered_listing;
    itemTitle = listing?.title || itemTitle;
  }

  const bothSubmitted =
    !!row.requester_info_submitted_at && !!row.receiver_info_submitted_at;

  const myBookingInstructions = bothSubmitted
    ? buildBookingInstructions(row, itemTitle, isRequester)
    : null;

  return {
    ...mapDeliveryAgreement(row),
    currentUserId: user.id,
    isRequester,
    myBookingInstructions,
  };
}

export async function submitDeliveryInfo(
  deliveryAgreementId: string,
  input: SubmitDeliveryInfoInput
): Promise<DeliveryAgreement> {
  const supabase = await createClient();
  const { user, row } = await requireDeliveryParticipant(
    supabase,
    deliveryAgreementId
  );

  const isRequester = row.requester_id === user.id;
  const now = new Date().toISOString();

  const updates: Record<string, any> = isRequester
    ? {
        requester_full_name: input.fullName,
        requester_mobile_number: input.mobileNumber,
        requester_pickup_address: input.pickupAddress,
        requester_unit_floor: input.unitFloor || null,
        requester_landmark: input.landmark || null,
        requester_pickup_notes: input.pickupNotes || null,
        requester_info_submitted_at: now,
      }
    : {
        receiver_full_name: input.fullName,
        receiver_mobile_number: input.mobileNumber,
        receiver_pickup_address: input.pickupAddress,
        receiver_unit_floor: input.unitFloor || null,
        receiver_landmark: input.landmark || null,
        receiver_pickup_notes: input.pickupNotes || null,
        receiver_info_submitted_at: now,
      };

  const otherSubmitted = isRequester
    ? !!row.receiver_info_submitted_at
    : !!row.requester_info_submitted_at;

  if (otherSubmitted) {
    updates.status = "ready_to_book";
  }

  const { data, error } = await supabase
    .from("delivery_agreements")
    .update(updates)
    .eq("id", deliveryAgreementId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const otherUserId = isRequester ? row.receiver_id : row.requester_id;
  const myName = isRequester ? "Requester" : "Receiver";

  try {
    if (otherSubmitted) {
      await sendSystemMessage(
        row.conversation_id,
        "Both users have completed delivery information.\n\nPlease book your courier using the generated booking details."
      );
      await createNotification({
        userId: row.requester_id,
        type: "delivery_ready_to_book",
        title: "Ready to Book Courier",
        message: "Both delivery details are in. Book your courier now.",
        referenceId: row.swap_agreement_id,
      });
      await createNotification({
        userId: row.receiver_id,
        type: "delivery_ready_to_book",
        title: "Ready to Book Courier",
        message: "Both delivery details are in. Book your courier now.",
        referenceId: row.swap_agreement_id,
      });
    } else {
      await sendSystemMessage(
        row.conversation_id,
        `${myName} completed delivery information.\n\nWaiting for the other party.`
      );
      await createNotification({
        userId: otherUserId,
        type: "delivery_info_needed",
        title: "Delivery Info Needed",
        message: "The other party completed their delivery info. Please add yours.",
        referenceId: row.swap_agreement_id,
      });
    }
  } catch (sideEffectError) {
    console.error("Failed to send delivery info side effects:", sideEffectError);
  }

  return mapDeliveryAgreement(data);
}

export async function submitCourierBooking(
  deliveryAgreementId: string,
  input: SubmitCourierBookingInput
): Promise<DeliveryAgreement> {
  const supabase = await createClient();
  const { user, row } = await requireDeliveryParticipant(
    supabase,
    deliveryAgreementId
  );

  if (row.status !== "ready_to_book" && row.status !== "booked") {
    throw new Error(
      "Both parties must complete their delivery information before a courier can be booked."
    );
  }

  const isRequester = row.requester_id === user.id;
  const now = new Date().toISOString();

  const updates: Record<string, any> = isRequester
    ? {
        requester_courier: input.courier,
        requester_tracking_number: input.trackingNumber,
        requester_tracking_url: input.trackingUrl || null,
        requester_booking_submitted_at: now,
      }
    : {
        receiver_courier: input.courier,
        receiver_tracking_number: input.trackingNumber,
        receiver_tracking_url: input.trackingUrl || null,
        receiver_booking_submitted_at: now,
      };

  const otherBooked = isRequester
    ? !!row.receiver_booking_submitted_at
    : !!row.requester_booking_submitted_at;

  if (otherBooked) {
    updates.status = "booked";
  }

  const { data, error } = await supabase
    .from("delivery_agreements")
    .update(updates)
    .eq("id", deliveryAgreementId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const otherUserId = isRequester ? row.receiver_id : row.requester_id;
  const myName = isRequester ? "Requester" : "Receiver";

  try {
    if (otherBooked) {
      await sendSystemMessage(
        row.conversation_id,
        "Both courier bookings have been submitted."
      );
      await createNotification({
        userId: row.requester_id,
        type: "delivery_booked",
        title: "Courier Booked",
        message: "Both courier bookings are in. You're all set for pickup.",
        referenceId: row.swap_agreement_id,
      });
      await createNotification({
        userId: row.receiver_id,
        type: "delivery_booked",
        title: "Courier Booked",
        message: "Both courier bookings are in. You're all set for pickup.",
        referenceId: row.swap_agreement_id,
      });
    } else {
      await sendSystemMessage(
        row.conversation_id,
        `${myName} submitted courier booking.\n\nWaiting for the other party.`
      );
      await createNotification({
        userId: otherUserId,
        type: "delivery_booked",
        title: "Courier Booking Submitted",
        message: "The other party booked their courier. Please book yours.",
        referenceId: row.swap_agreement_id,
      });
    }
  } catch (sideEffectError) {
    console.error("Failed to send booking side effects:", sideEffectError);
  }

  return mapDeliveryAgreement(data);
}

export async function markDeliveryPickedUp(
  deliveryAgreementId: string
): Promise<DeliveryAgreement> {
  const supabase = await createClient();
  const { user, row } = await requireDeliveryParticipant(
    supabase,
    deliveryAgreementId
  );

  if (row.status !== "booked" && row.status !== "picked_up") {
    throw new Error("The courier must be booked before marking pickup.");
  }

  const isRequester = row.requester_id === user.id;
  const now = new Date().toISOString();

  const alreadyMarked = isRequester
    ? !!row.requester_picked_up_at
    : !!row.receiver_picked_up_at;

  if (alreadyMarked) {
    throw new Error("You already marked this as picked up.");
  }

  const updates: Record<string, any> = isRequester
    ? { requester_picked_up_at: now }
    : { receiver_picked_up_at: now };

  const otherMarked = isRequester
    ? !!row.receiver_picked_up_at
    : !!row.requester_picked_up_at;

  if (otherMarked) {
    updates.status = "picked_up";
  }

  const { data, error } = await supabase
    .from("delivery_agreements")
    .update(updates)
    .eq("id", deliveryAgreementId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (otherMarked) {
    try {
      await sendSystemMessage(
        row.conversation_id,
        "Both items have been picked up by the courier."
      );
    } catch (sideEffectError) {
      console.error("Failed to send pickup side effect:", sideEffectError);
    }
  }

  return mapDeliveryAgreement(data);
}
