import { createClient } from "@/utils/supabase/server";
import { Review, ReviewStatistics, ReviewSummary } from "@/lib/types/Review";
import { createNotification } from "@/lib/services/NotificationService";
import { getSwapAgreementById } from "@/lib/services/ServerSwapAgreementService";

export async function createReview(
  swapAgreementId: string,
  rating: number,
  comment?: string
): Promise<Review> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized.");
  }

  // Get the agreement to find the reviewee
  const { data: agreement, error: agreementError } = await supabase
    .from("swap_agreements")
    .select("requester_id, receiver_id, status")
    .eq("id", swapAgreementId)
    .single();

  if (agreementError || !agreement) {
    throw new Error("Swap agreement not found.");
  }

  if (agreement.status !== "completed") {
    throw new Error("Swap must be completed before leaving a review.");
  }

  let revieweeId: string;
  if (user.id === agreement.requester_id) {
    revieweeId = agreement.receiver_id;
  } else if (user.id === agreement.receiver_id) {
    revieweeId = agreement.requester_id;
  } else {
    throw new Error("You are not part of this swap agreement.");
  }

  const { data: review, error: insertError } = await supabase
    .from("reviews")
    .insert({
      swap_agreement_id: swapAgreementId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating: rating,
      comment: comment || null,
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") { // unique constraint violation
      throw new Error("You have already reviewed this swap.");
    }
    throw new Error(insertError.message);
  }

  // Send Notification
  try {
    await createNotification({
      userId: revieweeId,
      type: "new_review",
      title: "New Review Received",
      message: `You received a ${rating}-star review for a recent swap.`,
      referenceId: review.id,
    });
  } catch (notificationError) {
    console.error("Failed to send review notification", notificationError);
  }

  return {
    id: review.id,
    swapAgreementId: review.swap_agreement_id,
    reviewerId: review.reviewer_id,
    revieweeId: review.reviewee_id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    updatedAt: review.updated_at,
  };
}

export async function hasUserReviewed(swapAgreementId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("reviews")
    .select("id")
    .eq("swap_agreement_id", swapAgreementId)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error checking review status:", error);
    return false;
  }

  return !!data;
}

export async function getProfileReviewStatistics(profileId: string): Promise<ReviewStatistics> {
  const supabase = await createClient();

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", profileId);

  let averageRating = 0;
  let totalReviews = 0;

  if (!reviewsError && reviews) {
    totalReviews = reviews.length;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = sum / totalReviews;
    }
  }

  const { count: completedSwaps, error: swapsError } = await supabase
    .from("swap_agreements")
    .select("id", { count: "exact", head: true })
    .or(`requester_id.eq.${profileId},receiver_id.eq.${profileId}`)
    .eq("status", "completed");

  return {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
    completedSwaps: completedSwaps || 0,
  };
}

export async function getRecentReviews(profileId: string, limit = 5): Promise<ReviewSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("reviewee_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((review: any) => ({
    id: review.id,
    swapAgreementId: review.swap_agreement_id,
    reviewerId: review.reviewer_id,
    revieweeId: review.reviewee_id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    updatedAt: review.updated_at,
    reviewer: {
      id: review.reviewer.id,
      username: review.reviewer.username,
      fullName: review.reviewer.full_name,
      avatarUrl: review.reviewer.avatar_url,
    },
  }));
}

export async function getAgreementReviewStatus(swapAgreementId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { currentUserReviewed: false, bothReviewed: false };
  }

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("reviewer_id")
    .eq("swap_agreement_id", swapAgreementId);

  if (error || !reviews) {
    return { currentUserReviewed: false, bothReviewed: false };
  }

  const currentUserReviewed = reviews.some(r => r.reviewer_id === user.id);
  const bothReviewed = reviews.length >= 2;

  return { currentUserReviewed, bothReviewed };
}
