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
    // Unique index blocks a second open report from the same reporter
    // against the same user while one is still pending/reviewing.
    if (error.code === "23505") {
      throw new Error("You've already reported this user. We're reviewing it.");
    }
    throw new Error(error.message);
  }

  return data;
}
