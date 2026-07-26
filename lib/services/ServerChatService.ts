import { Conversation } from "@/lib/types/Conversation";
import { Message, MessageType } from "@/lib/types/Message";
import { createClient } from "@/utils/supabase/server";
import { createNotification } from "@/lib/services/NotificationService";

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

function formatRelativeTime(date: string) {
    const now = Date.now();
    const created = new Date(date).getTime();
    const seconds = Math.floor((now - created) / 1000);

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d`;
    }

    return `${Math.floor(days / 7)}w`;
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

    type ConversationRow = {
        id: string;
        seller_id: string;
        buyer_id: string;
        listings: {
            id: string;
            title: string;
            listing_images?: { image_url: string }[];
        };
        seller: {
            id: string;
            username: string;
            full_name: string;
            avatar_url: string | null;
        };
        buyer: {
            id: string;
            username: string;
            full_name: string;
            avatar_url: string | null;
        };
        last_message: string | null;
        last_message_at: string;
    };

    const conversationsData = (data ?? []) as ConversationRow[];
    const conversationIds = conversationsData.map((conversation) => conversation.id);

    const unreadCounts: Record<string, number> = {};

    if (conversationIds.length > 0) {
        type UnreadMessageRow = {
            conversation_id: string;
        };

        const unreadResult = await supabase
            .from("messages")
            .select("conversation_id")
            .in("conversation_id", conversationIds)
            .eq("is_read", false)
            .neq("sender_id", user.id);

        if (unreadResult.error) {
            throw new Error(unreadResult.error.message);
        }

        const unreadMessages = unreadResult.data as UnreadMessageRow[] | null;

        for (const message of unreadMessages ?? []) {
            const conversationId = message.conversation_id;
            unreadCounts[conversationId] =
                (unreadCounts[conversationId] ?? 0) + 1;
        }
    }

    return (data ?? []).map((conversation): Conversation => {
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
                lastMessageRelativeTime: conversation.last_message
                    ? formatRelativeTime(conversation.last_message_at)
                    : undefined,
                unreadCount: unreadCounts[conversation.id] ?? 0,
        };
    });
}

export async function getUnreadChatMessageCount() {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return 0;
    }

    type ConversationIdRow = {
        id: string;
    };

    const conversationsResult = await supabase
        .from("conversations")
        .select("id")
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`);

    if (conversationsResult.error) {
        throw new Error(conversationsResult.error.message);
    }

    const conversations = conversationsResult.data as ConversationIdRow[] | null;
    const conversationIds = (conversations ?? []).map((conversation) => conversation.id);

    if (conversationIds.length === 0) {
        return 0;
    }

    const { count, error: countError } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .eq("is_read", false)
        .neq("sender_id", user.id);

    if (countError) {
        throw new Error(countError.message);
    }

    return count ?? 0;
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

            messageType: message.message_type as MessageType,
            imageUrl: message.image_url,
            videoUrl: message.video_url,
            swapRequestId: message.swap_request_id,
            swapAgreementId: message.swap_agreement_id,
        })
    );
}

function isAllowedImage(file: File): boolean {
    const type = file.type.toLowerCase();
    return ["image/jpeg", "image/png", "image/webp"].includes(type);
}

function isAllowedVideo(file: File): boolean {
    const type = file.type.toLowerCase();
    return ["video/mp4", "video/quicktime", "video/webm"].includes(type);
}

async function uploadChatAttachment(
    supabase: Awaited<ReturnType<typeof createClient>>,
    file: File
): Promise<string> {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const fileName = `${crypto.randomUUID()}.${extension}`;

    const buckets = ["chat-media", "listing-images"] as const;

    let lastError: Error | null = null;

    for (const bucket of buckets) {
        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: true,
                contentType: file.type || undefined,
            });

        if (!error) {
            const {
                data: { publicUrl },
            } = supabase.storage.from(bucket).getPublicUrl(fileName);

            return publicUrl;
        }

        lastError = new Error(error.message);
    }

    throw lastError ?? new Error("Failed to upload chat attachment.");
}

export async function sendChatMessage(
    conversationId: string,
    message: string,
    files?: File[]
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

    if (!trimmedMessage && (!files || files.length === 0)) {
        throw new Error("Message cannot be empty.");
    }

    if (trimmedMessage) {
        if (trimmedMessage.length > 1000) {
            throw new Error("Message cannot exceed 1000 characters.");
        }

        const { error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                message: trimmedMessage,
                message_type: "text",
            });

        if (error) {
            throw new Error(error.message);
        }
    }

    if (files && files.length > 0) {
        const recipientId = conversation.seller_id === user.id
            ? conversation.buyer_id
            : conversation.seller_id;

        for (const file of files) {
            if (isAllowedImage(file)) {
                const imageUrl = await uploadChatAttachment(supabase, file);
                await sendImageMessage(conversationId, imageUrl);
                continue;
            }

            if (isAllowedVideo(file)) {
                const videoUrl = await uploadChatAttachment(supabase, file);
                await sendVideoMessage(conversationId, videoUrl);
                continue;
            }

            throw new Error("Unsupported file type.");
        }

        try {
            await createNotification({
                userId: recipientId,
                type: "new_message",
                title: "New Message",
                message: "You received a new message.",
                referenceId: conversationId,
            });
        } catch (notificationError) {
            console.error("Failed to create message notification:", notificationError);
        }
    }
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

    const { data: insertedMessage, error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: trimmedMessage,
            message_type: "text",
        })
        .select("id")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const recipientId = conversation.seller_id === user.id
        ? conversation.buyer_id
        : conversation.seller_id;

    try {
        await createNotification({
            userId: recipientId,
            type: "new_message",
            title: "New Message",
            message: "You received a new message.",
            referenceId: conversationId,
        });
    } catch (notificationError) {
        console.error("Failed to create message notification:", notificationError);
    }

    if (insertedMessage?.id) {
        try {
            await supabase
                .from("messages")
                .update({ id: insertedMessage.id })
                .eq("id", insertedMessage.id);
        } catch {
            // no-op; the message has already been inserted successfully.
        }
    }
}

// Shared helper: verifies the current user belongs to the conversation.
// Returns the authenticated user and the conversation row.
async function requireConversationParticipant(
    supabase: Awaited<ReturnType<typeof createClient>>,
    conversationId: string
) {
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
        throw new Error("You are not allowed to access this conversation.");
    }

    return { user, conversation };
}

export async function sendImageMessage(
    conversationId: string,
    imageUrl: string
): Promise<void> {
    const supabase = await createClient();
    const { user, conversation } = await requireConversationParticipant(supabase, conversationId);

    const { error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: "",
            message_type: "image",
            image_url: imageUrl,
        });

    if (error) {
        throw new Error(error.message);
    }

    const recipientId = conversation.seller_id === user.id
        ? conversation.buyer_id
        : conversation.seller_id;

    try {
        await createNotification({
            userId: recipientId,
            type: "new_message",
            title: "New Message",
            message: "You received a new message.",
            referenceId: conversationId,
        });
    } catch (notificationError) {
        console.error("Failed to create message notification:", notificationError);
    }
}

export async function sendVideoMessage(
    conversationId: string,
    videoUrl: string
): Promise<void> {
    const supabase = await createClient();
    const { user, conversation } = await requireConversationParticipant(supabase, conversationId);

    const { error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: "",
            message_type: "video",
            video_url: videoUrl,
        });

    if (error) {
        throw new Error(error.message);
    }

    const recipientId = conversation.seller_id === user.id
        ? conversation.buyer_id
        : conversation.seller_id;

    try {
        await createNotification({
            userId: recipientId,
            type: "new_message",
            title: "New Message",
            message: "You received a new message.",
            referenceId: conversationId,
        });
    } catch (notificationError) {
        console.error("Failed to create message notification:", notificationError);
    }
}

// Inserts the auto-generated proposal card into the conversation
// when a swap request is created from this chat flow.
export async function sendSwapProposalMessage(
    conversationId: string,
    swapRequestId: string
): Promise<void> {
    const supabase = await createClient();
    const { user } = await requireConversationParticipant(supabase, conversationId);

    const { error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: "Swap proposal",
            message_type: "swap_proposal",
            swap_request_id: swapRequestId,
        });

    if (error) {
        throw new Error(error.message);
    }
}

// Inserts the auto-generated agreement card into the conversation
// when a swap agreement is created or its status changes.
export async function sendSwapAgreementMessage(
    conversationId: string,
    swapAgreementId: string
): Promise<void> {
    const supabase = await createClient();
    const { user } = await requireConversationParticipant(supabase, conversationId);

    const { error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: "Swap agreement",
            message_type: "swap_agreement",
            swap_agreement_id: swapAgreementId,
        });

    if (error) {
        throw new Error(error.message);
    }
}

// Inserts the auto-generated review request card into the conversation
// when a swap agreement is completed.
export async function sendReviewRequestMessage(
    conversationId: string,
    swapAgreementId: string
): Promise<void> {
    const supabase = await createClient();
    const { user } = await requireConversationParticipant(supabase, conversationId);

    const { error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: "Review request",
            message_type: "review_request",
            swap_agreement_id: swapAgreementId,
        });

    if (error) {
        throw new Error(error.message);
    }
}

// Inserts a centered system message (e.g. "Swap completed.", "Swap cancelled.").
// senderId still required by the messages table schema (NOT NULL), so we
// attribute system messages to whichever user triggered the action.
export async function sendSystemMessage(
    conversationId: string,
    text: string
): Promise<void> {
    const supabase = await createClient();
    const { user } = await requireConversationParticipant(supabase, conversationId);

    const { error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: text,
            message_type: "system",
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