import { z } from "zod";

function is18OrOlder(dateOfBirth: string) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 18;
}

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name must be at most 100 characters."),

    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(20, "Username must be at most 20 characters.")
      .regex(
        /^[a-z0-9_]+$/,
        "Username may only contain lowercase letters, numbers, and underscores."
      ),

    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required.")
      .refine(is18OrOlder, {
        message: "You must be at least 18 years old to register.",
      }),

    email: z
      .string()
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    }
  );

export type SignupFormData = z.infer<typeof signupSchema>;