// analyticsService.ts - REPLACED VERSION

import { TeacherClassRanking, TeacherCohortTracking, TeacherCompareData, TeacherExamGap, TeacherFactorAnalysis, TeacherKeyMetric, TeacherRiskStudent, TeacherStudentDetail, TeacherSubjectDifficulty } from "@/components/teacher-panel/sidebar/analytics/TeacherAnalyticsTypes";



const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

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

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

// ========== TYPES FOR NEW DASHBOARD ==========
export interface KeyMetric {
    label: string;
    value: string | number;
    change: number;
    vsText: string;
    icon: string;
    color: string;
}

export interface GradeRanking {
    rank: number;
    name: string;
    passRate: number;
    avgScore: number;
    attendance: number;
    riskStudents: number;
    riskChange: number;
    trend: number;
}

export interface FactorAnalysis {
    factor: string;
    correlation: number;
    impact: string;
    insight: string;
}

export interface RiskStudent {
    id: string;
    name: string;
    examNumber: string;
    grade: string;
    attendance: number;
    catScore: number;
    fails: number;
    prevDrop: number;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface SubjectDifficulty {
    rank: number;
    name: string;
    avgScore: number;
    passRate: number;
    correlation: number;
    action: string;
}

export interface ExamGap {
    grade: string;
    avgCAT: number;
    avgExam: number;
    gap: number;
    studentsDrop: number;
}

export interface CohortTracking {
    cohort: string;
    data: number[];
    labels: string[];
    improving: number;
    declining: number;
    currentRate: number;
}

export interface StudentTimeline {
    term: string;
    marks: number;
    attendance: number;
}

export interface StudentFactorBreakdown {
    factor: string;
    studentValue: string;
    classAvg: string;
    status: string;
    impact: string;
}

export interface StudentSubjectBreakdown {
    subject: string;
    marks: number;
    attendance: number;
    classAvg: number;
    gap: number;
    status: string;
}

export interface StudentHistorical {
    term: string;
    attendance: number;
    marks: number;
    cat: number;
    exam: number;
    fails: number;
    score: number;
    status: string;
}

export interface StudentDetail {
    id: string;
    name: string;
    examNumber: string;        // instead of rollNo
    grade: string;
    status: string;
    classTeacher: string;
    currentMarks: number;
    currentAttendance: number;
    termOverTerm: number;
    classRank: string;
    timeline: StudentTimeline[];
    factorBreakdown: StudentFactorBreakdown[];
    subjectBreakdown: StudentSubjectBreakdown[];
    historical: StudentHistorical[];
    recommendations: string[];
}

export interface CompareData {
    term1: string;
    term2: string;
    overallPass1: number;
    overallPass2: number;
    avgScore1: number;
    avgScore2: number;
    avgAttendance1: number;
    avgAttendance2: number;
    departments: any[];
    newRiskStudents: any[];
}

// ========== OLD FUNCTIONS (KEPT FOR COMPATIBILITY) ==========
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

// ========== NEW FUNCTIONS FOR RESTRUCTURED ANALYTICS ==========

/**
 * Fetch main dashboard data (key metrics, grade ranking, factor analysis, etc.)
 */
export const fetchDashboardAnalytics = async (
    term: string,
    classId?: string
): Promise<{
    keyMetrics: KeyMetric[];
    gradeRanking: GradeRanking[];
    factorAnalysis: FactorAnalysis[];
    riskStudents: RiskStudent[];
    subjectDifficulty: SubjectDifficulty[];
    examGap: ExamGap[];
    cohortTracking: CohortTracking | null;
}> => {
    const schoolId = getSchoolId();

    let url = `${API_BASE_URL}/analytics/dashboard?term=${encodeURIComponent(term)}`;
    if (schoolId) url += `&schoolId=${schoolId}`;
    if (classId && classId !== 'all') url += `&classId=${classId}`;

    const res = await fetch(url, { headers: authHeaders() });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch dashboard analytics');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    throw new Error('Invalid response format from server');
};

/**
 * Fetch student detail for drill-down view
 */
export const fetchStudentDetail = async (
    studentId: string,
    term: string
): Promise<StudentDetail> => {
    const schoolId = getSchoolId();

    let url = `${API_BASE_URL}/analytics/student/${studentId}?term=${encodeURIComponent(term)}`;
    if (schoolId) url += `&schoolId=${schoolId}`;

    const res = await fetch(url, { headers: authHeaders() });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch student details');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    throw new Error('Invalid response format from server');
};

/**
 * Fetch compare terms data
 */
export const fetchCompareTermsData = async (
    term1: string,
    term2: string,
    classId?: string
): Promise<CompareData> => {
    const schoolId = getSchoolId();

    let url = `${API_BASE_URL}/analytics/compare?term1=${encodeURIComponent(term1)}&term2=${encodeURIComponent(term2)}`;
    if (schoolId) url += `&schoolId=${schoolId}`;
    if (classId && classId !== 'all') url += `&classId=${classId}`;

    const res = await fetch(url, { headers: authHeaders() });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch compare data');
    }

    const response = await res.json();

    if (response.success && response.data) {
        return response.data;
    }

    throw new Error('Invalid response format from server');
};

/**
 * Fetch students for a specific grade/class
 */
export const fetchGradeStudents = async (
    gradeName: string,
    term: string
): Promise<any[]> => {
    const schoolId = getSchoolId();

    let url = `${API_BASE_URL}/analytics/grade/${encodeURIComponent(gradeName)}/students?term=${encodeURIComponent(term)}`;
    if (schoolId) url += `&schoolId=${schoolId}`;

    const res = await fetch(url, { headers: authHeaders() });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch grade students');
    }

    const response = await res.json();

    if (response.success && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

// ========== OLD FUNCTIONS (PRESERVED) ==========

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

export const fetchInterventionSummary = async (): Promise<InterventionSummary> => {
    const url = `${API_BASE_URL}/analytics/interventions`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch intervention summary');
    const response = await res.json();
    return response.data;
};

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

/**
 * Fetch available terms from backend
 */
export const fetchTerms = async (): Promise<{ value: string; label: string }[]> => {
    const schoolId = getSchoolId();

    let url = `${API_BASE_URL}/analytics/terms`;
    if (schoolId) url += `?schoolId=${schoolId}`;

    const res = await fetch(url, { headers: authHeaders() });

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

// ========== TEACHER ANALYTICS FUNCTIONS ==========

/**
 * Fetch teacher dashboard analytics data
 */
export const fetchTeacherDashboardAnalytics = async (
    teacherId: string,
    term: string,
    classId?: string
): Promise<{
    keyMetrics: TeacherKeyMetric[];
    classRanking: TeacherClassRanking[];
    factorAnalysis: TeacherFactorAnalysis[];
    riskStudents: TeacherRiskStudent[];
    subjectDifficulty: TeacherSubjectDifficulty[];
    examGap: TeacherExamGap[];
    cohortTracking: TeacherCohortTracking | null;
}> => {
    const schoolId = getSchoolId();
    let url = `${API_BASE_URL}/analytics/teacher/${teacherId}/dashboard?term=${encodeURIComponent(term)}`;
    if (schoolId) url += `&schoolId=${schoolId}`;
    if (classId && classId !== 'all') url += `&classId=${classId}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch teacher dashboard analytics');
    }
    const response = await res.json();
    if (response.success && response.data) return response.data;
    throw new Error('Invalid response format from server');
};

/**
 * Fetch teacher student detail for drill-down
 */
export const fetchTeacherStudentDetail = async (
    studentId: string,
    term: string
): Promise<TeacherStudentDetail> => {
    const schoolId = getSchoolId();
    let url = `${API_BASE_URL}/analytics/teacher/student/${studentId}?term=${encodeURIComponent(term)}`;
    if (schoolId) url += `&schoolId=${schoolId}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch student details');
    }
    const response = await res.json();
    if (response.success && response.data) return response.data;
    throw new Error('Invalid response format from server');
};

/**
 * Fetch teacher compare terms data
 */
export const fetchTeacherCompareTermsData = async (
    teacherId: string,
    term1: string,
    term2: string,
    classId?: string
): Promise<TeacherCompareData> => {
    const schoolId = getSchoolId();
    let url = `${API_BASE_URL}/analytics/teacher/${teacherId}/compare?term1=${encodeURIComponent(term1)}&term2=${encodeURIComponent(term2)}`;
    if (schoolId) url += `&schoolId=${schoolId}`;
    if (classId && classId !== 'all') url += `&classId=${classId}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch compare data');
    }
    const response = await res.json();
    if (response.success && response.data) return response.data;
    throw new Error('Invalid response format from server');
};

/**
 * Fetch students for a specific grade/class (teacher view)
 */
export const fetchTeacherGradeStudents = async (
    teacherId: string,
    className: string,
    term: string
): Promise<any[]> => {
    const schoolId = getSchoolId();
    let url = `${API_BASE_URL}/analytics/teacher/${teacherId}/grade/${encodeURIComponent(className)}/students?term=${encodeURIComponent(term)}`;
    if (schoolId) url += `&schoolId=${schoolId}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch grade students');
    }
    const response = await res.json();
    if (response.success && Array.isArray(response.data)) return response.data;
    return [];
};