import { NextResponse } from "next/server";
import { unsendMessage } from "@/lib/services/ServerChatService";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await unsendMessage(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error unsending message:", error);
    const message = error?.message || "Failed to unsend message.";
    const status = message.includes("only unsend your own") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
