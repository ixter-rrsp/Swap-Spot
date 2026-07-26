import {
    getUserConversations,
} from "@/lib/services/ServerChatService";

import ConversationList from "@/app/components/Chat/ConversationList/ConversationList";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";


export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function MessagesPage() {

    const conversations =
        await getUserConversations();


    console.log(
        "CONVERSATIONS:",
        conversations
    );


    return (

        <main style={{ padding: "24px" }}>
            <PageHeader title="Messages" />

            <ConversationList conversations={conversations} />
        </main>

    );
}