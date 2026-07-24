import { NextRequest, NextResponse } from "next/server";

import { createOrGetConversation } from "@/lib/services/ServerChatService";

export async function POST(request: NextRequest) {
    try {
        const { listingId } = await request.json();

        if (!listingId) {
            return NextResponse.json(
                {
                    error: "Listing ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const conversation =
            await createOrGetConversation(listingId);

        return NextResponse.json(conversation);

    } catch (error) {

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create conversation.",
            },
            {
                status: 500,
            }
        );
    }
}