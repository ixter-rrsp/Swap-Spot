import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceClient } from "@/utils/supabase/service";

const VALID_ACTIONS = ["soft", "hard", "unrestrict"] as const;
type SuspendAction = (typeof VALID_ACTIONS)[number];

export async function POST(
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
  const body = await request.json().catch(() => null);
  const action = body?.action as SuspendAction | undefined;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: "action must be one of: soft, hard, unrestrict." },
      { status: 400 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, suspension_status")
    .eq("id", id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const update =
    action === "unrestrict"
      ? {
          suspension_status: "none",
          suspended_at: null,
          suspension_reason: null,
          suspended_by: null,
        }
      : {
          suspension_status: action, // "soft" | "hard"
          suspended_at: new Date().toISOString(),
          suspension_reason:
            reason ||
            (action === "hard"
              ? `Escalated to hard suspension by admin`
              : `Soft suspended by admin`),
          suspended_by: admin,
        };

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", id)
    .select("id, suspension_status, suspended_at, suspension_reason, suspended_by")
    .single();

  if (error) {
    console.error("Error updating suspension status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
