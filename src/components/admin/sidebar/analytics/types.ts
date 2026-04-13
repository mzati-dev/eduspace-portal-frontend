// components/admin/analytics/types.ts

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
    grade: string;
    batch: string;
    rollNo: string;
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

export interface CompareDepartment {
    name: string;
    passRate1: number;
    passRate2: number;
    change: number;
    status: string;
}

export interface CompareRiskStudent {
    name: string;
    grade: string;
    att1: number;
    att2: number;
    marks1: number;
    marks2: number;
    drop: number;
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
    departments: CompareDepartment[];
    newRiskStudents: CompareRiskStudent[];
}

export type ViewType = 'main' | 'student' | 'compare';
// components/admin/analytics/types.ts

// Add these new interfaces

export interface ExamResult {
    subject: string;
    grade: string;
    score: number;
    points?: number;
}

export interface StudentExamPerformance {
    studentId: string;
    name: string;
    examNumber: string;
    grade: string;
    totalPoints: number;
    averageScore: number;
    subjects: ExamResult[];
    division?: 'I' | 'II' | 'III' | 'IV' | 'FAIL';
    passed: boolean;
    selected?: boolean;  // For secondary selection
}

export interface ExamAnalysis {
    examType: 'PSLCE' | 'JCE' | 'MSCE';
    year: number;
    totalStudents: number;
    passed: number;
    passRate: number;
    divisionBreakdown: {
        divisionI: number;
        divisionII: number;
        divisionIII: number;
        divisionIV: number;
        fail: number;
    };
    topPerformers: StudentExamPerformance[];
    atRiskStudents: StudentExamPerformance[];
    subjectPerformance: {
        subject: string;
        averageScore: number;
        passRate: number;
        highestScore: number;
        lowestScore: number;
    }[];
    allStudents?: {  // ← ADD THIS
        studentId: string;
        name: string;
        examNumber: string;
        grade: string;
        totalPoints: number;
        averageScore: number;
        passed: boolean;
        division: string;
    }[];
}

export interface SecondarySelection {
    studentId: string;
    name: string;
    examNumber: string;
    selectedTo: string;  // Secondary school name
    selectionType: 'automatic' | 'merit' | 'boarding' | 'day';
    points: number;
}

export interface UniversitySelection {
    studentId: string;
    name: string;
    examNumber: string;
    selectedTo: string;  // University name
    program: string;
    points: number;
    selectionType: 'government' | 'private' | 'self-sponsored';
}