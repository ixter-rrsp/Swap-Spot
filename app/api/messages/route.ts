import { NextRequest, NextResponse } from "next/server";

import { sendChatMessage } from "@/lib/services/ServerChatService";

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get("content-type") ?? "";

        let conversationId = "";
        let message = "";
        let files: File[] = [];

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            conversationId = String(formData.get("conversationId") ?? "").trim();
            message = String(formData.get("message") ?? "").trim();
            files = Array.from(formData.entries())
                .filter(([, value]) => value instanceof File)
                .map(([, value]) => value as File);
        } else {
            const body = await request.json();
            conversationId = String(body?.conversationId ?? "").trim();
            message = String(body?.message ?? "").trim();
        }

        if (!conversationId) {
            return NextResponse.json(
                {
                    error: "Conversation ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        await sendChatMessage(conversationId, message, files);

        return NextResponse.json({ success: true });
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