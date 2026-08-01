// Keep these values in sync with the check constraints added in
// supabase/migrations/20260801_add_category_condition_search.sql

export interface CategoryOption {
  value: string;
  label: string;
}

export const CATEGORIES: CategoryOption[] = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home" },
  { value: "books", label: "Books" },
  { value: "sports", label: "Sports" },
  { value: "toys_games", label: "Toys & Games" },
  { value: "vehicles", label: "Vehicles" },
  { value: "furniture", label: "Furniture" },
  { value: "collectibles", label: "Collectibles" },
  { value: "appliances", label: "Appliances" },
  { value: "beauty_health", label: "Beauty & Health" },
  { value: "musical_instruments", label: "Musical Instruments" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.value, category.label])
);

export function getCategoryLabel(value?: string | null): string {
  if (!value) return "Other";
  return CATEGORY_LABELS[value] ?? value;
}

export interface ConditionOption {
  value: string;
  label: string;
  description: string;
}

export const CONDITIONS: ConditionOption[] = [
  {
    value: "new",
    label: "New",
    description: "Unused, still in original packaging.",
  },
  {
    value: "like_new",
    label: "Like New",
    description: "Used briefly, no visible wear.",
  },
  {
    value: "used_good",
    label: "Used - Good",
    description: "Shows some wear but works great.",
  },
  {
    value: "used_fair",
    label: "Used - Fair",
    description: "Noticeable wear, fully functional.",
  },
  {
    value: "for_parts",
    label: "For Parts / Not Working",
    description: "Not fully functional, for parts or repair.",
  },
];

export const CONDITION_LABELS: Record<string, string> = Object.fromEntries(
  CONDITIONS.map((condition) => [condition.value, condition.label])
);

export function getConditionLabel(value?: string | null): string {
  if (!value) return "";
  return CONDITION_LABELS[value] ?? value;
}
