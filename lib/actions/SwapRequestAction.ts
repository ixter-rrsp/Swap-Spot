"use server";

import {
  acceptSwapRequest,
  declineSwapRequest,
} from "@/lib/services/ServerSwapRequestService";

import { revalidatePath } from "next/cache";


export async function acceptRequestAction(
  id: string
) {
  await acceptSwapRequest(id);

  revalidatePath("/requests");
}


export async function declineRequestAction(
  id: string
) {
  await declineSwapRequest(id);

  revalidatePath("/requests");
}