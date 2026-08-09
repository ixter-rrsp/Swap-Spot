import { NextResponse } from "next/server";
import { toggleMessageReaction } from "@/lib/services/ServerChatService";
import { ReactionType, REACTION_TYPES } from "@/lib/types/Message";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const reaction = body?.reaction as ReactionType;

    if (!reaction || !REACTION_TYPES.includes(reaction)) {
      return NextResponse.json(
        { error: "A valid reaction type is required." },
        { status: 400 }
      );
    }

    const result = await toggleMessageReaction(id, reaction);
    return NextResponse.json({ reaction: result });
  } catch (error: unknown) {
    console.error("Error toggling reaction:", error);
    const message = (error as Error).message || "Failed to react to message.";
    const status = message.includes("not allowed") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
