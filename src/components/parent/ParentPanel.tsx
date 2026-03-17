// ParentPanel.tsx

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, AlertCircle, CheckCircle, Download, MessageCircle,
    Calendar, CreditCard, FileText, Bell, User, Users, BookOpen,
    TrendingUp, Clock, Phone, Mail, MapPin, Award, Eye, BarChart2, LineChart, ChevronDown, Check, School
} from 'lucide-react';
import ParentSidebar from './sidebar/ParentSidebar';
import ParentHeader from './ParentHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import CustomAlertModal from '../common/CustomAlertModal';
import {
    Child, ReportCard, Assessment, AttendanceRecord, Teacher,
    Notification, Announcement, FeeStatus, TimetableEntry
} from '@/types/parent';
import {
    downloadReportCard,
    fetchChildAssessments,
    fetchChildAttendance,
    fetchChildFeeStatus,
    fetchChildReportCards,
    fetchChildTimetable,
    fetchParentChildren,
    fetchParentNotifications,
    fetchSchoolAnnouncements,
    fetchSchoolCalendar,
    fetchTeacherByClass,
    markNotificationRead,
    sendParentMessage
} from '@/services/parentService';
import { ParentDataTransformer } from '@/services/parentDataTransformer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParentReportCards from './ParentReportCards';

interface ParentPanelProps {
    onBack: () => void;
}

const ParentPanel: React.FC<ParentPanelProps> = ({ onBack }) => {
    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeMainMenu, setActiveMainMenu] = useState('dashboard');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [graphType, setGraphType] = useState<'bar' | 'line'>('bar');
    const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false);
    const [currentTerm, setCurrentTerm] = useState('Term 1, 2025/2026');
    const { user } = useAuth();

    // Parent/User State
    const [parentName, setParentName] = useState('Parent');
    const [parentInitial, setParentInitial] = useState('P');
    const [parentId, setParentId] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [parentPhone, setParentPhone] = useState('');

    // Children Data
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);

    // Academic Data
    const [reportCards, setReportCards] = useState<ReportCard[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

    // Financial Data
    const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(null);

    // Communication
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

    // Message Modal State
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);

    const academicTerms = [
        'Term 1, 2025/2026',
        'Term 2, 2025/2026',
        'Term 3, 2025/2026',
    ];

    // Load initial data
    useEffect(() => {
        loadParentData();
    }, []);

    const loadParentData = async () => {
        setLoading(true);
        try {
            // Get parent info from localStorage
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (user) {
                setParentName(user.parentName || user.name || 'Parent');
                setParentInitial((user.parentName || user.name || 'P').charAt(0).toUpperCase());
                setParentId(user.id);
                setParentEmail(user.parentEmail || user.email || '');
                setParentPhone(user.parentPhone || user.phone || '');
            }

            if (!parentId && user?.id) {
                // If parentId is not set yet, use user.id
                const childrenData = await fetchParentChildren(user.id);
                console.log('📦 Raw children data:', childrenData); // 👈 ADD THIS
                const transformedChildren = childrenData.map(ParentDataTransformer.transformChild);
                console.log('🔄 Transformed children:', transformedChildren); // 👈 ADD THIS
                setChildren(transformedChildren);

                if (transformedChildren.length > 0) {
                    console.log('✅ Selected first child:', transformedChildren[0]); // 👈 ADD THIS
                    setSelectedChild(transformedChildren[0]);
                    await loadChildData(transformedChildren[0].id);
                } else {
                    console.log('❌ No children found'); // 👈 ADD THIS
                }

                // Fetch notifications and announcements
                const [notificationsData, announcementsData, calendarData] = await Promise.all([
                    fetchParentNotifications(user.id),
                    fetchSchoolAnnouncements(),
                    fetchSchoolCalendar()
                ]);

                setNotifications(notificationsData.map(ParentDataTransformer.transformNotification));
                setAnnouncements(announcementsData.map(ParentDataTransformer.transformAnnouncement));
                setUnreadCount(notificationsData.filter((n: any) => !n.read).length);

                if (calendarData && Array.isArray(calendarData)) {
                    setUpcomingEvents(calendarData.slice(0, 3));
                }
            }

        } catch (err) {
            setError('Failed to load parent data');
            console.error('Error loading parent data:', err);
        } finally {
            setLoading(false);
        }
    };

    // const loadParentData = async () => {
    //     setLoading(true);
    //     try {
    //         // Get parent info from localStorage
    //         const userStr = localStorage.getItem('user');
    //         const user = userStr ? JSON.parse(userStr) : null;

    //         if (user) {
    //             setParentName(user.parentName || user.name || 'Parent');
    //             setParentInitial((user.parentName || user.name || 'P').charAt(0).toUpperCase());
    //             setParentId(user.id);
    //             setParentEmail(user.parentEmail || user.email || '');
    //             setParentPhone(user.parentPhone || user.phone || '');
    //         }

    //         if (!parentId && user?.id) {
    //             // If parentId is not set yet, use user.id
    //             const childrenData = await fetchParentChildren(user.id);
    //             const transformedChildren = childrenData.map(ParentDataTransformer.transformChild);
    //             setChildren(transformedChildren);

    //             if (transformedChildren.length > 0) {
    //                 setSelectedChild(transformedChildren[0]);
    //                 await loadChildData(transformedChildren[0].id);
    //             }

    //             // Fetch notifications and announcements
    //             const [notificationsData, announcementsData, calendarData] = await Promise.all([
    //                 fetchParentNotifications(user.id),
    //                 fetchSchoolAnnouncements(),
    //                 fetchSchoolCalendar()
    //             ]);

    //             setNotifications(notificationsData.map(ParentDataTransformer.transformNotification));
    //             setAnnouncements(announcementsData.map(ParentDataTransformer.transformAnnouncement));
    //             setUnreadCount(notificationsData.filter((n: any) => !n.read).length);

    //             if (calendarData && Array.isArray(calendarData)) {
    //                 setUpcomingEvents(calendarData.slice(0, 3));
    //             }
    //         }

    //     } catch (err) {
    //         setError('Failed to load parent data');
    //         console.error('Error loading parent data:', err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const loadChildData = async (childId: string) => {
        try {
            console.log('🟡 Loading data for child:', childId);

            const [reportsData, assessmentsData, attendanceData, timetableData, feeData] = await Promise.all([
                fetchChildReportCards(childId),
                fetchChildAssessments(childId),
                fetchChildAttendance(childId),
                fetchChildTimetable(childId),
                fetchChildFeeStatus(childId)
            ]);

            console.log('📊 Raw attendance data from API:', attendanceData); // 👈 ADD THIS

            // Transform data using the transformer
            setReportCards(reportsData.map(ParentDataTransformer.transformReportCard));
            setAssessments(assessmentsData.map(ParentDataTransformer.transformAssessment));

            const transformedAttendance = attendanceData.map(ParentDataTransformer.transformAttendance);
            console.log('✅ Transformed attendance:', transformedAttendance); // 👈 ADD THIS
            setAttendance(transformedAttendance);

            setTimetable(timetableData.map(ParentDataTransformer.transformTimetable));

            if (feeData) {
                setFeeStatus(ParentDataTransformer.transformFeeStatus(feeData));
            }

            // Get teachers for this child's class
            if (selectedChild?.classId) {
                const teachersData = await fetchTeacherByClass(selectedChild.classId);
                setTeachers(teachersData.map(ParentDataTransformer.transformTeacher));
            }

        } catch (err) {
            console.error('❌ Error loading child data:', err);
            showMessage('Failed to load child data', true);
        }
    };

    // const loadChildData = async (childId: string) => {
    //     try {
    //         const [reportsData, assessmentsData, attendanceData, timetableData, feeData] = await Promise.all([
    //             fetchChildReportCards(childId),
    //             fetchChildAssessments(childId),
    //             fetchChildAttendance(childId),
    //             fetchChildTimetable(childId),
    //             fetchChildFeeStatus(childId)
    //         ]);

    //         // Transform data using the transformer
    //         setReportCards(reportsData.map(ParentDataTransformer.transformReportCard));
    //         setAssessments(assessmentsData.map(ParentDataTransformer.transformAssessment));
    //         setAttendance(attendanceData.map(ParentDataTransformer.transformAttendance));
    //         setTimetable(timetableData.map(ParentDataTransformer.transformTimetable));

    //         if (feeData) {
    //             setFeeStatus(ParentDataTransformer.transformFeeStatus(feeData));
    //         }

    //         // Get teachers for this child's class
    //         if (selectedChild?.classId) {
    //             const teachersData = await fetchTeacherByClass(selectedChild.classId);
    //             setTeachers(teachersData.map(ParentDataTransformer.transformTeacher));
    //         }

    //     } catch (err) {
    //         console.error('Error loading child data:', err);
    //         showMessage('Failed to load child data', true);
    //     }
    // };

    const handleChildChange = (childId: string) => {
        const child = children.find(c => c.id === childId);
        if (child) {
            setSelectedChild(child);
            loadChildData(child.id);
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
    };

    const handleSidebarToggle = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedTeacher || !selectedChild) return;

        setSendingMessage(true);
        try {
            await sendParentMessage({
                parentId,
                teacherId: selectedTeacher.id,
                childId: selectedChild.id,
                message: messageText
            });

            showMessage('Message sent successfully!');
            setShowMessageModal(false);
            setMessageText('');
            setSelectedTeacher(null);
        } catch (err) {
            showMessage('Failed to send message', true);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleDownloadReport = async (reportId: string) => {
        try {
            const blob = await downloadReportCard(reportId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-card-${reportId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showMessage('Report card downloaded');
        } catch (err) {
            showMessage('Failed to download report', true);
        }
    };

    const handleNotificationClick = async (notificationId: string) => {
        try {
            await markNotificationRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Calculate attendance summary
    // const getAttendanceSummary = () => {
    //     const present = attendance.filter(a => a.status === 'present').length;
    //     const absent = attendance.filter(a => a.status === 'absent').length;
    //     const late = attendance.filter(a => a.status === 'late').length;
    //     const total = attendance.length;

    //     return {
    //         present,
    //         absent,
    //         late,
    //         percentage: total > 0 ? Math.round((present / total) * 100) : 0
    //     };
    // };

    const getAttendanceSummary = () => {
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const late = attendance.filter(a => a.status === 'late').length;
        const total = attendance.length;

        return {
            present,
            absent,
            late,
            percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0  // 👈 FIXED: include late
        };
    };

    // Dashboard View Component - REPLACED WITH NEW DESIGN
    const DashboardView = () => {
        const attendanceSummary = getAttendanceSummary();
        const displayName = parentName?.split(' ')[0] || 'Parent';

        // Calculate performance data
        const performance = {
            positionInClass: selectedChild?.classRank?.toString() || '--',
            classSize: selectedChild?.totalStudents || 0,
            averageScore: assessments.length > 0
                ? assessments.reduce((acc, curr) => acc + (curr.score || 0), 0) / assessments.length
                : 0,
            overallGrade: (() => {
                const avg = assessments.length > 0
                    ? assessments.reduce((acc, curr) => acc + (curr.score || 0), 0) / assessments.length
                    : 0;
                if (avg >= 80) return 'A';
                if (avg >= 70) return 'B';
                if (avg >= 60) return 'C';
                if (avg >= 50) return 'D';
                return 'F';
            })(),
            strongestSubject: assessments.length > 0
                ? assessments.reduce((prev, curr) => (prev.score || 0) > (curr.score || 0) ? prev : curr).subject
                : '--',
            strongestScore: assessments.length > 0
                ? Math.max(...assessments.map(a => a.score || 0))
                : 0,
            needsImprovement: assessments.length > 0
                ? assessments.reduce((prev, curr) => (prev.score || 0) < (curr.score || 0) ? prev : curr).subject
                : '--',
            improvementScore: assessments.length > 0
                ? Math.min(...assessments.map(a => a.score || 0))
                : 0,
            subjectsPassed: assessments.length > 0
                ? `${assessments.filter(a => (a.score || 0) >= 50).length}/${assessments.length}`
                : '0/0',
            topGrades: assessments.filter(a => (a.score || 0) >= 70).length,
            averageGrades: assessments.filter(a => (a.score || 0) >= 50 && (a.score || 0) < 70).length,
            belowPass: assessments.filter(a => (a.score || 0) < 50).length
        };

        const trend = {
            trend: [
                { label: 'Term 1', score: 65 },
                { label: 'Term 2', score: 72 },
                { label: 'Term 3', score: 78 }
            ],
            trendDirection: 'up' as const
        };

        return (
            <div className="space-y-6">
                {/* Child Selector */}
                {children.length > 1 && (
                    <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
                        <label className="flex items-center gap-2 text-sm font-medium text-sky-700 mb-2">
                            <Users className="w-4 h-4 text-sky-500" />
                            Select Child
                        </label>
                        <select
                            value={selectedChild?.id || ''}
                            onChange={(e) => handleChildChange(e.target.value)}
                            className="w-full md:w-72 px-4 py-3 bg-white border border-sky-200 rounded-lg text-slate-700 font-medium text-base focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 cursor-pointer"
                        >
                            {children.map(child => (
                                <option key={child.id} value={child.id} className="text-lg py-1">
                                    {child.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}



                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6 rounded-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {displayName}</h1>
                            <p className="text-emerald-100 mt-1">
                                {selectedChild?.name} • Grade {selectedChild?.grade} • {selectedChild?.school || 'School'}
                            </p>
                            <div className="mt-4">
                                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg backdrop-blur-sm transition-all cursor-pointer group">
                                    <User className="w-4 h-4 text-emerald-200 group-hover:text-white transition-colors" />
                                    <span className="text-sm font-medium text-emerald-50 group-hover:text-white transition-colors">
                                        Message Class Teacher: <span className="text-white font-bold ml-1">
                                            {teachers.find(t => t.is_class_teacher)?.name || 'Class Teacher'}
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* TERM SELECTOR DROPDOWN */}
                        <div className="relative mt-4 md:mt-0">
                            <button
                                onClick={() => setIsTermDropdownOpen(!isTermDropdownOpen)}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors cursor-pointer"
                            >
                                <Calendar className="w-4 h-4 text-emerald-100" />
                                <span className="font-medium">{currentTerm}</span>
                                <ChevronDown className={`w-4 h-4 text-emerald-100 transition-transform ${isTermDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isTermDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
                                    {academicTerms.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => {
                                                setCurrentTerm(term);
                                                setIsTermDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                                        >
                                            <span>{term}</span>
                                            {currentTerm === term && (
                                                <Check className="w-4 h-4 text-emerald-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                {selectedChild && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm">Current Average</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {performance.averageScore > 0 ?
                                            `${Math.round(performance.averageScore)}%` : 'N/A'}
                                    </p>
                                </div>
                                <TrendingUp className="w-12 h-12 opacity-50" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Attendance</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {attendanceSummary.percentage}%
                                    </p>
                                </div>
                                <Clock className="w-12 h-12 opacity-50" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Fee Status</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {feeStatus?.balance && feeStatus.balance > 0 ? 'Due' : 'Paid'}
                                    </p>
                                </div>
                                <CreditCard className="w-12 h-12 opacity-50" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm">Unread Messages</p>
                                    <p className="text-3xl font-bold mt-1">{unreadCount}</p>
                                </div>
                                <MessageCircle className="w-12 h-12 opacity-50" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Two Columns Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Performance & Attendance */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Performance Analysis */}
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                            <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                Performance Analysis
                            </h5>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                                        <p className="text-sm text-slate-500">Position in Class</p>
                                        <p className="text-xl font-bold text-slate-800">
                                            {performance.positionInClass}
                                        </p>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {performance.classSize ? `out of ${performance.classSize} students` : 'Data pending'}
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                                        <p className="text-sm text-slate-500">Average Score</p>
                                        <p className="text-xl font-bold text-slate-800">
                                            {performance.averageScore > 0 ? `${performance.averageScore.toFixed(1)}%` : '--'}
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                                        <p className="text-sm text-slate-500">Overall Grade</p>
                                        <p className="text-xl font-bold text-slate-800">
                                            {performance.overallGrade}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-slate-500">Strongest Subject</p>
                                        <p className="text-xl font-bold text-emerald-700 mt-1">{performance.strongestSubject}</p>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Score: {performance.strongestScore > 0 ? `${performance.strongestScore.toFixed(1)}%` : '--'}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-slate-500">Needs Improvement</p>
                                        <p className="text-xl font-bold text-amber-700 mt-1">{performance.needsImprovement}</p>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Score: {performance.improvementScore > 0 ? `${performance.improvementScore.toFixed(1)}%` : '--'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-white p-3 rounded-lg text-center">
                                        <p className="text-sm text-slate-500">Subjects Passed</p>
                                        <p className="text-lg font-bold text-emerald-800">{performance.subjectsPassed}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg text-center">
                                        <p className="text-sm text-slate-500">A & B Grades</p>
                                        <p className="text-lg font-bold text-blue-800">{performance.topGrades || 0}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg text-center">
                                        <p className="text-sm text-slate-500">C & D Grades</p>
                                        <p className="text-lg font-bold text-amber-800">{performance.averageGrades || 0}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg text-center">
                                        <p className="text-sm text-slate-500">Below Pass Mark</p>
                                        <p className="text-lg font-bold text-rose-800">{performance.belowPass || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Details */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                                Attendance Details
                            </h5>

                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                                {/* Total School Days */}
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <p className="text-sm text-blue-600">Total School Days</p>
                                    <p className="text-2xl font-bold text-blue-700">{attendance.length}</p>
                                </div>

                                {/* Attendance Rate */}
                                <div className={`${attendanceSummary.percentage >= 75 ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-orange-50 to-orange-100'} p-4 rounded-lg`}>
                                    <p className={`text-sm font-medium ${attendanceSummary.percentage >= 75 ? 'text-green-800' : 'text-orange-800'}`}>
                                        Attendance Rate
                                    </p>
                                    <p className={`text-2xl font-bold ${attendanceSummary.percentage >= 75 ? 'text-green-900' : 'text-orange-900'}`}>
                                        {attendanceSummary.percentage}%
                                    </p>
                                    <p className={`text-xs mt-1 ${attendanceSummary.percentage >= 75 ? 'text-green-700' : 'text-orange-700'}`}>
                                        {attendanceSummary.present + attendanceSummary.late}/{attendance.length}
                                    </p>
                                </div>

                                {/* Present Box */}
                                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                                    <p className="text-sm text-emerald-600">Present</p>
                                    <p className="text-2xl font-bold text-emerald-700">{attendanceSummary.present}</p>
                                </div>

                                {/* Late Box - if you want to keep it separate */}
                                <div className="bg-amber-50 p-4 rounded-lg text-center">
                                    <Clock className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                                    <p className="text-sm text-amber-600">Late</p>
                                    <p className="text-2xl font-bold text-amber-700">{attendanceSummary.late}</p>
                                </div>

                                {/* Absent Box */}
                                <div className="bg-red-50 p-4 rounded-lg text-center">
                                    <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                                    <p className="text-sm text-red-600">Absent</p>
                                    <p className="text-2xl font-bold text-red-700">{attendanceSummary.absent}</p>
                                </div>

                                {/* Excused Box */}
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                                    <p className="text-sm text-blue-600">Excused</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {attendance.filter(a => a.status === 'excused').length}
                                    </p>
                                </div>


                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-slate-700">Attendance Trend:</p>
                                    <span className="text-sm font-semibold text-slate-700">{attendanceSummary.percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div
                                        className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${attendanceSummary.percentage}%` }}
                                    ></div>
                                </div>
                                <p className={`text-sm mt-3 ${attendanceSummary.percentage >= 95 ? 'text-emerald-600' : attendanceSummary.percentage >= 80 ? 'text-blue-600' : 'text-amber-600'}`}>
                                    {attendanceSummary.percentage >= 95
                                        ? '✓ Excellent attendance! Keep it up.'
                                        : attendanceSummary.percentage >= 80
                                            ? '✓ Good attendance record.'
                                            : '⚠ Needs improvement in attendance.'}
                                </p>
                            </div>
                        </div>

                        {/* Teacher's Remarks */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                            <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Teacher's Remarks
                            </h5>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <p className="text-slate-700 italic">"{
                                    performance.overallGrade === 'A'
                                        ? 'Excellent performance! Shows exceptional understanding and application of concepts.'
                                        : performance.overallGrade === 'B'
                                            ? 'Very good work. Shows strong understanding with room for further excellence.'
                                            : performance.overallGrade === 'C'
                                                ? 'Satisfactory performance. Consistent effort with areas for improvement identified.'
                                                : performance.overallGrade === 'D'
                                                    ? 'Basic understanding demonstrated. Additional support and practice recommended.'
                                                    : 'Student data is being processed. Detailed performance analysis will be available soon.'
                                }"</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Performance Trend, Announcements & Events */}
                    <div className="space-y-6">
                        {/* Performance Trend */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    Performance Trend
                                </h5>

                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setGraphType('bar')}
                                        className={`p-1.5 rounded-md transition-all ${graphType === 'bar' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <BarChart2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setGraphType('line')}
                                        className={`p-1.5 rounded-md transition-all ${graphType === 'line' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <LineChart className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 h-48">
                                {graphType === 'bar' ? (
                                    <div className="h-full w-full flex flex-col justify-between pt-2">
                                        <div className="flex items-end justify-between h-32 w-full px-2 border-b border-dashed border-slate-200">
                                            {trend.trend.map((item, index) => (
                                                <div key={index} className="flex flex-col items-center justify-end h-full w-full group">
                                                    <span className="text-xs font-bold text-emerald-700 mb-1">
                                                        {item.score}%
                                                    </span>
                                                    <div
                                                        className={`w-3 sm:w-5 ${item.score > 0 ? 'bg-emerald-500' : 'bg-gray-300'} rounded-t-md transition-all duration-500 group-hover:${item.score > 0 ? 'bg-emerald-600' : 'bg-gray-400'}`}
                                                        style={{ height: `${item.score > 0 ? item.score : 10}%` }}
                                                    ></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                                            {trend.trend.map((t, i) => (
                                                <div key={i} className="w-full text-center">
                                                    {t.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full w-full flex flex-col justify-between pt-2">
                                        <div className="relative h-32 w-full">
                                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <line x1="0" y1="0" x2="100" y2="0" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4 4" />
                                                <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4 4" />
                                                <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="0.5" />

                                                <polyline
                                                    points={trend.trend.map((t, i) =>
                                                        `${(i / (trend.trend.length - 1)) * 100},${100 - (t.score > 0 ? t.score : 10)}`
                                                    ).join(' ')}
                                                    fill="none"
                                                    stroke={trend.trend.some(t => t.score > 0) ? "#10b981" : "#94a3b8"}
                                                    strokeWidth="2"
                                                />

                                                {trend.trend.map((t, i) => (
                                                    <g key={i}>
                                                        <text
                                                            x={`${(i / (trend.trend.length - 1)) * 100}%`}
                                                            y={`${100 - (t.score > 0 ? t.score : 10) - 8}%`}
                                                            textAnchor="middle"
                                                            fontSize="6"
                                                            fontWeight="bold"
                                                            fill={t.score > 0 ? "#0f766e" : "#64748b"}
                                                        >
                                                            {t.score}%
                                                        </text>
                                                        <circle
                                                            cx={`${(i / (trend.trend.length - 1)) * 100}%`}
                                                            cy={`${100 - (t.score > 0 ? t.score : 10)}%`}
                                                            r="2.5"
                                                            className={`fill-white ${t.score > 0 ? 'stroke-emerald-600' : 'stroke-slate-400'} stroke-2`}
                                                        />
                                                    </g>
                                                ))}
                                            </svg>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                                            {trend.trend.map((t, i) => (
                                                <span key={i}>{t.label}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-slate-600 mt-4 pt-2 border-t border-slate-100">
                                {performance.averageScore === 0
                                    ? '📊 Performance data will be available after first assessment.'
                                    : trend.trendDirection === 'up'
                                        ? '📈 Performance is improving over time.'
                                        : trend.trendDirection === 'down'
                                            ? '📉 Performance has declined recently.'
                                            : '➖ Performance is stable.'}
                            </p>
                        </div>

                        {/* School Announcements */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-red-600" />
                                School Announcements
                            </h5>
                            <div className="space-y-3">
                                {announcements.length > 0 ? (
                                    announcements.slice(0, 4).map((announcement, index) => (
                                        <div key={index} className={`p-3 rounded-lg border ${announcement.priority === 'high' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-slate-800">{announcement.title}</p>
                                                <span className={`text-xs px-2 py-1 rounded ${announcement.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {announcement.priority === 'high' ? 'Important' : 'Update'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1">📅 {announcement.date}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-500">
                                        <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p>No announcements available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-orange-600" />
                                Upcoming Events
                            </h5>
                            <div className="space-y-3">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map((event, index) => (
                                        <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                            <p className="font-medium text-slate-800">{event.title || event.event}</p>
                                            <p className="text-sm text-slate-600 mt-1">📅 {event.date}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                        <p className="font-medium text-slate-800">Sports Day</p>
                                        <p className="text-sm text-slate-600 mt-1">📅 June 15, 2025</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Width Horizontal School Calendar at the BOTTOM */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <School className="w-5 h-5 text-purple-600" />
                        School Calendar 2025
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <h6 className="font-semibold text-blue-800">Term 1</h6>
                                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">Academic</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm">Opening</span>
                                    </div>
                                    <span className="text-sm font-medium">Jan 15, 2025</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="text-sm">Closing</span>
                                    </div>
                                    <span className="text-sm font-medium">Apr 4, 2025</span>
                                </div>
                                <div className="text-xs text-slate-600 text-center">
                                    Duration: 12 weeks
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                            <div className="flex items-center justify-between mb-3">
                                <h6 className="font-semibold text-emerald-800">Term 2</h6>
                                <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Academic</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm">Opening</span>
                                    </div>
                                    <span className="text-sm font-medium">Apr 29, 2025</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="text-sm">Closing</span>
                                    </div>
                                    <span className="text-sm font-medium">Jul 18, 2025</span>
                                </div>
                                <div className="text-xs text-slate-600 text-center">
                                    Duration: 11 weeks
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                            <div className="flex items-center justify-between mb-3">
                                <h6 className="font-semibold text-amber-800">Term 3</h6>
                                <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded">Academic</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm">Opening</span>
                                    </div>
                                    <span className="text-sm font-medium">Sep 2, 2025</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="text-sm">Closing</span>
                                    </div>
                                    <span className="text-sm font-medium">Nov 28, 2025</span>
                                </div>
                                <div className="text-xs text-slate-600 text-center">
                                    Duration: 13 weeks
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Report Cards View
    // const ReportCardsView = () => (
    //     <div className="bg-white rounded-xl shadow-sm p-6">
    //         <h2 className="text-2xl font-bold text-slate-800 mb-6">Report Cards</h2>
    //         <div className="grid gap-4">
    //             {reportCards.length > 0 ? reportCards.map((report, idx) => (
    //                 <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
    //                     <div className="flex items-center justify-between">
    //                         <div>
    //                             <p className="font-semibold text-lg text-slate-800">{report.term} {report.academicYear}</p>
    //                             <p className="text-sm text-slate-500">Published: {new Date(report.publishedDate).toLocaleDateString()}</p>
    //                             <div className="mt-2 flex gap-4 text-sm">
    //                                 <span>Rank: {report.rank}/{report.totalStudents}</span>
    //                                 <span>Average: {report.average}%</span>
    //                                 <span>Attendance: {report.attendance}%</span>
    //                             </div>
    //                         </div>
    //                         <button
    //                             onClick={() => handleDownloadReport(report.id)}
    //                             className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
    //                         >
    //                             <Download className="w-4 h-4" />
    //                             Download
    //                         </button>
    //                     </div>
    //                 </div>
    //             )) : (
    //                 <p className="text-center text-slate-500 py-8">No report cards available</p>
    //             )}
    //         </div>
    //     </div>
    // );
    // Report Cards View - Navigate to full reports page
    const ReportCardsView = () => {
        const navigate = useNavigate();

        return (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <FileText className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Full Reports Page</h3>
                <p className="text-slate-500 mb-6">View detailed report cards with performance analysis, assessment breakdowns, and more.</p>
                <button
                    onClick={() => navigate('/parent-reports')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                >
                    <FileText className="w-5 h-5" />
                    Open Full Reports Page
                </button>
            </div>
        );
    };
    // Attendance View
    // Attendance View
    const AttendanceView = () => {
        const summary = getAttendanceSummary();
        const excusedCount = attendance.filter(a => a.status === 'excused').length;

        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Attendance Record</h2>

                {/* Stats Boxes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-emerald-50 p-4 rounded-lg text-center">
                        <p className="text-emerald-600 font-semibold">Present</p>
                        <p className="text-3xl font-bold text-slate-800">{summary.present}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg text-center">
                        <p className="text-amber-600 font-semibold">Absent</p>
                        <p className="text-3xl font-bold text-slate-800">{summary.absent}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-blue-600 font-semibold">Late</p>
                        <p className="text-3xl font-bold text-slate-800">{summary.late}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <p className="text-purple-600 font-semibold">Excused</p>
                        <p className="text-3xl font-bold text-slate-800">{excusedCount}</p>
                    </div>
                </div>

                {/* Attendance Table - WITHOUT Remarks column */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length > 0 ? attendance.map((record, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                                record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                    record.status === 'late' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-purple-100 text-purple-700'
                                            }`}>
                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={2} className="text-center text-slate-500 py-4">
                                        No attendance records available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Fees View
    const FeesView = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Fee Status</h2>
                {feeStatus ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-500">Total Fees</p>
                                <p className="text-2xl font-bold text-slate-800">
                                    ${feeStatus.total_fees?.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-500">Paid</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    ${feeStatus.paid_amount?.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-500">Balance</p>
                                <p className={`text-2xl font-bold ${feeStatus.balance > 0 ? 'text-red-600' : 'text-slate-800'
                                    }`}>
                                    ${feeStatus.balance?.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-500">Due Date</p>
                                <p className="text-xl font-semibold text-slate-800">
                                    {feeStatus.due_date ? new Date(feeStatus.due_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                        {feeStatus.balance > 0 && (
                            <button className="w-full md:w-auto px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Pay Now
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-center text-slate-500 py-4">No fee information available</p>
                )}
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment History</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeStatus?.payments && feeStatus.payments.length > 0 ? (
                                feeStatus.payments.map((payment, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-4 py-2">{new Date(payment.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2">{payment.description || 'Fee Payment'}</td>
                                        <td className="px-4 py-2">${payment.amount}</td>
                                        <td className="px-4 py-2">
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {payment.receipt_url && (
                                                <button className="text-emerald-600 hover:text-emerald-800">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center text-slate-500 py-4">
                                        No payment history available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Messages View
    const MessagesView = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Teachers</h2>
                    <div className="text-sm text-slate-500">
                        {unreadCount} unread messages
                    </div>
                </div>
                <div className="grid gap-4">
                    {teachers.length > 0 ? teachers.map((teacher, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <span className="text-emerald-600 font-semibold">
                                        {teacher.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{teacher.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {teacher.is_class_teacher ? 'Class Teacher' : `${teacher.subject_name || teacher.subject} Teacher`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedTeacher(teacher);
                                    setShowMessageModal(true);
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Message
                            </button>
                        </div>
                    )) : (
                        <p className="text-center text-slate-500 py-4">No teachers available</p>
                    )}
                </div>
            </div>

            {/* Recent Conversations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Messages</h3>
                <div className="space-y-3">
                    {notifications.filter(n => n.type === 'message').length > 0 ? (
                        notifications.filter(n => n.type === 'message').map((msg, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg cursor-pointer ${!msg.read ? 'bg-emerald-50' : 'bg-slate-50'}`}
                                onClick={() => handleNotificationClick(msg.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-slate-800">{msg.sender || 'Teacher'}</p>
                                        <p className="text-sm text-slate-600 mt-1">{msg.content}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">{msg.time || new Date(msg.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-4">No messages yet</p>
                    )}
                </div>
            </div>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">
                            Message {selectedTeacher?.name}
                        </h3>
                        <form onSubmit={handleSendMessage}>
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type your message here..."
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 mb-4"
                                required
                            />
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={sendingMessage}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {sendingMessage ? 'Sending...' : 'Send Message'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMessageModal(false);
                                        setSelectedTeacher(null);
                                        setMessageText('');
                                    }}
                                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    // Timetable View
    const TimetableView = () => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Class Timetable</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-emerald-600 text-white">
                                <th className="px-4 py-3 text-left">Time</th>
                                <th className="px-4 py-3 text-left">Monday</th>
                                <th className="px-4 py-3 text-left">Tuesday</th>
                                <th className="px-4 py-3 text-left">Wednesday</th>
                                <th className="px-4 py-3 text-left">Thursday</th>
                                <th className="px-4 py-3 text-left">Friday</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timetable.length > 0 ? (
                                timetable.map((slot, idx) => (
                                    <tr key={idx} className="border-b hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{slot.time}</td>
                                        <td className="px-4 py-3">{slot.day === 'monday' ? slot.subject : '-'}</td>
                                        <td className="px-4 py-3">{slot.day === 'tuesday' ? slot.subject : '-'}</td>
                                        <td className="px-4 py-3">{slot.day === 'wednesday' ? slot.subject : '-'}</td>
                                        <td className="px-4 py-3">{slot.day === 'thursday' ? slot.subject : '-'}</td>
                                        <td className="px-4 py-3">{slot.day === 'friday' ? slot.subject : '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center text-slate-500 py-4">
                                        No timetable available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Profile View
    const ProfileView = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <User className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-sm text-slate-500">Name</p>
                                <p className="font-medium text-slate-800">{parentName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="font-medium text-slate-800">{parentEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-sm text-slate-500">Phone</p>
                                <p className="font-medium text-slate-800">{parentPhone}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-sm text-slate-500">Address</p>
                                <p className="font-medium text-slate-800">123 Main St, City</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <Users className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-sm text-slate-500">Children Enrolled</p>
                                <p className="font-medium text-slate-800">{children.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Children Information</h3>
                <div className="grid gap-4">
                    {children.length > 0 ? children.map((child, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-lg text-slate-800">{child.name}</p>
                                    <p className="text-sm text-slate-500">Grade {child.grade} - {child.class}</p>
                                    <p className="text-sm text-slate-500">Admission No: {child.admissionNo}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedChild(child);
                                        setActiveMainMenu('dashboard');
                                    }}
                                    className="px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50"
                                >
                                    View Dashboard
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-slate-500 py-4">No children information available</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 flex">
            <ParentSidebar
                activeMainSection={activeMainMenu}
                onSectionChange={handleMenuChange}
                onBack={onBack}
                isCollapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
                parentName={parentName}
                parentInitial={parentInitial}
                unreadCount={unreadCount}
            />

            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
                <ParentHeader
                    onBack={onBack}
                    childName={selectedChild?.name}
                    notificationCount={unreadCount}
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

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {loading ? (
                        <LoadingSpinner message="Loading parent dashboard..." />
                    ) : (
                        <>
                            {/* {activeMainMenu === 'dashboard' && <DashboardView />}
                            {activeMainMenu === 'reports' && <ReportCardsView />}
                            {activeMainMenu === 'attendance' && <AttendanceView />}
                            {activeMainMenu === 'fees' && <FeesView />}
                            {activeMainMenu === 'messages' && <MessagesView />}
                            {activeMainMenu === 'timetable' && <TimetableView />}
                            {activeMainMenu === 'profile' && <ProfileView />} */}
                            {activeMainMenu === 'dashboard' && <DashboardView />}
                            {activeMainMenu === 'reports' && (
                                <ParentReportCards
                                    onBack={onBack}
                                    // You need to pass these props
                                    selectedChild={selectedChild}
                                    children={children}
                                    onChildChange={handleChildChange}
                                    showMessage={showMessage}
                                />
                            )}
                            {activeMainMenu === 'attendance' && <AttendanceView />}
                            {activeMainMenu === 'fees' && <FeesView />}
                            {activeMainMenu === 'messages' && <MessagesView />}
                            {activeMainMenu === 'timetable' && <TimetableView />}
                            {activeMainMenu === 'profile' && <ProfileView />}
                        </>
                    )}
                </div>

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
            </div>
        </div>
    );
};

export default ParentPanel;