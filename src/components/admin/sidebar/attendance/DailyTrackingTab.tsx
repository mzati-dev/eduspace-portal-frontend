// components/attendance/DailyTrackingTab.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Calendar,
    Search,
    Users,
    TrendingUp,
    UserCheck,
    UserX,
    Clock3,
    AlertCircle,
    CheckCircle,
    Gift,
    CloudRain,
    Plus,
    Lock,
    Info,
    ShieldCheck,
    Save
} from 'lucide-react';
import { StudentAttendance, AttendanceStats } from './types';
import { addSchoolHoliday, API_BASE_URL, fetchAttendanceByClassAndDate, fetchCurrentTerm, fetchPublicHolidays, fetchRecordedDaysCount, fetchSchoolHolidays, removeSchoolHoliday } from '@/services/attendanceService';

interface DailyTrackingTabProps {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    selectedClass: string;
    setSelectedClass: (classId: string) => void;
    classes: any[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    attendanceData: StudentAttendance[];
    loading: boolean;
    saving: boolean;
    markingAll: boolean;
    stats: AttendanceStats;
    handleStatusChange: (studentId: string, newStatus: StudentAttendance['status']) => void;
    handleSaveAttendance: () => void;
    handleMarkAllPresent: () => void;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => JSX.Element;
}

const DailyTrackingTab: React.FC<DailyTrackingTabProps> = ({
    selectedDate,
    setSelectedDate,
    selectedClass,
    setSelectedClass,
    classes,
    searchTerm,
    setSearchTerm,
    attendanceData,
    loading,
    saving,
    markingAll,
    stats,
    handleStatusChange,
    handleSaveAttendance,
    handleMarkAllPresent,
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
    // Fix for NodeJS namespace error
    const saveTimeoutRef = useRef<number | null>(null);

    const allHolidays = new Set([...publicHolidays, ...schoolHolidays]);

    const fetchTermInfo = async () => {
        try {
            const term = await fetchCurrentTerm();
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

    const addSchoolHolidayHandler = async (date: string) => {
        try {
            await addSchoolHoliday(date, '', 'School Holiday');
            setSchoolHolidays(prev => new Set([...prev, date]));
            return true;
        } catch (error) {
            console.error('Failed to add school holiday:', error);
            return false;
        }
    };

    const removeSchoolHolidayHandler = async (date: string) => {
        try {
            await removeSchoolHoliday(date, '');
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

    const checkAttendanceRecordedStatus = async () => {
        if (selectedClass === 'all') return;
        try {
            const records = await fetchAttendanceByClassAndDate(selectedClass, selectedDate);
            setHasAttendanceRecorded(records.length > 0);
        } catch (error) {
            console.error('Failed to check attendance status:', error);
            setHasAttendanceRecorded(false);
        }
    };

    const fetchRecordedDaysCountHandler = async () => {
        if (selectedClass === 'all') return;
        try {
            const count = await fetchRecordedDaysCount(selectedClass);
            setRecordedDays(count);
        } catch (error) {
            console.error('Failed to fetch recorded days:', error);
            setRecordedDays(0);
        }
    };

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

    const filteredStudents = attendanceData.filter(s =>
        (selectedClass === 'all' || s.classId === selectedClass) &&
        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const isDateInTerm = isWithinTerm(selectedDate);
    const isPublicHoliday = publicHolidays.has(selectedDate);
    const isSchoolHoliday = schoolHolidays.has(selectedDate);
    const isHoliday = isPublicHoliday || isSchoolHoliday;
    const dayOfWeek = new Date(selectedDate).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFrozen = !isDateInTerm || isHoliday || isWeekend;

    // Auto-save function with debounce (MOVED HERE after isFrozen is declared)
    const triggerAutoSave = useCallback(() => {
        if (selectedClass === 'all' || isFrozen) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        setPendingSave(true);

        saveTimeoutRef.current = window.setTimeout(async () => {
            try {
                await handleSaveAttendance();
                setAutoSaveStatus({ show: true, message: '✓ Auto-saved', success: true });
                setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, show: false })), 2000);
            } catch (error) {
                setAutoSaveStatus({ show: true, message: '⚠️ Auto-save failed', success: false });
                setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, show: false })), 3000);
            } finally {
                setPendingSave(false);
            }
        }, 800);
    }, [handleSaveAttendance, selectedClass, isFrozen]);

    // Modified status change handler with auto-save (MOVED HERE)
    const handleStatusChangeWithAutoSave = (studentId: string, newStatus: StudentAttendance['status']) => {
        handleStatusChange(studentId, newStatus);
        triggerAutoSave();
    };

    const getFrozenReason = (): { message: string; type: string } => {
        if (!isDateInTerm) {
            return {
                message: `School Closed - ${termInfo.name} runs from ${termInfo.startDate} to ${termInfo.endDate}`,
                type: 'closed'
            };
        }
        if (isPublicHoliday) return { message: 'Public Holiday', type: 'public' };
        if (isSchoolHoliday) return { message: 'School Holiday', type: 'manual' };
        if (isWeekend) return { message: 'Weekend - No school', type: 'weekend' };
        return { message: '', type: '' };
    };

    const frozenReason = getFrozenReason();

    const getAttendanceStatusDisplay = () => {
        if (selectedClass === 'all') return 'Select a specific class';
        if (isFrozen) return '❄️ Frozen - Cannot mark attendance';
        if (pendingSave) return '💾 Saving...';
        if (hasAttendanceRecorded) return '✅ Attendance saved';
        return '✓ Auto-saves when you select status';
    };

    const attendanceStatusColor = () => {
        if (selectedClass === 'all') return 'text-indigo-600';
        if (isFrozen) return 'text-gray-500';
        if (pendingSave) return 'text-blue-600';
        if (hasAttendanceRecorded) return 'text-green-600';
        return 'text-indigo-600';
    };

    const handleMarkAsHoliday = async () => {
        if (selectedClass === 'all') {
            alert('Please select a specific class to mark holiday');
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
        const success = await addSchoolHolidayHandler(selectedDate)
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

    useEffect(() => {
        fetchTermInfo();
        fetchPublicHolidaysList();
        fetchSchoolHolidaysList();
    }, []);

    useEffect(() => {
        if (selectedClass !== 'all' && selectedDate) {
            checkAttendanceRecordedStatus();
            fetchRecordedDaysCountHandler();
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

    return (
        <>
            {/* Auto-save notification */}
            {autoSaveStatus.show && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${autoSaveStatus.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {autoSaveStatus.message}
                </div>
            )}

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
                        <span className="text-sm font-medium">
                            {selectedClass === 'all'
                                ? '📊 Viewing all classes - Select a specific class to mark attendance'
                                : getAttendanceStatusDisplay()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <p className="text-xs text-slate-400 mt-1">
                            Term: {termInfo.startDate || 'Loading'} to {termInfo.endDate || 'Loading'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
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

            {isFrozen && selectedClass !== 'all' && (
                <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${frozenReason.type === 'closed' ? 'bg-red-50 border border-red-200 text-red-700' :
                    frozenReason.type === 'public' ? 'bg-green-50 border border-green-200 text-green-700' :
                        frozenReason.type === 'manual' ? 'bg-purple-50 border border-purple-200 text-purple-700' :
                            'bg-gray-50 border border-gray-200 text-gray-500'
                    }`}>
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span>
                        <strong>Frozen</strong> - {frozenReason.message}
                        {frozenReason.type === 'manual' && ' You can remove this holiday using the button below.'}
                        {frozenReason.type === 'closed' && ' Attendance cannot be marked when school is closed.'}
                    </span>
                </div>
            )}

            {selectedClass !== 'all' && isDateInTerm && !isWeekend && (
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

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                            <p className="text-sm text-slate-500">Excused</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.excused}</p>
                        </div>
                        <ShieldCheck className="w-8 h-8 text-purple-600" />
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
            {selectedClass !== 'all' && !isFrozen && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-2 text-indigo-700 text-sm">
                    <Save className="w-4 h-4 flex-shrink-0" />
                    <span>✨ Auto-save enabled — Changes are saved automatically when you select a status</span>
                </div>
            )}

            {/* Mark All Present button only - Save button removed */}
            <div className="flex justify-end">
                <button
                    onClick={handleMarkAllPresent}
                    disabled={markingAll || selectedClass === 'all' || isFrozen}
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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Check-in Time</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        Loading attendance data...
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                        <td className="px-4 py-3 text-slate-600">{student.class}</td>
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
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        No students found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DailyTrackingTab;


// // components/attendance/DailyTrackingTab.tsx
// import React, { useState, useEffect } from 'react';
// import {
//     Calendar,
//     Search,
//     Users,
//     TrendingUp,
//     UserCheck,
//     UserX,
//     Clock3,
//     AlertCircle,
//     CheckCircle,
//     Gift,
//     CloudRain,
//     Plus,
//     Lock,
//     Info,
//     ShieldCheck
// } from 'lucide-react';
// import { StudentAttendance, AttendanceStats } from './types';
// import { API_BASE_URL } from '@/services/attendanceService';

// interface DailyTrackingTabProps {
//     selectedDate: string;
//     setSelectedDate: (date: string) => void;
//     selectedClass: string;
//     setSelectedClass: (classId: string) => void;
//     classes: any[];
//     searchTerm: string;
//     setSearchTerm: (term: string) => void;
//     attendanceData: StudentAttendance[];
//     loading: boolean;
//     saving: boolean;
//     markingAll: boolean;
//     stats: AttendanceStats;
//     handleStatusChange: (studentId: string, newStatus: StudentAttendance['status']) => void;
//     handleSaveAttendance: () => void;
//     handleMarkAllPresent: () => void;
//     getStatusColor: (status: string) => string;
//     getStatusIcon: (status: string) => JSX.Element;
// }

// const DailyTrackingTab: React.FC<DailyTrackingTabProps> = ({
//     selectedDate,
//     setSelectedDate,
//     selectedClass,
//     setSelectedClass,
//     classes,
//     searchTerm,
//     setSearchTerm,
//     attendanceData,
//     loading,
//     saving,
//     markingAll,
//     stats,
//     handleStatusChange,
//     handleSaveAttendance,
//     handleMarkAllPresent,
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

//     const fetchTermInfo = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/attendance/current-term`, {
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

//     const fetchSchoolHolidays = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/attendance/holidays/school`, {
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

//     const addSchoolHoliday = async (date: string) => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/attendance/holidays/school`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({ date, reason: 'School Holiday' })
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

//     const removeSchoolHoliday = async (date: string) => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await fetch(`${API_BASE_URL}/attendance/holidays/school/${date}`, {
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

//     const checkAttendanceRecorded = async () => {
//         if (selectedClass === 'all') return;

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

//     const fetchRecordedDaysCount = async () => {
//         if (selectedClass === 'all') return;

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

//     const filteredStudents = attendanceData.filter(s =>
//         (selectedClass === 'all' || s.classId === selectedClass) &&
//         (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     const isDateInTerm = isWithinTerm(selectedDate);
//     const isPublicHoliday = publicHolidays.has(selectedDate);
//     const isSchoolHoliday = schoolHolidays.has(selectedDate);
//     const isHoliday = isPublicHoliday || isSchoolHoliday;
//     const dayOfWeek = new Date(selectedDate).getDay();
//     const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
//     const isFrozen = !isDateInTerm || isHoliday || isWeekend;

//     const getFrozenReason = (): { message: string; type: string } => {
//         if (!isDateInTerm) {
//             return {
//                 message: `School Closed - ${termInfo.name} runs from ${termInfo.startDate} to ${termInfo.endDate}`,
//                 type: 'closed'
//             };
//         }
//         if (isPublicHoliday) return { message: 'Public Holiday', type: 'public' };
//         if (isSchoolHoliday) return { message: 'School Holiday', type: 'manual' };
//         if (isWeekend) return { message: 'Weekend - No school', type: 'weekend' };
//         return { message: '', type: '' };
//     };

//     const frozenReason = getFrozenReason();

//     const getAttendanceStatusDisplay = () => {
//         if (selectedClass === 'all') return 'Select a specific class';
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
//         if (selectedClass === 'all') return 'text-indigo-600';
//         if (isFrozen) return 'text-gray-500';
//         if (hasAttendanceRecorded) {
//             const totalStudents = filteredStudents.length;
//             const markedCount = filteredStudents.filter(s => s.status !== 'unmarked').length;
//             if (markedCount === totalStudents) {
//                 return 'text-green-600';
//             }
//             return 'text-blue-600';
//         }
//         return 'text-amber-600';
//     };

//     const handleMarkAsHoliday = async () => {
//         if (selectedClass === 'all') {
//             alert('Please select a specific class to mark holiday');
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

//     useEffect(() => {
//         fetchTermInfo();
//         fetchPublicHolidays();
//         fetchSchoolHolidays();
//     }, []);

//     useEffect(() => {
//         if (selectedClass !== 'all' && selectedDate) {
//             checkAttendanceRecorded();
//             fetchRecordedDaysCount();
//         }
//     }, [selectedClass, selectedDate]);

//     return (
//         <>
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
//                 <div className="flex flex-wrap items-center justify-between gap-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-indigo-100 rounded-lg">
//                             <Calendar className="w-5 h-5 text-indigo-600" />
//                         </div>
//                         <div>
//                             <h4 className="text-sm font-medium text-slate-500">Date Information</h4>
//                             <div className="flex flex-wrap gap-3 mt-1">
//                                 <span className="text-sm font-semibold text-slate-800">
//                                     {getMonthName(selectedDate)}
//                                 </span>
//                                 <span className="text-sm text-slate-400">•</span>
//                                 <span className="text-sm font-semibold text-slate-800">
//                                     Week {getWeekNumber(selectedDate)}
//                                 </span>
//                                 <span className="text-sm text-slate-400">•</span>
//                                 <span className="text-sm font-semibold text-slate-800">
//                                     {getDayOfWeek(selectedDate)}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div className={`flex items-center gap-2 ${attendanceStatusColor()}`}>
//                         <Info className="w-4 h-4" />
//                         <span className="text-sm font-medium">
//                             {selectedClass === 'all'
//                                 ? '📊 Viewing all classes - Select a specific class to mark attendance'
//                                 : getAttendanceStatusDisplay()}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
//                 <div className="flex justify-between items-start mb-4">
//                     <div>
//                         <h3 className="text-lg font-bold text-indigo-900">{termInfo.name}</h3>
//                         <p className="text-sm text-indigo-600">
//                             {termInfo.startDate || 'Loading...'} to {termInfo.endDate || 'Loading...'} | Monday-Friday only
//                         </p>
//                     </div>
//                     <div className="text-right">
//                         {loadingHolidays && (
//                             <div className="text-xs text-amber-600 flex items-center gap-1">
//                                 <CloudRain className="w-3 h-3" />
//                                 Loading holidays...
//                             </div>
//                         )}
//                         {!loadingHolidays && publicHolidays.size > 0 && (
//                             <div className="text-xs text-green-600">
//                                 {publicHolidays.size} public holidays
//                             </div>
//                         )}
//                         {schoolHolidays.size > 0 && (
//                             <div className="text-xs text-purple-600">
//                                 +{schoolHolidays.size} school holidays
//                             </div>
//                         )}
//                     </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                     <div className="text-center">
//                         <p className="text-2xl font-bold text-indigo-800">{totalDays}</p>
//                         <p className="text-xs text-indigo-600">Total School Days</p>
//                     </div>
//                     <div className="text-center border-l border-r border-indigo-200">
//                         <p className="text-2xl font-bold text-emerald-700">{recordedDays}</p>
//                         <p className="text-xs text-indigo-600">Recorded</p>
//                     </div>
//                     <div className="text-center">
//                         <p className="text-2xl font-bold text-amber-700">{remainingDays}</p>
//                         <p className="text-xs text-indigo-600">Remaining</p>
//                     </div>
//                 </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
//                         <p className="text-xs text-slate-400 mt-1">
//                             Term: {termInfo.startDate || 'Loading'} to {termInfo.endDate || 'Loading'}
//                         </p>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
//                         <select
//                             value={selectedClass}
//                             onChange={(e) => setSelectedClass(e.target.value)}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                             <option value="all">All Classes</option>
//                             {classes.map(cls => (
//                                 <option key={cls.id} value={cls.id}>{cls.name}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Search by name or exam number..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {isFrozen && selectedClass !== 'all' && (
//                 <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${frozenReason.type === 'closed' ? 'bg-red-50 border border-red-200 text-red-700' :
//                     frozenReason.type === 'public' ? 'bg-green-50 border border-green-200 text-green-700' :
//                         frozenReason.type === 'manual' ? 'bg-purple-50 border border-purple-200 text-purple-700' :
//                             'bg-gray-50 border border-gray-200 text-gray-500'
//                     }`}>
//                     <Lock className="w-4 h-4 flex-shrink-0" />
//                     <span>
//                         <strong>Frozen</strong> - {frozenReason.message}
//                         {frozenReason.type === 'manual' && ' You can remove this holiday using the button below.'}
//                         {frozenReason.type === 'closed' && ' Attendance cannot be marked when school is closed.'}
//                     </span>
//                 </div>
//             )}

//             {selectedClass !== 'all' && isDateInTerm && !isWeekend && (
//                 <div className="flex gap-2">
//                     {!isHoliday ? (
//                         <button
//                             onClick={handleMarkAsHoliday}
//                             disabled={markingHoliday}
//                             className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
//                         >
//                             <Plus className="w-4 h-4" />
//                             {markingHoliday ? 'Marking...' : 'Mark as School Holiday'}
//                         </button>
//                     ) : isSchoolHoliday ? (
//                         <button
//                             onClick={handleRemoveHoliday}
//                             className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
//                         >
//                             <Gift className="w-4 h-4" />
//                             Remove Holiday
//                         </button>
//                     ) : isPublicHoliday && (
//                         <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-2">
//                             <CloudRain className="w-4 h-4" />
//                             Public Holiday
//                         </div>
//                     )}
//                 </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Total Students</p>
//                             <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
//                         </div>
//                         <Users className="w-8 h-8 text-indigo-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Present</p>
//                             <p className="text-2xl font-bold text-green-600">{stats.present}</p>
//                         </div>
//                         <UserCheck className="w-8 h-8 text-green-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Absent</p>
//                             <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
//                         </div>
//                         <UserX className="w-8 h-8 text-red-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Late</p>
//                             <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
//                         </div>
//                         <Clock3 className="w-8 h-8 text-yellow-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Excused</p>
//                             <p className="text-2xl font-bold text-purple-600">{stats.excused}</p>
//                         </div>
//                         <ShieldCheck className="w-8 h-8 text-purple-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Attendance Rate</p>
//                             <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
//                         </div>
//                         <TrendingUp className="w-8 h-8 text-indigo-600" />
//                     </div>
//                 </div>
//             </div>

//             {selectedClass !== 'all' && !isFrozen && !hasAttendanceRecorded && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>Don't forget to click <strong>Save Attendance</strong>! Unsaved attendance will be lost.</span>
//                 </div>
//             )}

//             {selectedClass !== 'all' && !isFrozen && hasAttendanceRecorded && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
//                     <CheckCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>Attendance has been recorded for {selectedDate}. You can make changes and save again if needed.</span>
//                 </div>
//             )}

//             <div className="flex justify-end gap-3">
//                 <button
//                     onClick={handleSaveAttendance}
//                     disabled={saving || selectedClass === 'all' || isFrozen}
//                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
//                 >
//                     <CheckCircle className="w-4 h-4" />
//                     {saving ? 'Saving...' : 'Save Attendance'}
//                 </button>

//                 <button
//                     onClick={handleMarkAllPresent}
//                     disabled={markingAll || selectedClass === 'all' || isFrozen}
//                     className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors disabled:opacity-50 border border-green-200 flex items-center gap-2"
//                 >
//                     {markingAll ? (
//                         <>
//                             <span className="animate-spin">⏳</span>
//                             Marking...
//                         </>
//                     ) : (
//                         <>
//                             <CheckCircle className="w-4 h-4" />
//                             Mark All Present
//                         </>
//                     )}
//                 </button>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Check-in Time</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
//                                         Loading attendance data...
//                                     </td>
//                                 </tr>
//                             ) : filteredStudents.length > 0 ? (
//                                 filteredStudents.map(student => (
//                                     <tr key={student.id} className="hover:bg-slate-50">
//                                         <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                         <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
//                                         <td className="px-4 py-3 text-slate-600">{student.class}</td>
//                                         <td className="px-4 py-3">
//                                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
//                                                 {getStatusIcon(student.status)}
//                                                 {student.status === 'unmarked' ? '📝 unmarked' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
//                                         <td className="px-4 py-3">
//                                             <select
//                                                 value={student.status}
//                                                 onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
//                                                 className={`px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${isFrozen
//                                                     ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
//                                                     : student.status === 'unmarked'
//                                                         ? 'bg-indigo-50 text-indigo-700 font-medium border-indigo-200'
//                                                         : 'bg-white border-slate-300 hover:border-indigo-300'
//                                                     }`}
//                                                 disabled={saving || isFrozen}
//                                             >
//                                                 <option value="unmarked" className="option-unmarked">✏️ Mark Attendance</option>
//                                                 <option value="present" className="option-present">✅ Present</option>
//                                                 <option value="absent" className="option-absent">❌ Absent</option>
//                                                 <option value="late" className="option-late">⏰ Late</option>
//                                                 <option value="excused" className="option-excused">📋 Excused</option>
//                                             </select>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
//                                         No students found
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default DailyTrackingTab;

// // components/attendance/DailyTrackingTab.tsx
// import React, { useState, useEffect } from 'react';
// import {
//     Calendar,
//     Search,
//     Users,
//     TrendingUp,
//     UserCheck,
//     UserX,
//     Clock3,
//     AlertCircle,
//     CheckCircle,
//     Gift,
//     CloudRain,
//     Plus,
//     Lock,
//     Info,
//     ShieldCheck
// } from 'lucide-react';
// import { StudentAttendance, AttendanceStats } from './types';

// interface DailyTrackingTabProps {
//     selectedDate: string;
//     setSelectedDate: (date: string) => void;
//     selectedClass: string;
//     setSelectedClass: (classId: string) => void;
//     classes: any[];
//     searchTerm: string;
//     setSearchTerm: (term: string) => void;
//     attendanceData: StudentAttendance[];
//     loading: boolean;
//     saving: boolean;
//     markingAll: boolean;
//     stats: AttendanceStats;
//     handleStatusChange: (studentId: string, newStatus: StudentAttendance['status']) => void;
//     handleSaveAttendance: () => void;
//     handleMarkAllPresent: () => void;
//     getStatusColor: (status: string) => string;
//     getStatusIcon: (status: string) => JSX.Element;
// }

// const DailyTrackingTab: React.FC<DailyTrackingTabProps> = ({
//     selectedDate,
//     setSelectedDate,
//     selectedClass,
//     setSelectedClass,
//     classes,
//     searchTerm,
//     setSearchTerm,
//     attendanceData,
//     loading,
//     saving,
//     markingAll,
//     stats,
//     handleStatusChange,
//     handleSaveAttendance,
//     handleMarkAllPresent,
//     getStatusColor,
//     getStatusIcon
// }) => {
//     // Term state - This would come from your backend automatically
//     const [termInfo] = useState({
//         name: 'Term 1, 2026',
//         startDate: '2026-01-15',
//         endDate: '2026-04-10'
//     });

//     // Holiday states
//     const [autoHolidays, setAutoHolidays] = useState<Set<string>>(new Set());
//     const [manualHolidays, setManualHolidays] = useState<Set<string>>(new Set());
//     const [markingHoliday, setMarkingHoliday] = useState(false);
//     const [loadingHolidays, setLoadingHolidays] = useState(false);

//     // Track if attendance has been recorded for the selected date
//     const [hasAttendanceRecorded, setHasAttendanceRecorded] = useState<boolean>(false);

//     // Combined holidays (auto + manual)
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
//     // Check if attendance has been recorded for this date
//     const checkAttendanceRecorded = () => {
//         // Check if ANY student has been marked (not 'unmarked')
//         const hasAnyMarked = attendanceData.some(student =>
//             student.status !== 'unmarked'
//         );
//         setHasAttendanceRecorded(hasAnyMarked);
//     };

//     // Check attendance recorded status when attendanceData changes
//     useEffect(() => {
//         if (selectedClass !== 'all' && attendanceData.length > 0) {
//             checkAttendanceRecorded();
//         }
//     }, [attendanceData, selectedClass]);

//     // Check if date is within term range
//     const isWithinTerm = (date: string): boolean => {
//         const checkDate = new Date(date);
//         const start = new Date(termInfo.startDate);
//         const end = new Date(termInfo.endDate);
//         return checkDate >= start && checkDate <= end;
//     };

//     // Fetch public holidays from calendar API
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
//             // Fallback holidays
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
//             const saved = localStorage.getItem('manualHolidays');
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
//         localStorage.setItem('manualHolidays', JSON.stringify([...newManualHolidays]));
//     };

//     // Remove manual holiday
//     const removeManualHoliday = (date: string) => {
//         const newManualHolidays = new Set(manualHolidays);
//         newManualHolidays.delete(date);
//         setManualHolidays(newManualHolidays);
//         localStorage.setItem('manualHolidays', JSON.stringify([...newManualHolidays]));
//     };

//     // Load holidays on mount
//     useEffect(() => {
//         fetchPublicHolidays();
//         loadManualHolidays();
//     }, []);

//     // Calculate total term days (Monday-Friday only, within term, excluding holidays)
//     const calculateTotalDays = () => {
//         const start = new Date(termInfo.startDate);
//         const end = new Date(termInfo.endDate);
//         let total = 0;
//         let current = new Date(start);

//         while (current <= end) {
//             const dayOfWeek = current.getDay();
//             const dateStr = current.toISOString().split('T')[0];

//             // Count only Monday(1) to Friday(5), exclude ALL holidays
//             if (dayOfWeek >= 1 && dayOfWeek <= 5 && !allHolidays.has(dateStr)) {
//                 total++;
//             }
//             current.setDate(current.getDate() + 1);
//         }
//         return total;
//     };

//     // Calculate recorded days from attendance data
//     const calculateRecordedDays = () => {
//         // Count unique dates with attendance records
//         const uniqueDates = new Set<string>();
//         attendanceData.forEach(student => {
//             if (student.checkInTime || student.status !== 'present') {
//                 uniqueDates.add(selectedDate);
//             }
//         });
//         return uniqueDates.size;
//     };

//     const totalDays = calculateTotalDays();
//     const recordedDays = calculateRecordedDays();
//     const remainingDays = totalDays - recordedDays;

//     const filteredStudents = attendanceData.filter(s =>
//         (selectedClass === 'all' || s.classId === selectedClass) &&
//         (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     // Check status of selected date
//     const isDateInTerm = isWithinTerm(selectedDate);
//     const isAutoHoliday = autoHolidays.has(selectedDate);
//     const isManualHoliday = manualHolidays.has(selectedDate);
//     const isHoliday = isAutoHoliday || isManualHoliday;
//     const dayOfWeek = new Date(selectedDate).getDay();
//     const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

//     // Determine if attendance can be marked (all conditions must be false)
//     const isFrozen = !isDateInTerm || isHoliday || isWeekend;

//     // Get the reason why it's frozen
//     const getFrozenReason = (): { message: string; type: string } => {
//         if (!isDateInTerm) {
//             return {
//                 message: `School Closed - ${termInfo.name} runs from ${termInfo.startDate} to ${termInfo.endDate}`,
//                 type: 'closed'
//             };
//         }
//         if (isAutoHoliday) return { message: 'Public Holiday (Auto-detected)', type: 'public' };
//         if (isManualHoliday) return { message: 'School Holiday (Manually added)', type: 'manual' };
//         if (isWeekend) return { message: 'Weekend - No school', type: 'weekend' };
//         return { message: '', type: '' };
//     };

//     const frozenReason = getFrozenReason();

//     // Get attendance status display
//     // Get attendance status display
//     const getAttendanceStatusDisplay = () => {
//         if (selectedClass === 'all') return 'Select a specific class';
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
//         if (selectedClass === 'all') return 'text-indigo-600';
//         if (isFrozen) return 'text-gray-500';
//         if (hasAttendanceRecorded) {
//             const totalStudents = filteredStudents.length;
//             const markedCount = filteredStudents.filter(s => s.status !== 'unmarked').length;
//             if (markedCount === totalStudents) {
//                 return 'text-green-600';
//             }
//             return 'text-blue-600';
//         }
//         return 'text-amber-600';
//     };
//     // Handle marking manual holiday (only possible for dates within term, not weekend, not already holiday)
//     const handleMarkAsHoliday = () => {
//         if (selectedClass === 'all') {
//             alert('Please select a specific class to mark holiday');
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

//     return (
//         <>
//             {/* Date Info Card - NEW */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
//                 <div className="flex flex-wrap items-center justify-between gap-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-indigo-100 rounded-lg">
//                             <Calendar className="w-5 h-5 text-indigo-600" />
//                         </div>
//                         <div>
//                             <h4 className="text-sm font-medium text-slate-500">Date Information</h4>
//                             <div className="flex flex-wrap gap-3 mt-1">
//                                 <span className="text-sm font-semibold text-slate-800">
//                                     {getMonthName(selectedDate)}
//                                 </span>
//                                 <span className="text-sm text-slate-400">•</span>
//                                 <span className="text-sm font-semibold text-slate-800">
//                                     Week {getWeekNumber(selectedDate)}
//                                 </span>
//                                 <span className="text-sm text-slate-400">•</span>
//                                 <span className="text-sm font-semibold text-slate-800">
//                                     {getDayOfWeek(selectedDate)}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                     <div className={`flex items-center gap-2 ${attendanceStatusColor()}`}>
//                         <Info className="w-4 h-4" />
//                         <span className="text-sm font-medium">
//                             {selectedClass === 'all'
//                                 ? '📊 Viewing all classes - Select a specific class to mark attendance'
//                                 : getAttendanceStatusDisplay()}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* Term Stats Card */}
//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
//                 <div className="flex justify-between items-start mb-4">
//                     <div>
//                         <h3 className="text-lg font-bold text-indigo-900">{termInfo.name}</h3>
//                         <p className="text-sm text-indigo-600">
//                             {termInfo.startDate} to {termInfo.endDate} | Monday-Friday only
//                         </p>
//                     </div>
//                     <div className="text-right">
//                         {loadingHolidays && (
//                             <div className="text-xs text-amber-600 flex items-center gap-1">
//                                 <CloudRain className="w-3 h-3" />
//                                 Loading holidays...
//                             </div>
//                         )}
//                         {!loadingHolidays && autoHolidays.size > 0 && (
//                             <div className="text-xs text-green-600">
//                                 {autoHolidays.size} public holidays
//                             </div>
//                         )}
//                         {manualHolidays.size > 0 && (
//                             <div className="text-xs text-purple-600">
//                                 +{manualHolidays.size} school holidays
//                             </div>
//                         )}
//                     </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                     <div className="text-center">
//                         <p className="text-2xl font-bold text-indigo-800">{totalDays}</p>
//                         <p className="text-xs text-indigo-600">Total School Days</p>
//                     </div>
//                     <div className="text-center border-l border-r border-indigo-200">
//                         <p className="text-2xl font-bold text-emerald-700">{recordedDays}</p>
//                         <p className="text-xs text-indigo-600">Recorded</p>
//                     </div>
//                     <div className="text-center">
//                         <p className="text-2xl font-bold text-amber-700">{remainingDays}</p>
//                         <p className="text-xs text-indigo-600">Remaining</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Filters */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
//                         <p className="text-xs text-slate-400 mt-1">
//                             Term: {termInfo.startDate} to {termInfo.endDate}
//                         </p>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
//                         <select
//                             value={selectedClass}
//                             onChange={(e) => setSelectedClass(e.target.value)}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                             <option value="all">All Classes</option>
//                             {classes.map(cls => (
//                                 <option key={cls.id} value={cls.id}>{cls.name}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Search by name or exam number..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Frozen Message - Shows when date cannot have attendance */}
//             {isFrozen && selectedClass !== 'all' && (
//                 <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${frozenReason.type === 'closed' ? 'bg-red-50 border border-red-200 text-red-700' :
//                     frozenReason.type === 'public' ? 'bg-green-50 border border-green-200 text-green-700' :
//                         frozenReason.type === 'manual' ? 'bg-purple-50 border border-purple-200 text-purple-700' :
//                             'bg-gray-50 border border-gray-200 text-gray-500'
//                     }`}>
//                     <Lock className="w-4 h-4 flex-shrink-0" />
//                     <span>
//                         <strong>Frozen</strong> - {frozenReason.message}
//                         {frozenReason.type === 'manual' && ' You can remove this holiday using the button below.'}
//                         {frozenReason.type === 'closed' && ' Attendance cannot be marked when school is closed.'}
//                     </span>
//                 </div>
//             )}

//             {/* Holiday Actions - Only show for dates within term, not weekend */}
//             {selectedClass !== 'all' && isDateInTerm && !isWeekend && (
//                 <div className="flex gap-2">
//                     {!isHoliday ? (
//                         <button
//                             onClick={handleMarkAsHoliday}
//                             disabled={markingHoliday}
//                             className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
//                         >
//                             <Plus className="w-4 h-4" />
//                             {markingHoliday ? 'Marking...' : 'Mark as School Holiday'}
//                         </button>
//                     ) : isManualHoliday ? (
//                         <button
//                             onClick={handleRemoveHoliday}
//                             className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
//                         >
//                             <Gift className="w-4 h-4" />
//                             Remove Holiday
//                         </button>
//                     ) : isAutoHoliday && (
//                         <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-2">
//                             <CloudRain className="w-4 h-4" />
//                             Public Holiday (Auto-detected)
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Total Students</p>
//                             <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
//                         </div>
//                         <Users className="w-8 h-8 text-indigo-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Present</p>
//                             <p className="text-2xl font-bold text-green-600">{stats.present}</p>
//                         </div>
//                         <UserCheck className="w-8 h-8 text-green-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Absent</p>
//                             <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
//                         </div>
//                         <UserX className="w-8 h-8 text-red-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Late</p>
//                             <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
//                         </div>
//                         <Clock3 className="w-8 h-8 text-yellow-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Excused</p>
//                             <p className="text-2xl font-bold text-purple-600">{stats.excused}</p>
//                         </div>
//                         <ShieldCheck className="w-8 h-8 text-purple-600" />
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-500">Attendance Rate</p>
//                             <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
//                         </div>
//                         <TrendingUp className="w-8 h-8 text-indigo-600" />
//                     </div>
//                 </div>
//             </div>

//             {/* Reminder Message - Only show when date is NOT frozen and attendance not recorded */}
//             {selectedClass !== 'all' && !isFrozen && !hasAttendanceRecorded && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>Don't forget to click <strong>Save Attendance</strong>! Unsaved attendance will be lost.</span>
//                 </div>
//             )}

//             {/* Success Message - When attendance has been recorded */}
//             {selectedClass !== 'all' && !isFrozen && hasAttendanceRecorded && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
//                     <CheckCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>Attendance has been recorded for {selectedDate}. You can make changes and save again if needed.</span>
//                 </div>
//             )}

//             <div className="flex justify-end gap-3">
//                 <button
//                     onClick={handleSaveAttendance}
//                     disabled={saving || selectedClass === 'all' || isFrozen}
//                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
//                 >
//                     <CheckCircle className="w-4 h-4" />
//                     {saving ? 'Saving...' : 'Save Attendance'}
//                 </button>

//                 <button
//                     onClick={handleMarkAllPresent}
//                     disabled={markingAll || selectedClass === 'all' || isFrozen}
//                     className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors disabled:opacity-50 border border-green-200 flex items-center gap-2"
//                 >
//                     {markingAll ? (
//                         <>
//                             <span className="animate-spin">⏳</span>
//                             Marking...
//                         </>
//                     ) : (
//                         <>
//                             <CheckCircle className="w-4 h-4" />
//                             Mark All Present
//                         </>
//                     )}
//                 </button>
//             </div>

//             {/* Attendance Table */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Check-in Time</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
//                                         Loading attendance data...
//                                     </td>
//                                 </tr>
//                             ) : filteredStudents.length > 0 ? (
//                                 filteredStudents.map(student => (
//                                     <tr key={student.id} className="hover:bg-slate-50">
//                                         <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                         <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
//                                         <td className="px-4 py-3 text-slate-600">{student.class}</td>
//                                         <td className="px-4 py-3">
//                                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
//                                                 {getStatusIcon(student.status)}
//                                                 {student.status === 'unmarked' ? '📝 unmarked' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
//                                         <td className="px-4 py-3">
//                                             <select
//                                                 value={student.status}
//                                                 onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
//                                                 className={`px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${isFrozen
//                                                     ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
//                                                     : student.status === 'unmarked'
//                                                         ? 'bg-indigo-50 text-indigo-700 font-medium border-indigo-200'  // ← LIGHT SOFT INDIGO
//                                                         : 'bg-white border-slate-300 hover:border-indigo-300'
//                                                     }`}
//                                                 disabled={saving || isFrozen}
//                                             >
//                                                 <option value="unmarked" className="option-unmarked">✏️ Mark Attendance</option>
//                                                 <option value="present" className="option-present">✅ Present</option>
//                                                 <option value="absent" className="option-absent">❌ Absent</option>
//                                                 <option value="late" className="option-late">⏰ Late</option>
//                                                 <option value="excused" className="option-excused">📋 Excused</option>
//                                             </select>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
//                                         No students found
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default DailyTrackingTab;