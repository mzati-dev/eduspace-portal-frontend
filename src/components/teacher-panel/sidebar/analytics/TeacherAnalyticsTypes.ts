// components/teacher/analytics/TeacherAnalyticsTypes.ts

export interface TeacherKeyMetric {
    label: string;
    value: string | number;
    change: number;
    vsText: string;
    icon: string;
    color: string;
}

export interface TeacherClassRanking {
    rank: number;
    name: string;
    passRate: number;
    avgScore: number;
    attendance: number;
    riskStudents: number;
    riskChange: number;
    trend: number;
}

export interface TeacherFactorAnalysis {
    factor: string;
    correlation: number;
    impact: string;
    insight: string;
}

export interface TeacherRiskStudent {
    id: string;
    name: string;
    examNumber: string;
    className: string;
    attendance: number;
    catScore: number;
    fails: number;
    prevDrop: number;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface TeacherSubjectDifficulty {
    rank: number;
    name: string;
    avgScore: number;
    passRate: number;
    correlation: number;
    action: string;
}

export interface TeacherExamGap {
    className: string;
    avgCAT: number;
    avgExam: number;
    gap: number;
    studentsDrop: number;
}

export interface TeacherCohortTracking {
    cohort: string;
    data: number[];
    labels: string[];
    improving: number;
    declining: number;
    currentRate: number;
}

export interface TeacherStudentTimeline {
    term: string;
    marks: number;
    attendance: number;
}

export interface TeacherStudentFactorBreakdown {
    factor: string;
    studentValue: string;
    classAvg: string;
    status: string;
    impact: string;
}

export interface TeacherStudentSubjectBreakdown {
    subject: string;
    marks: number;
    attendance: number;
    classAvg: number;
    gap: number;
    status: string;
}

export interface TeacherStudentHistorical {
    term: string;
    attendance: number;
    marks: number;
    cat: number;
    exam: number;
    fails: number;
    score: number;
    status: string;
}

export interface TeacherStudentDetail {
    id: string;
    name: string;
    examNumber: string;        // ← REPLACES rollNo
    className: string;
    // batch removed
    status: string;
    classTeacher: string;
    currentMarks: number;
    currentAttendance: number;
    termOverTerm: number;
    classRank: string;
    timeline: TeacherStudentTimeline[];
    factorBreakdown: TeacherStudentFactorBreakdown[];
    subjectBreakdown: TeacherStudentSubjectBreakdown[];
    historical: TeacherStudentHistorical[];
    recommendations: string[];
}

export interface TeacherCompareDepartment {
    name: string;
    passRate1: number;
    passRate2: number;
    change: number;
    status: string;
}

export interface TeacherCompareRiskStudent {
    name: string;
    className: string;
    att1: number;
    att2: number;
    marks1: number;
    marks2: number;
    drop: number;
}

export interface TeacherCompareData {
    term1: string;
    term2: string;
    overallPass1: number;
    overallPass2: number;
    avgScore1: number;
    avgScore2: number;
    avgAttendance1: number;
    avgAttendance2: number;
    classes: TeacherCompareDepartment[];
    newRiskStudents: TeacherCompareRiskStudent[];
}




export type TeacherViewType = 'main' | 'class' | 'student' | 'compare';