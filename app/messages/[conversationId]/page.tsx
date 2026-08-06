import {
    getConversationById,
    getConversationMessages,
} from "@/lib/services/ServerChatService";

import { createClient } from "@/utils/supabase/server";

import ChatRoom from "@/app/components/Chat/ChatRoom/ChatRoom";

import {
    markMessagesAsRead,
} from "@/lib/services/ServerChatService";

export default async function ConversationPage({
    params,
}: {
    params: Promise<{
        conversationId: string;
    }>;
}) {

    const { conversationId } = await params;


    const conversation =
        await getConversationById(
            conversationId
        );


    const messages =
        await getConversationMessages(
            conversationId,
            15
        );

    await markMessagesAsRead(
        conversationId
    );

    const supabase =
        await createClient();


    const {
        data: {
            user,
        },
    } = await supabase.auth.getUser();


    return (
        <main>

            <ChatRoom
                conversationId={conversationId}
                currentUserId={user!.id}
                initialMessages={messages}
                otherUser={conversation.otherUser}
                listing={conversation.listing}
            />

        </main>
    );
}