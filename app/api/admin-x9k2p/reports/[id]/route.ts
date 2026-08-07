import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceClient } from "@/utils/supabase/service";

const VALID_STATUSES = ["pending", "reviewing", "resolved", "dismissed"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service role is not configured on the server." },
      { status: 500 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { status, adminNotes } = body ?? {};

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  // Load the current row first — we need to know the previous status and
  // reported_user_id to correctly apply/undo a strike on transition.
  const { data: existing, error: fetchError } = await supabase
    .from("user_reports")
    .select("id, status, strike_counted, reported_user_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const update: Record<string, any> = {};
  if (status) {
    update.status = status;
    update.reviewed_by = admin;
    update.reviewed_at = new Date().toISOString();
  }
  if (typeof adminNotes === "string") {
    update.admin_notes = adminNotes;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // Strike bookkeeping: only fires on an actual status transition, and only
  // ever counts a given report once (guarded by strike_counted) so toggling
  // status back and forth can't double-count or under-count.
  const movingIntoResolved = status === "resolved" && existing.status !== "resolved";
  const movingOutOfResolved =
    status && status !== "resolved" && existing.status === "resolved";

  if (movingIntoResolved && !existing.strike_counted) {
    update.strike_counted = true;
  } else if (movingOutOfResolved && existing.strike_counted) {
    update.strike_counted = false;
  }

  const { data, error } = await supabase
    .from("user_reports")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Apply the strike delta to the reported user's profile, matching whatever
  // we just committed on the report row.
  if (movingIntoResolved && !existing.strike_counted) {
    await incrementStrikes(supabase, existing.reported_user_id, 1);
  } else if (movingOutOfResolved && existing.strike_counted) {
    await incrementStrikes(supabase, existing.reported_user_id, -1);
  }

  return NextResponse.json(data);
}

async function incrementStrikes(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  userId: string,
  delta: 1 | -1
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("report_strikes")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Failed to load profile for strike update:", profileError);
    return;
  }

  const nextCount = Math.max(0, (profile.report_strikes ?? 0) + delta);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ report_strikes: nextCount })
    .eq("id", userId);

  if (updateError) {
    console.error("Failed to update strike count:", updateError);
  }
}
