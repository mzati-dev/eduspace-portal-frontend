import React, { useState, useEffect } from 'react';
import { AlertCircle, BarChart3, Bell, Calendar, CheckCircle, Clock3, CloudRain, UserCheck, UserX } from 'lucide-react';
import {

    fetchAttendanceByClassAndDate,
    saveAttendance,
    saveSingleAttendance,
    markAllPresent,
    fetchWeeklyStats,
    fetchMonthlyStats,
    fetchTermStats,
    fetchClassSummaries,
    fetchStudentPerformance,
    sendAttendanceAlerts,
    fetchAlertHistory,

    WeeklyStats,

    ClassAttendanceSummary,
    fetchCurrentTerm,
    fetchTerms,
    fetchStudentAttendanceHistoryByDateRange,
    fetchRecordedDaysCount,
    fetchPublicHolidays,
    fetchSchoolHolidays
} from '@/services/attendanceService';
import DailyTrackingTab from './DailyTrackingTab';
import OverviewTab from './OverviewTab';
import AttendanceHistoryTab from './AttendanceHistoryTab';
import AlertsTab from './AlertsTab';
import StudentHistoryModal from './StudentHistoryModal';
import TeacherAttendanceAnalytics from './TeacherAttendanceAnalytics';

export interface StudentAttendance {
    id: string;
    name: string;
    examNumber: string;
    classId: string;      // Add this
    class: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'unmarked';
    checkInTime?: string;
    parentContact?: string;
}

export interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
}

interface Props {
    classes: any[];
    students: any[];
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
    const [viewMode, setViewMode] = useState<'daily' | 'overview' | 'history' | 'alerts' | 'analytics'>('daily');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
    const [markingAll, setMarkingAll] = useState(false);

    // Add with other state declarations
    const [availableTerms, setAvailableTerms] = useState<Array<{ id: string; name: string; startDate: string; endDate: string }>>([]);
    const [selectedTerm, setSelectedTerm] = useState<string>('');
    const [currentTerm, setCurrentTerm] = useState<{ id: string; name: string; startDate: string; endDate: string } | null>(null);

    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
    const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
    const [termStats, setTermStats] = useState<any>({ averageRate: 0, highestRate: 0, lowestRate: 0, totalDays: 0, termName: 'Term 1 2024' });
    const [classSummaries, setClassSummaries] = useState<ClassAttendanceSummary[]>([]);
    const [bestStudents, setBestStudents] = useState<any[]>([]);
    const [needsImprovementStudents, setNeedsImprovementStudents] = useState<any[]>([]);
    const [showAllBest, setShowAllBest] = useState(false);
    const [showAllNeeds, setShowAllNeeds] = useState(false);

    // Alerts data states
    const [alertHistory, setAlertHistory] = useState<any[]>([]);
    const [sendingAlerts, setSendingAlerts] = useState(false);

    // Student history view states
    const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
    const [studentHistory, setStudentHistory] = useState<any[]>([]);

    const [loadingHistory, setLoadingHistory] = useState(false);


    // Term info state (for the shared header)
    const [termInfo, setTermInfo] = useState({
        name: 'Loading term...',
        startDate: '',
        endDate: ''
    });
    const [publicHolidays, setPublicHolidays] = useState<Set<string>>(new Set());
    const [schoolHolidays, setSchoolHolidays] = useState<Set<string>>(new Set());
    const [recordedDays, setRecordedDays] = useState(0);
    const [currentWeekNumber, setCurrentWeekNumber] = useState<number>(0);
    const [totalWeeks, setTotalWeeks] = useState<number>(0);
    const [weeksRemaining, setWeeksRemaining] = useState<number>(0);
    const [loadingHolidays, setLoadingHolidays] = useState(false);

    const allHolidays = new Set([...publicHolidays, ...schoolHolidays]);

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

    useEffect(() => {
        loadTerms();  // changed from fetchTerms()
    }, []);

    useEffect(() => {
        loadCurrentTerm();  // changed from fetchCurrentTerm()
    }, []);



    // Update week information
    useEffect(() => {
        if (termInfo.startDate && selectedDate) {
            const weekNum = getWeekNumberOfTerm(selectedDate, termInfo.startDate);
            setCurrentWeekNumber(weekNum);
            const totalWeeksInTerm = calculateTotalWeeksInTerm();
            setTotalWeeks(totalWeeksInTerm);
            setWeeksRemaining(Math.max(0, totalWeeksInTerm - weekNum));
        }
    }, [selectedDate, termInfo.startDate, termInfo.endDate]);

    // useEffect(() => {
    //     fetchTermInfo();
    //     fetchPublicHolidaysList();
    //     fetchSchoolHolidaysList();
    // }, []);

    // useEffect(() => {
    //     if (selectedClass && selectedDate) {
    //         fetchRecordedDaysCountHandler();
    //     }
    // }, [selectedClass, selectedDate]);

    // DELETE this useEffect:
    // useEffect(() => {
    //     if (selectedClass && selectedDate) {
    //         fetchRecordedDaysCountHandler();
    //     }
    // }, [selectedClass, selectedDate]);

    useEffect(() => {
        fetchTermInfo();
        fetchPublicHolidaysList();
        fetchSchoolHolidaysList();
    }, []);

    // ADD THIS RIGHT HERE ↓↓↓
    useEffect(() => {
        if (termInfo.startDate && termInfo.endDate) {
            fetchRecordedDaysCountHandler();
        }
    }, [termInfo.startDate, termInfo.endDate, allHolidays]);

    // Change this function name from fetchCurrentTerm to loadCurrentTerm
    const loadCurrentTerm = async () => {
        try {
            const term = await fetchCurrentTerm();
            if (term) {
                setCurrentTerm(term);
            }
        } catch (error) {
            console.error('Failed to fetch current term:', error);
        }
    };

    // Change this function name from fetchTerms to loadTerms
    const loadTerms = async () => {
        try {
            const terms = await fetchTerms();
            setAvailableTerms(terms);
            if (terms.length > 0) {
                setSelectedTerm(terms[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch terms:', error);
        }
    };

    const loadAttendanceData = async () => {
        setLoading(true);
        try {
            const existingRecords = await fetchAttendanceByClassAndDate(selectedClass, selectedDate);
            const classStudents = students.filter(s => s.class?.id === selectedClass);
            const recordMap = new Map(existingRecords.map(r => [r.studentId, r]));

            const data: StudentAttendance[] = classStudents.map(student => {
                const existing = recordMap.get(student.id); // ✅ Define 'existing' here

                return {
                    id: student.id,
                    name: student.name,
                    examNumber: student.examNumber,
                    classId: student.class?.id || '',     // Add this
                    class: student.class?.name || '',     // Add this
                    status: existing?.status || 'unmarked',
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

    const loadOverviewData = async () => {
        setLoading(true);
        try {
            if (!teacherId) return;

            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

            const startDate = startOfWeek.toISOString().split('T')[0];
            const endDate = endOfWeek.toISOString().split('T')[0];

            const [summaries, best, needsImprovement] = await Promise.all([
                fetchClassSummaries(teacherId),
                selectedClass ? fetchStudentPerformance(selectedClass, 'best') : Promise.resolve([]),
                selectedClass ? fetchStudentPerformance(selectedClass, 'needs-improvement') : Promise.resolve([])
            ]);

            setClassSummaries(summaries);
            setBestStudents(best);
            setNeedsImprovementStudents(needsImprovement);

            if (selectedClass) {
                const [weekly, monthly, term] = await Promise.all([
                    fetchWeeklyStats(selectedClass, startDate, endDate),
                    fetchMonthlyStats(selectedClass, 2024, 1),
                    fetchTermStats(selectedClass, 'Term 1 2024')
                ]);
                setWeeklyStats(weekly);
                setMonthlyStats(monthly);
                setTermStats(term);
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

    const handleStatusChange = async (studentId: string, newStatus: StudentAttendance['status']) => {
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

        // Only save if status is not 'unmarked'
        if (newStatus !== 'unmarked') {
            try {
                await saveSingleAttendance({
                    studentId,
                    classId: selectedClass,
                    date: selectedDate,
                    status: newStatus as 'present' | 'absent' | 'late' | 'excused',
                    checkInTime: newStatus === 'present' || newStatus === 'late'
                        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : undefined
                });
                showMessage(`Attendance updated`);
            } catch (err) {
                loadAttendanceData();
                showMessage('Failed to update attendance', true);
            }
        }
    };

    const handleMarkAllPresent = async () => {
        try {
            setMarkingAll(true);
            const studentIds = attendanceData.map(s => s.id);
            await markAllPresent(selectedClass, selectedDate, studentIds);
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
            setMarkingAll(false);
        }
    };

    const handleSendAlerts = async (method: 'sms' | 'email') => {
        if (!selectedClass) {
            showMessage('Please select a class first', true);
            return;
        }

        try {
            setSendingAlerts(true);
            const result = await sendAttendanceAlerts(selectedClass, selectedDate, method);
            showMessage(result.message);
            loadAlertHistory();
        } catch (err) {
            showMessage('Failed to send alerts', true);
        } finally {
            setSendingAlerts(false);
        }
    };

    const handleSaveAttendance = async () => {
        try {
            setSaving(true);
            // Filter out students with 'unmarked' status
            const records = attendanceData
                .filter(s => s.status !== 'unmarked')
                .map(s => ({
                    studentId: s.id,
                    classId: selectedClass,
                    date: selectedDate,
                    status: s.status as 'present' | 'absent' | 'late' | 'excused',
                    checkInTime: s.checkInTime
                }));
            await saveAttendance(records);
            showMessage('Attendance saved successfully');

        } catch (err) {
            showMessage('Failed to save attendance', true);
            console.error('Error saving attendance:', err);
        } finally {
            setSaving(false);
        }
    };
    const loadStudentHistory = async (student: StudentAttendance) => {
        if (!selectedTerm) {
            showMessage('Please select a term first', true);
            return;
        }

        setLoadingHistory(true);
        setSelectedStudent(student);
        try {
            const selectedTermObj = availableTerms.find(t => t.id === selectedTerm);
            if (!selectedTermObj) return;

            const history = await fetchStudentAttendanceHistoryByDateRange(
                student.id,
                selectedTermObj.startDate,
                selectedTermObj.endDate
            );
            setStudentHistory(history);
        } catch (error) {
            showMessage('Failed to load student history', true);
        } finally {
            setLoadingHistory(false);
        }
    };

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

    const fetchTermInfo = async () => {
        try {
            const term = await fetchCurrentTerm();
            if (term) {
                setTermInfo({
                    name: term.name,
                    startDate: term.startDate,
                    endDate: term.endDate
                });
                setCurrentTerm(term);
            }
        } catch (error) {
            console.error('Failed to fetch term info:', error);
            setTermInfo({ name: 'Setting up term...', startDate: '', endDate: '' });
        }
    };

    const fetchPublicHolidaysList = async () => {
        setLoadingHolidays(true);
        try {
            const holidays = await fetchPublicHolidays();
            const holidaySet = new Set<string>();
            holidays.forEach((holiday: { date: string }) => {
                holidaySet.add(holiday.date);
            });
            setPublicHolidays(holidaySet);
        } catch (error) {
            console.error('Failed to fetch public holidays:', error);
            setPublicHolidays(new Set());
        } finally {
            setLoadingHolidays(false);
        }
    };

    const fetchSchoolHolidaysList = async () => {
        try {
            const holidays = await fetchSchoolHolidays();
            const holidaySet = new Set<string>();
            holidays.forEach((holiday: { date: string }) => {
                holidaySet.add(holiday.date);
            });
            setSchoolHolidays(holidaySet);
        } catch (error) {
            console.error('Failed to fetch school holidays:', error);
            setSchoolHolidays(new Set());
        }
    };

    // const fetchRecordedDaysCountHandler = async () => {
    //     if (!selectedClass) return;
    //     try {
    //         const count = await fetchRecordedDaysCount(selectedClass);
    //         setRecordedDays(count);
    //     } catch (error) {
    //         console.error('Failed to fetch recorded days:', error);
    //         setRecordedDays(0);
    //     }
    // };

    const fetchRecordedDaysCountHandler = async () => {
        // Recorded days should be based on TERM, not class
        // Count how many school days have passed in the current term up to today
        try {
            const today = new Date().toISOString().split('T')[0];
            const start = new Date(termInfo.startDate);
            const end = new Date(today);

            let count = 0;
            let current = new Date(start);

            while (current <= end) {
                const dayOfWeek = current.getDay();
                const dateStr = current.toISOString().split('T')[0];

                if (dayOfWeek >= 1 && dayOfWeek <= 5 && !allHolidays.has(dateStr)) {
                    count++;
                }
                current.setDate(current.getDate() + 1);
            }

            setRecordedDays(count);
        } catch (error) {
            console.error('Failed to calculate recorded days:', error);
            setRecordedDays(0);
        }
    };

    const getFormattedDate = (date: string): string => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calculate week number WITHIN THE TERM (not calendar year)
    const getWeekNumberOfTerm = (date: string, termStart: string): number => {
        const d = new Date(date);
        const start = new Date(termStart);
        const diffTime = Math.abs(d.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil((diffDays + 1) / 7);
    };

    // Calculate total weeks in term (based on term start and end dates)
    const calculateTotalWeeksInTerm = (): number => {
        if (!termInfo.startDate || !termInfo.endDate) return 0;
        const start = new Date(termInfo.startDate);
        const end = new Date(termInfo.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
    };

    const calculateTotalDays = () => {
        if (!termInfo.startDate || !termInfo.endDate) return 0;

        const start = new Date(termInfo.startDate);
        const end = new Date(termInfo.endDate);
        let total = 0;
        let current = new Date(start);

        while (current <= end) {
            const dayOfWeek = current.getDay();
            const dateStr = current.toISOString().split('T')[0];

            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !allHolidays.has(dateStr)) {
                total++;
            }
            current.setDate(current.getDate() + 1);
        }
        return total;
    };

    // ADD THESE TWO LINES HERE:
    const totalDays = calculateTotalDays();
    const remainingDays = totalDays - recordedDays;

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Attendance Management</h2>
                        <p className="text-slate-500">Track and manage student attendance</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleSendAlerts('sms')}
                            disabled={sendingAlerts || !selectedClass}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <Bell className="w-4 h-4" />
                            {sendingAlerts ? 'Sending...' : 'Alert Parents'}
                        </button>
                    </div>
                </div>

                {/* Term and Academic Year - BIG AND CLEAR */}
                <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-4 mb-4">
                    <Calendar className="w-8 h-8 text-indigo-600" />
                    <div>
                        <p className="text-xs text-indigo-600 font-medium">CURRENT ACADEMIC PERIOD</p>
                        <p className="text-2xl font-bold text-indigo-800">
                            {termInfo.name || 'Loading term...'}
                        </p>
                    </div>
                </div>

                {/* Shared Term Info Card - Visible across all tabs */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-indigo-900">Term Overview</h3>
                            <p className="text-sm text-indigo-600">
                                {termInfo.startDate || 'Loading...'} to {termInfo.endDate || 'Loading...'} | Monday-Friday only
                            </p>
                        </div>
                        <div className="text-right">
                            {loadingHolidays && (
                                <div className="text-xs text-amber-600 flex items-center gap-1">
                                    <CloudRain className="w-3 h-3" />
                                    Loading holidays...
                                </div>
                            )}
                            {!loadingHolidays && publicHolidays.size > 0 && (
                                <div className="text-xs text-green-600">
                                    {publicHolidays.size} public holidays
                                </div>
                            )}
                            {schoolHolidays.size > 0 && (
                                <div className="text-xs text-purple-600">
                                    +{schoolHolidays.size} school holidays
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-indigo-800">{totalDays}</p>
                            <p className="text-xs text-indigo-600">Total School Days</p>
                        </div>
                        <div className="text-center border-l border-r border-indigo-200">
                            <p className="text-2xl font-bold text-emerald-700">{recordedDays}</p>
                            <p className="text-xs text-indigo-600">Current Day</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-700">{remainingDays}</p>
                            <p className="text-xs text-indigo-600">Remaining Days</p>
                        </div>
                        <div className="text-center border-l border-indigo-200">
                            <p className="text-2xl font-bold text-purple-700">{currentWeekNumber}</p>
                            <p className="text-xs text-indigo-600">Current Week</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-indigo-200">
                        <div className="text-center">
                            <p className="text-xl font-bold text-indigo-800">{totalWeeks}</p>
                            <p className="text-xs text-indigo-600">Total Weeks in Term</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-emerald-700">{weeksRemaining}</p>
                            <p className="text-xs text-indigo-600">Weeks Remaining</p>
                        </div>
                    </div>
                </div>

                {/* Date Information */}
                <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-500">Date</h4>
                            <p className="text-lg font-semibold text-slate-800">
                                {getFormattedDate(selectedDate)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setViewMode('daily')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'daily'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Daily Tracking
                </button>
                <button
                    onClick={() => setViewMode('overview')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'overview'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setViewMode('analytics')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'analytics'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Analytics
                </button>
                <button
                    onClick={() => setViewMode('history')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'history'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Attendance History
                </button>
                <button
                    onClick={() => setViewMode('alerts')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'alerts'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Alerts
                </button>
            </div>

            {/* Tab Components */}
            {viewMode === 'daily' && (
                <DailyTrackingTab
                    classes={classes}
                    selectedClass={selectedClass}
                    setSelectedClass={setSelectedClass}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    loading={loading}
                    saving={saving}
                    markingAll={markingAll}
                    stats={stats}
                    filteredStudents={attendanceData.filter(s =>
                        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.examNumber.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    onStatusChange={handleStatusChange}
                    onSaveAttendance={handleSaveAttendance}
                    onMarkAllPresent={handleMarkAllPresent}
                    getStatusColor={(status) => {
                        switch (status) {
                            case 'present': return 'bg-green-100 text-green-700 border-green-200';
                            case 'absent': return 'bg-red-100 text-red-700 border-red-200';
                            case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
                            case 'excused': return 'bg-blue-100 text-blue-700 border-blue-200';
                            case 'unmarked': return 'bg-orange-100 text-orange-700 border-orange-300 font-semibold';
                            default: return 'bg-slate-100 text-slate-700 border-slate-200';
                        }
                    }}
                    getStatusIcon={(status) => {
                        switch (status) {
                            case 'present': return <UserCheck className="w-4 h-4" />;
                            case 'absent': return <UserX className="w-4 h-4" />;
                            case 'late': return <Clock3 className="w-4 h-4" />;
                            case 'excused': return <CheckCircle className="w-4 h-4" />;
                            case 'unmarked': return <AlertCircle className="w-4 h-4" />;
                            default: return <AlertCircle className="w-4 h-4" />;
                        }
                    }}
                />
            )}

            {viewMode === 'overview' && (
                <OverviewTab
                    loading={loading}
                    selectedClass={selectedClass}
                    weeklyStats={weeklyStats}
                    monthlyStats={monthlyStats}
                    termStats={termStats}
                    classSummaries={classSummaries}
                    bestStudents={bestStudents}
                    needsImprovementStudents={needsImprovementStudents}
                    showAllBest={showAllBest}
                    setShowAllBest={setShowAllBest}
                    showAllNeeds={showAllNeeds}
                    setShowAllNeeds={setShowAllNeeds}
                />
            )}

            {/* {viewMode === 'overview' && (
                <OverviewTab
                    loading={loading}
                    selectedClass={selectedClass}
                    weeklyStats={weeklyStats}
                    classSummaries={classSummaries}
                    bestStudents={bestStudents}
                    needsImprovementStudents={needsImprovementStudents}
                    showAllBest={showAllBest}
                    setShowAllBest={setShowAllBest}
                    showAllNeeds={showAllNeeds}
                    setShowAllNeeds={setShowAllNeeds}
                />
            )} */}

            {viewMode === 'analytics' && (
                <TeacherAttendanceAnalytics
                    classId={selectedClass}
                    className={classes.find(c => c.id === selectedClass)?.name || ''}
                    students={students.filter(s => s.class?.id === selectedClass)}
                    showMessage={showMessage}
                    allClasses={classes}
                    onClassChange={(newClassId) => setSelectedClass(newClassId)}
                />
            )}

            {viewMode === 'history' && (
                <AttendanceHistoryTab
                    classes={classes}
                    students={attendanceData}
                    selectedClass={selectedClass}
                    setSelectedClass={setSelectedClass}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}


                    loadingHistory={loadingHistory}
                    onViewHistory={(student) => {
                        setSelectedStudent(student);
                        loadStudentHistory(student);
                    }}
                />
            )}

            {viewMode === 'alerts' && (
                <AlertsTab
                    selectedClass={selectedClass}
                    sendingAlerts={sendingAlerts}
                    alertHistory={alertHistory}
                    onSendAlerts={handleSendAlerts}
                />
            )}

            {/* Student History Modal */}
            {selectedStudent && (
                <StudentHistoryModal
                    student={selectedStudent}
                    studentHistory={studentHistory}
                    selectedTerm={selectedTerm}
                    availableTerms={availableTerms}
                    loadingHistory={loadingHistory}
                    onClose={() => setSelectedStudent(null)}
                    onTermChange={(termId) => {
                        setSelectedTerm(termId);
                        if (selectedStudent) {
                            loadStudentHistory(selectedStudent);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default TeacherAttendance;