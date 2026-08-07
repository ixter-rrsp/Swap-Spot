import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceClient } from "@/utils/supabase/service";
import { getReportProofSignedUrls } from "@/lib/services/serverStorageServices";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // pending | reviewing | resolved | dismissed | all

  let query = supabase
    .from("user_reports")
    .select(
      `
      id,
      reason,
      description,
      proof_urls,
      status,
      admin_notes,
      reviewed_by,
      reviewed_at,
      created_at,
      reporter:profiles!user_reports_reporter_id_fkey(id, username, full_name, avatar_url),
      reported:profiles!user_reports_reported_user_id_fkey(id, username, full_name, avatar_url, badge, report_strikes, suspension_status, suspension_reason, suspended_by)
      `
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // proof_urls currently holds storage PATHS (bucket is private) — swap
  // them for short-lived signed URLs the dashboard can actually render.
  const withSignedProofs = await Promise.all(
    (data ?? []).map(async (report) => ({
      ...report,
      proof_urls: await getReportProofSignedUrls(report.proof_urls ?? []),
    }))
  );

  return NextResponse.json(withSignedProofs);
}
