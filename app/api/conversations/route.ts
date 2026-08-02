import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createOrGetConversation } from "@/lib/services/ServerChatService";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const listingId = body?.listingId as string;

    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }

    const conversation = await createOrGetConversation(listingId);

    return NextResponse.json(conversation, { status: 201 });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create conversation." },
      { status: 500 }
    );
  }
}
