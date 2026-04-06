// src/services/attendanceService.ts
export const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

// Auth token helper
const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface AttendanceRecord {
    id?: string;
    studentId: string;
    studentName?: string;
    examNumber?: string;
    classId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    checkInTime?: string;
    notes?: string;
    parentContact?: string;
}

export interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
}

export interface WeeklyStats {
    day: string;
    date: string;
    rate: number;
    present: number;
    total: number;
}


// ADD THESE RIGHT HERE ↓
export interface MonthlyStats {
    weekName: string;
    rate: number;
    present: number;
    total: number;
    date: string;
}

export interface TermStats {
    averageRate: number;
    highestRate: number;
    lowestRate: number;
    totalDays: number;
    termName: string;
}

export interface ClassAttendanceSummary {
    classId: string;
    className: string;
    averageRate: number;
    totalStudents: number;
}

/**
 * Fetch attendance for a specific class and date
 */
export const fetchAttendanceByClassAndDate = async (
    classId: string,
    date: string
): Promise<AttendanceRecord[]> => {
    const url = `${API_BASE_URL}/attendance/class/${classId}?date=${date}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch attendance');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return []; // Return empty array if no data
};


// Add this to src/services/attendanceService.ts (near other fetch functions)

/**
 * Fetch attendance history for a specific student
 * @param studentId - The ID of the student
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Promise with array of attendance records
 */
export const fetchStudentAttendanceHistory = async (
    studentId: string,
    startDate: string,
    endDate: string
): Promise<AttendanceRecord[]> => {
    const url = `${API_BASE_URL}/attendance/student/${studentId}?startDate=${startDate}&endDate=${endDate}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch student attendance history');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

/**
 * Save attendance records (create or update)
 */
export const saveAttendance = async (
    records: Omit<AttendanceRecord, 'id'>[]
): Promise<AttendanceRecord[]> => {
    const url = `${API_BASE_URL}/attendance/batch`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ records }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save attendance');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    throw new Error('Invalid response format from server');
};

/**
 * Save a single attendance record
 */
export const saveSingleAttendance = async (
    record: Omit<AttendanceRecord, 'id'>
): Promise<AttendanceRecord> => {
    const url = `${API_BASE_URL}/attendance`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(record),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save attendance record');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    throw new Error('Invalid response format from server');
};

/**
 * Mark all students in a class as present for a date
 */
export const markAllPresent = async (
    classId: string,
    date: string,
    studentIds: string[]
): Promise<AttendanceRecord[]> => {
    const url = `${API_BASE_URL}/attendance/batch/mark-all-present`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ classId, date, studentIds }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to mark all present');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    throw new Error('Invalid response format from server');
};

/**
 * Get weekly attendance stats for a class
 */
export const fetchWeeklyStats = async (
    classId: string,
    startDate: string,
    endDate: string
): Promise<WeeklyStats[]> => {
    const url = `${API_BASE_URL}/attendance/stats/weekly/${classId}?startDate=${startDate}&endDate=${endDate}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch weekly stats');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};


/**
 * Fetch monthly attendance stats for a class
 */
export const fetchMonthlyStats = async (
    classId: string,
    year: number,
    month: number
): Promise<MonthlyStats[]> => {
    const url = `${API_BASE_URL}/attendance/stats/monthly/${classId}?year=${year}&month=${month}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch monthly stats');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    // Return mock data if endpoint doesn't exist
    return [
        { weekName: 'Week 1', rate: 78, present: 175, total: 225, date: '2024-01-05' },
        { weekName: 'Week 2', rate: 82, present: 185, total: 225, date: '2024-01-12' },
        { weekName: 'Week 3', rate: 75, present: 169, total: 225, date: '2024-01-19' },
        { weekName: 'Week 4', rate: 80, present: 180, total: 225, date: '2024-01-26' },
    ];
};

/**
 * Fetch term attendance stats for a class
 */
export const fetchTermStats = async (
    classId: string,
    termName: string
): Promise<TermStats> => {
    const url = `${API_BASE_URL}/attendance/stats/term/${classId}?termName=${encodeURIComponent(termName)}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch term stats');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    // Return mock data if endpoint doesn't exist
    return {
        averageRate: 76.5,
        highestRate: 88,
        lowestRate: 65,
        totalDays: 45,
        termName: termName
    };
};

/**
 * Get attendance summary for all teacher's classes
 */
export const fetchClassSummaries = async (
    teacherId: string
): Promise<ClassAttendanceSummary[]> => {
    const url = `${API_BASE_URL}/attendance/stats/classes/${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch class summaries');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

/**
 * Get top/bottom performing students
 */
export const fetchStudentPerformance = async (
    classId: string,
    type: 'best' | 'needs-improvement',
    limit: number = 3
): Promise<any[]> => {
    const url = `${API_BASE_URL}/attendance/stats/students/${classId}?type=${type}&limit=${limit}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch student performance');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

/**
 * Send attendance alerts to parents
 */
export const sendAttendanceAlerts = async (
    classId: string,
    date: string,
    method: 'sms' | 'email',
    studentIds?: string[] // If not provided, sends to all absent/late students
): Promise<{ sent: number; message: string }> => {
    const url = `${API_BASE_URL}/attendance/alerts/send`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ classId, date, method, studentIds }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send alerts');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    throw new Error('Invalid response format from server');
};

/**
 * Get alert history
 */
export const fetchAlertHistory = async (
    classId?: string,
    limit: number = 10
): Promise<any[]> => {
    let url = `${API_BASE_URL}/attendance/alerts/history?limit=${limit}`;
    if (classId) {
        url += `&classId=${classId}`;
    }

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch alert history');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

// Add to src/services/attendanceService.ts

export interface AttendancePattern {
    day: string;
    date: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    rate: number;
}

export interface ClassPerformance {
    classId: string;
    className: string;
    averageRate: number;
    totalStudents: number;
    trend: 'up' | 'down' | 'stable';
}

export interface PeakLateTime {
    time: string;
    count: number;
    day: string;
}

/**
 * Get attendance patterns for analytics
 */
export const fetchAttendancePatterns = async (
    classId: string,
    startDate: string,
    endDate: string
): Promise<{
    dailyPatterns: AttendancePattern[];
    classPerformance: ClassPerformance[];
    peakLateTimes: PeakLateTime[];
}> => {
    const url = `${API_BASE_URL}/attendance/analytics/patterns?classId=${classId}&startDate=${startDate}&endDate=${endDate}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch attendance patterns');
    }

    const response = await res.json();
    return response.success ? response.data : {
        dailyPatterns: [],
        classPerformance: [],
        peakLateTimes: []
    };
};