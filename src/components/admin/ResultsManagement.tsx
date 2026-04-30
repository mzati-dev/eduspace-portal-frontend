import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft, Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { SubjectRecord } from '@/services/studentService';
import { GradeConfiguration } from '@/services/gradeConfigService';
import { Student, Assessment, ReportCardData } from '@/types/admin';
import { calculateAndUpdateRanks } from '@/services/studentService';
import NationalMockExamEntry from './NationalMockExamEntry';
import { fetchCurrentTerm, fetchStudentAttendanceSummary } from '@/services/attendanceService';

interface ResultsManagementProps {
    students: Student[];
    classes: any[];
    subjects: SubjectRecord[];
    selectedStudent: Student | null;
    assessments: Assessment[];
    reportCard: ReportCardData;
    savingResults: boolean;
    activeConfig: GradeConfiguration | null;
    setSelectedStudent: (student: Student | null) => void;
    setAssessments: (assessments: Assessment[]) => void;
    setReportCard: (reportCard: ReportCardData) => void;
    loadStudentResults: (student: Student) => Promise<void>;
    saveAllResults: () => Promise<void>;
    updateAssessmentScore: (subjectId: string, field: 'qa1' | 'qa2' | 'end_of_term', value: number, isAbsent?: boolean) => void;
    // calculateGrade: (score: number, passMark?: number) => string;
    calculateGrade: (score: number, passMark?: number, isAbsent?: boolean, className?: string) => string;
    calculateFinalScore: (qa1: number, qa2: number, endOfTerm: number, config: GradeConfiguration) => number;
    isTeacherView?: boolean;
    isClassTeacher?: boolean; // ADDED
    // ADD THESE
    setShowConfirmModal: (show: boolean) => void;
    setSuccessMessage: (message: string) => void;
    setShowSuccessModal: (show: boolean) => void;
    setErrorMessage: (message: string) => void;
    schoolLevel?: 'primary' | 'secondary';
}

const ResultsManagement: React.FC<ResultsManagementProps> = ({
    students,
    classes,
    subjects,
    selectedStudent,
    assessments,
    reportCard,
    savingResults,
    activeConfig,
    setSelectedStudent,
    setAssessments,
    setReportCard,
    loadStudentResults,
    saveAllResults,
    updateAssessmentScore,
    calculateGrade,
    calculateFinalScore,
    isTeacherView = false,
    isClassTeacher = false, // ADDED
    // ADD THESE LINES
    setShowConfirmModal,
    setSuccessMessage,
    setShowSuccessModal,
    setErrorMessage,
    schoolLevel = 'secondary',
}) => {
    const [studentAssessmentsCount, setStudentAssessmentsCount] = useState<{ [key: string]: { qa1: number; qa2: number; endTerm: number } }>({});

    const [reportCardErrors, setReportCardErrors] = useState<{
        days_present: boolean;
        days_absent: boolean;
        days_late: boolean;
        // teacher_remarks: boolean;
    }>({
        days_present: false,
        days_absent: false,
        days_late: false,
        // teacher_remarks: false
    });
    const [calculatingClass, setCalculatingClass] = useState<string | null>(null);
    const [showEmptyFieldsWarning, setShowEmptyFieldsWarning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('');
    const [resultType, setResultType] = useState<'internal' | 'external'>('internal');
    const [externalExamType, setExternalExamType] = useState<'PSLCE' | 'JCE' | 'MSCE' | 'MOCK'>('PSLCE');
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [totalSchoolDays, setTotalSchoolDays] = useState(0);

    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchTerm ||
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.examNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !selectedClassFilter || student.class?.id === selectedClassFilter;
        return matchesSearch && matchesClass;
    });

    // Add these with your other state declarations
    const [customAssessments, setCustomAssessments] = useState<Array<{
        id: string;
        name: string;
        maxScore: number;
        scores: Record<string, number>; // subjectId -> score
    }>>([]);
    const [showCustomAssessmentModal, setShowCustomAssessmentModal] = useState(false);
    const [newAssessmentName, setNewAssessmentName] = useState('');
    const [newAssessmentMaxScore, setNewAssessmentMaxScore] = useState(100);
    const [editingAssessment, setEditingAssessment] = useState<any>(null);
    const [activeCustomAssessment, setActiveCustomAssessment] = useState<string | null>(null);


    // const predefinedRemarks = [
    //     "Outstanding performance. Excellent understanding of concepts.",
    //     "Very good performance. Consistent effort and strong results.",
    //     "Average performance. Shows understanding but needs more consistency.",
    //     "Fair performance. Steady progress at this stage.",
    //     "Satisfactory performance. Can improve with more practice.",
    //     "Below average performance. Needs to focus and work harder.",
    //     "Poor performance. Requires serious improvement and support."
    // ];

    // Fetch assessment counts for all students when component loads
    useEffect(() => {
        const fetchAllStudentAssessments = async () => {
            const counts: { [key: string]: { qa1: number; qa2: number; endTerm: number } } = {};

            for (const student of students) {
                try {
                    const response = await fetch(`https://eduspace-portal-backend.onrender.com/api/students/${student.id}/assessments`);
                    if (response.ok) {
                        const assessmentsData = await response.json();

                        let qa1Count = 0;
                        let qa2Count = 0;
                        let endTermCount = 0;

                        if (Array.isArray(assessmentsData)) {
                            assessmentsData.forEach((assessment: any) => {
                                const assessmentType = assessment.assessment_type || assessment.assessmentType;
                                const score = assessment.score || 0;

                                // if (score > 0) {
                                //     if (assessmentType === 'qa1') qa1Count++;
                                //     if (assessmentType === 'qa2') qa2Count++;
                                //     if (assessmentType === 'end_of_term') endTermCount++;
                                // }

                                // With this:
                                if ((score !== null && score !== undefined) || assessment.absent) {
                                    if (assessmentType === 'qa1') qa1Count++;
                                    if (assessmentType === 'qa2') qa2Count++;
                                    if (assessmentType === 'end_of_term') endTermCount++;
                                }
                            });
                        }

                        counts[student.id] = { qa1: qa1Count, qa2: qa2Count, endTerm: endTermCount };
                    }
                } catch (error) {
                    console.error(`Error fetching assessments for student ${student.id}:`, error);
                    counts[student.id] = { qa1: 0, qa2: 0, endTerm: 0 };
                }
            }

            setStudentAssessmentsCount(counts);
        };

        if (students.length > 0 && !selectedStudent) {
            fetchAllStudentAssessments();
        }
    }, [students, selectedStudent]);

    useEffect(() => {
        const fetchAttendanceForReportCard = async () => {
            if (!selectedStudent) return;

            setLoadingAttendance(true);
            try {
                const term = await fetchCurrentTerm();
                if (!term?.startDate || !term?.endDate) return;

                const summary = await fetchStudentAttendanceSummary(
                    selectedStudent.id,
                    term.startDate,
                    term.endDate
                );

                setReportCard({
                    ...reportCard,
                    days_present: summary.present,
                    days_absent: summary.absent,
                    days_late: summary.late
                });
                setTotalSchoolDays(summary.total);
            } catch (error) {
                console.error('Failed to fetch attendance summary:', error);
            } finally {
                setLoadingAttendance(false);
            }
        };

        fetchAttendanceForReportCard();
    }, [selectedStudent]);


    // Force internal assessments only for teachers
    useEffect(() => {
        if (isTeacherView) {
            setResultType('internal');
        }
    }, [isTeacherView]);

    const getStudentCompletedSubjects = (studentId: string) => {
        const counts = studentAssessmentsCount[studentId];
        if (!counts) return 0;
        return Math.max(counts.qa1, counts.qa2, counts.endTerm);
    };

    const hasAnyAssessments = (studentId: string) => {
        const counts = studentAssessmentsCount[studentId];
        if (!counts) return false;
        return counts.qa1 > 0 || counts.qa2 > 0 || counts.endTerm > 0;
    };

    const clearScore = (subjectId: string, field: 'qa1' | 'qa2' | 'end_of_term') => {
        updateAssessmentScore(subjectId, field, null, false);
    };

    const hasEndOfTermScores = () => {
        return assessments.some(assessment => assessment.end_of_term > 0);
    };

    const validateReportCard = (): boolean => {
        const errors = {
            // days_present: reportCard.days_present === undefined || reportCard.days_present === null,
            // days_absent: reportCard.days_absent === undefined || reportCard.days_absent === null,
            // days_late: reportCard.days_late === undefined || reportCard.days_late === null,
            days_present: false, // Not required anymore
            days_absent: false,  // Not required anymore
            days_late: false,    // Not required anymore
            // teacher_remarks: !reportCard.teacher_remarks.trim()
        };

        setReportCardErrors(errors);
        return !Object.values(errors).some(error => error);
    };

    // MODIFIED: Save button handler with class teacher check
    // const handleSaveClick = async () => {
    //     if (hasEndOfTermScores()) {
    //         if (!isClassTeacher) {
    //             alert('Only class teacher can save attendance and remarks. Please contact the class teacher.');
    //             return;
    //         }

    //         if (!validateReportCard()) {
    //             document.querySelector('.report-card-section')?.scrollIntoView({ behavior: 'smooth' });
    //             return;
    //         }
    //     }
    //     await saveAllResults();
    // };

    const handleSaveClick = async () => {
        // If there are End of Term scores AND teacher is class teacher
        if (hasEndOfTermScores() && isClassTeacher) {
            if (!validateReportCard()) {
                document.querySelector('.report-card-section')?.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        // Subject teachers can save without validating attendance/remarks
        await saveAllResults();
    };

    const emptyFieldsCount = assessments.reduce((count, assessment) => {
        let empty = 0;
        if (assessment.qa1 === null && !assessment.qa1_absent) empty++;
        if (assessment.qa2 === null && !assessment.qa2_absent) empty++;
        if (assessment.end_of_term === null && !assessment.end_of_term_absent) empty++;
        return count + empty;
    }, 0);

    // Load custom assessments from localStorage
    const loadCustomAssessments = () => {
        const saved = localStorage.getItem('customInternalAssessments');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    // Save custom assessments to localStorage
    const saveCustomAssessments = (assessments: any[]) => {
        localStorage.setItem('customInternalAssessments', JSON.stringify(assessments));
    };

    // Load scores for custom assessments from localStorage
    const loadCustomAssessmentScores = (studentId: string, assessmentId: string) => {
        const key = `customScores_${studentId}_${assessmentId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return {};
            }
        }
        return {};
    };

    // Save scores for custom assessment
    const saveCustomAssessmentScores = (studentId: string, assessmentId: string, scores: Record<string, number>) => {
        const key = `customScores_${studentId}_${assessmentId}`;
        localStorage.setItem(key, JSON.stringify(scores));
    };

    // Add this helper function if not already available
    const showMessage = (msg: string, isError: boolean = false) => {
        if (isError) {
            setErrorMessage(msg);
        } else {
            setSuccessMessage(msg);
        }
        setShowSuccessModal(true);
    };
    return (
        <div className="space-y-6">
            {!selectedStudent ? (
                <>



                    {/* ADD THIS TOGGLE SECTION */}
                    {/* <div className="flex gap-2 mb-4 justify-center">
                        <button
                            onClick={() => setResultType('internal')}
                            className={`px-4 py-2 rounded-lg ${resultType === 'internal' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                        >
                            Internal Assessments
                        </button>
                        <button
                            onClick={() => setResultType('external')}
                            className={`px-4 py-2 rounded-lg ${resultType === 'external' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                        >
                            National/Mock Exams
                        </button>
                    </div> */}

                    {/* ADD THIS TOGGLE SECTION - HIDE FOR TEACHERS */}
                    {!isTeacherView && (
                        <div className="flex gap-2 mb-4 justify-center">
                            <button
                                onClick={() => setResultType('internal')}
                                className={`px-4 py-2 rounded-lg ${resultType === 'internal' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                            >
                                Internal Assessments
                            </button>
                            <button
                                onClick={() => setResultType('external')}
                                className={`px-4 py-2 rounded-lg ${resultType === 'external' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                            >
                                National/Mock Exams
                            </button>
                        </div>
                    )}


                    {/* Custom Assessment Modal */}
                    {showCustomAssessmentModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800">
                                        {editingAssessment ? 'Edit Assessment' : 'Create Custom Assessment'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowCustomAssessmentModal(false);
                                            setEditingAssessment(null);
                                            setNewAssessmentName('');
                                            setNewAssessmentMaxScore(100);
                                        }}
                                        className="p-1 hover:bg-slate-100 rounded"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Assessment Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newAssessmentName}
                                            onChange={(e) => setNewAssessmentName(e.target.value)}
                                            placeholder="e.g., Project, Oral Test, Practical, Homework"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Max Score (0-100)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newAssessmentMaxScore}
                                            onChange={(e) => setNewAssessmentMaxScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 100)))}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => {
                                                if (!newAssessmentName.trim()) {
                                                    showMessage('Please enter an assessment name', true);
                                                    return;
                                                }

                                                if (editingAssessment) {
                                                    const updated = customAssessments.map(a =>
                                                        a.id === editingAssessment.id
                                                            ? { ...a, name: newAssessmentName, maxScore: newAssessmentMaxScore }
                                                            : a
                                                    );
                                                    setCustomAssessments(updated);
                                                    saveCustomAssessments(updated);
                                                    showMessage(`Assessment "${newAssessmentName}" updated!`);
                                                } else {
                                                    const newAssessment = {
                                                        id: Date.now().toString(),
                                                        name: newAssessmentName,
                                                        maxScore: newAssessmentMaxScore,
                                                        scores: {}
                                                    };
                                                    const updated = [...customAssessments, newAssessment];
                                                    setCustomAssessments(updated);
                                                    saveCustomAssessments(updated);
                                                    showMessage(`Assessment "${newAssessmentName}" created!`);
                                                }

                                                setShowCustomAssessmentModal(false);
                                                setEditingAssessment(null);
                                                setNewAssessmentName('');
                                                setNewAssessmentMaxScore(100);
                                            }}
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                        >
                                            {editingAssessment ? 'Update' : 'Create'} Assessment
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowCustomAssessmentModal(false);
                                                setEditingAssessment(null);
                                                setNewAssessmentName('');
                                                setNewAssessmentMaxScore(100);
                                            }}
                                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ADD THIS SEARCH AND FILTER SECTION */}
                    {resultType === 'internal' && (
                        <>
                            <h2 className="text-lg font-semibold text-slate-800">Select a Student to Enter Results</h2>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Search by Name or Exam Number */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Search Students
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search by name or exam number..."
                                                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                                            {searchTerm && (
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Filter by Class */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Filter by Class
                                        </label>
                                        <select
                                            value={selectedClassFilter}
                                            onChange={(e) => setSelectedClassFilter(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">All Classes</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.name} - {cls.term}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Search Results Summary */}
                                {(searchTerm || selectedClassFilter) && (
                                    <div className="mt-3 flex items-center justify-between">
                                        <p className="text-sm text-slate-600">
                                            Showing {students.filter(s => {
                                                const matchesSearch = !searchTerm ||
                                                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    s.examNumber.toLowerCase().includes(searchTerm.toLowerCase());
                                                const matchesClass = !selectedClassFilter || s.class?.id === selectedClassFilter;
                                                return matchesSearch && matchesClass;
                                            }).length} of {students.length} students
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSelectedClassFilter('');
                                            }}
                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </div>


                            {/* Custom Assessments Section */}
                            {/* <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-slate-800">Custom Assessments</h3>
                                    <button
                                        onClick={() => {
                                            setEditingAssessment(null);
                                            setNewAssessmentName('');
                                            setNewAssessmentMaxScore(100);
                                            setShowCustomAssessmentModal(true);
                                        }}
                                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add Assessment
                                    </button>
                                    
                                </div>

                                {customAssessments.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        No custom assessments yet. Click "Add Assessment" to create one (e.g., Project, Oral Test, etc.)
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {customAssessments.map(assessment => (
                                            <button
                                                key={assessment.id}
                                                onClick={() => setActiveCustomAssessment(
                                                    activeCustomAssessment === assessment.id ? null : assessment.id
                                                )}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeCustomAssessment === assessment.id
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {assessment.name}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingAssessment(assessment);
                                                        setNewAssessmentName(assessment.name);
                                                        setNewAssessmentMaxScore(assessment.maxScore);
                                                        setShowCustomAssessmentModal(true);
                                                    }}
                                                    className="text-xs hover:text-indigo-600"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Delete "${assessment.name}"? All scores for this assessment will be lost.`)) {
                                                            const updated = customAssessments.filter(a => a.id !== assessment.id);
                                                            setCustomAssessments(updated);
                                                            saveCustomAssessments(updated);
                                                            if (activeCustomAssessment === assessment.id) {
                                                                setActiveCustomAssessment(null);
                                                            }
                                                            showMessage(`Assessment "${assessment.name}" deleted!`);
                                                        }
                                                    }}
                                                    className="text-xs hover:text-red-600"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div> */}

                            {/* Custom Assessments Section - HIDE COMPLETELY FOR TEACHERS */}
                            {!isTeacherView && (
                                <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold text-slate-800">Custom Assessments</h3>
                                        <button
                                            onClick={() => {
                                                setEditingAssessment(null);
                                                setNewAssessmentName('');
                                                setNewAssessmentMaxScore(100);
                                                setShowCustomAssessmentModal(true);
                                            }}
                                            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" /> Add Assessment
                                        </button>
                                    </div>

                                    {customAssessments.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">
                                            No custom assessments yet. Click "Add Assessment" to create one (e.g., Project, Oral Test, etc.)
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {customAssessments.map(assessment => (
                                                <button
                                                    key={assessment.id}
                                                    onClick={() => setActiveCustomAssessment(
                                                        activeCustomAssessment === assessment.id ? null : assessment.id
                                                    )}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeCustomAssessment === assessment.id
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {assessment.name}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingAssessment(assessment);
                                                            setNewAssessmentName(assessment.name);
                                                            setNewAssessmentMaxScore(assessment.maxScore);
                                                            setShowCustomAssessmentModal(true);
                                                        }}
                                                        className="text-xs hover:text-indigo-600"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(`Delete "${assessment.name}"? All scores for this assessment will be lost.`)) {
                                                                const updated = customAssessments.filter(a => a.id !== assessment.id);
                                                                setCustomAssessments(updated);
                                                                saveCustomAssessments(updated);
                                                                if (activeCustomAssessment === assessment.id) {
                                                                    setActiveCustomAssessment(null);
                                                                }
                                                                showMessage(`Assessment "${assessment.name}" deleted!`);
                                                            }
                                                        }}
                                                        className="text-xs hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-8">
                                {classes.map(cls => {
                                    // const classStudents = students.filter(s => s.class?.id === cls.id);
                                    // First filter all students


                                    const classStudents = filteredStudents.filter(s => s.class?.id === cls.id);
                                    if (classStudents.length === 0) return null;

                                    return (
                                        <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                            {/* <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            {cls.name} - {cls.term} ({cls.academic_year})
                                        </h3>
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                                            {classStudents.length} students
                                        </span>
                                    </div> */}

                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    {cls.name} - {cls.term} ({cls.academic_year})
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                                                        {classStudents.length} students
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setCalculatingClass(cls.id);
                                                            localStorage.setItem('selectedClassForRank', JSON.stringify({
                                                                id: cls.id,
                                                                name: cls.name,
                                                                term: cls.term
                                                            }));
                                                            setShowConfirmModal(true);
                                                        }}
                                                        disabled={calculatingClass === cls.id}
                                                        className={`px-4 py-2 font-semibold text-sm rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 ${calculatingClass === cls.id
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg active:bg-red-800'
                                                            }`}
                                                    >
                                                        {calculatingClass === cls.id ? (
                                                            <>
                                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                <span>Calculating...</span>
                                                            </>
                                                        ) : (
                                                            <>📊 Calculate Class Ranks</>
                                                        )}
                                                    </button>
                                                    {/* <button
                                                onClick={() => {
                                                    setCalculatingClass(cls.id);
                                                    localStorage.setItem('selectedClassForRank', JSON.stringify({
                                                        id: cls.id,
                                                        name: cls.name,
                                                        term: cls.term
                                                    }));
                                                    setShowConfirmModal(true);
                                                    // setCalculatingClass(null);
                                                }}
                                                disabled={calculatingClass === cls.id}
                                                className={`px-3 py-1 text-white font-medium text-xs rounded-lg shadow transition-colors duration-200 flex items-center gap-1 ${calculatingClass === cls.id
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-red-600 hover:bg-red-700'
                                                    }`}
                                            >
                                                {calculatingClass === cls.id ? (
                                                    <>⏳ Calculating...</>
                                                ) : (
                                                    <>Calculate Ranks (Click after entering all scores)</>
                                                )}
                                            </button> */}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {classStudents.map((student) => {
                                                    const counts = studentAssessmentsCount[student.id] || { qa1: 0, qa2: 0, endTerm: 0 };
                                                    const completedSubjects = getStudentCompletedSubjects(student.id);
                                                    const hasScores = hasAnyAssessments(student.id);

                                                    return (
                                                        <button
                                                            key={student.id}
                                                            onClick={() => loadStudentResults(student)}
                                                            className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left hover:bg-indigo-50 relative"
                                                        >
                                                            {hasScores && (
                                                                <div className="absolute top-3 right-3 flex gap-1">
                                                                    {counts.qa1 > 0 && (
                                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" title={`${counts.qa1} QA1 subjects`}></div>
                                                                    )}
                                                                    {counts.qa2 > 0 && (
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full" title={`${counts.qa2} QA2 subjects`}></div>
                                                                    )}
                                                                    {counts.endTerm > 0 && (
                                                                        <div className="w-2 h-2 bg-amber-500 rounded-full" title={`${counts.endTerm} End Term subjects`}></div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="font-mono text-sm text-indigo-600">{student.examNumber}</p>
                                                                {completedSubjects > 0 && (
                                                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                                                        {completedSubjects} subjects
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="font-semibold text-slate-800">{student.name}</p>
                                                            <p className="text-sm text-slate-500">
                                                                {student.class?.name || 'No Class'}
                                                                {student.class?.term || 'Term 1, 2024/2025'}
                                                            </p>

                                                            {hasScores && (
                                                                <div className="mt-3 pt-3 border-t border-slate-200">
                                                                    <div className="flex justify-between text-xs">
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                                            <span className="text-slate-600">QA1:</span>
                                                                            <span className="font-semibold text-emerald-600 ml-1">{counts.qa1}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            <span className="text-slate-600">QA2:</span>
                                                                            <span className="font-semibold text-blue-600 ml-1">{counts.qa2}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                                            <span className="text-slate-600">End:</span>
                                                                            <span className="font-semibold text-amber-600 ml-1">{counts.endTerm}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {students.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                                        <p className="text-slate-500">No students found. Add your first student to get started.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {resultType === 'external' && (
                        <NationalMockExamEntry
                            examType={externalExamType}
                            schoolLevel={schoolLevel}
                            students={students}
                            subjects={subjects}
                            onSave={async (results) => {
                                setSuccessMessage(`${externalExamType} results saved!`);
                                setShowSuccessModal(true);
                            }}
                            onBack={() => setResultType('internal')}
                            showMessage={(msg, isError) => {
                                if (isError) setErrorMessage(msg);
                                else setSuccessMessage(msg);
                            }}
                            onExamTypeChange={(type) => setExternalExamType(type)}
                        />
                    )}
                </>

            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">{selectedStudent.name}</h2>
                                <p className="text-sm text-slate-500">{selectedStudent.examNumber} {selectedStudent.class?.name || 'No Class'}</p>
                                {/* {activeCustomAssessment && (
                                    <p className="text-xs text-emerald-600 mt-1">
                                        Currently entering: {customAssessments.find(a => a.id === activeCustomAssessment)?.name}
                                    </p>
                                )} */}
                                {!isTeacherView && activeCustomAssessment && (
                                    <p className="text-xs text-emerald-600 mt-1">
                                        Currently entering: {customAssessments.find(a => a.id === activeCustomAssessment)?.name}
                                    </p>
                                )}
                                {!isClassTeacher && (
                                    <span className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        Subject Teacher (Attendance/Restricted)
                                    </span>
                                )}
                                {isClassTeacher && (
                                    <span className="mt-1 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                        Class Teacher (Full Access)
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleSaveClick}
                            disabled={savingResults}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            {savingResults ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save All Results
                                </>
                            )}
                        </button>
                    </div>

                    {isTeacherView && emptyFieldsCount > 0 && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">
                                        ⚠️ All score fields for each assessment must be completed
                                    </p>

                                    <p className="text-xs text-amber-700 mt-1">
                                        • Enter <span className="font-bold bg-amber-100 px-1 rounded">0</span> if the student scored zero<br />
                                        • Select <span className="font-bold bg-amber-100 px-1 rounded">AB</span> if the student was absent<br />
                                        • <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                                            After entering all subjects for an assessment type, do not leave any field for that particular assessment blank
                                        </span>
                                        <p className="text-sm text-red-700 mt-2">
                                            ⚠️ Empty fields will be treated as "no data" and will <span className="font-bold underline">WRONGLY AFFECT RANKINGS!</span>
                                        </p>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800">Assessment Scores</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {isClassTeacher
                                    ? "You can enter all assessment scores as class teacher."
                                    : "You can enter assessment scores for subjects you teach."
                                }
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Subject</th>
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">QA1 (0-100)</th>
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">QA2 (0-100)</th>
                                        {/* <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">End of Term (0-100)</th> */}
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">End of Term (0-100)</th>
                                        {/* Dynamic Custom Assessment Headers */}
                                        {customAssessments.map(assessment => (
                                            <th key={assessment.id} className="text-center px-6 py-3 text-sm font-semibold text-slate-600">
                                                {assessment.name} (0-{assessment.maxScore})
                                            </th>
                                        ))}
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Final Score*</th>
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                        {/* <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Final Score*</th>
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Actions</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {assessments.map((assessment) => {
                                        // Use 0 for null values in calculations
                                        const qa1 = assessment.qa1 ?? 0;
                                        const qa2 = assessment.qa2 ?? 0;
                                        const endTerm = assessment.end_of_term ?? 0;
                                        // let finalScore = (assessment.qa1 + assessment.qa2 + assessment.end_of_term) / 3;
                                        let finalScore = (qa1 + qa2 + endTerm) / 3;
                                        if (activeConfig) {
                                            finalScore = calculateFinalScore(
                                                qa1,
                                                qa2,
                                                endTerm,
                                                activeConfig
                                                // assessment.qa1,
                                                // assessment.qa2,
                                                // assessment.end_of_term,
                                                // activeConfig
                                            );
                                        }

                                        // const hasQa1 = assessment.qa1 > 0;
                                        // const hasQa2 = assessment.qa2 > 0;
                                        // const hasEndTerm = assessment.end_of_term > 0;
                                        // const hasAnyScore = hasQa1 || hasQa2 || hasEndTerm;

                                        // Check if there's a score (including 0) OR if absent
                                        const hasQa1 = assessment.qa1 !== null || assessment.qa1_absent;
                                        const hasQa2 = assessment.qa2 !== null || assessment.qa2_absent;
                                        const hasEndTerm = assessment.end_of_term !== null || assessment.end_of_term_absent;
                                        const hasAnyScore = hasQa1 || hasQa2 || hasEndTerm;

                                        return (
                                            <tr key={assessment.subject_id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-800">{assessment.subject_name}</td>
                                                {/* <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={assessment.qa1 || ''}
                                                            onChange={(e) => updateAssessmentScore(assessment.subject_id, 'qa1', parseInt(e.target.value) || 0)}
                                                            className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${hasQa1 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'
                                                                }`}
                                                        />
                                                        {hasQa1 && (
                                                            <div className="absolute top-3 left-3 w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </td> */}

                                                {/* QA1 Cell - Replace the existing QA1 td */}
                                                <td className="px-6 py-4">
                                                    <div className="relative flex items-center justify-center gap-1">
                                                        {assessment.qa1_absent ? (
                                                            // Show AB badge when absent
                                                            <>
                                                                {/* <div className="w-20 px-3 py-2 border rounded-lg text-center mx-auto block bg-slate-100 text-slate-600 font-medium"> */}
                                                                <div className="w-20 px-3 py-2 border rounded-lg text-center mx-auto block bg-emerald-50 border-emerald-300 text-slate-600 font-medium">
                                                                    AB
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        // Mark as present (clear absent flag)
                                                                        updateAssessmentScore(assessment.subject_id, 'qa1', assessment.qa1 || 0, false);
                                                                    }}
                                                                    className="p-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded transition-colors"
                                                                    title="Enter score"
                                                                    type="button"
                                                                >
                                                                    ✎
                                                                </button>
                                                            </>
                                                        ) : (
                                                            // Show number input when present
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    // value={assessment.qa1 === 0 ? 0 : assessment.qa1 || ''}
                                                                    // value={assessment.qa1 === 0 && assessment.qa1_absent === false ? '' : assessment.qa1 ?? ''}
                                                                    value={assessment.qa1 ?? ''}

                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '') {
                                                                            updateAssessmentScore(assessment.subject_id, 'qa1', null, false);
                                                                        } else {
                                                                            const numValue = parseInt(value);
                                                                            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                                                                                updateAssessmentScore(assessment.subject_id, 'qa1', numValue, false);
                                                                            }
                                                                        }
                                                                    }}
                                                                    // className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${assessment.qa1 > 0 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'
                                                                    //     }`}
                                                                    // FIX 2a: Apply colored background for ANY score including 0
                                                                    // Previously only applied for > 0, now applies for >= 0
                                                                    className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${(assessment.qa1 !== null && assessment.qa1 >= 0) ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'
                                                                        }`}
                                                                    placeholder=""
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        // Mark as absent
                                                                        updateAssessmentScore(assessment.subject_id, 'qa1', 0, true);
                                                                    }}
                                                                    className="p-1 text-xs bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                                                                    title="Mark as absent"
                                                                    type="button"
                                                                >
                                                                    AB
                                                                </button>
                                                            </>
                                                        )}


                                                        {/* FIX 2b: Show colored dot for ANY 
                                                        
                                                                  {assessment.qa1 > 0 && !assessment.qa1_absent && (
                                                            <div className="absolute top-3 left-3 w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                        )}

                                                        score including 0 */}
                                                        {/* Previously only showed for > 0, now shows for >= 0 */}
                                                        {(assessment.qa1 !== null && assessment.qa1 >= 0) && !assessment.qa1_absent && (
                                                            <div className="absolute top-3 left-3 w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={assessment.qa2 || ''}
                                                            onChange={(e) => updateAssessmentScore(assessment.subject_id, 'qa2', parseInt(e.target.value) || 0)}
                                                            className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${hasQa2 ? 'border-blue-300 bg-blue-50' : 'border-slate-300'
                                                                }`}
                                                        />
                                                        {hasQa2 && (
                                                            <div className="absolute top-3 left-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </td> */}
                                                {/* QA2 Cell */}
                                                <td className="px-6 py-4">
                                                    <div className="relative flex items-center justify-center gap-1">
                                                        {assessment.qa2_absent ? (
                                                            <>
                                                                {/* <div className="w-20 px-3 py-2 border rounded-lg text-center mx-auto block bg-slate-100 text-slate-600 font-medium"> */}
                                                                <div className="w-20 px-3 py-2 border rounded-lg text-center mx-auto block bg-blue-50 border-blue-300 text-slate-600 font-medium">
                                                                    AB
                                                                </div>
                                                                <button
                                                                    onClick={() => updateAssessmentScore(assessment.subject_id, 'qa2', assessment.qa2 || 0, false)}
                                                                    className="p-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded transition-colors"
                                                                    title="Enter score"
                                                                    type="button"
                                                                >
                                                                    ✎
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    // value={assessment.qa2 === 0 ? 0 : assessment.qa2 || ''}
                                                                    value={assessment.qa2 ?? ''}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '') {
                                                                            updateAssessmentScore(assessment.subject_id, 'qa2', null, false);
                                                                        } else {
                                                                            const numValue = parseInt(value);
                                                                            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                                                                                updateAssessmentScore(assessment.subject_id, 'qa2', numValue, false);
                                                                            }
                                                                        }
                                                                    }}
                                                                    // className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${assessment.qa2 > 0 ? 'border-blue-300 bg-blue-50' : 'border-slate-300'
                                                                    //     }`}
                                                                    // FIX 3a: Apply colored background for ANY score including 0
                                                                    className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${(assessment.qa2 !== null && assessment.qa2 >= 0) ? 'border-blue-300 bg-blue-50' : 'border-slate-300'
                                                                        }`}
                                                                    placeholder=""
                                                                />
                                                                <button
                                                                    onClick={() => updateAssessmentScore(assessment.subject_id, 'qa2', 0, true)}
                                                                    className="p-1 text-xs bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                                                                    title="Mark as absent"
                                                                    type="button"
                                                                >
                                                                    AB
                                                                </button>
                                                            </>
                                                        )}



                                                        {/* FIX 3b: Show colored dot 
                                                        
                                                         {assessment.qa2 > 0 && !assessment.qa2_absent && (
                                                            <div className="absolute top-3 left-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        )}
                                                        for ANY score including 0 */}
                                                        {(assessment.qa2 !== null && assessment.qa2 >= 0) && !assessment.qa2_absent && (
                                                            <div className="absolute top-3 left-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={assessment.end_of_term || ''}
                                                            onChange={(e) => updateAssessmentScore(assessment.subject_id, 'end_of_term', parseInt(e.target.value) || 0)}
                                                            className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${hasEndTerm ? 'border-amber-300 bg-amber-50' : 'border-slate-300'
                                                                }`}
                                                        />
                                                        {hasEndTerm && (
                                                            <div className="absolute top-3 left-3 w-2 h-2 bg-amber-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </td> */}

                                                {/* End of Term Cell */}
                                                <td className="px-6 py-4">
                                                    <div className="relative flex items-center justify-center gap-1">
                                                        {assessment.end_of_term_absent ? (
                                                            <>
                                                                {/* <div className="w-20 px-3 py-2 border rounded-lg text-center mx-auto block bg-slate-100 text-slate-600 font-medium"> */}
                                                                <div className="w-20 px-3 py-2 border rounded-lg text-center mx-auto block bg-amber-50 border-amber-300 text-slate-600 font-medium">
                                                                    AB
                                                                </div>
                                                                <button
                                                                    onClick={() => updateAssessmentScore(assessment.subject_id, 'end_of_term', assessment.end_of_term || 0, false)}
                                                                    className="p-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded transition-colors"
                                                                    title="Enter score"
                                                                    type="button"
                                                                >
                                                                    ✎
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    // value={assessment.end_of_term === 0 ? 0 : assessment.end_of_term || ''}
                                                                    value={assessment.end_of_term ?? ''}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '') {
                                                                            updateAssessmentScore(assessment.subject_id, 'end_of_term', null, false);
                                                                        } else {
                                                                            const numValue = parseInt(value);
                                                                            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                                                                                updateAssessmentScore(assessment.subject_id, 'end_of_term', numValue, false);
                                                                            }
                                                                        }
                                                                    }}
                                                                    // className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${assessment.end_of_term > 0 ? 'border-amber-300 bg-amber-50' : 'border-slate-300'
                                                                    //     }`}
                                                                    // FIX 4a: Apply colored background for ANY score including 0
                                                                    className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${(assessment.end_of_term !== null && assessment.end_of_term >= 0) ? 'border-amber-300 bg-amber-50' : 'border-slate-300'
                                                                        }`}
                                                                    placeholder=""
                                                                />
                                                                <button
                                                                    onClick={() => updateAssessmentScore(assessment.subject_id, 'end_of_term', 0, true)}
                                                                    className="p-1 text-xs bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                                                                    title="Mark as absent"
                                                                    type="button"
                                                                >
                                                                    AB
                                                                </button>
                                                            </>
                                                        )}



                                                        {/* FIX 4b: Show colored dot 
                                                        
                                                          {assessment.end_of_term > 0 && !assessment.end_of_term_absent && (
                                                            <div className="absolute top-3 left-3 w-2 h-2 bg-amber-500 rounded-full"></div>
                                                        )}
                                                        
                                                        for ANY score including 0 */}
                                                        {(assessment.end_of_term !== null && assessment.end_of_term >= 0) && !assessment.end_of_term_absent && (
                                                            <div className="absolute top-3 left-3 w-2 h-2 bg-amber-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </td>
                                                {/* Dynamic Custom Assessment Cells */}
                                                {/* {customAssessments.map(assessment => {
                                                    const customScores = loadCustomAssessmentScores(selectedStudent.id, assessment.id);
                                                    const currentScore = customScores[assessment.subject_id] || '';

                                                    const handleCustomScoreChange = (value: string) => {
                                                        const numValue = value === '' ? 0 : Math.min(assessment.maxScore, Math.max(0, parseInt(value) || 0));
                                                        const newScores = { ...customScores, [assessment.subject_id]: numValue };
                                                        saveCustomAssessmentScores(selectedStudent.id, assessment.id, newScores);
                                                        // Reload to refresh
                                                        loadStudentResults(selectedStudent);
                                                    };

                                                    return (
                                                        <td key={assessment.id} className="px-6 py-4">
                                                            <div className="relative flex items-center justify-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={assessment.maxScore}
                                                                    value={currentScore}
                                                                    onChange={(e) => handleCustomScoreChange(e.target.value)}
                                                                    className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${currentScore !== '' && Number(currentScore) >= 0
                                                                            ? 'border-purple-300 bg-purple-50'
                                                                            : 'border-slate-300'
                                                                        }`}
                                                                    placeholder=""
                                                                />
                                                                {currentScore !== '' && Number(currentScore) >= 0 && (
                                                                    <button
                                                                        onClick={() => handleCustomScoreChange('')}
                                                                        className="p-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
                                                                        title="Clear score"
                                                                        type="button"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                                {currentScore !== '' && Number(currentScore) >= 0 && (
                                                                    <div className="absolute top-3 left-3 w-2 h-2 bg-purple-500 rounded-full"></div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })} */}

                                                {/* Dynamic Custom Assessment Cells */}
                                                {customAssessments.map(customAssessment => {
                                                    const customScores = loadCustomAssessmentScores(selectedStudent.id, customAssessment.id);
                                                    const currentScore = customScores[assessment.subject_id] || '';

                                                    const handleCustomScoreChange = (value: string) => {
                                                        const numValue = value === '' ? 0 : Math.min(customAssessment.maxScore, Math.max(0, parseInt(value) || 0));
                                                        const newScores = { ...customScores, [assessment.subject_id]: numValue };
                                                        saveCustomAssessmentScores(selectedStudent.id, customAssessment.id, newScores);
                                                        // Reload to refresh
                                                        loadStudentResults(selectedStudent);
                                                    };

                                                    return (
                                                        <td key={customAssessment.id} className="px-6 py-4">
                                                            <div className="relative flex items-center justify-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={customAssessment.maxScore}
                                                                    value={currentScore}
                                                                    onChange={(e) => handleCustomScoreChange(e.target.value)}
                                                                    className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block ${currentScore !== '' && Number(currentScore) >= 0
                                                                        ? 'border-purple-300 bg-purple-50'
                                                                        : 'border-slate-300'
                                                                        }`}
                                                                    placeholder=""
                                                                />
                                                                {currentScore !== '' && Number(currentScore) >= 0 && (
                                                                    <button
                                                                        onClick={() => handleCustomScoreChange('')}
                                                                        className="p-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
                                                                        title="Clear score"
                                                                        type="button"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                                {currentScore !== '' && Number(currentScore) >= 0 && (
                                                                    <div className="absolute top-3 left-3 w-2 h-2 bg-purple-500 rounded-full"></div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}

                                                {/* <td className="px-6 py-4 text-center font-semibold text-indigo-700">
                                                    {finalScore.toFixed(1)}
                                                </td> */}
                                                <td className="px-6 py-4 text-center font-semibold text-indigo-700">
                                                    {assessment.end_of_term_absent ? (
                                                        <span className="text-slate-400">AB</span>
                                                    ) : (
                                                        finalScore.toFixed(1)
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    {hasAnyScore && (
                                                        <div className="flex justify-center gap-1">
                                                            {hasQa1 && (
                                                                <button
                                                                    onClick={() => clearScore(assessment.subject_id, 'qa1')}
                                                                    className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                                    title="Clear QA1 score"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                    <span className="sr-only">Clear QA1</span>
                                                                </button>
                                                            )}
                                                            {hasQa2 && (
                                                                <button
                                                                    onClick={() => clearScore(assessment.subject_id, 'qa2')}
                                                                    className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                                    title="Clear QA2 score"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                    <span className="sr-only">Clear QA2</span>
                                                                </button>
                                                            )}
                                                            {hasEndTerm && (
                                                                <button
                                                                    onClick={() => clearScore(assessment.subject_id, 'end_of_term')}
                                                                    className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                                    title="Clear End Term score"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                    <span className="sr-only">Clear End Term</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        * Final score calculated using active configuration: <span className="font-semibold">{activeConfig?.configuration_name || 'Default (Average of All)'}</span>
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        Tip: To remove a score, click the X button or set the value to 0 and save
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Assessments Section for Selected Student */}
                    {/* {activeCustomAssessment && selectedStudent && (() => {
                        const assessmentData = customAssessments.find(a => a.id === activeCustomAssessment);
                        if (!assessmentData) return null;

                        return (
                            <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold text-indigo-800">
                                                {assessmentData.name}
                                            </h3>
                                            <p className="text-sm text-indigo-600 mt-1">
                                                Enter scores for this additional assessment (Max: {assessmentData.maxScore})
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setActiveCustomAssessment(null)}
                                            className="p-1 hover:bg-indigo-100 rounded"
                                        >
                                            <X className="w-4 h-4 text-indigo-600" />
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Subject</th>
                                                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Score (0-{assessmentData.maxScore})</th>
                                                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Grade</th>
                                                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {assessments.map((assessment) => {
                                                const currentScores = loadCustomAssessmentScores(selectedStudent.id, activeCustomAssessment);
                                                const currentScore = currentScores[assessment.subject_id] || '';
                                                const scoreNum = currentScore !== '' ? Number(currentScore) : 0;
                                                const grade = currentScore !== '' && scoreNum > 0
                                                    ? calculateGrade(scoreNum, activeConfig?.pass_mark, false, selectedStudent.class?.name)
                                                    : '-';

                                                const handleCustomScoreChange = (value: string) => {
                                                    const numValue = value === '' ? 0 : Math.min(assessmentData.maxScore, Math.max(0, parseInt(value) || 0));
                                                    const newScores = { ...currentScores, [assessment.subject_id]: numValue };
                                                    saveCustomAssessmentScores(selectedStudent.id, activeCustomAssessment, newScores);
                                                    // Force re-render
                                                    loadStudentResults(selectedStudent);
                                                };

                                                return (
                                                    <tr key={assessment.subject_id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 font-medium text-slate-800">{assessment.subject_name}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="relative flex items-center justify-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={assessmentData.maxScore}
                                                                    value={currentScore}
                                                                    onChange={(e) => handleCustomScoreChange(e.target.value)}
                                                                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500"
                                                                    placeholder="-"
                                                                />
                                                                {currentScore !== '' && Number(currentScore) > 0 && (
                                                                    <button
                                                                        onClick={() => handleCustomScoreChange('')}
                                                                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold">
                                                            {grade !== '-' && (
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                                                    grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                                        grade === 'C' ? 'bg-amber-100 text-amber-700' :
                                                                            grade === 'D' ? 'bg-orange-100 text-orange-700' :
                                                                                'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {grade}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-sm text-slate-500">
                                                            Max: {assessmentData.maxScore}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })()} */}

                    {hasEndOfTermScores() && isClassTeacher && (

                        <div className="report-card-section bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Attendance Summary</h3>
                                        <p className="text-sm mt-1 text-green-600 font-medium">
                                            ✓ Auto-populated from attendance records
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                        Auto-synced
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 grid md:grid-cols-4 gap-6">
                                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Total School Days</label>
                                    {loadingAttendance ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                                    ) : (
                                        <p className="text-2xl font-bold text-blue-700">{totalSchoolDays}</p>
                                    )}
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Days Present</label>
                                    {loadingAttendance ? (
                                        <div className="h-10 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                        </div>
                                    ) : (
                                        <p className="text-2xl font-bold text-green-700">{reportCard.days_present ?? 0}</p>
                                    )}
                                </div>

                                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Days Absent</label>
                                    {loadingAttendance ? (
                                        <div className="h-10 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                        </div>
                                    ) : (
                                        <p className="text-2xl font-bold text-red-700">{reportCard.days_absent ?? 0}</p>
                                    )}
                                </div>

                                <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Days Late</label>
                                    {loadingAttendance ? (
                                        <div className="h-10 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                                        </div>
                                    ) : (
                                        <p className="text-2xl font-bold text-yellow-700">{reportCard.days_late ?? 0}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        // <div className="report-card-section bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        //     <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        //         <div className="flex justify-between items-center">
                        //             <div>
                        //                 <h3 className="font-semibold text-slate-800">Report Card Attendnace Details</h3>
                        //                 <p className={`text-sm mt-1 ${isClassTeacher ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                        //                     {/* {isClassTeacher
                        //                         ? 'Report card details are REQUIRED when entering End of Term scores.'
                        //                         : 'Only class teacher can edit attendance and remarks.'
                        //                     } */}
                        //                     {isClassTeacher
                        //                         ? 'Leave them blank for now!'
                        //                         : 'Only class teacher can edit attendance and remarks.'
                        //                     }
                        //                 </p>
                        //             </div>
                        //             {!isClassTeacher && (
                        //                 <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        //                     Class Teacher Only
                        //                 </span>
                        //             )}
                        //         </div>
                        //     </div>
                        //     <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        //         <div className="relative">
                        //             {isClassTeacher && <div className="absolute inset-0 z-10" />}
                        //             <label className="block text-sm font-medium text-slate-700 mb-1">
                        //                 Days Present <span className="text-red-500">*</span>
                        //             </label>
                        //             <input
                        //                 type="number"
                        //                 min="0"
                        //                 // required
                        //                 readOnly={isClassTeacher}
                        //                 value={reportCard.days_present === undefined || reportCard.days_present === null ? '' : reportCard.days_present}
                        //                 onChange={(e) => {
                        //                     if (!isClassTeacher) return;
                        //                     const rawValue = e.target.value;
                        //                     const value = rawValue === '' ? undefined : parseInt(rawValue);
                        //                     const finalValue = isNaN(value) ? undefined : value;
                        //                     setReportCard({ ...reportCard, days_present: finalValue });
                        //                     setReportCardErrors(prev => ({
                        //                         ...prev,
                        //                         days_present: finalValue === undefined
                        //                     }));
                        //                 }}
                        //                 disabled={!isClassTeacher}
                        //                 className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isClassTeacher ? 'bg-slate-100 cursor-not-allowed' : ''} ${reportCardErrors.days_present
                        //                     ? 'border-red-500 bg-red-50'
                        //                     : 'border-slate-300'
                        //                     }`}
                        //                 placeholder={!isClassTeacher ? "Only class teacher can edit" : "Enter number of days"}
                        //             />
                        //             {reportCardErrors.days_present && isClassTeacher && (
                        //                 <p className="mt-1 text-sm text-red-600">Enter number of days present</p>
                        //             )}
                        //         </div>

                        //         <div className="relative">
                        //             {isClassTeacher && <div className="absolute inset-0 z-10" />}
                        //             <label className="block text-sm font-medium text-slate-700 mb-1">
                        //                 Days Absent <span className="text-red-500">*</span>
                        //             </label>
                        //             <input
                        //                 type="number"
                        //                 min="0"
                        //                 // required
                        //                 readOnly={isClassTeacher}
                        //                 value={reportCard.days_absent === undefined || reportCard.days_absent === null ? '' : reportCard.days_absent}
                        //                 onChange={(e) => {
                        //                     if (!isClassTeacher) return;
                        //                     const rawValue = e.target.value;
                        //                     const value = rawValue === '' ? undefined : parseInt(rawValue);
                        //                     const finalValue = isNaN(value) ? undefined : value;
                        //                     setReportCard({ ...reportCard, days_absent: finalValue });
                        //                     setReportCardErrors(prev => ({
                        //                         ...prev,
                        //                         days_absent: finalValue === undefined
                        //                     }));
                        //                 }}
                        //                 disabled={!isClassTeacher}
                        //                 className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isClassTeacher ? 'bg-slate-100 cursor-not-allowed' : ''} ${reportCardErrors.days_absent
                        //                     ? 'border-red-500 bg-red-50'
                        //                     : 'border-slate-300'
                        //                     }`}
                        //                 placeholder={!isClassTeacher ? "Only class teacher can edit" : "Enter number (0 for none)"}
                        //             />
                        //             {reportCardErrors.days_absent && isClassTeacher && (
                        //                 <p className="mt-1 text-sm text-red-600">Enter number of days absent (0 for none)</p>
                        //             )}
                        //         </div>

                        //         <div className="relative">
                        //             {isClassTeacher && <div className="absolute inset-0 z-10" />}
                        //             <label className="block text-sm font-medium text-slate-700 mb-1">
                        //                 Days Late <span className="text-red-500">*</span>
                        //             </label>
                        //             <input
                        //                 type="number"
                        //                 min="0"
                        //                 // required
                        //                 readOnly={isClassTeacher}
                        //                 value={reportCard.days_late === undefined || reportCard.days_late === null ? '' : reportCard.days_late}
                        //                 onChange={(e) => {
                        //                     if (!isClassTeacher) return;
                        //                     const rawValue = e.target.value;
                        //                     const value = rawValue === '' ? undefined : parseInt(rawValue);
                        //                     const finalValue = isNaN(value) ? undefined : value;
                        //                     setReportCard({ ...reportCard, days_late: finalValue });
                        //                     setReportCardErrors(prev => ({
                        //                         ...prev,
                        //                         days_late: finalValue === undefined
                        //                     }));
                        //                 }}
                        //                 disabled={!isClassTeacher}
                        //                 className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${!isClassTeacher ? 'bg-slate-100 cursor-not-allowed' : ''} ${reportCardErrors.days_late
                        //                     ? 'border-red-500 bg-red-50'
                        //                     : 'border-slate-300'
                        //                     }`}
                        //                 placeholder={!isClassTeacher ? "Only class teacher can edit" : "Enter number (0 for none)"}
                        //             />
                        //             {reportCardErrors.days_late && isClassTeacher && (
                        //                 <p className="mt-1 text-sm text-red-600">Enter number of days late (0 for none)</p>
                        //             )}
                        //         </div>
                        //     </div>
                        // </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ResultsManagement;