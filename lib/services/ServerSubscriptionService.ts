import { createClient as createServerClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import {
  SUBSCRIPTION_PLANS,
  PlanId,
  calculateExpirationDate,
  SubscriptionPlanConfig,
} from "@/lib/subscriptions/plans";

export interface ActiveSubscriptionDetails {
  id: string;
  userId: string;
  planId: PlanId;
  plan: SubscriptionPlanConfig;
  status: "active" | "expired" | "cancelled" | "replaced";
  startsAt: string;
  activatedAt: string | null;
  expiresAt: string | null;
  remainingDays: number | null; // null for lifetime / Free
  paymentId: string | null;
}

export interface ListingEntitlementResult {
  allowed: boolean;
  activeListingsCount: number;
  maxActiveListings: number | null;
  planId: PlanId;
  reason?: string;
}

export class ServerSubscriptionService {
  /**
   * Get or initialize the user's active subscription.
   * Handles automatic expiration check and returns active plan details.
   */
  static async getActiveSubscription(
    userId: string
  ): Promise<ActiveSubscriptionDetails> {
    const serviceClient = createServiceClient();
    const supabase = serviceClient || (await createServerClient());

    // 1. Fetch currently active subscription row for user
    const { data: activeSub, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Error fetching active user subscription:", error);
    }

    const now = new Date();

    // 2. Check if active subscription has expired
    if (activeSub && activeSub.expires_at) {
      const expDate = new Date(activeSub.expires_at);
      if (now > expDate) {
        // Expire subscription and revert user to FREE
        await this.expireSubscription(activeSub.id, userId);
        return this.getOrCreateFreeSubscription(userId);
      }
    }

    // 3. If active subscription exists and is valid
    if (activeSub) {
      const planConfig = SUBSCRIPTION_PLANS[activeSub.plan_id as PlanId] || SUBSCRIPTION_PLANS.free;
      let remainingDays: number | null = null;

      if (activeSub.expires_at) {
        const exp = new Date(activeSub.expires_at).getTime();
        const diffMs = exp - now.getTime();
        remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      return {
        id: activeSub.id,
        userId: activeSub.user_id,
        planId: activeSub.plan_id as PlanId,
        plan: planConfig,
        status: activeSub.status,
        startsAt: activeSub.starts_at,
        activatedAt: activeSub.activated_at,
        expiresAt: activeSub.expires_at,
        remainingDays,
        paymentId: activeSub.payment_id,
      };
    }

    // 4. If no active subscription exists, initialize or reactivate FREE subscription
    return this.getOrCreateFreeSubscription(userId);
  }

  /**
   * Expire an active subscription and update profile badge back to FREE.
   */
  private static async expireSubscription(subscriptionId: string, userId: string): Promise<void> {
    const serviceClient = createServiceClient();
    if (!serviceClient) return;

    await serviceClient
      .from("user_subscriptions")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);

    // Sync profile badge to FREE
    await serviceClient
      .from("profiles")
      .update({ badge: "FREE", updated_at: new Date().toISOString() })
      .eq("id", userId);
  }

  /**
   * Get or lazily create a single Free subscription record for user.
   */
  private static async getOrCreateFreeSubscription(
    userId: string
  ): Promise<ActiveSubscriptionDetails> {
    const serviceClient = createServiceClient();
    const supabase = serviceClient || (await createServerClient());

    // Check if user already has an existing FREE subscription record
    const { data: existingFree } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", "free")
      .maybeSingle();

    let freeSubRecord = existingFree;

    if (existingFree) {
      if (existingFree.status !== "active") {
        // Reactivate existing Free subscription
        const { data: reactivated } = await supabase
          .from("user_subscriptions")
          .update({
            status: "active",
            activated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingFree.id)
          .select("*")
          .single();

        if (reactivated) freeSubRecord = reactivated;
      }
    } else {
      // Create initial Free subscription record
      const { data: createdFree, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: "free",
          status: "active",
          starts_at: new Date().toISOString(),
          activated_at: new Date().toISOString(),
          expires_at: null,
        })
        .select("*")
        .single();

      if (!error && createdFree) {
        freeSubRecord = createdFree;
      }
    }

    // Ensure profile badge is set to FREE
    if (serviceClient) {
      await serviceClient
        .from("profiles")
        .update({ badge: "FREE", updated_at: new Date().toISOString() })
        .eq("id", userId);
    }

    const freeConfig = SUBSCRIPTION_PLANS.free;

    return {
      id: freeSubRecord?.id || "free-sub-id",
      userId,
      planId: "free",
      plan: freeConfig,
      status: "active",
      startsAt: freeSubRecord?.starts_at || new Date().toISOString(),
      activatedAt: freeSubRecord?.activated_at || new Date().toISOString(),
      expiresAt: null,
      remainingDays: null,
      paymentId: null,
    };
  }

  /**
   * Validate whether a user is allowed to post a new listing based on active plan limits.
   */
  static async checkListingEntitlement(userId: string): Promise<ListingEntitlementResult> {
    const activeSub = await this.getActiveSubscription(userId);
    const maxAllowed = activeSub.plan.maxActiveListings;

    // If plan allows unlimited listings (null or <= 0), return allowed
    if (maxAllowed === null || maxAllowed < 0) {
      return {
        allowed: true,
        activeListingsCount: 0,
        maxActiveListings: null,
        planId: activeSub.planId,
      };
    }

    // Count user's current active (untraded) listings
    const serviceClient = createServiceClient();
    const supabase = serviceClient || (await createServerClient());

    const { count, error } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("traded", false);

    if (error) {
      console.error("Error counting user active listings:", error);
    }

    const currentActiveCount = count || 0;
    const allowed = currentActiveCount < maxAllowed;

    return {
      allowed,
      activeListingsCount: currentActiveCount,
      maxActiveListings: maxAllowed,
      planId: activeSub.planId,
      reason: allowed
        ? undefined
        : `Listing limit reached. The ${activeSub.plan.name} plan is limited to ${maxAllowed} active listings. Please upgrade your subscription to post more items.`,
    };
  }

  /**
   * Activate a newly purchased paid subscription plan upon verified payment.
   * Replaces any existing active subscription and updates profile badge.
   */
  static async activateSubscription(
    userId: string,
    planId: PlanId,
    paymentId: string
  ): Promise<ActiveSubscriptionDetails> {
    const serviceClient = createServiceClient();
    if (!serviceClient) {
      throw new Error("Service role client unavailable for subscription activation.");
    }

    const targetPlan = SUBSCRIPTION_PLANS[planId];
    if (!targetPlan || planId === "free") {
      throw new Error(`Invalid plan for paid subscription activation: ${planId}`);
    }

    const now = new Date();
    const expiresAt = calculateExpirationDate(planId, now);

    // 1. Check for existing active subscription to replace
    const { data: currentActive } = await serviceClient
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    // 2. Insert new active paid subscription
    const { data: newSub, error: insertError } = await serviceClient
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        payment_id: paymentId,
        plan_id: planId,
        status: "active",
        starts_at: now.toISOString(),
        activated_at: now.toISOString(),
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      })
      .select("*")
      .single();

    if (insertError || !newSub) {
      console.error("Failed to insert new user subscription:", insertError);
      throw new Error(`Subscription insertion error: ${insertError?.message || "Unknown error"}`);
    }

    // 3. Mark previous active subscription as replaced
    if (currentActive && currentActive.id !== newSub.id) {
      await serviceClient
        .from("user_subscriptions")
        .update({
          status: "replaced",
          replaced_by: newSub.id,
          updated_at: now.toISOString(),
        })
        .eq("id", currentActive.id);
    }

    // 4. Synchronize profile badge to match new plan
    await serviceClient
      .from("profiles")
      .update({
        badge: targetPlan.badgeName,
        updated_at: now.toISOString(),
      })
      .eq("id", userId);

    let remainingDays: number | null = null;
    if (expiresAt) {
      const diffMs = expiresAt.getTime() - now.getTime();
      remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    return {
      id: newSub.id,
      userId,
      planId,
      plan: targetPlan,
      status: "active",
      startsAt: newSub.starts_at,
      activatedAt: newSub.activated_at,
      expiresAt: newSub.expires_at,
      remainingDays,
      paymentId,
    };
  }
}
