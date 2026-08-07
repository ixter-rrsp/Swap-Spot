import { NextResponse } from "next/server";
import { removeMessageForMe } from "@/lib/services/ServerChatService";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await removeMessageForMe(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error removing message for user:", error);
    const message = error instanceof Error ? error.message : "Failed to remove message.";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}