import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceClient } from "@/utils/supabase/service";

const VALID_STATUSES = ["pending", "approved", "rejected"];

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

  const { data: existing, error: fetchError } = await supabase
    .from("verification_requests")
    .select("id, status, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Verification request not found." }, { status: 404 });
  }

  const update: Record<string, unknown> = {};
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

  const { data, error } = await supabase
    .from("verification_requests")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating verification request:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  // Approving flips the badge on; rejecting (or moving back to pending)
  // ever so slightly clears it, in case a user was somehow re-reviewed
  // after already being verified — this keeps the profile flag in sync
  // with whatever the most recent decision was.
  if (status === "approved") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq("id", existing.user_id);

    if (profileError) {
      console.error("Failed to set profile as verified:", profileError);
    }
  } else if (status === "rejected" && existing.status === "approved") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ is_verified: false, updated_at: new Date().toISOString() })
      .eq("id", existing.user_id);

    if (profileError) {
      console.error("Failed to unset profile verification:", profileError);
    }
  }

  return NextResponse.json(data);
}

