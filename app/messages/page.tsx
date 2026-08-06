import {
    getUserConversations,
} from "@/lib/services/ServerChatService";

import ConversationListLive from "@/app/components/Chat/ConversationList/ConversationListLive";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";


export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function MessagesPage() {

    const conversations =
        await getUserConversations();


    return (

        <main style={{ padding: "24px" }}>
            <PageHeader title="Messages" />

            <ConversationListLive initialConversations={conversations} />
        </main>

    );
}