// services/reminderService.ts

const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

export interface Reminder {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'urgent';
    audience: 'teachers' | 'parents' | 'both';
    reminderDate: string;
    created_by: string;
    created_by_role: string;
    is_sent: boolean;
    created_at: string;
}

// Helper to get user info from localStorage
const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const fetchReminders = async (): Promise<Reminder[]> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/reminders?schoolId=${schoolId || ''}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to fetch reminders');
    return response.json();
};

export const createReminder = async (data: {
    message: string;
    type: string;
    audience: string;
    reminder_date: string;
}): Promise<Reminder> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/reminders?schoolId=${schoolId || ''}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create reminder');
    return response.json();
};

export const deleteReminder = async (id: string): Promise<void> => {
    const user = getUserInfo();
    const schoolId = user?.schoolId;

    const response = await fetch(`${API_BASE_URL}/api/reminders/${id}?schoolId=${schoolId || ''}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
        },
    });

    if (!response.ok) throw new Error('Failed to delete reminder');
};