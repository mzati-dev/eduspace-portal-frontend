// services/announcementService.ts

const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'general' | 'academic' | 'event' | 'emergency';
    audience: 'teachers' | 'parents' | 'both';
    priority: 'low' | 'medium' | 'high';
    is_pinned: boolean;
    publish_date: string;
    expiry_date: string | null;
    published_by: string;
    published_by_role: string;
    created_at: string;
}

// Helper to get user info from localStorage
const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/announcements?schoolId=${schoolId || ''}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to fetch announcements');
    return response.json();
};

export const createAnnouncement = async (data: {
    title: string;
    content: string;
    type: string;
    audience: string;
    priority?: string;
    is_pinned?: boolean;
    publish_date?: string;
    expiry_date?: string | null;
}): Promise<Announcement> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/announcements?schoolId=${schoolId || ''}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create announcement');
    return response.json();
};

export const updateAnnouncement = async (id: string, data: Partial<Announcement>): Promise<Announcement> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/announcements/${id}?schoolId=${schoolId || ''}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update announcement');
    return response.json();
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/announcements/${id}?schoolId=${schoolId || ''}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to delete announcement');
};

export const markAnnouncementAsRead = async (id: string): Promise<void> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/announcements/${id}/read?schoolId=${schoolId || ''}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to mark announcement as read');
};

export const getAnnouncementReadCount = async (id: string): Promise<{ count: number }> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/announcements/${id}/read/count?schoolId=${schoolId || ''}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to get read count');
    return response.json();
};