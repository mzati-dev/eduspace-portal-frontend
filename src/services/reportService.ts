// reportService.ts
const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface ReportFilters {
    classId?: string;
    term?: string;
    reportType?: 'academic' | 'attendance' | 'behavior' | 'summary';
    format?: 'pdf' | 'excel' | 'csv';
}

// Generate report
export const generateReport = async (filters: ReportFilters) => {
    const url = `${API_BASE_URL}/reports/generate`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(filters)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate report');
    }

    const response = await res.json();
    return response.data;
};

// Get class performance summary
export const getClassPerformance = async (classId: string, term: string) => {
    const url = `${API_BASE_URL}/reports/performance/${classId}?term=${term}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch performance data');
    }

    const response = await res.json();
    return response.data;
};

// Get attendance report
export const getAttendanceReport = async (classId: string, term: string) => {
    const url = `${API_BASE_URL}/reports/attendance/${classId}?term=${term}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch attendance data');
    }

    const response = await res.json();
    return response.data;
};

// Get recent reports list
export const getRecentReports = async () => {
    const url = `${API_BASE_URL}/reports/recent`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch reports');
    }

    const response = await res.json();
    return response.data;
};

// Download report
export const downloadReport = async (reportId: string, format: string) => {
    const url = `${API_BASE_URL}/reports/download/${reportId}?format=${format}`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to download report');
    }

    // Handle file download
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `report-${reportId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
};

// // reportService.ts
// const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

// const getAuthToken = () => {
//     return localStorage.getItem('token');
// };

// const authHeaders = () => ({
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${getAuthToken()}`
// });

// export interface ReportFilters {
//     classId?: string;
//     term?: string;
//     reportType?: 'academic' | 'attendance' | 'behavior' | 'summary';
//     format?: 'pdf' | 'excel' | 'csv';
// }

// // Generate report
// export const generateReport = async (filters: ReportFilters) => {
//     const url = `${API_BASE_URL}/reports/generate`;

//     const res = await fetch(url, {
//         method: 'POST',
//         headers: authHeaders(),
//         body: JSON.stringify(filters)
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to generate report');
//     }

//     return res.json();
// };

// // Get class performance summary
// export const getClassPerformance = async (classId: string, term: string) => {
//     const url = `${API_BASE_URL}/reports/performance/${classId}?term=${term}`;

//     const res = await fetch(url, {
//         headers: authHeaders()
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to fetch performance data');
//     }

//     return res.json();
// };

// // Get attendance report
// export const getAttendanceReport = async (classId: string, term: string) => {
//     const url = `${API_BASE_URL}/reports/attendance/${classId}?term=${term}`;

//     const res = await fetch(url, {
//         headers: authHeaders()
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to fetch attendance data');
//     }

//     return res.json();
// };

// // Get recent reports list
// export const getRecentReports = async () => {
//     const url = `${API_BASE_URL}/reports/recent`;

//     const res = await fetch(url, {
//         headers: authHeaders()
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to fetch reports');
//     }

//     return res.json();
// };

// // Download report
// export const downloadReport = async (reportId: string, format: string) => {
//     const url = `${API_BASE_URL}/reports/download/${reportId}?format=${format}`;

//     const res = await fetch(url, {
//         headers: {
//             'Authorization': `Bearer ${getAuthToken()}`
//         }
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to download report');
//     }

//     // Handle file download
//     const blob = await res.blob();
//     const downloadUrl = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = downloadUrl;
//     link.download = `report-${reportId}.${format}`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(downloadUrl);
// };