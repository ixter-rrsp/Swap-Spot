export type BoostDuration = 3 | 7;

export interface BoostOption {
  durationDays: BoostDuration;
  price: number; // in PHP
  label: string;
}

export const BOOST_OPTIONS: Record<BoostDuration, BoostOption> = {
  3: {
    durationDays: 3,
    price: 49,
    label: "3-Day Boost",
  },
  7: {
    durationDays: 7,
    price: 89,
    label: "7-Day Boost",
  },
};

export function getBoostOption(durationDays: number): BoostOption | null {
  if (durationDays === 3 || durationDays === 7) {
    return BOOST_OPTIONS[durationDays];
  }
  return null;
}

/**
 * Price (in PHP) a Free-plan user pays to post a listing beyond their
 * plan's free listing allowance, without upgrading their subscription.
 */
export const LISTING_OVERAGE_PRICE = 5;
