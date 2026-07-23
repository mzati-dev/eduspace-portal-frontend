import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, AlertCircle, CheckCircle
} from 'lucide-react';
import {
    fetchAllStudents, fetchAllSubjects, upsertAssessment, upsertReportCard,
    fetchStudentAssessments, fetchStudentReportCard, calculateGrade,
    calculateAndUpdateRanks, fetchClassResults,
    fetchAllClasses,
    fetchCurrentTermPassRates
} from '@/services/studentService';
import {
    getActiveGradeConfig, getAllGradeConfigs, calculateFinalScore
} from '@/services/gradeConfigService';
import { fetchAnnouncements, Announcement as ApiAnnouncement } from '@/services/announcementService';
import { fetchReminders, Reminder } from '@/services/reminderService';
import { Assessment, ClassResultStudent, Student } from '@/types/admin';
import LoadingSpinner from '../common/LoadingSpinner';
import SubjectsManagement from '../admin/sidebar/academic/subjects/SubjectsManagement';
import ClassResultsManagement from '../admin/sidebar/academic/results/ClassResultsManagement';
import ResultsManagement from '../admin/sidebar/academic/results/ResultsManagement';
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
import TeacherMessages from './sidebar/TeacherMessages.tsx';
import TeacherReports from './sidebar/TeacherReports';
import TeacherProfile from './sidebar/TeacherProfile';
import TeacherAttendance from './sidebar/attendance/TeacherAttendance';
import TeacherAnalyticsManagement from './sidebar/analytics/TeacherAnalyticsManagement';
import TeacherHomeOverview from './TeacherHomeOverview';
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
    const [activeMainMenu, setActiveMainMenu] = useState<string>('home');
    const [teacherName, setTeacherName] = useState<string>('Teacher');
    const [teacherInitial, setTeacherInitial] = useState<string>('T');
    const [teacherId, setTeacherId] = useState<string>('');
    const [teacherEmail, setTeacherEmail] = useState<string>('');

    // NEW (mobile sidebar): controls the drawer visibility on small screens
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState<boolean>(false);

    // NEW (shared branding): school name for header + sidebar
    const [schoolName, setSchoolName] = useState<string>('School');
    const [termInfo, setTermInfo] = useState({ name: 'Loading...', startDate: '', endDate: '' });
    const [totalDays, setTotalDays] = useState(0);
    const [recordedDays, setRecordedDays] = useState(0);
    const [remainingDays, setRemainingDays] = useState(0);
    const [currentWeekNumber, setCurrentWeekNumber] = useState(0);
    const [totalWeeks, setTotalWeeks] = useState(0);
    const [weeksRemaining, setWeeksRemaining] = useState(0);
    const [currentPassRates, setCurrentPassRates] = useState([]);
    const [homeAnnouncements, setHomeAnnouncements] = useState<any[]>([]);
    const [homeReminders, setHomeReminders] = useState<any[]>([]);



    // Fetch current term pass rates for teacher dashboard
    useEffect(() => {
        const loadPassRates = async () => {
            const rates = await fetchCurrentTermPassRates();
            setCurrentPassRates(rates);
        };
        loadPassRates();
    }, []);
    // Fetch term data for Teacher Home
    useEffect(() => {
        const fetchTermData = async () => {
            try {
                const { fetchCurrentTerm, fetchPublicHolidays, fetchSchoolHolidays } = await import('@/services/attendanceService');
                const term = await fetchCurrentTerm();
                if (term) {
                    setTermInfo({
                        name: term.name,
                        startDate: term.startDate,
                        endDate: term.endDate
                    });

                    // Fetch holidays
                    const publicHolidays = await fetchPublicHolidays();
                    const schoolHolidays = await fetchSchoolHolidays();

                    const holidaySet = new Set<string>();
                    publicHolidays.forEach((holiday: { date: string }) => holidaySet.add(holiday.date));
                    schoolHolidays.forEach((holiday: { date: string }) => holidaySet.add(holiday.date));

                    // Calculate total days
                    const start = new Date(term.startDate);
                    const end = new Date(term.endDate);
                    let total = 0;
                    let current = new Date(start);

                    while (current <= end) {
                        const dayOfWeek = current.getDay();
                        const dateStr = current.toISOString().split('T')[0];
                        if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidaySet.has(dateStr)) {
                            total++;
                        }
                        current.setDate(current.getDate() + 1);
                    }
                    setTotalDays(total);
                    setTotalWeeks(Math.ceil(total / 5));

                    // Calculate recorded days
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    let recorded = 0;
                    let currentDay = new Date(start);

                    while (currentDay <= today) {
                        const dayOfWeek = currentDay.getDay();
                        const dateStr = currentDay.toISOString().split('T')[0];
                        if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidaySet.has(dateStr)) {
                            recorded++;
                        }
                        currentDay.setDate(currentDay.getDate() + 1);
                    }
                    setRecordedDays(recorded);
                    setRemainingDays(total - recorded);

                    // Calculate current week
                    let schoolDaysCount = 0;
                    let weekCounter = 1;
                    let tempDate = new Date(start);
                    while (tempDate <= today) {
                        const dayOfWeek = tempDate.getDay();
                        const dateStr = tempDate.toISOString().split('T')[0];
                        if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidaySet.has(dateStr)) {
                            schoolDaysCount++;
                            if (schoolDaysCount > 5) {
                                schoolDaysCount = 1;
                                weekCounter++;
                            }
                        }
                        tempDate.setDate(tempDate.getDate() + 1);
                    }
                    const finalWeekNum = Math.min(weekCounter, Math.ceil(total / 5));
                    setCurrentWeekNumber(finalWeekNum);
                    setWeeksRemaining(Math.max(0, Math.ceil(total / 5) - finalWeekNum));
                }
            } catch (error) {
                console.error('Failed to fetch term:', error);
            }
        };
        fetchTermData();
    }, []);

    // Load all teacher data when component mounts
    useEffect(() => {
        loadData();
        fetchSchoolName();
        loadAnnouncementsForTeacher();
        loadRemindersForTeacher();
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

    const loadAnnouncementsForTeacher = async () => {
        try {
            const data = await fetchAnnouncements();
            const mapped = data.map((item: ApiAnnouncement) => ({
                id: item.id,
                title: item.title,
                message: item.content,
                date: item.publish_date ? item.publish_date.split('T')[0] : new Date().toISOString().split('T')[0]
            }));
            setHomeAnnouncements(mapped);
        } catch (error) {
            console.error('Failed to load announcements:', error);
        }
    };

    const loadRemindersForTeacher = async () => {
        try {
            const data = await fetchReminders();
            const mapped = data.map((item: Reminder) => ({
                id: item.id,
                message: item.message,
                type: item.type,
                audience: item.audience,
                reminderDate: item.reminderDate,
                date: item.reminderDate
            }));
            setHomeReminders(mapped);
        } catch (error) {
            console.error('Failed to load reminders:', error);
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

                {activeMainMenu === 'home' ? (
                    <TeacherHomeOverview
                        teacherName={teacherName}
                        teacherClasses={teacherClasses}
                        students={students}
                        teacherSubjects={teacherSubjects}
                         assignments={assignments} 
                        termInfo={termInfo}
                        totalDays={totalDays}
                        recordedDays={recordedDays}
                        remainingDays={remainingDays}
                        currentWeekNumber={currentWeekNumber}
                        totalWeeks={totalWeeks}
                        weeksRemaining={weeksRemaining}
                        currentPassRates={currentPassRates}
                        reminders={homeReminders}
                        announcements={homeAnnouncements}
                        onNavigate={(section) => handleMenuChange(section)}
                    />

                ) : activeMainMenu === 'results' ? (
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
                            parents={students}  // Your students array with parent data
                            currentTeacherId={teacherId}
                            currentTeacherName={teacherName}
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
