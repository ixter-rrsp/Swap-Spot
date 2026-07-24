import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { updateProfile } from "@/lib/services/ProfileService";
import { UpdateProfileSchema } from "@/lib/validations/UpdateProfileSchema";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const result = UpdateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid form data.",
          issues: result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    await updateProfile(result.data);

    return NextResponse.json({
      message: "Profile updated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update profile.",
      },
      {
        status: 500,
      }
    );
  }
}