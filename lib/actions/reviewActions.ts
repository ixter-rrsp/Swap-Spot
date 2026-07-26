"use server";

import { revalidatePath } from "next/cache";
import { createReview } from "@/lib/services/ServerReviewService";

export async function submitReviewAction(
  swapAgreementId: string,
  rating: number,
  comment: string
) {
  try {
    await createReview(swapAgreementId, rating, comment);
    
    // Revalidate relevant paths
    revalidatePath("/profile");
    revalidatePath(`/messages`);
    revalidatePath(`/agreements/${swapAgreementId}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
