import React from 'react';
import { Plus, X } from 'lucide-react';

interface SubjectFormProps {
    newSubjectName: string;
    addingSubject: boolean;
    setShowSubjectForm: (show: boolean) => void;
    setNewSubjectName: (name: string) => void;
    handleAddSubject: (e: React.FormEvent) => Promise<void>;
}

const SubjectForm: React.FC<SubjectFormProps> = ({
    newSubjectName,
    addingSubject,
    setShowSubjectForm,
    setNewSubjectName,
    handleAddSubject,
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Add New Subject</h3>
                    <button
                        onClick={() => { setShowSubjectForm(false); setNewSubjectName(''); }}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleAddSubject} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                        <input
                            type="text"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="e.g., Mathematics, English, Science"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setShowSubjectForm(false); setNewSubjectName(''); }}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addingSubject || !newSubjectName.trim()}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {addingSubject ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Subject
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubjectForm;