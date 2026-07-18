import { createClient } from "@/utils/supabase/client";
import { SignupFormData } from "../validations/SignupSchema";

const supabase = createClient();

export async function signUp(
  data: SignupFormData
) {
  const {
    email,
    password,
    fullName,
    dateOfBirth,
  } = data;

  const { data: authData, error } =
    await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          full_name: fullName,
          date_of_birth: dateOfBirth,
        },
      },
    });

  if (error) {
    throw new Error(error.message);
  }

  return authData;
}

export async function signIn(
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function signInWithGoogle() {
  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}