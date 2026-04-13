// components/admin/analytics/AnalyticsManagement.tsx
import React, { useState, useEffect } from 'react';
import AnalyticsMain from './AnalyticsMain';
import StudentDrillDown from './StudentDrillDown';
import CompareTerms from './CompareTerms';
import GradeDrillDown from './GradeDrillDown';
import {
    KeyMetric,
    GradeRanking,
    FactorAnalysis,
    RiskStudent,
    SubjectDifficulty,
    ExamGap,
    CohortTracking,
    StudentDetail,
    CompareData,
    ViewType,
    ExamAnalysis,
    SecondarySelection,
    UniversitySelection
} from './types';
import ExamAnalysisTab from './ExamAnalysisTab';
import { API_BASE_URL } from '@/services/attendanceService';

interface AnalyticsManagementProps {
    classes: any[];
    students: any[];
    subjects: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const AnalyticsManagement: React.FC<AnalyticsManagementProps> = ({
    classes,
    students,
    subjects,
    showMessage
}) => {
    // View State
    const [currentView, setCurrentView] = useState<'main' | 'student' | 'compare' | 'grade' | 'exam'>('main');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

    // Filter State
    const [selectedTerm, setSelectedTerm] = useState<string>('Term 4, 2025 (Current)');
    const [compareTerm1, setCompareTerm1] = useState<string>('Term 4, 2025');
    const [compareTerm2, setCompareTerm2] = useState<string>('Term 3, 2025');
    const [compareData, setCompareData] = useState<CompareData | null>(null);

    // Loading States
    const [loadingMain, setLoadingMain] = useState(false);
    const [loadingStudent, setLoadingStudent] = useState(false);
    const [loadingCompare, setLoadingCompare] = useState(false);

    // Data States
    const [keyMetrics, setKeyMetrics] = useState<KeyMetric[]>([]);
    const [gradeRanking, setGradeRanking] = useState<GradeRanking[]>([]);
    const [factorAnalysis, setFactorAnalysis] = useState<FactorAnalysis[]>([]);
    const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
    const [subjectDifficulty, setSubjectDifficulty] = useState<SubjectDifficulty[]>([]);
    const [examGap, setExamGap] = useState<ExamGap[]>([]);
    const [cohortTracking, setCohortTracking] = useState<CohortTracking | null>(null);

    // Add with other state declarations
    const [examType, setExamType] = useState<'PSLCE' | 'JCE' | 'MSCE'>('MSCE');
    const [examData, setExamData] = useState<ExamAnalysis | null>(null);
    const [secondarySelections, setSecondarySelections] = useState<SecondarySelection[]>([]);
    const [universitySelections, setUniversitySelections] = useState<UniversitySelection[]>([]);
    const [loadingExam, setLoadingExam] = useState(false);

    // Load Main Dashboard Data
    useEffect(() => {
        if (currentView === 'main') {
            loadMainDashboardData();
        }
    }, [selectedTerm, currentView]);

    const loadMainDashboardData = async () => {
        setLoadingMain(true);
        setTimeout(() => {
            setKeyMetrics([
                { label: 'Overall Pass %', value: '78%', change: -3, vsText: 'vs T3', icon: 'trending-up', color: 'text-indigo-600' },
                { label: 'Average Score', value: '78%', change: -2, vsText: 'vs T3', icon: 'graduation-cap', color: 'text-emerald-600' },
                { label: 'Total Students', value: '2,450', change: 45, vsText: 'vs T3', icon: 'users', color: 'text-purple-600' },
                { label: 'Att-Perf Correlation', value: 'r = 0.73', change: 0, vsText: 'Strong Positive', icon: 'brain', color: 'text-amber-600' }
            ]);

            setGradeRanking([
                { rank: 1, name: 'Grade 7A', passRate: 89, avgScore: 84, attendance: 86, riskStudents: 12, riskChange: -4, trend: 5 },
                { rank: 2, name: 'Grade 8B', passRate: 76, avgScore: 76, attendance: 78, riskStudents: 28, riskChange: 3, trend: -2 },
                { rank: 3, name: 'Grade 6A', passRate: 68, avgScore: 69, attendance: 71, riskStudents: 42, riskChange: 8, trend: -5 },
                { rank: 4, name: 'Grade 7B', passRate: 65, avgScore: 65, attendance: 69, riskStudents: 38, riskChange: 2, trend: -1 },
                { rank: 5, name: 'Grade 8A', passRate: 72, avgScore: 73, attendance: 74, riskStudents: 25, riskChange: -1, trend: 1 }
            ]);

            setFactorAnalysis([
                { factor: 'Attendance', correlation: 0.73, impact: 'Strong +', insight: 'Key driver for all grades' },
                { factor: 'Previous Term Marks', correlation: 0.81, impact: 'Very Strong +', insight: 'Best predictor of success' },
                { factor: 'CAT/Continuous Asst', correlation: 0.76, impact: 'Strong +', insight: 'CATs strongly predict exams' },
                { factor: 'Subject Difficulty', correlation: -0.45, impact: 'Moderate -', insight: 'Mathematics & Science hardest' },
                { factor: 'Failed Subjects', correlation: -0.52, impact: 'Strong -', insight: 'Each fail = -12% avg score' },
                { factor: 'Homework Submission', correlation: 0.38, impact: 'Moderate +', insight: 'Regular homework = success' }
            ]);

            const allStudentsList = students.map((s, idx) => ({
                id: s.id || String(idx + 1),
                name: s.name,
                examNumber: s.examNumber || `STU${String(idx + 1).padStart(4, '0')}`,
                grade: s.class?.name || 'Grade 7A',
                attendance: 55 + Math.random() * 35,
                catScore: 40 + Math.random() * 50,
                fails: Math.floor(Math.random() * 3),
                prevDrop: -Math.floor(Math.random() * 25),
                riskLevel: (Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'high' : 'medium') as 'critical' | 'high' | 'medium' | 'low'
            }));

            setRiskStudents(allStudentsList.filter(s => s.attendance < 65 || s.catScore < 50).slice(0, 5) as RiskStudent[]);

            setSubjectDifficulty([
                { rank: 1, name: 'Mathematics', avgScore: 58, passRate: 42, correlation: 0.82, action: '⚠️ High attention' },
                { rank: 2, name: 'Science', avgScore: 62, passRate: 55, correlation: 0.75, action: '⚠️ Moderate' },
                { rank: 3, name: 'English', avgScore: 65, passRate: 60, correlation: 0.68, action: 'Review teaching' },
                { rank: 8, name: 'Creative Arts', avgScore: 82, passRate: 94, correlation: 0.32, action: '✅ Low intervention' }
            ]);

            setExamGap([
                { grade: 'Grade 7A', avgCAT: 68, avgExam: 58, gap: 10, studentsDrop: 12 },
                { grade: 'Grade 8B', avgCAT: 65, avgExam: 59, gap: 6, studentsDrop: 8 },
                { grade: 'Grade 6A', avgCAT: 70, avgExam: 66, gap: 4, studentsDrop: 5 }
            ]);

            setCohortTracking({
                cohort: 'Grade 7 Cohort (245 students)',
                data: [72, 74, 78, 76, 75, 78],
                labels: ['T1, 2024/25', 'T2, 2024/25', 'T3, 2024/25', 'T1, 2025/2026', 'T2, 2025/26', 'Current'],
                improving: 45,
                declining: 28,
                currentRate: 78
            });

            setLoadingMain(false);
        }, 800);
    };

    const loadStudentDetail = async (studentId: string) => {
        setLoadingStudent(true);
        const foundStudent = students.find(s => s.id === studentId);

        setTimeout(() => {
            const studentDetail: StudentDetail = {
                id: studentId,
                name: foundStudent?.name || 'Student Name',
                grade: foundStudent?.class?.name || 'Grade 7A',
                batch: '2024',
                rollNo: foundStudent?.examNumber || 'STU001',
                status: 'Needs Monitoring',
                classTeacher: 'Class Teacher',
                currentMarks: 65,
                currentAttendance: 70,
                termOverTerm: -5,
                classRank: '50/150',
                timeline: [
                    { term: 'T1', marks: 70, attendance: 75 },
                    { term: 'T2', marks: 68, attendance: 72 },
                    { term: 'T3', marks: 65, attendance: 70 },
                    { term: 'T4', marks: 62, attendance: 68 }
                ],
                factorBreakdown: [],
                subjectBreakdown: [],
                historical: [],
                recommendations: ['Regular monitoring recommended']
            };
            setSelectedStudent(studentDetail);
            setLoadingStudent(false);
        }, 500);
    };

    const loadCompareData = async () => {
        setLoadingCompare(true);
        setTimeout(() => {
            setCompareData({
                term1: compareTerm1,
                term2: compareTerm2,
                overallPass1: 78,
                overallPass2: 81,
                avgScore1: 74,
                avgScore2: 76,
                avgAttendance1: 74,
                avgAttendance2: 76,
                departments: [],
                newRiskStudents: []
            });
            setLoadingCompare(false);
        }, 600);
    };

    const handleViewStudent = (studentId: string) => {
        loadStudentDetail(studentId);
        setCurrentView('student');
    };

    const handleViewGrade = (gradeName: string) => {
        setSelectedGrade(gradeName);
        setCurrentView('grade');
    };


    const loadExamData = async () => {
        setLoadingExam(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/analytics/exam/${examType}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setExamData(data.examData);
                setSecondarySelections(data.secondarySelections || []);
                setUniversitySelections(data.universitySelections || []);
            }
        } catch (error) {
            console.error('Failed to load exam data:', error);
        } finally {
            setLoadingExam(false);
        }
    };

    useEffect(() => {
        if (currentView === 'exam') {
            loadExamData();
        }
    }, [examType, currentView]);

    const handleCompareMode = () => setCurrentView('compare');
    const handleCompare = () => loadCompareData();
    const handleExportReport = () => showMessage('Export started');

    if (currentView === 'main') {
        return (
            <AnalyticsMain
                loading={loadingMain}
                selectedTerm={selectedTerm}
                setSelectedTerm={setSelectedTerm}
                keyMetrics={keyMetrics}
                gradeRanking={gradeRanking}
                factorAnalysis={factorAnalysis}
                riskStudents={riskStudents}
                subjectDifficulty={subjectDifficulty}
                examGap={examGap}
                cohortTracking={cohortTracking}
                onViewStudent={handleViewStudent}
                onViewGrade={handleViewGrade}
                onCompareMode={handleCompareMode}
                onExportReport={handleExportReport}
                onViewExamAnalysis={() => setCurrentView('exam')}
            />
        );
    }

    if (currentView === 'grade' && selectedGrade) {
        return (
            <GradeDrillDown
                gradeName={selectedGrade}
                students={students}
                onViewStudent={handleViewStudent}
                onBack={() => setCurrentView('main')}
            />
        );
    }

    if (currentView === 'student' && selectedStudent) {
        return (
            <StudentDrillDown
                student={selectedStudent}
                loading={loadingStudent}
                onBack={() => setCurrentView('main')}
                onExportPDF={() => { }}
                onEmailReport={() => { }}
            />
        );
    }

    if (currentView === 'compare') {
        return (
            <CompareTerms
                loading={loadingCompare}
                term1={compareTerm1}
                term2={compareTerm2}
                setTerm1={setCompareTerm1}
                setTerm2={setCompareTerm2}
                compareData={compareData}
                onCompare={handleCompare}
                onBack={() => setCurrentView('main')}
                onExportReport={handleExportReport}
            />
        );
    }

    if (currentView === 'exam') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setExamType('PSLCE')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'PSLCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            PSLCE (Std 8)
                        </button>
                        <button
                            onClick={() => setExamType('JCE')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'JCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            JCE (Form 2)
                        </button>
                        <button
                            onClick={() => setExamType('MSCE')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'MSCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            MSCE (Form 4)
                        </button>
                    </div>
                    <button onClick={() => setCurrentView('main')} className="text-slate-500 hover:text-slate-700">
                        ← Back to Dashboard
                    </button>
                </div>

                <ExamAnalysisTab
                    examType={examType}
                    examData={examData}
                    secondarySelections={secondarySelections}
                    universitySelections={universitySelections}
                    loading={loadingExam}
                    onExport={() => showMessage('Export started')}
                    onViewStudent={handleViewStudent}
                />
            </div>
        );
    }

    return null;
};

export default AnalyticsManagement;

// // components/admin/analytics/index.tsx
// import React, { useState, useEffect } from 'react';
// import AnalyticsMain from './AnalyticsMain';
// import StudentDrillDown from './StudentDrillDown';
// import CompareTerms from './CompareTerms';
// import {
//     KeyMetric,
//     GradeRanking,
//     FactorAnalysis,
//     RiskStudent,
//     SubjectDifficulty,
//     ExamGap,
//     CohortTracking,
//     StudentDetail,
//     CompareData,
//     ViewType
// } from './types';

// interface AnalyticsManagementProps {
//     classes: any[];
//     students: any[];
//     subjects: any[];
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const AnalyticsManagement: React.FC<AnalyticsManagementProps> = ({
//     classes,
//     students,
//     subjects,
//     showMessage
// }) => {
//     // View State
//     const [currentView, setCurrentView] = useState<ViewType>('main');
//     const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
//     const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);

//     // Filter State
//     const [selectedTerm, setSelectedTerm] = useState<string>('Term 4, 2025 (Current)');
//     const [compareTerm1, setCompareTerm1] = useState<string>('Term 4, 2025');
//     const [compareTerm2, setCompareTerm2] = useState<string>('Term 3, 2025');
//     const [compareData, setCompareData] = useState<CompareData | null>(null);

//     // Loading States
//     const [loadingMain, setLoadingMain] = useState(false);
//     const [loadingStudent, setLoadingStudent] = useState(false);
//     const [loadingCompare, setLoadingCompare] = useState(false);

//     // Data States
//     const [keyMetrics, setKeyMetrics] = useState<KeyMetric[]>([]);
//     const [gradeRanking, setGradeRanking] = useState<GradeRanking[]>([]);
//     const [factorAnalysis, setFactorAnalysis] = useState<FactorAnalysis[]>([]);
//     const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
//     const [subjectDifficulty, setSubjectDifficulty] = useState<SubjectDifficulty[]>([]);
//     const [examGap, setExamGap] = useState<ExamGap[]>([]);
//     const [cohortTracking, setCohortTracking] = useState<CohortTracking | null>(null);

//     // Load Main Dashboard Data
//     useEffect(() => {
//         if (currentView === 'main') {
//             loadMainDashboardData();
//         }
//     }, [selectedTerm, currentView]);

//     const loadMainDashboardData = async () => {
//         setLoadingMain(true);
//         // Simulate API call - Replace with actual API
//         setTimeout(() => {
//             // Key Metrics
//             setKeyMetrics([
//                 { label: 'Overall Pass %', value: '78%', change: -3, vsText: 'vs T3', icon: 'trending-up', color: 'text-indigo-600' },
//                 { label: 'Average Score', value: '78%', change: -2, vsText: 'vs T3', icon: 'graduation-cap', color: 'text-emerald-600' },
//                 { label: 'Total Students', value: '2,450', change: 45, vsText: 'vs T3', icon: 'users', color: 'text-purple-600' },
//                 { label: 'Att-Perf Correlation', value: 'r = 0.73', change: 0, vsText: 'Strong Positive', icon: 'brain', color: 'text-amber-600' }
//             ]);

//             // Grade Ranking
//             setGradeRanking([
//                 { rank: 1, name: 'Grade 7A', passRate: 89, avgScore: 84, attendance: 86, riskStudents: 12, riskChange: -4, trend: 5 },
//                 { rank: 2, name: 'Grade 8B', passRate: 76, avgScore: 76, attendance: 78, riskStudents: 28, riskChange: 3, trend: -2 },
//                 { rank: 3, name: 'Grade 6A', passRate: 68, avgScore: 69, attendance: 71, riskStudents: 42, riskChange: 8, trend: -5 },
//                 { rank: 4, name: 'Grade 7B', passRate: 65, avgScore: 65, attendance: 69, riskStudents: 38, riskChange: 2, trend: -1 },
//                 { rank: 5, name: 'Grade 8A', passRate: 72, avgScore: 73, attendance: 74, riskStudents: 25, riskChange: -1, trend: 1 }
//             ]);

//             // Factor Analysis
//             setFactorAnalysis([
//                 { factor: 'Attendance', correlation: 0.73, impact: 'Strong +', insight: 'Key driver for all grades' },
//                 { factor: 'Previous Term Marks', correlation: 0.81, impact: 'Very Strong +', insight: 'Best predictor of success' },
//                 { factor: 'CAT/Continuous Asst', correlation: 0.76, impact: 'Strong +', insight: 'CATs strongly predict exams' },
//                 { factor: 'Subject Difficulty', correlation: -0.45, impact: 'Moderate -', insight: 'Mathematics & Science hardest' },
//                 { factor: 'Failed Subjects', correlation: -0.52, impact: 'Strong -', insight: 'Each fail = -12% avg score' },
//                 { factor: 'Homework Submission', correlation: 0.38, impact: 'Moderate +', insight: 'Regular homework = success' }
//             ]);

//             // Risk Students
//             setRiskStudents([
//                 { id: '1', name: 'Rahul Sharma', examNumber: 'CV24042', grade: 'Grade 7A', attendance: 48, catScore: 38, fails: 2, prevDrop: -22, riskLevel: 'critical' },
//                 { id: '2', name: 'Priya Verma', examNumber: 'EL24015', grade: 'Grade 8B', attendance: 52, catScore: 41, fails: 1, prevDrop: -8, riskLevel: 'high' },
//                 { id: '3', name: 'Amit Kumar', examNumber: 'ME24008', grade: 'Grade 6A', attendance: 68, catScore: 35, fails: 1, prevDrop: -5, riskLevel: 'medium' },
//                 { id: '4', name: 'Neha Singh', examNumber: 'CV24089', grade: 'Grade 7A', attendance: 45, catScore: 32, fails: 3, prevDrop: -15, riskLevel: 'critical' },
//                 { id: '5', name: 'Suresh Reddy', examNumber: 'EC24023', grade: 'Grade 8A', attendance: 58, catScore: 44, fails: 0, prevDrop: -12, riskLevel: 'high' }
//             ]);

//             // Subject Difficulty
//             setSubjectDifficulty([
//                 { rank: 1, name: 'Mathematics', avgScore: 58, passRate: 42, correlation: 0.82, action: '⚠️ High attention' },
//                 { rank: 2, name: 'Science', avgScore: 62, passRate: 55, correlation: 0.75, action: '⚠️ Moderate' },
//                 { rank: 3, name: 'English', avgScore: 65, passRate: 60, correlation: 0.68, action: 'Review teaching' },
//                 { rank: 8, name: 'Creative Arts', avgScore: 82, passRate: 94, correlation: 0.32, action: '✅ Low intervention' }
//             ]);

//             // Exam Gap
//             setExamGap([
//                 { grade: 'Grade 7A', avgCAT: 68, avgExam: 58, gap: 10, studentsDrop: 12 },
//                 { grade: 'Grade 8B', avgCAT: 65, avgExam: 59, gap: 6, studentsDrop: 8 },
//                 { grade: 'Grade 6A', avgCAT: 70, avgExam: 66, gap: 4, studentsDrop: 5 }
//             ]);

//             // Cohort Tracking
//             setCohortTracking({
//                 cohort: 'Grade 7 Cohort (245 students)',
//                 data: [72, 74, 78, 76, 75, 78],
//                 labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'Current'],
//                 improving: 45,
//                 declining: 28,
//                 currentRate: 78
//             });

//             setLoadingMain(false);
//         }, 800);
//     };

//     const loadStudentDetail = async (studentId: string) => {
//         setLoadingStudent(true);
//         setSelectedStudentId(studentId);

//         // Simulate API call - Replace with actual API
//         setTimeout(() => {
//             const studentDetail: StudentDetail = {
//                 id: studentId,
//                 name: studentId === '1' ? 'Rahul Sharma' :
//                     studentId === '2' ? 'Priya Verma' :
//                         studentId === '3' ? 'Amit Kumar' : 'Neha Singh',
//                 grade: 'Grade 7A',
//                 batch: '2024',
//                 rollNo: 'CV24042',
//                 status: 'At-Risk (Critical)',
//                 classTeacher: 'Prof. Mehta',
//                 currentMarks: 35,
//                 currentAttendance: 48,
//                 termOverTerm: -17,
//                 classRank: '142/150',
//                 timeline: [
//                     { term: 'T1', marks: 55, attendance: 58 },
//                     { term: 'T2', marks: 58, attendance: 61 },
//                     { term: 'T3', marks: 52, attendance: 55 },
//                     { term: 'T4', marks: 35, attendance: 48 }
//                 ],
//                 factorBreakdown: [
//                     { factor: 'Attendance', studentValue: '48%', classAvg: '71%', status: '🔴 Critical', impact: 'Major -' },
//                     { factor: 'CAT/Continuous Asst', studentValue: '42%', classAvg: '65%', status: '🔴 Critical', impact: 'Major -' },
//                     { factor: 'Failed Subjects', studentValue: '2', classAvg: '0.4', status: '🔴 Critical', impact: 'Major -' },
//                     { factor: 'Previous Term Drop', studentValue: '52%→35%', classAvg: '72%→68%', status: '🔴 Critical', impact: 'Major -' },
//                     { factor: 'Homework Submission', studentValue: '40%', classAvg: '78%', status: '🟠 High', impact: 'Moderate -' }
//                 ],
//                 subjectBreakdown: [
//                     { subject: 'Mathematics', marks: 28, attendance: 42, classAvg: 58, gap: -30, status: '🔴 Critical intervention' },
//                     { subject: 'Science', marks: 31, attendance: 45, classAvg: 62, gap: -31, status: '🔴 Critical intervention' },
//                     { subject: 'English', marks: 45, attendance: 55, classAvg: 65, gap: -20, status: '🟠 Needs support' },
//                     { subject: 'Creative Arts', marks: 52, attendance: 50, classAvg: 78, gap: -26, status: '🟠 Needs support' }
//                 ],
//                 historical: [
//                     { term: 'Term 4', attendance: 48, marks: 35, cat: 42, exam: 35, fails: 2, score: 4.2, status: 'Failing' },
//                     { term: 'Term 3', attendance: 55, marks: 52, cat: 58, exam: 52, fails: 1, score: 5.8, status: 'Pass' },
//                     { term: 'Term 2', attendance: 61, marks: 58, cat: 62, exam: 58, fails: 0, score: 6.2, status: 'Pass' },
//                     { term: 'Term 1', attendance: 58, marks: 55, cat: 60, exam: 55, fails: 0, score: 6.0, status: 'Pass' }
//                 ],
//                 recommendations: [
//                     'Mandatory attendance counseling – target 60% minimum',
//                     'Mathematics tutoring – 28% marks, 42% attendance correlation strong',
//                     'Failed subjects clearance plan – 2 failed subjects (Mathematics & Science)',
//                     'CAT/Continuous assessment improvement – current 42% vs class avg 65%',
//                     'Parent meeting scheduled for [Set Date]'
//                 ]
//             };
//             setSelectedStudent(studentDetail);
//             setLoadingStudent(false);
//         }, 500);
//     };

//     const loadCompareData = async () => {
//         setLoadingCompare(true);
//         // Simulate API call - Replace with actual API
//         setTimeout(() => {
//             setCompareData({
//                 term1: compareTerm1,
//                 term2: compareTerm2,
//                 overallPass1: 78,
//                 overallPass2: 81,
//                 avgScore1: 74,
//                 avgScore2: 76,
//                 avgAttendance1: 74,
//                 avgAttendance2: 76,
//                 departments: [
//                     { name: 'Grade 7A', passRate1: 89, passRate2: 91, change: -2, status: 'Slight decline' },
//                     { name: 'Grade 8B', passRate1: 76, passRate2: 78, change: -2, status: 'Slight decline' },
//                     { name: 'Grade 6A', passRate1: 68, passRate2: 73, change: -5, status: 'Significant decline - Review' },
//                     { name: 'Grade 7B', passRate1: 65, passRate2: 66, change: -1, status: 'Stable' },
//                     { name: 'Grade 8A', passRate1: 72, passRate2: 71, change: 1, status: 'Slight improvement' }
//                 ],
//                 newRiskStudents: [
//                     { name: 'Vikram Joshi', grade: 'Grade 6A', att1: 58, att2: 45, marks1: 68, marks2: 42, drop: -26 },
//                     { name: 'Anita Desai', grade: 'Grade 8B', att1: 52, att2: 38, marks1: 61, marks2: 38, drop: -23 },
//                     { name: 'Rajesh Nair', grade: 'Grade 7A', att1: 61, att2: 45, marks1: 59, marks2: 45, drop: -14 }
//                 ]
//             });
//             setLoadingCompare(false);
//         }, 600);
//     };

//     const handleViewStudent = (studentId: string) => {
//         loadStudentDetail(studentId);
//         setCurrentView('student');
//     };

//     const handleCompareMode = () => {
//         setCurrentView('compare');
//     };

//     const handleCompare = () => {
//         loadCompareData();
//     };

//     const handleExportReport = () => {
//         showMessage('Report export started. Download will begin shortly.');
//         // Implement actual export logic
//     };

//     const handleExportStudentPDF = () => {
//         showMessage('Student report is being generated. Download will begin shortly.');
//         // Implement actual PDF export
//     };

//     const handleEmailStudentReport = () => {
//         showMessage('Student report has been sent to the class teacher\'s email.');
//         // Implement actual email logic
//     };

//     // Render based on current view
//     if (currentView === 'main') {
//         return (
//             <AnalyticsMain
//                 loading={loadingMain}
//                 selectedTerm={selectedTerm}
//                 setSelectedTerm={setSelectedTerm}
//                 keyMetrics={keyMetrics}
//                 gradeRanking={gradeRanking}
//                 factorAnalysis={factorAnalysis}
//                 riskStudents={riskStudents}
//                 subjectDifficulty={subjectDifficulty}
//                 examGap={examGap}
//                 cohortTracking={cohortTracking}
//                 onViewStudent={handleViewStudent}
//                 onCompareMode={handleCompareMode}
//                 onExportReport={handleExportReport}
//             />
//         );
//     }

//     if (currentView === 'student' && selectedStudent) {
//         return (
//             <StudentDrillDown
//                 student={selectedStudent}
//                 loading={loadingStudent}
//                 onBack={() => setCurrentView('main')}
//                 onExportPDF={handleExportStudentPDF}
//                 onEmailReport={handleEmailStudentReport}
//             />
//         );
//     }

//     if (currentView === 'compare') {
//         return (
//             <CompareTerms
//                 loading={loadingCompare}
//                 term1={compareTerm1}
//                 term2={compareTerm2}
//                 setTerm1={setCompareTerm1}
//                 setTerm2={setCompareTerm2}
//                 compareData={compareData}
//                 onCompare={handleCompare}
//                 onBack={() => setCurrentView('main')}
//                 onExportReport={handleExportReport}
//             />
//         );
//     }

//     return null;
// };

// export default AnalyticsManagement;