// components/attendance/DailyTrackingTab.tsx
import React, { useState, useEffect } from 'react';
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
    Info
} from 'lucide-react';
import { StudentAttendance, AttendanceStats } from './types';

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
    // Term state - This would come from your backend automatically
    const [termInfo] = useState({
        name: 'Term 1, 2026',
        startDate: '2026-01-15',
        endDate: '2026-04-10'
    });

    // Holiday states
    const [autoHolidays, setAutoHolidays] = useState<Set<string>>(new Set());
    const [manualHolidays, setManualHolidays] = useState<Set<string>>(new Set());
    const [markingHoliday, setMarkingHoliday] = useState(false);
    const [loadingHolidays, setLoadingHolidays] = useState(false);

    // Track if attendance has been recorded for the selected date
    const [hasAttendanceRecorded, setHasAttendanceRecorded] = useState<boolean>(false);

    // Combined holidays (auto + manual)
    const allHolidays = new Set([...autoHolidays, ...manualHolidays]);

    // Helper functions for date information
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

    // Check if attendance has been recorded for this date
    const checkAttendanceRecorded = () => {
        // Check if any student has a check-in time or non-default status
        const hasAnyRecord = attendanceData.some(student =>
            student.checkInTime || student.status !== 'present'
        );
        setHasAttendanceRecorded(hasAnyRecord);
    };

    // Check attendance recorded status when attendanceData changes
    useEffect(() => {
        if (selectedClass !== 'all' && attendanceData.length > 0) {
            checkAttendanceRecorded();
        }
    }, [attendanceData, selectedClass]);

    // Check if date is within term range
    const isWithinTerm = (date: string): boolean => {
        const checkDate = new Date(date);
        const start = new Date(termInfo.startDate);
        const end = new Date(termInfo.endDate);
        return checkDate >= start && checkDate <= end;
    };

    // Fetch public holidays from calendar API
    const fetchPublicHolidays = async () => {
        setLoadingHolidays(true);
        try {
            const year = new Date(termInfo.startDate).getFullYear();
            const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ZA`);
            const data = await response.json();

            const holidaySet = new Set<string>();
            data.forEach((holiday: any) => {
                holidaySet.add(holiday.date);
            });
            setAutoHolidays(holidaySet);
        } catch (error) {
            console.error('Failed to fetch public holidays:', error);
            // Fallback holidays
            const fallbackHolidays = new Set<string>([
                '2026-01-01', '2026-03-21', '2026-04-03', '2026-04-06',
                '2026-04-27', '2026-05-01', '2026-06-16', '2026-08-09',
                '2026-09-24', '2026-12-16', '2026-12-25', '2026-12-26'
            ]);
            setAutoHolidays(fallbackHolidays);
        } finally {
            setLoadingHolidays(false);
        }
    };

    // Load manual holidays
    const loadManualHolidays = async () => {
        try {
            const saved = localStorage.getItem('manualHolidays');
            if (saved) {
                const holidays = JSON.parse(saved);
                setManualHolidays(new Set(holidays));
            }
        } catch (error) {
            console.error('Failed to load manual holidays:', error);
        }
    };

    // Save manual holiday
    const saveManualHoliday = (date: string) => {
        const newManualHolidays = new Set(manualHolidays);
        newManualHolidays.add(date);
        setManualHolidays(newManualHolidays);
        localStorage.setItem('manualHolidays', JSON.stringify([...newManualHolidays]));
    };

    // Remove manual holiday
    const removeManualHoliday = (date: string) => {
        const newManualHolidays = new Set(manualHolidays);
        newManualHolidays.delete(date);
        setManualHolidays(newManualHolidays);
        localStorage.setItem('manualHolidays', JSON.stringify([...newManualHolidays]));
    };

    // Load holidays on mount
    useEffect(() => {
        fetchPublicHolidays();
        loadManualHolidays();
    }, []);

    // Calculate total term days (Monday-Friday only, within term, excluding holidays)
    const calculateTotalDays = () => {
        const start = new Date(termInfo.startDate);
        const end = new Date(termInfo.endDate);
        let total = 0;
        let current = new Date(start);

        while (current <= end) {
            const dayOfWeek = current.getDay();
            const dateStr = current.toISOString().split('T')[0];

            // Count only Monday(1) to Friday(5), exclude ALL holidays
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !allHolidays.has(dateStr)) {
                total++;
            }
            current.setDate(current.getDate() + 1);
        }
        return total;
    };

    // Calculate recorded days from attendance data
    const calculateRecordedDays = () => {
        // Count unique dates with attendance records
        const uniqueDates = new Set<string>();
        attendanceData.forEach(student => {
            if (student.checkInTime || student.status !== 'present') {
                uniqueDates.add(selectedDate);
            }
        });
        return uniqueDates.size;
    };

    const totalDays = calculateTotalDays();
    const recordedDays = calculateRecordedDays();
    const remainingDays = totalDays - recordedDays;

    const filteredStudents = attendanceData.filter(s =>
        (selectedClass === 'all' || s.classId === selectedClass) &&
        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Check status of selected date
    const isDateInTerm = isWithinTerm(selectedDate);
    const isAutoHoliday = autoHolidays.has(selectedDate);
    const isManualHoliday = manualHolidays.has(selectedDate);
    const isHoliday = isAutoHoliday || isManualHoliday;
    const dayOfWeek = new Date(selectedDate).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Determine if attendance can be marked (all conditions must be false)
    const isFrozen = !isDateInTerm || isHoliday || isWeekend;

    // Get the reason why it's frozen
    const getFrozenReason = (): { message: string; type: string } => {
        if (!isDateInTerm) {
            return {
                message: `School Closed - ${termInfo.name} runs from ${termInfo.startDate} to ${termInfo.endDate}`,
                type: 'closed'
            };
        }
        if (isAutoHoliday) return { message: 'Public Holiday (Auto-detected)', type: 'public' };
        if (isManualHoliday) return { message: 'School Holiday (Manually added)', type: 'manual' };
        if (isWeekend) return { message: 'Weekend - No school', type: 'weekend' };
        return { message: '', type: '' };
    };

    const frozenReason = getFrozenReason();

    // Get attendance status display
    const getAttendanceStatusDisplay = () => {
        if (selectedClass === 'all') return 'Select a specific class';
        if (isFrozen) return '❄️ Frozen - Cannot mark attendance';
        if (hasAttendanceRecorded) return '✅ Attendance has been recorded';
        return '⚠️ Attendance not yet recorded for this date';
    };

    const attendanceStatusColor = () => {
        if (selectedClass === 'all') return 'text-gray-500';
        if (isFrozen) return 'text-gray-500';
        if (hasAttendanceRecorded) return 'text-green-600';
        return 'text-amber-600';
    };

    // Handle marking manual holiday (only possible for dates within term, not weekend, not already holiday)
    const handleMarkAsHoliday = () => {
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

        if (isAutoHoliday) {
            alert(`${selectedDate} is already a public holiday.`);
            return;
        }

        if (isManualHoliday) {
            alert(`${selectedDate} is already marked as a holiday`);
            return;
        }

        setMarkingHoliday(true);
        setTimeout(() => {
            saveManualHoliday(selectedDate);
            alert(`${selectedDate} has been marked as a school holiday`);
            setMarkingHoliday(false);
        }, 500);
    };

    const handleRemoveHoliday = () => {
        if (!isManualHoliday) {
            alert('Only manually added holidays can be removed');
            return;
        }

        if (confirm(`Remove holiday status from ${selectedDate}?`)) {
            removeManualHoliday(selectedDate);
            alert(`${selectedDate} is no longer a holiday`);
        }
    };

    return (
        <>
            {/* Date Info Card - NEW */}
            {selectedClass !== 'all' && (
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
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900">{termInfo.name}</h3>
                        <p className="text-sm text-indigo-600">
                            {termInfo.startDate} to {termInfo.endDate} | Monday-Friday only
                        </p>
                    </div>
                    <div className="text-right">
                        {loadingHolidays && (
                            <div className="text-xs text-amber-600 flex items-center gap-1">
                                <CloudRain className="w-3 h-3" />
                                Loading holidays...
                            </div>
                        )}
                        {!loadingHolidays && autoHolidays.size > 0 && (
                            <div className="text-xs text-green-600">
                                {autoHolidays.size} public holidays
                            </div>
                        )}
                        {manualHolidays.size > 0 && (
                            <div className="text-xs text-purple-600">
                                +{manualHolidays.size} school holidays
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

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={termInfo.startDate}
                            max={termInfo.endDate}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Term: {termInfo.startDate} to {termInfo.endDate}
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

            {/* Frozen Message - Shows when date cannot have attendance */}
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

            {/* Holiday Actions - Only show for dates within term, not weekend */}
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
                    ) : isManualHoliday ? (
                        <button
                            onClick={handleRemoveHoliday}
                            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                        >
                            <Gift className="w-4 h-4" />
                            Remove Holiday
                        </button>
                    ) : isAutoHoliday && (
                        <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-2">
                            <CloudRain className="w-4 h-4" />
                            Public Holiday (Auto-detected)
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

            {/* Reminder Message - Only show when date is NOT frozen and attendance not recorded */}
            {selectedClass !== 'all' && !isFrozen && !hasAttendanceRecorded && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Don't forget to click <strong>Save Attendance</strong>! Unsaved attendance will be lost.</span>
                </div>
            )}

            {/* Success Message - When attendance has been recorded */}
            {selectedClass !== 'all' && !isFrozen && hasAttendanceRecorded && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Attendance has been recorded for {selectedDate}. You can make changes and save again if needed.</span>
                </div>
            )}

            <div className="flex justify-end gap-3">
                <button
                    onClick={handleSaveAttendance}
                    disabled={saving || selectedClass === 'all' || isFrozen}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                    <CheckCircle className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>

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
                                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={student.status}
                                                onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
                                                className={`px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${isFrozen
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                                                    : 'bg-white border-slate-300 hover:border-indigo-300'
                                                    }`}
                                                disabled={saving || isFrozen}
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
//     Lock
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

//     // Combined holidays (auto + manual)
//     const allHolidays = new Set([...autoHolidays, ...manualHolidays]);

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

//     const totalDays = calculateTotalDays();
//     const recordedDays = 0; // TODO: Connect to actual recorded dates
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
//                         frozenReason.type === 'public' ? 'bg-green-50 border border-green-200 text-green-700' :
//                             frozenReason.type === 'manual' ? 'bg-purple-50 border border-purple-200 text-purple-700' :
//                                 'bg-gray-50 border border-gray-200 text-gray-500'
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
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
//                             <p className="text-sm text-slate-500">Attendance Rate</p>
//                             <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
//                         </div>
//                         <TrendingUp className="w-8 h-8 text-indigo-600" />
//                     </div>
//                 </div>
//             </div>

//             {/* Reminder Message - Only show when date is NOT frozen */}
//             {selectedClass !== 'all' && !isFrozen && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>Don't forget to click <strong>Save Attendance</strong>! Unsaved attendance will be lost.</span>
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
//                                                 {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
//                                         <td className="px-4 py-3">
//                                             <select
//                                                 value={student.status}
//                                                 onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
//                                                 className={`px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${isFrozen
//                                                         ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
//                                                         : 'bg-white border-slate-300 hover:border-indigo-300'
//                                                     }`}
//                                                 disabled={saving || isFrozen}
//                                             >
//                                                 <option value="present">Present</option>
//                                                 <option value="absent">Absent</option>
//                                                 <option value="late">Late</option>
//                                                 <option value="excused">Excused</option>
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
//     Plus
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
//     // Term state
//     const [termInfo] = useState({
//         name: 'Term 1, 2026',
//         startDate: '2026-01-15',
//         endDate: '2026-04-10'
//     });

//     // Holiday states
//     const [autoHolidays, setAutoHolidays] = useState<Set<string>>(new Set()); // From calendar API
//     const [manualHolidays, setManualHolidays] = useState<Set<string>>(new Set()); // Teacher-added
//     const [markingHoliday, setMarkingHoliday] = useState(false);
//     const [loadingHolidays, setLoadingHolidays] = useState(false);

//     // Combined holidays (auto + manual)
//     const allHolidays = new Set([...autoHolidays, ...manualHolidays]);

//     // Fetch public holidays from calendar API
//     const fetchPublicHolidays = async () => {
//         setLoadingHolidays(true);
//         try {
//             const year = new Date(termInfo.startDate).getFullYear();
//             // Using Nager.Date API (free, no API key needed for basic usage)
//             // You can replace with your country's API
//             const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ZA`); // ZA for South Africa, change as needed
//             const data = await response.json();

//             const holidaySet = new Set<string>();
//             data.forEach((holiday: any) => {
//                 holidaySet.add(holiday.date);
//             });
//             setAutoHolidays(holidaySet);
//             console.log(`Loaded ${holidaySet.size} public holidays automatically`);
//         } catch (error) {
//             console.error('Failed to fetch public holidays:', error);
//             // Fallback: manually add common holidays if API fails
//             const fallbackHolidays = new Set<string>([
//                 '2026-01-01', // New Year's Day
//                 '2026-03-21', // Human Rights Day
//                 '2026-04-03', // Good Friday
//                 '2026-04-06', // Family Day
//                 '2026-04-27', // Freedom Day
//                 '2026-05-01', // Workers' Day
//                 '2026-06-16', // Youth Day
//                 '2026-08-09', // National Women's Day
//                 '2026-09-24', // Heritage Day
//                 '2026-12-16', // Day of Reconciliation
//                 '2026-12-25', // Christmas Day
//                 '2026-12-26', // Day of Goodwill
//             ]);
//             setAutoHolidays(fallbackHolidays);
//         } finally {
//             setLoadingHolidays(false);
//         }
//     };

//     // Load manual holidays from localStorage/backend
//     const loadManualHolidays = async () => {
//         try {
//             // Try to load from localStorage first (for demo)
//             const saved = localStorage.getItem('manualHolidays');
//             if (saved) {
//                 const holidays = JSON.parse(saved);
//                 setManualHolidays(new Set(holidays));
//             }

//             // TODO: Replace with actual API call to your backend
//             // const response = await fetch('/api/holidays/manual');
//             // const data = await response.json();
//             // setManualHolidays(new Set(data));
//         } catch (error) {
//             console.error('Failed to load manual holidays:', error);
//         }
//     };

//     // Save manual holiday to storage
//     const saveManualHoliday = (date: string) => {
//         const newManualHolidays = new Set(manualHolidays);
//         newManualHolidays.add(date);
//         setManualHolidays(newManualHolidays);

//         // Save to localStorage (for demo)
//         localStorage.setItem('manualHolidays', JSON.stringify([...newManualHolidays]));

//         // TODO: Send to backend API
//         // await fetch('/api/holidays/manual', { method: 'POST', body: JSON.stringify({ date }) });
//     };

//     // Remove manual holiday
//     const removeManualHoliday = (date: string) => {
//         const newManualHolidays = new Set(manualHolidays);
//         newManualHolidays.delete(date);
//         setManualHolidays(newManualHolidays);

//         // Update localStorage
//         localStorage.setItem('manualHolidays', JSON.stringify([...newManualHolidays]));

//         // TODO: Send to backend API
//         // await fetch('/api/holidays/manual', { method: 'DELETE', body: JSON.stringify({ date }) });
//     };

//     // Load holidays on mount
//     useEffect(() => {
//         fetchPublicHolidays();
//         loadManualHolidays();
//     }, []);

//     // Calculate total term days (Monday-Friday only, excluding ALL holidays)
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

//     const totalDays = calculateTotalDays();
//     const recordedDays = 0; // TODO: Connect to actual recorded dates from backend
//     const remainingDays = totalDays - recordedDays;

//     const filteredStudents = attendanceData.filter(s =>
//         (selectedClass === 'all' || s.classId === selectedClass) &&
//         (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     // Check if current date is a holiday or weekend
//     const isAutoHoliday = autoHolidays.has(selectedDate);
//     const isManualHoliday = manualHolidays.has(selectedDate);
//     const isHoliday = isAutoHoliday || isManualHoliday;
//     const dayOfWeek = new Date(selectedDate).getDay();
//     const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
//     const isDisabled = isHoliday || isWeekend;

//     // Get holiday type for display
//     const getHolidayType = () => {
//         if (isAutoHoliday) return 'Public Holiday (Auto-detected)';
//         if (isManualHoliday) return 'School Holiday (Manually added)';
//         return null;
//     };

//     // Handle marking manual holiday
//     const handleMarkAsHoliday = () => {
//         if (selectedClass === 'all') {
//             alert('Please select a specific class to mark holiday');
//             return;
//         }

//         if (isWeekend) {
//             alert('Weekends are already non-school days. No need to mark as holiday.');
//             return;
//         }

//         if (isAutoHoliday) {
//             alert(`${selectedDate} is already a public holiday (auto-detected). No need to mark manually.`);
//             return;
//         }

//         if (isManualHoliday) {
//             alert(`${selectedDate} is already marked as a manual holiday`);
//             return;
//         }

//         setMarkingHoliday(true);

//         // Simulate API call
//         setTimeout(() => {
//             saveManualHoliday(selectedDate);
//             alert(`${selectedDate} has been marked as a school holiday`);
//             setMarkingHoliday(false);
//         }, 500);
//     };

//     // Handle removing manual holiday
//     const handleRemoveHoliday = () => {
//         if (!isManualHoliday) {
//             alert(`${selectedDate} is not a manually added holiday. ${isAutoHoliday ? 'It is a public holiday and cannot be removed.' : ''}`);
//             return;
//         }

//         if (confirm(`Remove holiday status from ${selectedDate}?`)) {
//             removeManualHoliday(selectedDate);
//             alert(`${selectedDate} is no longer a holiday`);
//         }
//     };

//     return (
//         <>
//             {/* Term Stats Card */}
//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
//                 <div className="flex justify-between items-start mb-4">
//                     <div>
//                         <h3 className="text-lg font-bold text-indigo-900">{termInfo.name}</h3>
//                         <p className="text-sm text-indigo-600">Monday - Friday only | Holidays excluded</p>
//                     </div>
//                     <div className="text-right">
//                         <div className="text-xs text-indigo-500">
//                             {termInfo.startDate} to {termInfo.endDate}
//                         </div>
//                         {loadingHolidays && (
//                             <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
//                                 <CloudRain className="w-3 h-3" />
//                                 Loading holidays...
//                             </div>
//                         )}
//                         {!loadingHolidays && autoHolidays.size > 0 && (
//                             <div className="text-xs text-green-600 mt-1">
//                                 {autoHolidays.size} public holidays auto-detected
//                             </div>
//                         )}
//                     </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                     <div className="text-center">
//                         <p className="text-2xl font-bold text-indigo-800">{totalDays}</p>
//                         <p className="text-xs text-indigo-600">Total Days</p>
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
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         />
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

//             {/* Holiday Actions - Only show for manual holidays */}
//             {selectedClass !== 'all' && !isWeekend && (
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

//             {/* Holiday Warning with type */}
//             {isDisabled && selectedClass !== 'all' && (
//                 <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${isAutoHoliday ? 'bg-green-50 border border-green-200 text-green-700' :
//                         isManualHoliday ? 'bg-purple-50 border border-purple-200 text-purple-700' :
//                             'bg-gray-50 border border-gray-200 text-gray-500'
//                     }`}>
//                     {isAutoHoliday ? <CloudRain className="w-4 h-4 flex-shrink-0" /> : <Gift className="w-4 h-4 flex-shrink-0" />}
//                     <span>
//                         <strong>{getHolidayType() || (isWeekend ? 'Weekend' : '')}</strong> -
//                         {isHoliday ? ' No attendance required for this day.' : ' Attendance is only recorded Monday-Friday.'}
//                         {isAutoHoliday && ' This is a public holiday from the calendar.'}
//                         {isManualHoliday && ' You can remove this holiday using the button above.'}
//                     </span>
//                 </div>
//             )}

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
//                             <p className="text-sm text-slate-500">Attendance Rate</p>
//                             <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
//                         </div>
//                         <TrendingUp className="w-8 h-8 text-indigo-600" />
//                     </div>
//                 </div>
//             </div>

//             {/* Reminder Message */}
//             {selectedClass !== 'all' && !isDisabled && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>Don't forget to click <strong>Save Attendance</strong>! Unsaved attendance will be lost.</span>
//                 </div>
//             )}

//             <div className="flex justify-end gap-3">
//                 <button
//                     onClick={handleSaveAttendance}
//                     disabled={saving || selectedClass === 'all' || isDisabled}
//                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
//                 >
//                     <CheckCircle className="w-4 h-4" />
//                     {saving ? 'Saving...' : 'Save Attendance'}
//                 </button>

//                 <button
//                     onClick={handleMarkAllPresent}
//                     disabled={markingAll || selectedClass === 'all' || isDisabled}
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
//                                                 {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
//                                         <td className="px-4 py-3">
//                                             <select
//                                                 value={student.status}
//                                                 onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
//                                                 className={`px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${isDisabled
//                                                         ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
//                                                         : 'bg-white border-slate-300 hover:border-indigo-300'
//                                                     }`}
//                                                 disabled={saving || isDisabled}
//                                             >
//                                                 <option value="present">Present</option>
//                                                 <option value="absent">Absent</option>
//                                                 <option value="late">Late</option>
//                                                 <option value="excused">Excused</option>
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
// import React, { useState } from 'react';
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
//     Gift
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
//     // Term state - you can change these dates manually or fetch from API
//     const [termInfo] = useState({
//         name: 'Term 1, 2026',
//         startDate: '2026-01-15',
//         endDate: '2026-04-10'
//     });

//     // Holiday dates - can be added dynamically by teachers
//     const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set([]));
//     const [markingHoliday, setMarkingHoliday] = useState(false);

//     // Calculate total term days (Monday-Friday only, excluding holidays)
//     const calculateTotalDays = () => {
//         const start = new Date(termInfo.startDate);
//         const end = new Date(termInfo.endDate);
//         let total = 0;
//         let current = new Date(start);

//         while (current <= end) {
//             const dayOfWeek = current.getDay();
//             const dateStr = current.toISOString().split('T')[0];

//             // Count only Monday(1) to Friday(5), exclude holidays
//             if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidayDates.has(dateStr)) {
//                 total++;
//             }
//             current.setDate(current.getDate() + 1);
//         }
//         return total;
//     };

//     // Calculate recorded days (unique dates with attendance, Mon-Fri, not holidays)
//     const calculateRecordedDays = () => {
//         // TODO: Connect to actual recorded dates from backend
//         return 0;
//     };

//     // Mark current date as holiday
//     const handleMarkAsHoliday = () => {
//         if (selectedClass === 'all') {
//             alert('Please select a specific class to mark holiday');
//             return;
//         }

//         const dayOfWeek = new Date(selectedDate).getDay();
//         const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

//         if (isWeekend) {
//             alert('Weekends are already non-school days. No need to mark as holiday.');
//             return;
//         }

//         if (holidayDates.has(selectedDate)) {
//             alert(`${selectedDate} is already marked as a holiday`);
//             return;
//         }

//         setMarkingHoliday(true);

//         // TODO: Replace with actual API call
//         setTimeout(() => {
//             setHolidayDates(prev => new Set([...prev, selectedDate]));
//             alert(`${selectedDate} has been marked as a holiday`);
//             setMarkingHoliday(false);
//         }, 500);
//     };

//     // Remove holiday
//     const handleRemoveHoliday = () => {
//         if (!holidayDates.has(selectedDate)) {
//             alert(`${selectedDate} is not marked as a holiday`);
//             return;
//         }

//         if (confirm(`Remove holiday status from ${selectedDate}?`)) {
//             const newHolidayDates = new Set(holidayDates);
//             newHolidayDates.delete(selectedDate);
//             setHolidayDates(newHolidayDates);
//             alert(`${selectedDate} is no longer a holiday`);
//         }
//     };

//     const totalDays = calculateTotalDays();
//     const recordedDays = calculateRecordedDays();
//     const remainingDays = totalDays - recordedDays;

//     const filteredStudents = attendanceData.filter(s =>
//         (selectedClass === 'all' || s.classId === selectedClass) &&
//         (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     // Check if current date is a holiday or weekend
//     const isHoliday = holidayDates.has(selectedDate);
//     const dayOfWeek = new Date(selectedDate).getDay();
//     const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
//     const isDisabled = isHoliday || isWeekend;

//     return (
//         <>
//             {/* Term Stats Card */}
//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
//                 <div className="flex justify-between items-start mb-4">
//                     <div>
//                         <h3 className="text-lg font-bold text-indigo-900">{termInfo.name}</h3>
//                         <p className="text-sm text-indigo-600">Monday - Friday only | Holidays excluded</p>
//                     </div>
//                     <div className="text-right text-xs text-indigo-500">
//                         {termInfo.startDate} to {termInfo.endDate}
//                     </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                     <div className="text-center">
//                         <p className="text-2xl font-bold text-indigo-800">{totalDays}</p>
//                         <p className="text-xs text-indigo-600">Total Days</p>
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
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         />
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

//             {/* Holiday Actions */}
//             {selectedClass !== 'all' && !isWeekend && (
//                 <div className="flex gap-2">
//                     {!isHoliday ? (
//                         <button
//                             onClick={handleMarkAsHoliday}
//                             disabled={markingHoliday}
//                             className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
//                         >
//                             <Gift className="w-4 h-4" />
//                             {markingHoliday ? 'Marking...' : 'Mark as Holiday'}
//                         </button>
//                     ) : (
//                         <button
//                             onClick={handleRemoveHoliday}
//                             className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
//                         >
//                             <Gift className="w-4 h-4" />
//                             Remove Holiday
//                         </button>
//                     )}
//                 </div>
//             )}

//             {/* Holiday or Weekend Warning */}
//             {isDisabled && selectedClass !== 'all' && (
//                 <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${isHoliday ? 'bg-purple-50 border border-purple-200 text-purple-700' : 'bg-gray-50 border border-gray-200 text-gray-500'}`}>
//                     <Gift className="w-4 h-4 flex-shrink-0" />
//                     <span>
//                         <strong>{isHoliday ? 'Holiday' : 'Weekend'}</strong> -
//                         {isHoliday ? ' No attendance required for this day.' : ' Attendance is only recorded Monday-Friday.'}
//                         {isHoliday && ' You can remove the holiday using the button above.'}
//                     </span>
//                 </div>
//             )}

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
//                             <p className="text-sm text-slate-500">Attendance Rate</p>
//                             <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
//                         </div>
//                         <TrendingUp className="w-8 h-8 text-indigo-600" />
//                     </div>
//                 </div>
//             </div>

//             {/* Reminder Message - only show on weekdays that aren't holidays */}
//             {selectedClass !== 'all' && !isDisabled && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>Don't forget to click <strong>Save Attendance</strong>! Unsaved attendance will be lost.</span>
//                 </div>
//             )}

//             <div className="flex justify-end gap-3">
//                 <button
//                     onClick={handleSaveAttendance}
//                     disabled={saving || selectedClass === 'all' || isDisabled}
//                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
//                 >
//                     <CheckCircle className="w-4 h-4" />
//                     {saving ? 'Saving...' : 'Save Attendance'}
//                 </button>

//                 <button
//                     onClick={handleMarkAllPresent}
//                     disabled={markingAll || selectedClass === 'all' || isDisabled}
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
//                                                 {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
//                                         <td className="px-4 py-3">
//                                             <select
//                                                 value={student.status}
//                                                 onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
//                                                 className={`px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${isDisabled
//                                                         ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
//                                                         : 'bg-white border-slate-300 hover:border-indigo-300'
//                                                     }`}
//                                                 disabled={saving || isDisabled}
//                                             >
//                                                 <option value="present">Present</option>
//                                                 <option value="absent">Absent</option>
//                                                 <option value="late">Late</option>
//                                                 <option value="excused">Excused</option>
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
//     Gift
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
//     // Term state - you can change these dates manually or fetch from API
//     const [termInfo] = useState({
//         name: 'Term 1, 2026',
//         startDate: '2026-01-15',
//         endDate: '2026-04-10'
//     });

//     // Holiday dates - teachers can add dates here or fetch from API
//     const [holidayDates] = useState<Set<string>>(new Set([
//         // '2026-01-26', // Example: Republic Day
//         // '2026-03-17', // Example: Holi
//     ]));

//     // Calculate total term days (Monday-Friday only, excluding holidays)
//     const calculateTotalDays = () => {
//         const start = new Date(termInfo.startDate);
//         const end = new Date(termInfo.endDate);
//         let total = 0;
//         let current = new Date(start);

//         while (current <= end) {
//             const dayOfWeek = current.getDay();
//             const dateStr = current.toISOString().split('T')[0];

//             // Count only Monday(1) to Friday(5), exclude holidays
//             if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidayDates.has(dateStr)) {
//                 total++;
//             }
//             current.setDate(current.getDate() + 1);
//         }
//         return total;
//     };

//     // Calculate recorded days (unique dates with attendance, Mon-Fri, not holidays)
//     const calculateRecordedDays = () => {
//         const uniqueDates = new Set<string>();

//         attendanceData.forEach(student => {
//             // Only count if status is not 'present'? Actually any attendance record means day was recorded
//             if (student.status) {
//                 uniqueDates.add(selectedDate);
//             }
//         });

//         // For now, we need actual recorded dates from your backend
//         // This is a placeholder - you'll replace with actual data
//         // For demo, showing 0 until you connect real data
//         return 0;
//     };

//     const totalDays = calculateTotalDays();
//     const recordedDays = calculateRecordedDays();
//     const remainingDays = totalDays - recordedDays;

//     const filteredStudents = attendanceData.filter(s =>
//         (selectedClass === 'all' || s.classId === selectedClass) &&
//         (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     // Check if current date is a holiday
//     const isHoliday = holidayDates.has(selectedDate);
//     const dayOfWeek = new Date(selectedDate).getDay();
//     const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

//     return (
//         <>
//             {/* Term Stats Card */}
//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
//                 <div className="flex justify-between items-start mb-4">
//                     <div>
//                         <h3 className="text-lg font-bold text-indigo-900">{termInfo.name}</h3>
//                         <p className="text-sm text-indigo-600">Monday - Friday only | Holidays excluded</p>
//                     </div>
//                     <div className="text-right text-xs text-indigo-500">
//                         {termInfo.startDate} to {termInfo.endDate}
//                     </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4">
//                     <div className="text-center">
//                         <p className="text-2xl font-bold text-indigo-800">{totalDays}</p>
//                         <p className="text-xs text-indigo-600">Total Days</p>
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
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         />
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

//             {/* Holiday or Weekend Warning */}
//             {(isHoliday || isWeekend) && selectedClass !== 'all' && (
//                 <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${isHoliday ? 'bg-purple-50 border border-purple-200 text-purple-700' : 'bg-gray-50 border border-gray-200 text-gray-600'}`}>
//                     <Gift className="w-4 h-4 flex-shrink-0" />
//                     <span>
//                         <strong>{isHoliday ? 'Holiday' : 'Weekend'}</strong> -
//                         {isHoliday ? ' No attendance required for this day.' : ' Attendance is only recorded Monday-Friday.'}
//                     </span>
//                 </div>
//             )}

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
//                             <p className="text-sm text-slate-500">Attendance Rate</p>
//                             <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
//                         </div>
//                         <TrendingUp className="w-8 h-8 text-indigo-600" />
//                     </div>
//                 </div>
//             </div>

//             {/* Reminder Message - only show on weekdays that aren't holidays */}
//             {selectedClass !== 'all' && !isHoliday && !isWeekend && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>Don't forget to click <strong>Save Attendance</strong>! Unsaved attendance will be lost.</span>
//                 </div>
//             )}

//             <div className="flex justify-end gap-3">
//                 <button
//                     onClick={handleSaveAttendance}
//                     disabled={saving || selectedClass === 'all' || isHoliday || isWeekend}
//                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
//                 >
//                     <CheckCircle className="w-4 h-4" />
//                     {saving ? 'Saving...' : 'Save Attendance'}
//                 </button>

//                 <button
//                     onClick={handleMarkAllPresent}
//                     disabled={markingAll || selectedClass === 'all' || isHoliday || isWeekend}
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
//                                                 {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
//                                         <td className="px-4 py-3">
//                                             <select
//                                                 value={student.status}
//                                                 onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
//                                                 className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                                 disabled={saving || isHoliday || isWeekend}
//                                             >
//                                                 <option value="present">Present</option>
//                                                 <option value="absent">Absent</option>
//                                                 <option value="late">Late</option>
//                                                 <option value="excused">Excused</option>
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
// import React, { useState } from 'react';
// import {
//     Calendar,
//     Search,
//     Users,
//     TrendingUp,
//     UserCheck,
//     UserX,
//     Clock3,
//     AlertCircle,
//     CheckCircle
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
//     const filteredStudents = attendanceData.filter(s =>
//         (selectedClass === 'all' || s.classId === selectedClass) &&
//         (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     return (
//         <>
//             {/* Filters */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
//                         <input
//                             type="date"
//                             value={selectedDate}
//                             onChange={(e) => setSelectedDate(e.target.value)}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         />
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

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
//                             <p className="text-sm text-slate-500">Attendance Rate</p>
//                             <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
//                         </div>
//                         <TrendingUp className="w-8 h-8 text-indigo-600" />
//                     </div>
//                 </div>
//             </div>

//             {/* Reminder Message */}
//             {selectedClass !== 'all' && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-700 text-sm">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                     <span>Don't forget to click <strong>Save Attendance</strong>! Unsaved attendance will be lost.</span>
//                 </div>
//             )}

//             <div className="flex justify-end gap-3">
//                 <button
//                     onClick={handleSaveAttendance}
//                     disabled={saving || selectedClass === 'all'}
//                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-sm"
//                 >
//                     <CheckCircle className="w-4 h-4" />
//                     {saving ? 'Saving...' : 'Save Attendance'}
//                 </button>

//                 <button
//                     onClick={handleMarkAllPresent}
//                     disabled={markingAll || selectedClass === 'all'}
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
//                                                 {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
//                                         <td className="px-4 py-3">
//                                             <select
//                                                 value={student.status}
//                                                 onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
//                                                 className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                                 disabled={saving}
//                                             >
//                                                 <option value="present">Present</option>
//                                                 <option value="absent">Absent</option>
//                                                 <option value="late">Late</option>
//                                                 <option value="excused">Excused</option>
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