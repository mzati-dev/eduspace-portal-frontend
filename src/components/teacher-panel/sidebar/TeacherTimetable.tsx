import React, { useState, useEffect } from 'react';
import {
    Clock,
    BookOpen,
    Users,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Sun,
    Bell,
    RefreshCw
} from 'lucide-react';
import {
    fetchTeacherTimetable,
    fetchTeacherDayTimetable,
    fetchTimetableStats,
    exportTimetable,
    fetchUpcomingAlerts,
    DaySchedule,
    TimetableStats
} from '@/services/timetableService';

interface Props {
    classes: any[];
    subjects: any[];
    teacherId: string;
    teacherName?: string;
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherTimetable: React.FC<Props> = ({
    classes,
    subjects,
    teacherId,
    teacherName,
    showMessage
}) => {
    const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDay, setSelectedDay] = useState<string>('Monday');
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [timetable, setTimetable] = useState<DaySchedule[]>([]);
    const [dayTimetable, setDayTimetable] = useState<DaySchedule | null>(null);
    const [stats, setStats] = useState<TimetableStats>({
        totalClasses: 0,
        uniqueClasses: 0,
        uniqueSubjects: 0,
        breakCount: 0,
        meetingCount: 0,
        weeklyHours: 0
    });
    const [alerts, setAlerts] = useState<any[]>([]);
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

    const getWeekStartDate = (date: Date): string => {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay() + 1);
        return start.toISOString().split('T')[0];
    };

    const getDateForDay = (dayName: string): string => {
        const start = new Date(selectedWeek);
        start.setDate(selectedWeek.getDate() - selectedWeek.getDay() + 1);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayIndex = days.indexOf(dayName);
        const targetDate = new Date(start);
        targetDate.setDate(start.getDate() + dayIndex);
        return targetDate.toISOString().split('T')[0];
    };

    const loadTimetableData = async () => {
        setLoading(true);
        try {
            const weekStart = getWeekStartDate(selectedWeek);
            const [timetableData, statsData] = await Promise.all([
                fetchTeacherTimetable(teacherId, weekStart),
                fetchTimetableStats(teacherId, weekStart)
            ]);
            setTimetable(timetableData);
            setStats(statsData);
        } catch (error) {
            showMessage('Failed to load timetable', true);
        } finally {
            setLoading(false);
        }
    };

    const loadDayData = async () => {
        try {
            const date = getDateForDay(selectedDay);
            const data = await fetchTeacherDayTimetable(teacherId, date);
            setDayTimetable(data);
        } catch (error) {
            showMessage('Failed to load day schedule', true);
        }
    };

    const loadAlerts = async () => {
        try {
            const data = await fetchUpcomingAlerts(teacherId);
            setAlerts(data);
        } catch (error) {
            console.error('Failed to load alerts:', error);
        }
    };

    const handleRefresh = async () => {
        await loadTimetableData();
        if (viewMode === 'day') await loadDayData();
        await loadAlerts();
        showMessage('Timetable refreshed');
    };

    useEffect(() => {
        if (teacherId) {
            loadTimetableData();
            loadAlerts();
        }
    }, [teacherId, selectedWeek]);

    useEffect(() => {
        if (viewMode === 'day' && selectedDay) {
            loadDayData();
        }
    }, [viewMode, selectedDay, teacherId, selectedWeek]);

    const handleExport = async (format: 'pdf' | 'excel') => {
        setExporting(true);
        try {
            const weekStart = getWeekStartDate(selectedWeek);
            const blob = await exportTimetable(teacherId, format, weekStart);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `timetable-${weekStart}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
            link.click();
            window.URL.revokeObjectURL(url);
            showMessage(`Timetable exported as ${format.toUpperCase()}`);
        } catch (error: any) {
            showMessage(error.message || 'Failed to export timetable', true);
        } finally {
            setExporting(false);
        }
    };

    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay() + 1);
        const end = new Date(start);
        end.setDate(start.getDate() + 4);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    };

    const handlePreviousWeek = () => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(selectedWeek.getDate() - 7);
        setSelectedWeek(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(selectedWeek.getDate() + 7);
        setSelectedWeek(newDate);
    };

    const handleCurrentWeek = () => {
        setSelectedWeek(new Date());
    };

    const getSubjectColor = (subjectName: string) => {
        const subject = subjects.find(s => s.name === subjectName);
        if (!subject) return 'bg-slate-100 border-slate-200 text-slate-800';

        const colors = [
            'bg-blue-100 border-blue-200 text-blue-800',
            'bg-green-100 border-green-200 text-green-800',
            'bg-purple-100 border-purple-200 text-purple-800',
            'bg-amber-100 border-amber-200 text-amber-800',
            'bg-indigo-100 border-indigo-200 text-indigo-800',
            'bg-pink-100 border-pink-200 text-pink-800',
            'bg-teal-100 border-teal-200 text-teal-800',
            'bg-orange-100 border-orange-200 text-orange-800'
        ];
        const colorIndex = subjectName.length % colors.length;
        return colors[colorIndex];
    };

    const getTimeSlots = () => {
        if (timetable.length === 0) return [];
        const allTimes = new Set<string>();
        timetable.forEach(day => {
            day.slots.forEach(slot => {
                allTimes.add(slot.time);
            });
        });
        return Array.from(allTimes).sort();
    };

    const getSlotForDayAndTime = (day: string, time: string) => {
        const dayData = timetable.find(d => d.day === day);
        return dayData?.slots.find(s => s.time === time);
    };

    const filteredTimetable = selectedClassFilter === 'all'
        ? timetable
        : timetable.map(day => ({
            ...day,
            slots: day.slots.filter(slot => slot.classId === selectedClassFilter)
        })).filter(day => day.slots.length > 0);

    const timeSlots = getTimeSlots();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Timetable</h2>
                    <p className="text-slate-500">View your weekly teaching schedule</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={exporting}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Classes</p>
                            <p className="text-xl font-bold text-slate-800">{stats.totalClasses}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Classes Taught</p>
                            <p className="text-xl font-bold text-green-600">{stats.uniqueClasses}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Subjects</p>
                            <p className="text-xl font-bold text-purple-600">{stats.uniqueSubjects}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Weekly Hours</p>
                            <p className="text-xl font-bold text-amber-600">{stats.weeklyHours}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === 'week' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            Week View
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === 'day' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            Day View
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePreviousWeek} className="p-2 hover:bg-slate-100 rounded-lg">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium">{getWeekRange(selectedWeek)}</span>
                        <button onClick={handleNextWeek} className="p-2 hover:bg-slate-100 rounded-lg">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button onClick={handleCurrentWeek} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                            Current Week
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={selectedClassFilter}
                            onChange={(e) => setSelectedClassFilter(e.target.value)}
                            className="px-3 py-1.5 border rounded-lg text-sm"
                        >
                            <option value="all">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Week View */}
            {!loading && viewMode === 'week' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {filteredTimetable.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No classes scheduled for this week</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-32">Time</th>
                                        {filteredTimetable.map(day => (
                                            <th key={day.day} className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                                                <div>{day.day}</div>
                                                <div className="text-xs font-normal text-slate-400">{day.date}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {timeSlots.map(timeSlot => (
                                        <tr key={timeSlot} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {timeSlot}
                                                </div>
                                            </td>
                                            {filteredTimetable.map(day => {
                                                const slot = getSlotForDayAndTime(day.day, timeSlot);
                                                return (
                                                    <td key={`${day.day}-${timeSlot}`} className="px-4 py-2">
                                                        {slot ? (
                                                            <div className={`p-2 rounded-lg border ${getSubjectColor(slot.subject)}`}>
                                                                <div className="font-medium text-sm">{slot.subject}</div>
                                                                <div className="flex items-center gap-1 text-xs mt-1">
                                                                    <Users className="w-3 h-3" />
                                                                    <span>{slot.class}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs mt-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span>{slot.room}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-slate-300 text-sm py-4">—</div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Day View */}
            {!loading && viewMode === 'day' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${selectedDay === day ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Sun className="w-5 h-5 text-amber-600" />
                            {selectedDay}'s Schedule
                        </h3>
                        {!dayTimetable || dayTimetable.slots.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No classes scheduled for {selectedDay}</div>
                        ) : (
                            <div className="space-y-3">
                                {dayTimetable.slots.map(slot => (
                                    <div key={slot.id} className={`flex items-start gap-4 p-4 rounded-lg border ${getSubjectColor(slot.subject)}`}>
                                        <div className="w-24 text-sm font-medium">{slot.time}</div>
                                        <div className="flex-1">
                                            <div className="font-medium">{slot.subject}</div>
                                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{slot.class}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{slot.room}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-indigo-900">Upcoming</h4>
                            <p className="text-sm text-indigo-700 mt-1">{alerts[0]?.message || 'Your next class is coming up soon'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherTimetable;


// import React, { useState, useEffect } from 'react';
// import {
//     Calendar,
//     Clock,
//     BookOpen,
//     Users,
//     MapPin,
//     ChevronLeft,
//     ChevronRight,
//     Download,
//     Filter,
//     Sun,
//     Moon,
//     Coffee,
//     Bell
// } from 'lucide-react';
// import {
//     fetchTeacherTimetable,
//     fetchTeacherDayTimetable,
//     fetchTimetableStats,
//     exportTimetable,
//     fetchUpcomingAlerts,
//     DaySchedule,
//     TimetableSlot,
//     TimetableStats
// } from '@/services/timetableService';

// interface Props {
//     classes: any[];           // Classes teacher is assigned to
//     subjects: any[];           // Subjects teacher teaches
//     teacherId: string;
//     teacherName?: string;
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const TeacherTimetable: React.FC<Props> = ({
//     classes,
//     subjects,
//     teacherId,
//     teacherName,
//     showMessage
// }) => {
//     const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
//     const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
//     const [selectedDay, setSelectedDay] = useState<string>('Monday');
//     const [loading, setLoading] = useState(false);
//     const [exporting, setExporting] = useState(false);

//     // Real data states
//     const [timetable, setTimetable] = useState<DaySchedule[]>([]);
//     const [dayTimetable, setDayTimetable] = useState<DaySchedule | null>(null);
//     const [stats, setStats] = useState<TimetableStats>({
//         totalClasses: 0,
//         uniqueClasses: 0,
//         uniqueSubjects: 0,
//         breakCount: 0,
//         meetingCount: 0,
//         weeklyHours: 0
//     });
//     const [alerts, setAlerts] = useState<any[]>([]);
//     const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

//     // Load data on mount and when week changes
//     useEffect(() => {
//         loadTimetableData();
//         loadAlerts();
//     }, [teacherId, selectedWeek]);

//     // Load day view when selected day changes
//     useEffect(() => {
//         if (viewMode === 'day' && selectedDay) {
//             loadDayData();
//         }
//     }, [viewMode, selectedDay, teacherId]);

//     const getWeekStartDate = (date: Date): string => {
//         const start = new Date(date);
//         start.setDate(date.getDate() - date.getDay() + 1); // Monday
//         return start.toISOString().split('T')[0];
//     };

//     const getDateForDay = (dayName: string): string => {
//         const start = new Date(selectedWeek);
//         start.setDate(selectedWeek.getDate() - selectedWeek.getDay() + 1); // Monday

//         const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
//         const dayIndex = days.indexOf(dayName);

//         const targetDate = new Date(start);
//         targetDate.setDate(start.getDate() + dayIndex);

//         return targetDate.toISOString().split('T')[0];
//     };

//     const loadTimetableData = async () => {
//         setLoading(true);
//         try {
//             const weekStart = getWeekStartDate(selectedWeek);

//             const [timetableData, statsData] = await Promise.all([
//                 fetchTeacherTimetable(teacherId, weekStart),
//                 fetchTimetableStats(teacherId, weekStart)
//             ]);

//             setTimetable(timetableData);
//             setStats(statsData);
//         } catch (error) {
//             showMessage('Failed to load timetable', true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadDayData = async () => {
//         try {
//             const date = getDateForDay(selectedDay);
//             const data = await fetchTeacherDayTimetable(teacherId, date);
//             setDayTimetable(data);
//         } catch (error) {
//             showMessage('Failed to load day schedule', true);
//         }
//     };

//     const loadAlerts = async () => {
//         try {
//             const data = await fetchUpcomingAlerts(teacherId);
//             setAlerts(data);
//         } catch (error) {
//             console.error('Failed to load alerts:', error);
//         }
//     };

//     const handleExport = async (format: 'pdf' | 'excel') => {
//         setExporting(true);
//         try {
//             const weekStart = getWeekStartDate(selectedWeek);
//             const blob = await exportTimetable(teacherId, format, weekStart);

//             // Download the file
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = `timetable-${weekStart}.${format}`;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);

//             showMessage(`Timetable exported as ${format.toUpperCase()}`);
//         } catch (error: any) {
//             showMessage(error.message || 'Failed to export timetable', true);
//         } finally {
//             setExporting(false);
//         }
//     };

//     // Calculate week range
//     const getWeekRange = (date: Date) => {
//         const start = new Date(date);
//         start.setDate(date.getDate() - date.getDay() + 1); // Monday
//         const end = new Date(start);
//         end.setDate(start.getDate() + 4); // Friday

//         return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
//     };

//     const handlePreviousWeek = () => {
//         const newDate = new Date(selectedWeek);
//         newDate.setDate(selectedWeek.getDate() - 7);
//         setSelectedWeek(newDate);
//     };

//     const handleNextWeek = () => {
//         const newDate = new Date(selectedWeek);
//         newDate.setDate(selectedWeek.getDate() + 7);
//         setSelectedWeek(newDate);
//     };

//     const handleCurrentWeek = () => {
//         setSelectedWeek(new Date());
//     };

//     const getSubjectColor = (subject: string) => {
//         if (subject === 'Break') return 'bg-amber-100 border-amber-200 text-amber-800';
//         if (subject.includes('Meeting')) return 'bg-purple-100 border-purple-200 text-purple-800';
//         if (subject === 'Mathematics') return 'bg-blue-100 border-blue-200 text-blue-800';
//         if (subject === 'Physics') return 'bg-green-100 border-green-200 text-green-800';
//         if (subject === 'Chemistry') return 'bg-emerald-100 border-emerald-200 text-emerald-800';
//         if (subject === 'Biology') return 'bg-teal-100 border-teal-200 text-teal-800';
//         if (subject === 'English') return 'bg-indigo-100 border-indigo-200 text-indigo-800';
//         if (subject === 'History') return 'bg-orange-100 border-orange-200 text-orange-800';
//         if (subject === 'Geography') return 'bg-amber-100 border-amber-200 text-amber-800';
//         return 'bg-slate-100 border-slate-200 text-slate-800';
//     };

//     const getTimeSlots = () => {
//         const slots = [
//             '08:00 - 09:00',
//             '09:15 - 10:15',
//             '10:30 - 11:30',
//             '11:30 - 12:30',
//             '12:30 - 13:30',
//             '14:00 - 15:00',
//             '15:15 - 16:15'
//         ];
//         return slots;
//     };

//     const getSlotForDayAndTime = (day: string, time: string) => {
//         const dayData = timetable.find(d => d.day === day);
//         return dayData?.slots.find(s => s.time === time);
//     };

//     const filteredTimetable = selectedClassFilter === 'all'
//         ? timetable
//         : timetable.map(day => ({
//             ...day,
//             slots: day.slots.filter(slot => slot.classId === selectedClassFilter)
//         })).filter(day => day.slots.length > 0);

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">My Timetable</h2>
//                     <p className="text-slate-500">View your weekly teaching schedule</p>
//                 </div>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => handleExport('pdf')}
//                         disabled={exporting || loading}
//                         className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
//                     >
//                         <Download className="w-4 h-4" />
//                         {exporting ? 'Exporting...' : 'Export PDF'}
//                     </button>
//                     <button
//                         onClick={() => handleExport('excel')}
//                         disabled={exporting || loading}
//                         className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
//                     >
//                         <Download className="w-4 h-4" />
//                         {exporting ? 'Exporting...' : 'Export Excel'}
//                     </button>
//                 </div>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-blue-100 rounded-lg">
//                             <BookOpen className="w-5 h-5 text-blue-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Total Classes</p>
//                             <p className="text-xl font-bold text-slate-800">{stats.totalClasses}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-green-100 rounded-lg">
//                             <Users className="w-5 h-5 text-green-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Classes Taught</p>
//                             <p className="text-xl font-bold text-green-600">{stats.uniqueClasses}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-purple-100 rounded-lg">
//                             <BookOpen className="w-5 h-5 text-purple-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Subjects</p>
//                             <p className="text-xl font-bold text-purple-600">{stats.uniqueSubjects}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-amber-100 rounded-lg">
//                             <Clock className="w-5 h-5 text-amber-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Weekly Hours</p>
//                             <p className="text-xl font-bold text-amber-600">{stats.weeklyHours}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* View Controls */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                 <div className="flex flex-wrap items-center justify-between gap-4">
//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={() => setViewMode('week')}
//                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'week'
//                                 ? 'bg-indigo-600 text-white'
//                                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                 }`}
//                         >
//                             Week View
//                         </button>
//                         <button
//                             onClick={() => setViewMode('day')}
//                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'day'
//                                 ? 'bg-indigo-600 text-white'
//                                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                 }`}
//                         >
//                             Day View
//                         </button>
//                     </div>

//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={handlePreviousWeek}
//                             className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                         >
//                             <ChevronLeft className="w-5 h-5 text-slate-600" />
//                         </button>
//                         <span className="text-sm font-medium text-slate-700">
//                             {getWeekRange(selectedWeek)}
//                         </span>
//                         <button
//                             onClick={handleNextWeek}
//                             className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                         >
//                             <ChevronRight className="w-5 h-5 text-slate-600" />
//                         </button>
//                         <button
//                             onClick={handleCurrentWeek}
//                             className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100"
//                         >
//                             Current Week
//                         </button>
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <Filter className="w-4 h-4 text-slate-400" />
//                         <select
//                             value={selectedClassFilter}
//                             onChange={(e) => setSelectedClassFilter(e.target.value)}
//                             className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                         >
//                             <option value="all">All Classes</option>
//                             {classes.map(cls => (
//                                 <option key={cls.id} value={cls.id}>{cls.name}</option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//             </div>

//             {/* Loading State */}
//             {loading && (
//                 <div className="bg-white rounded-xl p-12 text-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
//                     <p className="text-slate-500 mt-2">Loading timetable...</p>
//                 </div>
//             )}

//             {/* Timetable Grid */}
//             {!loading && viewMode === 'week' && (
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                     {filteredTimetable.length === 0 ? (
//                         <div className="p-12 text-center text-slate-500">
//                             No classes scheduled for this week
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="w-full min-w-[800px]">
//                                 <thead>
//                                     <tr className="bg-slate-50">
//                                         <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-32">
//                                             Time
//                                         </th>
//                                         {filteredTimetable.map(day => (
//                                             <th key={day.day} className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
//                                                 <div>{day.day}</div>
//                                                 <div className="text-xs font-normal text-slate-400">{day.date}</div>
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {getTimeSlots().map(timeSlot => (
//                                         <tr key={timeSlot} className="hover:bg-slate-50">
//                                             <td className="px-4 py-3 text-sm font-medium text-slate-700">
//                                                 <div className="flex items-center gap-2">
//                                                     <Clock className="w-4 h-4 text-slate-400" />
//                                                     {timeSlot}
//                                                 </div>
//                                             </td>
//                                             {filteredTimetable.map(day => {
//                                                 const slot = getSlotForDayAndTime(day.day, timeSlot);
//                                                 return (
//                                                     <td key={`${day.day}-${timeSlot}`} className="px-4 py-2">
//                                                         {slot ? (
//                                                             <div className={`p-2 rounded-lg border ${getSubjectColor(slot.subject)}`}>
//                                                                 <div className="font-medium text-sm">{slot.subject}</div>
//                                                                 <div className="flex items-center gap-1 text-xs mt-1">
//                                                                     <Users className="w-3 h-3" />
//                                                                     <span>{slot.class}</span>
//                                                                 </div>
//                                                                 <div className="flex items-center gap-1 text-xs mt-1">
//                                                                     <MapPin className="w-3 h-3" />
//                                                                     <span>{slot.room}</span>
//                                                                 </div>
//                                                                 {slot.duration && (
//                                                                     <div className="text-xs opacity-75 mt-1">
//                                                                         {slot.duration}
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         ) : (
//                                                             <div className="text-center text-slate-300 text-sm py-4">
//                                                                 —
//                                                             </div>
//                                                         )}
//                                                     </td>
//                                                 );
//                                             })}
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Day View */}
//             {!loading && viewMode === 'day' && (
//                 <div className="space-y-4">
//                     {/* Day Selector */}
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                         <div className="flex gap-2 overflow-x-auto pb-2">
//                             {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
//                                 <button
//                                     key={day}
//                                     onClick={() => setSelectedDay(day)}
//                                     className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedDay === day
//                                         ? 'bg-indigo-600 text-white'
//                                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                         }`}
//                                 >
//                                     {day}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Day Schedule */}
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                         <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                             <Sun className="w-5 h-5 text-amber-600" />
//                             {selectedDay}'s Schedule
//                         </h3>
//                         {!dayTimetable || dayTimetable.slots.length === 0 ? (
//                             <div className="text-center py-8 text-slate-500">
//                                 No classes scheduled for {selectedDay}
//                             </div>
//                         ) : (
//                             <div className="space-y-3">
//                                 {dayTimetable.slots.map(slot => (
//                                     <div
//                                         key={slot.id}
//                                         className={`flex items-start gap-4 p-4 rounded-lg border ${getSubjectColor(slot.subject)}`}
//                                     >
//                                         <div className="w-24 text-sm font-medium">
//                                             {slot.time}
//                                         </div>
//                                         <div className="flex-1">
//                                             <div className="font-medium">{slot.subject}</div>
//                                             <div className="flex flex-wrap gap-4 mt-2 text-sm">
//                                                 <span className="flex items-center gap-1">
//                                                     <Users className="w-4 h-4" />
//                                                     {slot.class}
//                                                 </span>
//                                                 <span className="flex items-center gap-1">
//                                                     <MapPin className="w-4 h-4" />
//                                                     {slot.room}
//                                                 </span>
//                                                 <span className="flex items-center gap-1">
//                                                     <Clock className="w-4 h-4" />
//                                                     {slot.duration}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Legend */}
//             {/* Legend */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                 <h4 className="text-sm font-medium text-slate-700 mb-3">Subject Colors</h4>
//                 <div className="flex flex-wrap gap-4">
//                     {/* Dynamic subjects from props */}
//                     {subjects.map(subject => {
//                         // Generate a consistent color based on subject name
//                         const colors = [
//                             'bg-blue-100 border-blue-200 text-blue-800',
//                             'bg-green-100 border-green-200 text-green-800',
//                             'bg-purple-100 border-purple-200 text-purple-800',
//                             'bg-amber-100 border-amber-200 text-amber-800',
//                             'bg-indigo-100 border-indigo-200 text-indigo-800',
//                             'bg-pink-100 border-pink-200 text-pink-800',
//                             'bg-teal-100 border-teal-200 text-teal-800',
//                             'bg-orange-100 border-orange-200 text-orange-800'
//                         ];
//                         const colorIndex = subject.name.length % colors.length;

//                         return (
//                             <div key={subject.id} className="flex items-center gap-2">
//                                 <div className={`w-4 h-4 rounded ${colors[colorIndex].split(' ')[0]}`}></div>
//                                 <span className="text-xs text-slate-600">{subject.name}</span>
//                             </div>
//                         );
//                     })}
//                     {/* Always include Break and Meetings */}
//                     <div className="flex items-center gap-2">
//                         <div className="w-4 h-4 bg-amber-100 border border-amber-200 rounded"></div>
//                         <span className="text-xs text-slate-600">Break</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
//                         <span className="text-xs text-slate-600">Meetings</span>
//                     </div>
//                 </div>
//             </div>

//             {/* Upcoming Alerts */}
//             {alerts.length > 0 && (
//                 <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
//                     <div className="flex items-start gap-3">
//                         <Bell className="w-5 h-5 text-indigo-600 mt-0.5" />
//                         <div>
//                             <h4 className="font-medium text-indigo-900">Upcoming Today</h4>
//                             <p className="text-sm text-indigo-700 mt-1">
//                                 {alerts[0]?.message || 'Your next class is coming up soon'}
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TeacherTimetable;