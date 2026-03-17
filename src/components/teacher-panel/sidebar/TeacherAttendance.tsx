import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Search,
    UserCheck,
    UserX,
    Clock3,
    CheckCircle,
    AlertCircle,
    Bell,
    Download,
    Filter,
    TrendingUp,
    TrendingDown,
    Users,
    ChevronLeft,
    ChevronRight,
    Clock
} from 'lucide-react';
import {
    AttendanceRecord,
    fetchAttendanceByClassAndDate,
    saveAttendance,
    saveSingleAttendance,
    markAllPresent,
    fetchWeeklyStats,
    fetchClassSummaries,
    fetchStudentPerformance,
    sendAttendanceAlerts,
    fetchAlertHistory,
    WeeklyStats,
    ClassAttendanceSummary
} from '@/services/attendanceService';

interface StudentAttendance {
    id: string;
    name: string;
    examNumber: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    checkInTime?: string;
    parentContact?: string;
}

interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
}

interface Props {
    classes: any[];           // Classes teacher is assigned to
    students: any[];           // Students teacher can access
    teacherId?: string;
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherAttendance: React.FC<Props> = ({
    classes,
    students,
    teacherId,
    showMessage
}) => {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'daily' | 'overview' | 'history' | 'alerts'>('daily');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);

    // Overview data states
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
    const [classSummaries, setClassSummaries] = useState<ClassAttendanceSummary[]>([]);
    const [bestStudents, setBestStudents] = useState<any[]>([]);
    const [needsImprovementStudents, setNeedsImprovementStudents] = useState<any[]>([]);

    // Alerts data states
    const [alertHistory, setAlertHistory] = useState<any[]>([]);
    const [sendingAlerts, setSendingAlerts] = useState(false);

    const [showAllBest, setShowAllBest] = useState(false);
    const [showAllNeeds, setShowAllNeeds] = useState(false);

    // Student history view states
    const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
    const [studentHistory, setStudentHistory] = useState<any[]>([]);
    const [historyPeriod, setHistoryPeriod] = useState<'month' | 'term'>('month');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    // Load attendance data when class or date changes
    useEffect(() => {
        if (selectedClass) {
            loadAttendanceData();
        }
    }, [selectedClass, selectedDate]);

    // Load overview data when switching to overview mode
    useEffect(() => {
        if (viewMode === 'overview' && teacherId) {
            loadOverviewData();
        }
    }, [viewMode, teacherId]);

    // Load alert history when switching to alerts mode
    useEffect(() => {
        if (viewMode === 'alerts' && selectedClass) {
            loadAlertHistory();
        }
    }, [viewMode, selectedClass]);

    const loadAttendanceData = async () => {
        setLoading(true);
        try {
            // Fetch existing attendance records from backend
            const existingRecords = await fetchAttendanceByClassAndDate(selectedClass, selectedDate);

            // Filter students by selected class
            const classStudents = students.filter(s => s.class?.id === selectedClass);

            // Create a map of existing records for quick lookup
            const recordMap = new Map(existingRecords.map(r => [r.studentId, r]));

            // Build attendance data array
            const data: StudentAttendance[] = classStudents.map(student => {
                const existing = recordMap.get(student.id);
                return {
                    id: student.id,
                    name: student.name,
                    examNumber: student.examNumber,
                    status: existing?.status || 'present', // Default to present if no record
                    checkInTime: existing?.checkInTime || (existing?.status === 'present' || existing?.status === 'late'
                        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : undefined),
                    parentContact: student.parentPhone || '+1234567890'
                };
            });

            setAttendanceData(data);
        } catch (err) {
            showMessage('Failed to load attendance data', true);
            console.error('Error loading attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    // const loadOverviewData = async () => {
    //     setLoading(true);
    //     try {
    //         if (!teacherId) return;

    //         // Get date range for current week
    //         const today = new Date();
    //         const startOfWeek = new Date(today);
    //         startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    //         const endOfWeek = new Date(today);
    //         endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Saturday

    //         const startDate = startOfWeek.toISOString().split('T')[0];
    //         const endDate = endOfWeek.toISOString().split('T')[0];

    //         // Fetch all overview data in parallel
    //         const [summaries, best, needsImprovement] = await Promise.all([
    //             fetchClassSummaries(teacherId),
    //             selectedClass ? fetchStudentPerformance(selectedClass, 'best', 3) : Promise.resolve([]),
    //             selectedClass ? fetchStudentPerformance(selectedClass, 'needs-improvement', 3) : Promise.resolve([])
    //         ]);

    //         setClassSummaries(summaries);
    //         setBestStudents(best);
    //         setNeedsImprovementStudents(needsImprovement);

    //         // If a class is selected, fetch its weekly stats
    //         if (selectedClass) {
    //             const weekly = await fetchWeeklyStats(selectedClass, startDate, endDate);
    //             setWeeklyStats(weekly);
    //         }
    //     } catch (err) {
    //         showMessage('Failed to load overview data', true);
    //         console.error('Error loading overview:', err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const loadOverviewData = async () => {
        setLoading(true);
        try {
            if (!teacherId) return;

            // Get date range for current week
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

            const startDate = startOfWeek.toISOString().split('T')[0];
            const endDate = endOfWeek.toISOString().split('T')[0];

            // Fetch all overview data - REMOVED limit parameter
            const [summaries, best, needsImprovement] = await Promise.all([
                fetchClassSummaries(teacherId),
                selectedClass ? fetchStudentPerformance(selectedClass, 'best') : Promise.resolve([]), // No limit
                selectedClass ? fetchStudentPerformance(selectedClass, 'needs-improvement') : Promise.resolve([]) // No limit
            ]);

            setClassSummaries(summaries);
            setBestStudents(best);
            setNeedsImprovementStudents(needsImprovement);

            // If a class is selected, fetch its weekly stats
            if (selectedClass) {
                const weekly = await fetchWeeklyStats(selectedClass, startDate, endDate);
                setWeeklyStats(weekly);
            }
        } catch (err) {
            showMessage('Failed to load overview data', true);
            console.error('Error loading overview:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAlertHistory = async () => {
        try {
            const history = await fetchAlertHistory(selectedClass, 10);
            setAlertHistory(history);
        } catch (err) {
            console.error('Error loading alert history:', err);
        }
    };

    // Calculate stats for current view
    const calculateStats = (): AttendanceStats => {
        const filtered = attendanceData.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.examNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return {
            total: filtered.length,
            present: filtered.filter(s => s.status === 'present').length,
            absent: filtered.filter(s => s.status === 'absent').length,
            late: filtered.filter(s => s.status === 'late').length,
            excused: filtered.filter(s => s.status === 'excused').length,
            rate: filtered.length > 0
                ? Number(((filtered.filter(s => s.status === 'present' || s.status === 'late').length / filtered.length) * 100).toFixed(1))
                : 0
        };
    };

    const stats = calculateStats();

    const handleStatusChange = async (studentId: string, newStatus: StudentAttendance['status']) => {
        // Optimistically update UI
        setAttendanceData(prev =>
            prev.map(s =>
                s.id === studentId
                    ? {
                        ...s,
                        status: newStatus,
                        checkInTime: newStatus === 'present' || newStatus === 'late'
                            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : undefined
                    }
                    : s
            )
        );

        try {
            // Save to backend
            await saveSingleAttendance({
                studentId,
                classId: selectedClass,
                date: selectedDate,
                status: newStatus,
                checkInTime: newStatus === 'present' || newStatus === 'late'
                    ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : undefined
            });

            showMessage(`Attendance updated`);
        } catch (err) {
            // Revert on error
            loadAttendanceData();
            showMessage('Failed to update attendance', true);
        }
    };

    // const handleMarkAllPresent = async () => {
    //     try {
    //         setSaving(true);
    //         const studentIds = attendanceData.map(s => s.id);

    //         await markAllPresent(selectedClass, selectedDate, studentIds);

    //         // Update local state
    //         setAttendanceData(prev =>
    //             prev.map(s => ({
    //                 ...s,
    //                 status: 'present',
    //                 checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    //             }))
    //         );

    //         showMessage('All students marked as present');
    //     } catch (err) {
    //         showMessage('Failed to mark all present', true);
    //     } finally {
    //         setSaving(false);
    //     }
    // };

    const handleMarkAllPresent = async () => {
        try {
            setMarkingAll(true);  // 👈 Use markingAll instead of saving
            const studentIds = attendanceData.map(s => s.id);

            await markAllPresent(selectedClass, selectedDate, studentIds);

            // Update local state
            setAttendanceData(prev =>
                prev.map(s => ({
                    ...s,
                    status: 'present',
                    checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }))
            );

            showMessage('All students marked as present');
        } catch (err) {
            showMessage('Failed to mark all present', true);
        } finally {
            setMarkingAll(false);  // 👈 Reset markingAll
        }
    };

    const handleSendAlerts = async (method: 'sms' | 'email') => {
        if (!selectedClass) {
            showMessage('Please select a class first', true);
            return;
        }

        try {
            setSendingAlerts(true);
            const result = await sendAttendanceAlerts(
                selectedClass,
                selectedDate,
                method
            );

            showMessage(result.message);

            // Refresh alert history
            loadAlertHistory();
        } catch (err) {
            showMessage('Failed to send alerts', true);
        } finally {
            setSendingAlerts(false);
        }
    };

    // const handleSaveAttendance = async () => {
    //     try {
    //         setSaving(true);

    //         // Convert to format expected by API
    //         const records = attendanceData.map(s => ({
    //             studentId: s.id,
    //             classId: selectedClass,
    //             date: selectedDate,
    //             status: s.status,
    //             checkInTime: s.checkInTime
    //         }));

    //         await saveAttendance(records);
    //         showMessage('Attendance saved successfully');
    //     } catch (err) {
    //         showMessage('Failed to save attendance', true);
    //     } finally {
    //         setSaving(false);
    //     }
    // };
    const handleSaveAttendance = async () => {
        try {
            setSaving(true);

            // Check if any students have no status (if you change to empty default)
            // const incomplete = attendanceData.filter(s => !s.status);
            // if (incomplete.length > 0) {
            //     showMessage(`Please select status for ${incomplete.length} student(s)`, true);
            //     setSaving(false);
            //     return;
            // }

            console.log('Saving attendance for', attendanceData.length, 'students');
            console.log('Present count:', attendanceData.filter(s => s.status === 'present').length);

            const records = attendanceData.map(s => ({
                studentId: s.id,
                classId: selectedClass,
                date: selectedDate,
                status: s.status,
                checkInTime: s.checkInTime
            }));

            await saveAttendance(records);
            showMessage('Attendance saved successfully');

            // Reload data to confirm
            await loadAttendanceData();
        } catch (err) {
            showMessage('Failed to save attendance', true);
            console.error('Error saving attendance:', err);
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-700 border-green-200';
            case 'absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'excused': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <UserCheck className="w-4 h-4" />;
            case 'absent': return <UserX className="w-4 h-4" />;
            case 'late': return <Clock3 className="w-4 h-4" />;
            case 'excused': return <CheckCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const filteredStudents = attendanceData.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.examNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const loadStudentHistory = async (student: StudentAttendance) => {
        setLoadingHistory(true);
        setSelectedStudent(student);

        try {
            // Calculate date range based on period
            const endDate = new Date().toISOString().split('T')[0];
            let startDate: string;

            if (historyPeriod === 'month') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                startDate = thirtyDaysAgo.toISOString().split('T')[0];
            } else {
                // For term, get dates from class or use last 3 months
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                startDate = threeMonthsAgo.toISOString().split('T')[0];
            }

            // Fetch attendance for this student in date range
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/student/${student.id}?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setStudentHistory(data.data);
            }
        } catch (error) {
            showMessage('Failed to load student history', true);
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Attendance Management</h2>
                    <p className="text-slate-500">Track and manage student attendance</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSendAlerts('sms')}
                        disabled={sendingAlerts || !selectedClass}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        <Bell className="w-4 h-4" />
                        {sendingAlerts ? 'Sending...' : 'Alert Parents'}
                    </button>
                    {/* <button
                        onClick={handleSaveAttendance}
                        disabled={saving || !selectedClass}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircle className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </button> */}
                </div>
            </div>

            {/* View Mode Tabs */}
            {/* <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setViewMode('daily')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'daily'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Daily Attendance
                </button>
                <button
                    onClick={() => setViewMode('overview')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'overview'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Overview
                </button>
                <button
                    onClick={() => setViewMode('alerts')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'alerts'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Bell className="w-4 h-4 inline mr-2" />
                    Alerts
                </button>
            </div> */}
            {/* View Mode Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setViewMode('daily')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'daily'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Daily Tracking
                </button>
                <button
                    onClick={() => setViewMode('overview')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'overview'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Overview
                </button>
                <button
                    onClick={() => setViewMode('history')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'history'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Attendance History
                </button>
                <button
                    onClick={() => setViewMode('alerts')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'alerts'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Bell className="w-4 h-4 inline mr-2" />
                    Alerts
                </button>
            </div>

            {viewMode === 'daily' && (
                <>
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} - {cls.term} ({cls.academic_year})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedClass ? (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Total Students</p>
                                            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Present</p>
                                            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                                        </div>
                                        <UserCheck className="w-8 h-8 text-green-600" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Absent</p>
                                            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                                        </div>
                                        <UserX className="w-8 h-8 text-red-600" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Late</p>
                                            <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                                        </div>
                                        <Clock3 className="w-8 h-8 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Attendance Rate</p>
                                            <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-indigo-600" />
                                    </div>
                                </div>
                            </div>

                            {/* 👇 INSERT HERE 👇 */}
                            {/* Reminder Message */}
                            {selectedClass !== 'all' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>Don't forget to click <strong>Save Attendance</strong> after making changes! Unsaved changes will be lost.</span>
                                </div>
                            )}

                            {/* Quick Actions */}
                            {/* <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleMarkAllPresent}
                                    disabled={saving}
                                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
                                >
                                    Mark All Present
                                </button>
                            </div> */}

                            {/* Quick Actions */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleSaveAttendance}
                                    disabled={saving || !selectedClass}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
                                >
                                    {saving ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Save Attendance
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleMarkAllPresent}
                                    disabled={markingAll || !selectedClass}
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors disabled:opacity-50 border border-green-200 flex items-center gap-2"
                                >
                                    {markingAll ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            Marking...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Mark All Present
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Attendance Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Check-in Time</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                        Loading attendance data...
                                                    </td>
                                                </tr>
                                            ) : filteredStudents.length > 0 ? (
                                                filteredStudents.map(student => (
                                                    <tr key={student.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                                        <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                                                                {getStatusIcon(student.status)}
                                                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={student.status}
                                                                onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
                                                                className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                                disabled={saving}
                                                            >
                                                                <option value="present">Present</option>
                                                                <option value="absent">Absent</option>
                                                                <option value="late">Late</option>
                                                                <option value="excused">Excused</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                        No students found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Class</h3>
                            <p className="text-slate-500">Choose a class from the dropdown above to start taking attendance</p>
                        </div>
                    )}
                </>
            )}

            {viewMode === 'overview' && (
                <div className="space-y-6">
                    {/* Weekly Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">This Week's Attendance</h3>
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Loading weekly stats...</div>
                        ) : weeklyStats.length > 0 ? (
                            <div className="grid grid-cols-7 gap-2">
                                {weeklyStats.map((day, index) => (
                                    <div key={day.date} className="text-center">
                                        <div className="text-sm font-medium text-slate-600 mb-2">{day.day}</div>
                                        <div className="relative h-24 bg-slate-100 rounded-lg overflow-hidden">
                                            <div
                                                className="absolute bottom-0 w-full bg-indigo-600 transition-all"
                                                style={{ height: `${day.rate}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 text-sm font-semibold text-slate-700">{day.rate}%</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                {selectedClass ? 'No weekly data available' : 'Select a class to view weekly stats'}
                            </div>
                        )}
                    </div>

                    {/* Class Averages */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Class Attendance Averages</h3>
                        {loading ? (
                            <div className="text-center py-4 text-slate-500">Loading class averages...</div>
                        ) : classSummaries.length > 0 ? (
                            <div className="space-y-3">
                                {classSummaries.map(cls => (
                                    <div key={cls.classId} className="flex items-center gap-4">
                                        <span className="w-32 text-sm font-medium text-slate-600">{cls.className}</span>
                                        <div className="flex-1">
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-600 rounded-full"
                                                    style={{ width: `${cls.averageRate}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-slate-800">
                                            {cls.averageRate}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-500">No class data available</div>
                        )}
                    </div>

                    {/* Top/Bottom Performers */}
                    {/* Top/Bottom Performers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Best Attendance */}
                        {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    Best Attendance (≥90%)
                                </h3>
                                {bestStudents.length > 5 && (
                                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                                        See All ({bestStudents.length})
                                    </button>
                                )}
                            </div>
                            {loading ? (
                                <div className="text-center py-4 text-slate-500">Loading...</div>
                            ) : bestStudents.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {bestStudents.slice(0, 5).map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-green-800">{student.name}</p>
                                                <p className="text-xs text-green-600">{student.examNumber}</p>
                                            </div>
                                            <span className="text-sm font-bold text-green-700">{student.attendanceRate}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-500">
                                    No students with ≥90% attendance
                                </div>
                            )}
                        </div> */}

                        {/* Needs Improvement */}
                        {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                    Needs Improvement (&lt;70%)
                                </h3>
                                {needsImprovementStudents.length > 5 && (
                                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                                        See All ({needsImprovementStudents.length})
                                    </button>
                                )}
                            </div>
                            {loading ? (
                                <div className="text-center py-4 text-slate-500">Loading...</div>
                            ) : needsImprovementStudents.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {needsImprovementStudents.slice(0, 5).map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-red-800">{student.name}</p>
                                                <p className="text-xs text-red-600">{student.examNumber}</p>
                                            </div>
                                            <span className="text-sm font-bold text-red-700">{student.attendanceRate}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-500">
                                    No students with &lt;70% attendance
                                </div>
                            )}
                        </div> */}

                        {/* Best Attendance */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    Best Attendance (≥90%)
                                </h3>
                                {bestStudents.length > 5 && (
                                    <button
                                        onClick={() => setShowAllBest(!showAllBest)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        {showAllBest ? 'Show Less' : `See All (${bestStudents.length})`}
                                    </button>
                                )}
                            </div>
                            {loading ? (
                                <div className="text-center py-4 text-slate-500">Loading...</div>
                            ) : bestStudents.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {(showAllBest ? bestStudents : bestStudents.slice(0, 5)).map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-green-800">{student.name}</p>
                                                <p className="text-xs text-green-600">{student.examNumber}</p>
                                            </div>
                                            <span className="text-sm font-bold text-green-700">{student.attendanceRate}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-500">
                                    No students with ≥90% attendance
                                </div>
                            )}
                        </div>

                        {/* Needs Improvement */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                    Needs Improvement (&lt;70%)
                                </h3>
                                {needsImprovementStudents.length > 5 && (
                                    <button
                                        onClick={() => setShowAllNeeds(!showAllNeeds)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        {showAllNeeds ? 'Show Less' : `See All (${needsImprovementStudents.length})`}
                                    </button>
                                )}
                            </div>
                            {loading ? (
                                <div className="text-center py-4 text-slate-500">Loading...</div>
                            ) : needsImprovementStudents.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {(showAllNeeds ? needsImprovementStudents : needsImprovementStudents.slice(0, 5)).map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-red-800">{student.name}</p>
                                                <p className="text-xs text-red-600">{student.examNumber}</p>
                                            </div>
                                            <span className="text-sm font-bold text-red-700">{student.attendanceRate}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-500">
                                    No students with &lt;70% attendance
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'history' && (
                <div className="space-y-6">
                    {/* History Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Attendance History</h3>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
                                <select
                                    value={historyPeriod}
                                    onChange={(e) => setHistoryPeriod(e.target.value as 'month' | 'term')}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="month">Last 30 Days</option>
                                    <option value="term">Current Term</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All Classes</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Search Student</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or exam number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student List with History */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance Rate</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loadingHistory ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                Loading students...
                                            </td>
                                        </tr>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => {
                                            const studentRecords = attendanceData.filter(s => s.id === student.id);
                                            const presentCount = studentRecords.filter(s => s.status === 'present' || s.status === 'late').length;
                                            const rate = studentRecords.length > 0
                                                ? ((presentCount / studentRecords.length) * 100).toFixed(1)
                                                : '0.0';

                                            return (
                                                <tr key={student.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                                    <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {classes.find(c => c.id === selectedClass)?.name || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(rate) >= 90 ? 'bg-green-100 text-green-700' :
                                                            Number(rate) >= 75 ? 'bg-blue-100 text-blue-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {rate}%
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                loadStudentHistory(student);
                                                            }}
                                                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors flex items-center gap-1"
                                                        >
                                                            <Clock className="w-4 h-4" />
                                                            View History
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center text-slate-500 py-4">
                                                No students found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'alerts' && (
                <div className="space-y-6">
                    {/* Send Alerts */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Send Attendance Alerts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Bell className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800">SMS Alerts</h4>
                                        <p className="text-xs text-slate-500">Send to absent/late students</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSendAlerts('sms')}
                                    disabled={sendingAlerts || !selectedClass}
                                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                                >
                                    {sendingAlerts ? 'Sending...' : 'Send SMS Alerts'}
                                </button>
                            </div>

                            <div className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800">Email Alerts</h4>
                                        <p className="text-xs text-slate-500">Detailed attendance reports</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSendAlerts('email')}
                                    disabled={sendingAlerts || !selectedClass}
                                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
                                >
                                    {sendingAlerts ? 'Sending...' : 'Send Email Reports'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Alert History */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Recent Alerts</h3>
                        {alertHistory.length > 0 ? (
                            <div className="space-y-3">
                                {alertHistory.map((alert, index) => (
                                    <div key={alert.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Bell className="w-4 h-4 text-indigo-600" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {alert.subject || 'Attendance Alert'} - {new Date(alert.sentAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Sent to {alert.recipientCount} {alert.recipientCount === 1 ? 'parent' : 'parents'} • {alert.method?.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-green-600">{alert.status || 'Delivered'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No alert history available
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Student History Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">
                                        Attendance History: {selectedStudent.name}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Exam: {selectedStudent.examNumber}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Period Selector */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setHistoryPeriod('month')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${historyPeriod === 'month'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    Last 30 Days
                                </button>
                                <button
                                    onClick={() => setHistoryPeriod('term')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${historyPeriod === 'term'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    Current Term
                                </button>
                            </div>

                            {/* History Table */}
                            {loadingHistory ? (
                                <div className="text-center py-8 text-slate-500">Loading history...</div>
                            ) : studentHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Date</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Status</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Check-in Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {studentHistory.map((record, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                            record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                                record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-slate-600">{record.checkInTime || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    No attendance records found for this period
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;