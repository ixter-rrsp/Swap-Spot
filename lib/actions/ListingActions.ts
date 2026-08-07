"use server";

import { createClient } from "@/utils/supabase/server";
import createServiceClient from "@/utils/supabase/service";

export async function createMyDeliveryBooking(agreementId: string) {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized.");
  }

  const { data: agreement, error: agreementError } = await supabase
    .from("swap_agreements")
    .select("id, requester_id, receiver_id")
    .eq("id", agreementId)
    .single();

  if (agreementError || !agreement) {
    throw new Error("Agreement not found.");
  }

  if (agreement.requester_id !== user.id && agreement.receiver_id !== user.id) {
    throw new Error("You are not part of this agreement.");
  }

  const bookingSupabase = serviceSupabase ?? supabase;

  const { data: existingBooking, error: existingError } = await bookingSupabase
    .from("delivery_bookings")
    .select("id")
    .eq("agreement_id", agreementId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingBooking) {
    return { ok: true, alreadyExists: true, bookingId: existingBooking.id };
  }

  const { data, error } = await bookingSupabase
    .from("delivery_bookings")
    .insert({
      agreement_id: agreementId,
      user_id: user.id,
      provider_key: "manual",
      status: "booked",
      normalized_status: "booked",
      payload: { booked_by: user.id, source: "manual_booking" },
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true, alreadyExists: false, bookingId: data.id };
}

