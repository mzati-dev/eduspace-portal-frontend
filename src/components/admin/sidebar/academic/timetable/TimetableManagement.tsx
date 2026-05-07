import React, { useState, useEffect } from 'react';
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
    AlertCircle,
    FileText,
    Settings,
    Play,
    Pause,
    RotateCcw
} from 'lucide-react';
import {
    fetchTimetableEntries,
    createTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    copyTimetableWeek,
    publishTimetable,
    fetchTimetableStats,
    exportTimetable,
    importTimetable,
    checkTimetableConflicts,
    fetchTimeSlots,
    fetchTimetableTemplates,        // ← ADD THIS
    createTimetableTemplate,         // ← ADD THIS
    generateTimetableFromTemplate,   // ← ADD THIS
    deleteTimetableTemplate,         // ← ADD THIS (optional)
    TimetableEntry,
    TimeSlot,
    TimetableFilters,
    TimetableStats,
    TimetableTemplate,                // ← ADD THIS
    updateTimeSlot
} from '@/services/timetableAdminService';

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
    const [selectedWeek, setSelectedWeek] = useState<string>('');
    const [editMode, setEditMode] = useState<boolean>(false);
    const [showEntryModal, setShowEntryModal] = useState<boolean>(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [stats, setStats] = useState<TimetableStats>({
        totalEntries: 0,
        totalClasses: 0,
        totalTeachers: 0,
        totalRooms: 0,
        conflicts: 0
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [showCreateWizard, setShowCreateWizard] = useState<boolean>(false);
    const [wizardStep, setWizardStep] = useState<number>(1);
    const [templates, setTemplates] = useState<TimetableTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
    const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);

    // Template creation state
    const [templateName, setTemplateName] = useState<string>('');
    const [templateData, setTemplateData] = useState<any>({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
    });

    const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
    ];

    // Load time slots on mount
    useEffect(() => {
        loadTimeSlots();
        loadTemplates();
    }, []);

    // Load entries when filters change
    useEffect(() => {
        if (selectedClass && selectedTerm) {
            loadTimetableEntries();
            loadStats();
            checkConflicts();
        }
    }, [selectedClass, selectedTerm, selectedWeek]);

    const loadTimeSlots = async () => {
        try {
            const slots = await fetchTimeSlots();
            setTimeSlots(slots);
        } catch (error) {
            showMessage('Failed to load time slots', true);
        }
    };

    const loadTemplates = async () => {
        try {
            const data = await fetchTimetableTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    };

    const loadTimetableEntries = async () => {
        setLoading(true);
        try {
            const filters: TimetableFilters = {
                classId: selectedClass,
                term: selectedTerm,
                weekStart: selectedWeek || undefined
            };
            const data = await fetchTimetableEntries(filters);
            setEntries(data);
        } catch (error) {
            showMessage('Failed to load timetable entries', true);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTimeSlot = async (slot: TimeSlot) => {
        try {
            await updateTimeSlot(slot.id, {
                startTime: slot.startTime,
                endTime: slot.endTime,
                break: slot.break
            });
            showMessage('Time slot updated successfully');
            loadTimeSlots();
            setEditingTimeSlot(null);
        } catch (error: any) {
            showMessage(error.message || 'Failed to update time slot', true);
        }
    };

    const loadStats = async () => {
        try {
            const filters: TimetableFilters = {
                classId: selectedClass,
                term: selectedTerm,
                weekStart: selectedWeek || undefined
            };
            const data = await fetchTimetableStats(filters);
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const checkConflicts = async () => {
        try {
            const filters: TimetableFilters = {
                classId: selectedClass,
                term: selectedTerm,
                weekStart: selectedWeek || undefined
            };
            const data = await checkTimetableConflicts(filters);
            setConflicts(data);
        } catch (error) {
            console.error('Failed to check conflicts:', error);
        }
    };

    const getEntryForSlot = (day: string, period: number) => {
        return entries.find(e => e.day === day && e.period === period);
    };

    const getSubjectName = (subjectId: string) => {
        return subjects.find(s => s.id === subjectId)?.name || 'Unknown';
    };

    const getTeacherName = (teacherId: string) => {
        return teachers.find(t => t.id === teacherId)?.name || 'Unknown';
    };

    const handleAddEntry = (day: string, period: number) => {
        const slot = timeSlots.find(s => s.period === period);
        if (!slot) return;

        setEditingEntry({
            id: '',
            day: day as any,
            period,
            classId: selectedClass,
            subjectId: '',
            teacherId: '',
            room: '',
            startTime: slot.startTime,
            endTime: slot.endTime
        });
        setShowEntryModal(true);
    };

    const handleEditEntry = (entry: TimetableEntry) => {
        setEditingEntry(entry);
        setShowEntryModal(true);
    };

    const handleDeleteEntry = async (entryId: string) => {
        if (!confirm('Are you sure you want to delete this timetable entry?')) return;

        try {
            await deleteTimetableEntry(entryId);
            await loadTimetableEntries();
            await loadStats();
            showMessage('Timetable entry deleted successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to delete entry', true);
        }
    };

    const handleSaveEntry = async () => {
        if (!editingEntry) return;

        if (!editingEntry.subjectId || !editingEntry.teacherId || !editingEntry.room) {
            showMessage('Please fill in all fields', true);
            return;
        }

        try {
            if (editingEntry.id) {
                await updateTimetableEntry(editingEntry.id, editingEntry);
                showMessage('Timetable entry updated successfully');
            } else {
                await createTimetableEntry(editingEntry);
                showMessage('Timetable entry added successfully');
            }

            await loadTimetableEntries();
            await loadStats();
            await checkConflicts();
            setShowEntryModal(false);
            setEditingEntry(null);
        } catch (error: any) {
            showMessage(error.message || 'Failed to save entry', true);
        }
    };

    const handleCopyWeek = async () => {
        if (!selectedWeek) {
            showMessage('Please select a week first', true);
            return;
        }

        const nextWeek = getNextWeek(selectedWeek);

        if (!confirm(`Copy this week's timetable to week starting ${nextWeek}?`)) return;

        try {
            const result = await copyTimetableWeek(selectedWeek, nextWeek, selectedClass);
            showMessage(`Successfully copied ${result.copied} entries to next week`);
        } catch (error: any) {
            showMessage(error.message || 'Failed to copy timetable', true);
        }
    };

    const handlePublishTimetable = async () => {
        if (!selectedClass) {
            showMessage('Please select a class first', true);
            return;
        }

        try {
            await publishTimetable(selectedClass, selectedTerm, selectedWeek || undefined);
            showMessage(`Timetable published for ${classes.find(c => c.id === selectedClass)?.name}`);
        } catch (error: any) {
            showMessage(error.message || 'Failed to publish timetable', true);
        }
    };

    const handleExportTimetable = async () => {
        if (!selectedClass) {
            showMessage('Please select a class first', true);
            return;
        }

        try {
            const filters: TimetableFilters = {
                classId: selectedClass,
                term: selectedTerm,
                weekStart: selectedWeek || undefined
            };

            const blob = await exportTimetable('pdf', filters);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `timetable-${selectedClass}-${selectedTerm}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showMessage('Timetable exported successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to export timetable', true);
        }
    };

    const handleImportTimetable = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedClass) return;

        try {
            const result = await importTimetable(file, selectedClass, selectedTerm, selectedWeek || undefined);
            await loadTimetableEntries();
            showMessage(`Successfully imported ${result.imported} entries`);
        } catch (error: any) {
            showMessage(error.message || 'Failed to import timetable', true);
        }
    };

    const handleCreateFromTemplate = async () => {
        if (!selectedTemplate) {
            showMessage('Please select a template', true);
            return;
        }

        try {
            await generateTimetableFromTemplate(selectedTemplate, selectedClass, selectedTerm, selectedWeek);
            await loadTimetableEntries();
            showMessage('Timetable created from template successfully');
            setShowCreateWizard(false);
        } catch (error: any) {
            showMessage(error.message || 'Failed to create timetable from template', true);
        }
    };

    const handleCreateBlankTimetable = () => {
        setWizardStep(2);
    };

    const handleSaveTemplate = async () => {
        if (!templateName) {
            showMessage('Please enter a template name', true);
            return;
        }

        try {
            await createTimetableTemplate({
                name: templateName,
                data: templateData
            });
            showMessage('Template saved successfully');
            setWizardStep(1);
            loadTemplates();
        } catch (error: any) {
            showMessage(error.message || 'Failed to save template', true);
        }
    };

    const getNextWeek = (weekStr: string): string => {
        const [year, week] = weekStr.split('-W').map(Number);
        const date = new Date(year, 0, 1 + (week - 1) * 7);
        date.setDate(date.getDate() + 7);
        const nextYear = date.getFullYear();
        const nextWeek = getWeekNumber(date);
        return `${nextYear}-W${nextWeek.toString().padStart(2, '0')}`;
    };

    const getWeekNumber = (date: Date): number => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    return (
        <div className="space-y-6">


            {/* Header */}
            <div className="text-center mt-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Timetable Management</h2>
                <p className="text-slate-500">Create and manage class timetables</p>
            </div>
            <div className="flex justify-end mr-4">

                <div className="flex gap-2">
                    {/* ===== PROPER CREATE BUTTON ===== */}
                    <button
                        onClick={() => {
                            if (!selectedClass) {
                                showMessage('Please select a class first', true);
                                return;
                            }
                            setShowCreateWizard(true);
                            setWizardStep(1);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Timetable
                    </button>

                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleImportTimetable}
                        className="hidden"
                        id="timetable-import"
                    />
                    <label
                        htmlFor="timetable-import"
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                        <Upload className="w-4 h-4" />
                        Import
                    </label>
                    <button
                        onClick={handleExportTimetable}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    {/* <button
                        onClick={() => setShowTimeSlotModal(true)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Settings className="w-4 h-4" />
                        Time Slots
                    </button> */}
                    <button
                        onClick={() => setShowTimeSlotModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Settings className="w-4 h-4" />
                        Time Slots
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
                            <input
                                type="week"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
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

                {/* Stats and Conflicts */}
                {selectedClass && (
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200">
                        <div className="text-sm">
                            <span className="text-slate-500">Total Entries:</span>
                            <span className="ml-2 font-medium text-slate-800">{stats.totalEntries}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-slate-500">Teachers Used:</span>
                            <span className="ml-2 font-medium text-slate-800">{stats.totalTeachers}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-slate-500">Rooms Used:</span>
                            <span className="ml-2 font-medium text-slate-800">{stats.totalRooms}</span>
                        </div>
                        {conflicts.length > 0 && (
                            <div className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                <span>{conflicts.length} conflict(s) detected</span>
                            </div>
                        )}
                    </div>
                )}

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
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="text-slate-500 mt-2">Loading timetable...</p>
                        </div>
                    ) : (
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
                                                const hasConflict = conflicts.some(c =>
                                                    c.day === day && c.period === slot.period
                                                );
                                                return (
                                                    <td key={`${day}-${slot.period}`} className="px-4 py-2">
                                                        {entry ? (
                                                            <div
                                                                className={`p-2 rounded-lg border ${hasConflict ? 'border-red-300 bg-red-50' : ''} ${editMode ? 'cursor-pointer hover:shadow-md' : ''}`}
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
                                                                {hasConflict && (
                                                                    <div className="absolute top-0 right-0 -mt-1 -mr-1">
                                                                        <AlertCircle className="w-4 h-4 text-red-600" />
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
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Class</h3>
                    <p className="text-slate-500">Choose a class from the dropdown above to view or edit its timetable</p>
                </div>
            )}

            {/* Create Timetable Wizard Modal */}
            {showCreateWizard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-800">Create New Timetable</h3>
                            <button
                                onClick={() => setShowCreateWizard(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Step 1: Choose Creation Method */}
                        {wizardStep === 1 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-700">How would you like to create the timetable?</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleCreateBlankTimetable}
                                        className="p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                                    >
                                        <FileText className="w-8 h-8 text-indigo-600 mb-3" />
                                        <h5 className="font-medium text-slate-800 mb-1">Start from Scratch</h5>
                                        <p className="text-sm text-slate-500">Create a completely new timetable with empty slots</p>
                                    </button>

                                    <button
                                        onClick={() => setWizardStep(3)}
                                        className="p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                                    >
                                        <Copy className="w-8 h-8 text-green-600 mb-3" />
                                        <h5 className="font-medium text-slate-800 mb-1">Copy from Template</h5>
                                        <p className="text-sm text-slate-500">Use a saved template to generate the timetable</p>
                                    </button>
                                </div>

                                <div className="mt-6">
                                    <button
                                        onClick={() => setWizardStep(4)}
                                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                    >
                                        + Create new template instead
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Blank Timetable Confirmation */}
                        {wizardStep === 2 && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-800 mb-2">Create Blank Timetable</h4>
                                    <p className="text-sm text-blue-600">
                                        You're about to create a new blank timetable for {classes.find(c => c.id === selectedClass)?.name} - {selectedTerm}.
                                        All slots will be empty and you can fill them in edit mode.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        onClick={() => setWizardStep(1)}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditMode(true);
                                            setShowCreateWizard(false);
                                            showMessage('Blank timetable created. Click on empty slots to add entries.');
                                        }}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                                    >
                                        Create Blank Timetable
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Select Template */}
                        {wizardStep === 3 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-700">Select a Template</h4>

                                <div className="space-y-2">
                                    {templates.map(template => (
                                        <label key={template.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="template"
                                                value={template.id}
                                                checked={selectedTemplate === template.id}
                                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                                className="text-indigo-600"
                                            />
                                            <div>
                                                <p className="font-medium text-slate-800">{template.name}</p>
                                                <p className="text-xs text-slate-500">Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        onClick={() => setWizardStep(1)}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCreateFromTemplate}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                                    >
                                        Generate from Template
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Create Template */}
                        {wizardStep === 4 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-700">Create New Template</h4>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        placeholder="e.g., Standard Weekly Schedule"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-700">
                                        Template creation wizard will continue here. You'll be able to set up default subjects, teachers, and rooms for each time slot.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        onClick={() => setWizardStep(1)}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSaveTemplate}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                                    >
                                        Save Template
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            Click "New Timetable" to create a fresh schedule
                        </li>
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
                        {conflicts.length > 0 && (
                            <li className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                Resolve conflicts before publishing
                            </li>
                        )}
                    </ul>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Time Slots</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map(slot => (
                            <div key={slot.id} className="text-sm text-slate-600">
                                <span className="font-medium">Period {slot.period}:</span> {slot.startTime} - {slot.endTime}
                                {slot.break && <span className="ml-2 text-xs text-amber-600">(Break)</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Time Slot Settings Modal */}
            {showTimeSlotModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-800">Configure Time Slots</h3>
                            <button
                                onClick={() => setShowTimeSlotModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {timeSlots.map(slot => (
                                <div key={slot.id} className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-slate-800">Period {slot.period}</h4>
                                            {slot.break && (
                                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                    Break
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setEditingTimeSlot(slot)}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        {slot.startTime} - {slot.endTime}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Time Slot Modal */}
            {editingTimeSlot && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            Edit Period {editingTimeSlot.period}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={editingTimeSlot.startTime}
                                    onChange={(e) => setEditingTimeSlot({ ...editingTimeSlot, startTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={editingTimeSlot.endTime}
                                    onChange={(e) => setEditingTimeSlot({ ...editingTimeSlot, endTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editingTimeSlot.break}
                                    onChange={(e) => setEditingTimeSlot({ ...editingTimeSlot, break: e.target.checked })}
                                    id="isBreak"
                                />
                                <label htmlFor="isBreak" className="text-sm text-slate-700">This is a break period</label>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setEditingTimeSlot(null)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateTimeSlot(editingTimeSlot)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableManagement;