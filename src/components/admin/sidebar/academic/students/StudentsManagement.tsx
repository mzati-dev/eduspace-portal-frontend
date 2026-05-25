import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { Student } from '@/types/admin';
import StudentForm from '../../../forms/StudentForm';
import ImportStudentsModal from '../../../modals/ImportStudentsModal';

interface StudentsManagementProps {
    students: Student[];
    classes: any[];
    showStudentForm: boolean;
    editingStudent: Student | null;
    studentForm: { exam_number: string; name: string; class_id: string; photo_url: string, gender: string };
    setShowStudentForm: (show: boolean) => void;
    setEditingStudent: (student: Student | null) => void;
    setStudentForm: (form: { exam_number: string; name: string; class_id: string; photo_url: string, gender: string }) => void;
    handleCreateStudent: (e: React.FormEvent) => Promise<void>;
    handleUpdateStudent: (e: React.FormEvent) => Promise<void>;
    handleDeleteStudent: (student: Student) => Promise<void>;
    startEditStudent: (student: Student) => void;
    onRefresh?: () => Promise<void>;
}

const StudentsManagement: React.FC<StudentsManagementProps> = ({
    students,
    classes,
    showStudentForm,
    editingStudent,
    studentForm,
    setShowStudentForm,
    setEditingStudent,
    setStudentForm,
    handleCreateStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    startEditStudent,
    onRefresh
}) => {
    const [detailsModalStudent, setDetailsModalStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedClassForImport, setSelectedClassForImport] = useState<{ id: string; name: string } | null>(null);
    // ADD THIS LINE - calculate filtered students once
    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchTerm ||
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.examNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !selectedClassFilter || student.class?.id === selectedClassFilter;
        return matchesSearch && matchesClass;
    });

    const handleImportSuccess = () => {
        // Call a refresh function passed from parent instead of reload
        if (onRefresh) {
            onRefresh();
        }
    };
    return (
        <div className="space-y-6">
            {/* <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">All Students ({students.length})</h2>
                <button
                    onClick={() => { setShowStudentForm(true); setEditingStudent(null); setStudentForm({ exam_number: '', name: '', class_id: '', photo_url: '' }); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Student
                </button>
            </div> */}

            <div className="text-center mt-4 mb-6">
                <h2 className="text-lg font-semibold text-slate-800">All Students ({students.length})</h2>
            </div>

            <div className="flex justify-end mr-4 mb-6">

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            // Open class selector modal or use selected class filter
                            if (selectedClassFilter) {
                                const cls = classes.find(c => c.id === selectedClassFilter);
                                if (cls) {
                                    setSelectedClassForImport({ id: cls.id, name: cls.name });
                                    setShowImportModal(true);
                                } else {
                                    alert('Please select a class filter first');
                                }
                            } else {
                                alert('Please select a class filter first to import students into a specific class');
                            }
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Import from File
                    </button>
                    <button
                        onClick={() => { setShowStudentForm(true); setEditingStudent(null); setStudentForm({ exam_number: '', name: '', class_id: '', photo_url: '', gender: '' }); }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Student
                    </button>
                </div>
            </div>

            {/* ADD THIS SEARCH AND FILTER SECTION */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search by Name or Exam Number */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Search Students
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or exam number..."
                                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter by Class */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Filter by Class
                        </label>
                        <select
                            value={selectedClassFilter}
                            onChange={(e) => setSelectedClassFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} - {cls.term}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Search Results Summary */}
                {(searchTerm || selectedClassFilter) && (
                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Showing {students.filter(s => {
                                const matchesSearch = !searchTerm ||
                                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    s.examNumber.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesClass = !selectedClassFilter || s.class?.id === selectedClassFilter;
                                return matchesSearch && matchesClass;
                            }).length} of {students.length} students
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedClassFilter('');
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {(showStudentForm || editingStudent) && (
                <StudentForm
                    studentForm={studentForm}
                    editingStudent={editingStudent}
                    classes={classes}
                    setShowStudentForm={setShowStudentForm}
                    setEditingStudent={setEditingStudent}
                    setStudentForm={setStudentForm}
                    handleCreateStudent={handleCreateStudent}
                    handleUpdateStudent={handleUpdateStudent}
                />
            )}

            <div className="space-y-8">
                {classes.map(cls => {
                    // const classStudents = students.filter(s => s.class?.id === cls.id);
                    // First filter all students by search and class filter


                    // Then group by class
                    // const classStudents = filteredStudents.filter(s => s.class?.id === cls.id);
                    const classStudents = filteredStudents.filter(s => s.class?.id === cls.id);
                    if (classStudents.length === 0) return null;

                    return (
                        <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    {cls.name} - {cls.term} ({cls.academic_year})
                                </h3>
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                                    {classStudents.length} students
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Name</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Gender</th>
                                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {classStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {student.gender ? student.gender : 'Not specified'} {/* 👈 ADD THIS */}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setDetailsModalStudent(student)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View full details"
                                                        >
                                                            👁️
                                                        </button>


                                                        <button
                                                            onClick={() => startEditStudent(student)}
                                                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteStudent(student)}
                                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}

                {/* {students.length === 0 && ( */}
                {filteredStudents.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500">No students found. Add your first student to get started.</p>
                    </div>
                )}
            </div>
            {/* Student Details Modal */}
            {detailsModalStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">Student Full Details</h3>
                            <button
                                onClick={() => setDetailsModalStudent(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Student Information */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                                        <span>👤</span> STUDENT INFORMATION
                                    </h4>
                                    <div className="space-y-2">
                                        <p><span className="font-medium text-slate-600">Name:</span> {detailsModalStudent.name}</p>
                                        <p><span className="font-medium text-slate-600">Gender:</span> {detailsModalStudent.gender || 'Not specified'}</p>
                                        <p><span className="font-medium text-slate-600">Exam Number:</span> <span className="font-mono text-indigo-600">{detailsModalStudent.examNumber}</span></p>
                                        <p><span className="font-medium text-slate-600">Class:</span> {detailsModalStudent.class?.name || 'N/A'}</p>
                                        <p><span className="font-medium text-slate-600">Term:</span> {detailsModalStudent.term || 'N/A'}</p>
                                        <p><span className="font-medium text-slate-600">EMIS Code:</span> {detailsModalStudent.emis_code || 'Not provided'}</p>
                                    </div>
                                </div>

                                {/* Parent Information */}
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                                        <span>👪</span> PARENT/GUARDIAN
                                    </h4>
                                    <div className="space-y-2">
                                        <p><span className="font-medium text-slate-600">Name:</span> {detailsModalStudent.parent?.name || 'Not provided'}</p>
                                        <p><span className="font-medium text-slate-600">Relationship:</span> {detailsModalStudent.parent?.relationship || 'Not provided'}</p>
                                        <p><span className="font-medium text-slate-600">Phone:</span> {detailsModalStudent.parent?.phone || 'Not provided'} <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">Login</span></p>
                                        <p><span className="font-medium text-slate-600">Alt Phone:</span> {detailsModalStudent.parent?.alternate_phone || 'Not provided'}</p>
                                        <p><span className="font-medium text-slate-600">Email:</span> {detailsModalStudent.parent?.email || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* More Parent Info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
                                        <span>🆔</span> IDENTIFICATION
                                    </h4>
                                    <div className="space-y-2">
                                        <p><span className="font-medium text-slate-600">National ID:</span> {detailsModalStudent.parent?.national_id || 'Not provided'}</p>
                                        <p><span className="font-medium text-slate-600">Occupation:</span> {detailsModalStudent.parent?.occupation || 'Not provided'}</p>
                                        <p><span className="font-medium text-slate-600">Address:</span> {detailsModalStudent.parent?.address || 'Not provided'}</p>
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                                        <span>🚨</span> EMERGENCY CONTACT
                                    </h4>
                                    <div className="space-y-2">
                                        <p><span className="font-medium text-slate-600">Name:</span> {detailsModalStudent.emergency_contact?.name || 'Not provided'}</p>
                                        <p><span className="font-medium text-slate-600">Phone:</span> {detailsModalStudent.emergency_contact?.phone || 'Not provided'}</p>
                                        <p><span className="font-medium text-slate-600">Relationship:</span> {detailsModalStudent.emergency_contact?.relationship || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
                                    <span>📱</span> PREFERENCES
                                </h4>
                                <p><span className="font-medium text-slate-600">Preferred Contact Method:</span> {detailsModalStudent.parent?.preferred_contact?.toUpperCase() || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showImportModal && selectedClassForImport && (
                <ImportStudentsModal
                    isOpen={showImportModal}
                    onClose={() => {
                        setShowImportModal(false);
                        setSelectedClassForImport(null);
                    }}
                    classId={selectedClassForImport.id}
                    className={selectedClassForImport.name}
                    onSuccess={handleImportSuccess}
                />
            )}
        </div>
    );
};

export default StudentsManagement;