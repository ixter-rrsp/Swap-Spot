import { createClient } from "@/utils/supabase/server";

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  const supabase = await createClient();

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "jpg";

  const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadChatFile(
  file: File,
  folder: "images" | "videos"
): Promise<string> {
  const supabase = await createClient();

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? (folder === "videos" ? "mp4" : "jpg");

  const filePath = `${folder}/${crypto.randomUUID()}.${extension}`;
  const bucketName = folder === "videos" ? "chat-videos" : "chat-images";

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) {
    // Fallback attempt to general chat-attachments bucket if specific bucket doesn't exist
    const { error: fallbackError } = await supabase.storage
      .from("chat-attachments")
      .upload(filePath, file);

    if (fallbackError) {
      throw new Error(error.message || fallbackError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("chat-attachments")
      .getPublicUrl(filePath);

    return publicUrl;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrl;
}