export type PlanId = "free" | "basic" | "premium" | "vip";

export interface SubscriptionPlanConfig {
  id: PlanId;
  name: string;
  price: number; // in PHP
  durationMonths: number | null; // null for lifetime / Free
  maxActiveListings: number | null; // null for unlimited
  badgeName: string;
  badgeColor: string; // Hex or CSS color
  badgeBg: string;
  description: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    durationMonths: null,
    maxActiveListings: 5,
    badgeName: "FREE",
    badgeColor: "#ffffff",
    badgeBg: "#4b5563",
    description: "Default plan for all SwapSpot members.",
    features: [
      "Up to 5 active item listings",
      "Standard item swaps & messaging",
      "FREE Gray member badge",
      "Basic support",
    ],
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 129,
    durationMonths: 1,
    maxActiveListings: 25,
    badgeName: "Basic",
    badgeColor: "#ffffff",
    badgeBg: "#16a34a",
    description: "Perfect for active swappers looking to list more items.",
    features: [
      "Up to 25 item listings",
      "1-Month active duration",
      "Green Basic member badge",
      "Increased visibility",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 299,
    durationMonths: 3,
    maxActiveListings: 50,
    badgeName: "Premium",
    badgeColor: "#111827",
    badgeBg: "#d1d5db",
    description: "Great value for power users and frequent traders.",
    features: [
      "Up to 50 item listings",
      "3-Month active duration",
      "Silver Premium member badge",
      "Priority customer support",
    ],
  },
  vip: {
    id: "vip",
    name: "VIP",
    price: 899,
    durationMonths: 12,
    maxActiveListings: null, // Unlimited
    badgeName: "VIP",
    badgeColor: "#111827",
    badgeBg: "#facc15",
    description: "Ultimate membership with full year benefits and maximum trust.",
    features: [
      "Unlimited item listings",
      "1-Full Year active duration",
      "Gold VIP member badge",
      "Top placement & priority support",
    ],
  },
};

/**
  Calculate expiration date from plan duration.
 */
export function calculateExpirationDate(planId: PlanId, startDate: Date = new Date()): Date | null {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan || plan.durationMonths === null) {
    return null; // Lifetime / Free
  }

  const expDate = new Date(startDate);
  expDate.setMonth(expDate.getMonth() + plan.durationMonths);
  return expDate;
}