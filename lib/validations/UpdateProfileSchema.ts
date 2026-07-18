import { z } from "zod";

export const UpdateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username cannot exceed 20 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username may only contain letters, numbers, and underscores."
    ),

  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required.")
    .max(100, "Full name cannot exceed 100 characters."),

  bio: z
    .string()
    .trim()
    .max(150, "Bio cannot exceed 150 characters.")
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .trim()
    .max(100, "City cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),

  swapRadius: z
    .number()
    .min(1)
    .max(100),

  latitude: z
    .number()
    .nullable()
    .optional(),

  longitude: z
    .number()
    .nullable()
    .optional(),
});

export type UpdateProfileFormData = z.infer<
  typeof UpdateProfileSchema
>;