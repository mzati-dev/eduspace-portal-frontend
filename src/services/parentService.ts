// services/parentService.ts

const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

// ====================== SCHOOL ID HELPERS ======================
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

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

// ====================== PARENT TYPES ======================
export interface ParentChild {
    id: string;
    name: string;
    exam_number: string;
    class_id: string;
    class_name: string;
    class_term: string;
    academic_year: string;
    photo_url?: string;
}

export interface ParentReportCard {
    id: string;
    student_id: string;
    student_name: string;
    term: string;
    academic_year: string;
    published_date: string;
    class_rank: number;
    total_students: number;
    overall_average: number;
    attendance_percentage: number;
    subjects: ParentSubjectGrade[];
    teacher_remarks: string;
    principal_remarks?: string;
    pdf_url?: string;
    created_at: string;
}

export interface ParentSubjectGrade {
    subject_name: string;
    qa1?: number;
    qa1_absent?: boolean;
    qa1_grade?: string;
    qa2?: number;
    qa2_absent?: boolean;
    qa2_grade?: string;
    end_of_term?: number;
    end_of_term_absent?: boolean;
    end_of_term_grade?: string;
    final_score: number;
    final_grade: string;
}

export interface ParentAssessment {
    id: string;
    subject_name: string;
    assessment_type: 'qa1' | 'qa2' | 'end_of_term';
    score?: number;
    is_absent: boolean;
    grade?: string;
    assessed_at: string;
    teacher_name?: string;
}

export interface ParentAttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    remarks?: string;
    recorded_by?: string;
}

export interface ParentFeeStatus {
    total_fees: number;
    paid_amount: number;
    balance: number;
    due_date?: string;
    term: string;
    academic_year: string;
    payments: ParentPayment[];
}

export interface ParentPayment {
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    transaction_id?: string;
    receipt_url?: string;
    status: 'paid' | 'pending' | 'failed';
}

export interface ParentTeacher {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    subject_name?: string;
    is_class_teacher: boolean;
    class_name?: string;
}

export interface ParentMessage {
    id: string;
    sender_id: string;
    sender_name: string;
    receiver_id: string;
    receiver_name: string;
    content: string;
    created_at: string;
    read: boolean;
    student_id?: string;
    student_name?: string;
}

export interface ParentNotification {
    id: string;
    title: string;
    content: string;
    type: 'message' | 'grade' | 'attendance' | 'fee' | 'announcement' | 'event';
    read: boolean;
    created_at: string;
    data?: any;
}

export interface SchoolAnnouncement {
    id: string;
    title: string;
    content: string;
    audience: 'all' | 'parents' | 'teachers' | 'students';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    expires_at?: string;
}

export interface ParentTimetableEntry {
    id: string;
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    start_time: string;
    end_time: string;
    subject_name: string;
    teacher_name: string;
    room?: string;
}

// ====================== PARENT AUTH FUNCTIONS ======================
export interface ParentLoginResponse {
    user: {
        id: string;
        parentName: string;
        parentPhone: string;
        parentEmail?: string;
        preferredContact?: string;
        role: 'parent';
        schoolId?: string;
        childId: string;
        childName: string;
        childExamNumber: string;
        childClass?: string;
    };
    access_token: string;
}

// ====================== PARENT SERVICE FUNCTIONS ======================

/**
 * Fetch all children linked to this parent
 */

export const parentLogin = async (phone: string, password: string): Promise<ParentLoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/parent-login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid phone number or password');
    }

    const data = await response.json();

    // Store token and user data
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('userRole', 'parent');

    return data;
};

export const fetchParentChildren = async (parentId: string): Promise<ParentChild[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/parents/${parentId}/children?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch children');
    }

    const response = await res.json();

    // Handle different response formats
    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    } else if (response.data && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

/**
 * Fetch report cards for a specific child
 */
export const fetchChildReportCards = async (childId: string): Promise<ParentReportCard[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/students/${childId}/report-cards?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch report cards');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Fetch assessments for a specific child
 */
export const fetchChildAssessments = async (childId: string): Promise<ParentAssessment[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/students/${childId}/assessments?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch assessments');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Fetch attendance records for a specific child
 */
export const fetchChildAttendance = async (childId: string): Promise<ParentAttendanceRecord[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    // const url = `${API_BASE_URL}/api/students/${childId}/attendance?schoolId=${schoolId}`;
    const url = `${API_BASE_URL}/api/classes/${childId}/attendance?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch attendance');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Fetch timetable for a specific child
 */
export const fetchChildTimetable = async (childId: string): Promise<ParentTimetableEntry[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/students/${childId}/timetable?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch timetable');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Fetch fee status for a specific child
 */
export const fetchChildFeeStatus = async (childId: string): Promise<ParentFeeStatus | null> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/students/${childId}/fees?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch fee status');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    } else if (response.data) {
        return response.data;
    }

    return null;
};

/**
 * Fetch teachers for a specific child's class
 */
export const fetchTeacherByClass = async (classId: string): Promise<ParentTeacher[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/classes/${classId}/teachers?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch teachers');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Send a message from parent to teacher
 */
export const sendParentMessage = async (data: {
    parentId: string;
    teacherId: string;
    childId?: string;
    subject?: string;
    message: string;
}): Promise<any> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/messages/send?schoolId=${schoolId}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            senderId: data.parentId,
            senderType: 'parent',
            receiverId: data.teacherId,
            receiverType: 'teacher',
            studentId: data.childId,
            subject: data.subject || 'Message from Parent',
            content: data.message,
            schoolId
        }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send message');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    return response;
};

/**
 * Fetch messages for a parent
 */
export const fetchParentMessages = async (
    parentId: string,
    childId?: string,
    teacherId?: string
): Promise<ParentMessage[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    let url = `${API_BASE_URL}/api/parents/${parentId}/messages?schoolId=${schoolId}`;
    if (childId) url += `&childId=${childId}`;
    if (teacherId) url += `&teacherId=${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch messages');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Fetch notifications for a parent
 */
export const fetchParentNotifications = async (parentId: string): Promise<ParentNotification[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/parents/${parentId}/notifications?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch notifications');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Mark a notification as read
 */
export const markNotificationRead = async (notificationId: string): Promise<void> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/notifications/${notificationId}/read?schoolId=${schoolId}`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to mark notification as read');
    }
};

/**
 * Mark all notifications as read for a parent
 */
export const markAllNotificationsRead = async (parentId: string): Promise<void> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/parents/${parentId}/notifications/read-all?schoolId=${schoolId}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to mark all notifications as read');
    }
};

/**
 * Download a report card PDF
 */
export const downloadReportCard = async (reportId: string): Promise<Blob> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/report-cards/${reportId}/download?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to download report card');
    }

    return await res.blob();
};

/**
 * Fetch school announcements for parents
 */
export const fetchSchoolAnnouncements = async (): Promise<SchoolAnnouncement[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/announcements?audience=parents&schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch announcements');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Fetch parent profile information
 */
export const fetchParentProfile = async (parentId: string): Promise<any> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/parents/${parentId}?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch parent profile');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    } else if (response.data) {
        return response.data;
    }

    return null;
};

/**
 * Update parent profile information
 */
export const updateParentProfile = async (parentId: string, data: {
    name?: string;
    phone?: string;
    address?: string;
    email?: string;
}): Promise<any> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/parents/${parentId}?schoolId=${schoolId}`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update parent profile');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    return response;
};

/**
 * Get unread notifications count
 */
export const getUnreadNotificationsCount = async (parentId: string): Promise<number> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/parents/${parentId}/notifications/unread-count?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch unread count');
    }

    const response = await res.json();

    if (response.success && typeof response.data === 'number') {
        return response.data;
    } else if (typeof response.count === 'number') {
        return response.count;
    }

    return 0;
};

/**
 * Fetch child's overall academic summary
 */
export const fetchChildAcademicSummary = async (childId: string): Promise<any> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/students/${childId}/academic-summary?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch academic summary');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    } else if (response.data) {
        return response.data;
    }

    return null;
};

/**
 * Fetch fee payment history with receipts
 */
export const fetchFeePaymentHistory = async (childId: string): Promise<ParentPayment[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/students/${childId}/fee-payments?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch payment history');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Initiate online fee payment
 */
export const initiateFeePayment = async (data: {
    childId: string;
    amount: number;
    paymentMethod: 'card' | 'mobile_money' | 'bank_transfer';
    redirectUrl?: string;
}): Promise<any> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/payments/initiate?schoolId=${schoolId}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            ...data,
            schoolId
        }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to initiate payment');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    return response;
};

/**
 * Download fee receipt
 */
export const downloadFeeReceipt = async (paymentId: string): Promise<Blob> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/payments/${paymentId}/receipt?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to download receipt');
    }

    return await res.blob();
};

/**
 * Get upcoming school events
 */
export const fetchUpcomingEvents = async (): Promise<any[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/events/upcoming?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch events');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};

/**
 * Request parent-teacher meeting
 */
export const requestMeeting = async (data: {
    parentId: string;
    teacherId: string;
    childId: string;
    preferredDates: string[];
    reason: string;
}): Promise<any> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/meetings/request?schoolId=${schoolId}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            ...data,
            schoolId
        }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to request meeting');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    return response;
};

/**
 * Get meeting requests for a parent
 */
export const fetchParentMeetings = async (parentId: string): Promise<any[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/parents/${parentId}/meetings?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch meetings');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};
/**
 * Fetch school calendar events
 */
export const fetchSchoolCalendar = async (): Promise<any[]> => {
    const schoolId = getSchoolId();

    if (!schoolId) {
        throw new Error('School ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/api/calendar?schoolId=${schoolId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        if (res.status === 404) return [];
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch calendar');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    } else if (Array.isArray(response)) {
        return response;
    }

    return [];
};