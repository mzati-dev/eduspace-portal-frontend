import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SubjectRecord } from '@/services/studentService';
import SubjectForm from './forms/SubjectForm';

interface SubjectsManagementProps {
    subjects: SubjectRecord[];
    showSubjectForm: boolean;
    newSubjectName: string;
    addingSubject: boolean;
    setShowSubjectForm: (show: boolean) => void;
    setNewSubjectName: (name: string) => void;
    handleAddSubject: (e: React.FormEvent) => Promise<void>;
    handleDeleteSubject: (subject: SubjectRecord) => Promise<void>;
}

const SubjectsManagement: React.FC<SubjectsManagementProps> = ({
    subjects,
    showSubjectForm,
    newSubjectName,
    addingSubject,
    setShowSubjectForm,
    setNewSubjectName,
    handleAddSubject,
    handleDeleteSubject,
}) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">All Subjects ({subjects.length})</h2>
                <button
                    onClick={() => setShowSubjectForm(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Subject
                </button>
            </div>

            {showSubjectForm && (
                <SubjectForm
                    newSubjectName={newSubjectName}
                    addingSubject={addingSubject}
                    setShowSubjectForm={setShowSubjectForm}
                    setNewSubjectName={setNewSubjectName}
                    handleAddSubject={handleAddSubject}
                />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {subjects.map((subject) => (
                        <div
                            key={subject.id}
                            className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-indigo-300 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-800">{subject.name}</span>
                                <button
                                    onClick={() => handleDeleteSubject(subject)}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete subject"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {subjects.length === 0 && (
                        <div className="md:col-span-2 lg:col-span-3 text-center py-12 text-slate-500">
                            No subjects found. Add your first subject to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectsManagement;