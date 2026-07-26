import { createClient } from "@/utils/supabase/server";
import { NotificationType } from "@/lib/types/NotificationType";

export async function createNotification({
  userId,
  type,
  title,
  message,
  referenceId,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
}) {
  const supabase = await createClient();

  const { data: existingNotification, error: existingError } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .eq("reference_id", referenceId ?? null)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingNotification) {
    return;
  }

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