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

const getSchoolId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.schoolId || null;
        } catch (e) {
            return null;
        }
    }
    return null;
};

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

    return [];
};

/**
 * Fetch attendance history for a specific student
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

    return [];
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

    throw new Error('No term stats data returned');
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
    studentIds?: string[]
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

    if (response.success && response.data) {
        return response.data;
    }

    throw new Error('No attendance patterns data returned');
};

// Add these to your attendanceService.ts file (before the closing brace)

/**
 * Fetch attendance rate for a single student
 */
export const fetchStudentAttendanceRate = async (
    studentId: string
): Promise<{ attendanceRate: number; presentCount: number; totalDays: number }> => {
    const url = `${API_BASE_URL}/attendance/student/${studentId}/rate`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch student attendance rate');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    throw new Error('No attendance rate data returned');
};

/**
 * Fetch attendance rates for all students (for admin/teacher overview)
 */
export const fetchAllStudentsAttendanceRates = async (): Promise<Array<{
    studentId: string;
    studentName: string;
    examNumber: string;
    classId: string;
    className: string;
    attendanceRate: number;
    presentCount: number;
    totalDays: number;
}>> => {
    const url = `${API_BASE_URL}/attendance/students/all/rates`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch all students attendance rates');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

/**
 * Fetch attendance rates for students in a specific class
 */
export const fetchClassStudentsAttendanceRates = async (
    classId: string
): Promise<Array<{
    studentId: string;
    studentName: string;
    examNumber: string;
    classId: string;
    className: string;
    attendanceRate: number;
    presentCount: number;
    totalDays: number;
}>> => {
    const url = `${API_BASE_URL}/attendance/class/${classId}/students/rates`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch class students attendance rates');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

/**
 * Fetch attendance history for a student with date range
 */
export const fetchStudentAttendanceHistoryByDateRange = async (
    studentId: string,
    startDate: string,
    endDate: string
): Promise<AttendanceRecord[]> => {
    const url = `${API_BASE_URL}/attendance/student/${studentId}/history?startDate=${startDate}&endDate=${endDate}`;

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
 * Fetch current term
 */
export const fetchCurrentTerm = async (): Promise<{ id: string; name: string; startDate: string; endDate: string } | null> => {
    const url = `${API_BASE_URL}/attendance/current-term`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch current term');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    return null;
};

/**
 * Fetch all available terms
 */
export const fetchTerms = async (): Promise<Array<{ id: string; name: string; startDate: string; endDate: string }>> => {
    const url = `${API_BASE_URL}/attendance/terms`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch terms');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};
/**
 * Fetch term info for a specific class
 */
export const fetchClassTerm = async (classId: string): Promise<{ name: string; startDate: string; endDate: string } | null> => {
    const url = `${API_BASE_URL}/attendance/class/${classId}/term`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch class term');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    return null;
};

/**
 * Fetch school holidays for a specific class
 */
export const fetchSchoolHolidaysByClass = async (classId: string): Promise<{ date: string; reason: string }[]> => {
    const url = `${API_BASE_URL}/attendance/holidays/school/class/${classId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch school holidays');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

/**
 * Fetch recorded days count for a class
 */
export const fetchRecordedDaysCount = async (classId: string): Promise<number> => {
    const url = `${API_BASE_URL}/attendance/class/${classId}/recorded-days-count`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch recorded days count');
    }

    const response = await res.json();

    if (response.success && typeof response.data === 'number') {
        return response.data;
    }

    return 0;
};
/**
 * Add a school holiday
 */
export const addSchoolHoliday = async (date: string, classId: string, reason: string): Promise<void> => {
    const url = `${API_BASE_URL}/attendance/holidays/school`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ date, classId, reason })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add school holiday');
    }

    const response = await res.json();
    if (!response.success) {
        throw new Error(response.message || 'Failed to add school holiday');
    }
};

/**
 * Remove a school holiday
 */
export const removeSchoolHoliday = async (date: string, classId: string): Promise<void> => {
    const url = `${API_BASE_URL}/attendance/holidays/school/${date}?classId=${classId}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to remove school holiday');
    }

    const response = await res.json();
    if (!response.success) {
        throw new Error(response.message || 'Failed to remove school holiday');
    }
};
/**
 * Fetch public holidays
 */
export const fetchPublicHolidays = async (): Promise<{ date: string; name: string }[]> => {
    const url = `${API_BASE_URL}/attendance/holidays/public`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch public holidays');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};
/**
 * Fetch school holidays
 */
export const fetchSchoolHolidays = async (): Promise<{ date: string; reason: string }[]> => {
    const url = `${API_BASE_URL}/attendance/holidays/school`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch school holidays');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

/**
 * Fetch attendance analytics for a class
 */
export const fetchAttendanceAnalytics = async (
    classId: string,
    startDate: string,
    endDate: string
): Promise<any> => {
    const url = `${API_BASE_URL}/attendance/analytics/class/${classId}?startDate=${startDate}&endDate=${endDate}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch attendance analytics');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    return null;
};
/**
 * Fetch class comparisons for analytics
 */
export const fetchClassComparisons = async (): Promise<any[]> => {
    const schoolId = getSchoolId();
    let url = `${API_BASE_URL}/attendance/analytics/all-classes`;
    if (schoolId) {
        url += `?schoolId=${schoolId}`;
    }

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch class comparisons');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};
