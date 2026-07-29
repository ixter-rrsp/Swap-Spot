import { PlanId } from "@/lib/subscriptions/plans";

export interface SubscriptionResponse {
  id: string;
  userId: string;
  planId: PlanId;
  plan: {
    id: PlanId;
    name: string;
    price: number;
    durationMonths: number | null;
    maxActiveListings: number | null;
    badgeName: string;
    badgeColor: string;
    badgeBg: string;
    description: string;
    features: string[];
  };
  status: "active" | "expired" | "cancelled" | "replaced";
  startsAt: string;
  activatedAt: string | null;
  expiresAt: string | null;
  remainingDays: number | null;
}

export class SubscriptionService {
  /**
   * Fetch current user's active subscription details.
   */
  static async getCurrentSubscription(): Promise<SubscriptionResponse> {
    const response = await fetch("/api/subscriptions/current");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch current subscription.");
    }

    return data.subscription;
  }

  /**
   * Initiate subscription checkout session for a target plan.
   */
  static async initiateCheckout(planId: PlanId): Promise<{ checkoutUrl: string; checkoutSessionId: string }> {
    const response = await fetch("/api/subscriptions/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to initiate subscription checkout.");
    }

    return data;
  }
}
