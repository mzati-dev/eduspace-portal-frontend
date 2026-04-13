import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Calendar,
    Search,
    UserCheck,
    UserX,
    Clock3,
    CheckCircle,
    AlertCircle,
    Users,
    TrendingUp,
    Gift,
    CloudRain,
    Plus,
    Lock,
    Info,
    Save
} from 'lucide-react';
import { StudentAttendance, AttendanceStats } from './TeacherAttendance';
import { addSchoolHoliday, API_BASE_URL, fetchAttendanceByClassAndDate, fetchClassTerm, fetchPublicHolidays, fetchRecordedDaysCount, fetchSchoolHolidaysByClass, removeSchoolHoliday } from '@/services/attendanceService';

interface Props {
    classes: any[];
    selectedClass: string;
    setSelectedClass: (value: string) => void;
    selectedDate: string;
    setSelectedDate: (value: string) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    loading: boolean;
    saving: boolean;
    markingAll: boolean;
    stats: AttendanceStats;
    filteredStudents: StudentAttendance[];
    onStatusChange: (studentId: string, status: StudentAttendance['status']) => void;
    onSaveAttendance: () => void;
    onMarkAllPresent: () => void;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => JSX.Element;
}

const DailyTrackingTab: React.FC<Props> = ({
    classes,
    selectedClass,
    setSelectedClass,
    selectedDate,
    setSelectedDate,
    searchTerm,
    setSearchTerm,
    loading,
    saving,
    markingAll,
    stats,
    filteredStudents,
    onStatusChange,
    onSaveAttendance,
    onMarkAllPresent,
    getStatusColor,
    getStatusIcon
}) => {
    const [termInfo, setTermInfo] = useState({
        name: 'Loading term...',
        startDate: '',
        endDate: ''
    });

    const [publicHolidays, setPublicHolidays] = useState<Set<string>>(new Set());
    const [schoolHolidays, setSchoolHolidays] = useState<Set<string>>(new Set());
    const [markingHoliday, setMarkingHoliday] = useState(false);
    const [loadingHolidays, setLoadingHolidays] = useState(false);
    const [hasAttendanceRecorded, setHasAttendanceRecorded] = useState<boolean>(false);
    const [recordedDays, setRecordedDays] = useState(0);

    // Auto-save feedback states
    const [autoSaveStatus, setAutoSaveStatus] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false });
    const [pendingSave, setPendingSave] = useState(false);
    const saveTimeoutRef = useRef<number | null>(null);

    const allHolidays = new Set([...publicHolidays, ...schoolHolidays]);

    // Fetch term info from backend
    const fetchTermInfo = async () => {
        if (!selectedClass) return;
        try {
            const term = await fetchClassTerm(selectedClass);
            if (term) {
                setTermInfo({
                    name: term.name,
                    startDate: term.startDate,
                    endDate: term.endDate
                });
            }
        } catch (error) {
            console.error('Failed to fetch term info:', error);
            setTermInfo({ name: 'Setting up term...', startDate: '', endDate: '' });
        }
    };

    // Fetch public holidays from backend
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

    // Fetch school holidays from backend
    const fetchSchoolHolidaysList = async () => {
        if (!selectedClass) return;
        try {
            const holidays = await fetchSchoolHolidaysByClass(selectedClass);
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

    // Add school holiday
    const addSchoolHolidayHandler = async (date: string) => {
        try {
            await addSchoolHoliday(date, selectedClass, 'School Holiday');
            setSchoolHolidays(prev => new Set([...prev, date]));
            return true;
        } catch (error) {
            console.error('Failed to add school holiday:', error);
            return false;
        }
    };

    // Remove school holiday
    const removeSchoolHolidayHandler = async (date: string) => {
        try {
            await removeSchoolHoliday(date, selectedClass);
            setSchoolHolidays(prev => {
                const newSet = new Set(prev);
                newSet.delete(date);
                return newSet;
            });
            return true;
        } catch (error) {
            console.error('Failed to remove school holiday:', error);
            return false;
        }
    };

    // Check attendance recorded status
    const checkAttendanceRecordedStatus = async () => {
        if (!selectedClass) return;
        try {
            const records = await fetchAttendanceByClassAndDate(selectedClass, selectedDate);
            setHasAttendanceRecorded(records.length > 0);
        } catch (error) {
            console.error('Failed to check attendance status:', error);
            setHasAttendanceRecorded(false);
        }
    };

    // Fetch recorded days count
    const fetchRecordedDaysCountHandler = async () => {
        if (!selectedClass) return;
        try {
            const count = await fetchRecordedDaysCount(selectedClass);
            setRecordedDays(count);
        } catch (error) {
            console.error('Failed to fetch recorded days:', error);
            setRecordedDays(0);
        }
    };

    // Helper functions
    const getMonthName = (date: string): string => {
        const d = new Date(date);
        return d.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    const getWeekNumber = (date: string): number => {
        const d = new Date(date);
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const days = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + startOfYear.getDay() + 1) / 7);
    };

    const getDayOfWeek = (date: string): string => {
        const d = new Date(date);
        return d.toLocaleString('default', { weekday: 'long' });
    };

    const isWithinTerm = (date: string): boolean => {
        if (!termInfo.startDate || !termInfo.endDate) return true;
        const checkDate = new Date(date);
        const start = new Date(termInfo.startDate);
        const end = new Date(termInfo.endDate);
        return checkDate >= start && checkDate <= end;
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

    const isDateInTerm = isWithinTerm(selectedDate);
    const isPublicHoliday = publicHolidays.has(selectedDate);
    const isSchoolHoliday = schoolHolidays.has(selectedDate);
    const isHoliday = isPublicHoliday || isSchoolHoliday;
    const dayOfWeekNum = new Date(selectedDate).getDay();
    const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;
    const isFrozen = !selectedClass || !isDateInTerm || isHoliday || isWeekend;

    // Auto-save function with debounce (moved here after isFrozen)
    const triggerAutoSave = useCallback(() => {
        if (!selectedClass || isFrozen) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        setPendingSave(true);

        saveTimeoutRef.current = window.setTimeout(async () => {
            try {
                await onSaveAttendance();
                setAutoSaveStatus({ show: true, message: '✓ Auto-saved', success: true });
                setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, show: false })), 2000);
            } catch (error) {
                setAutoSaveStatus({ show: true, message: '⚠️ Auto-save failed', success: false });
                setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, show: false })), 3000);
            } finally {
                setPendingSave(false);
            }
        }, 800);
    }, [onSaveAttendance, selectedClass, isFrozen]);

    // Modified status change handler with auto-save
    const handleStatusChangeWithAutoSave = (studentId: string, newStatus: StudentAttendance['status']) => {
        onStatusChange(studentId, newStatus);
        triggerAutoSave();
    };

    const getFrozenReason = (): string => {
        if (!selectedClass) return 'Select a class first';
        if (!isDateInTerm) return `School Closed - ${termInfo.name} runs from ${termInfo.startDate} to ${termInfo.endDate}`;
        if (isPublicHoliday) return 'Public Holiday';
        if (isSchoolHoliday) return 'School Holiday';
        if (isWeekend) return 'Weekend - No school';
        return '';
    };

    const getAttendanceStatusDisplay = () => {
        if (!selectedClass) return 'No class selected';
        if (isFrozen) return '❄️ Frozen - Cannot mark attendance';
        if (pendingSave) return '💾 Saving...';
        if (hasAttendanceRecorded) return '✅ Attendance saved';
        return '✓ Auto-saves when you select status';
    };

    const attendanceStatusColor = () => {
        if (!selectedClass) return 'text-gray-500';
        if (isFrozen) return 'text-gray-500';
        if (pendingSave) return 'text-blue-600';
        if (hasAttendanceRecorded) return 'text-green-600';
        return 'text-indigo-600';
    };

    const handleMarkAsHoliday = async () => {
        if (!selectedClass) {
            alert('Please select a class first');
            return;
        }

        if (!isDateInTerm) {
            alert(`Cannot mark holiday outside term. ${termInfo.name} is ${termInfo.startDate} to ${termInfo.endDate}`);
            return;
        }

        if (isWeekend) {
            alert('Weekends are already non-school days. No need to mark as holiday.');
            return;
        }

        if (isPublicHoliday) {
            alert(`${selectedDate} is already a public holiday.`);
            return;
        }

        if (isSchoolHoliday) {
            alert(`${selectedDate} is already marked as a school holiday`);
            return;
        }

        setMarkingHoliday(true);
        const success = await addSchoolHolidayHandler(selectedDate);
        if (success) {
            alert(`${selectedDate} has been marked as a school holiday`);
        } else {
            alert('Unable to mark as holiday. Please try again.');
        }
        setMarkingHoliday(false);
    };

    const handleRemoveHoliday = async () => {
        if (!isSchoolHoliday) {
            alert('Only manually added school holidays can be removed');
            return;
        }

        if (confirm(`Remove holiday status from ${selectedDate}?`)) {
            const success = await removeSchoolHolidayHandler(selectedDate);
            if (success) {
                alert(`${selectedDate} is no longer a holiday`);
            } else {
                alert('Unable to remove holiday. Please try again.');
            }
        }
    };

    // Load data when class changes
    useEffect(() => {
        if (selectedClass) {
            fetchTermInfo();
            fetchSchoolHolidaysList();  // ✅ Correct name
            fetchRecordedDaysCountHandler(); // ✅ Correct name
        }
    }, [selectedClass]);

    // Load public holidays once
    useEffect(() => {
        fetchPublicHolidaysList();
    }, []);

    // Check attendance when class or date changes
    useEffect(() => {
        if (selectedClass && selectedDate) {
            checkAttendanceRecordedStatus();
        }
    }, [selectedClass, selectedDate]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const frozenReason = getFrozenReason();

    return (
        <>
            {/* Auto-save notification */}
            {autoSaveStatus.show && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${autoSaveStatus.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {autoSaveStatus.message}
                </div>
            )}

            {/* Date Info Card */}
            {selectedClass && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-500">Date Information</h4>
                                <div className="flex flex-wrap gap-3 mt-1">
                                    <span className="text-sm font-semibold text-slate-800">
                                        {getMonthName(selectedDate)}
                                    </span>
                                    <span className="text-sm text-slate-400">•</span>
                                    <span className="text-sm font-semibold text-slate-800">
                                        Week {getWeekNumber(selectedDate)}
                                    </span>
                                    <span className="text-sm text-slate-400">•</span>
                                    <span className="text-sm font-semibold text-slate-800">
                                        {getDayOfWeek(selectedDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 ${attendanceStatusColor()}`}>
                            <Info className="w-4 h-4" />
                            <span className="text-sm font-medium">{getAttendanceStatusDisplay()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Term Stats Card */}
            {selectedClass && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-indigo-900">{termInfo.name}</h3>
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
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-indigo-800">{totalDays}</p>
                            <p className="text-xs text-indigo-600">Total School Days</p>
                        </div>
                        <div className="text-center border-l border-r border-indigo-200">
                            <p className="text-2xl font-bold text-emerald-700">{recordedDays}</p>
                            <p className="text-xs text-indigo-600">Recorded</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-700">{remainingDays}</p>
                            <p className="text-xs text-indigo-600">Remaining</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={termInfo.startDate || undefined}
                            max={termInfo.endDate || undefined}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        {selectedClass && (
                            <p className="text-xs text-slate-400 mt-1">
                                Term: {termInfo.startDate || 'Loading'} to {termInfo.endDate || 'Loading'}
                            </p>
                        )}
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
                    {/* Frozen Message */}
                    {isFrozen && (
                        <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${frozenReason.includes('Closed') ? 'bg-red-50 border border-red-200 text-red-700' :
                            frozenReason.includes('Public') ? 'bg-green-50 border border-green-200 text-green-700' :
                                frozenReason.includes('School') ? 'bg-purple-50 border border-purple-200 text-purple-700' :
                                    'bg-gray-50 border border-gray-200 text-gray-500'
                            }`}>
                            <Lock className="w-4 h-4 flex-shrink-0" />
                            <span>
                                <strong>Frozen</strong> - {frozenReason}
                                {frozenReason.includes('School Holiday') && ' You can remove this holiday using the button below.'}
                                {frozenReason.includes('Closed') && ' Attendance cannot be marked when school is closed.'}
                            </span>
                        </div>
                    )}

                    {/* Holiday Actions */}
                    {isDateInTerm && !isWeekend && (
                        <div className="flex gap-2">
                            {!isHoliday ? (
                                <button
                                    onClick={handleMarkAsHoliday}
                                    disabled={markingHoliday}
                                    className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    {markingHoliday ? 'Marking...' : 'Mark as School Holiday'}
                                </button>
                            ) : isSchoolHoliday ? (
                                <button
                                    onClick={handleRemoveHoliday}
                                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                                >
                                    <Gift className="w-4 h-4" />
                                    Remove Holiday
                                </button>
                            ) : isPublicHoliday && (
                                <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-2">
                                    <CloudRain className="w-4 h-4" />
                                    Public Holiday
                                </div>
                            )}
                        </div>
                    )}

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

                    {/* Auto-save info message */}
                    {!isFrozen && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-2 text-indigo-700 text-sm">
                            <Save className="w-4 h-4 flex-shrink-0" />
                            <span>✨ Auto-save enabled — Changes are saved automatically when you select a status</span>
                        </div>
                    )}

                    {/* Quick Actions - Save button removed, only Mark All Present */}
                    <div className="flex justify-end">
                        <button
                            onClick={onMarkAllPresent}
                            disabled={markingAll || isFrozen}
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
                                                        {student.status === 'unmarked' ? '📝 unmarked' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={student.status}
                                                        onChange={(e) => handleStatusChangeWithAutoSave(student.id, e.target.value as any)}
                                                        className={`px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${isFrozen
                                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                                                            : student.status === 'unmarked'
                                                                ? 'bg-indigo-50 text-indigo-700 font-medium border-indigo-200'
                                                                : 'bg-white border-slate-300 hover:border-indigo-300'
                                                            }`}
                                                        disabled={saving || isFrozen}
                                                    >
                                                        <option value="unmarked" className="option-unmarked">✏️ Mark Attendance</option>
                                                        <option value="present" className="option-present">✅ Present</option>
                                                        <option value="absent" className="option-absent">❌ Absent</option>
                                                        <option value="late" className="option-late">⏰ Late</option>
                                                        <option value="excused" className="option-excused">📋 Excused</option>
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
    );
};

export default DailyTrackingTab;

// import React, { useState, useEffect } from 'react';
// import {
//     Calendar,
//     Search,
//     UserCheck,
//     UserX,
//     Clock3,
//     CheckCircle,
//     AlertCircle,
//     Users,
//     TrendingUp,
//     Gift,
//     CloudRain,
//     Plus,
//     Lock,
//     Info
// } from 'lucide-react';
// import { StudentAttendance, AttendanceStats } from './TeacherAttendance';
// import { API_BASE_URL } from '@/services/attendanceService';

// interface Props {
//     classes: any[];
//     selectedClass: string;
//     setSelectedClass: (value: string) => void;
//     selectedDate: string;
//     setSelectedDate: (value: string) => void;
//     searchTerm: string;
//     setSearchTerm: (value: string) => void;
//     loading: boolean;
//     saving: boolean;
//     markingAll: boolean;
//     stats: AttendanceStats;
//     filteredStudents: StudentAttendance[];
//     onStatusChange: (studentId: string, status: StudentAttendance['status']) => void;
//     onSaveAttendance: () => void;
//     onMarkAllPresent: () => void;
//     getStatusColor: (status: string) => string;
//     getStatusIcon: (status: string) => JSX.Element;
// }

// const DailyTrackingTab: React.FC<Props> = ({
//     classes,
//     selectedClass,
//     setSelectedClass,
//     selectedDate,
//     setSelectedDate,
//     searchTerm,
//     setSearchTerm,
//     loading,
//     saving,
//     markingAll,
//     stats,
//     filteredStudents,
//     onStatusChange,
//     onSaveAttendance,
//     onMarkAllPresent,
//     getStatusColor,
//     getStatusIcon
// }) => {
//     const [termInfo, setTermInfo] = useState({
//         name: 'Loading term...',
//         startDate: '',
//         endDate: ''
//     });

//     const [publicHolidays, setPublicHolidays] = useState<Set<string>>(new Set());
//     const [schoolHolidays, setSchoolHolidays] = useState<Set<string>>(new Set());
//     const [markingHoliday, setMarkingHoliday] = useState(false);
//     const [loadingHolidays, setLoadingHolidays] = useState(false);
//     const [hasAttendanceRecorded, setHasAttendanceRecorded] = useState<boolean>(false);
//     const [recordedDays, setRecordedDays] = useState(0);

//     const allHolidays = new Set([...publicHolidays, ...schoolHolidays]);

//     // Fetch term info from backend
//     const fetchTermInfo = async () => {
//         if (!selectedClass) return;

//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/attendance/class/${selectedClass}/term`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             const data = await response.json();
//             if (!data.success || !data.data) {
//                 throw new Error('Failed to fetch term info');
//             }
//             setTermInfo({
//                 name: data.data.name,
//                 startDate: data.data.startDate,
//                 endDate: data.data.endDate
//             });
//         } catch (error) {
//             console.error('Failed to fetch term info:', error);
//             setTermInfo({ name: 'Setting up term...', startDate: '', endDate: '' });
//         }
//     };

//     // Fetch public holidays from backend
//     const fetchPublicHolidays = async () => {
//         setLoadingHolidays(true);
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/attendance/holidays/public`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             const data = await response.json();
//             if (!data.success || !Array.isArray(data.data)) {
//                 throw new Error('Failed to fetch public holidays');
//             }
//             const holidaySet = new Set<string>();
//             data.data.forEach((holiday: { date: string }) => {
//                 holidaySet.add(holiday.date);
//             });
//             setPublicHolidays(holidaySet);
//         } catch (error) {
//             console.error('Failed to fetch public holidays:', error);
//             setPublicHolidays(new Set());
//         } finally {
//             setLoadingHolidays(false);
//         }
//     };

//     // Fetch school holidays from backend
//     const fetchSchoolHolidays = async () => {
//         if (!selectedClass) return;

//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/attendance/holidays/school/class/${selectedClass}`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             const data = await response.json();
//             if (!data.success || !Array.isArray(data.data)) {
//                 throw new Error('Failed to fetch school holidays');
//             }
//             const holidaySet = new Set<string>();
//             data.data.forEach((holiday: { date: string }) => {
//                 holidaySet.add(holiday.date);
//             });
//             setSchoolHolidays(holidaySet);
//         } catch (error) {
//             console.error('Failed to fetch school holidays:', error);
//             setSchoolHolidays(new Set());
//         }
//     };

//     // Add school holiday
//     const addSchoolHoliday = async (date: string) => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/attendance/holidays/school`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({ date, classId: selectedClass, reason: 'School Holiday' })
//             });
//             const data = await response.json();
//             if (!data.success) {
//                 throw new Error('Failed to add holiday');
//             }
//             setSchoolHolidays(prev => new Set([...prev, date]));
//             return true;
//         } catch (error) {
//             console.error('Failed to add school holiday:', error);
//             return false;
//         }
//     };

//     // Remove school holiday
//     const removeSchoolHoliday = async (date: string) => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/attendance/holidays/school/${date}?classId=${selectedClass}`, {
//                 method: 'DELETE',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             const data = await response.json();
//             if (!data.success) {
//                 throw new Error('Failed to remove holiday');
//             }
//             setSchoolHolidays(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(date);
//                 return newSet;
//             });
//             return true;
//         } catch (error) {
//             console.error('Failed to remove school holiday:', error);
//             return false;
//         }
//     };

//     // Check attendance recorded status
//     const checkAttendanceRecorded = async () => {
//         if (!selectedClass) return;

//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(
//                 `${API_BASE_URL}/attendance/class/${selectedClass}?date=${selectedDate}`,
//                 { headers: { 'Authorization': `Bearer ${token}` } }
//             );
//             const data = await response.json();

//             if (!data.success) {
//                 throw new Error('Failed to check attendance');
//             }

//             setHasAttendanceRecorded(Array.isArray(data.data) && data.data.length > 0);
//         } catch (error) {
//             console.error('Failed to check attendance status:', error);
//             setHasAttendanceRecorded(false);
//         }
//     };

//     // Fetch recorded days count
//     const fetchRecordedDaysCount = async () => {
//         if (!selectedClass) return;

//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(
//                 `${API_BASE_URL}/attendance/class/${selectedClass}/recorded-days-count`,
//                 { headers: { 'Authorization': `Bearer ${token}` } }
//             );
//             const data = await response.json();
//             if (!data.success) {
//                 throw new Error('Failed to fetch recorded days');
//             }
//             setRecordedDays(data.data);
//         } catch (error) {
//             console.error('Failed to fetch recorded days:', error);
//             setRecordedDays(0);
//         }
//     };

//     // Helper functions
//     const getMonthName = (date: string): string => {
//         const d = new Date(date);
//         return d.toLocaleString('default', { month: 'long', year: 'numeric' });
//     };

//     const getWeekNumber = (date: string): number => {
//         const d = new Date(date);
//         const startOfYear = new Date(d.getFullYear(), 0, 1);
//         const days = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
//         return Math.ceil((days + startOfYear.getDay() + 1) / 7);
//     };

//     const getDayOfWeek = (date: string): string => {
//         const d = new Date(date);
//         return d.toLocaleString('default', { weekday: 'long' });
//     };

//     const isWithinTerm = (date: string): boolean => {
//         if (!termInfo.startDate || !termInfo.endDate) return true;
//         const checkDate = new Date(date);
//         const start = new Date(termInfo.startDate);
//         const end = new Date(termInfo.endDate);
//         return checkDate >= start && checkDate <= end;
//     };

//     const calculateTotalDays = () => {
//         if (!termInfo.startDate || !termInfo.endDate) return 0;

//         const start = new Date(termInfo.startDate);
//         const end = new Date(termInfo.endDate);
//         let total = 0;
//         let current = new Date(start);

//         while (current <= end) {
//             const dayOfWeek = current.getDay();
//             const dateStr = current.toISOString().split('T')[0];

//             if (dayOfWeek >= 1 && dayOfWeek <= 5 && !allHolidays.has(dateStr)) {
//                 total++;
//             }
//             current.setDate(current.getDate() + 1);
//         }
//         return total;
//     };

//     const totalDays = calculateTotalDays();
//     const remainingDays = totalDays - recordedDays;

//     const isDateInTerm = isWithinTerm(selectedDate);
//     const isPublicHoliday = publicHolidays.has(selectedDate);
//     const isSchoolHoliday = schoolHolidays.has(selectedDate);
//     const isHoliday = isPublicHoliday || isSchoolHoliday;
//     const dayOfWeekNum = new Date(selectedDate).getDay();
//     const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;
//     const isFrozen = !selectedClass || !isDateInTerm || isHoliday || isWeekend;

//     const getFrozenReason = (): string => {
//         if (!selectedClass) return 'Select a class first';
//         if (!isDateInTerm) return `School Closed - ${termInfo.name} runs from ${termInfo.startDate} to ${termInfo.endDate}`;
//         if (isPublicHoliday) return 'Public Holiday';
//         if (isSchoolHoliday) return 'School Holiday';
//         if (isWeekend) return 'Weekend - No school';
//         return '';
//     };

//     const getAttendanceStatusDisplay = () => {
//         if (!selectedClass) return 'No class selected';
//         if (isFrozen) return '❄️ Frozen - Cannot mark attendance';
//         if (hasAttendanceRecorded) {
//             const totalStudents = filteredStudents.length;
//             const markedCount = filteredStudents.filter(s => s.status !== 'unmarked').length;

//             if (markedCount === totalStudents) {
//                 return '✅ All students have been marked';
//             } else {
//                 return `✅ ${markedCount}/${totalStudents} students marked - Save to confirm`;
//             }
//         }
//         return '⚠️ No attendance marked yet - Select status for each student';
//     };

//     const attendanceStatusColor = () => {
//         if (!selectedClass) return 'text-gray-500';
//         if (isFrozen) return 'text-gray-500';
//         if (hasAttendanceRecorded) return 'text-green-600';
//         return 'text-amber-600';
//     };

//     const handleMarkAsHoliday = async () => {
//         if (!selectedClass) {
//             alert('Please select a class first');
//             return;
//         }

//         if (!isDateInTerm) {
//             alert(`Cannot mark holiday outside term. ${termInfo.name} is ${termInfo.startDate} to ${termInfo.endDate}`);
//             return;
//         }

//         if (isWeekend) {
//             alert('Weekends are already non-school days. No need to mark as holiday.');
//             return;
//         }

//         if (isPublicHoliday) {
//             alert(`${selectedDate} is already a public holiday.`);
//             return;
//         }

//         if (isSchoolHoliday) {
//             alert(`${selectedDate} is already marked as a school holiday`);
//             return;
//         }

//         setMarkingHoliday(true);
//         const success = await addSchoolHoliday(selectedDate);
//         if (success) {
//             alert(`${selectedDate} has been marked as a school holiday`);
//         } else {
//             alert('Unable to mark as holiday. Please try again.');
//         }
//         setMarkingHoliday(false);
//     };

//     const handleRemoveHoliday = async () => {
//         if (!isSchoolHoliday) {
//             alert('Only manually added school holidays can be removed');
//             return;
//         }

//         if (confirm(`Remove holiday status from ${selectedDate}?`)) {
//             const success = await removeSchoolHoliday(selectedDate);
//             if (success) {
//                 alert(`${selectedDate} is no longer a holiday`);
//             } else {
//                 alert('Unable to remove holiday. Please try again.');
//             }
//         }
//     };

//     // Load data when class changes
//     useEffect(() => {
//         if (selectedClass) {
//             fetchTermInfo();
//             fetchSchoolHolidays();
//             fetchRecordedDaysCount();
//         }
//     }, [selectedClass]);

//     // Load public holidays once
//     useEffect(() => {
//         fetchPublicHolidays();
//     }, []);

//     // Check attendance when class or date changes
//     useEffect(() => {
//         if (selectedClass && selectedDate) {
//             checkAttendanceRecorded();
//         }
//     }, [selectedClass, selectedDate]);

//     const frozenReason = getFrozenReason();

//     return (
//         <>
//             {/* Date Info Card */}
//             {selectedClass && (
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
//                     <div className="flex flex-wrap items-center justify-between gap-4">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2 bg-indigo-100 rounded-lg">
//                                 <Calendar className="w-5 h-5 text-indigo-600" />
//                             </div>
//                             <div>
//                                 <h4 className="text-sm font-medium text-slate-500">Date Information</h4>
//                                 <div className="flex flex-wrap gap-3 mt-1">
//                                     <span className="text-sm font-semibold text-slate-800">
//                                         {getMonthName(selectedDate)}
//                                     </span>
//                                     <span className="text-sm text-slate-400">•</span>
//                                     <span className="text-sm font-semibold text-slate-800">
//                                         Week {getWeekNumber(selectedDate)}
//                                     </span>
//                                     <span className="text-sm text-slate-400">•</span>
//                                     <span className="text-sm font-semibold text-slate-800">
//                                         {getDayOfWeek(selectedDate)}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className={`flex items-center gap-2 ${attendanceStatusColor()}`}>
//                             <Info className="w-4 h-4" />
//                             <span className="text-sm font-medium">{getAttendanceStatusDisplay()}</span>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Term Stats Card */}
//             {selectedClass && (
//                 <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 mb-6">
//                     <div className="flex justify-between items-start mb-4">
//                         <div>
//                             <h3 className="text-lg font-bold text-indigo-900">{termInfo.name}</h3>
//                             <p className="text-sm text-indigo-600">
//                                 {termInfo.startDate || 'Loading...'} to {termInfo.endDate || 'Loading...'} | Monday-Friday only
//                             </p>
//                         </div>
//                         <div className="text-right">
//                             {loadingHolidays && (
//                                 <div className="text-xs text-amber-600 flex items-center gap-1">
//                                     <CloudRain className="w-3 h-3" />
//                                     Loading holidays...
//                                 </div>
//                             )}
//                             {!loadingHolidays && publicHolidays.size > 0 && (
//                                 <div className="text-xs text-green-600">
//                                     {publicHolidays.size} public holidays
//                                 </div>
//                             )}
//                             {schoolHolidays.size > 0 && (
//                                 <div className="text-xs text-purple-600">
//                                     +{schoolHolidays.size} school holidays
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                     <div className="grid grid-cols-3 gap-4">
//                         <div className="text-center">
//                             <p className="text-2xl font-bold text-indigo-800">{totalDays}</p>
//                             <p className="text-xs text-indigo-600">Total School Days</p>
//                         </div>
//                         <div className="text-center border-l border-r border-indigo-200">
//                             <p className="text-2xl font-bold text-emerald-700">{recordedDays}</p>
//                             <p className="text-xs text-indigo-600">Recorded</p>
//                         </div>
//                         <div className="text-center">
//                             <p className="text-2xl font-bold text-amber-700">{remainingDays}</p>
//                             <p className="text-xs text-indigo-600">Remaining</p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Filters */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
//                         <input
//                             type="date"
//                             value={selectedDate}
//                             onChange={(e) => setSelectedDate(e.target.value)}
//                             min={termInfo.startDate || undefined}
//                             max={termInfo.endDate || undefined}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         />
//                         {selectedClass && (
//                             <p className="text-xs text-slate-400 mt-1">
//                                 Term: {termInfo.startDate || 'Loading'} to {termInfo.endDate || 'Loading'}
//                             </p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
//                         <select
//                             value={selectedClass}
//                             onChange={(e) => setSelectedClass(e.target.value)}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                             <option value="">Select a class</option>
//                             {classes.map(cls => (
//                                 <option key={cls.id} value={cls.id}>
//                                     {cls.name} - {cls.term} ({cls.academic_year})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Search students..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {selectedClass ? (
//                 <>
//                     {/* Frozen Message */}
//                     {isFrozen && (
//                         <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${frozenReason.includes('Closed') ? 'bg-red-50 border border-red-200 text-red-700' :
//                             frozenReason.includes('Public') ? 'bg-green-50 border border-green-200 text-green-700' :
//                                 frozenReason.includes('School') ? 'bg-purple-50 border border-purple-200 text-purple-700' :
//                                     'bg-gray-50 border border-gray-200 text-gray-500'
//                             }`}>
//                             <Lock className="w-4 h-4 flex-shrink-0" />
//                             <span>
//                                 <strong>Frozen</strong> - {frozenReason}
//                                 {frozenReason.includes('School Holiday') && ' You can remove this holiday using the button below.'}
//                                 {frozenReason.includes('Closed') && ' Attendance cannot be marked when school is closed.'}
//                             </span>
//                         </div>
//                     )}

//                     {/* Holiday Actions */}
//                     {isDateInTerm && !isWeekend && (
//                         <div className="flex gap-2">
//                             {!isHoliday ? (
//                                 <button
//                                     onClick={handleMarkAsHoliday}
//                                     disabled={markingHoliday}
//                                     className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
//                                 >
//                                     <Plus className="w-4 h-4" />
//                                     {markingHoliday ? 'Marking...' : 'Mark as School Holiday'}
//                                 </button>
//                             ) : isSchoolHoliday ? (
//                                 <button
//                                     onClick={handleRemoveHoliday}
//                                     className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
//                                 >
//                                     <Gift className="w-4 h-4" />
//                                     Remove Holiday
//                                 </button>
//                             ) : isPublicHoliday && (
//                                 <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-2">
//                                     <CloudRain className="w-4 h-4" />
//                                     Public Holiday
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Stats Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Total Students</p>
//                                     <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
//                                 </div>
//                                 <Users className="w-8 h-8 text-indigo-600" />
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Present</p>
//                                     <p className="text-2xl font-bold text-green-600">{stats.present}</p>
//                                 </div>
//                                 <UserCheck className="w-8 h-8 text-green-600" />
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Absent</p>
//                                     <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
//                                 </div>
//                                 <UserX className="w-8 h-8 text-red-600" />
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Late</p>
//                                     <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
//                                 </div>
//                                 <Clock3 className="w-8 h-8 text-yellow-600" />
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Attendance Rate</p>
//                                     <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
//                                 </div>
//                                 <TrendingUp className="w-8 h-8 text-indigo-600" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Reminder Message */}
//                     {!isFrozen && !hasAttendanceRecorded && (
//                         <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
//                             <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                             <span>Don't forget to click <strong>Save Attendance</strong> after making changes! Unsaved changes will be lost.</span>
//                         </div>
//                     )}

//                     {/* Success Message */}
//                     {!isFrozen && hasAttendanceRecorded && (
//                         <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
//                             <CheckCircle className="w-4 h-4 flex-shrink-0" />
//                             <span>Attendance has been recorded for {selectedDate}. You can make changes and save again if needed.</span>
//                         </div>
//                     )}

//                     {/* Quick Actions */}
//                     <div className="flex justify-end gap-3">
//                         <button
//                             onClick={onSaveAttendance}
//                             disabled={saving || isFrozen}
//                             className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
//                         >
//                             {saving ? (
//                                 <>
//                                     <span className="animate-spin">⏳</span>
//                                     Saving...
//                                 </>
//                             ) : (
//                                 <>
//                                     <CheckCircle className="w-4 h-4" />
//                                     Save Attendance
//                                 </>
//                             )}
//                         </button>
//                         <button
//                             onClick={onMarkAllPresent}
//                             disabled={markingAll || isFrozen}
//                             className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors disabled:opacity-50 border border-green-200 flex items-center gap-2"
//                         >
//                             {markingAll ? (
//                                 <>
//                                     <span className="animate-spin">⏳</span>
//                                     Marking...
//                                 </>
//                             ) : (
//                                 <>
//                                     <CheckCircle className="w-4 h-4" />
//                                     Mark All Present
//                                 </>
//                             )}
//                         </button>
//                     </div>

//                     {/* Attendance Table */}
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Check-in Time</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {loading ? (
//                                         <tr>
//                                             <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
//                                                 Loading attendance data...
//                                             </td>
//                                         </tr>
//                                     ) : filteredStudents.length > 0 ? (
//                                         filteredStudents.map(student => (
//                                             <tr key={student.id} className="hover:bg-slate-50">
//                                                 <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                                 <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
//                                                 <td className="px-4 py-3">
//                                                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
//                                                         {getStatusIcon(student.status)}
//                                                         {student.status === 'unmarked' ? '📝 unmarked' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
//                                                 <td className="px-4 py-3">
//                                                     <select
//                                                         value={student.status}
//                                                         onChange={(e) => onStatusChange(student.id, e.target.value as any)}
//                                                         className={`px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${isFrozen
//                                                             ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
//                                                             : student.status === 'unmarked'
//                                                                 ? 'bg-indigo-50 text-indigo-700 font-medium border-indigo-200'
//                                                                 : 'bg-white border-slate-300 hover:border-indigo-300'
//                                                             }`}
//                                                         disabled={saving || isFrozen}
//                                                     >
//                                                         <option value="unmarked" className="option-unmarked">✏️ Mark Attendance</option>
//                                                         <option value="present" className="option-present">✅ Present</option>
//                                                         <option value="absent" className="option-absent">❌ Absent</option>
//                                                         <option value="late" className="option-late">⏰ Late</option>
//                                                         <option value="excused" className="option-excused">📋 Excused</option>
//                                                     </select>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
//                                                 No students found
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </>
//             ) : (
//                 <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
//                     <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                     <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Class</h3>
//                     <p className="text-slate-500">Choose a class from the dropdown above to start taking attendance</p>
//                 </div>
//             )}
//         </>
//     );
// };

// export default DailyTrackingTab;

// import React, { useState, useEffect } from 'react';
// import {
//     Calendar,
//     Search,
//     UserCheck,
//     UserX,
//     Clock3,
//     CheckCircle,
//     AlertCircle,
//     Users,
//     TrendingUp,
//     Gift,
//     CloudRain,
//     Plus,
//     Lock,
//     Info
// } from 'lucide-react';
// import { StudentAttendance, AttendanceStats } from './TeacherAttendance';

// interface Props {
//     classes: any[];
//     selectedClass: string;
//     setSelectedClass: (value: string) => void;
//     selectedDate: string;
//     setSelectedDate: (value: string) => void;
//     searchTerm: string;
//     setSearchTerm: (value: string) => void;
//     loading: boolean;
//     saving: boolean;
//     markingAll: boolean;
//     stats: AttendanceStats;
//     filteredStudents: StudentAttendance[];
//     onStatusChange: (studentId: string, status: StudentAttendance['status']) => void;
//     onSaveAttendance: () => void;
//     onMarkAllPresent: () => void;
//     getStatusColor: (status: string) => string;
//     getStatusIcon: (status: string) => JSX.Element;
// }

// const DailyTrackingTab: React.FC<Props> = ({
//     classes,
//     selectedClass,
//     setSelectedClass,
//     selectedDate,
//     setSelectedDate,
//     searchTerm,
//     setSearchTerm,
//     loading,
//     saving,
//     markingAll,
//     stats,
//     filteredStudents,
//     onStatusChange,
//     onSaveAttendance,
//     onMarkAllPresent,
//     getStatusColor,
//     getStatusIcon
// }) => {
//     // Get term info from selected class
//     const getTermInfoFromClass = () => {
//         const selectedClassData = classes.find(c => c.id === selectedClass);
//         if (selectedClassData) {
//             return {
//                 name: selectedClassData.term || 'Term 1, 2026',
//                 startDate: selectedClassData.start_date || '2026-01-15',
//                 endDate: selectedClassData.end_date || '2026-04-10'
//             };
//         }
//         return {
//             name: 'Term 1, 2026',
//             startDate: '2026-01-15',
//             endDate: '2026-04-10'
//         };
//     };

//     const termInfo = getTermInfoFromClass();

//     // Holiday states
//     const [autoHolidays, setAutoHolidays] = useState<Set<string>>(new Set());
//     const [manualHolidays, setManualHolidays] = useState<Set<string>>(new Set());
//     const [markingHoliday, setMarkingHoliday] = useState(false);
//     const [loadingHolidays, setLoadingHolidays] = useState(false);

//     // Track if attendance has been recorded for the selected date
//     const [hasAttendanceRecorded, setHasAttendanceRecorded] = useState<boolean>(false);

//     // Combined holidays
//     const allHolidays = new Set([...autoHolidays, ...manualHolidays]);

//     // Helper functions for date information
//     const getMonthName = (date: string): string => {
//         const d = new Date(date);
//         return d.toLocaleString('default', { month: 'long', year: 'numeric' });
//     };

//     const getWeekNumber = (date: string): number => {
//         const d = new Date(date);
//         const startOfYear = new Date(d.getFullYear(), 0, 1);
//         const days = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
//         return Math.ceil((days + startOfYear.getDay() + 1) / 7);
//     };

//     const getDayOfWeek = (date: string): string => {
//         const d = new Date(date);
//         return d.toLocaleString('default', { weekday: 'long' });
//     };

//     // Check if attendance has been recorded for this date
//     // Check if attendance has been recorded for this date
//     const checkAttendanceRecorded = () => {
//         // Check if ANY student has been marked (not 'unmarked')
//         // If all students are 'unmarked', then no attendance has been recorded
//         const hasAnyMarked = filteredStudents.some(student =>
//             student.status !== 'unmarked'
//         );
//         setHasAttendanceRecorded(hasAnyMarked);
//     };

//     // Check attendance recorded status when filteredStudents changes
//     useEffect(() => {
//         if (selectedClass && filteredStudents.length > 0) {
//             checkAttendanceRecorded();
//         }
//     }, [filteredStudents, selectedClass]);

//     // Check if date is within term range
//     const isWithinTerm = (date: string): boolean => {
//         const checkDate = new Date(date);
//         const start = new Date(termInfo.startDate);
//         const end = new Date(termInfo.endDate);
//         return checkDate >= start && checkDate <= end;
//     };

//     // Fetch public holidays
//     const fetchPublicHolidays = async () => {
//         setLoadingHolidays(true);
//         try {
//             const year = new Date(termInfo.startDate).getFullYear();
//             const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ZA`);
//             const data = await response.json();
//             const holidaySet = new Set<string>();
//             data.forEach((holiday: any) => {
//                 holidaySet.add(holiday.date);
//             });
//             setAutoHolidays(holidaySet);
//         } catch (error) {
//             console.error('Failed to fetch public holidays:', error);
//             const fallbackHolidays = new Set<string>([
//                 '2026-01-01', '2026-03-21', '2026-04-03', '2026-04-06',
//                 '2026-04-27', '2026-05-01', '2026-06-16', '2026-08-09',
//                 '2026-09-24', '2026-12-16', '2026-12-25', '2026-12-26'
//             ]);
//             setAutoHolidays(fallbackHolidays);
//         } finally {
//             setLoadingHolidays(false);
//         }
//     };

//     // Load manual holidays
//     const loadManualHolidays = async () => {
//         try {
//             const saved = localStorage.getItem(`manualHolidays_${selectedClass}`);
//             if (saved) {
//                 const holidays = JSON.parse(saved);
//                 setManualHolidays(new Set(holidays));
//             }
//         } catch (error) {
//             console.error('Failed to load manual holidays:', error);
//         }
//     };

//     // Save manual holiday
//     const saveManualHoliday = (date: string) => {
//         const newManualHolidays = new Set(manualHolidays);
//         newManualHolidays.add(date);
//         setManualHolidays(newManualHolidays);
//         localStorage.setItem(`manualHolidays_${selectedClass}`, JSON.stringify([...newManualHolidays]));
//     };

//     // Remove manual holiday
//     const removeManualHoliday = (date: string) => {
//         const newManualHolidays = new Set(manualHolidays);
//         newManualHolidays.delete(date);
//         setManualHolidays(newManualHolidays);
//         localStorage.setItem(`manualHolidays_${selectedClass}`, JSON.stringify([...newManualHolidays]));
//     };

//     // Load holidays when class changes
//     useEffect(() => {
//         if (selectedClass) {
//             fetchPublicHolidays();
//             loadManualHolidays();
//         }
//     }, [selectedClass]);

//     // Calculate total term days
//     const calculateTotalDays = () => {
//         const start = new Date(termInfo.startDate);
//         const end = new Date(termInfo.endDate);
//         let total = 0;
//         let current = new Date(start);

//         while (current <= end) {
//             const dayOfWeek = current.getDay();
//             const dateStr = current.toISOString().split('T')[0];

//             if (dayOfWeek >= 1 && dayOfWeek <= 5 && !allHolidays.has(dateStr)) {
//                 total++;
//             }
//             current.setDate(current.getDate() + 1);
//         }
//         return total;
//     };

//     const totalDays = calculateTotalDays();
//     const recordedDays = filteredStudents.filter(s => s.checkInTime || s.status !== 'present').length;
//     const remainingDays = totalDays - recordedDays;

//     // Check status of selected date
//     const isDateInTerm = isWithinTerm(selectedDate);
//     const isAutoHoliday = autoHolidays.has(selectedDate);
//     const isManualHoliday = manualHolidays.has(selectedDate);
//     const isHoliday = isAutoHoliday || isManualHoliday;
//     const dayOfWeekNum = new Date(selectedDate).getDay();
//     const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;
//     const isFrozen = !selectedClass || !isDateInTerm || isHoliday || isWeekend;

//     // Get frozen reason
//     const getFrozenReason = (): string => {
//         if (!selectedClass) return 'Select a class first';
//         if (!isDateInTerm) return `School Closed - ${termInfo.name} runs from ${termInfo.startDate} to ${termInfo.endDate}`;
//         if (isAutoHoliday) return 'Public Holiday (Auto-detected)';
//         if (isManualHoliday) return 'School Holiday (Manually added)';
//         if (isWeekend) return 'Weekend - No school';
//         return '';
//     };

//     // Handle mark as holiday
//     const handleMarkAsHoliday = () => {
//         if (!selectedClass) {
//             alert('Please select a class first');
//             return;
//         }

//         if (!isDateInTerm) {
//             alert(`Cannot mark holiday outside term. ${termInfo.name} is ${termInfo.startDate} to ${termInfo.endDate}`);
//             return;
//         }

//         if (isWeekend) {
//             alert('Weekends are already non-school days. No need to mark as holiday.');
//             return;
//         }

//         if (isAutoHoliday) {
//             alert(`${selectedDate} is already a public holiday.`);
//             return;
//         }

//         if (isManualHoliday) {
//             alert(`${selectedDate} is already marked as a holiday`);
//             return;
//         }

//         setMarkingHoliday(true);
//         setTimeout(() => {
//             saveManualHoliday(selectedDate);
//             alert(`${selectedDate} has been marked as a school holiday`);
//             setMarkingHoliday(false);
//         }, 500);
//     };

//     const handleRemoveHoliday = () => {
//         if (!isManualHoliday) {
//             alert('Only manually added holidays can be removed');
//             return;
//         }

//         if (confirm(`Remove holiday status from ${selectedDate}?`)) {
//             removeManualHoliday(selectedDate);
//             alert(`${selectedDate} is no longer a holiday`);
//         }
//     };

//     const frozenReason = getFrozenReason();

//     // Get attendance status display
//     // Get attendance status display
//     const getAttendanceStatusDisplay = () => {
//         if (!selectedClass) return 'No class selected';
//         if (isFrozen) return '❄️ Frozen - Cannot mark attendance';
//         if (hasAttendanceRecorded) {
//             // Check if all students are marked or only some
//             const totalStudents = filteredStudents.length;
//             const markedCount = filteredStudents.filter(s => s.status !== 'unmarked').length;

//             if (markedCount === totalStudents) {
//                 return '✅ All students have been marked';
//             } else {
//                 return `✅ ${markedCount}/${totalStudents} students marked - Save to confirm`;
//             }
//         }
//         return '⚠️ No attendance marked yet - Select status for each student';
//     };

//     const attendanceStatusColor = () => {
//         if (!selectedClass) return 'text-gray-500';
//         if (isFrozen) return 'text-gray-500';
//         if (hasAttendanceRecorded) return 'text-green-600';
//         return 'text-amber-600';
//     };

//     return (
//         <>
//             {/* Date Info Card - NEW */}
//             {selectedClass && (
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
//                     <div className="flex flex-wrap items-center justify-between gap-4">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2 bg-indigo-100 rounded-lg">
//                                 <Calendar className="w-5 h-5 text-indigo-600" />
//                             </div>
//                             <div>
//                                 <h4 className="text-sm font-medium text-slate-500">Date Information</h4>
//                                 <div className="flex flex-wrap gap-3 mt-1">
//                                     <span className="text-sm font-semibold text-slate-800">
//                                         {getMonthName(selectedDate)}
//                                     </span>
//                                     <span className="text-sm text-slate-400">•</span>
//                                     <span className="text-sm font-semibold text-slate-800">
//                                         Week {getWeekNumber(selectedDate)}
//                                     </span>
//                                     <span className="text-sm text-slate-400">•</span>
//                                     <span className="text-sm font-semibold text-slate-800">
//                                         {getDayOfWeek(selectedDate)}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className={`flex items-center gap-2 ${attendanceStatusColor()}`}>
//                             <Info className="w-4 h-4" />
//                             <span className="text-sm font-medium">{getAttendanceStatusDisplay()}</span>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Term Stats Card - Only show when class is selected */}
//             {selectedClass && (
//                 <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 mb-6">
//                     <div className="flex justify-between items-start mb-4">
//                         <div>
//                             <h3 className="text-lg font-bold text-indigo-900">{termInfo.name}</h3>
//                             <p className="text-sm text-indigo-600">
//                                 {termInfo.startDate} to {termInfo.endDate} | Monday-Friday only
//                             </p>
//                         </div>
//                         <div className="text-right">
//                             {loadingHolidays && (
//                                 <div className="text-xs text-amber-600 flex items-center gap-1">
//                                     <CloudRain className="w-3 h-3" />
//                                     Loading holidays...
//                                 </div>
//                             )}
//                             {!loadingHolidays && autoHolidays.size > 0 && (
//                                 <div className="text-xs text-green-600">
//                                     {autoHolidays.size} public holidays
//                                 </div>
//                             )}
//                             {manualHolidays.size > 0 && (
//                                 <div className="text-xs text-purple-600">
//                                     +{manualHolidays.size} school holidays
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                     <div className="grid grid-cols-3 gap-4">
//                         <div className="text-center">
//                             <p className="text-2xl font-bold text-indigo-800">{totalDays}</p>
//                             <p className="text-xs text-indigo-600">Total School Days</p>
//                         </div>
//                         <div className="text-center border-l border-r border-indigo-200">
//                             <p className="text-2xl font-bold text-emerald-700">{recordedDays}</p>
//                             <p className="text-xs text-indigo-600">Recorded</p>
//                         </div>
//                         <div className="text-center">
//                             <p className="text-2xl font-bold text-amber-700">{remainingDays}</p>
//                             <p className="text-xs text-indigo-600">Remaining</p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Filters */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
//                         <input
//                             type="date"
//                             value={selectedDate}
//                             onChange={(e) => setSelectedDate(e.target.value)}
//                             min={termInfo.startDate}
//                             max={termInfo.endDate}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         />
//                         {selectedClass && (
//                             <p className="text-xs text-slate-400 mt-1">
//                                 Term: {termInfo.startDate} to {termInfo.endDate}
//                             </p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
//                         <select
//                             value={selectedClass}
//                             onChange={(e) => setSelectedClass(e.target.value)}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                             <option value="">Select a class</option>
//                             {classes.map(cls => (
//                                 <option key={cls.id} value={cls.id}>
//                                     {cls.name} - {cls.term} ({cls.academic_year})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Search students..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {selectedClass ? (
//                 <>
//                     {/* Frozen Message */}
//                     {isFrozen && (
//                         <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${frozenReason.includes('Closed') ? 'bg-red-50 border border-red-200 text-red-700' :
//                             frozenReason.includes('Public') ? 'bg-green-50 border border-green-200 text-green-700' :
//                                 frozenReason.includes('School') ? 'bg-purple-50 border border-purple-200 text-purple-700' :
//                                     'bg-gray-50 border border-gray-200 text-gray-500'
//                             }`}>
//                             <Lock className="w-4 h-4 flex-shrink-0" />
//                             <span>
//                                 <strong>Frozen</strong> - {frozenReason}
//                                 {frozenReason.includes('School Holiday') && ' You can remove this holiday using the button below.'}
//                                 {frozenReason.includes('Closed') && ' Attendance cannot be marked when school is closed.'}
//                             </span>
//                         </div>
//                     )}

//                     {/* Holiday Actions */}
//                     {isDateInTerm && !isWeekend && (
//                         <div className="flex gap-2">
//                             {!isHoliday ? (
//                                 <button
//                                     onClick={handleMarkAsHoliday}
//                                     disabled={markingHoliday}
//                                     className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
//                                 >
//                                     <Plus className="w-4 h-4" />
//                                     {markingHoliday ? 'Marking...' : 'Mark as School Holiday'}
//                                 </button>
//                             ) : isManualHoliday ? (
//                                 <button
//                                     onClick={handleRemoveHoliday}
//                                     className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
//                                 >
//                                     <Gift className="w-4 h-4" />
//                                     Remove Holiday
//                                 </button>
//                             ) : isAutoHoliday && (
//                                 <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-2">
//                                     <CloudRain className="w-4 h-4" />
//                                     Public Holiday (Auto-detected)
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Stats Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Total Students</p>
//                                     <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
//                                 </div>
//                                 <Users className="w-8 h-8 text-indigo-600" />
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Present</p>
//                                     <p className="text-2xl font-bold text-green-600">{stats.present}</p>
//                                 </div>
//                                 <UserCheck className="w-8 h-8 text-green-600" />
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Absent</p>
//                                     <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
//                                 </div>
//                                 <UserX className="w-8 h-8 text-red-600" />
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Late</p>
//                                     <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
//                                 </div>
//                                 <Clock3 className="w-8 h-8 text-yellow-600" />
//                             </div>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-sm text-slate-500">Attendance Rate</p>
//                                     <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
//                                 </div>
//                                 <TrendingUp className="w-8 h-8 text-indigo-600" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Reminder Message - Only show when NOT frozen */}
//                     {!isFrozen && !hasAttendanceRecorded && (
//                         <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
//                             <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                             <span>Don't forget to click <strong>Save Attendance</strong> after making changes! Unsaved changes will be lost.</span>
//                         </div>
//                     )}

//                     {/* Success Message - When attendance has been recorded */}
//                     {!isFrozen && hasAttendanceRecorded && (
//                         <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
//                             <CheckCircle className="w-4 h-4 flex-shrink-0" />
//                             <span>Attendance has been recorded for {selectedDate}. You can make changes and save again if needed.</span>
//                         </div>
//                     )}

//                     {/* Quick Actions */}
//                     <div className="flex justify-end gap-3">
//                         <button
//                             onClick={onSaveAttendance}
//                             disabled={saving || isFrozen}
//                             className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
//                         >
//                             {saving ? (
//                                 <>
//                                     <span className="animate-spin">⏳</span>
//                                     Saving...
//                                 </>
//                             ) : (
//                                 <>
//                                     <CheckCircle className="w-4 h-4" />
//                                     Save Attendance
//                                 </>
//                             )}
//                         </button>
//                         <button
//                             onClick={onMarkAllPresent}
//                             disabled={markingAll || isFrozen}
//                             className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors disabled:opacity-50 border border-green-200 flex items-center gap-2"
//                         >
//                             {markingAll ? (
//                                 <>
//                                     <span className="animate-spin">⏳</span>
//                                     Marking...
//                                 </>
//                             ) : (
//                                 <>
//                                     <CheckCircle className="w-4 h-4" />
//                                     Mark All Present
//                                 </>
//                             )}
//                         </button>
//                     </div>

//                     {/* Attendance Table */}
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Check-in Time</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {loading ? (
//                                         <tr>
//                                             <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
//                                                 Loading attendance data...
//                                             </td>
//                                         </tr>
//                                     ) : filteredStudents.length > 0 ? (
//                                         filteredStudents.map(student => (
//                                             <tr key={student.id} className="hover:bg-slate-50">
//                                                 <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                                 <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
//                                                 <td className="px-4 py-3">
//                                                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
//                                                         {getStatusIcon(student.status)}
//                                                         {student.status === 'unmarked' ? '📝 unmarked' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
//                                                 <td className="px-4 py-3">
//                                                     <select
//                                                         value={student.status}
//                                                         onChange={(e) => onStatusChange(student.id, e.target.value as any)}
//                                                         className={`px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${isFrozen
//                                                             ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
//                                                             : student.status === 'unmarked'
//                                                                 ? 'bg-indigo-50 text-indigo-700 font-medium border-indigo-200'
//                                                                 : 'bg-white border-slate-300 hover:border-indigo-300'
//                                                             }`}
//                                                         disabled={saving || isFrozen}
//                                                     >
//                                                         <option value="unmarked" className="option-unmarked">✏️ Mark Attendance</option>
//                                                         <option value="present" className="option-present">✅ Present</option>
//                                                         <option value="absent" className="option-absent">❌ Absent</option>
//                                                         <option value="late" className="option-late">⏰ Late</option>
//                                                         <option value="excused" className="option-excused">📋 Excused</option>
//                                                     </select>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
//                                                 No students found
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </>
//             ) : (
//                 <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
//                     <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                     <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Class</h3>
//                     <p className="text-slate-500">Choose a class from the dropdown above to start taking attendance</p>
//                 </div>
//             )}
//         </>
//     );
// };

// export default DailyTrackingTab;

