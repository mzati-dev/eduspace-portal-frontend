// services/messageService.ts

const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

export interface Message {
    id: string;
    senderId: string;
    senderRole: string;
    recipientId: string;
    recipientRole: string;
    subject: string | null;
    content: string;
    type: 'sms' | 'email' | 'both';
    read: boolean;
    readAt: string | null;
    createdAt: string;
}

export interface Conversation {
    id: string;
    participantOneId: string;
    participantOneRole: string;
    participantTwoId: string;
    participantTwoRole: string;
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCountP1: number;
    unreadCountP2: number;
    createdAt: string;
    updatedAt: string;
}

// Helper to get user info from localStorage
const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const sendMessage = async (data: {
    recipientId: string;
    recipientRole: string;
    subject?: string;
    content: string;
    type?: string;
}): Promise<Message> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/messages?schoolId=${schoolId || ''}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
};

export const getConversations = async (): Promise<Conversation[]> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/messages/conversations?schoolId=${schoolId || ''}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${conversationId}?schoolId=${schoolId || ''}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/messages/unread/count?schoolId=${schoolId || ''}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to fetch unread count');
    return response.json();
};

export const deleteMessage = async (id: string): Promise<void> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/messages/${id}?schoolId=${schoolId || ''}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to delete message');
};