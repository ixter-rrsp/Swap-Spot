export interface Conversation {
    id: string;

    listing: {
        id: string;
        title: string;
        imageUrl?: string;
    };

    otherUser: {
        id: string;
        username: string;
        fullName: string;
        avatarUrl: string | null;
        isVerified: boolean;
    };

    lastMessage: {
        message: string;
        createdAt: string;
        senderId: string;
    } | null;

    lastMessageRelativeTime?: string;

    unreadCount?: number;
}