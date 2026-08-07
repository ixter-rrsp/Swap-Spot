import { createClient } from "@/utils/supabase/server";

export const REPORT_REASONS = [
  "scam_fraud_fake_swap",
  "misleading_item_details",
  "harassment_rude_behavior",
  "fake_stolen_photos",
  "spam_unrelated_posts",
  "violates_swapspot_rules",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

interface CreateReportInput {
  reportedUserId: string;
  reason: ReportReason;
  description?: string;
  proofUrls?: string[];
}

export async function createReport({
  reportedUserId,
  reason,
  description,
  proofUrls = [],
}: CreateReportInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.id === reportedUserId) {
    throw new Error("You can't report yourself.");
  }

  if (!REPORT_REASONS.includes(reason)) {
    throw new Error("Invalid report reason.");
  }

  const { data, error } = await supabase
    .from("user_reports")
    .insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      reason,
      description: description?.trim() || null,
      proof_urls: proofUrls,
    })
    .select()
    .single();

  if (error) {
    // NOTE: if you still have idx_user_reports_unique_open on the DB, drop
    // it (see migration below) — multiple reports per reporter/reported
    // pair are allowed by design now, including simultaneous open ones.
    if (error.code === "23505") {
      throw new Error(
        "This report couldn't be submitted because of a database constraint. Please contact support."
      );
    }
    throw new Error(error.message);
  }

  return data;
}