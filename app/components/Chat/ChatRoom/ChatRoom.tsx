"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/utils/supabase/client";

import { Message } from "@/lib/types/Message";

import MessageInput from "../MessageInput/MessageInput";
import MessageList from "../MessageList/MessageList";

import ChatHeader from "../Header/Header";

import styles from "./ChatRoom.module.css";


interface ChatRoomProps {
    conversationId: string;
    currentUserId: string;
    initialMessages: Message[];

    otherUser: {
        username: string;
        fullName: string | null;
        avatarUrl: string | null;
    };

    listing: {
        title: string;
        imageUrl: string | null;
    };
}

export default function ChatRoom({
    conversationId,
    currentUserId,
    initialMessages,
    otherUser,
    listing,
}: ChatRoomProps) {

    const [messages, setMessages] =
        useState<Message[]>(initialMessages);

    const bottomRef =
        useRef<HTMLDivElement | null>(null);


    useEffect(() => {

        const supabase =
            createClient();


        let channel: any;


        async function setupRealtime() {

            const {
                data: {
                    session,
                },
            } = await supabase.auth.getSession();


            if (!session) {
                return;
            }


            const channelName =
                `conversation:${conversationId}`;


            console.log(
                "Listening to:",
                channelName
            );


            channel =
                supabase
                    .channel(
                        channelName,
                        {
                            config: {
                                private: true,

                                broadcast: {
                                    self: true,
                                },
                            },
                        }
                    )
                    .on(
                        "broadcast",
                        {
                            event: "*",
                        },
                        (payload) => {

                            console.log(
                                "FULL PAYLOAD:",
                                payload
                            );


                            const newMessage =
                                payload.payload.record;


                            if (!newMessage?.id) {
                                return;
                            }


                            setMessages(
                                (previous) => {

                                    if (
                                        previous.some(
                                            (message) =>
                                                message.id === newMessage.id
                                        )
                                    ) {
                                        return previous;
                                    }


                                    return [
                                        ...previous,
                                        {
                                            id: newMessage.id,
                                            senderId:
                                                newMessage.sender_id,
                                            message:
                                                newMessage.message,
                                            isRead:
                                                newMessage.is_read,
                                            createdAt:
                                                newMessage.created_at,
                                        },
                                    ];
                                }
                            );

                        }
                    )
                    .subscribe(
                        (status) => {

                            console.log(
                                "Realtime:",
                                status
                            );

                        }
                    );

        }


        setupRealtime();


        return () => {

            if (channel) {
                supabase.removeChannel(channel);
            }

        };


    }, [conversationId]);


    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages]);


    async function handleSendMessage(
        message: string
    ) {

        const response =
            await fetch(
                "/api/messages",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        conversationId,
                        message,
                    }),
                }
            );


        if (!response.ok) {

            const error =
                await response.text();


            console.log(
                "SERVER ERROR:",
                error
            );


            throw new Error(error);

        }

    }


    return (

        <section className={styles.container}>

            <ChatHeader
                username={otherUser.username}
                fullName={otherUser.fullName}
                avatarUrl={otherUser.avatarUrl}
                listingTitle={listing.title}
                listingImage={listing.imageUrl}
            />


            <div className={styles.messageArea}>

                {messages.length === 0 ? (

                    <p>
                        No messages yet.
                    </p>

                ) : (

                    <MessageList
                        messages={messages}
                        currentUserId={currentUserId}
                    />

                )}


                <div ref={bottomRef} />

            </div>


            <div className={styles.inputArea}>

                <MessageInput
                    onSend={handleSendMessage}
                />

            </div>

        </section>

    );
}