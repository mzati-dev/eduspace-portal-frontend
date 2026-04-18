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
    CompareData,
    ExamAnalysis,
    SecondarySelection,
    UniversitySelection
} from './types';
import ExamAnalysisTab from './ExamAnalysisTab';
import {
    fetchDashboardAnalytics,
    fetchStudentDetail,
    fetchCompareTermsData,
    fetchGradeStudents,
    fetchTerms,
    StudentDetail
} from '@/services/analyticsService';
import { API_BASE_URL } from '@/services/attendanceService';

interface AnalyticsManagementProps {
    classes: any[];
    students: any[];
    subjects: any[];
    showMessage: (msg: string, isError?: boolean) => void;
    schoolLevel?: 'primary' | 'secondary';
}

const AnalyticsManagement: React.FC<AnalyticsManagementProps> = ({
    classes,
    students,
    subjects,
    showMessage,
    schoolLevel: propSchoolLevel
}) => {
    // Main Tabs - Only 2: Internal and Exam
    const [activeTab, setActiveTab] = useState<'internal' | 'exam'>('internal');

    // Internal sub-views: 'main' or 'compare'
    const [internalView, setInternalView] = useState<'main' | 'compare' | 'student' | 'grade'>('main');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [gradeStudents, setGradeStudents] = useState<any[]>([]);

    // Filter State
    const [availableTerms, setAvailableTerms] = useState<{ value: string; label: string }[]>([]);
    const [selectedTerm, setSelectedTerm] = useState<string>('');
    const [compareTerm1, setCompareTerm1] = useState<string>('');
    const [compareTerm2, setCompareTerm2] = useState<string>('');
    const [compareData, setCompareData] = useState<CompareData | null>(null);

    // Loading States
    const [loadingMain, setLoadingMain] = useState(false);
    const [loadingStudent, setLoadingStudent] = useState(false);
    const [loadingCompare, setLoadingCompare] = useState(false);
    const [loadingGradeStudents, setLoadingGradeStudents] = useState(false);

    // Data States
    const [keyMetrics, setKeyMetrics] = useState<KeyMetric[]>([]);
    const [gradeRanking, setGradeRanking] = useState<GradeRanking[]>([]);
    const [factorAnalysis, setFactorAnalysis] = useState<FactorAnalysis[]>([]);
    const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
    const [subjectDifficulty, setSubjectDifficulty] = useState<SubjectDifficulty[]>([]);
    const [examGap, setExamGap] = useState<ExamGap[]>([]);
    const [cohortTracking, setCohortTracking] = useState<CohortTracking | null>(null);

    // Exam Analysis State
    const [examType, setExamType] = useState<'PSLCE' | 'JCE' | 'MSCE'>(() => {
        if (propSchoolLevel === 'primary') return 'PSLCE';
        if (propSchoolLevel === 'secondary') return 'MSCE';
        return 'MSCE';
    });
    const [examData, setExamData] = useState<ExamAnalysis | null>(null);
    const [secondarySelections, setSecondarySelections] = useState<SecondarySelection[]>([]);
    const [universitySelections, setUniversitySelections] = useState<UniversitySelection[]>([]);
    const [loadingExam, setLoadingExam] = useState(false);
    const [schoolLevel, setSchoolLevel] = useState<'primary' | 'secondary' | null>(propSchoolLevel || null);
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

    // Load available terms on mount
    useEffect(() => {
        loadTerms();
    }, []);

    const loadTerms = async () => {
        try {
            const terms = await fetchTerms();
            setAvailableTerms(terms);
            if (terms.length > 0) {
                setSelectedTerm(terms[0].value);
                if (terms.length >= 2) {
                    setCompareTerm1(terms[0].value);
                    setCompareTerm2(terms[1].value);
                } else {
                    setCompareTerm1(terms[0].value);
                    setCompareTerm2(terms[0].value);
                }
            }
        } catch (error) {
            console.error('Failed to load terms:', error);
        }
    };

    useEffect(() => {
        if (propSchoolLevel) {
            setSchoolLevel(propSchoolLevel);
            return;
        }
        if (!classes || classes.length === 0) return;
        const hasPrimaryClasses = classes.some(c =>
            c.name?.toLowerCase().includes('standard') ||
            c.name?.toLowerCase().includes('std') ||
            c.name?.toLowerCase().includes('primary')
        );
        const hasSecondaryClasses = classes.some(c =>
            c.name?.toLowerCase().includes('form')
        );
        if (hasPrimaryClasses && !hasSecondaryClasses) {
            setSchoolLevel('primary');
        } else if (hasSecondaryClasses) {
            setSchoolLevel('secondary');
        }
    }, [classes, propSchoolLevel]);

    useEffect(() => {
        if (schoolLevel === 'primary' && examType !== 'PSLCE') {
            setExamType('PSLCE');
        } else if (schoolLevel === 'secondary' && examType !== 'MSCE' && examType !== 'JCE') {
            setExamType('MSCE');
        }
    }, [schoolLevel]);

    // Load Main Dashboard Data
    useEffect(() => {
        if (activeTab === 'internal' && internalView === 'main' && selectedTerm) {
            loadMainDashboardData();
        }
    }, [selectedTerm, internalView, activeTab, selectedClassFilter]);

    const loadMainDashboardData = async () => {
        setLoadingMain(true);
        try {
            const classId = selectedClassFilter !== 'all' ? selectedClassFilter : undefined;
            const data = await fetchDashboardAnalytics(selectedTerm, classId);

            setKeyMetrics(data.keyMetrics);
            setGradeRanking(data.gradeRanking);
            setFactorAnalysis(data.factorAnalysis);
            setRiskStudents(data.riskStudents);
            setSubjectDifficulty(data.subjectDifficulty);
            setExamGap(data.examGap);
            setCohortTracking(data.cohortTracking);
        } catch (error: any) {
            console.error('Failed to load dashboard analytics:', error);
            showMessage(error.message || 'Failed to load analytics data', true);
        } finally {
            setLoadingMain(false);
        }
    };

    // Load Student Detail
    const loadStudentDetail = async (studentId: string, term?: string) => {
        setLoadingStudent(true);
        const selectedTermToUse = term || selectedTerm;

        try {
            const studentDetail = await fetchStudentDetail(studentId, selectedTermToUse);
            setSelectedStudent(studentDetail);
        } catch (error: any) {
            console.error('Failed to load student details:', error);
            showMessage(error.message || 'Failed to load student details', true);
        } finally {
            setLoadingStudent(false);
        }
    };

    // Load Compare Data
    const loadCompareData = async () => {
        if (!compareTerm1 || !compareTerm2) return;
        setLoadingCompare(true);
        try {
            const classId = selectedClassFilter !== 'all' ? selectedClassFilter : undefined;
            const data = await fetchCompareTermsData(compareTerm1, compareTerm2, classId);
            setCompareData(data);
        } catch (error: any) {
            console.error('Failed to load compare data:', error);
            showMessage(error.message || 'Failed to load comparison data', true);
        } finally {
            setLoadingCompare(false);
        }
    };

    // Load Grade Students
    const loadGradeStudents = async (gradeName: string) => {
        if (!selectedTerm) return;
        setLoadingGradeStudents(true);
        try {
            const studentsList = await fetchGradeStudents(gradeName, selectedTerm);
            setGradeStudents(studentsList);
        } catch (error: any) {
            console.error('Failed to load grade students:', error);
            showMessage(error.message || 'Failed to load grade students', true);
        } finally {
            setLoadingGradeStudents(false);
        }
    };

    const handleViewStudent = (studentId: string) => {
        loadStudentDetail(studentId, selectedTerm);
        setInternalView('student');
    };

    const handleViewGrade = (gradeName: string) => {
        setSelectedGrade(gradeName);
        loadGradeStudents(gradeName);
        setInternalView('grade');
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
            showMessage('Failed to load exam data', true);
        } finally {
            setLoadingExam(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'exam') {
            loadExamData();
        }
    }, [examType, activeTab]);

    const handleCompareMode = () => setInternalView('compare');
    const handleCompare = () => loadCompareData();
    const handleExportReport = () => showMessage('Export started');

    const handleTermChange = (newTerm: string) => {
        setSelectedTerm(newTerm);
    };

    // Main Tab Navigation - Only 2 tabs
    const MainTabNavigation = () => (
        <div className="flex justify-center">
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => {
                        setActiveTab('internal');
                        setInternalView('main');
                    }}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'internal' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Internal Performance Analysis
                </button>
                <button
                    onClick={() => setActiveTab('exam')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'exam' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    MANEB Performance Analysis
                </button>
            </div>
        </div>
    );

    // Internal Sub Navigation (when on Internal tab)
    const InternalSubNavigation = () => (
        <div className="flex justify-center">
            <div className="flex gap-2">
                <button
                    onClick={() => setInternalView('main')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${internalView === 'main' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setInternalView('compare')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${internalView === 'compare' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Compare Terms
                </button>
            </div>
        </div>
    );

    // Render Internal Analysis Tab
    if (activeTab === 'internal') {
        // Student Drill Down
        if (internalView === 'student' && selectedStudent) {
            return (
                <StudentDrillDown
                    student={selectedStudent}
                    loading={loadingStudent}
                    onBack={() => {
                        setInternalView('main');
                        setActiveTab('internal');
                    }}
                    onExportPDF={() => { }}
                    onEmailReport={() => { }}
                    selectedTerm={selectedTerm}
                    onTermChange={(newTerm) => {
                        console.log('Term changed to:', newTerm);
                        loadStudentDetail(selectedStudent.id, newTerm);
                    }}
                    availableTerms={availableTerms}
                />
            );
        }

        // Grade Drill Down
        if (internalView === 'grade' && selectedGrade) {
            return (
                <GradeDrillDown
                    gradeName={selectedGrade}
                    students={gradeStudents}
                    onViewStudent={handleViewStudent}
                    onBack={() => {
                        setInternalView('main');
                        setActiveTab('internal');
                    }}
                    selectedTerm={selectedTerm}
                    availableTerms={availableTerms}
                    onTermChange={handleTermChange}
                />
            );
        }

        // Compare Terms View
        if (internalView === 'compare') {
            return (
                <div className="space-y-6">
                    <MainTabNavigation />
                    <InternalSubNavigation />
                    <CompareTerms
                        loading={loadingCompare}
                        term1={compareTerm1}
                        term2={compareTerm2}
                        setTerm1={setCompareTerm1}
                        setTerm2={setCompareTerm2}
                        compareData={compareData}
                        onCompare={handleCompare}
                        onBack={() => setInternalView('main')}
                        onExportReport={handleExportReport}
                        classes={classes}
                        onFilterByClass={(classId) => {
                            console.log('Filter compare by class:', classId);
                            setSelectedClassFilter(classId);
                            loadCompareData();
                        }}
                        availableTerms={availableTerms}
                    />
                </div>
            );
        }

        // Main Dashboard View
        return (
            <div className="space-y-6">
                <MainTabNavigation />
                <InternalSubNavigation />
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
                    onViewExamAnalysis={() => setActiveTab('exam')}
                    classes={classes}
                    onFilterByClass={(classId) => {
                        setSelectedClassFilter(classId);
                        loadMainDashboardData();
                    }}
                    availableTerms={availableTerms}
                />
            </div>
        );
    }

    // Render Exam Analysis Tab
    return (
        <div className="space-y-6">
            <MainTabNavigation />

            {/* Exam Type Buttons - Centered */}
            <div className="flex items-center justify-center gap-8">
                <div className="flex gap-2">
                    {schoolLevel === 'primary' && (
                        <button
                            onClick={() => setExamType('PSLCE')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'PSLCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            PSLCE (Std 8)
                        </button>
                    )}
                    {schoolLevel === 'secondary' && (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            <ExamAnalysisTab
                examType={examType}
                examData={examData}
                schoolLevel={schoolLevel}
                secondarySelections={secondarySelections}
                universitySelections={universitySelections}
                loading={loadingExam}
                onExport={() => showMessage('Export started')}
                onViewStudent={handleViewStudent}
            />
        </div>
    );
};

export default AnalyticsManagement;

// // components/admin/analytics/AnalyticsManagement.tsx
// import React, { useState, useEffect } from 'react';
// import AnalyticsMain from './AnalyticsMain';
// import StudentDrillDown from './StudentDrillDown';
// import CompareTerms from './CompareTerms';
// import GradeDrillDown from './GradeDrillDown';
// import {
//     KeyMetric,
//     GradeRanking,
//     FactorAnalysis,
//     RiskStudent,
//     SubjectDifficulty,
//     ExamGap,
//     CohortTracking,

//     CompareData,
//     ExamAnalysis,
//     SecondarySelection,
//     UniversitySelection
// } from './types';
// import ExamAnalysisTab from './ExamAnalysisTab';
// import {
//     fetchDashboardAnalytics,
//     fetchStudentDetail,
//     fetchCompareTermsData,
//     fetchGradeStudents,
//     StudentDetail
// } from '@/services/analyticsService';
// import { API_BASE_URL } from '@/services/attendanceService';

// interface AnalyticsManagementProps {
//     classes: any[];
//     students: any[];
//     subjects: any[];
//     showMessage: (msg: string, isError?: boolean) => void;
//     schoolLevel?: 'primary' | 'secondary';
// }

// const AnalyticsManagement: React.FC<AnalyticsManagementProps> = ({
//     classes,
//     students,
//     subjects,
//     showMessage,
//     schoolLevel: propSchoolLevel
// }) => {
//     // Main Tabs - Only 2: Internal and Exam
//     const [activeTab, setActiveTab] = useState<'internal' | 'exam'>('internal');

//     // Internal sub-views: 'main' or 'compare'
//     const [internalView, setInternalView] = useState<'main' | 'compare' | 'student' | 'grade'>('main');
//     const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
//     const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
//     const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
//     const [gradeStudents, setGradeStudents] = useState<any[]>([]);

//     // Filter State
//     const [selectedTerm, setSelectedTerm] = useState<string>('Term 4, 2025 (Current)');
//     const [compareTerm1, setCompareTerm1] = useState<string>('Term 4, 2025');
//     const [compareTerm2, setCompareTerm2] = useState<string>('Term 3, 2025');
//     const [compareData, setCompareData] = useState<CompareData | null>(null);

//     // Loading States
//     const [loadingMain, setLoadingMain] = useState(false);
//     const [loadingStudent, setLoadingStudent] = useState(false);
//     const [loadingCompare, setLoadingCompare] = useState(false);
//     const [loadingGradeStudents, setLoadingGradeStudents] = useState(false);

//     // Data States
//     const [keyMetrics, setKeyMetrics] = useState<KeyMetric[]>([]);
//     const [gradeRanking, setGradeRanking] = useState<GradeRanking[]>([]);
//     const [factorAnalysis, setFactorAnalysis] = useState<FactorAnalysis[]>([]);
//     const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
//     const [subjectDifficulty, setSubjectDifficulty] = useState<SubjectDifficulty[]>([]);
//     const [examGap, setExamGap] = useState<ExamGap[]>([]);
//     const [cohortTracking, setCohortTracking] = useState<CohortTracking | null>(null);

//     // Exam Analysis State
//     const [examType, setExamType] = useState<'PSLCE' | 'JCE' | 'MSCE'>(() => {
//         if (propSchoolLevel === 'primary') return 'PSLCE';
//         if (propSchoolLevel === 'secondary') return 'MSCE';
//         return 'MSCE';
//     });
//     const [examData, setExamData] = useState<ExamAnalysis | null>(null);
//     const [secondarySelections, setSecondarySelections] = useState<SecondarySelection[]>([]);
//     const [universitySelections, setUniversitySelections] = useState<UniversitySelection[]>([]);
//     const [loadingExam, setLoadingExam] = useState(false);
//     const [schoolLevel, setSchoolLevel] = useState<'primary' | 'secondary' | null>(propSchoolLevel || null);
//     const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

//     useEffect(() => {
//         if (propSchoolLevel) {
//             setSchoolLevel(propSchoolLevel);
//             return;
//         }
//         if (!classes || classes.length === 0) return;
//         const hasPrimaryClasses = classes.some(c =>
//             c.name?.toLowerCase().includes('standard') ||
//             c.name?.toLowerCase().includes('std') ||
//             c.name?.toLowerCase().includes('primary')
//         );
//         const hasSecondaryClasses = classes.some(c =>
//             c.name?.toLowerCase().includes('form')
//         );
//         if (hasPrimaryClasses && !hasSecondaryClasses) {
//             setSchoolLevel('primary');
//         } else if (hasSecondaryClasses) {
//             setSchoolLevel('secondary');
//         }
//     }, [classes, propSchoolLevel]);

//     useEffect(() => {
//         if (schoolLevel === 'primary' && examType !== 'PSLCE') {
//             setExamType('PSLCE');
//         } else if (schoolLevel === 'secondary' && examType !== 'MSCE' && examType !== 'JCE') {
//             setExamType('MSCE');
//         }
//     }, [schoolLevel]);

//     // Load Main Dashboard Data - REPLACED MOCK DATA WITH REAL API CALL
//     useEffect(() => {
//         if (activeTab === 'internal' && internalView === 'main') {
//             loadMainDashboardData();
//         }
//     }, [selectedTerm, internalView, activeTab, selectedClassFilter]);

//     const loadMainDashboardData = async () => {
//         setLoadingMain(true);
//         try {
//             const classId = selectedClassFilter !== 'all' ? selectedClassFilter : undefined;
//             const data = await fetchDashboardAnalytics(selectedTerm, classId);

//             setKeyMetrics(data.keyMetrics);
//             setGradeRanking(data.gradeRanking);
//             setFactorAnalysis(data.factorAnalysis);
//             setRiskStudents(data.riskStudents);
//             setSubjectDifficulty(data.subjectDifficulty);
//             setExamGap(data.examGap);
//             setCohortTracking(data.cohortTracking);
//         } catch (error: any) {
//             console.error('Failed to load dashboard analytics:', error);
//             showMessage(error.message || 'Failed to load analytics data', true);
//         } finally {
//             setLoadingMain(false);
//         }
//     };

//     // Load Student Detail - REPLACED MOCK DATA WITH REAL API CALL
//     const loadStudentDetail = async (studentId: string, term?: string) => {
//         setLoadingStudent(true);
//         const selectedTermToUse = term || selectedTerm;

//         try {
//             const studentDetail = await fetchStudentDetail(studentId, selectedTermToUse);
//             setSelectedStudent(studentDetail);
//         } catch (error: any) {
//             console.error('Failed to load student details:', error);
//             showMessage(error.message || 'Failed to load student details', true);
//         } finally {
//             setLoadingStudent(false);
//         }
//     };

//     // Load Compare Data - REPLACED MOCK DATA WITH REAL API CALL
//     const loadCompareData = async () => {
//         setLoadingCompare(true);
//         try {
//             const classId = selectedClassFilter !== 'all' ? selectedClassFilter : undefined;
//             const data = await fetchCompareTermsData(compareTerm1, compareTerm2, classId);
//             setCompareData(data);
//         } catch (error: any) {
//             console.error('Failed to load compare data:', error);
//             showMessage(error.message || 'Failed to load comparison data', true);
//         } finally {
//             setLoadingCompare(false);
//         }
//     };

//     // Load Grade Students - REPLACED MOCK DATA WITH REAL API CALL
//     const loadGradeStudents = async (gradeName: string) => {
//         setLoadingGradeStudents(true);
//         try {
//             const studentsList = await fetchGradeStudents(gradeName, selectedTerm);
//             setGradeStudents(studentsList);
//         } catch (error: any) {
//             console.error('Failed to load grade students:', error);
//             showMessage(error.message || 'Failed to load grade students', true);
//         } finally {
//             setLoadingGradeStudents(false);
//         }
//     };

//     const handleViewStudent = (studentId: string) => {
//         loadStudentDetail(studentId, selectedTerm);
//         setInternalView('student');
//     };

//     const handleViewGrade = (gradeName: string) => {
//         setSelectedGrade(gradeName);
//         loadGradeStudents(gradeName);
//         setInternalView('grade');
//     };

//     const loadExamData = async () => {
//         setLoadingExam(true);
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/analytics/exam/${examType}`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             const data = await response.json();
//             if (data.success) {
//                 setExamData(data.examData);
//                 setSecondarySelections(data.secondarySelections || []);
//                 setUniversitySelections(data.universitySelections || []);
//             }
//         } catch (error) {
//             console.error('Failed to load exam data:', error);
//             showMessage('Failed to load exam data', true);
//         } finally {
//             setLoadingExam(false);
//         }
//     };

//     useEffect(() => {
//         if (activeTab === 'exam') {
//             loadExamData();
//         }
//     }, [examType, activeTab]);

//     const handleCompareMode = () => setInternalView('compare');
//     const handleCompare = () => loadCompareData();
//     const handleExportReport = () => showMessage('Export started');

//     // Main Tab Navigation - Only 2 tabs
//     const MainTabNavigation = () => (
//         <div className="flex justify-center">
//             <div className="flex gap-2 border-b border-slate-200">
//                 <button
//                     onClick={() => {
//                         setActiveTab('internal');
//                         setInternalView('main');
//                     }}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'internal' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
//                 >
//                     Internal Performance Analysis
//                 </button>
//                 <button
//                     onClick={() => setActiveTab('exam')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'exam' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
//                 >
//                     MANEB Performance Analysis
//                 </button>
//             </div>
//         </div>
//     );

//     // Internal Sub Navigation (when on Internal tab)
//     const InternalSubNavigation = () => (
//         <div className="flex justify-center">
//             <div className="flex gap-2">
//                 <button
//                     onClick={() => setInternalView('main')}
//                     className={`px-3 py-1.5 text-xs rounded-md transition-colors ${internalView === 'main' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
//                 >
//                     Overview
//                 </button>
//                 <button
//                     onClick={() => setInternalView('compare')}
//                     className={`px-3 py-1.5 text-xs rounded-md transition-colors ${internalView === 'compare' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
//                 >
//                     Compare Terms
//                 </button>
//             </div>
//         </div>
//     );

//     // Render Internal Analysis Tab
//     if (activeTab === 'internal') {
//         // Student Drill Down
//         if (internalView === 'student' && selectedStudent) {
//             return (
//                 <StudentDrillDown
//                     student={selectedStudent}
//                     loading={loadingStudent}
//                     onBack={() => {
//                         setInternalView('main');
//                         setActiveTab('internal');
//                     }}
//                     onExportPDF={() => { }}
//                     onEmailReport={() => { }}
//                     selectedTerm={selectedTerm}
//                     onTermChange={(newTerm) => {
//                         console.log('Term changed to:', newTerm);
//                         loadStudentDetail(selectedStudent.id, newTerm);
//                     }}
//                 />
//             );
//         }

//         // Grade Drill Down
//         if (internalView === 'grade' && selectedGrade) {
//             return (
//                 <GradeDrillDown
//                     gradeName={selectedGrade}
//                     students={gradeStudents}
//                     onViewStudent={handleViewStudent}
//                     onBack={() => {
//                         setInternalView('main');
//                         setActiveTab('internal');
//                     }}
//                     selectedTerm={selectedTerm}
//                 />
//             );
//         }

//         // Compare Terms View
//         if (internalView === 'compare') {
//             return (
//                 <div className="space-y-6">
//                     <MainTabNavigation />
//                     <InternalSubNavigation />
//                     <CompareTerms
//                         loading={loadingCompare}
//                         term1={compareTerm1}
//                         term2={compareTerm2}
//                         setTerm1={setCompareTerm1}
//                         setTerm2={setCompareTerm2}
//                         compareData={compareData}
//                         onCompare={handleCompare}
//                         onBack={() => setInternalView('main')}
//                         onExportReport={handleExportReport}
//                         classes={classes}
//                         onFilterByClass={(classId) => {
//                             console.log('Filter compare by class:', classId);
//                             setSelectedClassFilter(classId);
//                             loadCompareData();
//                         }}
//                     />
//                 </div>
//             );
//         }

//         // Main Dashboard View
//         return (
//             <div className="space-y-6">
//                 <MainTabNavigation />
//                 <InternalSubNavigation />
//                 <AnalyticsMain
//                     loading={loadingMain}
//                     selectedTerm={selectedTerm}
//                     setSelectedTerm={setSelectedTerm}
//                     keyMetrics={keyMetrics}
//                     gradeRanking={gradeRanking}
//                     factorAnalysis={factorAnalysis}
//                     riskStudents={riskStudents}
//                     subjectDifficulty={subjectDifficulty}
//                     examGap={examGap}
//                     cohortTracking={cohortTracking}
//                     onViewStudent={handleViewStudent}
//                     onViewGrade={handleViewGrade}
//                     onCompareMode={handleCompareMode}
//                     onExportReport={handleExportReport}
//                     onViewExamAnalysis={() => setActiveTab('exam')}
//                     classes={classes}
//                     onFilterByClass={(classId) => {
//                         setSelectedClassFilter(classId);
//                         loadMainDashboardData();
//                     }}
//                 />
//             </div>
//         );
//     }

//     // Render Exam Analysis Tab
//     return (
//         <div className="space-y-6">
//             <MainTabNavigation />

//             {/* Exam Type Buttons - Centered */}
//             <div className="flex items-center justify-center gap-8">
//                 <div className="flex gap-2">
//                     {schoolLevel === 'primary' && (
//                         <button
//                             onClick={() => setExamType('PSLCE')}
//                             className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'PSLCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
//                         >
//                             PSLCE (Std 8)
//                         </button>
//                     )}
//                     {schoolLevel === 'secondary' && (
//                         <>
//                             <button
//                                 onClick={() => setExamType('JCE')}
//                                 className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'JCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
//                             >
//                                 JCE (Form 2)
//                             </button>
//                             <button
//                                 onClick={() => setExamType('MSCE')}
//                                 className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'MSCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
//                             >
//                                 MSCE (Form 4)
//                             </button>
//                         </>
//                     )}
//                 </div>
//             </div>

//             <ExamAnalysisTab
//                 examType={examType}
//                 examData={examData}
//                 schoolLevel={schoolLevel}
//                 secondarySelections={secondarySelections}
//                 universitySelections={universitySelections}
//                 loading={loadingExam}
//                 onExport={() => showMessage('Export started')}
//                 onViewStudent={handleViewStudent}
//             />
//         </div>
//     );
// };

// export default AnalyticsManagement;

// // components/admin/analytics/AnalyticsManagement.tsx
// import React, { useState, useEffect } from 'react';
// import AnalyticsMain from './AnalyticsMain';
// import StudentDrillDown from './StudentDrillDown';
// import CompareTerms from './CompareTerms';
// import GradeDrillDown from './GradeDrillDown';
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
//     ViewType,
//     ExamAnalysis,
//     SecondarySelection,
//     UniversitySelection
// } from './types';
// import ExamAnalysisTab from './ExamAnalysisTab';
// import { API_BASE_URL } from '@/services/attendanceService';

// interface AnalyticsManagementProps {
//     classes: any[];
//     students: any[];
//     subjects: any[];
//     showMessage: (msg: string, isError?: boolean) => void;
//     schoolLevel?: 'primary' | 'secondary';
// }

// const AnalyticsManagement: React.FC<AnalyticsManagementProps> = ({
//     classes,
//     students,
//     subjects,
//     showMessage,
//     schoolLevel: propSchoolLevel
// }) => {
//     // Main Tabs - Only 2: Internal and Exam
//     const [activeTab, setActiveTab] = useState<'internal' | 'exam'>('internal');

//     // Internal sub-views: 'main' or 'compare'
//     const [internalView, setInternalView] = useState<'main' | 'compare' | 'student' | 'grade'>('main');
//     const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
//     const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
//     const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

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

//     // Exam Analysis State
//     const [examType, setExamType] = useState<'PSLCE' | 'JCE' | 'MSCE'>(() => {
//         if (propSchoolLevel === 'primary') return 'PSLCE';
//         if (propSchoolLevel === 'secondary') return 'MSCE';
//         return 'MSCE';
//     });
//     const [examData, setExamData] = useState<ExamAnalysis | null>(null);
//     const [secondarySelections, setSecondarySelections] = useState<SecondarySelection[]>([]);
//     const [universitySelections, setUniversitySelections] = useState<UniversitySelection[]>([]);
//     const [loadingExam, setLoadingExam] = useState(false);
//     const [schoolLevel, setSchoolLevel] = useState<'primary' | 'secondary' | null>(propSchoolLevel || null);
//     // Add this with other state declarations
//     const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
//     useEffect(() => {
//         if (propSchoolLevel) {
//             setSchoolLevel(propSchoolLevel);
//             return;
//         }
//         if (!classes || classes.length === 0) return;
//         const hasPrimaryClasses = classes.some(c =>
//             c.name?.toLowerCase().includes('standard') ||
//             c.name?.toLowerCase().includes('std') ||
//             c.name?.toLowerCase().includes('primary')
//         );
//         const hasSecondaryClasses = classes.some(c =>
//             c.name?.toLowerCase().includes('form')
//         );
//         if (hasPrimaryClasses && !hasSecondaryClasses) {
//             setSchoolLevel('primary');
//         } else if (hasSecondaryClasses) {
//             setSchoolLevel('secondary');
//         }
//     }, [classes, propSchoolLevel]);

//     useEffect(() => {
//         if (schoolLevel === 'primary' && examType !== 'PSLCE') {
//             setExamType('PSLCE');
//         } else if (schoolLevel === 'secondary' && examType !== 'MSCE' && examType !== 'JCE') {
//             setExamType('MSCE');
//         }
//     }, [schoolLevel]);

//     // Load Main Dashboard Data
//     useEffect(() => {
//         if (activeTab === 'internal' && internalView === 'main') {
//             loadMainDashboardData();
//         }
//     }, [selectedTerm, internalView, activeTab]);

//     const loadMainDashboardData = async () => {
//         setLoadingMain(true);
//         setTimeout(() => {
//             setKeyMetrics([
//                 { label: 'Overall Pass %', value: '78%', change: -3, vsText: 'vs T3', icon: 'trending-up', color: 'text-indigo-600' },
//                 { label: 'Average Score', value: '78%', change: -2, vsText: 'vs T3', icon: 'graduation-cap', color: 'text-emerald-600' },
//                 { label: 'Total Students', value: '2,450', change: 45, vsText: 'vs T3', icon: 'users', color: 'text-purple-600' },
//                 { label: 'Att-Perf Correlation', value: 'r = 0.73', change: 0, vsText: 'Strong Positive', icon: 'brain', color: 'text-amber-600' }
//             ]);
//             setGradeRanking([
//                 { rank: 1, name: 'Grade 7A', passRate: 89, avgScore: 84, attendance: 86, riskStudents: 12, riskChange: -4, trend: 5 },
//                 { rank: 2, name: 'Grade 8B', passRate: 76, avgScore: 76, attendance: 78, riskStudents: 28, riskChange: 3, trend: -2 },
//                 { rank: 3, name: 'Grade 6A', passRate: 68, avgScore: 69, attendance: 71, riskStudents: 42, riskChange: 8, trend: -5 },
//                 { rank: 4, name: 'Grade 7B', passRate: 65, avgScore: 65, attendance: 69, riskStudents: 38, riskChange: 2, trend: -1 },
//                 { rank: 5, name: 'Grade 8A', passRate: 72, avgScore: 73, attendance: 74, riskStudents: 25, riskChange: -1, trend: 1 }
//             ]);
//             setFactorAnalysis([
//                 { factor: 'Attendance', correlation: 0.73, impact: 'Strong +', insight: 'Key driver for all grades' },
//                 { factor: 'Previous Term Marks', correlation: 0.81, impact: 'Very Strong +', insight: 'Best predictor of success' },
//                 { factor: 'CAT/Continuous Asst', correlation: 0.76, impact: 'Strong +', insight: 'CATs strongly predict exams' },
//                 { factor: 'Subject Difficulty', correlation: -0.45, impact: 'Moderate -', insight: 'Mathematics & Science hardest' },
//                 { factor: 'Failed Subjects', correlation: -0.52, impact: 'Strong -', insight: 'Each fail = -12% avg score' },
//                 { factor: 'Homework Submission', correlation: 0.38, impact: 'Moderate +', insight: 'Regular homework = success' }
//             ]);
//             const allStudentsList = students.map((s, idx) => ({
//                 id: s.id || String(idx + 1),
//                 name: s.name,
//                 examNumber: s.examNumber || `STU${String(idx + 1).padStart(4, '0')}`,
//                 grade: s.class?.name || 'Grade 7A',
//                 attendance: 55 + Math.random() * 35,
//                 catScore: 40 + Math.random() * 50,
//                 fails: Math.floor(Math.random() * 3),
//                 prevDrop: -Math.floor(Math.random() * 25),
//                 riskLevel: (Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'high' : 'medium') as 'critical' | 'high' | 'medium' | 'low'
//             }));
//             setRiskStudents(allStudentsList.filter(s => s.attendance < 65 || s.catScore < 50).slice(0, 5) as RiskStudent[]);
//             setSubjectDifficulty([
//                 { rank: 1, name: 'Mathematics', avgScore: 58, passRate: 42, correlation: 0.82, action: '⚠️ High attention' },
//                 { rank: 2, name: 'Science', avgScore: 62, passRate: 55, correlation: 0.75, action: '⚠️ Moderate' },
//                 { rank: 3, name: 'English', avgScore: 65, passRate: 60, correlation: 0.68, action: 'Review teaching' },
//                 { rank: 8, name: 'Creative Arts', avgScore: 82, passRate: 94, correlation: 0.32, action: '✅ Low intervention' }
//             ]);
//             setExamGap([
//                 { grade: 'Grade 7A', avgCAT: 68, avgExam: 58, gap: 10, studentsDrop: 12 },
//                 { grade: 'Grade 8B', avgCAT: 65, avgExam: 59, gap: 6, studentsDrop: 8 },
//                 { grade: 'Grade 6A', avgCAT: 70, avgExam: 66, gap: 4, studentsDrop: 5 }
//             ]);
//             setCohortTracking({
//                 cohort: 'Grade 7 Cohort (245 students)',
//                 data: [72, 74, 78, 76, 75, 78],
//                 labels: ['T1, 2024/25', 'T2, 2024/25', 'T3, 2024/25', 'T1, 2025/2026', 'T2, 2025/26', 'Current'],
//                 improving: 45,
//                 declining: 28,
//                 currentRate: 78
//             });
//             setLoadingMain(false);
//         }, 800);
//     };

//     const loadStudentDetail = async (studentId: string, term?: string) => {
//         setLoadingStudent(true);
//         const foundStudent = students.find(s => s.id === studentId);
//         const selectedTermToUse = term || selectedTerm;
//         console.log('Loading student data for term:', selectedTermToUse);

//         setTimeout(() => {
//             const studentDetail: StudentDetail = {
//                 id: studentId,
//                 name: foundStudent?.name || 'Student Name',
//                 grade: foundStudent?.class?.name || 'Grade 7A',
//                 batch: '2024',
//                 rollNo: foundStudent?.examNumber || 'STU001',
//                 status: 'Needs Monitoring',
//                 classTeacher: 'Class Teacher',
//                 currentMarks: 65,
//                 currentAttendance: 70,
//                 termOverTerm: -5,
//                 classRank: '50/150',
//                 timeline: [
//                     { term: 'T1, 2025/26', marks: 70, attendance: 75 },
//                     { term: 'T2, 2025/26', marks: 68, attendance: 72 },
//                     { term: 'T3, 202526', marks: 65, attendance: 70 },
//                     { term: 'T1, 2026/27', marks: 62, attendance: 68 }
//                 ],
//                 factorBreakdown: [],
//                 subjectBreakdown: [],
//                 historical: [],
//                 recommendations: ['Regular monitoring recommended']
//             };
//             setSelectedStudent(studentDetail);
//             setLoadingStudent(false);
//         }, 500);
//     };

//     const loadCompareData = async () => {
//         setLoadingCompare(true);
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
//                 departments: [],
//                 newRiskStudents: []
//             });
//             setLoadingCompare(false);
//         }, 600);
//     };

//     // const handleViewStudent = (studentId: string) => {
//     //     loadStudentDetail(studentId);
//     //     setInternalView('student');
//     // };

//     const handleViewStudent = (studentId: string) => {
//         loadStudentDetail(studentId, selectedTerm);
//         setInternalView('student');
//     };

//     const handleViewGrade = (gradeName: string) => {
//         setSelectedGrade(gradeName);
//         setInternalView('grade');
//     };

//     const loadExamData = async () => {
//         setLoadingExam(true);
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/analytics/exam/${examType}`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             const data = await response.json();
//             if (data.success) {
//                 setExamData(data.examData);
//                 setSecondarySelections(data.secondarySelections || []);
//                 setUniversitySelections(data.universitySelections || []);
//             }
//         } catch (error) {
//             console.error('Failed to load exam data:', error);
//         } finally {
//             setLoadingExam(false);
//         }
//     };

//     useEffect(() => {
//         if (activeTab === 'exam') {
//             loadExamData();
//         }
//     }, [examType, activeTab]);

//     const handleCompareMode = () => setInternalView('compare');
//     const handleCompare = () => loadCompareData();
//     const handleExportReport = () => showMessage('Export started');

//     // Main Tab Navigation - Only 2 tabs
//     const MainTabNavigation = () => (
//         <div className="flex justify-center">
//             <div className="flex gap-2 border-b border-slate-200">
//                 <button
//                     onClick={() => {
//                         setActiveTab('internal');
//                         setInternalView('main');
//                     }}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'internal' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
//                 >
//                     Internal Performance Analysis
//                 </button>
//                 <button
//                     onClick={() => setActiveTab('exam')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'exam' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
//                 >
//                     MANEB Performance Analysis
//                 </button>
//             </div>
//         </div>
//     );

//     // Internal Sub Navigation (when on Internal tab)
//     const InternalSubNavigation = () => (
//         <div className="flex justify-center">
//             <div className="flex gap-2">
//                 <button
//                     onClick={() => setInternalView('main')}
//                     className={`px-3 py-1.5 text-xs rounded-md transition-colors ${internalView === 'main' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
//                 >
//                     Overview
//                 </button>
//                 <button
//                     onClick={() => setInternalView('compare')}
//                     className={`px-3 py-1.5 text-xs rounded-md transition-colors ${internalView === 'compare' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
//                 >
//                     Compare Terms
//                 </button>
//             </div>
//         </div>
//     );

//     // Render Internal Analysis Tab
//     if (activeTab === 'internal') {
//         // Student Drill Down
//         if (internalView === 'student' && selectedStudent) {
//             return (
//                 <StudentDrillDown
//                     student={selectedStudent}
//                     loading={loadingStudent}
//                     onBack={() => {
//                         setInternalView('main');
//                         setActiveTab('internal');
//                     }}
//                     onExportPDF={() => { }}
//                     onEmailReport={() => { }}
//                     selectedTerm={selectedTerm}
//                     onTermChange={(newTerm) => {
//                         console.log('Term changed to:', newTerm);
//                         // Fetch new data for this student for the selected term
//                         loadStudentDetail(selectedStudent.id, newTerm);
//                     }}
//                 />
//             );
//         }

//         // Grade Drill Down
//         if (internalView === 'grade' && selectedGrade) {
//             return (
//                 <GradeDrillDown
//                     gradeName={selectedGrade}
//                     students={students}
//                     onViewStudent={handleViewStudent}
//                     onBack={() => {
//                         setInternalView('main');
//                         setActiveTab('internal');
//                     }}
//                     selectedTerm={selectedTerm}
//                 />
//             );
//         }

//         // Compare Terms View
//         if (internalView === 'compare') {
//             return (
//                 <div className="space-y-6">
//                     <MainTabNavigation />
//                     <InternalSubNavigation />
//                     <CompareTerms
//                         loading={loadingCompare}
//                         term1={compareTerm1}
//                         term2={compareTerm2}
//                         setTerm1={setCompareTerm1}
//                         setTerm2={setCompareTerm2}
//                         compareData={compareData}
//                         onCompare={handleCompare}
//                         onBack={() => setInternalView('main')}
//                         onExportReport={handleExportReport}
//                         classes={classes}  // ← ADD THIS
//                         onFilterByClass={(classId) => {  // ← ADD THIS
//                             console.log('Filter compare by class:', classId);
//                             // Add logic to reload compare data for the selected class
//                             loadCompareData();
//                         }}
//                     />
//                 </div>
//             );
//         }

//         // Main Dashboard View
//         return (
//             <div className="space-y-6">
//                 <MainTabNavigation />
//                 <InternalSubNavigation />
//                 <AnalyticsMain
//                     loading={loadingMain}
//                     selectedTerm={selectedTerm}
//                     setSelectedTerm={setSelectedTerm}
//                     keyMetrics={keyMetrics}
//                     gradeRanking={gradeRanking}
//                     factorAnalysis={factorAnalysis}
//                     riskStudents={riskStudents}
//                     subjectDifficulty={subjectDifficulty}
//                     examGap={examGap}
//                     cohortTracking={cohortTracking}
//                     onViewStudent={handleViewStudent}
//                     onViewGrade={handleViewGrade}
//                     onCompareMode={handleCompareMode}
//                     onExportReport={handleExportReport}
//                     onViewExamAnalysis={() => setActiveTab('exam')}
//                     classes={classes}
//                     onFilterByClass={(classId) => {
//                         // When a class is selected, reload data for that class
//                         setSelectedClassFilter(classId);
//                         // You can add API call here to fetch class-specific data
//                         console.log('Filtering by class:', classId);
//                         // Reload dashboard data with class filter
//                         loadMainDashboardData();
//                     }}
//                 />
//             </div>
//         );
//     }

//     // Render Exam Analysis Tab
//     return (
//         <div className="space-y-6">
//             <MainTabNavigation />

//             {/* Exam Type Buttons - Centered */}
//             <div className="flex items-center justify-center gap-8">
//                 <div className="flex gap-2">
//                     {schoolLevel === 'primary' && (
//                         <button
//                             onClick={() => setExamType('PSLCE')}
//                             className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'PSLCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
//                         >
//                             PSLCE (Std 8)
//                         </button>
//                     )}
//                     {schoolLevel === 'secondary' && (
//                         <>
//                             <button
//                                 onClick={() => setExamType('JCE')}
//                                 className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'JCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
//                             >
//                                 JCE (Form 2)
//                             </button>
//                             <button
//                                 onClick={() => setExamType('MSCE')}
//                                 className={`px-4 py-2 rounded-lg text-sm font-medium ${examType === 'MSCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
//                             >
//                                 MSCE (Form 4)
//                             </button>
//                         </>
//                     )}
//                 </div>
//             </div>

//             <ExamAnalysisTab
//                 examType={examType}
//                 examData={examData}
//                 schoolLevel={schoolLevel}
//                 secondarySelections={secondarySelections}
//                 universitySelections={universitySelections}
//                 loading={loadingExam}
//                 onExport={() => showMessage('Export started')}
//                 onViewStudent={handleViewStudent}
//             />
//         </div>
//     );
// };

// export default AnalyticsManagement;
