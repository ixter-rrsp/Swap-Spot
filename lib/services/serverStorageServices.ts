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

/**
 * Uploads a report screenshot to the PRIVATE `report-proofs` bucket and
 * returns the storage path (not a public URL — the bucket isn't public).
 * Callers that need to display the image must generate a signed URL on
 * read, e.g. via `getReportProofSignedUrls` below.
 */
export async function uploadReportProof(
  file: File,
  reporterId: string
): Promise<string> {
  const supabase = await createClient();

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "jpg";

  const filePath = `${reporterId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("report-proofs")
    .upload(filePath, file);

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}

/**
 * Generates short-lived signed URLs for report-proof paths. Uses the
 * service-role client so it works from the admin dashboard regardless of
 * storage RLS policies. Only call this from admin-gated code.
 */
export async function getReportProofSignedUrls(
  paths: string[],
  expiresInSeconds = 60 * 10
): Promise<string[]> {
  if (paths.length === 0) return [];

  const { createServiceClient } = await import("@/utils/supabase/service");
  const supabase = createServiceClient();
  if (!supabase) return [];

  const results = await Promise.all(
    paths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from("report-proofs")
        .createSignedUrl(path, expiresInSeconds);
      if (error || !data) return null;
      return data.signedUrl;
    })
  );

  return results.filter((url): url is string => Boolean(url));
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