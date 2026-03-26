const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface SchoolProfile {
    name: string;
    motto: string;
    address: string;
    phone: string;
    alternativePhones?: string[];
    email: string;
    website: string;
    logo?: string;
    favicon?: string;
    established: string;
    registrationNumber: string;
    taxId: string;
    currency: string;
    timezone: string;
    language: string;
    academicYear: string;
    terms: string[];
    schoolId?: string;
}

export interface NotificationSettings {
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    pushEnabled: boolean;
    parentNotifications: {
        attendance: boolean;
        fees: boolean;
        results: boolean;
        events: boolean;
        announcements: boolean;
    };
    teacherNotifications: {
        attendance: boolean;
        results: boolean;
        meetings: boolean;
        announcements: boolean;
    };
    studentNotifications: {
        attendance: boolean;
        results: boolean;
        events: boolean;
        announcements: boolean;
    };
    reminderTiming: {
        fees: number;
        events: number;
        meetings: number;
    };
}

export interface SecuritySettings {
    twoFactorAuth: boolean;
    passwordPolicy: {
        minLength: number;
        requireNumbers: boolean;
        requireSymbols: boolean;
        requireUppercase: boolean;
        expiryDays: number;
    };
    sessionTimeout: number;
    ipWhitelist: string[];
    allowedDomains: string[];
    loginAttempts: number;
    lockoutDuration: number;
}

export interface AcademicSettings {
    gradingSystem: 'percentage' | 'letter' | 'gpa';
    gradeScale: {
        min: number;
        max: number;
        grade: string;
        points?: number;
    }[];
    subjects: string[];
    assessmentTypes: string[];  // Allow any custom assessment names
    passMark: number;
    rankCalculation: 'average' | 'weighted' | 'cumulative';
    allowRetakes: boolean;
}

export interface FeeSettings {
    currency: string;
    paymentMethods: ('cash' | 'card' | 'bank' | 'mobile')[];
    lateFeePercentage: number;
    gracePeriod: number;
    discounts: {
        name: string;
        percentage: number;
        applicableTo: string[];
    }[];
    installments: {
        name: string;
        percentage: number;
        dueDate: string;
    }[];
    receiptPrefix: string;
    invoicePrefix: string;
}

export interface BackupSettings {
    autoBackup: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    retention: number;
    lastBackup?: string;
    backupLocation: 'local' | 'cloud' | 'both';
    includeMedia: boolean;
}

export interface BackupFile {
    id: string;
    name: string;
    size: number;
    createdAt: string;
    path: string;
}

export interface AllSettings {
    school: SchoolProfile;
    notifications: NotificationSettings;
    security: SecuritySettings;
    academic: AcademicSettings;
    fees: FeeSettings;
    backup: BackupSettings;
}

// Fetch all settings
export const fetchAllSettings = async (): Promise<AllSettings> => {
    const url = `${API_BASE_URL}/settings`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch settings');
    const response = await res.json();
    return response.data;
};

// Fetch school profile
export const fetchSchoolProfile = async (): Promise<SchoolProfile> => {
    const url = `${API_BASE_URL}/settings/school`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch school profile');
    const response = await res.json();
    return response.data;
};

// Update school profile
export const updateSchoolProfile = async (data: Partial<SchoolProfile>): Promise<SchoolProfile> => {
    const url = `${API_BASE_URL}/settings/school`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update school profile');
    }

    const response = await res.json();
    return response.data;
};

// Upload school logo
export const uploadSchoolLogo = async (file: File): Promise<{ logoUrl: string }> => {
    const url = `${API_BASE_URL}/settings/school/logo`;

    const formData = new FormData();
    formData.append('logo', file);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to upload logo');
    }

    const response = await res.json();
    return response.data;
};

// Fetch notification settings
export const fetchNotificationSettings = async (): Promise<NotificationSettings> => {
    const url = `${API_BASE_URL}/settings/notifications`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch notification settings');
    const response = await res.json();
    return response.data;
};

// Update notification settings
export const updateNotificationSettings = async (data: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const url = `${API_BASE_URL}/settings/notifications`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update notification settings');
    }

    const response = await res.json();
    return response.data;
};

// Fetch security settings
export const fetchSecuritySettings = async (): Promise<SecuritySettings> => {
    const url = `${API_BASE_URL}/settings/security`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch security settings');
    const response = await res.json();
    return response.data;
};

// Update security settings
export const updateSecuritySettings = async (data: Partial<SecuritySettings>): Promise<SecuritySettings> => {
    const url = `${API_BASE_URL}/settings/security`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update security settings');
    }

    const response = await res.json();
    return response.data;
};

// Fetch academic settings
export const fetchAcademicSettings = async (): Promise<AcademicSettings> => {
    const url = `${API_BASE_URL}/settings/academic`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch academic settings');
    const response = await res.json();
    return response.data;
};

// Update academic settings
export const updateAcademicSettings = async (data: Partial<AcademicSettings>): Promise<AcademicSettings> => {
    const url = `${API_BASE_URL}/settings/academic`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update academic settings');
    }

    const response = await res.json();
    return response.data;
};

// Fetch fee settings
export const fetchFeeSettings = async (): Promise<FeeSettings> => {
    const url = `${API_BASE_URL}/settings/fees`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch fee settings');
    const response = await res.json();
    return response.data;
};

// Update fee settings
export const updateFeeSettings = async (data: Partial<FeeSettings>): Promise<FeeSettings> => {
    const url = `${API_BASE_URL}/settings/fees`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update fee settings');
    }

    const response = await res.json();
    return response.data;
};

// Fetch backup settings
export const fetchBackupSettings = async (): Promise<BackupSettings> => {
    const url = `${API_BASE_URL}/settings/backup`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch backup settings');
    const response = await res.json();
    return response.data;
};

// Update backup settings
export const updateBackupSettings = async (data: Partial<BackupSettings>): Promise<BackupSettings> => {
    const url = `${API_BASE_URL}/settings/backup`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update backup settings');
    }

    const response = await res.json();
    return response.data;
};

// Fetch backup files
export const fetchBackupFiles = async (): Promise<BackupFile[]> => {
    const url = `${API_BASE_URL}/settings/backup/files`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch backup files');
    const response = await res.json();
    return response.data;
};

// Create backup
export const createBackup = async (): Promise<{ backupId: string; message: string }> => {
    const url = `${API_BASE_URL}/settings/backup/create`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create backup');
    }

    const response = await res.json();
    return response.data;
};

// Restore from backup
export const restoreBackup = async (backupId: string): Promise<void> => {
    const url = `${API_BASE_URL}/settings/backup/restore/${backupId}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to restore backup');
    }
};

// Download backup
export const downloadBackup = async (backupId: string): Promise<Blob> => {
    const url = `${API_BASE_URL}/settings/backup/download/${backupId}`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to download backup');
    }

    return await res.blob();
};

// Test notification channel
export const testNotificationChannel = async (channel: 'email' | 'sms' | 'whatsapp'): Promise<void> => {
    const url = `${API_BASE_URL}/settings/notifications/test/${channel}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `Failed to test ${channel} connection`);
    }
};

// Restore settings to default
export const restoreSettingsToDefault = async (section: string): Promise<void> => {
    const url = `${API_BASE_URL}/settings/${section}/restore-default`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to restore settings');
    }
};
// Add to settingsService.ts
export const fetchSubjectMaxMarks = async (classId?: string): Promise<{ subjectId: string; subjectName: string; maxMarks: number }[]> => {
    let url = `${API_BASE_URL}/settings/subject-max-marks`;
    if (classId) {
        url += `?classId=${classId}`;
    }

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subject max marks');
    const response = await res.json();
    return response.data;
};

export const updateSubjectMaxMarks = async (classId: string, data: any[]): Promise<void> => {
    const url = `${API_BASE_URL}/settings/subject-max-marks`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ classId, data })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update subject max marks');
    }
};

// Add to settingsService.ts
export const fetchAssessmentNames = async (): Promise<{ firstAssessment: string; secondAssessment: string; finalAssessment: string }> => {
    const url = `${API_BASE_URL}/settings/assessment-names`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch assessment names');
    const response = await res.json();
    return response.data;
};

export const updateAssessmentNames = async (data: { firstAssessment: string; secondAssessment: string; finalAssessment: string }): Promise<void> => {
    const url = `${API_BASE_URL}/settings/assessment-names`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update assessment names');
    }
};

export const updateAssessmentTypes = async (assessmentTypes: string[]): Promise<void> => {
    const url = `${API_BASE_URL}/settings/assessment-types`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ assessmentTypes })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update assessment types');
    }
};

export const changeSchoolAdminPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const url = `${API_BASE_URL}/settings/change-password`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to change password');
    }
};