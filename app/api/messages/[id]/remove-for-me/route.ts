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
  } catch (error: any) {
    console.error("Error removing message for user:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove message." },
      { status: 400 }
    );
  }
}
