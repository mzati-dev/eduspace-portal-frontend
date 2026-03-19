const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface StudentRisk {
    id: string;
    name: string;
    examNumber: string;
    class: string;
    classId: string;
    riskScore: number;
    riskLevel: 'high' | 'medium' | 'low';
    factors: string[];
    predictedGrade: string;
    currentAverage: number;
    attendanceRate: number;
    trend: 'improving' | 'declining' | 'stable';
}

export interface ClassPerformance {
    classId: string;
    className: string;
    averageScore: number;
    passRate: number;
    distinctionRate: number;
    totalStudents: number;
    trend: number;
    topSubject: string;
    topSubjectId?: string;
    strugglingSubject: string;
    strugglingSubjectId?: string;
}

export interface SubjectPerformance {
    subjectId: string;
    name: string;
    averageScore: number;
    passRate: number;
    distinctionRate: number;
    totalStudents: number;
    trend: number;
}

export interface TrendData {
    period: string;
    overall: number;
    subjects: Record<string, number>;
}

export interface KeyMetrics {
    overallPerformance: number;
    performanceTrend: number;
    studentsOnTrack: number;
    studentsOnTrackPercentage: number;
    studentsAtRisk: number;
    distinctions: number;
    distinctionsTrend: number;
    targetAchievement: number;
}

export interface PredictionSummary {
    predictedPassRate: number;
    studentsImproving: number;
    studentsImprovingPercentage: number;
    studentsDeclining: number;
    studentsDecliningPercentage: number;
    studentsStable: number;
    studentsStablePercentage: number;
    predictedDistinctions: number;
}

export interface InterventionSummary {
    studentsNeedingSupport: number;
    honorRollCount: number;
    chronicAbsenteeism: number;
}

// Fetch at-risk students
export const fetchAtRiskStudents = async (
    classId?: string,
    timeframe?: string
): Promise<StudentRisk[]> => {
    let url = `${API_BASE_URL}/analytics/at-risk`;
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (timeframe) params.append('timeframe', timeframe);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch at-risk students');
    const response = await res.json();
    return response.data;
};

// Fetch class performance comparison
export const fetchClassPerformance = async (
    timeframe?: string
): Promise<ClassPerformance[]> => {
    let url = `${API_BASE_URL}/analytics/classes`;
    if (timeframe) url += `?timeframe=${timeframe}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch class performance');
    const response = await res.json();
    return response.data;
};

// Fetch subject performance
export const fetchSubjectPerformance = async (
    timeframe?: string
): Promise<SubjectPerformance[]> => {
    let url = `${API_BASE_URL}/analytics/subjects`;
    if (timeframe) url += `?timeframe=${timeframe}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subject performance');
    const response = await res.json();
    return response.data;
};

// Fetch trend data
export const fetchTrendData = async (
    metric: string,
    timeframe: string,
    classId?: string
): Promise<TrendData[]> => {
    let url = `${API_BASE_URL}/analytics/trends/${metric}`;
    const params = new URLSearchParams();
    params.append('timeframe', timeframe);
    if (classId) params.append('classId', classId);
    url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch trend data');
    const response = await res.json();
    return response.data;
};

// Fetch key metrics
export const fetchKeyMetrics = async (
    timeframe?: string,
    classId?: string
): Promise<KeyMetrics> => {
    let url = `${API_BASE_URL}/analytics/metrics`;
    const params = new URLSearchParams();
    if (timeframe) params.append('timeframe', timeframe);
    if (classId) params.append('classId', classId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch key metrics');
    const response = await res.json();
    return response.data;
};

// Fetch prediction summary
export const fetchPredictionSummary = async (
    timeframe?: string
): Promise<PredictionSummary> => {
    let url = `${API_BASE_URL}/analytics/predictions`;
    if (timeframe) url += `?timeframe=${timeframe}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch predictions');
    const response = await res.json();
    return response.data;
};

// Fetch intervention summary
export const fetchInterventionSummary = async (): Promise<InterventionSummary> => {
    const url = `${API_BASE_URL}/analytics/interventions`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch intervention summary');
    const response = await res.json();
    return response.data;
};

// Generate predictions (trigger AI analysis)
export const generatePredictions = async (): Promise<void> => {
    const url = `${API_BASE_URL}/analytics/predictions/generate`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate predictions');
    }
};

// Export analytics report
export const exportAnalyticsReport = async (
    format: 'pdf' | 'excel',
    timeframe?: string,
    classId?: string
): Promise<Blob> => {
    let url = `${API_BASE_URL}/analytics/export?format=${format}`;
    if (timeframe) url += `&timeframe=${timeframe}`;
    if (classId) url += `&classId=${classId}`;

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