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
import { addSchoolHoliday, fetchAttendanceByClassAndDate, fetchCurrentTerm, fetchRecordedDaysCount, fetchPublicHolidays, fetchSchoolHolidays, removeSchoolHoliday } from '@/services/attendanceService';

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
    const [totalDays, setTotalDays] = useState(0);

    // Auto-save feedback states
    const [autoSaveStatus, setAutoSaveStatus] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false });
    const [pendingSave, setPendingSave] = useState(false);
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

    const getFormattedDate = (date: string): string => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isWithinTerm = (date: string): boolean => {
        if (!termInfo.startDate || !termInfo.endDate) return true;
        const checkDate = new Date(date);
        const start = new Date(termInfo.startDate);
        const end = new Date(termInfo.endDate);
        return checkDate >= start && checkDate <= end;
    };

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

    // Add this new useEffect to calculate totalDays when term or holidays change
    useEffect(() => {
        if (termInfo.startDate && termInfo.endDate) {
            const total = calculateTotalDays();
            setTotalDays(total);
        }
    }, [termInfo.startDate, termInfo.endDate, allHolidays]);

    useEffect(() => {
        if (selectedClass !== 'all' && selectedDate) {
            checkAttendanceRecordedStatus();
            fetchRecordedDaysCountHandler();
        }
    }, [selectedClass, selectedDate]);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);
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

    return (
        <>
            {/* Auto-save notification */}
            {autoSaveStatus.show && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${autoSaveStatus.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {autoSaveStatus.message}
                </div>
            )}

            {/* Date Information Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-500">Selected Date</h4>
                            <p className="text-lg font-semibold text-slate-800">{getFormattedDate(selectedDate)}</p>
                        </div>
                    </div> */}
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

            {/* Controls: Class Selector, Search */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
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
            </div> */}

            {/* Controls: Date, Class Selector, Search */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
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
                        {termInfo.startDate && termInfo.endDate && (
                            <p className="text-xs text-slate-400 mt-1">
                                Term: {termInfo.startDate} to {termInfo.endDate}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
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
                    <div>
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

            {/* Holiday Actions */}
            {selectedClass !== 'all' && isDateInTerm && !isWeekend && (
                <div className="flex gap-2 mb-4">
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
            {/* <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
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
            </div> */}

            {/* Stats Cards - Row 1: Present | Absent | Late | Excused */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
            </div>

            {/* Stats Cards - Row 2: Total Students | Attendance Rate | Recorded Days */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                            <p className="text-sm text-slate-500">Attendance Rate</p>
                            <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-indigo-600" />
                    </div>
                </div>

                {/* Recorded Days Card */}
                {selectedClass !== 'all' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Recorded Days</p>
                                <p className="text-2xl font-bold text-indigo-600">{recordedDays} / {totalDays}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-indigo-600" />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {totalDays > 0 ? Math.round((recordedDays / totalDays) * 100) : 0}% of term recorded
                        </p>
                    </div>
                )}
            </div>

            {/* Frozen Message */}
            {isFrozen && selectedClass !== 'all' && (
                <div className={`rounded-lg p-3 flex items-center gap-2 text-sm mb-4 ${frozenReason.type === 'closed' ? 'bg-red-50 border border-red-200 text-red-700' :
                    frozenReason.type === 'public' ? 'bg-green-50 border border-green-200 text-green-700' :
                        frozenReason.type === 'manual' ? 'bg-purple-50 border border-purple-200 text-purple-700' :
                            'bg-gray-50 border border-gray-200 text-gray-500'
                    }`}>
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span>
                        <strong>Frozen</strong> - {frozenReason.message}
                        {frozenReason.type === 'manual' && ' You can remove this holiday using the button above.'}
                        {frozenReason.type === 'closed' && ' Attendance cannot be marked when school is closed.'}
                    </span>
                </div>
            )}

            {/* Auto-save info message */}
            {selectedClass !== 'all' && !isFrozen && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-2 text-indigo-700 text-sm mb-4">
                    <Save className="w-4 h-4 flex-shrink-0" />
                    <span>✨ Auto-save enabled — Changes are saved automatically when you select a status</span>
                </div>
            )}

            {/* Mark All Present button */}
            <div className="flex justify-end mb-4">
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

            {/* Attendance Table */}
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
