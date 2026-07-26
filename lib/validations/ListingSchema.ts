import { z } from "zod";

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(100, "Title cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(1000, "Description cannot exceed 1000 characters."),

  lookingFor: z
    .string()
    .trim()
    .min(3, "Tell users what you want in exchange."),

  swapValue: z
    .number({
      error: "Estimated swap value is required.",
    })
    .positive("Swap value must be greater than zero."),

  showOnMap: z.boolean().default(true),
});

export type ListingFormData = z.output<typeof listingSchema>;
export type ListingFormInput = z.input<typeof listingSchema>;