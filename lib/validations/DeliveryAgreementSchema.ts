import { z } from "zod";

export const deliveryInfoSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  mobileNumber: z.string().trim().min(1, "Mobile number is required."),
  pickupAddress: z.string().trim().min(1, "Pickup address is required."),
  unitFloor: z.string().trim().max(200).optional().or(z.literal("")),
  landmark: z.string().trim().max(200).optional().or(z.literal("")),
  pickupNotes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type DeliveryInfoFormData = z.infer<typeof deliveryInfoSchema>;

export const COURIER_OPTIONS = [
  { value: "lalamove", label: "Lalamove" },
  { value: "grabexpress", label: "GrabExpress" },
  { value: "borzo", label: "Borzo" },
  { value: "lbc", label: "LBC" },
  { value: "jt", label: "J&T" },
  { value: "other", label: "Other" },
] as const;

export const courierBookingSchema = z.object({
  courier: z.enum([
    "lalamove",
    "grabexpress",
    "borzo",
    "lbc",
    "jt",
    "other",
  ]),
  trackingNumber: z.string().trim().min(1, "Booking reference / tracking number is required."),
  trackingUrl: z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .optional()
    .or(z.literal("")),
});

export type CourierBookingFormData = z.infer<typeof courierBookingSchema>;
