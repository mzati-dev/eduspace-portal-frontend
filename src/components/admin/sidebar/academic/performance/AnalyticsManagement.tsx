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
import { fetchClassResults } from '@/services/studentService';
// ===== NEW: Import the data generator =====
import { generateAnalyticsFromResults } from '@/services/analyticsDataGenerator';
import { ClassResultStudent, Student } from '@/types/admin';
import { GradeConfiguration } from '@/services/gradeConfigService';

interface AnalyticsManagementProps {
    classes: any[];
    students: any[];
    subjects: any[];
    showMessage: (msg: string, isError?: boolean) => void;
    schoolLevel?: 'primary' | 'secondary';
    // ===== NEW: Props for local data =====
    classResults?: ClassResultStudent[];
    activeConfig?: GradeConfiguration | null;
    calculateGrade?: (score: number, passMark?: number, isAbsent?: boolean, className?: string) => string;
    calculateFinalScore?: (qa1: number, qa2: number, endOfTerm: number, config: GradeConfiguration) => number;
    assessmentType?: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
    // ===== ADD THESE TWO =====
    loadClassResults?: (classId: string) => Promise<void>;
    setSelectedClassForResults?: (classId: string) => void;
    setAssessmentType?: (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => void;  // ← ADD THIS
}

const AnalyticsManagement: React.FC<AnalyticsManagementProps> = ({
    classes,
    students,
    subjects,
    showMessage,
    schoolLevel: propSchoolLevel,
    // ===== NEW: Receive props =====
    classResults = [],
    activeConfig = null,
    calculateGrade,
    calculateFinalScore,
    assessmentType = 'overall',
    // ===== ADD THESE TWO =====
    loadClassResults,
    setSelectedClassForResults,
    setAssessmentType,
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
    const [localClassResults, setLocalClassResults] = useState<ClassResultStudent[]>([]);

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

    // ===== MODIFIED: Load Main Dashboard Data =====
    useEffect(() => {
        if (activeTab === 'internal' && internalView === 'main' && selectedTerm) {
            loadMainDashboardData();
        }
    }, [selectedTerm, internalView, activeTab, selectedClassFilter, classResults, assessmentType]);

    // ===== RELOAD WHEN CLASS RESULTS CHANGE =====
    useEffect(() => {
        if (activeTab === 'internal' && internalView === 'main' && selectedTerm) {
            const hasData = classResults.length > 0 || localClassResults.length > 0;
            if (hasData) {
                loadMainDashboardData();
            }
        }
    }, [classResults, localClassResults]);


    const loadMainDashboardData = async () => {
        setLoadingMain(true);
        try {
            // ===== NEW: Check if we have local data to generate analytics =====
            const resultsToUse = localClassResults.length > 0 ? localClassResults : classResults;
            if (resultsToUse && resultsToUse.length > 0 && calculateGrade && calculateFinalScore) {
                console.log('📊 Generating analytics from local class results data...');

                const analyticsData = generateAnalyticsFromResults(
                    resultsToUse,
                    students as Student[],
                    subjects,
                    activeConfig || null,
                    assessmentType || 'overall',
                    calculateGrade,
                    calculateFinalScore
                );

                setKeyMetrics(analyticsData.keyMetrics);
                setGradeRanking(analyticsData.gradeRanking);
                setFactorAnalysis(analyticsData.factorAnalysis);
                setRiskStudents(analyticsData.riskStudents);
                setSubjectDifficulty(analyticsData.subjectDifficulty);
                setExamGap(analyticsData.examGap);
                setCohortTracking(analyticsData.cohortTracking);

                console.log('✅ Analytics generated successfully from local data');
            } else {
                // ===== FALLBACK: Use API if no local data =====
                console.log('📡 No local data available, falling back to API...');
                const classId = selectedClassFilter !== 'all' ? selectedClassFilter : undefined;
                const data = await fetchDashboardAnalytics(selectedTerm, classId);

                setKeyMetrics(data.keyMetrics);
                setGradeRanking(data.gradeRanking);
                setFactorAnalysis(data.factorAnalysis);
                setRiskStudents(data.riskStudents);
                setSubjectDifficulty(data.subjectDifficulty);
                setExamGap(data.examGap);
                setCohortTracking(data.cohortTracking);
            }
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

    // ===== NEW: Handle assessment type change from AnalyticsMain =====
    const handleAssessmentTypeChange = (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => {
        console.log('Assessment type changed to:', type);

        // Update parent state
        if (setAssessmentType) {
            setAssessmentType(type);
        }

        // Reload data with new assessment type
        if (classResults && classResults.length > 0 && calculateGrade && calculateFinalScore) {
            const analyticsData = generateAnalyticsFromResults(
                classResults,
                students as Student[],
                subjects,
                activeConfig || null,
                type,
                calculateGrade,
                calculateFinalScore
            );

            setKeyMetrics(analyticsData.keyMetrics);
            setGradeRanking(analyticsData.gradeRanking);
            setFactorAnalysis(analyticsData.factorAnalysis);
            setRiskStudents(analyticsData.riskStudents);
            setSubjectDifficulty(analyticsData.subjectDifficulty);
            setExamGap(analyticsData.examGap);
            setCohortTracking(analyticsData.cohortTracking);
        }
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

    // Show data source indicator
    const DataSourceIndicator = () => {
        const hasLocalData = classResults && classResults.length > 0;
        return (
            <div className="text-right text-xs text-slate-400 mt-2">
                {hasLocalData ? (
                    <span className="text-green-600">✓ Using real data from {classResults.length} students</span>
                ) : (
                    <span className="text-amber-600">⚠ Using sample data (no results found)</span>
                )}
            </div>
        );
    };

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

                {/* ===== NEW: Show data source indicator ===== */}
                <DataSourceIndicator />

                <AnalyticsMain

                    loading={loadingMain}
                    // selectedTerm={selectedTerm}
                    // setSelectedTerm={setSelectedTerm}
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
                    onFilterByClass={async (classId) => {
                        setSelectedClassFilter(classId);
                        if (classId && classId !== 'all') {
                            setLoadingMain(true);
                            try {
                                if (loadClassResults) {
                                    await loadClassResults(classId);
                                } else {
                                    const results = await fetchClassResults(classId);
                                    setLocalClassResults(results);
                                }
                                if (setSelectedClassForResults) {
                                    setSelectedClassForResults(classId);
                                }
                                // loadMainDashboardData() removed - useEffect will handle it
                            } catch (error) {
                                console.error('Failed to load class results:', error);
                                showMessage('Failed to load class results', true);
                            } finally {
                                setLoadingMain(false);
                            }
                        } else {
                            setLocalClassResults([]);
                            // loadMainDashboardData() removed - useEffect will handle it
                        }
                    }}
                    availableTerms={availableTerms}
                    // ===== NEW: Pass assessment type change handler =====
                    onAssessmentTypeChange={handleAssessmentTypeChange}
                    assessmentType={assessmentType}

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