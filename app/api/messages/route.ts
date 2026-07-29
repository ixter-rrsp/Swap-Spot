import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  sendMessage,
  sendImageMessage,
  sendVideoMessage,
} from "@/lib/services/ServerChatService";
import { uploadChatFile } from "@/lib/services/serverStorageServices";

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
      await sendMessage(conversationId, text.trim());
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message." },
      { status: 500 }
    );
  }
}
