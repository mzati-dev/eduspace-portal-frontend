import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, BookOpen, Users, X, Check } from 'lucide-react';
import { assignTeacher, removeTeacherAssignment, fetchTeacherAssignments } from '@/services/teacherService';

interface Teacher {
    id: string;
    name: string;
    email: string;
    subject_specialty: string;
    created_at: string;
}

interface TeachersManagementProps {
    teachers: Teacher[];
    showTeacherForm: boolean;
    teacherForm: {
        name: string;
        email: string;
        password: string;
    };
    setShowTeacherForm: (show: boolean) => void;
    setTeacherForm: (form: any) => void;
    handleCreateTeacher: (e: React.FormEvent) => Promise<void>;
    handleDeleteTeacher: (teacherId: string) => Promise<void>;
    // ===== NEW PROPS NEEDED =====
    classes: any[];  // Need to pass classes from parent
    subjects: any[]; // Need to pass subjects from parent
    // ===== END NEW PROPS =====
}

const TeachersManagement: React.FC<TeachersManagementProps> = ({
    teachers,
    showTeacherForm,
    teacherForm,
    setShowTeacherForm,
    setTeacherForm,
    handleCreateTeacher,
    handleDeleteTeacher,
    classes,   // ADD THIS
    subjects,  // ADD THIS
}) => {
    // ===== START: NEW STATE FOR ASSIGNMENTS =====
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [savingAssignment, setSavingAssignment] = useState(false);
    const [assignmentError, setAssignmentError] = useState('');
    const [assignmentSuccess, setAssignmentSuccess] = useState('');
    // ===== END: NEW STATE FOR ASSIGNMENTS =====

    // ===== START: NEW ASSIGNMENT FUNCTIONS =====
    const openAssignmentModal = async (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setSelectedClass('');
        setSelectedSubjects([]);
        setShowAssignmentModal(true);
        await loadTeacherAssignments(teacher.id);
    };

    const loadTeacherAssignments = async (teacherId: string) => {
        setLoadingAssignments(true);
        try {
            const assignments = await fetchTeacherAssignments(teacherId);
            setTeacherAssignments(assignments);
        } catch (err: any) {
            setAssignmentError('Failed to load assignments');
        } finally {
            setLoadingAssignments(false);
        }
    };

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        setSelectedSubjects([]); // Reset subjects when class changes
    };

    const toggleSubject = (subjectId: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleAssignTeacher = async () => {
        if (!selectedTeacher || !selectedClass || selectedSubjects.length === 0) {
            setAssignmentError('Please select a class and at least one subject');
            return;
        }

        setSavingAssignment(true);
        setAssignmentError('');

        try {
            for (const subjectId of selectedSubjects) {
                await assignTeacher(selectedTeacher.id, selectedClass, subjectId);
            }

            setAssignmentSuccess('Teacher assigned successfully!');
            await loadTeacherAssignments(selectedTeacher.id);

            // Reset form
            setSelectedClass('');
            setSelectedSubjects([]);

            // Clear success message after 3 seconds
            setTimeout(() => setAssignmentSuccess(''), 3000);
        } catch (err: any) {
            setAssignmentError(err.message || 'Failed to assign teacher');
        } finally {
            setSavingAssignment(false);
        }
    };

    const handleRemoveAssignment = async (assignmentId: string, classId: string, subjectId: string) => {
        if (!selectedTeacher) return;

        try {
            await removeTeacherAssignment(selectedTeacher.id, classId, subjectId);
            await loadTeacherAssignments(selectedTeacher.id);
            setAssignmentSuccess('Assignment removed successfully');
            setTimeout(() => setAssignmentSuccess(''), 3000);
        } catch (err: any) {
            setAssignmentError(err.message || 'Failed to remove assignment');
        }
    };

    const getSubjectsForClass = (classId: string) => {
        // Filter subjects that can be taught in this class
        // You might need to adjust this logic based on your data structure
        return subjects;
    };

    const getCurrentAssignmentsForClass = (classId: string) => {
        return teacherAssignments.filter(a => a.classId === classId);
    };
    // ===== END: NEW ASSIGNMENT FUNCTIONS =====

    return (
        <div className="space-y-6">
            {/* ===== EXISTING HEADER ===== */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">
                    Teachers ({teachers.length})
                </h2>
                <button
                    onClick={() => setShowTeacherForm(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Teacher
                </button>
            </div>

            {/* ===== EXISTING TEACHER FORM ===== */}
            {showTeacherForm && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <form onSubmit={handleCreateTeacher} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={teacherForm.name}
                                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={teacherForm.email}
                                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={teacherForm.password}
                                    onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowTeacherForm(false)}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                            >
                                Create Teacher Account
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ===== EXISTING TEACHER CARDS ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {teachers.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-indigo-300 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{teacher.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <Mail className="w-3 h-3" />
                                        {teacher.email}
                                    </div>
                                    {teacher.subject_specialty && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                            <BookOpen className="w-3 h-3" />
                                            {teacher.subject_specialty}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    {/* ===== IMPROVED ASSIGN BUTTON ===== */}
                                    <div className="relative group">
                                        <button
                                            onClick={() => openAssignmentModal(teacher)}
                                            className="flex items-center gap-1 px-2 py-1 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-lg border border-indigo-200 transition-all"
                                            title="Assign to classes/subjects"
                                        >
                                            <Users className="w-4 h-4" />
                                            <span className="hidden sm:inline font-medium">Assign</span>
                                        </button>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-0 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                            Assign Classes & Subjects
                                            <div className="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>

                                    {/* ===== EXISTING DELETE BUTTON ===== */}
                                    <button
                                        onClick={() => handleDeleteTeacher(teacher.id)}
                                        className="flex items-center gap-1 px-2 py-1 text-sm bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-lg border border-red-200 transition-all"
                                        title="Delete teacher"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline font-medium">Delete</span>
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400">
                                Added on {new Date(teacher.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== START: NEW ASSIGNMENT MODAL ===== */}
            {showAssignmentModal && selectedTeacher && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">
                                        Assign Teacher: {selectedTeacher.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Assign this teacher to classes and subjects
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAssignmentModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {assignmentError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {assignmentError}
                                </div>
                            )}

                            {assignmentSuccess && (
                                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                                    {assignmentSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column: Current Assignments */}
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-3">Current Assignments</h4>
                                    {loadingAssignments ? (
                                        <div className="text-center py-4 text-slate-500">
                                            Loading assignments...
                                        </div>
                                    ) : teacherAssignments.length === 0 ? (
                                        <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg">
                                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500">No assignments yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {teacherAssignments.map((assignment) => (
                                                <div
                                                    key={assignment.id}
                                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                                                >
                                                    <div>
                                                        <div className="font-medium text-slate-800">
                                                            {assignment.class?.name || 'Unknown Class'}
                                                        </div>
                                                        <div className="text-sm text-slate-600">
                                                            {assignment.subject?.name || 'Unknown Subject'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveAssignment(
                                                            assignment.id,
                                                            assignment.classId,
                                                            assignment.subjectId
                                                        )}
                                                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                        title="Remove assignment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: New Assignment Form */}
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-3">New Assignment</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Select Class
                                            </label>
                                            <select
                                                value={selectedClass}
                                                onChange={(e) => handleClassChange(e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">Choose a class</option>
                                                {classes.map((cls) => (
                                                    <option key={cls.id} value={cls.id}>
                                                        {cls.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedClass && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    Select Subjects for {classes.find(c => c.id === selectedClass)?.name}
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {getSubjectsForClass(selectedClass).map((subject) => {
                                                        const isSelected = selectedSubjects.includes(subject.id);
                                                        const isAlreadyAssigned = teacherAssignments.some(
                                                            a => a.classId === selectedClass && a.subjectId === subject.id
                                                        );

                                                        return (
                                                            <button
                                                                key={subject.id}
                                                                type="button"
                                                                onClick={() => !isAlreadyAssigned && toggleSubject(subject.id)}
                                                                disabled={isAlreadyAssigned}
                                                                className={`p-3 rounded-lg border text-left transition-colors ${isAlreadyAssigned
                                                                    ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                                                                    : isSelected
                                                                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                                                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium">{subject.name}</span>
                                                                    {isAlreadyAssigned ? (
                                                                        <Check className="w-4 h-4 text-slate-400" />
                                                                    ) : isSelected ? (
                                                                        <Check className="w-4 h-4 text-indigo-600" />
                                                                    ) : null}
                                                                </div>
                                                                {isAlreadyAssigned && (
                                                                    <div className="text-xs text-slate-500 mt-1">
                                                                        Already assigned
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <button
                                                onClick={handleAssignTeacher}
                                                disabled={!selectedClass || selectedSubjects.length === 0 || savingAssignment}
                                                className={`w-full py-2 px-4 rounded-lg font-medium ${!selectedClass || selectedSubjects.length === 0 || savingAssignment
                                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                    }`}
                                            >
                                                {savingAssignment ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Assigning...
                                                    </span>
                                                ) : (
                                                    `Assign to ${selectedSubjects.length} subject${selectedSubjects.length !== 1 ? 's' : ''}`
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ===== END: NEW ASSIGNMENT MODAL ===== */}
        </div>
    );
};

export default TeachersManagement;

// import React from 'react';
// import { Plus, Trash2, Mail, BookOpen } from 'lucide-react';

// interface Teacher {
//     id: string;
//     name: string;
//     email: string;
//     subject_specialty: string;
//     created_at: string;
// }

// <div className="flex gap-1">
//     {/* ===== NEW ASSIGN BUTTON ===== */}
//     <button
//         onClick={() => openAssignmentModal(teacher)}
//         className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
//         title="Assign to classes/subjects"
//     >
//         <Users className="w-4 h-4" />
//     </button>
//     {/* ===== EXISTING DELETE BUTTON ===== */}
//     <button
//         onClick={() => handleDeleteTeacher(teacher.id)}
//         className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
//         title="Delete teacher"
//     >
//         <Trash2 className="w-4 h-4" />
//     </button>
// </div>

// interface TeachersManagementProps {
//     teachers: Teacher[];
//     showTeacherForm: boolean;
//     teacherForm: {
//         name: string;
//         email: string;
//         password: string;

//     };
//     setShowTeacherForm: (show: boolean) => void;
//     setTeacherForm: (form: any) => void;
//     handleCreateTeacher: (e: React.FormEvent) => Promise<void>;
//     handleDeleteTeacher: (teacherId: string) => Promise<void>;
// }

// const TeachersManagement: React.FC<TeachersManagementProps> = ({
//     teachers,
//     showTeacherForm,
//     teacherForm,
//     setShowTeacherForm,
//     setTeacherForm,
//     handleCreateTeacher,
//     handleDeleteTeacher,
// }) => {
//     return (
//         <div className="space-y-6">
//             <div className="flex justify-between items-center">
//                 <h2 className="text-lg font-semibold text-slate-800">
//                     Teachers ({teachers.length})
//                 </h2>
//                 <button
//                     onClick={() => setShowTeacherForm(true)}
//                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
//                 >
//                     <Plus className="w-4 h-4" />
//                     Add Teacher
//                 </button>
//             </div>

//             {showTeacherForm && (
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                     <form onSubmit={handleCreateTeacher} className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Full Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={teacherForm.name}
//                                     onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
//                                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Email
//                                 </label>
//                                 <input
//                                     type="email"
//                                     value={teacherForm.email}
//                                     onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
//                                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Password
//                                 </label>
//                                 <input
//                                     type="password"
//                                     value={teacherForm.password}
//                                     onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
//                                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                     required
//                                     minLength={6}
//                                 />
//                             </div>
//                             <div>
//                                 {/* <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Subject Specialty
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={teacherForm.subject_specialty}
//                                     onChange={(e) => setTeacherForm({ ...teacherForm, subject_specialty: e.target.value })}
//                                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                     placeholder="e.g., Mathematics, Science"
//                                 /> */}
//                             </div>
//                         </div>
//                         <div className="flex gap-3 pt-2">
//                             <button
//                                 type="button"
//                                 onClick={() => setShowTeacherForm(false)}
//                                 className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
//                             >
//                                 Create Teacher Account
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}

//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
//                     {teachers.map((teacher) => (
//                         <div
//                             key={teacher.id}
//                             className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-indigo-300 transition-colors"
//                         >
//                             <div className="flex items-start justify-between mb-3">
//                                 <div>
//                                     <h3 className="font-semibold text-slate-800">{teacher.name}</h3>
//                                     <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
//                                         <Mail className="w-3 h-3" />
//                                         {teacher.email}
//                                     </div>
//                                     {teacher.subject_specialty && (
//                                         <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
//                                             <BookOpen className="w-3 h-3" />
//                                             {teacher.subject_specialty}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <button
//                                     onClick={() => handleDeleteTeacher(teacher.id)}
//                                     className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
//                                     title="Delete teacher"
//                                 >
//                                     <Trash2 className="w-4 h-4" />
//                                 </button>
//                             </div>
//                             <div className="text-xs text-slate-400">
//                                 Added on {new Date(teacher.created_at).toLocaleDateString()}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TeachersManagement;