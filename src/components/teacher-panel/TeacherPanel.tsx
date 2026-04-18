import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, AlertCircle, CheckCircle
} from 'lucide-react';
import {
    fetchAllStudents, fetchAllSubjects, upsertAssessment, upsertReportCard,
    fetchStudentAssessments, fetchStudentReportCard, calculateGrade,
    calculateAndUpdateRanks, fetchClassResults,
    fetchAllClasses
} from '@/services/studentService';
import {
    getActiveGradeConfig, getAllGradeConfigs, calculateFinalScore
} from '@/services/gradeConfigService';
import { Assessment, ClassResultStudent, Student } from '@/types/admin';
import LoadingSpinner from '../common/LoadingSpinner';
import SubjectsManagement from '../admin/SubjectsManagement';
import ClassResultsManagement from '../admin/ClassResultsManagement';
import ResultsManagement from '../admin/ResultsManagement';
import TeacherHeader from './TeacherHeader';
import TeacherTabs from './TeacherTabs';
import {
    fetchTeacherAssignments,
    fetchTeacherClasses,
    fetchTeacherStudents,
    fetchTeacherSubjects,
    isClassTeacher
} from '@/services/teacherService';
import CustomConfirmModal from '../common/CustomConfirmModal';
import CustomAlertModal from '../common/CustomAlertModal';
import TeacherSidebar from './sidebar/TeacherSidebar';
import TeacherClasses from './sidebar/TeacherClasses';
// import TeacherAttendance from './sidebar/TeacherAttendance';
import TeacherTimetable from './sidebar/TeacherTimetable';
import TeacherMessages from './sidebar/MessagingCenter';
import TeacherReports from './sidebar/TeacherReports';
import TeacherProfile from './sidebar/TeacherProfile';
import TeacherAttendance from './sidebar/attendance/TeacherAttendance';
import TeacherAnalyticsManagement from './sidebar/analytics/TeacherAnalyticsManagement';
// import TeacherAnalytics from './sidebar/TeacherAnalytics';

interface TeacherPanelProps {
    onBack: () => void;
}

const TeacherPanel: React.FC<TeacherPanelProps> = ({ onBack }) => {
    // UI state
    const [activeTab, setActiveTab] = useState<'results' | 'classResults'>('results');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Teacher assignment state
    const [assignments, setAssignments] = useState<any[]>([]);
    const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
    const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);
    const [isUserClassTeacher, setIsUserClassTeacher] = useState<boolean>(false);
    const [students, setStudents] = useState<Student[]>([]);

    // Individual student results state
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [reportCard, setReportCard] = useState({
        class_rank: 0,
        qa1_rank: 0,
        qa2_rank: 0,
        total_students: 0,
        days_present: undefined as number | undefined,
        days_absent: undefined as number | undefined,
        days_late: undefined as number | undefined,
        teacher_remarks: ''
    });
    const [savingResults, setSavingResults] = useState(false);

    // Grade configuration (read-only for teachers)
    const [activeConfig, setActiveConfigState] = useState<any>(null);

    // Class-wide results state
    const [classes, setClasses] = useState<any[]>([]);
    const [classResults, setClassResults] = useState<ClassResultStudent[]>([]);
    const [selectedClassForResults, setSelectedClassForResults] = useState<string>('');
    const [activeAssessmentType, setActiveAssessmentType] = useState<'qa1' | 'qa2' | 'endOfTerm' | 'overall'>('overall');
    const [resultsLoading, setResultsLoading] = useState(false);

    // Sidebar state
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
    const [activeMainMenu, setActiveMainMenu] = useState<string>('dashboard');
    const [teacherName, setTeacherName] = useState<string>('Teacher');
    const [teacherInitial, setTeacherInitial] = useState<string>('T');
    const [teacherId, setTeacherId] = useState<string>('');
    const [teacherEmail, setTeacherEmail] = useState<string>('');

    // NEW (mobile sidebar): controls the drawer visibility on small screens
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState<boolean>(false);

    // NEW (shared branding): school name for header + sidebar
    const [schoolName, setSchoolName] = useState<string>('School');

    // Load all teacher data when component mounts
    useEffect(() => {
        loadData();
        fetchSchoolName();
    }, []);

    // NEW (mobile UX): prevent background scrolling while the sidebar drawer is open
    useEffect(() => {
        if (!sidebarMobileOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [sidebarMobileOpen]);

    // NEW: fetch school name
    const fetchSchoolName = async () => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!userStr) {
                setSchoolName('School');
                return;
            }

            const user = JSON.parse(userStr);
            const schoolId = user.schoolId;

            if (!schoolId) {
                setSchoolName('School');
                return;
            }

            const response = await fetch(`https://eduspace-portal-backend.onrender.com/schools/${schoolId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                const schoolData = await response.json();
                setSchoolName(schoolData.name || 'School');
            } else {
                setSchoolName('School');
            }
        } catch (error) {
            console.error('Failed to load school name', error);
            setSchoolName('School');
        }
    };

    /**
     * Load all necessary data for the teacher
     */
    const loadData = async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const teacherUser = userStr ? JSON.parse(userStr) : null;
            const teacherId = teacherUser?.id;

            if (teacherUser?.name) {
                setTeacherName(teacherUser.name);
                setTeacherInitial(teacherUser.name.charAt(0).toUpperCase());
            }

            if (!teacherId) {
                throw new Error('Teacher ID not found');
            }

            if (teacherUser?.id) {
                setTeacherId(teacherUser.id);
            }

            if (teacherUser?.email) {
                setTeacherEmail(teacherUser.email);
            }

            const assignmentsData = await fetchTeacherAssignments(teacherId);
            setAssignments(assignmentsData);

            const [assignedClasses, assignedSubjects, assignedStudents, activeConfigData] = await Promise.all([
                fetchTeacherClasses(teacherId),
                fetchTeacherSubjects(teacherId),
                fetchTeacherStudents(teacherId),
                getActiveGradeConfig()
            ]);

            setTeacherClasses(assignedClasses);
            setTeacherSubjects(assignedSubjects);
            setStudents(assignedStudents);
            setActiveConfigState(activeConfigData);
            setClasses(assignedClasses);

            let isClassTeacherForAnyClass = false;
            for (const cls of assignedClasses) {
                try {
                    const isCT = await isClassTeacher(teacherId, cls.id);
                    if (isCT) {
                        isClassTeacherForAnyClass = true;
                        break;
                    }
                } catch (err) {
                    console.error(`Error checking class teacher status for class ${cls.id}:`, err);
                }
            }
            setIsUserClassTeacher(isClassTeacherForAnyClass);

        } catch (err) {
            setError('Failed to load data');
            console.error('Error loading teacher data:', err);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (msg: string, isError = false) => {
        if (isError) {
            setError(msg);
            setTimeout(() => setError(''), 3000);
        } else {
            setSuccess(msg);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleMenuChange = (menu: string) => {
        setActiveMainMenu(menu);
        // NEW (mobile): close the drawer after selecting a menu item
        setSidebarMobileOpen(false);
    };

    const goToResults = (classId: string) => {
        setActiveMainMenu('dashboard');
        setActiveTab('results');
        showMessage('Ready to enter results');
    };

    const goToAttendance = (classId: string) => {
        setActiveMainMenu('attendance');
        showMessage('Viewing attendance');
    };

    const handleSidebarToggle = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // NEW (mobile): open/close sidebar drawer from the header hamburger
    const handleMobileSidebarToggle = () => {
        setSidebarMobileOpen(prev => !prev);
    };

    const loadStudentResults = async (student: Student) => {
        const isAssignedToClass = assignments.some(a => a.classId === student.class?.id);
        if (!isAssignedToClass) {
            showMessage('You are not assigned to this student\'s class', true);
            return;
        }

        setSelectedStudent(student);
        try {
            const [assessmentsData, reportCardData] = await Promise.all([
                fetchStudentAssessments(student.id),
                fetchStudentReportCard(student.id, student.term || 'Term 1, 2024/2025')
            ]);

            const assignedSubjectIds = assignments
                .filter(a => a.classId === student.class?.id)
                .map(a => a.subjectId);

            const assignedSubjectsData = teacherSubjects.filter(sub =>
                assignedSubjectIds.includes(sub.id)
            );

            const assessmentMap = new Map<string, Assessment>();
            assignedSubjectsData.forEach(sub => {
                assessmentMap.set(sub.id, {
                    subject_id: sub.id,
                    subject_name: sub.name,
                    qa1: null,
                    qa2: null,
                    end_of_term: null,
                    qa1_absent: false,
                    qa2_absent: false,
                    end_of_term_absent: false
                });
            });

            assessmentsData.forEach((a: any) => {
                const subjectId = a.subject_id || a.subject?.id;
                const assessmentType = a.assessment_type || a.assessmentType;
                const score = a.score;
                const absent = a.isAbsent === true || a.absent === true;

                if (subjectId && assignedSubjectIds.includes(subjectId)) {
                    const existing = assessmentMap.get(subjectId);
                    if (existing) {
                        if (assessmentType === 'qa1') {
                            existing.qa1 = absent ? null : score;
                            existing.qa1_absent = absent;
                        }
                        if (assessmentType === 'qa2') {
                            existing.qa2 = absent ? null : score;
                            existing.qa2_absent = absent;
                        }
                        if (assessmentType === 'end_of_term') {
                            existing.end_of_term = absent ? null : score;
                            existing.end_of_term_absent = absent;
                        }
                    }
                }
            });

            setAssessments(Array.from(assessmentMap.values()));

            if (reportCardData) {
                setReportCard({
                    class_rank: reportCardData.class_rank || 0,
                    qa1_rank: reportCardData.qa1_rank || 0,
                    qa2_rank: reportCardData.qa2_rank || 0,
                    total_students: reportCardData.total_students || 0,
                    days_present: reportCardData.days_present === 0 ? undefined : reportCardData.days_present,
                    days_absent: reportCardData.days_absent === 0 ? undefined : reportCardData.days_absent,
                    days_late: reportCardData.days_late === 0 ? undefined : reportCardData.days_late,
                    teacher_remarks: reportCardData.teacher_remarks || ''
                });
            } else {
                setReportCard({
                    class_rank: 0,
                    qa1_rank: 0,
                    qa2_rank: 0,
                    total_students: 0,
                    days_present: undefined,
                    days_absent: undefined,
                    days_late: undefined,
                    teacher_remarks: ''
                });
            }
        } catch (err) {
            showMessage('Failed to load student results', true);
            console.error('Error loading student results:', err);
        }
    };

    const updateAssessmentScore = (
        subjectId: string,
        field: 'qa1' | 'qa2' | 'end_of_term',
        value: number | null,
        isAbsent?: boolean
    ) => {
        const isAssignedSubject = assignments.some(a =>
            a.subjectId === subjectId &&
            a.classId === selectedStudent?.class?.id
        );

        if (!isAssignedSubject) {
            showMessage('You are not assigned to this subject', true);
            return;
        }

        setAssessments(prev => prev.map(a => {
            if (a.subject_id === subjectId) {
                const update = { ...a };

                if (field === 'qa1') {
                    update.qa1 = value;
                    update.qa1_absent = isAbsent || false;
                    if (isAbsent) {
                        update.qa1 = null;
                    }
                } else if (field === 'qa2') {
                    update.qa2 = value;
                    update.qa2_absent = isAbsent || false;
                    if (isAbsent) {
                        update.qa2 = null;
                    }
                } else if (field === 'end_of_term') {
                    update.end_of_term = value;
                    update.end_of_term_absent = isAbsent || false;
                    if (isAbsent) {
                        update.end_of_term = null;
                    }
                }

                return update;
            }
            return a;
        }));
    };

    const saveAllResults = async () => {
        if (!selectedStudent) return;

        const isAssignedToClass = assignments.some(a => a.classId === selectedStudent.class?.id);
        if (!isAssignedToClass) {
            showMessage('You are not assigned to this student\'s class', true);
            return;
        }

        setSavingResults(true);
        try {
            const passMark = activeConfig?.pass_mark || 50;

            for (const assessment of assessments) {
                const isAssignedSubject = assignments.some(a =>
                    a.subjectId === assessment.subject_id &&
                    a.classId === selectedStudent.class?.id
                );

                if (!isAssignedSubject) continue;

                await upsertAssessment({
                    student_id: selectedStudent.id,
                    subject_id: assessment.subject_id,
                    assessment_type: 'qa1',
                    score: assessment.qa1_absent ? 0 : assessment.qa1,
                    grade: assessment.qa1 !== null ? calculateGrade(assessment.qa1, passMark, false, selectedStudent.class?.name) : null,
                    is_absent: assessment.qa1_absent || false
                });

                await upsertAssessment({
                    student_id: selectedStudent.id,
                    subject_id: assessment.subject_id,
                    assessment_type: 'qa2',
                    score: assessment.qa2_absent ? 0 : assessment.qa2,
                    grade: assessment.qa2 !== null ? calculateGrade(assessment.qa2, passMark, false, selectedStudent.class?.name) : null,
                    is_absent: assessment.qa2_absent || false
                });

                await upsertAssessment({
                    student_id: selectedStudent.id,
                    subject_id: assessment.subject_id,
                    assessment_type: 'end_of_term',
                    score: assessment.end_of_term_absent ? 0 : assessment.end_of_term,
                    grade: assessment.end_of_term !== null ? calculateGrade(assessment.end_of_term, passMark, false, selectedStudent.class?.name) : null,
                    is_absent: assessment.end_of_term_absent || false
                });
            }

            if (isUserClassTeacher) {
                await upsertReportCard({
                    student_id: selectedStudent.id,
                    term: selectedStudent.term || 'Term 1, 2024/2025',
                    days_present: reportCard.days_present,
                    days_absent: reportCard.days_absent,
                    days_late: reportCard.days_late,
                    teacher_remarks: reportCard.teacher_remarks
                });
            }

            if (selectedStudent.class?.id) {
                await calculateAndUpdateRanks(
                    selectedStudent.class.id,
                    selectedStudent.term || 'Term 1, 2024/2025'
                );
            }

            showMessage('Results saved and ranks auto-calculated!');
            loadStudentResults(selectedStudent);
        } catch (err: any) {
            showMessage(err.message || 'Failed to save results', true);
            console.error('Error saving results:', err);
        } finally {
            setSavingResults(false);
        }
    };

    const loadClassResults = async (classId: string) => {
        const isAssignedToClass = assignments.some(a => a.classId === classId);
        if (!isAssignedToClass) {
            showMessage('You are not assigned to this class', true);
            return;
        }

        setResultsLoading(true);
        try {
            const results = await fetchClassResults(classId);
            setClassResults(results);
        } catch (error) {
            console.error('Failed to load class results:', error);
            showMessage('Failed to load class results', true);
        } finally {
            setResultsLoading(false);
        }
    };

    const handleTabChange = (tab: 'results' | 'classResults') => {
        setActiveTab(tab);
        setSelectedStudent(null);
    };

    // NEW: school initial for header/sidebar
    const schoolInitial = (schoolName || 'School').charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-100 overflow-x-hidden md:flex">
            <TeacherSidebar
                activeMainSection={activeMainMenu}
                onSectionChange={handleMenuChange}
                onBack={onBack}
                isCollapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
                teacherName={teacherName}
                teacherInitial={teacherInitial}
                // NEW (mobile): drawer state + close handler
                isMobileOpen={sidebarMobileOpen}
                onMobileClose={() => setSidebarMobileOpen(false)}
                schoolName={schoolName}
                schoolInitial={schoolInitial}
            />

            {/* NEW (mobile): no left padding on small screens to keep content inside viewport */}
            <div className={`flex-1 transition-all duration-300 pl-0 ${sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'} min-w-0`}>
                <TeacherHeader
                    onBack={onBack}
                    teacherName={teacherName}
                    teacherInitial={teacherInitial}
                    schoolName={schoolName}
                    schoolInitial={schoolInitial}
                    onMobileMenuClick={handleMobileSidebarToggle}
                    isMobileMenuOpen={sidebarMobileOpen}
                    onProfileClick={() => handleMenuChange('profile')}
                />

                {error && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <p className="text-emerald-700">{success}</p>
                        </div>
                    </div>
                )}

                {activeMainMenu === 'dashboard' ? (
                    <>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                            <TeacherTabs activeTab={activeTab} onTabChange={handleTabChange} />
                        </div>

                        <CustomConfirmModal
                            isOpen={showConfirmModal}
                            title="Calculate Final Ranks"
                            message="This will recalculate rankings for all your classes based on all entered scores. Are you sure you want to continue?"
                            onConfirm={async () => {
                                setShowConfirmModal(false);
                                setSavingResults(true);
                                try {
                                    const classData = JSON.parse(localStorage.getItem('selectedClassForRank') || '{}');

                                    if (classData.id) {
                                        await calculateAndUpdateRanks(
                                            classData.id,
                                            classData.term || 'Term 1, 2024/2025'
                                        );
                                        setSuccessMessage(`Ranks calculated for ${classData.name} successfully!`);
                                        localStorage.removeItem('selectedClassForRank');
                                    } else {
                                        const uniqueClassIds = [...new Set(assignments.map(a => a.classId))];
                                        for (const classId of uniqueClassIds) {
                                            const classItem = teacherClasses.find(c => c.id === classId);
                                            if (classItem) {
                                                await calculateAndUpdateRanks(
                                                    classId,
                                                    classItem.term || 'Term 1, 2024/2025'
                                                );
                                            }
                                        }
                                        setSuccessMessage('All ranks calculated successfully!');
                                    }
                                    setShowSuccessModal(true);
                                    if (activeTab === 'classResults' && selectedClassForResults) {
                                        await loadClassResults(selectedClassForResults);
                                    } else {
                                        await loadData();
                                    }
                                } catch (error) {
                                    setErrorMessage('Error calculating ranks');
                                    setShowSuccessModal(true);
                                } finally {
                                    setSavingResults(false);
                                }
                            }}
                            onCancel={() => setShowConfirmModal(false)}
                        />

                        <CustomAlertModal
                            isOpen={showSuccessModal}
                            title={errorMessage ? 'Error' : 'Success'}
                            message={errorMessage || successMessage}
                            type={errorMessage ? 'error' : 'success'}
                            onClose={() => {
                                setShowSuccessModal(false);
                                setErrorMessage('');
                                setSuccessMessage('');
                            }}
                        />

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            {loading ? (
                                <LoadingSpinner message="Loading teacher data..." />
                            ) : activeTab === 'classResults' ? (
                                <ClassResultsManagement
                                    classes={teacherClasses}
                                    subjects={teacherSubjects}
                                    classResults={classResults}
                                    students={students}
                                    selectedClassForResults={selectedClassForResults}
                                    activeAssessmentType={activeAssessmentType}
                                    resultsLoading={resultsLoading}
                                    activeConfig={activeConfig}
                                    setSelectedClassForResults={setSelectedClassForResults}
                                    setActiveAssessmentType={setActiveAssessmentType}
                                    loadClassResults={loadClassResults}
                                    calculateGrade={calculateGrade}
                                    isTeacherView={true}
                                />
                            ) : (
                                <ResultsManagement
                                    students={students}
                                    classes={teacherClasses}
                                    subjects={teacherSubjects}
                                    selectedStudent={selectedStudent}
                                    assessments={assessments}
                                    reportCard={reportCard}
                                    savingResults={savingResults}
                                    activeConfig={activeConfig}
                                    setSelectedStudent={setSelectedStudent}
                                    setAssessments={setAssessments}
                                    setReportCard={setReportCard}
                                    loadStudentResults={loadStudentResults}
                                    saveAllResults={saveAllResults}
                                    updateAssessmentScore={updateAssessmentScore}
                                    calculateGrade={calculateGrade}
                                    calculateFinalScore={calculateFinalScore}
                                    isTeacherView={true}
                                    isClassTeacher={isUserClassTeacher}
                                    setShowConfirmModal={setShowConfirmModal}
                                    setSuccessMessage={setSuccessMessage}
                                    setShowSuccessModal={setShowSuccessModal}
                                    setErrorMessage={setErrorMessage}

                                />
                            )}
                        </div>
                    </>
                ) : activeMainMenu === 'my-classes' ? (
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <TeacherClasses
                            classes={teacherClasses}
                            students={students}
                            subjects={teacherSubjects}
                            showMessage={showMessage}
                            onViewResults={goToResults}
                            onViewAttendance={goToAttendance}
                        />
                    </div>
                ) : activeMainMenu === 'attendance' ? (
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <TeacherAttendance
                            classes={teacherClasses}
                            students={students}
                            teacherId={teacherId}
                            showMessage={showMessage}
                        />
                    </div>
                ) : activeMainMenu === 'performance-analytics' ? (
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <TeacherAnalyticsManagement
                            teacherId={teacherId}
                            teacherName={teacherName}
                            classes={teacherClasses}
                            students={students}
                            subjects={teacherSubjects}
                            showMessage={showMessage}
                        />
                    </div>
                ) : activeMainMenu === 'timetable' ? (
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <TeacherTimetable
                            classes={teacherClasses}
                            subjects={teacherSubjects}
                            teacherId={teacherId}
                            teacherName={teacherName}
                            showMessage={showMessage}
                        />
                    </div>
                ) : activeMainMenu === 'messages' ? (
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <TeacherMessages
                            classes={teacherClasses}
                            students={students}
                            subjects={teacherSubjects}
                            teacherId={teacherId}
                            teacherName={teacherName}
                            showMessage={showMessage}
                        />
                    </div>
                ) : activeMainMenu === 'reports' ? (
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <TeacherReports
                            classes={teacherClasses}
                            students={students}
                            subjects={teacherSubjects}
                            teacherId={teacherId}
                            teacherName={teacherName}
                            showMessage={showMessage}
                        />
                    </div>
                ) : activeMainMenu === 'profile' ? (
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <TeacherProfile
                            teacherId={teacherId}
                            teacherName={teacherName}
                            teacherEmail={teacherEmail}
                            showMessage={showMessage}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default TeacherPanel;

// import React, { useState, useEffect } from 'react';
// import {
//     ArrowLeft, AlertCircle, CheckCircle
// } from 'lucide-react';
// import {
//     fetchAllStudents, fetchAllSubjects, upsertAssessment, upsertReportCard,
//     fetchStudentAssessments, fetchStudentReportCard, calculateGrade,
//     calculateAndUpdateRanks, fetchClassResults,
//     fetchAllClasses
// } from '@/services/studentService';
// import {
//     getActiveGradeConfig, getAllGradeConfigs, calculateFinalScore
// } from '@/services/gradeConfigService';
// import { Assessment, ClassResultStudent, Student } from '@/types/admin';
// import LoadingSpinner from '../common/LoadingSpinner';
// import SubjectsManagement from '../admin/SubjectsManagement';
// import ClassResultsManagement from '../admin/ClassResultsManagement';
// import ResultsManagement from '../admin/ResultsManagement';
// import TeacherHeader from './TeacherHeader';
// import TeacherTabs from './TeacherTabs';
// import {
//     fetchTeacherAssignments,
//     fetchTeacherClasses,
//     fetchTeacherStudents,
//     fetchTeacherSubjects,
//     isClassTeacher
// } from '@/services/teacherService';
// import CustomConfirmModal from '../common/CustomConfirmModal';
// import CustomAlertModal from '../common/CustomAlertModal';
// import TeacherSidebar from './sidebar/TeacherSidebar';
// import TeacherClasses from './sidebar/TeacherClasses';
// import TeacherAttendance from './sidebar/TeacherAttendance';
// import TeacherTimetable from './sidebar/TeacherTimetable';
// // import MessagingCenter from './sidebar/MessagingCenter';
// import TeacherMessages from './sidebar/MessagingCenter';
// import TeacherReports from './sidebar/TeacherReports';
// import TeacherProfile from './sidebar/TeacherProfile';
// // import TeacherMessages from './sidebar/MessagingCenter';

// interface TeacherPanelProps {
//     onBack: () => void;
// }

// const TeacherPanel: React.FC<TeacherPanelProps> = ({ onBack }) => {
//     // UI state
//     const [activeTab, setActiveTab] = useState<'results' | 'classResults'>('results');
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const [showConfirmModal, setShowConfirmModal] = useState(false);
//     const [showSuccessModal, setShowSuccessModal] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');
//     const [errorMessage, setErrorMessage] = useState('');

//     // Teacher assignment state
//     const [assignments, setAssignments] = useState<any[]>([]);           // Which subjects teacher teaches in which classes
//     const [teacherClasses, setTeacherClasses] = useState<any[]>([]);     // Classes teacher is assigned to
//     const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);   // Subjects teacher teaches
//     const [isUserClassTeacher, setIsUserClassTeacher] = useState<boolean>(false); // Whether teacher is a class teacher
//     const [students, setStudents] = useState<Student[]>([]);             // Students teacher can access

//     // Individual student results state
//     const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
//     const [assessments, setAssessments] = useState<Assessment[]>([]);
//     const [reportCard, setReportCard] = useState({
//         class_rank: 0,
//         qa1_rank: 0,
//         qa2_rank: 0,
//         total_students: 0,
//         days_present: undefined as number | undefined,
//         days_absent: undefined as number | undefined,
//         days_late: undefined as number | undefined,
//         teacher_remarks: ''
//     });
//     const [savingResults, setSavingResults] = useState(false);

//     // Grade configuration (read-only for teachers)
//     const [activeConfig, setActiveConfigState] = useState<any>(null);

//     // Class-wide results state
//     const [classes, setClasses] = useState<any[]>([]);
//     const [classResults, setClassResults] = useState<ClassResultStudent[]>([]);
//     const [selectedClassForResults, setSelectedClassForResults] = useState<string>('');
//     const [activeAssessmentType, setActiveAssessmentType] = useState<'qa1' | 'qa2' | 'endOfTerm' | 'overall'>('overall');
//     const [resultsLoading, setResultsLoading] = useState(false);

//     // Add these with your other state declarations
//     const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
//     const [activeMainMenu, setActiveMainMenu] = useState<string>('dashboard');
//     const [teacherName, setTeacherName] = useState<string>('Teacher');
//     const [teacherInitial, setTeacherInitial] = useState<string>('T');
//     const [teacherId, setTeacherId] = useState<string>('');
//     const [teacherEmail, setTeacherEmail] = useState<string>('');

//     // Load all teacher data when component mounts
//     useEffect(() => {
//         loadData();
//     }, []);

//     /**
//      * Load all necessary data for the teacher
//      * - Fetches teacher's assignments (which subjects in which classes)
//      * - Fetches classes, subjects, and students teacher has access to
//      * - Checks if teacher is a class teacher for any class
//      */
//     const loadData = async () => {
//         setLoading(true);
//         try {
//             const userStr = localStorage.getItem('user');
//             const teacherUser = userStr ? JSON.parse(userStr) : null;
//             const teacherId = teacherUser?.id;

//             // ADD THIS - Get teacher name for sidebar
//             if (teacherUser?.name) {
//                 setTeacherName(teacherUser.name);
//                 setTeacherInitial(teacherUser.name.charAt(0).toUpperCase());
//             }

//             if (!teacherId) {
//                 throw new Error('Teacher ID not found');
//             }

//             if (teacherUser?.id) {
//                 setTeacherId(teacherUser.id);
//             }

//             if (teacherUser?.id) {
//                 setTeacherId(teacherUser.id);
//             }

//             if (teacherUser?.email) {
//                 setTeacherEmail(teacherUser.email);
//             }

//             // 1. Get teacher's assignments (which subjects they teach in which classes)
//             const assignmentsData = await fetchTeacherAssignments(teacherId);
//             setAssignments(assignmentsData);

//             // 2. Get all related data in parallel
//             const [assignedClasses, assignedSubjects, assignedStudents, activeConfigData] = await Promise.all([
//                 fetchTeacherClasses(teacherId),
//                 fetchTeacherSubjects(teacherId),
//                 fetchTeacherStudents(teacherId),
//                 getActiveGradeConfig()
//             ]);

//             setTeacherClasses(assignedClasses);
//             setTeacherSubjects(assignedSubjects);
//             setStudents(assignedStudents);
//             setActiveConfigState(activeConfigData);
//             setClasses(assignedClasses); // For backward compatibility

//             // 3. Check if teacher is a class teacher for any of their classes
//             let isClassTeacherForAnyClass = false;
//             for (const cls of assignedClasses) {
//                 try {
//                     const isCT = await isClassTeacher(teacherId, cls.id);
//                     if (isCT) {
//                         isClassTeacherForAnyClass = true;
//                         break;
//                     }
//                 } catch (err) {
//                     console.error(`Error checking class teacher status for class ${cls.id}:`, err);
//                 }
//             }
//             setIsUserClassTeacher(isClassTeacherForAnyClass);

//         } catch (err) {
//             setError('Failed to load data');
//             console.error('Error loading teacher data:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     /**
//      * Show temporary success/error message
//      */
//     const showMessage = (msg: string, isError = false) => {
//         if (isError) {
//             setError(msg);
//             setTimeout(() => setError(''), 3000);
//         } else {
//             setSuccess(msg);
//             setTimeout(() => setSuccess(''), 3000);
//         }
//     };

//     // Add menu change handler - EXACT same as Admin
//     const handleMenuChange = (menu: string) => {
//         setActiveMainMenu(menu);
//     };

//     // Add these navigation functions
//     const goToResults = (classId: string) => {
//         setActiveMainMenu('dashboard');  // Switch to dashboard
//         setActiveTab('results');          // Switch to results tab
//         showMessage('Ready to enter results');
//     };

//     const goToAttendance = (classId: string) => {
//         setActiveMainMenu('attendance');  // Switch to attendance page
//         showMessage('Viewing attendance');
//     };

//     // Add sidebar toggle handler
//     const handleSidebarToggle = () => {
//         setSidebarCollapsed(!sidebarCollapsed);
//     };

//     /**
//      * Load results for a specific student
//      * Only shows subjects the teacher is assigned to teach in that student's class
//      */
//     const loadStudentResults = async (student: Student) => {
//         // Verify teacher has access to this student's class
//         const isAssignedToClass = assignments.some(a => a.classId === student.class?.id);
//         if (!isAssignedToClass) {
//             showMessage('You are not assigned to this student\'s class', true);
//             return;
//         }

//         setSelectedStudent(student);
//         try {
//             // Fetch existing assessments and report card
//             const [assessmentsData, reportCardData] = await Promise.all([
//                 fetchStudentAssessments(student.id),
//                 fetchStudentReportCard(student.id, student.term || 'Term 1, 2024/2025')
//             ]);

//             // 👇 ADD LOG 1 HERE
//             console.log('1. RAW DATA FROM BACKEND:', JSON.stringify(assessmentsData, null, 2));

//             // Get subjects teacher is assigned to teach in THIS specific class
//             const assignedSubjectIds = assignments
//                 .filter(a => a.classId === student.class?.id)
//                 .map(a => a.subjectId);

//             // Filter subjects to only those teacher can teach
//             const assignedSubjectsData = teacherSubjects.filter(sub =>
//                 assignedSubjectIds.includes(sub.id)
//             );

//             // Create a map of subjects with default values (null, not 0)
//             const assessmentMap = new Map<string, Assessment>();
//             assignedSubjectsData.forEach(sub => {
//                 assessmentMap.set(sub.id, {
//                     subject_id: sub.id,
//                     subject_name: sub.name,
//                     qa1: null,           // null = not entered yet
//                     qa2: null,            // null = not entered yet
//                     end_of_term: null,    // null = not entered yet
//                     qa1_absent: false,    // Not absent by default
//                     qa2_absent: false,    // Not absent by default
//                     end_of_term_absent: false // Not absent by default
//                 });
//             });

//             // Populate with existing assessment data
//             assessmentsData.forEach((a: any) => {
//                 const subjectId = a.subject_id || a.subject?.id;
//                 const assessmentType = a.assessment_type || a.assessmentType;
//                 const score = a.score;
//                 // const absent = a.absent || false;
//                 const absent = a.isAbsent === true || a.absent === true;  // Check both possible names

//                 // Only include if teacher is assigned to this subject
//                 if (subjectId && assignedSubjectIds.includes(subjectId)) {
//                     const existing = assessmentMap.get(subjectId);
//                     if (existing) {
//                         if (assessmentType === 'qa1') {
//                             existing.qa1 = absent ? null : score;  // null if absent
//                             existing.qa1_absent = absent;
//                         }
//                         if (assessmentType === 'qa2') {
//                             existing.qa2 = absent ? null : score;  // null if absent
//                             existing.qa2_absent = absent;
//                         }
//                         if (assessmentType === 'end_of_term') {
//                             existing.end_of_term = absent ? null : score;  // null if absent
//                             existing.end_of_term_absent = absent;
//                         }
//                     }
//                 }
//             });

//             setAssessments(Array.from(assessmentMap.values()));

//             // 👇 ADD LOG 2 HERE
//             console.log('2. MAPPED ASSESSMENTS:', JSON.stringify(Array.from(assessmentMap.values()), null, 2));

//             // Set report card data (or defaults)
//             if (reportCardData) {
//                 setReportCard({
//                     class_rank: reportCardData.class_rank || 0,
//                     qa1_rank: reportCardData.qa1_rank || 0,
//                     qa2_rank: reportCardData.qa2_rank || 0,
//                     total_students: reportCardData.total_students || 0,
//                     days_present: reportCardData.days_present === 0 ? undefined : reportCardData.days_present,
//                     days_absent: reportCardData.days_absent === 0 ? undefined : reportCardData.days_absent,
//                     days_late: reportCardData.days_late === 0 ? undefined : reportCardData.days_late,
//                     teacher_remarks: reportCardData.teacher_remarks || ''
//                 });
//             } else {
//                 setReportCard({
//                     class_rank: 0,
//                     qa1_rank: 0,
//                     qa2_rank: 0,
//                     total_students: 0,
//                     days_present: undefined,
//                     days_absent: undefined,
//                     days_late: undefined,
//                     teacher_remarks: ''
//                 });
//             }
//         } catch (err) {
//             showMessage('Failed to load student results', true);
//             console.error('Error loading student results:', err);
//         }
//     };

//     /**
//      * Update a single assessment score
//      * @param subjectId - The subject being updated
//      * @param field - Which assessment field (qa1, qa2, end_of_term)
//      * @param value - The score value (null for empty)
//      * @param isAbsent - Whether student was absent for this assessment
//      */
//     const updateAssessmentScore = (
//         subjectId: string,
//         field: 'qa1' | 'qa2' | 'end_of_term',
//         value: number | null,
//         isAbsent?: boolean
//     ) => {
//         // Verify teacher is assigned to this subject in the current student's class
//         const isAssignedSubject = assignments.some(a =>
//             a.subjectId === subjectId &&
//             a.classId === selectedStudent?.class?.id
//         );

//         if (!isAssignedSubject) {
//             showMessage('You are not assigned to this subject', true);
//             return;
//         }

//         // Update the assessment in state
//         setAssessments(prev => prev.map(a => {
//             if (a.subject_id === subjectId) {
//                 const update = { ...a };

//                 // Handle each field type
//                 if (field === 'qa1') {
//                     update.qa1 = value;
//                     update.qa1_absent = isAbsent || false;
//                     if (isAbsent) {
//                         update.qa1 = null;  // If absent, score is null
//                     }
//                 } else if (field === 'qa2') {
//                     update.qa2 = value;
//                     update.qa2_absent = isAbsent || false;
//                     if (isAbsent) {
//                         update.qa2 = null;  // If absent, score is null
//                     }
//                 } else if (field === 'end_of_term') {
//                     update.end_of_term = value;
//                     update.end_of_term_absent = isAbsent || false;
//                     if (isAbsent) {
//                         update.end_of_term = null;  // If absent, score is null
//                     }
//                 }

//                 return update;
//             }
//             return a;
//         }));
//     };



//     const saveAllResults = async () => {
//         if (!selectedStudent) return;

//         // Verify teacher has access to this student's class
//         const isAssignedToClass = assignments.some(a => a.classId === selectedStudent.class?.id);
//         if (!isAssignedToClass) {
//             showMessage('You are not assigned to this student\'s class', true);
//             return;
//         }

//         setSavingResults(true);
//         try {
//             const passMark = activeConfig?.pass_mark || 50;

//             // Save each assessment for subjects teacher is assigned to
//             for (const assessment of assessments) {
//                 // Double-check teacher is assigned to this subject
//                 const isAssignedSubject = assignments.some(a =>
//                     a.subjectId === assessment.subject_id &&
//                     a.classId === selectedStudent.class?.id
//                 );

//                 if (!isAssignedSubject) continue;

//                 console.log('Saving QA1:', {
//                     student_id: selectedStudent.id,
//                     subject_id: assessment.subject_id,
//                     assessment_type: 'qa1',
//                     score: assessment.qa1_absent ? 0 : assessment.qa1, // FIX: Send 0 when absent
//                     grade: assessment.qa1 !== null ? calculateGrade(assessment.qa1, passMark) : null,
//                     is_absent: assessment.qa1_absent || false
//                 });

//                 // Save QA1
//                 await upsertAssessment({
//                     student_id: selectedStudent.id,
//                     subject_id: assessment.subject_id,
//                     assessment_type: 'qa1',
//                     score: assessment.qa1_absent ? 0 : assessment.qa1, // FIX: Send 0 when absent
//                     grade: assessment.qa1 !== null ? calculateGrade(assessment.qa1, passMark) : null,
//                     is_absent: assessment.qa1_absent || false
//                 });

//                 // Save QA2
//                 await upsertAssessment({
//                     student_id: selectedStudent.id,
//                     subject_id: assessment.subject_id,
//                     assessment_type: 'qa2',
//                     score: assessment.qa2_absent ? 0 : assessment.qa2, // FIX: Send 0 when absent
//                     grade: assessment.qa2 !== null ? calculateGrade(assessment.qa2, passMark) : null,
//                     is_absent: assessment.qa2_absent || false
//                 });

//                 // Save End of Term
//                 await upsertAssessment({
//                     student_id: selectedStudent.id,
//                     subject_id: assessment.subject_id,
//                     assessment_type: 'end_of_term',
//                     score: assessment.end_of_term_absent ? 0 : assessment.end_of_term, // FIX: Send 0 when absent
//                     grade: assessment.end_of_term !== null ? calculateGrade(assessment.end_of_term, passMark) : null,
//                     is_absent: assessment.end_of_term_absent || false
//                 });
//             }

//             // Save report card ONLY if teacher is a class teacher
//             if (isUserClassTeacher) {
//                 await upsertReportCard({
//                     student_id: selectedStudent.id,
//                     term: selectedStudent.term || 'Term 1, 2024/2025',
//                     days_present: reportCard.days_present,
//                     days_absent: reportCard.days_absent,
//                     days_late: reportCard.days_late,
//                     teacher_remarks: reportCard.teacher_remarks
//                 });
//             }

//             // // Trigger automatic rank recalculation for the class
//             if (selectedStudent.class?.id) {
//                 await calculateAndUpdateRanks(
//                     selectedStudent.class.id,
//                     selectedStudent.term || 'Term 1, 2024/2025'
//                 );
//             }

//             showMessage('Results saved and ranks auto-calculated!');

//             // Reload to show updated data
//             loadStudentResults(selectedStudent);
//         } catch (err: any) {
//             showMessage(err.message || 'Failed to save results', true);
//             console.error('Error saving results:', err);
//         } finally {
//             setSavingResults(false);
//         }
//     };

//     /**
//      * Load results for an entire class
//      */
//     const loadClassResults = async (classId: string) => {
//         // Verify teacher has access to this class
//         const isAssignedToClass = assignments.some(a => a.classId === classId);
//         if (!isAssignedToClass) {
//             showMessage('You are not assigned to this class', true);
//             return;
//         }

//         setResultsLoading(true);
//         try {
//             const results = await fetchClassResults(classId);
//             setClassResults(results);
//         } catch (error) {
//             console.error('Failed to load class results:', error);
//             showMessage('Failed to load class results', true);
//         } finally {
//             setResultsLoading(false);
//         }
//     };

//     /**
//      * Handle tab switching
//      */
//     const handleTabChange = (tab: 'results' | 'classResults') => {
//         setActiveTab(tab);
//         setSelectedStudent(null); // Clear selected student when switching tabs
//     };

//     return (
//         <div className="min-h-screen bg-slate-100">

//             {/* Sidebar */}
//             <TeacherSidebar
//                 activeMainSection={activeMainMenu}
//                 onSectionChange={handleMenuChange}
//                 onBack={onBack}
//                 isCollapsed={sidebarCollapsed}
//                 onToggle={handleSidebarToggle}
//                 teacherName={teacherName}
//                 teacherInitial={teacherInitial}
//             />
//             <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
//                 <TeacherHeader
//                     onBack={onBack}
//                     teacherName={teacherName}
//                     teacherInitial={teacherInitial}
//                 />

//                 {/* Error message display */}
//                 {error && (
//                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
//                         <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
//                             <AlertCircle className="w-5 h-5 text-red-500" />
//                             <p className="text-red-700">{error}</p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Success message display */}
//                 {success && (
//                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
//                         <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
//                             <CheckCircle className="w-5 h-5 text-emerald-500" />
//                             <p className="text-emerald-700">{success}</p>
//                         </div>
//                     </div>
//                 )}

//                 {/* CONDITIONAL CONTENT - EXACTLY LIKE ADMIN PANEL */}
//                 {activeMainMenu === 'dashboard' ? (
//                     <>

//                         {/* Tab navigation */}
//                         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
//                             <TeacherTabs activeTab={activeTab} onTabChange={handleTabChange} />

//                             {/* Calculate Ranks Button - Smaller and inline */}
//                             {/* <div className="mt-2 flex justify-end">
//                     <button
//                         onClick={() => setShowConfirmModal(true)}
//                         className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg shadow transition-colors duration-200 flex items-center gap-2"
//                         disabled={savingResults}
//                     >
//                         {savingResults ? (
//                             <>⏳ Calculating...</>
//                         ) : (
//                             <>🔴 Calculate Final Ranks (Click after entering all scores)</>
//                         )}
//                     </button>
//                 </div> */}
//                         </div>

//                         {/* Custom Confirm Modal */}
//                         <CustomConfirmModal
//                             isOpen={showConfirmModal}
//                             title="Calculate Final Ranks"
//                             message="This will recalculate rankings for all your classes based on all entered scores. Are you sure you want to continue?"
//                             onConfirm={async () => {
//                                 setShowConfirmModal(false);
//                                 setSavingResults(true);
//                                 try {
//                                     // Get the class info from localStorage (set by the button in ResultsManagement)
//                                     const classData = JSON.parse(localStorage.getItem('selectedClassForRank') || '{}');

//                                     if (classData.id) {
//                                         await calculateAndUpdateRanks(
//                                             classData.id,
//                                             classData.term || 'Term 1, 2024/2025'
//                                         );

//                                         setSuccessMessage(`Ranks calculated for ${classData.name} successfully!`);
//                                         localStorage.removeItem('selectedClassForRank');
//                                     } else {
//                                         // Fallback to all classes if no specific class selected
//                                         const uniqueClassIds = [...new Set(assignments.map(a => a.classId))];
//                                         for (const classId of uniqueClassIds) {
//                                             const classItem = teacherClasses.find(c => c.id === classId);
//                                             if (classItem) {
//                                                 await calculateAndUpdateRanks(
//                                                     classId,
//                                                     classItem.term || 'Term 1, 2024/2025'
//                                                 );
//                                             }
//                                         }
//                                         setSuccessMessage('All ranks calculated successfully!');
//                                     }

//                                     setShowSuccessModal(true);

//                                     if (activeTab === 'classResults' && selectedClassForResults) {
//                                         await loadClassResults(selectedClassForResults);
//                                     } else {
//                                         await loadData();
//                                     }

//                                 } catch (error) {
//                                     setErrorMessage('Error calculating ranks');
//                                     setShowSuccessModal(true);
//                                 } finally {
//                                     setSavingResults(false);
//                                 }
//                             }}
//                             onCancel={() => setShowConfirmModal(false)}
//                         />

//                         {/* Success/Error Modal - Add this after the confirm modal */}
//                         <CustomAlertModal
//                             isOpen={showSuccessModal}
//                             title={errorMessage ? 'Error' : 'Success'}
//                             message={errorMessage || successMessage}
//                             type={errorMessage ? 'error' : 'success'}
//                             onClose={() => {
//                                 setShowSuccessModal(false);
//                                 setErrorMessage('');
//                                 setSuccessMessage('');
//                             }}
//                         />

//                         {/* Main content area */}
//                         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//                             {loading ? (
//                                 <LoadingSpinner message="Loading teacher data..." />
//                             ) : activeTab === 'classResults' ? (
//                                 /* Class-wide results view */
//                                 <ClassResultsManagement
//                                     classes={teacherClasses}
//                                     subjects={teacherSubjects}
//                                     classResults={classResults}
//                                     students={students}
//                                     selectedClassForResults={selectedClassForResults}
//                                     activeAssessmentType={activeAssessmentType}
//                                     resultsLoading={resultsLoading}
//                                     activeConfig={activeConfig}
//                                     setSelectedClassForResults={setSelectedClassForResults}
//                                     setActiveAssessmentType={setActiveAssessmentType}
//                                     loadClassResults={loadClassResults}
//                                     calculateGrade={calculateGrade}
//                                     isTeacherView={true}
//                                 />
//                             ) : (
//                                 /* Individual student results view */
//                                 <ResultsManagement
//                                     students={students}
//                                     classes={teacherClasses}
//                                     subjects={teacherSubjects}
//                                     selectedStudent={selectedStudent}
//                                     assessments={assessments}
//                                     reportCard={reportCard}
//                                     savingResults={savingResults}
//                                     activeConfig={activeConfig}
//                                     setSelectedStudent={setSelectedStudent}
//                                     setAssessments={setAssessments}
//                                     setReportCard={setReportCard}
//                                     loadStudentResults={loadStudentResults}
//                                     saveAllResults={saveAllResults}
//                                     updateAssessmentScore={updateAssessmentScore}
//                                     calculateGrade={calculateGrade}
//                                     calculateFinalScore={calculateFinalScore}
//                                     isTeacherView={true}
//                                     isClassTeacher={isUserClassTeacher}
//                                     // ADD THESE LINES
//                                     setShowConfirmModal={setShowConfirmModal}
//                                     setSuccessMessage={setSuccessMessage}
//                                     setShowSuccessModal={setShowSuccessModal}
//                                     setErrorMessage={setErrorMessage}
//                                 />

//                             )}
//                         </div>
//                     </>

//                 ) : activeMainMenu === 'my-classes' ? (  // ← ADD THIS
//                     <div className="px-4 sm:px-6 lg:px-8 py-6">
//                         {/* <div className="bg-white rounded-xl p-8 text-center">
//                             <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
//                             <p className="text-slate-500 mt-2">Coming soon...</p>
//                         </div> */}
//                         <TeacherClasses
//                             classes={teacherClasses}
//                             students={students}
//                             subjects={teacherSubjects}
//                             showMessage={showMessage}
//                             onViewResults={goToResults}        // ADD THIS
//                             onViewAttendance={goToAttendance}   // ADD THIS
//                         />
//                     </div>
//                 ) : activeMainMenu === 'attendance' ? (
//                     <div className="px-4 sm:px-6 lg:px-8 py-6">
//                         {/* <div className="bg-white rounded-xl p-8 text-center">
//                             <h2 className="text-2xl font-bold text-slate-800">Attendance</h2>
//                             <p className="text-slate-500 mt-2">Coming soon...</p>
//                         </div> */}
//                         <TeacherAttendance
//                             classes={teacherClasses}
//                             students={students}
//                             teacherId={teacherId} // You'll need to make teacherId available
//                             showMessage={showMessage}
//                         />
//                     </div>
//                 ) : activeMainMenu === 'timetable' ? (
//                     <div className="px-4 sm:px-6 lg:px-8 py-6">
//                         {/* <div className="bg-white rounded-xl p-8 text-center">
//                             <h2 className="text-2xl font-bold text-slate-800">Timetable</h2>
//                             <p className="text-slate-500 mt-2">Coming soon...</p>
//                         </div> */}
//                         <TeacherTimetable
//                             classes={teacherClasses}
//                             subjects={teacherSubjects}
//                             teacherId={teacherId}
//                             teacherName={teacherName}
//                             showMessage={showMessage}
//                         />
//                     </div>
//                 ) : activeMainMenu === 'messages' ? (
//                     <div className="px-4 sm:px-6 lg:px-8 py-6">
//                         {/* <div className="bg-white rounded-xl p-8 text-center">
//                             <h2 className="text-2xl font-bold text-slate-800">Messages</h2>
//                             <p className="text-slate-500 mt-2">Coming soon...</p>
//                         </div> */}
//                         {/* <MessagingCenter
//                             userRole="teacher"
//                             userId={teacherId}
//                             userName={teacherName}
//                             classes={teacherClasses}
//                             students={students}
//                             // teachers={teachers}
//                             showMessage={showMessage}
//                         /> */}
//                         <TeacherMessages
//                             classes={teacherClasses}
//                             students={students}
//                             // teachers={teachers}
//                             subjects={teacherSubjects}
//                             teacherId={teacherId}
//                             teacherName={teacherName}
//                             showMessage={showMessage}
//                         />
//                     </div>
//                 ) : activeMainMenu === 'reports' ? (
//                     <div className="px-4 sm:px-6 lg:px-8 py-6">
//                         {/* <div className="bg-white rounded-xl p-8 text-center">
//                             <h2 className="text-2xl font-bold text-slate-800">Reports</h2>
//                             <p className="text-slate-500 mt-2">Coming soon...</p>
//                         </div> */}
//                         <TeacherReports
//                             classes={teacherClasses}
//                             students={students}
//                             subjects={teacherSubjects}
//                             teacherId={teacherId}

//                             teacherName={teacherName}
//                             showMessage={showMessage}
//                         />
//                     </div>
//                 ) : activeMainMenu === 'profile' ? (
//                     <div className="px-4 sm:px-6 lg:px-8 py-6">
//                         {/* <div className="bg-white rounded-xl p-8 text-center">
//                             <h2 className="text-2xl font-bold text-slate-800">Profile</h2>
//                             <p className="text-slate-500 mt-2">Coming soon...</p>
//                         </div> */}
//                         <TeacherProfile
//                             teacherId={teacherId}
//                             teacherName={teacherName}
//                             teacherEmail={teacherEmail}
//                             // classes={teacherClasses}
//                             // students={students}
//                             // subjects={teacherSubjects}
//                             showMessage={showMessage}
//                         />
//                     </div>
//                 ) : null}
//             </div>
//         </div>
//     );
// };

// export default TeacherPanel;