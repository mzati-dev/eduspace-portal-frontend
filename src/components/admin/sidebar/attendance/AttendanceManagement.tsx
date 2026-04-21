// components/attendance/AttendanceManagement.tsx
import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Bell,
    TrendingUp,
    BarChart3,
    Clock,
    CheckCircle,
    Clock3,
    UserCheck,
    UserX,
    AlertCircle,
    CloudRain,
    Plus,
    Lock,
    Info,
    ShieldCheck,
    Save,
    Gift
} from 'lucide-react';

import { StudentAttendance, Props } from './types';
import DailyTrackingTab from './DailyTrackingTab';
import OverviewTab from './OverviewTab';
import PatternsTab from './PatternsTab';
import HistoryTab from './HistoryTab';
import AlertsTab from './AlertsTab';
import StudentHistoryModal from './StudentHistoryModal';
import {
    fetchAttendanceByClassAndDate, fetchWeeklyStats, fetchClassSummaries, fetchAlertHistory, fetchAttendancePatterns, fetchStudentPerformance, saveSingleAttendance, markAllPresent, saveAttendance, sendAttendanceAlerts, fetchCurrentTerm,
    fetchTerms,
    fetchStudentAttendanceHistoryByDateRange,
    fetchPublicHolidays,
    fetchSchoolHolidays,
    fetchRecordedDaysCount
} from '@/services/attendanceService';
import AttendanceAnalytics from './AttendanceAnalytics';

const AttendanceManagement: React.FC<Props & { monthlyStats?: any[]; termStats?: any }> = ({ classes, students, showMessage, monthlyStats = [], termStats = {} }) => {
    // State
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'daily' | 'overview' | 'analytics' | 'history' | 'alerts'>('daily');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [loadingPatterns, setLoadingPatterns] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    // Add with your other state declarations
    const [availableTerms, setAvailableTerms] = useState<Array<{ id: string; name: string; startDate: string; endDate: string }>>([]);
    const [selectedTerm, setSelectedTerm] = useState<string>('');
    const [currentTerm, setCurrentTerm] = useState<{ id: string; name: string; startDate: string; endDate: string } | null>(null);

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

    // Data states
    const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
    const [classSummaries, setClassSummaries] = useState<any[]>([]);
    const [bestStudents, setBestStudents] = useState<any[]>([]);
    const [needsImprovementStudents, setNeedsImprovementStudents] = useState<any[]>([]);
    const [showAllBest, setShowAllBest] = useState(false);
    const [showAllNeeds, setShowAllNeeds] = useState(false);
    const [alertHistory, setAlertHistory] = useState<any[]>([]);
    const [dailyPatterns, setDailyPatterns] = useState<any[]>([]);
    const [classPerformance, setClassPerformance] = useState<any[]>([]);
    const [peakLateTimes, setPeakLateTimes] = useState<any[]>([]);
    const [patterns, setPatterns] = useState<any>({
        highestAbsenceDay: '---',
        highestAbsenceRate: '---',
        bestAttendanceDay: '---',
        bestAttendanceRate: '---',
        peakLateTime: '---'
    });

    // History states
    const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
    const [studentHistory, setStudentHistory] = useState<any[]>([]);

    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const allHolidays = new Set([...publicHolidays, ...schoolHolidays]);

    // Shared term info functions
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
    //     if (selectedClass === 'all') return;
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

    const totalDays = calculateTotalDays();
    const remainingDays = totalDays - recordedDays;

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

    useEffect(() => {
        fetchTermInfo();
        fetchPublicHolidaysList();
        fetchSchoolHolidaysList();
    }, []);

    // useEffect(() => {
    //     if (selectedClass !== 'all' && selectedDate) {
    //         fetchRecordedDaysCountHandler();
    //     }
    // }, [selectedClass, selectedDate]);

    useEffect(() => {
        if (termInfo.startDate && termInfo.endDate) {
            fetchRecordedDaysCountHandler();
        }
    }, [termInfo.startDate, termInfo.endDate, allHolidays]);

    useEffect(() => {
        loadTerms();
    }, []);

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

    // Load functions (keep all your existing load functions here)
    const loadAttendanceData = async () => {
        if (!selectedClass || selectedClass === 'all') return;
        setLoading(true);
        try {
            const records = await fetchAttendanceByClassAndDate(selectedClass, selectedDate);
            const transformedData: StudentAttendance[] = students
                .filter(s => s.class?.id === selectedClass)
                .map(student => {
                    const record = records.find(r => r.studentId === student.id);
                    return {
                        id: student.id,
                        name: student.name,
                        examNumber: student.examNumber,
                        class: student.class?.name || '',
                        classId: student.class?.id || '',
                        status: record?.status || 'unmarked',
                        checkInTime: record?.checkInTime,
                        parentContact: student.parentPhone,
                        parentEmail: student.parentEmail
                    };
                });
            setAttendanceData(transformedData);
        } catch (error) {
            showMessage('Failed to load attendance data', true);
        } finally {
            setLoading(false);
        }
    };

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

    const loadAllClassesAttendance = async () => {
        setLoading(true);
        try {
            const allData: StudentAttendance[] = [];
            for (const cls of classes) {
                const records = await fetchAttendanceByClassAndDate(cls.id, selectedDate);
                const classStudents = students.filter(s => s.class?.id === cls.id);
                classStudents.forEach(student => {
                    const record = records.find(r => r.studentId === student.id);
                    allData.push({
                        id: student.id,
                        name: student.name,
                        examNumber: student.examNumber,
                        class: cls.name,
                        classId: cls.id,
                        status: record?.status || 'unmarked',
                        checkInTime: record?.checkInTime,
                        parentContact: student.parentPhone,
                        parentEmail: student.parentEmail
                    });
                });
            }
            setAttendanceData(allData);
        } catch (error) {
            showMessage('Failed to load attendance data', true);
        } finally {
            setLoading(false);
        }
    };

    const loadClassSummaries = async () => {
        try {
            const summaries = await fetchClassSummaries(classes[0]?.id || '');
            setClassSummaries(summaries);
        } catch (error) {
            console.error('Failed to load class summaries:', error);
        }
    };

    const loadAlertHistory = async () => {
        try {
            const history = await fetchAlertHistory(selectedClass !== 'all' ? selectedClass : undefined, 10);
            setAlertHistory(history);
        } catch (error) {
            console.error('Failed to load alert history:', error);
        }
    };

    const loadAttendancePatterns = async () => {
        if (!selectedClass || selectedClass === 'all') return;
        setLoadingPatterns(true);
        try {
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const patternsData = await fetchAttendancePatterns(selectedClass, startDate, endDate);
            setDailyPatterns(patternsData.dailyPatterns);
            setClassPerformance(patternsData.classPerformance);
            setPeakLateTimes(patternsData.peakLateTimes);
            if (patternsData.dailyPatterns.length > 0) {
                const dayStats = patternsData.dailyPatterns.reduce((acc: any, day: any) => {
                    const dayName = day.day;
                    if (!acc[dayName]) {
                        acc[dayName] = { absent: 0, total: 0, count: 0 };
                    }
                    acc[dayName].absent += day.absent;
                    acc[dayName].total += day.total;
                    acc[dayName].count++;
                    return acc;
                }, {});
                let highestAbsenceDay = '';
                let highestAbsenceRate = 0;
                let bestAttendanceDay = '';
                let bestAttendanceRate = 0;
                Object.entries(dayStats).forEach(([day, stats]: [string, any]) => {
                    const absenceRate = (stats.absent / stats.total) * 100;
                    const attendanceRate = ((stats.total - stats.absent) / stats.total) * 100;
                    if (absenceRate > highestAbsenceRate) {
                        highestAbsenceRate = absenceRate;
                        highestAbsenceDay = day;
                    }
                    if (attendanceRate > bestAttendanceRate) {
                        bestAttendanceRate = attendanceRate;
                        bestAttendanceDay = day;
                    }
                });
                setPatterns({
                    highestAbsenceDay,
                    highestAbsenceRate: highestAbsenceRate.toFixed(1),
                    bestAttendanceDay,
                    bestAttendanceRate: bestAttendanceRate.toFixed(1),
                    peakLateTime: patternsData.peakLateTimes[0]?.time || '8:45 AM'
                });
            }
        } catch (error) {
            showMessage('Failed to load attendance patterns', true);
        } finally {
            setLoadingPatterns(false);
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

    const loadOverviewData = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
            const startDate = startOfWeek.toISOString().split('T')[0];
            const endDate = endOfWeek.toISOString().split('T')[0];
            const [summaries, best, needsImprovement] = await Promise.all([
                fetchClassSummaries(classes[0]?.id || ''),
                selectedClass !== 'all' ? fetchStudentPerformance(selectedClass, 'best') : Promise.resolve([]),
                selectedClass !== 'all' ? fetchStudentPerformance(selectedClass, 'needs-improvement') : Promise.resolve([])
            ]);
            setClassSummaries(summaries);
            setBestStudents(best);
            setNeedsImprovementStudents(needsImprovement);
            if (selectedClass !== 'all') {
                const weekly = await fetchWeeklyStats(selectedClass, startDate, endDate);
                setWeeklyStats(weekly);
            }
        } catch (error) {
            showMessage('Failed to load overview data', true);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
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
        try {
            const student = students.find(s => s.id === studentId);
            if (newStatus !== 'unmarked') {
                await saveSingleAttendance({
                    studentId,
                    classId: student?.class?.id || '',
                    date: selectedDate,
                    status: newStatus as 'present' | 'absent' | 'late' | 'excused',
                    checkInTime: newStatus === 'present' || newStatus === 'late'
                        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : undefined
                });
            }
            showMessage('Status updated successfully');
        } catch (error) {
            loadAttendanceData();
            showMessage('Failed to update status', true);
        }
    };

    const handleMarkAllPresent = async () => {
        if (selectedClass === 'all') {
            showMessage('Please select a specific class', true);
            return;
        }
        setMarkingAll(true);
        try {
            const studentIds = filteredStudents.map(s => s.id);
            await markAllPresent(selectedClass, selectedDate, studentIds);
            setAttendanceData(prev =>
                prev.map(s => ({
                    ...s,
                    status: 'present',
                    checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }))
            );
            showMessage('All students marked as present');
        } catch (error) {
            showMessage('Failed to mark all present', true);
        } finally {
            setMarkingAll(false);
        }
    };

    // const handleSaveAttendance = async () => {
    //     if (selectedClass === 'all') {
    //         showMessage('Please select a specific class', true);
    //         return;
    //     }
    //     setSaving(true);
    //     try {
    //         const records = attendanceData
    //             .filter(s => s.status !== 'unmarked')
    //             .map(s => ({
    //                 studentId: s.id,
    //                 classId: selectedClass,
    //                 date: selectedDate,
    //                 status: s.status as 'present' | 'absent' | 'late' | 'excused',
    //                 checkInTime: s.checkInTime
    //             }));

    //         await saveAttendance(records);
    //         showMessage('Attendance saved successfully');
    //         await loadAttendanceData();
    //     } catch (error) {
    //         showMessage('Failed to save attendance', true);
    //     } finally {
    //         setSaving(false);
    //     }
    // };

    const handleSaveAttendance = async () => {
        if (selectedClass === 'all') {
            showMessage('Please select a specific class', true);
            return;
        }
        setSaving(true);
        try {
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
        } catch (error) {
            showMessage('Failed to save attendance', true);
        } finally {
            setSaving(false);
        }
    };

    const handleSendAlert = async (type: 'sms' | 'email', studentIds: string[]) => {
        if (studentIds.length === 0) {
            showMessage('No students to alert', true);
            return;
        }
        setLoading(true);
        try {
            const result = await sendAttendanceAlerts(
                selectedClass !== 'all' ? selectedClass : '',
                selectedDate,
                type,
                studentIds
            );
            showMessage(result.message);
            loadAlertHistory();
        } catch (error) {
            showMessage(`Failed to send ${type} alerts`, true);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-700 border-green-200';
            case 'absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'excused': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'unmarked': return 'bg-orange-100 text-orange-700 border-orange-300 font-semibold';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <UserCheck className="w-4 h-4" />;
            case 'absent': return <UserX className="w-4 h-4" />;
            case 'late': return <Clock3 className="w-4 h-4" />;
            case 'excused': return <CheckCircle className="w-4 h-4" />;
            case 'unmarked': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    // Effects
    useEffect(() => {
        loadClassSummaries();
        loadAlertHistory();
    }, []);

    useEffect(() => {
        if (selectedClass !== 'all') {
            loadAttendanceData();
        } else {
            loadAllClassesAttendance();
        }
    }, [selectedClass, selectedDate]);

    useEffect(() => {
        if (viewMode === 'analytics' && selectedClass !== 'all') {
            loadAttendancePatterns();
        }
    }, [viewMode, selectedClass]);

    useEffect(() => {
        if (viewMode === 'overview') {
            loadOverviewData();
        }
    }, [viewMode, selectedClass]);

    const filteredStudents = attendanceData.filter(s =>
        (selectedClass === 'all' || s.classId === selectedClass) &&
        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: filteredStudents.length,
        present: filteredStudents.filter(s => s.status === 'present').length,
        absent: filteredStudents.filter(s => s.status === 'absent').length,
        late: filteredStudents.filter(s => s.status === 'late').length,
        excused: filteredStudents.filter(s => s.status === 'excused').length,
        rate: filteredStudents.length > 0
            ? ((filteredStudents.filter(s => s.status === 'present' || s.status === 'late').length / filteredStudents.length) * 100).toFixed(1)
            : '0'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Attendance Management</h2>
                        <p className="text-slate-500">Track and manage student attendance across all classes</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleSendAlert('sms', filteredStudents.filter(s => s.status === 'absent' || s.status === 'late').map(s => s.id))}
                            disabled={loading || filteredStudents.length === 0}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <Bell className="w-4 h-4" />
                            Alert Parents
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
                            <p className="text-xs text-indigo-600">Days Passed</p>
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
                    onClick={() => setViewMode('analytics')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'analytics'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Attendance Analytics
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

            {/* Tab Content */}
            {viewMode === 'daily' && (
                <DailyTrackingTab
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedClass={selectedClass}
                    setSelectedClass={setSelectedClass}
                    classes={classes}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    attendanceData={attendanceData}
                    loading={loading}
                    saving={saving}
                    markingAll={markingAll}
                    stats={stats}
                    handleStatusChange={handleStatusChange}
                    handleSaveAttendance={handleSaveAttendance}
                    handleMarkAllPresent={handleMarkAllPresent}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                />
            )}

            {viewMode === 'overview' && (
                <OverviewTab
                    monthlyStats={monthlyStats}
                    termStats={termStats}
                    loading={loading}
                    weeklyStats={weeklyStats}
                    classSummaries={classSummaries}
                    selectedClass={selectedClass}
                />
            )}

            {viewMode === 'analytics' && (
                <AttendanceAnalytics
                    classId={selectedClass}
                    className={classes.find(c => c.id === selectedClass)?.name || ''}
                    students={students}
                    showMessage={showMessage}
                    allClasses={classes}
                    onClassChange={(classId) => setSelectedClass(classId)}
                />
            )}

            {viewMode === 'history' && (
                <HistoryTab
                    selectedClass={selectedClass}
                    setSelectedClass={setSelectedClass}
                    classes={classes}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    attendanceData={attendanceData}
                    loadingHistory={loadingHistory}
                    onViewHistory={(student) => {
                        setSelectedStudent(student);
                        setShowHistoryModal(true);
                        loadStudentHistory(student);
                    }}
                />
            )}

            {viewMode === 'alerts' && (
                <AlertsTab
                    loading={loading}
                    alertHistory={alertHistory}
                    filteredStudents={filteredStudents}
                    onSendAlert={handleSendAlert}
                />
            )}

            {/* Modals */}
            {showHistoryModal && (
                <StudentHistoryModal
                    selectedStudent={selectedStudent}
                    studentHistory={studentHistory}
                    loadingHistory={loadingHistory}
                    selectedTerm={selectedTerm}
                    availableTerms={availableTerms}
                    onClose={() => {
                        setShowHistoryModal(false);
                        setSelectedStudent(null);
                    }}
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

export default AttendanceManagement;


// // components/attendance/AttendanceManagement.tsx
// import React, { useState, useEffect } from 'react';
// import {
//     Calendar,
//     Bell,
//     TrendingUp,
//     BarChart3,
//     Clock,
//     CheckCircle,
//     Clock3,
//     UserCheck,
//     UserX,
//     AlertCircle
// } from 'lucide-react';

// import { StudentAttendance, Props } from './types';
// import DailyTrackingTab from './DailyTrackingTab';
// import OverviewTab from './OverviewTab';
// import PatternsTab from './PatternsTab';
// import HistoryTab from './HistoryTab';
// import AlertsTab from './AlertsTab';
// import StudentHistoryModal from './StudentHistoryModal';
// import {
//     fetchAttendanceByClassAndDate, fetchWeeklyStats, fetchClassSummaries, fetchAlertHistory, fetchAttendancePatterns, fetchStudentPerformance, saveSingleAttendance, markAllPresent, saveAttendance, sendAttendanceAlerts, fetchCurrentTerm,
//     fetchTerms,
//     fetchStudentAttendanceHistoryByDateRange
// } from '@/services/attendanceService';
// import AttendanceAnalytics from './AttendanceAnalytics';

// const AttendanceManagement: React.FC<Props & { monthlyStats?: any[]; termStats?: any }> = ({ classes, students, showMessage, monthlyStats = [], termStats = {} }) => {
//     // State
//     const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
//     const [selectedClass, setSelectedClass] = useState<string>('all');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [viewMode, setViewMode] = useState<'daily' | 'overview' | 'analytics' | 'history' | 'alerts'>('daily');
//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const [markingAll, setMarkingAll] = useState(false);
//     const [loadingPatterns, setLoadingPatterns] = useState(false);
//     const [loadingHistory, setLoadingHistory] = useState(false);
//     // Add with your other state declarations
//     const [availableTerms, setAvailableTerms] = useState<Array<{ id: string; name: string; startDate: string; endDate: string }>>([]);
//     const [selectedTerm, setSelectedTerm] = useState<string>('');
//     const [currentTerm, setCurrentTerm] = useState<{ id: string; name: string; startDate: string; endDate: string } | null>(null);

//     // Data states
//     const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
//     const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
//     const [classSummaries, setClassSummaries] = useState<any[]>([]);
//     const [bestStudents, setBestStudents] = useState<any[]>([]);
//     const [needsImprovementStudents, setNeedsImprovementStudents] = useState<any[]>([]);
//     const [showAllBest, setShowAllBest] = useState(false);
//     const [showAllNeeds, setShowAllNeeds] = useState(false);
//     const [alertHistory, setAlertHistory] = useState<any[]>([]);
//     const [dailyPatterns, setDailyPatterns] = useState<any[]>([]);
//     const [classPerformance, setClassPerformance] = useState<any[]>([]);
//     const [peakLateTimes, setPeakLateTimes] = useState<any[]>([]);
//     const [patterns, setPatterns] = useState<any>({
//         highestAbsenceDay: '---',
//         highestAbsenceRate: '---',
//         bestAttendanceDay: '---',
//         bestAttendanceRate: '---',
//         peakLateTime: '---'
//     });

//     // History states
//     const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
//     const [studentHistory, setStudentHistory] = useState<any[]>([]);

//     const [showHistoryModal, setShowHistoryModal] = useState(false);




//     useEffect(() => {
//         loadTerms();  // changed from fetchTerms()
//     }, []);

//     useEffect(() => {
//         loadCurrentTerm();  // changed from fetchCurrentTerm()
//     }, []);

//     const loadCurrentTerm = async () => {
//         try {
//             const term = await fetchCurrentTerm();  // calls imported service
//             if (term) {
//                 setCurrentTerm(term);
//             }
//         } catch (error) {
//             console.error('Failed to fetch current term:', error);
//         }
//     };

//     // Load functions (keep all your existing load functions here)
//     const loadAttendanceData = async () => {
//         if (!selectedClass || selectedClass === 'all') return;
//         setLoading(true);
//         try {
//             const records = await fetchAttendanceByClassAndDate(selectedClass, selectedDate);
//             const transformedData: StudentAttendance[] = students
//                 .filter(s => s.class?.id === selectedClass)
//                 .map(student => {
//                     const record = records.find(r => r.studentId === student.id);
//                     return {
//                         id: student.id,
//                         name: student.name,
//                         examNumber: student.examNumber,
//                         class: student.class?.name || '',
//                         classId: student.class?.id || '',
//                         status: record?.status || 'unmarked',  // ← CHANGE THIS
//                         checkInTime: record?.checkInTime,
//                         parentContact: student.parentPhone,
//                         parentEmail: student.parentEmail
//                     };
//                 });
//             setAttendanceData(transformedData);
//         } catch (error) {
//             showMessage('Failed to load attendance data', true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadTerms = async () => {
//         try {
//             const terms = await fetchTerms();  // calls imported service
//             setAvailableTerms(terms);
//             if (terms.length > 0) {
//                 setSelectedTerm(terms[0].id);
//             }
//         } catch (error) {
//             console.error('Failed to fetch terms:', error);
//         }
//     };


//     const loadAllClassesAttendance = async () => {
//         setLoading(true);
//         try {
//             const allData: StudentAttendance[] = [];
//             for (const cls of classes) {
//                 const records = await fetchAttendanceByClassAndDate(cls.id, selectedDate);
//                 const classStudents = students.filter(s => s.class?.id === cls.id);
//                 classStudents.forEach(student => {
//                     const record = records.find(r => r.studentId === student.id);
//                     allData.push({
//                         id: student.id,
//                         name: student.name,
//                         examNumber: student.examNumber,
//                         class: cls.name,
//                         classId: cls.id,
//                         status: record?.status || 'unmarked',  // ← CHANGE 'present' to 'unmarked'
//                         checkInTime: record?.checkInTime,
//                         parentContact: student.parentPhone,
//                         parentEmail: student.parentEmail
//                     });
//                 });
//             }
//             setAttendanceData(allData);
//         } catch (error) {
//             showMessage('Failed to load attendance data', true);
//         } finally {
//             setLoading(false);
//         }
//     };


//     const loadClassSummaries = async () => {
//         try {
//             const summaries = await fetchClassSummaries(classes[0]?.id || '');
//             setClassSummaries(summaries);
//         } catch (error) {
//             console.error('Failed to load class summaries:', error);
//         }
//     };

//     const loadAlertHistory = async () => {
//         try {
//             const history = await fetchAlertHistory(selectedClass !== 'all' ? selectedClass : undefined, 10);
//             setAlertHistory(history);
//         } catch (error) {
//             console.error('Failed to load alert history:', error);
//         }
//     };

//     const loadAttendancePatterns = async () => {
//         if (!selectedClass || selectedClass === 'all') return;
//         setLoadingPatterns(true);
//         try {
//             const endDate = new Date().toISOString().split('T')[0];
//             const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
//             const patternsData = await fetchAttendancePatterns(selectedClass, startDate, endDate);
//             setDailyPatterns(patternsData.dailyPatterns);
//             setClassPerformance(patternsData.classPerformance);
//             setPeakLateTimes(patternsData.peakLateTimes);
//             if (patternsData.dailyPatterns.length > 0) {
//                 const dayStats = patternsData.dailyPatterns.reduce((acc: any, day: any) => {
//                     const dayName = day.day;
//                     if (!acc[dayName]) {
//                         acc[dayName] = { absent: 0, total: 0, count: 0 };
//                     }
//                     acc[dayName].absent += day.absent;
//                     acc[dayName].total += day.total;
//                     acc[dayName].count++;
//                     return acc;
//                 }, {});
//                 let highestAbsenceDay = '';
//                 let highestAbsenceRate = 0;
//                 let bestAttendanceDay = '';
//                 let bestAttendanceRate = 0;
//                 Object.entries(dayStats).forEach(([day, stats]: [string, any]) => {
//                     const absenceRate = (stats.absent / stats.total) * 100;
//                     const attendanceRate = ((stats.total - stats.absent) / stats.total) * 100;
//                     if (absenceRate > highestAbsenceRate) {
//                         highestAbsenceRate = absenceRate;
//                         highestAbsenceDay = day;
//                     }
//                     if (attendanceRate > bestAttendanceRate) {
//                         bestAttendanceRate = attendanceRate;
//                         bestAttendanceDay = day;
//                     }
//                 });
//                 setPatterns({
//                     highestAbsenceDay,
//                     highestAbsenceRate: highestAbsenceRate.toFixed(1),
//                     bestAttendanceDay,
//                     bestAttendanceRate: bestAttendanceRate.toFixed(1),
//                     peakLateTime: patternsData.peakLateTimes[0]?.time || '8:45 AM'
//                 });
//             }
//         } catch (error) {
//             showMessage('Failed to load attendance patterns', true);
//         } finally {
//             setLoadingPatterns(false);
//         }
//     };


//     const loadStudentHistory = async (student: StudentAttendance) => {
//         if (!selectedTerm) {
//             showMessage('Please select a term first', true);
//             return;
//         }

//         setLoadingHistory(true);
//         setSelectedStudent(student);
//         try {
//             const selectedTermObj = availableTerms.find(t => t.id === selectedTerm);
//             if (!selectedTermObj) return;

//             const history = await fetchStudentAttendanceHistoryByDateRange(
//                 student.id,
//                 selectedTermObj.startDate,
//                 selectedTermObj.endDate
//             );
//             setStudentHistory(history);
//         } catch (error) {
//             showMessage('Failed to load student history', true);
//         } finally {
//             setLoadingHistory(false);
//         }
//     };


//     const loadOverviewData = async () => {
//         setLoading(true);
//         try {
//             const today = new Date();
//             const startOfWeek = new Date(today);
//             startOfWeek.setDate(today.getDate() - today.getDay());
//             const endOfWeek = new Date(today);
//             endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
//             const startDate = startOfWeek.toISOString().split('T')[0];
//             const endDate = endOfWeek.toISOString().split('T')[0];
//             const [summaries, best, needsImprovement] = await Promise.all([
//                 fetchClassSummaries(classes[0]?.id || ''),
//                 selectedClass !== 'all' ? fetchStudentPerformance(selectedClass, 'best') : Promise.resolve([]),
//                 selectedClass !== 'all' ? fetchStudentPerformance(selectedClass, 'needs-improvement') : Promise.resolve([])
//             ]);
//             setClassSummaries(summaries);
//             setBestStudents(best);
//             setNeedsImprovementStudents(needsImprovement);
//             if (selectedClass !== 'all') {
//                 const weekly = await fetchWeeklyStats(selectedClass, startDate, endDate);
//                 setWeeklyStats(weekly);
//             }
//         } catch (error) {
//             showMessage('Failed to load overview data', true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handlers
//     const handleStatusChange = async (studentId: string, newStatus: StudentAttendance['status']) => {
//         setAttendanceData(prev =>
//             prev.map(s =>
//                 s.id === studentId
//                     ? {
//                         ...s,
//                         status: newStatus,
//                         checkInTime: newStatus === 'present' || newStatus === 'late'
//                             ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                             : undefined
//                     }
//                     : s
//             )
//         );
//         try {
//             const student = students.find(s => s.id === studentId);
//             // await saveSingleAttendance({
//             //     studentId,
//             //     classId: student?.class?.id || '',
//             //     date: selectedDate,
//             //     status: newStatus,
//             //     checkInTime: newStatus === 'present' || newStatus === 'late'
//             //         ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//             //         : undefined
//             // });
//             // Only save if status is not 'unmarked'
//             if (newStatus !== 'unmarked') {
//                 await saveSingleAttendance({
//                     studentId,
//                     classId: student?.class?.id || '',
//                     date: selectedDate,
//                     status: newStatus as 'present' | 'absent' | 'late' | 'excused',
//                     checkInTime: newStatus === 'present' || newStatus === 'late'
//                         ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                         : undefined
//                 });
//             }
//             showMessage('Status updated successfully');
//         } catch (error) {
//             loadAttendanceData();
//             showMessage('Failed to update status', true);
//         }
//     };

//     const handleMarkAllPresent = async () => {
//         if (selectedClass === 'all') {
//             showMessage('Please select a specific class', true);
//             return;
//         }
//         setMarkingAll(true);
//         try {
//             const studentIds = filteredStudents.map(s => s.id);
//             await markAllPresent(selectedClass, selectedDate, studentIds);
//             setAttendanceData(prev =>
//                 prev.map(s => ({
//                     ...s,
//                     status: 'present',
//                     checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                 }))
//             );
//             showMessage('All students marked as present');
//         } catch (error) {
//             showMessage('Failed to mark all present', true);
//         } finally {
//             setMarkingAll(false);
//         }
//     };


//     const handleSaveAttendance = async () => {
//         if (selectedClass === 'all') {
//             showMessage('Please select a specific class', true);
//             return;
//         }
//         setSaving(true);
//         try {
//             // Filter out students with 'unmarked' status - only save actual attendance records
//             const records = attendanceData
//                 .filter(s => s.status !== 'unmarked')  // ← Don't save unmarked status
//                 .map(s => ({
//                     studentId: s.id,
//                     classId: selectedClass,
//                     date: selectedDate,
//                     status: s.status as 'present' | 'absent' | 'late' | 'excused', // Type assertion
//                     checkInTime: s.checkInTime
//                 }));

//             await saveAttendance(records);
//             showMessage('Attendance saved successfully');
//             await loadAttendanceData();
//         } catch (error) {
//             showMessage('Failed to save attendance', true);
//         } finally {
//             setSaving(false);
//         }
//     };

//     const handleSendAlert = async (type: 'sms' | 'email', studentIds: string[]) => {
//         if (studentIds.length === 0) {
//             showMessage('No students to alert', true);
//             return;
//         }
//         setLoading(true);
//         try {
//             const result = await sendAttendanceAlerts(
//                 selectedClass !== 'all' ? selectedClass : '',
//                 selectedDate,
//                 type,
//                 studentIds
//             );
//             showMessage(result.message);
//             loadAlertHistory();
//         } catch (error) {
//             showMessage(`Failed to send ${type} alerts`, true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getStatusColor = (status: string) => {
//         switch (status) {
//             case 'present': return 'bg-green-100 text-green-700 border-green-200';
//             case 'absent': return 'bg-red-100 text-red-700 border-red-200';
//             case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
//             case 'excused': return 'bg-blue-100 text-blue-700 border-blue-200';
//             case 'unmarked': return 'bg-orange-100 text-orange-700 border-orange-300 font-semibold';
//             default: return 'bg-slate-100 text-slate-700 border-slate-200';
//         }
//     };

//     const getStatusIcon = (status: string) => {
//         switch (status) {
//             case 'present': return <UserCheck className="w-4 h-4" />;
//             case 'absent': return <UserX className="w-4 h-4" />;
//             case 'late': return <Clock3 className="w-4 h-4" />;
//             case 'excused': return <CheckCircle className="w-4 h-4" />;
//             case 'unmarked': return <AlertCircle className="w-4 h-4" />;
//             default: return <Clock className="w-4 h-4" />;
//         }
//     };

//     // Effects
//     useEffect(() => {
//         loadClassSummaries();
//         loadAlertHistory();
//     }, []);

//     useEffect(() => {
//         if (selectedClass !== 'all') {
//             loadAttendanceData();
//         } else {
//             loadAllClassesAttendance();
//         }
//     }, [selectedClass, selectedDate]);

//     useEffect(() => {
//         if (viewMode === 'analytics' && selectedClass !== 'all') {
//             loadAttendancePatterns();
//         }
//     }, [viewMode, selectedClass]);

//     useEffect(() => {
//         if (viewMode === 'overview') {
//             loadOverviewData();
//         }
//     }, [viewMode, selectedClass]);

//     const filteredStudents = attendanceData.filter(s =>
//         (selectedClass === 'all' || s.classId === selectedClass) &&
//         (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     const stats = {
//         total: filteredStudents.length,
//         present: filteredStudents.filter(s => s.status === 'present').length,
//         absent: filteredStudents.filter(s => s.status === 'absent').length,
//         late: filteredStudents.filter(s => s.status === 'late').length,
//         excused: filteredStudents.filter(s => s.status === 'excused').length,
//         rate: filteredStudents.length > 0
//             ? ((filteredStudents.filter(s => s.status === 'present' || s.status === 'late').length / filteredStudents.length) * 100).toFixed(1)
//             : '0'
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             {/* Header */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                     <div>
//                         <h2 className="text-2xl font-bold text-slate-800">Attendance Management</h2>
//                         <p className="text-slate-500">Track and manage student attendance across all classes</p>
//                     </div>
//                     <div className="flex items-center gap-4">
//                         <button
//                             onClick={() => handleSendAlert('sms', filteredStudents.filter(s => s.status === 'absent' || s.status === 'late').map(s => s.id))}
//                             disabled={loading || filteredStudents.length === 0}
//                             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
//                         >
//                             <Bell className="w-4 h-4" />
//                             Alert Parents
//                         </button>
//                     </div>
//                 </div>

//                 {/* Term and Academic Year - BIG AND CLEAR */}
//                 <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-4">
//                     <Calendar className="w-8 h-8 text-indigo-600" />
//                     <div>
//                         <p className="text-xs text-indigo-600 font-medium">CURRENT ACADEMIC PERIOD</p>
//                         <p className="text-2xl font-bold text-indigo-800">
//                             {currentTerm?.name || 'Loading term...'}
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             {/* View Mode Tabs */}
//             <div className="flex gap-2 border-b border-slate-200">
//                 <button
//                     onClick={() => setViewMode('daily')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'daily'
//                         ? 'border-indigo-600 text-indigo-600'
//                         : 'border-transparent text-slate-500 hover:text-slate-700'
//                         }`}
//                 >
//                     <Calendar className="w-4 h-4 inline mr-2" />
//                     Daily Tracking
//                 </button>
//                 <button
//                     onClick={() => setViewMode('overview')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'overview'
//                         ? 'border-indigo-600 text-indigo-600'
//                         : 'border-transparent text-slate-500 hover:text-slate-700'
//                         }`}
//                 >
//                     <TrendingUp className="w-4 h-4 inline mr-2" />
//                     Overview
//                 </button>
//                 <button
//                     onClick={() => setViewMode('analytics')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'analytics'
//                         ? 'border-indigo-600 text-indigo-600'
//                         : 'border-transparent text-slate-500 hover:text-slate-700'
//                         }`}
//                 >
//                     <BarChart3 className="w-4 h-4 inline mr-2" />
//                     Attendance Analytics
//                 </button>
//                 <button
//                     onClick={() => setViewMode('history')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'history'
//                         ? 'border-indigo-600 text-indigo-600'
//                         : 'border-transparent text-slate-500 hover:text-slate-700'
//                         }`}
//                 >
//                     <Clock className="w-4 h-4 inline mr-2" />
//                     Attendance History
//                 </button>
//                 <button
//                     onClick={() => setViewMode('alerts')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'alerts'
//                         ? 'border-indigo-600 text-indigo-600'
//                         : 'border-transparent text-slate-500 hover:text-slate-700'
//                         }`}
//                 >
//                     <Bell className="w-4 h-4 inline mr-2" />
//                     Alerts
//                 </button>
//             </div>

//             {/* Tab Content */}
//             {viewMode === 'daily' && (
//                 <DailyTrackingTab
//                     selectedDate={selectedDate}
//                     setSelectedDate={setSelectedDate}
//                     selectedClass={selectedClass}
//                     setSelectedClass={setSelectedClass}
//                     classes={classes}
//                     searchTerm={searchTerm}
//                     setSearchTerm={setSearchTerm}
//                     attendanceData={attendanceData}
//                     loading={loading}
//                     saving={saving}
//                     markingAll={markingAll}
//                     stats={stats}
//                     handleStatusChange={handleStatusChange}
//                     handleSaveAttendance={handleSaveAttendance}
//                     handleMarkAllPresent={handleMarkAllPresent}
//                     getStatusColor={getStatusColor}
//                     getStatusIcon={getStatusIcon}
//                 />
//             )}

//             {viewMode === 'overview' && (
//                 <OverviewTab
//                     monthlyStats={monthlyStats}      // ← ADD THIS
//                     termStats={termStats}
//                     loading={loading}
//                     weeklyStats={weeklyStats}
//                     classSummaries={classSummaries}





//                     selectedClass={selectedClass}
//                 />
//             )}

//             {/* {viewMode === 'patterns' && (
//                 <PatternsTab
//                     loadingPatterns={loadingPatterns}
//                     patterns={patterns}
//                     dailyPatterns={dailyPatterns}
//                     classPerformance={classPerformance}
//                     peakLateTimes={peakLateTimes}
//                 />
//             )} */}

//             {viewMode === 'analytics' && (
//                 <AttendanceAnalytics
//                     classId={selectedClass}
//                     className={classes.find(c => c.id === selectedClass)?.name || ''}
//                     students={students}
//                     showMessage={showMessage}
//                     allClasses={classes}
//                 />
//             )}

//             {viewMode === 'history' && (
//                 <HistoryTab

//                     selectedClass={selectedClass}
//                     setSelectedClass={setSelectedClass}
//                     classes={classes}
//                     searchTerm={searchTerm}
//                     setSearchTerm={setSearchTerm}
//                     attendanceData={attendanceData}
//                     loadingHistory={loadingHistory}
//                     onViewHistory={(student) => {
//                         setSelectedStudent(student);
//                         setShowHistoryModal(true);
//                         loadStudentHistory(student);
//                     }}
//                 />
//             )}

//             {viewMode === 'alerts' && (
//                 <AlertsTab
//                     loading={loading}
//                     alertHistory={alertHistory}
//                     filteredStudents={filteredStudents}
//                     onSendAlert={handleSendAlert}
//                 />
//             )}

//             {/* Modals */}
//             {showHistoryModal && (
//                 <StudentHistoryModal
//                     selectedStudent={selectedStudent}
//                     studentHistory={studentHistory}
//                     loadingHistory={loadingHistory}
//                     selectedTerm={selectedTerm}
//                     availableTerms={availableTerms}
//                     onClose={() => {
//                         setShowHistoryModal(false);
//                         setSelectedStudent(null);
//                     }}
//                     onTermChange={(termId) => {
//                         setSelectedTerm(termId);
//                         if (selectedStudent) {
//                             loadStudentHistory(selectedStudent);
//                         }
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default AttendanceManagement;

