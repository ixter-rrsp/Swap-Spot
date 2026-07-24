import { Conversation } from "@/lib/types/Conversation";
import { Message } from "@/lib/types/Message";
import { createClient } from "@/utils/supabase/server";

export async function createOrGetConversation(listingId: string) {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw new Error(authError.message);
    }

    if (!user) {
        throw new Error("User not authenticated.");
    }

    // Get listing owner
    const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("owner_id")
        .eq("id", listingId)
        .single();

    if (listingError) {
        throw new Error(listingError.message);
    }

    if (listing.owner_id === user.id) {
        throw new Error("You cannot message yourself.");
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("listing_id", listingId)
        .eq("seller_id", listing.owner_id)
        .eq("buyer_id", user.id)
        .maybeSingle();

    if (existingConversation) {
        return existingConversation;
    }

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
            listing_id: listingId,
            seller_id: listing.owner_id,
            buyer_id: user.id,
        })
        .select()
        .single();

    if (conversationError) {
        throw new Error(conversationError.message);
    }

    return conversation;
}

export async function getUserConversations(): Promise<Conversation[]> {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw new Error(authError.message);
    }

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("conversations")
        .select(`
      *,
      listings (
        id,
        title,
        listing_images (
          image_url
        )
      ),
      seller:profiles!conversations_seller_fkey (
        id,
        username,
        full_name,
        avatar_url
      ),
      buyer:profiles!conversations_buyer_fkey (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order("updated_at", {
            ascending: false,
        });

    if (error) {
        throw new Error(error.message);
    }

    return data.map((conversation): Conversation => {
        const otherUser =
            conversation.seller_id === user.id
                ? conversation.buyer
                : conversation.seller;

        return {
            id: conversation.id,

            listing: {
                id: conversation.listings.id,
                title: conversation.listings.title,
                imageUrl:
                    conversation.listings.listing_images?.[0]?.image_url ?? undefined,
            },

            otherUser: {
                id: otherUser.id,
                username: otherUser.username,
                fullName: otherUser.full_name,
                avatarUrl: otherUser.avatar_url,
            },

            lastMessage: conversation.last_message
                ? {
                    message: conversation.last_message,
                    createdAt: conversation.last_message_at,
                }
                : null,
        };
    });
}

export async function getConversationMessages(
    conversationId: string
): Promise<Message[]> {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw new Error(authError.message);
    }

    if (!user) {
        throw new Error("User not authenticated.");
    }

    // Verify the user belongs to the conversation
    const {
        data: conversation,
        error: conversationError,
    } = await supabase
        .from("conversations")
        .select("seller_id, buyer_id")
        .eq("id", conversationId)
        .single();

    if (conversationError) {
        throw new Error(conversationError.message);
    }

    if (
        conversation.seller_id !== user.id &&
        conversation.buyer_id !== user.id
    ) {
        throw new Error("You are not allowed to view this conversation.");
    }

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", {
            ascending: true,
        });

    if (error) {
        throw new Error(error.message);
    }

    return data.map(
        (message): Message => ({
            id: message.id,
            senderId: message.sender_id,
            message: message.message,
            isRead: message.is_read,
            createdAt: message.created_at,
        })
    );
}

export async function sendMessage(
    conversationId: string,
    message: string
): Promise<void> {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw new Error(authError.message);
    }

    if (!user) {
        throw new Error("User not authenticated.");
    }

    // Verify the user belongs to the conversation
    const {
        data: conversation,
        error: conversationError,
    } = await supabase
        .from("conversations")
        .select("seller_id, buyer_id")
        .eq("id", conversationId)
        .single();

    if (conversationError) {
        throw new Error(conversationError.message);
    }

    if (
        conversation.seller_id !== user.id &&
        conversation.buyer_id !== user.id
    ) {
        throw new Error("You are not allowed to send messages in this conversation.");
    }


    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
        throw new Error("Message cannot be empty.");
    }

    if (trimmedMessage.length > 1000) {
        throw new Error("Message cannot exceed 1000 characters.");
    }

    const { error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: trimmedMessage,
        });

    if (error) {
        throw new Error(error.message);
    }
}

export async function getConversationById(conversationId: string) {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw new Error(authError.message);
    }

    if (!user) {
        throw new Error("User not authenticated.");
    }

    const { data, error } = await supabase
        .from("conversations")
        .select(`
      *,
      listings (
        id,
        title,
        listing_images (
          image_url
        )
      ),
      seller:profiles!conversations_seller_fkey (
        id,
        username,
        full_name,
        avatar_url
      ),
      buyer:profiles!conversations_buyer_fkey (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
        .eq("id", conversationId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    if (
        data.seller_id !== user.id &&
        data.buyer_id !== user.id
    ) {
        throw new Error("You are not allowed to view this conversation.");
    }

    const otherUser =
        data.seller_id === user.id
            ? data.buyer
            : data.seller;

    return {
        id: data.id,

        listing: {
            id: data.listings.id,
            title: data.listings.title,
            imageUrl:
                data.listings.listing_images?.[0]?.image_url ?? undefined,
        },

        otherUser: {
            id: otherUser.id,
            username: otherUser.username,
            fullName: otherUser.full_name,
            avatarUrl: otherUser.avatar_url,
        },
    };
}


export async function markMessagesAsRead(
    conversationId: string
): Promise<void> {

    const supabase =
        await createClient();


    const {
        data: {
            user,
        },
        error: authError,
    } =
        await supabase.auth.getUser();


    if (authError) {
        throw new Error(authError.message);
    }


    if (!user) {
        throw new Error(
            "User not authenticated."
        );
    }


    const {
        error,
    } = await supabase
        .from("messages")
        .update({
            is_read: true,
        })
        .eq(
            "conversation_id",
            conversationId
        )
        .neq(
            "sender_id",
            user.id
        );


    if (error) {
        throw new Error(error.message);
    }

}