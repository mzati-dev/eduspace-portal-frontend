import React from 'react';
import { X } from 'lucide-react';

interface ClassFormProps {
    classForm: { name: string; academic_year: string; term: string };
    classLoading: boolean;
    setShowClassForm: (show: boolean) => void;
    setClassForm: (form: { name: string; academic_year: string; term: string }) => void;
    handleCreateClass: (e: React.FormEvent) => Promise<void>;
    generateAcademicYears: () => string[];
}

const ClassForm: React.FC<ClassFormProps> = ({
    classForm,
    classLoading,
    setShowClassForm,
    setClassForm,
    handleCreateClass,
    generateAcademicYears,
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Create New Class</h3>
                    <button
                        onClick={() => setShowClassForm(false)}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleCreateClass} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                        <input
                            type="text"
                            value={classForm.name}
                            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                            placeholder="Enter any class name, e.g., Grade 8A, Form 3B, Nursery B"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                        <select
                            value={classForm.academic_year}
                            onChange={(e) => setClassForm({ ...classForm, academic_year: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">Select Academic Year</option>
                            {generateAcademicYears().map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                            <option value="custom">Add Custom Year...</option>
                        </select>
                        {classForm.academic_year === 'custom' && (
                            <input
                                type="text"
                                placeholder="e.g., 2025/2026"
                                className="w-full mt-2 px-4 py-2 border border-slate-300 rounded-lg"
                                onChange={(e) => setClassForm({ ...classForm, academic_year: e.target.value })}
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
                        <select
                            value={classForm.term}
                            onChange={(e) => setClassForm({ ...classForm, term: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                            <option value="custom">Add Custom Term...</option>
                        </select>
                        {classForm.term === 'custom' && (
                            <input
                                type="text"
                                placeholder="e.g., Semester 1, Quarter 1"
                                className="w-full mt-2 px-4 py-2 border border-slate-300 rounded-lg"
                                onChange={(e) => setClassForm({ ...classForm, term: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowClassForm(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={classLoading}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                        >
                            {classLoading ? 'Creating...' : 'Create Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassForm;