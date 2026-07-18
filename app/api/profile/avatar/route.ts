import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

import { uploadAvatar } from "@/lib/services/serverStorageServices";


export async function PATCH(
  request: Request
) {
  try {
    const supabase = await createClient();

    const {
      data: {
        user,
      },
      error: authError,
    } =
      await supabase.auth.getUser();


    if (authError) {
      throw new Error(authError.message);
    }


    if (!user) {
      throw new Error(
        "User not authenticated."
      );
    }


    const formData =
      await request.formData();


    const file =
      formData.get("file");


    if (!(file instanceof File)) {
      throw new Error(
        "No image file provided."
      );
    }


    const avatarUrl =
      await uploadAvatar(
        file,
        user.id
      );


    const { error } =
      await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          user.id
        );


    if (error) {
      throw new Error(
        error.message
      );
    }


    return NextResponse.json({
      message:
        "Avatar updated successfully.",
      avatarUrl,
    });


}catch (error) {
  console.error("AVATAR UPLOAD ERROR:", error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload avatar.",
    },
    {
      status: 500,
    }
  );
}
}