import React from 'react';
import { Save, X } from 'lucide-react';
import { Student } from '@/types/admin';

interface StudentFormProps {
    studentForm: { exam_number: string; name: string; class_id: string; photo_url: string };
    editingStudent: Student | null;
    classes: any[];
    setShowStudentForm: (show: boolean) => void;
    setEditingStudent: (student: Student | null) => void;
    setStudentForm: (form: { exam_number: string; name: string; class_id: string; photo_url: string }) => void;
    handleCreateStudent: (e: React.FormEvent) => Promise<void>;
    handleUpdateStudent: (e: React.FormEvent) => Promise<void>;
}

const StudentForm: React.FC<StudentFormProps> = ({
    studentForm,
    editingStudent,
    classes,
    setShowStudentForm,
    setEditingStudent,
    setStudentForm,
    handleCreateStudent,
    handleUpdateStudent,
}) => {
    const handleSubmit = editingStudent ? handleUpdateStudent : handleCreateStudent;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {editingStudent ? 'Edit Student' : 'Add New Student'}
                    </h3>
                    <button
                        onClick={() => { setShowStudentForm(false); setEditingStudent(null); }}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {studentForm.class_id && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-indigo-800">Auto-generated Exam Number</p>
                                    <p className="font-mono text-lg font-bold text-indigo-700">{studentForm.exam_number}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(studentForm.exam_number)}
                                    className="px-3 py-1 bg-white border border-indigo-300 text-indigo-600 rounded text-sm hover:bg-indigo-50 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="text-xs text-indigo-600 mt-2">
                                This exam number will be assigned to the student
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                            placeholder="Sean Mkweza"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                        <select
                            value={studentForm.class_id}
                            onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">Select a class</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} - {cls.term} ({cls.academic_year})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Create new classes in "Manage Classes" tab first
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setShowStudentForm(false); setEditingStudent(null); }}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {editingStudent ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;