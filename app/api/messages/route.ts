import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  sendMessage,
  sendImageMessage,
  sendVideoMessage,
  getConversationMessages,
} from "@/lib/services/ServerChatService";
import { uploadChatFile } from "@/lib/services/serverStorageServices";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  const limitParam = searchParams.get("limit");
  const beforeParam = searchParams.get("before");

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 }
    );
  }

  try {
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const before = beforeParam || undefined;

    const messages = await getConversationMessages(conversationId, limit, before);
    return NextResponse.json(messages);
  } catch (error: unknown) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const conversationId = formData.get("conversationId") as string;
    const text = (formData.get("message") as string) || "";
    const files = formData.getAll("files") as File[];
    const replyToId = (formData.get("replyToId") as string) || undefined;

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Handle file attachments upload if present
    if (files && files.length > 0) {
      for (const file of files) {
        if (!file || typeof file === "string") continue;

        const isVideo = file.type.startsWith("video/");
        const fileUrl = await uploadChatFile(file, isVideo ? "videos" : "images");

        if (isVideo) {
          await sendVideoMessage(conversationId, fileUrl);
        } else {
          await sendImageMessage(conversationId, fileUrl);
        }
      }
    }

    // Handle text message if present
    if (text.trim()) {
      await sendMessage(conversationId, text.trim(), replyToId);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to send message." },
      { status: 500 }
    );
  }
}
