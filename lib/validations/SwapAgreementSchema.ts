import { z } from "zod";

export const swapAgreementSchema = z
  .object({
    deliveryMethod: z.enum(["meetup", "other_courier"], {
      error: "Please choose a delivery method.",
    }),

    meetupLocation: z.string().trim().optional(),
    meetupDate: z.string().trim().optional(),
    meetupTime: z.string().trim().optional(),

    pickupAddress: z.string().trim().optional(),
    dropoffAddress: z.string().trim().optional(),

    // "your" / "their" here refer to the person filling out the form and
    // the other participant — mapped onto requester/receiver at submit
    // time based on which role the current user actually has.
    yourPhone: z.string().trim().optional(),
    yourEmail: z
      .string()
      .trim()
      .email("Enter a valid email.")
      .optional()
      .or(z.literal("")),

    theirPhone: z.string().trim().optional(),
    theirEmail: z
      .string()
      .trim()
      .email("Enter a valid email.")
      .optional()
      .or(z.literal("")),

    yourCondition: z
      .enum(["new", "like_new", "good", "fair", "needs_repair"])
      .optional(),
    theirCondition: z
      .enum(["new", "like_new", "good", "fair", "needs_repair"])
      .optional(),

    yourAccessories: z.string().trim().max(500).optional(),
    theirAccessories: z.string().trim().max(500).optional(),

    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "meetup") {
      if (!data.meetupLocation) {
        ctx.addIssue({
          code: "custom",
          path: ["meetupLocation"],
          message: "Meeting place is required.",
        });
      }
      if (!data.meetupDate) {
        ctx.addIssue({
          code: "custom",
          path: ["meetupDate"],
          message: "Meeting date is required.",
        });
      }
      if (!data.meetupTime) {
        ctx.addIssue({
          code: "custom",
          path: ["meetupTime"],
          message: "Meeting time is required.",
        });
      }
    }

    if (data.deliveryMethod === "other_courier") {
      if (!data.pickupAddress) {
        ctx.addIssue({
          code: "custom",
          path: ["pickupAddress"],
          message: "Pickup address is required.",
        });
      }
      if (!data.dropoffAddress) {
        ctx.addIssue({
          code: "custom",
          path: ["dropoffAddress"],
          message: "Drop-off address is required.",
        });
      }
    }
  });

export type SwapAgreementFormData = z.output<typeof swapAgreementSchema>;
export type SwapAgreementFormInput = z.input<typeof swapAgreementSchema>;