import {
    getUserConversations,
} from "@/lib/services/ServerChatService";

import ConversationList from "@/app/components/Chat/ConversationList/ConversationList";


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

        <main
            style={{
                padding: "24px",
            }}
        >

            <h1>
                Messages
            </h1>


            <ConversationList
                conversations={conversations}
            />


        </main>

    );
}