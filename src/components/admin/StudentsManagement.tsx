import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Student } from '@/types/admin';
import StudentForm from './forms/StudentForm';

interface StudentsManagementProps {
    students: Student[];
    classes: any[];
    showStudentForm: boolean;
    editingStudent: Student | null;
    studentForm: { exam_number: string; name: string; class_id: string; photo_url: string };
    setShowStudentForm: (show: boolean) => void;
    setEditingStudent: (student: Student | null) => void;
    setStudentForm: (form: { exam_number: string; name: string; class_id: string; photo_url: string }) => void;
    handleCreateStudent: (e: React.FormEvent) => Promise<void>;
    handleUpdateStudent: (e: React.FormEvent) => Promise<void>;
    handleDeleteStudent: (student: Student) => Promise<void>;
    startEditStudent: (student: Student) => void;
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
}) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">All Students ({students.length})</h2>
                <button
                    onClick={() => { setShowStudentForm(true); setEditingStudent(null); setStudentForm({ exam_number: '', name: '', class_id: '', photo_url: '' }); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Student
                </button>
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
                    const classStudents = students.filter(s => s.class?.id === cls.id);
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
                                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {classStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
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

                {students.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500">No students found. Add your first student to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentsManagement;