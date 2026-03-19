const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface TimeSlot {
    id: string;
    period: number;
    startTime: string;
    endTime: string;
    break?: boolean;
}

export interface TimetableEntry {
    id: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    period: number;
    classId: string;
    subjectId: string;
    teacherId: string;
    room: string;
    startTime: string;
    endTime: string;
    academicYear?: string;
    term?: string;
    weekStart?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TimetableFilters {
    classId?: string;
    term?: string;
    weekStart?: string;
    teacherId?: string;
}

export interface TimetableStats {
    totalEntries: number;
    totalClasses: number;
    totalTeachers: number;
    totalRooms: number;
    conflicts: number;
}


export interface TimetableTemplate {
    id: string;
    name: string;
    data: any; // Template structure
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
}

export interface TemplateEntry {
    day: string;
    period: number;
    defaultSubjectId?: string;
    defaultTeacherId?: string;
    defaultRoom?: string;
}

// Fetch timetable entries
export const fetchTimetableEntries = async (
    filters: TimetableFilters
): Promise<TimetableEntry[]> => {
    let url = `${API_BASE_URL}/timetable/admin/entries`;
    const params = new URLSearchParams();

    if (filters.classId) params.append('classId', filters.classId);
    if (filters.term) params.append('term', filters.term);
    if (filters.weekStart) params.append('weekStart', filters.weekStart);
    if (filters.teacherId) params.append('teacherId', filters.teacherId);

    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch timetable entries');
    const response = await res.json();
    return response.data;
};

// Create timetable entry
export const createTimetableEntry = async (
    data: Omit<TimetableEntry, 'id'>
): Promise<TimetableEntry> => {
    const url = `${API_BASE_URL}/timetable/admin/entries`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create entry');
    }

    const response = await res.json();
    return response.data;
};

// Update timetable entry
export const updateTimetableEntry = async (
    entryId: string,
    data: Partial<TimetableEntry>
): Promise<TimetableEntry> => {
    const url = `${API_BASE_URL}/timetable/admin/entries/${entryId}`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update entry');
    }

    const response = await res.json();
    return response.data;
};

// Delete timetable entry
export const deleteTimetableEntry = async (entryId: string): Promise<void> => {
    const url = `${API_BASE_URL}/timetable/admin/entries/${entryId}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete entry');
    }
};

// Bulk create entries (copy week)
export const bulkCreateEntries = async (
    entries: Omit<TimetableEntry, 'id'>[]
): Promise<TimetableEntry[]> => {
    const url = `${API_BASE_URL}/timetable/admin/entries/bulk`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ entries })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create entries');
    }

    const response = await res.json();
    return response.data;
};

// Copy timetable from one week to another
export const copyTimetableWeek = async (
    sourceWeek: string,
    targetWeek: string,
    classId?: string
): Promise<{ copied: number }> => {
    const url = `${API_BASE_URL}/timetable/admin/copy-week`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ sourceWeek, targetWeek, classId })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to copy timetable');
    }

    const response = await res.json();
    return response.data;
};

// Publish timetable
export const publishTimetable = async (
    classId: string,
    term: string,
    weekStart?: string
): Promise<void> => {
    const url = `${API_BASE_URL}/timetable/admin/publish`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ classId, term, weekStart })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to publish timetable');
    }
};

// Get timetable stats
export const fetchTimetableStats = async (
    filters?: TimetableFilters
): Promise<TimetableStats> => {
    let url = `${API_BASE_URL}/timetable/admin/stats`;
    const params = new URLSearchParams();

    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.term) params.append('term', filters.term);
    if (filters?.weekStart) params.append('weekStart', filters.weekStart);

    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stats');
    const response = await res.json();
    return response.data;
};

// Export timetable
export const exportTimetable = async (
    format: 'pdf' | 'excel',
    filters: TimetableFilters
): Promise<Blob> => {
    let url = `${API_BASE_URL}/timetable/admin/export?format=${format}`;
    const params = new URLSearchParams();

    if (filters.classId) params.append('classId', filters.classId);
    if (filters.term) params.append('term', filters.term);
    if (filters.weekStart) params.append('weekStart', filters.weekStart);

    if (params.toString()) url += `&${params.toString()}`;

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

// Import timetable
export const importTimetable = async (
    file: File,
    classId: string,
    term: string,
    weekStart?: string
): Promise<{ imported: number }> => {
    const url = `${API_BASE_URL}/timetable/admin/import`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('classId', classId);
    formData.append('term', term);
    if (weekStart) formData.append('weekStart', weekStart);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to import timetable');
    }

    const response = await res.json();
    return response.data;
};

// Check for conflicts
export const checkTimetableConflicts = async (
    filters: TimetableFilters
): Promise<any[]> => {
    let url = `${API_BASE_URL}/timetable/admin/conflicts`;
    const params = new URLSearchParams();

    if (filters.classId) params.append('classId', filters.classId);
    if (filters.term) params.append('term', filters.term);
    if (filters.weekStart) params.append('weekStart', filters.weekStart);

    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to check conflicts');
    const response = await res.json();
    return response.data;
};

// Get available time slots
export const fetchTimeSlots = async (): Promise<TimeSlot[]> => {
    const url = `${API_BASE_URL}/timetable/admin/time-slots`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch time slots');
    const response = await res.json();
    return response.data;
};
// Fetch timetable templates
export const fetchTimetableTemplates = async (): Promise<TimetableTemplate[]> => {
    const url = `${API_BASE_URL}/timetable/admin/templates`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch templates');
    const response = await res.json();
    return response.data;
};

// Create timetable template
export const createTimetableTemplate = async (data: {
    name: string;
    data: any;
}): Promise<TimetableTemplate> => {
    const url = `${API_BASE_URL}/timetable/admin/templates`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create template');
    }

    const response = await res.json();
    return response.data;
};

// Generate timetable from template
export const generateTimetableFromTemplate = async (
    templateId: string,
    classId: string,
    term: string,
    weekStart?: string
): Promise<{ generated: number }> => {
    const url = `${API_BASE_URL}/timetable/admin/generate-from-template`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ templateId, classId, term, weekStart })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate timetable from template');
    }

    const response = await res.json();
    return response.data;
};

// Delete template
export const deleteTimetableTemplate = async (templateId: string): Promise<void> => {
    const url = `${API_BASE_URL}/timetable/admin/templates/${templateId}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete template');
    }
};