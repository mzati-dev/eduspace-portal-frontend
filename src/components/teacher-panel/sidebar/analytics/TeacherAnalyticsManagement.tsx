// components/teacher/analytics/TeacherAnalyticsManagement.tsx
import React, { useState, useEffect } from 'react';
import TeacherAnalyticsMain from './TeacherAnalyticsMain';
import TeacherGradeDrillDown from './TeacherGradeDrillDown';
// import TeacherStudentDrillDown from './TeacherStudentDrillDown';
// import TeacherCompareTerms from './TeacherCompareTerms';
import {
    TeacherKeyMetric,
    TeacherClassRanking,
    TeacherFactorAnalysis,
    TeacherRiskStudent,
    TeacherSubjectDifficulty,
    TeacherExamGap,
    TeacherCohortTracking,
    TeacherStudentDetail,
    TeacherCompareData,
    TeacherViewType
} from './TeacherAnalyticsTypes';
import TeacherStudentDrillDown from './TeacherStudentDrillDown';
import TeacherCompareTerms from './TeacherCompareTerms';

interface TeacherAnalyticsManagementProps {
    teacherId: string;
    teacherName: string;
    classes: any[];
    students: any[];
    subjects: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherAnalyticsManagement: React.FC<TeacherAnalyticsManagementProps> = ({
    teacherId,
    teacherName,
    classes,
    students,
    subjects,
    showMessage
}) => {
    // View State
    const [currentView, setCurrentView] = useState<TeacherViewType>('main');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<TeacherStudentDetail | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    // Filter State
    const [selectedTerm, setSelectedTerm] = useState<string>('Term 4, 2025 (Current)');
    const [compareTerm1, setCompareTerm1] = useState<string>('Term 4, 2025');
    const [compareTerm2, setCompareTerm2] = useState<string>('Term 3, 2025');
    const [compareData, setCompareData] = useState<TeacherCompareData | null>(null);

    // Loading States
    const [loadingMain, setLoadingMain] = useState(false);
    const [loadingStudent, setLoadingStudent] = useState(false);
    const [loadingCompare, setLoadingCompare] = useState(false);

    // Data States
    const [keyMetrics, setKeyMetrics] = useState<TeacherKeyMetric[]>([]);
    const [classRanking, setClassRanking] = useState<TeacherClassRanking[]>([]);
    const [factorAnalysis, setFactorAnalysis] = useState<TeacherFactorAnalysis[]>([]);
    const [riskStudents, setRiskStudents] = useState<TeacherRiskStudent[]>([]);
    const [subjectDifficulty, setSubjectDifficulty] = useState<TeacherSubjectDifficulty[]>([]);
    const [examGap, setExamGap] = useState<TeacherExamGap[]>([]);
    const [cohortTracking, setCohortTracking] = useState<TeacherCohortTracking | null>(null);

    // Get teacher's assigned classes only
    const teacherClasses = classes.filter(c =>
        c.teacherId === teacherId ||
        c.teacherName === teacherName ||
        c.classTeacherId === teacherId
    );

    // Get students in teacher's classes only
    const teacherClassIds = teacherClasses.map(c => c.id);
    const teacherStudents = students.filter(s => teacherClassIds.includes(s.classId));

    // Get subjects teacher teaches
    const teacherSubjects = subjects.filter(s =>
        s.teacherId === teacherId ||
        s.teacherName === teacherName
    );

    // Load Main Dashboard Data
    useEffect(() => {
        if (currentView === 'main') {
            loadMainDashboardData();
        }
    }, [selectedTerm, currentView]);

    const loadMainDashboardData = async () => {
        setLoadingMain(true);
        // Simulate API call - Replace with actual API
        setTimeout(() => {
            // Key Metrics (4 cards)
            setKeyMetrics([
                { label: 'Overall Pass %', value: '78%', change: -3, vsText: 'vs T3', icon: 'trending-up', color: 'text-indigo-600' },
                { label: 'Average Score', value: '78%', change: -2, vsText: 'vs T3', icon: 'graduation-cap', color: 'text-emerald-600' },
                { label: 'Total Students', value: teacherStudents.length.toString(), change: 45, vsText: 'vs T3', icon: 'users', color: 'text-purple-600' },
                { label: 'Att-Perf Correlation', value: 'r = 0.73', change: 0, vsText: 'Strong Positive', icon: 'brain', color: 'text-amber-600' }
            ]);

            // Class Ranking (only teacher's classes)
            const classPerf: TeacherClassRanking[] = teacherClasses.map((cls, idx) => ({
                rank: idx + 1,
                name: cls.name,
                passRate: 65 + Math.random() * 25,
                avgScore: 60 + Math.random() * 25,
                attendance: 55 + Math.random() * 35,
                riskStudents: Math.floor(Math.random() * 15),
                riskChange: Math.floor(Math.random() * 10) - 5,
                trend: Math.floor(Math.random() * 15) - 5
            })).sort((a, b) => b.passRate - a.passRate).map((c, i) => ({ ...c, rank: i + 1 }));
            setClassRanking(classPerf);

            // Factor Analysis (includes attendance as a factor)
            setFactorAnalysis([
                { factor: 'Attendance', correlation: 0.73, impact: 'Strong +', insight: 'Key driver for all classes' },
                { factor: 'Previous Term Marks', correlation: 0.81, impact: 'Very Strong +', insight: 'Best predictor of success' },
                { factor: 'CAT/Continuous Asst', correlation: 0.76, impact: 'Strong +', insight: 'CATs strongly predict exams' },
                { factor: 'Subject Difficulty', correlation: -0.45, impact: 'Moderate -', insight: 'Mathematics & Science hardest' },
                { factor: 'Failed Subjects', correlation: -0.52, impact: 'Strong -', insight: 'Each fail = -12% avg score' },
                { factor: 'Homework Submission', correlation: 0.38, impact: 'Moderate +', insight: 'Regular homework = success' }
            ]);

            // Risk Students (only from teacher's classes)
            const atRiskStudents: TeacherRiskStudent[] = teacherStudents
                .filter(s => Math.random() > 0.7)
                .slice(0, 8)
                .map((s, idx) => ({
                    id: s.id || String(idx + 1),
                    name: s.name,
                    examNumber: s.examNumber || `STU${String(idx + 1).padStart(4, '0')}`,
                    className: s.className || teacherClasses[0]?.name || 'Class',
                    attendance: 40 + Math.random() * 30,
                    catScore: 35 + Math.random() * 30,
                    fails: Math.floor(Math.random() * 3),
                    prevDrop: -Math.floor(Math.random() * 25),
                    riskLevel: Math.random() > 0.6 ? 'critical' : Math.random() > 0.3 ? 'high' : 'medium'
                }));
            setRiskStudents(atRiskStudents);

            // Subject Difficulty (subjects teacher teaches)
            const subjectPerf: TeacherSubjectDifficulty[] = teacherSubjects.slice(0, 5).map((sub, idx) => ({
                rank: idx + 1,
                name: sub.name,
                avgScore: 55 + Math.random() * 30,
                passRate: 50 + Math.random() * 35,
                correlation: 0.5 + Math.random() * 0.3,
                action: Math.random() > 0.7 ? '⚠️ High attention' : 'Review teaching'
            }));
            setSubjectDifficulty(subjectPerf);

            // Exam Gap (teacher's classes only)
            const examGapData: TeacherExamGap[] = teacherClasses.slice(0, 3).map(cls => ({
                className: cls.name,
                avgCAT: 60 + Math.random() * 15,
                avgExam: 55 + Math.random() * 15,
                gap: 3 + Math.random() * 10,
                studentsDrop: Math.floor(Math.random() * 15)
            }));
            setExamGap(examGapData);

            // Cohort Tracking (teacher's cohort)
            if (teacherClasses.length > 0) {
                setCohortTracking({
                    cohort: `${teacherClasses[0]?.name || 'Class'} Cohort`,
                    data: [72, 74, 78, 76, 75, 78],
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'Current'],
                    improving: 45,
                    declining: 28,
                    currentRate: 78
                });
            }

            setLoadingMain(false);
        }, 800);
    };

    const loadStudentDetail = async (studentId: string) => {
        setLoadingStudent(true);
        const foundStudent = teacherStudents.find(s => s.id === studentId);

        setTimeout(() => {
            const studentDetail: TeacherStudentDetail = {
                id: studentId,
                name: foundStudent?.name || 'Student Name',
                className: foundStudent?.className || teacherClasses[0]?.name || 'Class',
                batch: '2024',
                rollNo: foundStudent?.examNumber || 'STU001',
                status: 'Needs Monitoring',
                classTeacher: teacherName,
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
                factorBreakdown: [
                    { factor: 'Attendance', studentValue: '68%', classAvg: '75%', status: '🟡 Medium', impact: 'Moderate -' },
                    { factor: 'CAT Score', studentValue: '62%', classAvg: '70%', status: '🟡 Medium', impact: 'Moderate -' },
                    { factor: 'Homework Submission', studentValue: '55%', classAvg: '80%', status: '🟠 High', impact: 'Moderate -' }
                ],
                subjectBreakdown: [
                    { subject: 'Mathematics', marks: 58, attendance: 65, classAvg: 72, gap: -14, status: '🟠 Needs support' },
                    { subject: 'English', marks: 68, attendance: 70, classAvg: 75, gap: -7, status: '🟢 On track' },
                    { subject: 'Science', marks: 55, attendance: 60, classAvg: 68, gap: -13, status: '🟠 Needs support' }
                ],
                historical: [
                    { term: 'Term 4', attendance: 68, marks: 62, cat: 60, exam: 58, fails: 1, score: 6.2, status: 'Pass' },
                    { term: 'Term 3', attendance: 70, marks: 65, cat: 64, exam: 62, fails: 0, score: 6.5, status: 'Pass' }
                ],
                recommendations: [
                    'Improve homework submission rate',
                    'Attend extra Math tutoring sessions',
                    'Regular parent-teacher communication'
                ]
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
                classes: teacherClasses.slice(0, 3).map(cls => ({
                    name: cls.name,
                    passRate1: 70 + Math.random() * 20,
                    passRate2: 65 + Math.random() * 20,
                    change: Math.floor(Math.random() * 10) - 5,
                    status: Math.random() > 0.5 ? 'Improved' : 'Declined'
                })),
                newRiskStudents: []
            });
            setLoadingCompare(false);
        }, 600);
    };

    const handleViewStudent = (studentId: string) => {
        loadStudentDetail(studentId);
        setCurrentView('student');
    };

    const handleViewClass = (className: string) => {
        setSelectedClass(className);
        setCurrentView('class');
    };

    const handleCompareMode = () => setCurrentView('compare');
    const handleCompare = () => loadCompareData();
    const handleExportReport = () => showMessage('Export started');

    // Render based on current view
    if (currentView === 'main') {
        return (
            <TeacherAnalyticsMain
                loading={loadingMain}
                selectedTerm={selectedTerm}
                setSelectedTerm={setSelectedTerm}
                keyMetrics={keyMetrics}
                classRanking={classRanking}
                factorAnalysis={factorAnalysis}
                riskStudents={riskStudents}
                subjectDifficulty={subjectDifficulty}
                examGap={examGap}
                cohortTracking={cohortTracking}
                onViewStudent={handleViewStudent}
                onViewClass={handleViewClass}
                onCompareMode={handleCompareMode}
                onExportReport={handleExportReport}
            />
        );
    }

    if (currentView === 'class' && selectedClass) {
        return (
            <TeacherGradeDrillDown
                className={selectedClass}
                students={teacherStudents}
                onViewStudent={handleViewStudent}
                onBack={() => setCurrentView('main')}
            />
        );
    }

    if (currentView === 'student' && selectedStudent) {
        return (
            <TeacherStudentDrillDown
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
            <TeacherCompareTerms
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

    return null;
};

export default TeacherAnalyticsManagement;