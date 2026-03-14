import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    BookOpen,
    Users,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Sun,
    Moon,
    Coffee,
    Bell
} from 'lucide-react';

interface TimetableSlot {
    id: string;
    subject: string;
    class: string;
    time: string;
    duration: string;
    room: string;
    teacher?: string;
}

interface DaySchedule {
    day: string;
    date: string;
    slots: TimetableSlot[];
}

interface Props {
    classes: any[];           // Classes teacher is assigned to
    subjects: any[];           // Subjects teacher teaches
    teacherId?: string;
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

    // Mock timetable data - In production, fetch from API
    const mockTimetable: DaySchedule[] = [
        {
            day: 'Monday',
            date: '2024-03-18',
            slots: [
                { id: '1', subject: 'Mathematics', class: 'Grade 8A', time: '08:00 - 09:00', duration: '1 hr', room: 'Room 101' },
                { id: '2', subject: 'Physics', class: 'Grade 8A', time: '09:15 - 10:15', duration: '1 hr', room: 'Lab 201' },
                { id: '3', subject: 'Mathematics', class: 'Grade 8B', time: '10:30 - 11:30', duration: '1 hr', room: 'Room 102' },
                { id: '4', subject: 'Break', class: '-', time: '11:30 - 12:30', duration: '1 hr', room: 'Staff Room' },
                { id: '5', subject: 'Mathematics', class: 'Grade 8C', time: '12:30 - 13:30', duration: '1 hr', room: 'Room 103' },
                { id: '6', subject: 'Physics', class: 'Grade 8B', time: '14:00 - 15:00', duration: '1 hr', room: 'Lab 201' },
            ]
        },
        {
            day: 'Tuesday',
            date: '2024-03-19',
            slots: [
                { id: '7', subject: 'Mathematics', class: 'Grade 8B', time: '08:00 - 09:00', duration: '1 hr', room: 'Room 102' },
                { id: '8', subject: 'Physics', class: 'Grade 8C', time: '09:15 - 10:15', duration: '1 hr', room: 'Lab 201' },
                { id: '9', subject: 'Mathematics', class: 'Grade 8A', time: '10:30 - 11:30', duration: '1 hr', room: 'Room 101' },
                { id: '10', subject: 'Break', class: '-', time: '11:30 - 12:30', duration: '1 hr', room: 'Staff Room' },
                { id: '11', subject: 'Department Meeting', class: '-', time: '14:00 - 15:00', duration: '1 hr', room: 'Conference Room' },
            ]
        },
        {
            day: 'Wednesday',
            date: '2024-03-20',
            slots: [
                { id: '12', subject: 'Mathematics', class: 'Grade 8C', time: '08:00 - 09:00', duration: '1 hr', room: 'Room 103' },
                { id: '13', subject: 'Physics', class: 'Grade 8A', time: '09:15 - 10:15', duration: '1 hr', room: 'Lab 201' },
                { id: '14', subject: 'Mathematics', class: 'Grade 8B', time: '10:30 - 11:30', duration: '1 hr', room: 'Room 102' },
                { id: '15', subject: 'Break', class: '-', time: '11:30 - 12:30', duration: '1 hr', room: 'Staff Room' },
                { id: '16', subject: 'Physics', class: 'Grade 8C', time: '14:00 - 15:00', duration: '1 hr', room: 'Lab 202' },
            ]
        },
        {
            day: 'Thursday',
            date: '2024-03-21',
            slots: [
                { id: '17', subject: 'Mathematics', class: 'Grade 8A', time: '08:00 - 09:00', duration: '1 hr', room: 'Room 101' },
                { id: '18', subject: 'Physics', class: 'Grade 8B', time: '09:15 - 10:15', duration: '1 hr', room: 'Lab 201' },
                { id: '19', subject: 'Mathematics', class: 'Grade 8C', time: '10:30 - 11:30', duration: '1 hr', room: 'Room 103' },
                { id: '20', subject: 'Break', class: '-', time: '11:30 - 12:30', duration: '1 hr', room: 'Staff Room' },
                { id: '21', subject: 'Physics', class: 'Grade 8A', time: '14:00 - 15:00', duration: '1 hr', room: 'Lab 201' },
            ]
        },
        {
            day: 'Friday',
            date: '2024-03-22',
            slots: [
                { id: '22', subject: 'Mathematics', class: 'Grade 8B', time: '08:00 - 09:00', duration: '1 hr', room: 'Room 102' },
                { id: '23', subject: 'Physics', class: 'Grade 8C', time: '09:15 - 10:15', duration: '1 hr', room: 'Lab 202' },
                { id: '24', subject: 'Mathematics', class: 'Grade 8A', time: '10:30 - 11:30', duration: '1 hr', room: 'Room 101' },
                { id: '25', subject: 'Break', class: '-', time: '11:30 - 12:30', duration: '1 hr', room: 'Staff Room' },
                { id: '26', subject: 'Staff Meeting', class: '-', time: '14:00 - 15:30', duration: '1.5 hrs', room: 'Staff Room' },
            ]
        }
    ];

    // Calculate week range
    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay() + 1); // Monday
        const end = new Date(start);
        end.setDate(start.getDate() + 4); // Friday

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

    const getSubjectColor = (subject: string) => {
        if (subject === 'Break') return 'bg-amber-100 border-amber-200 text-amber-800';
        if (subject.includes('Meeting')) return 'bg-purple-100 border-purple-200 text-purple-800';
        if (subject === 'Mathematics') return 'bg-blue-100 border-blue-200 text-blue-800';
        if (subject === 'Physics') return 'bg-green-100 border-green-200 text-green-800';
        if (subject === 'Chemistry') return 'bg-emerald-100 border-emerald-200 text-emerald-800';
        if (subject === 'Biology') return 'bg-teal-100 border-teal-200 text-teal-800';
        if (subject === 'English') return 'bg-indigo-100 border-indigo-200 text-indigo-800';
        if (subject === 'History') return 'bg-orange-100 border-orange-200 text-orange-800';
        if (subject === 'Geography') return 'bg-amber-100 border-amber-200 text-amber-800';
        return 'bg-slate-100 border-slate-200 text-slate-800';
    };

    const getTimeSlots = () => {
        const slots = [
            '08:00 - 09:00',
            '09:15 - 10:15',
            '10:30 - 11:30',
            '11:30 - 12:30',
            '12:30 - 13:30',
            '14:00 - 15:00',
            '15:15 - 16:15'
        ];
        return slots;
    };

    const getSlotForDayAndTime = (day: string, time: string) => {
        const dayData = mockTimetable.find(d => d.day === day);
        return dayData?.slots.find(s => s.time === time);
    };

    const calculateStats = () => {
        const allSlots = mockTimetable.flatMap(d => d.slots);
        const teachingSlots = allSlots.filter(s => s.subject !== 'Break' && !s.subject.includes('Meeting'));

        return {
            totalClasses: teachingSlots.length,
            uniqueClasses: new Set(teachingSlots.map(s => s.class)).size,
            uniqueSubjects: new Set(teachingSlots.map(s => s.subject)).size,
            breakCount: allSlots.filter(s => s.subject === 'Break').length,
            meetingCount: allSlots.filter(s => s.subject.includes('Meeting')).length
        };
    };

    const stats = calculateStats();

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
                        onClick={() => {/* Export functionality */ }}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
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
                            <Coffee className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Break/Meetings</p>
                            <p className="text-xl font-bold text-amber-600">{stats.breakCount + stats.meetingCount}</p>
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
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'week'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Week View
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'day'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Day View
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePreviousWeek}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <span className="text-sm font-medium text-slate-700">
                            {getWeekRange(selectedWeek)}
                        </span>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                        <button
                            onClick={handleCurrentWeek}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100"
                        >
                            Current Week
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                            <option value="all">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Timetable Grid */}
            {viewMode === 'week' ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-32">
                                        Time
                                    </th>
                                    {mockTimetable.map(day => (
                                        <th key={day.day} className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                                            <div>{day.day}</div>
                                            <div className="text-xs font-normal text-slate-400">{day.date}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {getTimeSlots().map(timeSlot => (
                                    <tr key={timeSlot} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-700">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {timeSlot}
                                            </div>
                                        </td>
                                        {mockTimetable.map(day => {
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
                                                            {slot.duration && (
                                                                <div className="text-xs opacity-75 mt-1">
                                                                    {slot.duration}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-slate-300 text-sm py-4">
                                                            —
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Day View */
                <div className="space-y-4">
                    {/* Day Selector */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedDay === day
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Day Schedule */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Sun className="w-5 h-5 text-amber-600" />
                            {selectedDay}'s Schedule
                        </h3>
                        <div className="space-y-3">
                            {mockTimetable
                                .find(d => d.day === selectedDay)
                                ?.slots.map(slot => (
                                    <div
                                        key={slot.id}
                                        className={`flex items-start gap-4 p-4 rounded-lg border ${getSubjectColor(slot.subject)}`}
                                    >
                                        <div className="w-24 text-sm font-medium">
                                            {slot.time}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{slot.subject}</div>
                                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {slot.class}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {slot.room}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {slot.duration}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Legend</h4>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                        <span className="text-xs text-slate-600">Mathematics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                        <span className="text-xs text-slate-600">Physics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-100 border border-amber-200 rounded"></div>
                        <span className="text-xs text-slate-600">Break</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
                        <span className="text-xs text-slate-600">Meetings</span>
                    </div>
                </div>
            </div>

            {/* Upcoming Alerts */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-indigo-900">Upcoming Today</h4>
                        <p className="text-sm text-indigo-700 mt-1">
                            Your next class is Mathematics with Grade 8A at 10:30 AM in Room 101
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherTimetable;