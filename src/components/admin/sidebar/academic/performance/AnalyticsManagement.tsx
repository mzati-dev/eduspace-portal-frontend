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
import { API_BASE_URL, fetchStudentAttendanceRate } from '@/services/attendanceService';
import { fetchArchivedResults, fetchClassResults, fetchCurrentTermPassRates, fetchStudentArchivedResults } from '@/services/studentService';
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
    setAssessmentType?: (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => void;
    archivedResults?: any[];
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
    archivedResults = [],
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
    const [currentPassRates, setCurrentPassRates] = useState<any[]>([]);

    // Load available terms on mount
    useEffect(() => {
        loadTerms();
    }, []);

    const loadTerms = async () => {
        try {
            const terms = await fetchTerms();

            // Sort: Most recent first
            const sortedTerms = [...terms].sort((a, b) => {
                // Extract year (the first 4 digits)
                const yearA = parseInt(a.label.match(/\d{4}/)?.[0] || '0');
                const yearB = parseInt(b.label.match(/\d{4}/)?.[0] || '0');

                // Most recent year first
                if (yearA !== yearB) {
                    return yearB - yearA;
                }

                // Same year: Term 3 > Term 2 > Term 1
                const termA = parseInt(a.label.match(/Term (\d+)/)?.[1] || '0');
                const termB = parseInt(b.label.match(/Term (\d+)/)?.[1] || '0');
                return termB - termA;
            });

            setAvailableTerms(sortedTerms);

            if (sortedTerms.length > 0) {
                // Now terms[0] is the most recent term (current)
                setSelectedTerm(sortedTerms[0].value);

                if (sortedTerms.length >= 2) {
                    setCompareTerm1(sortedTerms[0].value);
                    setCompareTerm2(sortedTerms[1].value);
                } else {
                    setCompareTerm1(sortedTerms[0].value);
                    setCompareTerm2(sortedTerms[0].value);
                }
            }
        } catch (error) {
            console.error('Failed to load terms:', error);
        }
    };

    // const loadTerms = async () => {
    //     try {
    //         const terms = await fetchTerms();
    //         setAvailableTerms(terms);
    //         if (terms.length > 0) {
    //             setSelectedTerm(terms[0].value);
    //             if (terms.length >= 2) {
    //                 setCompareTerm1(terms[0].value);
    //                 setCompareTerm2(terms[1].value);
    //             } else {
    //                 setCompareTerm1(terms[0].value);
    //                 setCompareTerm2(terms[0].value);
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Failed to load terms:', error);
    //     }
    // };

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

    useEffect(() => {
        const loadPassRates = async () => {
            const rates = await fetchCurrentTermPassRates();
            setCurrentPassRates(rates);
        };
        loadPassRates();
    }, []);


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



    /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////

    const loadStudentDetail = async (studentId: string, term?: string) => {
        setLoadingStudent(true);
        const selectedTermToUse = term || selectedTerm;

        try {
            // ===== GET STUDENT INFO =====
            const studentInfo = students.find(s => s.id === studentId);
            const className = studentInfo?.class?.name || '';
            const classId = studentInfo?.class?.id || '';
            const currentTermName = studentInfo?.class?.term || '';

            // ===== GET CURRENT TERM DATA =====
            const currentTermResult = classResults.find(cr => cr.id === studentId);

            // ===== GET CLASS STUDENTS =====
            const classStudents = classResults.filter(cr => {
                const s = students.find(st => st.id === cr.id);
                return s?.class?.id === classId;
            });

            // ===== HELPER: Calculate subject score =====
            const calculateSubjectScore = (subject: any): number => {
                if (assessmentType === 'qa1') return subject.qa1 || 0;
                if (assessmentType === 'qa2') return subject.qa2 || 0;
                if (assessmentType === 'endOfTerm') return subject.endOfTerm || 0;
                const qa1 = subject.qa1 || 0;
                const qa2 = subject.qa2 || 0;
                const endTerm = subject.endOfTerm || 0;
                return (qa1 + qa2 + endTerm) / 3;
            };

            const getAssessmentLabel = (): string => {
                if (assessmentType === 'qa1') return 'Test 1';
                if (assessmentType === 'qa2') return 'Test 2';
                if (assessmentType === 'endOfTerm') return 'End of Term';
                return 'Overall';
            };

            // ===== GET ATTENDANCE =====
            let attendanceRate = 0;
            try {
                const attendanceData = await fetchStudentAttendanceRate(studentId);
                if (attendanceData) {
                    attendanceRate = attendanceData.attendanceRate || 0;
                }
            } catch (error) {
                console.log('No attendance data for student');
            }

            // ===== FETCH ARCHIVED DATA =====
            let archivedData: any[] = [];
            try {
                archivedData = await fetchStudentArchivedResults(studentId);
                console.log('📚 Archived data:', archivedData);
            } catch (error) {
                console.log('No archived data found');
            }

            // ===== GROUP ARCHIVED BY TERM (EXTRACT TERM NAME ONLY) =====
            const termMap = new Map();
            archivedData.forEach(archive => {
                const termName = archive.term?.split(',')[0]?.trim() || archive.term;
                if (!termMap.has(termName)) {
                    termMap.set(termName, archive);
                }
            });
            const uniqueArchives = Array.from(termMap.values());

            // ===== EXTRACT SELECTED TERM NAME (remove year) =====
            const selectedTermName = selectedTermToUse?.split(',')[0]?.trim() || selectedTermToUse;
            const currentTermNameOnly = currentTermName?.split(',')[0]?.trim() || currentTermName;

            console.log('📌 Selected term name:', selectedTermName);
            console.log('📌 Current term name:', currentTermNameOnly);
            console.log('📌 Available archive terms:', uniqueArchives.map(a => a.term?.split(',')[0]?.trim()));

            // ===== DETERMINE IF SELECTED TERM IS CURRENT OR ARCHIVED =====
            const isCurrentTerm = selectedTermName === currentTermNameOnly;
            const archiveForTerm = uniqueArchives.find(a => {
                const termName = a.term?.split(',')[0]?.trim() || a.term;
                return termName === selectedTermName;
            });

            // ===== GET DATA FOR SELECTED TERM =====
            let displayName = studentInfo?.name || 'Unknown';
            let displayExamNumber = studentInfo?.examNumber || 'N/A';
            let displayGrade = className;
            let displayMarks = 0;
            let displayAttendance = 0;
            let displaySubjectBreakdown: any[] = [];
            let displayFails = 0;

            if (isCurrentTerm && currentTermResult) {
                // ===== USE CURRENT TERM DATA =====
                console.log('📊 Using CURRENT term data:', selectedTermToUse);
                displayName = currentTermResult.name || 'Unknown';
                displayExamNumber = currentTermResult.examNumber || 'N/A';
                displayGrade = className;
                displayAttendance = Math.round(attendanceRate);

                let totalScore = 0;
                let subjectCount = 0;
                displaySubjectBreakdown = [];

                const subjectAverages: { [key: string]: { total: number; count: number } } = {};
                classStudents.forEach(cr => {
                    cr.subjects.forEach(subject => {
                        const score = calculateSubjectScore(subject);
                        if (score > 0) {
                            if (!subjectAverages[subject.name]) {
                                subjectAverages[subject.name] = { total: 0, count: 0 };
                            }
                            subjectAverages[subject.name].total += score;
                            subjectAverages[subject.name].count++;
                        }
                    });
                });

                const classAvgs: { [key: string]: number } = {};
                Object.keys(subjectAverages).forEach(subjectName => {
                    classAvgs[subjectName] = subjectAverages[subjectName].count > 0
                        ? Math.round(subjectAverages[subjectName].total / subjectAverages[subjectName].count)
                        : 0;
                });

                currentTermResult.subjects.forEach(subject => {
                    const score = calculateSubjectScore(subject);
                    const subjectName = subject.name || 'Unknown';
                    const classAvg = classAvgs[subjectName] || 0;

                    if (score > 0) {
                        totalScore += score;
                        subjectCount++;
                        displaySubjectBreakdown.push({
                            subject: subjectName,
                            marks: Math.round(score),
                            attendance: displayAttendance,
                            classAvg: classAvg,
                            gap: Math.round(score - classAvg),
                            status: score < (activeConfig?.pass_mark || 50) ? 'Needs support' : 'On track'
                        });
                    }
                });

                displayMarks = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0;
                displayFails = displaySubjectBreakdown.filter(s => s.marks < (activeConfig?.pass_mark || 50)).length;

            } else if (archiveForTerm) {
                // ===== USE ARCHIVED DATA =====
                console.log('📚 Using ARCHIVED data for:', selectedTermToUse);
                const reportData = archiveForTerm.reportCardData;

                if (reportData) {
                    displayName = reportData.name || displayName;
                    displayExamNumber = reportData.examNumber || displayExamNumber;
                    displayGrade = reportData.class || className;

                    let marks = 0;
                    if (assessmentType === 'qa1' && reportData.assessmentStats?.qa1) {
                        marks = reportData.assessmentStats.qa1.termAverage || 0;
                    } else if (assessmentType === 'qa2' && reportData.assessmentStats?.qa2) {
                        marks = reportData.assessmentStats.qa2.termAverage || 0;
                    } else if (assessmentType === 'endOfTerm' && reportData.assessmentStats?.endOfTerm) {
                        marks = reportData.assessmentStats.endOfTerm.termAverage || 0;
                    } else if (reportData.assessmentStats?.overall) {
                        marks = reportData.assessmentStats.overall.termAverage || 0;
                    }

                    displayMarks = Math.round(marks);

                    const att = reportData.attendance?.present && reportData.attendance?.totalSchoolDays
                        ? Math.round((reportData.attendance.present / reportData.attendance.totalSchoolDays) * 100)
                        : 0;
                    displayAttendance = att;

                    displaySubjectBreakdown = [];
                    reportData.subjects?.forEach((subject: any) => {
                        let score = 0;
                        let hasScore = false;

                        if (assessmentType === 'qa1') {
                            score = subject.qa1 || 0;
                            hasScore = subject.qa1 !== null && subject.qa1 !== undefined && subject.qa1 >= 0;
                        } else if (assessmentType === 'qa2') {
                            score = subject.qa2 || 0;
                            hasScore = subject.qa2 !== null && subject.qa2 !== undefined && subject.qa2 >= 0;
                        } else if (assessmentType === 'endOfTerm') {
                            score = subject.endOfTerm || 0;
                            hasScore = subject.endOfTerm !== null && subject.endOfTerm !== undefined && subject.endOfTerm >= 0;
                        } else {
                            const qa1 = subject.qa1 || 0;
                            const qa2 = subject.qa2 || 0;
                            const endTerm = subject.endOfTerm || 0;
                            score = (qa1 + qa2 + endTerm) / 3;
                            hasScore = (subject.qa1 !== null && subject.qa1 >= 0) ||
                                (subject.qa2 !== null && subject.qa2 >= 0) ||
                                (subject.endOfTerm !== null && subject.endOfTerm >= 0);
                        }

                        if (hasScore) {
                            displaySubjectBreakdown.push({
                                subject: subject.name || 'Unknown',
                                marks: Math.round(score),
                                attendance: att,
                                classAvg: 0,
                                gap: 0,
                                status: score < (activeConfig?.pass_mark || 50) ? 'Needs support' : 'On track'
                            });
                        }
                    });

                    const passMark = activeConfig?.pass_mark || 50;
                    displayFails = reportData.subjects?.filter((s: any) => {
                        let score = 0;
                        let hasValidScore = false;

                        if (assessmentType === 'qa1') {
                            score = s.qa1;
                            hasValidScore = s.qa1 !== null && s.qa1 !== undefined && s.qa1 >= 0;
                        } else if (assessmentType === 'qa2') {
                            score = s.qa2;
                            hasValidScore = s.qa2 !== null && s.qa2 !== undefined && s.qa2 >= 0;
                        } else if (assessmentType === 'endOfTerm') {
                            score = s.endOfTerm;
                            hasValidScore = s.endOfTerm !== null && s.endOfTerm !== undefined && s.endOfTerm >= 0;
                        } else {
                            if (s.finalScore !== null && s.finalScore !== undefined) {
                                score = s.finalScore;
                                hasValidScore = s.finalScore >= 0;
                            } else {
                                const qa1 = s.qa1 || 0;
                                const qa2 = s.qa2 || 0;
                                const endTerm = s.endOfTerm || 0;
                                score = (qa1 + qa2 + endTerm) / 3;
                                hasValidScore = (s.qa1 !== null && s.qa1 >= 0) ||
                                    (s.qa2 !== null && s.qa2 >= 0) ||
                                    (s.endOfTerm !== null && s.endOfTerm >= 0);
                            }
                        }

                        if (!hasValidScore) return false;
                        return score < passMark;
                    }).length || 0;
                }
            } else {
                console.log('⚠️ No data found for term:', selectedTermToUse);
            }

            // ===== BUILD TIMELINE AND HISTORICAL (WITH DEDUPLICATION) =====
            const historical: any[] = [];
            const timeline: any[] = [];
            const seenTerms = new Set<string>();

            const termNameOnly = selectedTermToUse?.split(',')[0]?.trim() || selectedTermToUse;

            historical.push({
                term: selectedTermToUse || 'Current',
                attendance: displayAttendance,
                marks: displayMarks,
                cat: 0,
                exam: 0,
                fails: displayFails,
                status: displayMarks >= (activeConfig?.pass_mark || 50) ? 'Passing' : 'Failing'
            });

            timeline.push({
                term: selectedTermToUse || 'Current',
                marks: displayMarks,
                attendance: displayAttendance
            });

            seenTerms.add(termNameOnly);

            uniqueArchives.forEach(archive => {
                const archiveTermName = archive.term?.split(',')[0]?.trim() || archive.term;
                if (seenTerms.has(archiveTermName)) return;
                seenTerms.add(archiveTermName);

                const reportData = archive.reportCardData;
                if (!reportData) return;

                let marks = 0;
                if (assessmentType === 'qa1' && reportData.assessmentStats?.qa1) {
                    marks = reportData.assessmentStats.qa1.termAverage || 0;
                } else if (assessmentType === 'qa2' && reportData.assessmentStats?.qa2) {
                    marks = reportData.assessmentStats.qa2.termAverage || 0;
                } else if (assessmentType === 'endOfTerm' && reportData.assessmentStats?.endOfTerm) {
                    marks = reportData.assessmentStats.endOfTerm.termAverage || 0;
                } else if (reportData.assessmentStats?.overall) {
                    marks = reportData.assessmentStats.overall.termAverage || 0;
                }

                const att = reportData.attendance?.present && reportData.attendance?.totalSchoolDays
                    ? Math.round((reportData.attendance.present / reportData.attendance.totalSchoolDays) * 100)
                    : 0;
                const passMark = activeConfig?.pass_mark || 50;
                const fails = reportData.subjects?.filter((s: any) => {
                    let score = 0;
                    let hasValidScore = false;

                    if (assessmentType === 'qa1') {
                        score = s.qa1;
                        hasValidScore = s.qa1 !== null && s.qa1 !== undefined && s.qa1 >= 0;
                    } else if (assessmentType === 'qa2') {
                        score = s.qa2;
                        hasValidScore = s.qa2 !== null && s.qa2 !== undefined && s.qa2 >= 0;
                    } else if (assessmentType === 'endOfTerm') {
                        score = s.endOfTerm;
                        hasValidScore = s.endOfTerm !== null && s.endOfTerm !== undefined && s.endOfTerm >= 0;
                    } else {
                        if (s.finalScore !== null && s.finalScore !== undefined) {
                            score = s.finalScore;
                            hasValidScore = s.finalScore >= 0;
                        } else {
                            const qa1 = s.qa1 || 0;
                            const qa2 = s.qa2 || 0;
                            const endTerm = s.endOfTerm || 0;
                            score = (qa1 + qa2 + endTerm) / 3;
                            hasValidScore = (s.qa1 !== null && s.qa1 >= 0) ||
                                (s.qa2 !== null && s.qa2 >= 0) ||
                                (s.endOfTerm !== null && s.endOfTerm >= 0);
                        }
                    }

                    if (!hasValidScore) return false;
                    return score < passMark;
                }).length || 0;

                const fullTerm = archive.academicYear ? `${archive.term}, ${archive.academicYear}` : archive.term;

                historical.push({
                    term: fullTerm,
                    attendance: att,
                    marks: Math.round(marks),
                    cat: 0,
                    exam: 0,
                    fails: fails,
                    status: marks >= (activeConfig?.pass_mark || 50) ? 'Passing' : 'Failing'
                });

                timeline.push({
                    term: fullTerm,
                    marks: Math.round(marks),
                    attendance: att
                });
            });

            const sortByTerm = (a: any, b: any) => {
                const aNum = parseInt(a.term?.match(/\d+/)?.[0] || '0');
                const bNum = parseInt(b.term?.match(/\d+/)?.[0] || '0');
                return aNum - bNum;
            };

            historical.sort(sortByTerm);
            timeline.sort(sortByTerm);

            // let termOverTerm = 0;
            // if (historical.length >= 2) {
            //     termOverTerm = historical[0].marks - historical[1].marks;
            // }
            let termOverTerm = 0;
            if (historical.length >= 2) {
                // Get the last two terms (most recent and previous)
                const currentIndex = historical.length - 1;
                const previousIndex = historical.length - 2;
                termOverTerm = historical[currentIndex].marks - historical[previousIndex].marks;
            }

            // ===== CALCULATE CLASS RANK =====

            const calculateStudentRank = (studentId: string): string => {
                const studentsWithScores = classResults.map(student => {
                    let totalScore = 0;
                    let subjectCount = 0;

                    student.subjects.forEach(subject => {
                        let score = 0;
                        let hasScore = false;

                        if (assessmentType === 'qa1') {
                            if (subject.qa1 !== null && subject.qa1 !== undefined && subject.qa1 >= 0) {
                                score = subject.qa1;
                                hasScore = true;
                            }
                        } else if (assessmentType === 'qa2') {
                            if (subject.qa2 !== null && subject.qa2 !== undefined && subject.qa2 >= 0) {
                                score = subject.qa2;
                                hasScore = true;
                            }
                        } else if (assessmentType === 'endOfTerm') {
                            if (subject.endOfTerm !== null && subject.endOfTerm !== undefined && subject.endOfTerm >= 0) {
                                score = subject.endOfTerm;
                                hasScore = true;
                            }
                        } else {
                            const qa1 = subject.qa1 || 0;
                            const qa2 = subject.qa2 || 0;
                            const endTerm = subject.endOfTerm || 0;
                            if (subject.qa1 !== null || subject.qa2 !== null || subject.endOfTerm !== null) {
                                score = (qa1 + qa2 + endTerm) / 3;
                                hasScore = true;
                            }
                        }

                        if (hasScore) {
                            totalScore += score;
                            subjectCount++;
                        }
                    });

                    const avgScore = subjectCount > 0 ? totalScore / subjectCount : 0;

                    return {
                        studentId: student.id,
                        totalScore: avgScore
                    };
                });

                const rankedStudents = studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);

                let currentRank = 1;
                let previousScore: number | null = null;
                let studentRank = 0;

                for (let i = 0; i < rankedStudents.length; i++) {
                    const student = rankedStudents[i];

                    if (i === 0) {
                        currentRank = 1;
                    } else if (previousScore !== null && Math.abs(student.totalScore - previousScore) > 0.01) {
                        currentRank++;
                    }

                    if (student.studentId === studentId) {
                        studentRank = currentRank;
                        break;
                    }

                    previousScore = student.totalScore;
                }

                return studentRank > 0 ? studentRank.toString() : 'N/A';
            };

            // ===== GET RANK FROM ARCHIVED CLASS RESULTS (SINGLE SOURCE OF TRUTH) =====
            let classRank = 'N/A';

            if (isCurrentTerm) {
                classRank = calculateStudentRank(studentId);
            } else if (archiveForTerm) {
                // ===== ADD THESE THREE LINES HERE =====
                console.log('🔍 Searching for archive with:', {
                    classId: archiveForTerm.classId,
                    term: selectedTermToUse,
                    academicYear: archiveForTerm.academicYear
                });
                console.log('📦 archivedResults prop:', archivedResults);
                // ===== END ADD =====
                try {
                    let archive = null;

                    // First check props
                    // Get archive directly from API
                    if (!archive) {
                        const results = await fetchArchivedResults(
                            archiveForTerm.classId,
                            selectedTermToUse,
                            archiveForTerm.academicYear
                        );
                        if (results && results.length > 0) {
                            archive = results[0];
                        }
                    }
                    // If not in props, fetch from API
                    // if (!archive) {
                    //     const results = await fetchArchivedResults(
                    //         archiveForTerm.classId,
                    //         selectedTermToUse,
                    //         archiveForTerm.academicYear
                    //     );
                    //     if (results && results.length > 0) {
                    //         archive = results[0];
                    //     }
                    // }
                    if (!archive) {
                        // Use the archived term name (e.g., "Term 2") not the full string
                        const archivedTermName = archiveForTerm.term?.split(',')[0]?.trim() || archiveForTerm.term;
                        const results = await fetchArchivedResults(
                            archiveForTerm.classId,
                            archivedTermName,
                            archiveForTerm.academicYear
                        );
                        if (results && results.length > 0) {
                            archive = results[0];
                        }
                    }
                    // Get rank from the archive
                    if (archive) {
                        let results = [];
                        if (assessmentType === 'qa1') results = archive.results?.qa1 || [];
                        else if (assessmentType === 'qa2') results = archive.results?.qa2 || [];
                        else if (assessmentType === 'endOfTerm') results = archive.results?.endOfTerm || [];
                        else results = archive.results?.overall || [];

                        const studentData = results.find((s: any) => s.id === studentId);
                        if (studentData && studentData.rank) {
                            classRank = studentData.rank.toString();
                        }
                    }
                } catch (error) {
                    console.error('Failed to get archived rank:', error);
                }
            }

            // ===== BUILD STUDENT DETAIL =====
            const studentDetail: StudentDetail = {
                id: studentId,
                name: displayName,
                examNumber: displayExamNumber,
                grade: displayGrade,
                classTeacher: (() => {
                    const classObj = classes.find(c => c.id === studentInfo?.class?.id);
                    return classObj?.classTeacher?.name || 'Not Assigned';
                })(),
                status: displayMarks < 35 ? 'At-Risk (Critical)' :
                    displayMarks < 45 ? 'At-Risk (High)' :
                        displayMarks < 55 ? 'At-Risk (Medium)' : 'On Track',
                currentMarks: displayMarks,
                currentAttendance: displayAttendance,
                termOverTerm: termOverTerm,
                classRank: classRank,
                timeline: timeline,
                factorBreakdown: [
                    {
                        factor: `Academic Performance (${getAssessmentLabel()})`,
                        studentValue: `${displayMarks}%`,
                        classAvg: '0%',
                        status: displayMarks < (activeConfig?.pass_mark || 50) ? 'Below Average' : 'On Track',
                        impact: 'High'
                    },
                    {
                        factor: 'Attendance',
                        studentValue: `${displayAttendance}%`,
                        classAvg: '0%',
                        status: displayAttendance < 75 ? 'Below Average' : 'On Track',
                        impact: 'Medium'
                    }
                ],
                subjectBreakdown: displaySubjectBreakdown,
                historical: historical,
                recommendations: [
                    ...(displayMarks < (activeConfig?.pass_mark || 50) ? [`Provide additional academic support and tutoring (${getAssessmentLabel()} marks below passing)`] : []),
                    ...(displayAttendance < 75 ? ['Monitor attendance and follow up with parents'] : []),
                    ...(displayMarks < 40 ? ['Schedule parent-teacher meeting to discuss progress'] : []),
                    ...(displayMarks >= (activeConfig?.pass_mark || 50) && displayAttendance >= 75 ? ['Student is performing well. Continue current support.'] : [])
                ]
            };

            setSelectedStudent(studentDetail);
        } catch (error: any) {
            console.error('Failed to load student details:', error);
            showMessage(error.message || 'Failed to load student details', true);
        } finally {
            setLoadingStudent(false);
        }
    };



    // const loadStudentDetail = async (studentId: string, term?: string) => {
    //     setLoadingStudent(true);
    //     const selectedTermToUse = term || selectedTerm;

    //     try {
    //         // ===== GET STUDENT INFO =====
    //         const studentInfo = students.find(s => s.id === studentId);
    //         const className = studentInfo?.class?.name || '';
    //         const classId = studentInfo?.class?.id || '';
    //         const currentTermName = studentInfo?.class?.term || '';

    //         // ===== GET CURRENT TERM DATA =====
    //         const currentTermResult = classResults.find(cr => cr.id === studentId);

    //         // ===== GET CLASS STUDENTS =====
    //         const classStudents = classResults.filter(cr => {
    //             const s = students.find(st => st.id === cr.id);
    //             return s?.class?.id === classId;
    //         });

    //         // ===== HELPER: Calculate subject score =====
    //         const calculateSubjectScore = (subject: any): number => {
    //             if (assessmentType === 'qa1') return subject.qa1 || 0;
    //             if (assessmentType === 'qa2') return subject.qa2 || 0;
    //             if (assessmentType === 'endOfTerm') return subject.endOfTerm || 0;
    //             const qa1 = subject.qa1 || 0;
    //             const qa2 = subject.qa2 || 0;
    //             const endTerm = subject.endOfTerm || 0;
    //             return (qa1 + qa2 + endTerm) / 3;
    //         };

    //         const getAssessmentLabel = (): string => {
    //             if (assessmentType === 'qa1') return 'Test 1';
    //             if (assessmentType === 'qa2') return 'Test 2';
    //             if (assessmentType === 'endOfTerm') return 'End of Term';
    //             return 'Overall';
    //         };

    //         // ===== FETCH ARCHIVED DATA =====
    //         let archivedData: any[] = [];
    //         try {
    //             archivedData = await fetchStudentArchivedResults(studentId);
    //             console.log('📚 Archived data:', archivedData);
    //         } catch (error) {
    //             console.log('No archived data found');
    //         }

    //         // ===== GROUP ARCHIVED BY TERM (EXTRACT TERM NAME ONLY) =====
    //         const termMap = new Map();
    //         archivedData.forEach(archive => {
    //             // Extract just the term name (e.g., "Term 2" from "Term 2, 2025/2026")
    //             const termName = archive.term?.split(',')[0]?.trim() || archive.term;
    //             if (!termMap.has(termName)) {
    //                 termMap.set(termName, archive);
    //             }
    //         });
    //         const uniqueArchives = Array.from(termMap.values());

    //         // ===== EXTRACT SELECTED TERM NAME (remove year) =====
    //         const selectedTermName = selectedTermToUse?.split(',')[0]?.trim() || selectedTermToUse;
    //         const currentTermNameOnly = currentTermName?.split(',')[0]?.trim() || currentTermName;

    //         console.log('📌 Selected term name:', selectedTermName);
    //         console.log('📌 Current term name:', currentTermNameOnly);
    //         console.log('📌 Available archive terms:', uniqueArchives.map(a => a.term?.split(',')[0]?.trim()));

    //         // ===== DETERMINE IF SELECTED TERM IS CURRENT OR ARCHIVED =====
    //         const isCurrentTerm = selectedTermName === currentTermNameOnly;
    //         const archiveForTerm = uniqueArchives.find(a => {
    //             const termName = a.term?.split(',')[0]?.trim() || a.term;
    //             return termName === selectedTermName;
    //         });

    //         // ===== GET DATA FOR SELECTED TERM =====
    //         let displayName = studentInfo?.name || 'Unknown';
    //         let displayExamNumber = studentInfo?.examNumber || 'N/A';
    //         let displayGrade = className;
    //         let displayMarks = 0;
    //         let displayAttendance = 0;
    //         let displaySubjectBreakdown: any[] = [];
    //         let displayFails = 0;

    //         if (isCurrentTerm && currentTermResult) {
    //             // ===== USE CURRENT TERM DATA =====
    //             console.log('📊 Using CURRENT term data:', selectedTermToUse);
    //             displayName = currentTermResult.name || 'Unknown';
    //             displayExamNumber = currentTermResult.examNumber || 'N/A';
    //             displayGrade = className;

    //             // Get attendance
    //             try {
    //                 const attData = await fetchStudentAttendanceRate(studentId);
    //                 if (attData) {
    //                     displayAttendance = Math.round(attData.attendanceRate || 0);
    //                 }
    //             } catch (e) { }

    //             // Calculate marks
    //             let totalScore = 0;
    //             let subjectCount = 0;
    //             displaySubjectBreakdown = [];

    //             // Calculate class averages
    //             const subjectAverages: { [key: string]: { total: number; count: number } } = {};
    //             classStudents.forEach(cr => {
    //                 cr.subjects.forEach(subject => {
    //                     const score = calculateSubjectScore(subject);
    //                     if (score > 0) {
    //                         if (!subjectAverages[subject.name]) {
    //                             subjectAverages[subject.name] = { total: 0, count: 0 };
    //                         }
    //                         subjectAverages[subject.name].total += score;
    //                         subjectAverages[subject.name].count++;
    //                     }
    //                 });
    //             });

    //             const classAvgs: { [key: string]: number } = {};
    //             Object.keys(subjectAverages).forEach(subjectName => {
    //                 classAvgs[subjectName] = subjectAverages[subjectName].count > 0
    //                     ? Math.round(subjectAverages[subjectName].total / subjectAverages[subjectName].count)
    //                     : 0;
    //             });

    //             currentTermResult.subjects.forEach(subject => {
    //                 const score = calculateSubjectScore(subject);
    //                 const subjectName = subject.name || 'Unknown';
    //                 const classAvg = classAvgs[subjectName] || 0;

    //                 if (score > 0) {
    //                     totalScore += score;
    //                     subjectCount++;
    //                     displaySubjectBreakdown.push({
    //                         subject: subjectName,
    //                         marks: Math.round(score),
    //                         attendance: displayAttendance,
    //                         classAvg: classAvg,
    //                         gap: Math.round(score - classAvg),
    //                         status: score < 50 ? 'Needs support' : 'On track'
    //                     });
    //                 }
    //             });

    //             displayMarks = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0;
    //             displayFails = displaySubjectBreakdown.filter(s => s.marks < 50).length;

    //         } else if (archiveForTerm) {
    //             // ===== USE ARCHIVED DATA =====
    //             console.log('📚 Using ARCHIVED data for:', selectedTermToUse);
    //             const reportData = archiveForTerm.reportCardData;

    //             if (reportData) {
    //                 displayName = reportData.name || displayName;
    //                 displayExamNumber = reportData.examNumber || displayExamNumber;
    //                 displayGrade = reportData.class || className;

    //                 // Get marks based on assessment type
    //                 let marks = 0;
    //                 if (assessmentType === 'qa1' && reportData.assessmentStats?.qa1) {
    //                     marks = reportData.assessmentStats.qa1.termAverage || 0;
    //                 } else if (assessmentType === 'qa2' && reportData.assessmentStats?.qa2) {
    //                     marks = reportData.assessmentStats.qa2.termAverage || 0;
    //                 } else if (assessmentType === 'endOfTerm' && reportData.assessmentStats?.endOfTerm) {
    //                     marks = reportData.assessmentStats.endOfTerm.termAverage || 0;
    //                 } else if (reportData.assessmentStats?.overall) {
    //                     marks = reportData.assessmentStats.overall.termAverage || 0;
    //                 }

    //                 displayMarks = Math.round(marks);

    //                 // Get attendance
    //                 const att = reportData.attendance?.present && reportData.attendance?.totalSchoolDays
    //                     ? Math.round((reportData.attendance.present / reportData.attendance.totalSchoolDays) * 100)
    //                     : 0;
    //                 displayAttendance = att;

    //                 // Build subject breakdown
    //                 displaySubjectBreakdown = [];
    //                 reportData.subjects?.forEach((subject: any) => {
    //                     let score = 0;
    //                     if (assessmentType === 'qa1') score = subject.qa1 || 0;
    //                     else if (assessmentType === 'qa2') score = subject.qa2 || 0;
    //                     else if (assessmentType === 'endOfTerm') score = subject.endOfTerm || 0;
    //                     else {
    //                         const qa1 = subject.qa1 || 0;
    //                         const qa2 = subject.qa2 || 0;
    //                         const endTerm = subject.endOfTerm || 0;
    //                         score = (qa1 + qa2 + endTerm) / 3;
    //                     }

    //                     if (score > 0) {
    //                         displaySubjectBreakdown.push({
    //                             subject: subject.name || 'Unknown',
    //                             marks: Math.round(score),
    //                             attendance: att,
    //                             classAvg: 0,
    //                             gap: 0,
    //                             status: score < 50 ? 'Needs support' : 'On track'
    //                         });
    //                     }
    //                 });

    //                 displayFails = displaySubjectBreakdown.filter(s => s.marks < 50).length;
    //                 if (displaySubjectBreakdown.length === 0 && reportData.subjects) {
    //                     displayFails = reportData.subjects.filter((s: any) => s.grade === 'F' || s.grade === '9').length || 0;
    //                 }
    //             }
    //         } else {
    //             console.log('⚠️ No data found for term:', selectedTermToUse);
    //         }

    //         // ===== BUILD TIMELINE AND HISTORICAL =====
    //         const historical: any[] = [];
    //         const timeline: any[] = [];
    //         const seenTerms = new Set<string>();

    //         // Add selected term
    //         historical.push({
    //             term: selectedTermToUse || 'Current',
    //             attendance: displayAttendance,
    //             marks: displayMarks,
    //             cat: 0,
    //             exam: 0,
    //             fails: displayFails,
    //             status: displayMarks >= 50 ? 'Passing' : 'Failing'
    //         });

    //         timeline.push({
    //             term: selectedTermToUse || 'Current',
    //             marks: displayMarks,
    //             attendance: displayAttendance
    //         });

    //         seenTerms.add(selectedTermToUse || 'Current');

    //         // Add other archived terms
    //         uniqueArchives.forEach(archive => {
    //             const termName = archive.term?.split(',')[0]?.trim() || archive.term;
    //             if (seenTerms.has(termName)) return;
    //             seenTerms.add(termName);

    //             const reportData = archive.reportCardData;
    //             if (!reportData) return;

    //             let marks = 0;
    //             if (assessmentType === 'qa1' && reportData.assessmentStats?.qa1) {
    //                 marks = reportData.assessmentStats.qa1.termAverage || 0;
    //             } else if (assessmentType === 'qa2' && reportData.assessmentStats?.qa2) {
    //                 marks = reportData.assessmentStats.qa2.termAverage || 0;
    //             } else if (assessmentType === 'endOfTerm' && reportData.assessmentStats?.endOfTerm) {
    //                 marks = reportData.assessmentStats.endOfTerm.termAverage || 0;
    //             } else if (reportData.assessmentStats?.overall) {
    //                 marks = reportData.assessmentStats.overall.termAverage || 0;
    //             }

    //             const att = reportData.attendance?.present && reportData.attendance?.totalSchoolDays
    //                 ? Math.round((reportData.attendance.present / reportData.attendance.totalSchoolDays) * 100)
    //                 : 0;

    //             const fails = reportData.subjects?.filter((s: any) => s.grade === 'F' || s.grade === '9' || s.grade === 'AB').length || 0;

    //             historical.push({
    //                 term: archive.term,
    //                 attendance: att,
    //                 marks: Math.round(marks),
    //                 cat: 0,
    //                 exam: 0,
    //                 fails: fails,
    //                 status: marks >= 50 ? 'Passing' : 'Failing'
    //             });

    //             timeline.push({
    //                 term: archive.term,
    //                 marks: Math.round(marks),
    //                 attendance: att
    //             });
    //         });

    //         // Sort
    //         const sortByTerm = (a: any, b: any) => {
    //             const aNum = parseInt(a.term?.match(/\d+/)?.[0] || '0');
    //             const bNum = parseInt(b.term?.match(/\d+/)?.[0] || '0');
    //             return aNum - bNum;
    //         };

    //         historical.sort(sortByTerm);
    //         timeline.sort(sortByTerm);

    //         // Calculate term-over-term
    //         let termOverTerm = 0;
    //         if (historical.length >= 2) {
    //             termOverTerm = historical[0].marks - historical[1].marks;
    //         }

    //         // ===== BUILD STUDENT DETAIL =====
    //         const studentDetail: StudentDetail = {
    //             id: studentId,
    //             name: displayName,
    //             examNumber: displayExamNumber,
    //             grade: displayGrade,
    //             classTeacher: 'Not Assigned',
    //             status: displayMarks < 35 ? 'At-Risk (Critical)' :
    //                 displayMarks < 45 ? 'At-Risk (High)' :
    //                     displayMarks < 55 ? 'At-Risk (Medium)' : 'On Track',
    //             currentMarks: displayMarks,
    //             currentAttendance: displayAttendance,
    //             termOverTerm: termOverTerm,
    //             classRank: 'N/A',
    //             timeline: timeline,
    //             factorBreakdown: [
    //                 {
    //                     factor: `Academic Performance (${getAssessmentLabel()})`,
    //                     studentValue: `${displayMarks}%`,
    //                     classAvg: '0%',
    //                     status: displayMarks < 50 ? 'Below Average' : 'On Track',
    //                     impact: 'High'
    //                 },
    //                 {
    //                     factor: 'Attendance',
    //                     studentValue: `${displayAttendance}%`,
    //                     classAvg: '0%',
    //                     status: displayAttendance < 75 ? 'Below Average' : 'On Track',
    //                     impact: 'Medium'
    //                 }
    //             ],
    //             subjectBreakdown: displaySubjectBreakdown,
    //             historical: historical,
    //             recommendations: [
    //                 ...(displayMarks < 50 ? [`Provide additional academic support and tutoring (${getAssessmentLabel()} marks below passing)`] : []),
    //                 ...(displayAttendance < 75 ? ['Monitor attendance and follow up with parents'] : []),
    //                 ...(displayMarks < 40 ? ['Schedule parent-teacher meeting to discuss progress'] : []),
    //                 ...(displayMarks >= 50 && displayAttendance >= 75 ? ['Student is performing well. Continue current support.'] : [])
    //             ]
    //         };

    //         setSelectedStudent(studentDetail);
    //     } catch (error: any) {
    //         console.error('Failed to load student details:', error);
    //         showMessage(error.message || 'Failed to load student details', true);
    //     } finally {
    //         setLoadingStudent(false);
    //     }
    // };


    // const loadStudentDetail = async (studentId: string, term?: string) => {
    //     setLoadingStudent(true);
    //     const selectedTermToUse = term || selectedTerm;

    //     try {
    //         // Find student in classResults
    //         const studentResult = classResults.find(cr => cr.id === studentId);

    //         if (!studentResult) {
    //             showMessage('Student results not found', true);
    //             setLoadingStudent(false);
    //             return;
    //         }

    //         // Get the student's class name from the students array
    //         const studentInfo = students.find(s => s.id === studentId);
    //         const className = studentInfo?.class?.name || '';
    //         const classId = studentInfo?.class?.id || '';

    //         // Get all students in the same class to calculate class averages
    //         const classStudents = classResults.filter(cr => {
    //             const s = students.find(st => st.id === cr.id);
    //             return s?.class?.id === classId;
    //         });

    //         // Get attendance data
    //         let attendanceRate = 0;
    //         try {
    //             const attendanceData = await fetchStudentAttendanceRate(studentId);
    //             if (attendanceData) {
    //                 attendanceRate = attendanceData.attendanceRate || 0;
    //             }
    //         } catch (error) {
    //             console.log('No attendance data for student');
    //         }

    //         // Helper: Calculate subject score based on assessment type
    //         const calculateSubjectScore = (subject: any): number => {
    //             if (assessmentType === 'qa1') return subject.qa1 || 0;
    //             if (assessmentType === 'qa2') return subject.qa2 || 0;
    //             if (assessmentType === 'endOfTerm') return subject.endOfTerm || 0;
    //             // Overall
    //             const qa1 = subject.qa1 || 0;
    //             const qa2 = subject.qa2 || 0;
    //             const endTerm = subject.endOfTerm || 0;
    //             return (qa1 + qa2 + endTerm) / 3;
    //         };

    //         // Helper: Get assessment label
    //         const getAssessmentLabel = (): string => {
    //             if (assessmentType === 'qa1') return 'Test 1';
    //             if (assessmentType === 'qa2') return 'Test 2';
    //             if (assessmentType === 'endOfTerm') return 'End of Term';
    //             return 'Overall';
    //         };

    //         // Calculate subject scores and class averages
    //         let totalScore = 0;
    //         let subjectCount = 0;
    //         const subjectBreakdown: any[] = [];
    //         const subjectAverages: { [key: string]: { total: number; count: number } } = {};

    //         // First pass: collect all subject scores for class average calculation
    //         classStudents.forEach(cr => {
    //             cr.subjects.forEach(subject => {
    //                 const score = calculateSubjectScore(subject);
    //                 if (score > 0) {
    //                     if (!subjectAverages[subject.name]) {
    //                         subjectAverages[subject.name] = { total: 0, count: 0 };
    //                     }
    //                     subjectAverages[subject.name].total += score;
    //                     subjectAverages[subject.name].count++;
    //                 }
    //             });
    //         });

    //         // Calculate class averages
    //         const classAvgs: { [key: string]: number } = {};
    //         Object.keys(subjectAverages).forEach(subjectName => {
    //             classAvgs[subjectName] = subjectAverages[subjectName].count > 0
    //                 ? Math.round(subjectAverages[subjectName].total / subjectAverages[subjectName].count)
    //                 : 0;
    //         });

    //         // Second pass: build student's subject breakdown
    //         studentResult.subjects.forEach(subject => {
    //             const score = calculateSubjectScore(subject);
    //             const subjectName = subject.name || 'Unknown';
    //             const classAvg = classAvgs[subjectName] || 0;

    //             if (score > 0) {
    //                 totalScore += score;
    //                 subjectCount++;

    //                 subjectBreakdown.push({
    //                     subject: subjectName,
    //                     marks: Math.round(score),
    //                     attendance: Math.round(attendanceRate),
    //                     classAvg: classAvg,
    //                     gap: Math.round(classAvg - score),
    //                     status: score < 50 ? 'Needs support' : 'On track'
    //                 });
    //             }
    //         });

    //         const averageMarks = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0;

    //         // Build historical data from all terms (archive)
    //         // This would come from API - for now use current term
    //         const historical = [];

    //         // Add current term
    //         historical.push({
    //             term: selectedTermToUse || 'Current',
    //             attendance: Math.round(attendanceRate),
    //             marks: averageMarks,
    //             cat: assessmentType === 'qa1' || assessmentType === 'qa2' ? averageMarks : Math.round(averageMarks * 0.6),
    //             exam: assessmentType === 'endOfTerm' ? averageMarks : Math.round(averageMarks * 0.4),
    //             fails: subjectBreakdown.filter(s => s.marks < 50).length,
    //             status: averageMarks < 50 ? 'Failing' : 'Passing'
    //         });

    //         // Build timeline
    //         const timeline = historical.map(record => ({
    //             term: record.term,
    //             marks: record.marks,
    //             attendance: record.attendance
    //         }));

    //         // Calculate term-over-term change
    //         const termOverTerm = historical.length > 1
    //             ? historical[0].marks - historical[1].marks
    //             : 0;

    //         // Build student detail
    //         const studentDetail: StudentDetail = {
    //             id: studentId,
    //             name: studentResult.name || 'Unknown',
    //             examNumber: studentResult.examNumber || 'N/A',
    //             grade: className,
    //             classTeacher: 'Not Assigned',
    //             status: averageMarks < 35 ? 'At-Risk (Critical)' :
    //                 averageMarks < 45 ? 'At-Risk (High)' :
    //                     averageMarks < 55 ? 'At-Risk (Medium)' : 'On Track',
    //             currentMarks: averageMarks,
    //             currentAttendance: Math.round(attendanceRate),
    //             termOverTerm: termOverTerm,
    //             classRank: 'N/A',
    //             timeline: timeline,
    //             factorBreakdown: [
    //                 {
    //                     factor: `Academic Performance (${getAssessmentLabel()})`,
    //                     studentValue: `${averageMarks}%`,
    //                     classAvg: `${Math.round(classStudents.reduce((acc, cr) => {
    //                         let total = 0, count = 0;
    //                         cr.subjects.forEach(s => {
    //                             const score = calculateSubjectScore(s);
    //                             if (score > 0) { total += score; count++; }
    //                         });
    //                         return acc + (count > 0 ? total / count : 0);
    //                     }, 0) / (classStudents.length || 1))}%`,
    //                     status: averageMarks < 50 ? 'Below Average' : 'On Track',
    //                     impact: 'High'
    //                 },
    //                 {
    //                     factor: 'Attendance',
    //                     studentValue: `${Math.round(attendanceRate)}%`,
    //                     classAvg: '0%',
    //                     status: attendanceRate < 75 ? 'Below Average' : 'On Track',
    //                     impact: 'Medium'
    //                 }
    //             ],
    //             subjectBreakdown: subjectBreakdown,
    //             historical: historical,
    //             recommendations: [
    //                 ...(averageMarks < 50 ? [`Provide additional academic support and tutoring (${getAssessmentLabel()} marks below passing)`] : []),
    //                 ...(attendanceRate < 75 ? ['Monitor attendance and follow up with parents'] : []),
    //                 ...(averageMarks < 40 ? ['Schedule parent-teacher meeting to discuss progress'] : []),
    //                 ...(averageMarks >= 50 && attendanceRate >= 75 ? ['Student is performing well. Continue current support.'] : [])
    //             ]
    //         };

    //         setSelectedStudent(studentDetail);
    //     } catch (error: any) {
    //         console.error('Failed to load student details:', error);
    //         showMessage(error.message || 'Failed to load student details', true);
    //     } finally {
    //         setLoadingStudent(false);
    //     }
    // };
    // const loadStudentDetail = async (studentId: string, term?: string) => {
    //     setLoadingStudent(true);
    //     const selectedTermToUse = term || selectedTerm;

    //     try {
    //         // Find student in classResults
    //         const studentResult = classResults.find(cr => cr.id === studentId);

    //         if (!studentResult) {
    //             showMessage('Student results not found', true);
    //             setLoadingStudent(false);
    //             return;
    //         }

    //         // Get the student's class name from the students array
    //         const studentInfo = students.find(s => s.id === studentId);
    //         const className = studentInfo?.class?.name || '';
    //         const classId = studentInfo?.class?.id || '';

    //         // Get all students in the same class to calculate class averages
    //         const classStudents = classResults.filter(cr => {
    //             const s = students.find(st => st.id === cr.id);
    //             return s?.class?.id === classId;
    //         });

    //         // Get attendance data
    //         let attendanceRate = 0;
    //         try {
    //             const attendanceData = await fetchStudentAttendanceRate(studentId);
    //             if (attendanceData) {
    //                 attendanceRate = attendanceData.attendanceRate || 0;
    //             }
    //         } catch (error) {
    //             console.log('No attendance data for student');
    //         }

    //         // Calculate marks per subject and class averages
    //         let totalScore = 0;
    //         let subjectCount = 0;
    //         const subjectBreakdown: any[] = [];
    //         const subjectAverages: { [key: string]: { total: number; count: number } } = {};

    //         // First pass: collect all subject scores for class average calculation
    //         classStudents.forEach(cr => {
    //             cr.subjects.forEach(subject => {
    //                 const score = calculateSubjectScore(subject);
    //                 if (score > 0) {
    //                     if (!subjectAverages[subject.name]) {
    //                         subjectAverages[subject.name] = { total: 0, count: 0 };
    //                     }
    //                     subjectAverages[subject.name].total += score;
    //                     subjectAverages[subject.name].count++;
    //                 }
    //             });
    //         });

    //         // Calculate class averages
    //         const classAvgs: { [key: string]: number } = {};
    //         Object.keys(subjectAverages).forEach(subjectName => {
    //             classAvgs[subjectName] = subjectAverages[subjectName].count > 0
    //                 ? Math.round(subjectAverages[subjectName].total / subjectAverages[subjectName].count)
    //                 : 0;
    //         });

    //         // Second pass: build student's subject breakdown
    //         studentResult.subjects.forEach(subject => {
    //             const score = calculateSubjectScore(subject);
    //             const subjectName = subject.name || 'Unknown';
    //             const classAvg = classAvgs[subjectName] || 0;

    //             if (score > 0) {
    //                 totalScore += score;
    //                 subjectCount++;

    //                 subjectBreakdown.push({
    //                     subject: subjectName,
    //                     marks: Math.round(score),
    //                     attendance: attendanceRate,
    //                     classAvg: classAvg,
    //                     gap: Math.round(classAvg - score),
    //                     status: score < 50 ? 'Needs support' : 'On track'
    //                 });
    //             }
    //         });

    //         const averageMarks = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0;

    //         // Helper function to calculate subject score
    //         function calculateSubjectScore(subject: any): number {
    //             if (assessmentType === 'qa1') return subject.qa1 || 0;
    //             if (assessmentType === 'qa2') return subject.qa2 || 0;
    //             if (assessmentType === 'endOfTerm') return subject.endOfTerm || 0;
    //             const qa1 = subject.qa1 || 0;
    //             const qa2 = subject.qa2 || 0;
    //             const endTerm = subject.endOfTerm || 0;
    //             return (qa1 + qa2 + endTerm) / 3;
    //         }

    //         // Build historical data from all terms (if available)
    //         // For now, we'll use the current term data
    //         const historical = [];

    //         // Add current term as historical data
    //         historical.push({
    //             term: selectedTermToUse || 'Current',
    //             attendance: Math.round(attendanceRate),
    //             marks: averageMarks,
    //             cat: assessmentType === 'qa1' || assessmentType === 'qa2' ? averageMarks : Math.round(averageMarks * 0.6),
    //             exam: assessmentType === 'endOfTerm' ? averageMarks : Math.round(averageMarks * 0.4),
    //             fails: subjectBreakdown.filter(s => s.marks < 50).length,
    //             status: averageMarks < 50 ? 'Failing' : 'Passing'
    //         });

    //         // Build timeline from historical data
    //         const timeline = historical.map(record => ({
    //             term: record.term,
    //             marks: record.marks,
    //             attendance: record.attendance
    //         }));

    //         // Calculate term-over-term change
    //         const termOverTerm = historical.length > 1
    //             ? historical[0].marks - historical[1].marks
    //             : 0;

    //         // Build student detail
    //         const studentDetail: StudentDetail = {
    //             id: studentId,
    //             name: studentResult.name || 'Unknown',
    //             examNumber: studentResult.examNumber || 'N/A',
    //             grade: className,
    //             classTeacher: 'Not Assigned',
    //             status: averageMarks < 35 ? 'At-Risk (Critical)' :
    //                 averageMarks < 45 ? 'At-Risk (High)' :
    //                     averageMarks < 55 ? 'At-Risk (Medium)' : 'On Track',
    //             currentMarks: averageMarks,
    //             currentAttendance: Math.round(attendanceRate),
    //             termOverTerm: termOverTerm,
    //             classRank: 'N/A',
    //             timeline: timeline,
    //             factorBreakdown: [
    //                 {
    //                     factor: 'Academic Performance',
    //                     studentValue: `${averageMarks}%`,
    //                     classAvg: `${Math.round(classStudents.reduce((acc, cr) => {
    //                         let total = 0, count = 0;
    //                         cr.subjects.forEach(s => {
    //                             const score = calculateSubjectScore(s);
    //                             if (score > 0) { total += score; count++; }
    //                         });
    //                         return acc + (count > 0 ? total / count : 0);
    //                     }, 0) / (classStudents.length || 1))}%`,
    //                     status: averageMarks < 50 ? 'Below Average' : 'On Track',
    //                     impact: 'High'
    //                 },
    //                 {
    //                     factor: 'Attendance',
    //                     studentValue: `${Math.round(attendanceRate)}%`,
    //                     classAvg: '0%',
    //                     status: attendanceRate < 75 ? 'Below Average' : 'On Track',
    //                     impact: 'Medium'
    //                 }
    //             ],
    //             subjectBreakdown: subjectBreakdown,
    //             historical: historical,
    //             recommendations: [
    //                 ...(averageMarks < 50 ? ['Provide additional academic support and tutoring'] : []),
    //                 ...(attendanceRate < 75 ? ['Monitor attendance and follow up with parents'] : []),
    //                 ...(averageMarks < 40 ? ['Schedule parent-teacher meeting to discuss progress'] : []),
    //                 ...(averageMarks >= 50 && attendanceRate >= 75 ? ['Student is performing well. Continue current support.'] : [])
    //             ]
    //         };

    //         setSelectedStudent(studentDetail);
    //     } catch (error: any) {
    //         console.error('Failed to load student details:', error);
    //         showMessage(error.message || 'Failed to load student details', true);
    //     } finally {
    //         setLoadingStudent(false);
    //     }
    // };



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
        setLoadingGradeStudents(true);
        try {
            // Filter students by class name
            const filteredStudents = students.filter(s => s.class?.name === gradeName);

            // Calculate performance data for each student using classResults
            const studentsWithData = await Promise.all(filteredStudents.map(async (student) => {
                // Find the student's results
                const results = classResults.find(cr => cr.id === student.id);

                // ===== FETCH REAL ATTENDANCE DATA =====
                let attendanceRate = 0;
                let presentCount = 0;
                let totalDays = 0;

                try {
                    const attendanceData = await fetchStudentAttendanceRate(student.id);
                    if (attendanceData) {
                        attendanceRate = attendanceData.attendanceRate || 0;
                        presentCount = attendanceData.presentCount || 0;
                        totalDays = attendanceData.totalDays || 0;
                    }
                } catch (error) {
                    console.log(`No attendance data for ${student.name}`);
                }

                if (!results) {
                    return {
                        ...student,
                        attendance: attendanceRate,
                        presentDays: presentCount,
                        totalDays: totalDays,
                        catScore: 0,
                        currentMarks: 0,
                        fails: 0,
                        passed: 0,
                        riskLevel: 'low'
                    };
                }

                // Calculate average score across subjects
                let totalScore = 0;
                let subjectCount = 0;
                let failedSubjects = 0;
                let passedSubjects = 0;

                results.subjects.forEach(subject => {
                    let score = 0;
                    if (assessmentType === 'qa1') score = subject.qa1 || 0;
                    else if (assessmentType === 'qa2') score = subject.qa2 || 0;
                    else if (assessmentType === 'endOfTerm') score = subject.endOfTerm || 0;
                    else {
                        const qa1 = subject.qa1 || 0;
                        const qa2 = subject.qa2 || 0;
                        const endTerm = subject.endOfTerm || 0;
                        score = (qa1 + qa2 + endTerm) / 3;
                    }

                    if (score > 0) {
                        totalScore += score;
                        subjectCount++;
                        // Check if subject is failed
                        const grade = calculateGrade(score, activeConfig?.pass_mark, false, gradeName);
                        if (grade === 'F' || grade === '9') {
                            failedSubjects++;
                        } else {
                            passedSubjects++;
                        }
                    }
                });

                const avgScore = subjectCount > 0 ? totalScore / subjectCount : 0;

                // Determine risk level
                let riskLevel = 'low';
                if (avgScore < 35 || failedSubjects >= 3) riskLevel = 'critical';
                else if (avgScore < 45 || failedSubjects >= 2) riskLevel = 'high';
                else if (avgScore < 55) riskLevel = 'medium';

                return {
                    ...student,
                    attendance: attendanceRate,        // ← REAL ATTENDANCE RATE (%)
                    presentDays: presentCount,          // ← Days present
                    totalDays: totalDays,               // ← Total school days
                    catScore: Math.round(avgScore),
                    currentMarks: Math.round(avgScore),
                    fails: failedSubjects,
                    passed: passedSubjects,
                    riskLevel: riskLevel
                };
            }));

            setGradeStudents(studentsWithData);
        } catch (error: any) {
            console.error('Failed to load grade students:', error);
            showMessage(error.message || 'Failed to load grade students', true);
        } finally {
            setLoadingGradeStudents(false);
        }
    };
    // const loadGradeStudents = async (gradeName: string) => {
    //     setLoadingGradeStudents(true);
    //     try {
    //         // Filter students by class name
    //         const filteredStudents = students.filter(s => s.class?.name === gradeName);

    //         // Calculate performance data for each student using classResults
    //         const studentsWithData = filteredStudents.map(student => {
    //             // Find the student's results
    //             const results = classResults.find(cr => cr.id === student.id);

    //             if (!results) {
    //                 return {
    //                     ...student,
    //                     attendance: 0,
    //                     catScore: 0,
    //                     currentMarks: 0,
    //                     fails: 0,
    //                     passed: 0,
    //                     riskLevel: 'low'
    //                 };
    //             }

    //             // Calculate average score across subjects
    //             let totalScore = 0;
    //             let subjectCount = 0;
    //             let failedSubjects = 0;
    //             let passedSubjects = 0;

    //             results.subjects.forEach(subject => {
    //                 let score = 0;
    //                 if (assessmentType === 'qa1') score = subject.qa1 || 0;
    //                 else if (assessmentType === 'qa2') score = subject.qa2 || 0;
    //                 else if (assessmentType === 'endOfTerm') score = subject.endOfTerm || 0;
    //                 else {
    //                     const qa1 = subject.qa1 || 0;
    //                     const qa2 = subject.qa2 || 0;
    //                     const endTerm = subject.endOfTerm || 0;
    //                     score = (qa1 + qa2 + endTerm) / 3;
    //                 }

    //                 if (score > 0) {
    //                     totalScore += score;
    //                     subjectCount++;
    //                     // Check if subject is failed
    //                     const grade = calculateGrade(score, activeConfig?.pass_mark, false, gradeName);
    //                     if (grade === 'F' || grade === '9') {
    //                         failedSubjects++;
    //                     } else {
    //                         passedSubjects++;
    //                     }
    //                 }
    //             });

    //             const avgScore = subjectCount > 0 ? totalScore / subjectCount : 0;

    //             // Determine risk level
    //             let riskLevel = 'low';
    //             if (avgScore < 35 || failedSubjects >= 3) riskLevel = 'critical';
    //             else if (avgScore < 45 || failedSubjects >= 2) riskLevel = 'high';
    //             else if (avgScore < 55) riskLevel = 'medium';

    //             return {
    //                 ...student,
    //                 attendance: 80 + Math.random() * 15, // Simulated
    //                 catScore: Math.round(avgScore),
    //                 currentMarks: Math.round(avgScore),
    //                 fails: failedSubjects,
    //                 passed: passedSubjects,  // ← ADD THIS
    //                 riskLevel: riskLevel
    //             };
    //         });

    //         setGradeStudents(studentsWithData);
    //     } catch (error: any) {
    //         console.error('Failed to load grade students:', error);
    //         showMessage(error.message || 'Failed to load grade students', true);
    //     } finally {
    //         setLoadingGradeStudents(false);
    //     }
    // };




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
        const hasData = classResults && classResults.length > 0;
        return (
            <div className="text-right text-xs text-slate-400 mt-2">
                {hasData ? (
                    <span className="text-green-600">✓ Showing results for {classResults.length} students</span>
                ) : (
                    <span className="text-amber-600">⚠ Select a class and assessment type to view performance analysis</span>
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
                    assessmentType={assessmentType}
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
                    calculateGrade={calculateGrade}
                    activeConfig={activeConfig}
                    students={students}
                    classResults={classResults}
                    currentPassRates={currentPassRates}

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