import { createClient } from "@/utils/supabase/server";


export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {

  const supabase =
    await createClient();


  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "jpg";


  const filePath =
    `${userId}/${crypto.randomUUID()}.${extension}`;


  const { error } =
    await supabase.storage
      .from("avatars")
      .upload(
        filePath,
        file
      );


  if (error) {
    throw new Error(
      error.message
    );
  }


  const {
    data: {
      publicUrl,
    },
  } =
    supabase.storage
      .from("avatars")
      .getPublicUrl(
        filePath
      );


  return publicUrl;
}