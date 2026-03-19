const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface TimetableSlot {
    id: string;
    subject: string;
    subjectId?: string;
    class: string;
    classId?: string;
    time: string;
    startTime?: string;
    endTime?: string;
    duration: string;
    room: string;
    teacher?: string;
    teacherId?: string;
    dayOfWeek: number; // 0 = Monday, 1 = Tuesday, etc.
}

export interface DaySchedule {
    day: string;
    date: string;
    dayOfWeek: number;
    slots: TimetableSlot[];
}

export interface TimetableStats {
    totalClasses: number;
    uniqueClasses: number;
    uniqueSubjects: number;
    breakCount: number;
    meetingCount: number;
    weeklyHours: number;
}

// Fetch teacher's timetable for a specific week
export const fetchTeacherTimetable = async (
    teacherId: string,
    weekStartDate?: string
): Promise<DaySchedule[]> => {
    let url = `${API_BASE_URL}/timetable/teacher/${teacherId}`;

    if (weekStartDate) {
        url += `?weekStart=${weekStartDate}`;
    }

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch timetable');
    }

    const response = await res.json();
    return response.data;
};

// Fetch teacher's timetable for a specific day
export const fetchTeacherDayTimetable = async (
    teacherId: string,
    date: string
): Promise<DaySchedule> => {
    const url = `${API_BASE_URL}/timetable/teacher/${teacherId}/day?date=${date}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch day timetable');
    }

    const response = await res.json();
    return response.data;
};

// Get timetable statistics
export const fetchTimetableStats = async (
    teacherId: string,
    weekStartDate?: string
): Promise<TimetableStats> => {
    let url = `${API_BASE_URL}/timetable/teacher/${teacherId}/stats`;

    if (weekStartDate) {
        url += `?weekStart=${weekStartDate}`;
    }

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch timetable stats');
    }

    const response = await res.json();
    return response.data;
};

// Export timetable as PDF/Excel
export const exportTimetable = async (
    teacherId: string,
    format: 'pdf' | 'excel',
    weekStartDate?: string
): Promise<Blob> => {
    let url = `${API_BASE_URL}/timetable/teacher/${teacherId}/export?format=${format}`;

    if (weekStartDate) {
        url += `&weekStart=${weekStartDate}`;
    }

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to export timetable');
    }

    return await res.blob();
};

// Get upcoming alerts/notifications
export const fetchUpcomingAlerts = async (teacherId: string): Promise<any[]> => {
    const url = `${API_BASE_URL}/timetable/teacher/${teacherId}/alerts`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch alerts');
    }

    const response = await res.json();
    return response.data;
};