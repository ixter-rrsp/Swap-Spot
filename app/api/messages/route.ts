import { NextRequest, NextResponse } from "next/server";

import { sendMessage } from "@/lib/services/ServerChatService";


export async function POST(
    request: NextRequest
) {
    try {
        const {
            conversationId,
            message,
        } = await request.json();


        if (!conversationId || !message) {
            return NextResponse.json(
                {
                    error: "Conversation ID and message are required.",
                },
                {
                    status: 400,
                }
            );
        }


        await sendMessage(
            conversationId,
            message
        );


        return NextResponse.json({
            success: true,
        });

    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to send message.",
            },
            {
                status: 500,
            }
        );
    }
}