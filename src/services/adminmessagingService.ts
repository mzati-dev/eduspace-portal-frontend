const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface Contact {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    role: 'parent' | 'teacher' | 'student' | 'admin';
    class?: string;
    classId?: string;
    studentId?: string;
    parentOf?: string;
    avatar?: string;
}

export interface Message {
    id: string;
    subject: string;
    content: string;
    recipients: {
        groups: string[];
        total: number;
        recipientIds?: string[];
    };
    status: 'sent' | 'scheduled' | 'draft' | 'failed';
    sentAt?: string;
    scheduledFor?: string;
    type: 'sms' | 'email' | 'whatsapp' | 'push' | 'broadcast';
    stats?: {
        delivered: number;
        failed: number;
        pending: number;
    };
    createdBy?: string;
    createdAt?: string;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    type: 'parent_teacher' | 'sports' | 'academic' | 'holiday' | 'emergency' | 'general';
    date: string;
    time: string;
    endDate?: string;
    endTime?: string;
    location: string;
    audience: ('parents' | 'teachers' | 'students' | 'all')[];
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    reminders: {
        enabled: boolean;
        daysBefore: number[];
    };
    attachments?: string[];
    createdBy?: string;
    createdAt?: string;
}

export interface Broadcast {
    id: string;
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    channels: ('sms' | 'email' | 'whatsapp' | 'push')[];
    audience: ('parents' | 'teachers' | 'students' | 'all')[];
    sentAt: string;
    status: 'active' | 'ended' | 'cancelled';
    stats?: {
        delivered: number;
        failed: number;
        opened: number;
    };
}

export interface MessagingStats {
    totalContacts: number;
    messagesSent: number;
    upcomingEvents: number;
    activeBroadcasts: number;
    pendingAlerts: number;
    deliveryRate: number;
    openRate: number;
}

// Fetch contacts
export const fetchContacts = async (
    role?: string,
    classId?: string
): Promise<Contact[]> => {
    let url = `${API_BASE_URL}/messaging/contacts`;
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (classId) params.append('classId', classId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch contacts');
    const response = await res.json();
    return response.data;
};

// Fetch messages
export const fetchMessages = async (
    type?: string,
    status?: string
): Promise<Message[]> => {
    let url = `${API_BASE_URL}/messaging/messages`;
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch messages');
    const response = await res.json();
    return response.data;
};

// Fetch events
export const fetchEvents = async (
    status?: string,
    fromDate?: string,
    toDate?: string
): Promise<Event[]> => {
    let url = `${API_BASE_URL}/messaging/events`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch events');
    const response = await res.json();
    return response.data;
};

// Fetch broadcasts
export const fetchBroadcasts = async (status?: string): Promise<Broadcast[]> => {
    let url = `${API_BASE_URL}/messaging/broadcasts`;
    if (status) url += `?status=${status}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch broadcasts');
    const response = await res.json();
    return response.data;
};

// Fetch messaging stats
export const fetchMessagingStats = async (): Promise<MessagingStats> => {
    const url = `${API_BASE_URL}/messaging/stats`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stats');
    const response = await res.json();
    return response.data;
};

// Send message
export const sendMessage = async (data: {
    type: 'sms' | 'email' | 'whatsapp' | 'push';
    subject: string;
    content: string;
    audience: string[];
    classId?: string;
    recipientIds?: string[];
    scheduleFor?: string;
    saveAsDraft?: boolean;
}): Promise<Message> => {
    const url = `${API_BASE_URL}/messaging/send`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send message');
    }

    const response = await res.json();
    return response.data;
};

// Send broadcast
export const sendBroadcast = async (data: {
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    channels: ('sms' | 'email' | 'whatsapp' | 'push')[];
    audience: ('parents' | 'teachers' | 'students' | 'all')[];
}): Promise<Broadcast> => {
    const url = `${API_BASE_URL}/messaging/broadcast`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send broadcast');
    }

    const response = await res.json();
    return response.data;
};

// Create event
export const createEvent = async (data: Partial<Event>): Promise<Event> => {
    const url = `${API_BASE_URL}/messaging/events`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create event');
    }

    const response = await res.json();
    return response.data;
};

// Update event
export const updateEvent = async (eventId: string, data: Partial<Event>): Promise<Event> => {
    const url = `${API_BASE_URL}/messaging/events/${eventId}`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update event');
    }

    const response = await res.json();
    return response.data;
};

// Delete event
export const deleteEvent = async (eventId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messaging/events/${eventId}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete event');
    }
};

// Send event reminders
export const sendEventReminders = async (eventId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messaging/events/${eventId}/reminders`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send reminders');
    }
};

// Get message details
export const fetchMessageDetails = async (messageId: string): Promise<Message> => {
    const url = `${API_BASE_URL}/messaging/messages/${messageId}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch message details');
    const response = await res.json();
    return response.data;
};

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messaging/messages/${messageId}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete message');
    }
};

// Resend failed message
export const resendMessage = async (messageId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messaging/messages/${messageId}/resend`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to resend message');
    }
};

// Get audience count
export const getAudienceCount = async (audience: string[], classId?: string): Promise<number> => {
    const url = `${API_BASE_URL}/messaging/audience/count`;
    const params = new URLSearchParams();
    audience.forEach(a => params.append('audience', a));
    if (classId) params.append('classId', classId);

    const res = await fetch(`${url}?${params.toString()}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to get audience count');
    const response = await res.json();
    return response.data;
};