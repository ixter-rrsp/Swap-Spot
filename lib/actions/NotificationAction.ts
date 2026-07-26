"use server";

import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/services/ServerNotificationService";

export async function markNotificationAsReadAction(
  notificationId: string
) {
  await markNotificationAsRead(notificationId);

  revalidatePath("/notifications");
  revalidatePath("/");
}

export async function markAllNotificationsAsReadAction() {
  await markAllNotificationsAsRead();

  revalidatePath("/notifications");
  revalidatePath("/");
}