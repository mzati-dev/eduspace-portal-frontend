const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface Message {
    id: string;
    parentId: string;
    parentName: string;
    content: string;
    subject?: string;
    timestamp: string;
    read: boolean;
    attachments?: { name: string; size: string; url?: string }[];
    studentName: string;
    studentClass: string;
    studentId?: string;
}

export interface Parent {
    id: string;
    name: string;
    studentName: string;
    studentClass: string;
    studentId: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

export interface MessageStats {
    unread: number;
    totalParents: number;
    messagesSent: number;
}

// Get all parents for teacher's classes
export const fetchParents = async (teacherId: string): Promise<Parent[]> => {
    const url = `${API_BASE_URL}/messages/parents?teacherId=${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch parents');
    }

    const response = await res.json();
    return response.data;
};

// Get inbox messages
export const fetchInbox = async (teacherId: string): Promise<Message[]> => {
    const url = `${API_BASE_URL}/messages/inbox/${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch inbox');
    }

    const response = await res.json();
    return response.data;
};

// Get sent messages
export const fetchSentMessages = async (teacherId: string): Promise<Message[]> => {
    const url = `${API_BASE_URL}/messages/sent/${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch sent messages');
    }

    const response = await res.json();
    return response.data;
};

// Send message to parent(s)
export const sendMessage = async (data: {
    teacherId: string;
    recipientIds?: string[];  // For multiple parents
    classId?: string;         // For whole class
    subject?: string;
    content: string;
    attachments?: File[];
}): Promise<any> => {
    const formData = new FormData();
    formData.append('teacherId', data.teacherId);
    formData.append('content', data.content);
    if (data.subject) formData.append('subject', data.subject);
    if (data.classId) formData.append('classId', data.classId);
    if (data.recipientIds) {
        data.recipientIds.forEach(id => formData.append('recipientIds[]', id));
    }

    if (data.attachments) {
        data.attachments.forEach(file => {
            formData.append('attachments', file);
        });
    }

    const url = `${API_BASE_URL}/messages/send`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
            // Don't set Content-Type with FormData
        },
        body: formData
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send message');
    }

    const response = await res.json();
    return response.data;
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messages/${messageId}/read`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to mark message as read');
    }
};

// Get message stats
export const getMessageStats = async (teacherId: string): Promise<MessageStats> => {
    const url = `${API_BASE_URL}/messages/stats/${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch stats');
    }

    const response = await res.json();
    return response.data;
};

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messages/${messageId}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete message');
    }
};