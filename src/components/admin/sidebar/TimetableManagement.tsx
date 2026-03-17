import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    BookOpen,
    Users,
    MapPin,
    Plus,
    Edit2,
    Trash2,
    Save,
    Download,
    Upload,
    Copy,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    period: number;
}

interface Teacher {
    id: string;
    name: string;
}

interface Subject {
    id: string;
    name: string;
}

interface Class {
    id: string;
    name: string;
    academic_year: string;
    term: string;
}

interface TimetableEntry {
    id: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    period: number;
    classId: string;
    subjectId: string;
    teacherId: string;
    room: string;
    startTime: string;
    endTime: string;
}

interface Props {
    classes: Class[];
    teachers: Teacher[];
    subjects: Subject[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const TimetableManagement: React.FC<Props> = ({
    classes,
    teachers,
    subjects,
    showMessage
}) => {
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
    const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
    const [editMode, setEditMode] = useState<boolean>(false);
    const [showEntryModal, setShowEntryModal] = useState<boolean>(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
    const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);

    // Mock data - In production, fetch from API
    const [entries, setEntries] = useState<TimetableEntry[]>([
        {
            id: '1',
            day: 'Monday',
            period: 1,
            classId: '1',
            subjectId: '1',
            teacherId: '1',
            room: 'Room 101',
            startTime: '08:00',
            endTime: '09:00'
        },
        {
            id: '2',
            day: 'Monday',
            period: 2,
            classId: '1',
            subjectId: '2',
            teacherId: '2',
            room: 'Lab 201',
            startTime: '09:15',
            endTime: '10:15'
        },
        {
            id: '3',
            day: 'Tuesday',
            period: 1,
            classId: '1',
            subjectId: '1',
            teacherId: '1',
            room: 'Room 101',
            startTime: '08:00',
            endTime: '09:00'
        }
    ]);

    const timeSlots: TimeSlot[] = [
        { id: '1', period: 1, startTime: '08:00', endTime: '09:00' },
        { id: '2', period: 2, startTime: '09:15', endTime: '10:15' },
        { id: '3', period: 3, startTime: '10:30', endTime: '11:30' },
        { id: '4', period: 4, startTime: '11:30', endTime: '12:30' },
        { id: '5', period: 5, startTime: '12:30', endTime: '13:30' },
        { id: '6', period: 6, startTime: '14:00', endTime: '15:00' },
        { id: '7', period: 7, startTime: '15:15', endTime: '16:15' },
    ];

    const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
    ];

    const getEntryForSlot = (day: string, period: number) => {
        return entries.find(e => e.day === day && e.period === period && e.classId === selectedClass);
    };

    const getSubjectName = (subjectId: string) => {
        return subjects.find(s => s.id === subjectId)?.name || 'Unknown';
    };

    const getTeacherName = (teacherId: string) => {
        return teachers.find(t => t.id === teacherId)?.name || 'Unknown';
    };

    const handleAddEntry = (day: string, period: number) => {
        setEditingEntry({
            id: '',
            day: day as any,
            period,
            classId: selectedClass,
            subjectId: '',
            teacherId: '',
            room: '',
            startTime: timeSlots[period - 1].startTime,
            endTime: timeSlots[period - 1].endTime
        });
        setShowEntryModal(true);
    };

    const handleEditEntry = (entry: TimetableEntry) => {
        setEditingEntry(entry);
        setShowEntryModal(true);
    };

    const handleDeleteEntry = (entryId: string) => {
        if (confirm('Are you sure you want to delete this timetable entry?')) {
            setEntries(prev => prev.filter(e => e.id !== entryId));
            showMessage('Timetable entry deleted successfully');
        }
    };

    const handleSaveEntry = () => {
        if (!editingEntry) return;

        if (!editingEntry.subjectId || !editingEntry.teacherId || !editingEntry.room) {
            showMessage('Please fill in all fields', true);
            return;
        }

        if (editingEntry.id) {
            // Update existing entry
            setEntries(prev => prev.map(e =>
                e.id === editingEntry.id ? editingEntry : e
            ));
            showMessage('Timetable entry updated successfully');
        } else {
            // Add new entry
            const newEntry = {
                ...editingEntry,
                id: Date.now().toString()
            };
            setEntries(prev => [...prev, newEntry]);
            showMessage('Timetable entry added successfully');
        }

        setShowEntryModal(false);
        setEditingEntry(null);
    };

    const handleCopyWeek = () => {
        if (confirm('Copy this week\'s timetable to next week?')) {
            // Logic to copy timetable
            showMessage('Timetable copied successfully');
        }
    };

    const handlePublishTimetable = () => {
        if (!selectedClass) {
            showMessage('Please select a class first', true);
            return;
        }
        // Logic to publish timetable
        showMessage(`Timetable published for ${classes.find(c => c.id === selectedClass)?.name}`);
    };

    const handleExportTimetable = () => {
        if (!selectedClass) {
            showMessage('Please select a class first', true);
            return;
        }
        // Logic to export timetable as PDF/Excel
        showMessage('Timetable exported successfully');
    };

    const handleImportTimetable = () => {
        // Logic to import timetable from file
        showMessage('Timetable imported successfully');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Timetable Management</h2>
                    <p className="text-slate-500">Create and manage class timetables</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleImportTimetable}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Import
                    </button>
                    <button
                        onClick={handleExportTimetable}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handlePublishTimetable}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Publish
                    </button>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
                        <select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Week</label>
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <input
                                type="week"
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-600" />
                            </button>
                            <button
                                onClick={handleCopyWeek}
                                className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 flex items-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Copy Week
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${editMode
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        {editMode ? (
                            <span className="flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Done Editing
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Edit2 className="w-4 h-4" />
                                Edit Timetable
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Timetable Grid */}
            {selectedClass ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-32">
                                        Time
                                    </th>
                                    {days.map(day => (
                                        <th key={day} className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {timeSlots.map(slot => (
                                    <tr key={slot.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-700">
                                            <div>
                                                <div>{slot.startTime} - {slot.endTime}</div>
                                                <div className="text-xs text-slate-400">Period {slot.period}</div>
                                            </div>
                                        </td>
                                        {days.map(day => {
                                            const entry = getEntryForSlot(day, slot.period);
                                            return (
                                                <td key={`${day}-${slot.period}`} className="px-4 py-2">
                                                    {entry ? (
                                                        <div className={`p-2 rounded-lg border ${editMode ? 'cursor-pointer hover:shadow-md' : ''}`}
                                                            onClick={() => editMode && handleEditEntry(entry)}
                                                        >
                                                            <div className="font-medium text-sm">{getSubjectName(entry.subjectId)}</div>
                                                            <div className="flex items-center gap-1 text-xs mt-1 text-slate-600">
                                                                <Users className="w-3 h-3" />
                                                                <span>{getTeacherName(entry.teacherId)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs mt-1 text-slate-600">
                                                                <MapPin className="w-3 h-3" />
                                                                <span>{entry.room}</span>
                                                            </div>
                                                            {editMode && (
                                                                <div className="flex justify-end gap-1 mt-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteEntry(entry.id);
                                                                        }}
                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        editMode ? (
                                                            <button
                                                                onClick={() => handleAddEntry(day, slot.period)}
                                                                className="w-full h-full min-h-[80px] border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center justify-center"
                                                            >
                                                                <Plus className="w-5 h-5 text-slate-400" />
                                                            </button>
                                                        ) : (
                                                            <div className="text-center text-slate-300 text-sm py-4">
                                                                —
                                                            </div>
                                                        )
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
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Class</h3>
                    <p className="text-slate-500">Choose a class from the dropdown above to view or edit its timetable</p>
                </div>
            )}

            {/* Entry Modal */}
            {showEntryModal && editingEntry && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            {editingEntry.id ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                                <input
                                    type="text"
                                    value={editingEntry.day}
                                    disabled
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
                                <input
                                    type="text"
                                    value={`Period ${editingEntry.period} (${editingEntry.startTime} - ${editingEntry.endTime})`}
                                    disabled
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                <select
                                    value={editingEntry.subjectId}
                                    onChange={(e) => setEditingEntry({ ...editingEntry, subjectId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select subject</option>
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
                                <select
                                    value={editingEntry.teacherId}
                                    onChange={(e) => setEditingEntry({ ...editingEntry, teacherId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select teacher</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
                                <input
                                    type="text"
                                    value={editingEntry.room}
                                    onChange={(e) => setEditingEntry({ ...editingEntry, room: e.target.value })}
                                    placeholder="e.g., Room 101, Lab 201"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => {
                                        setShowEntryModal(false);
                                        setEditingEntry(null);
                                    }}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEntry}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Entry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend and Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Tips</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            Click on empty slots to add a new class
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            Click on existing entries to edit them
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            Use "Copy Week" to duplicate this week's schedule
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            Publish to make timetable visible to teachers
                        </li>
                    </ul>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Time Slots</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map(slot => (
                            <div key={slot.id} className="text-sm text-slate-600">
                                <span className="font-medium">Period {slot.period}:</span> {slot.startTime} - {slot.endTime}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimetableManagement;