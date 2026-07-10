import { z } from "zod";

function is18OrOlder(dateOfBirth: string) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 18;
}

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters."),

    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required.")
      .refine(is18OrOlder, {
        message:
          "You must be at least 18 years old to register.",
      }),

    email: z
      .string()
      .email("Enter a valid email."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    }
  );

export type SignupFormData = z.infer<
  typeof signupSchema
>;