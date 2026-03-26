const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface FeeStructure {
    id: string;
    term: string;
    academicYear: string;
    tuition: number;
    development: number;
    sports: number;
    library: number;
    transport: number;
    meal: number;           // ← ADD
    exam: number;           // ← ADD
    customFees?: {          // ← ADD
        id: string;
        name: string;
        amount: number;
    }[];
    total: number;
    dueDate: string;
    classId?: string;
    className?: string;
}

export interface Payment {
    id: string;
    date: string;
    amount: number;
    method: 'cash' | 'card' | 'bank' | 'mobile';
    reference: string;
    receiptNumber: string;
    status: 'completed' | 'pending' | 'failed';
    recordedBy?: string;
    notes?: string;
}

export interface Reminder {
    id: string;
    type: 'sms' | 'email' | 'push';
    sentAt: string;
    status: 'sent' | 'failed' | 'pending';
    message: string;
    recipientCount?: number;
}

export interface StudentFee {
    id: string;
    studentId: string;
    studentName: string;
    examNumber: string;
    class: string;
    classId: string;
    parentPhone: string;
    parentEmail: string;
    parentId?: string;
    feeStructureId: string;
    feeStructure: FeeStructure;
    paid: number;
    balance: number;
    status: 'paid' | 'partial' | 'unpaid' | 'overdue';
    lastPayment?: {
        date: string;
        amount: number;
        method: string;
        reference: string;
    };
    paymentHistory: Payment[];
    reminders: Reminder[];
}

export interface FeeSummary {
    totalCollected: number;
    expectedRevenue: number;
    collectionRate: number;
    overdue: number;
    paidToday: number;
    pendingThisWeek: number;
    paidThisMonth: number;
    paidThisTerm: number;
}

export interface PaymentFilters {
    classId?: string;
    term?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}

// Fetch fee structures
export const fetchFeeStructures = async (term?: string, academicYear?: string): Promise<FeeStructure[]> => {
    let url = `${API_BASE_URL}/fees/structures`;
    const params = new URLSearchParams();
    if (term) params.append('term', term);
    if (academicYear) params.append('academicYear', academicYear);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch fee structures');
    const response = await res.json();
    return response.data;
};

// Fetch student fees
export const fetchStudentFees = async (
    filters?: PaymentFilters
): Promise<StudentFee[]> => {
    let url = `${API_BASE_URL}/fees/students`;
    const params = new URLSearchParams();
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.term) params.append('term', filters.term);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch student fees');
    const response = await res.json();
    return response.data;
};

// Fetch fee summary
export const fetchFeeSummary = async (
    term?: string,
    classId?: string
): Promise<FeeSummary> => {
    let url = `${API_BASE_URL}/fees/summary`;
    const params = new URLSearchParams();
    if (term) params.append('term', term);
    if (classId) params.append('classId', classId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch fee summary');
    const response = await res.json();
    return response.data;
};

// Record payment
export const recordPayment = async (data: {
    studentId: string;
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
    date?: string;
}): Promise<Payment> => {
    const url = `${API_BASE_URL}/fees/payments`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to record payment');
    }

    const response = await res.json();
    return response.data;
};

// Send reminders
export const sendReminders = async (data: {
    studentIds: string[];
    type: 'sms' | 'email' | 'push';
    customMessage?: string;
}): Promise<{ success: boolean; sent: number; failed: number }> => {
    const url = `${API_BASE_URL}/fees/reminders/send`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send reminders');
    }

    const response = await res.json();
    return response.data;
};

// Generate receipt
export const generateReceipt = async (paymentId: string): Promise<Blob> => {
    const url = `${API_BASE_URL}/fees/receipts/${paymentId}`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate receipt');
    }

    return await res.blob();
};

// Download receipt
export const downloadReceipt = async (receiptNumber: string): Promise<Blob> => {
    const url = `${API_BASE_URL}/fees/receipts/download/${receiptNumber}`;

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

// Get payment history
export const fetchPaymentHistory = async (
    studentId?: string,
    fromDate?: string,
    toDate?: string
): Promise<Payment[]> => {
    let url = `${API_BASE_URL}/fees/payments/history`;
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch payment history');
    const response = await res.json();
    return response.data;
};

// Get reminder history
export const fetchReminderHistory = async (
    studentId?: string
): Promise<Reminder[]> => {
    let url = `${API_BASE_URL}/fees/reminders/history`;
    if (studentId) url += `?studentId=${studentId}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch reminder history');
    const response = await res.json();
    return response.data;
};

// Export fees report
export const exportFeesReport = async (
    format: 'pdf' | 'excel',
    filters?: PaymentFilters
): Promise<Blob> => {
    let url = `${API_BASE_URL}/fees/export?format=${format}`;
    const params = new URLSearchParams();
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.term) params.append('term', filters.term);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (params.toString()) url += `&${params.toString()}`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to export report');
    }

    return await res.blob();
};

// Add these to your feesService.ts file

// Create fee structure
export const createFeeStructure = async (data: Partial<FeeStructure>): Promise<FeeStructure> => {
    const url = `${API_BASE_URL}/fees/structures`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create fee structure');
    }

    const response = await res.json();
    return response.data;
};

// Update fee structure
export const updateFeeStructure = async (id: string, data: Partial<FeeStructure>): Promise<FeeStructure> => {
    const url = `${API_BASE_URL}/fees/structures/${id}`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update fee structure');
    }

    const response = await res.json();
    return response.data;
};

// Delete fee structure
export const deleteFeeStructure = async (id: string): Promise<void> => {
    const url = `${API_BASE_URL}/fees/structures/${id}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete fee structure');
    }
};