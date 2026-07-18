import { createClient } from "@/utils/supabase/server";

export async function createNotification({
  userId,
  type,
  title,
  message,
  referenceId,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message,
      reference_id: referenceId ?? null,
    });

  if (error) {
    throw new Error(error.message);
  }
}