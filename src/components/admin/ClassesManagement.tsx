import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Student } from '@/types/admin';
import ClassForm from './forms/ClassForm';

interface ClassesManagementProps {
    classes: any[];
    students: Student[];
    showClassForm: boolean;
    classForm: { name: string; academic_year: string; term: string };
    classLoading: boolean;
    setShowClassForm: (show: boolean) => void;
    setClassForm: (form: { name: string; academic_year: string; term: string }) => void;
    handleCreateClass: (e: React.FormEvent) => Promise<void>;
    handleDeleteClass: (classId: string) => Promise<void>;
    handleDeleteStudent: (student: Student) => Promise<void>;
    showMessage: (msg: string, isError?: boolean) => void;
}

const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 2; i++) {
        const year = currentYear + i;
        years.push(`${year}/${year + 1}`);
    }
    return years;
};

const ClassesManagement: React.FC<ClassesManagementProps> = ({
    classes,
    students,
    showClassForm,
    classForm,
    classLoading,
    setShowClassForm,
    setClassForm,
    handleCreateClass,
    handleDeleteClass,
    handleDeleteStudent,
}) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Class Management ({classes.length})</h2>
                <button
                    onClick={() => setShowClassForm(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create New Class
                </button>
            </div>

            <div className="space-y-8">
                {classes.map(cls => (
                    <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{cls.name}</h3>
                                <p className="text-slate-600">
                                    {cls.term} • {cls.academic_year}
                                </p>
                                <p className="text-sm text-indigo-600 font-mono mt-1">
                                    Class Code: {cls.class_code || 'N/A'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-emerald-600">{students.filter(s => s.class?.id === cls.id).length}</p>
                                <p className="text-sm text-slate-500">students</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                            <h4 className="font-semibold text-slate-700 mb-3">Students in this class:</h4>
                            {students.filter(s => s.class?.id === cls.id).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {students
                                        .filter(s => s.class?.id === cls.id)
                                        .map(student => (
                                            <div key={student.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-slate-800">{student.name}</p>
                                                        <p className="text-sm font-mono text-indigo-600">{student.examNumber}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteStudent(student)}
                                                        className="text-slate-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No students added yet</p>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200">
                            <button
                                onClick={() => handleDeleteClass(cls.id)}
                                className="ml-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                            >
                                Delete Class
                            </button>
                        </div>
                    </div>
                ))}
                {classes.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500">No classes found. Create your first class to get started.</p>
                    </div>
                )}
            </div>

            {showClassForm && (
                <ClassForm
                    classForm={classForm}
                    classLoading={classLoading}
                    setShowClassForm={setShowClassForm}
                    setClassForm={setClassForm}
                    handleCreateClass={handleCreateClass}
                    generateAcademicYears={generateAcademicYears}
                />
            )}
        </div>
    );
};

export default ClassesManagement;