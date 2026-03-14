import React, { useState } from 'react';
import { X, Search, Filter, AlertCircle } from 'lucide-react';
import { Student } from '@/types/admin';

interface Props {
    students: Student[];  // ALL students
    onClose: () => void;
    onAdd: (studentIds: string[]) => Promise<{ addedCount?: number; skippedCount?: number; skipped?: any[] } | void>;
}

const AddExistingStudentsModal: React.FC<Props> = ({ students, onClose, onAdd }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

    // Get unique classes from students
    const classes = Array.from(new Map(
        students
            .filter(s => s.class)
            .map(s => [s.class?.id, s.class])
    ).values()).filter(Boolean);

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.examNumber.toLowerCase().includes(search.toLowerCase());

        const matchesClass = filterClass === 'all' || s.class?.id === filterClass;

        return matchesSearch && matchesClass;
    });

    const toggleAll = () => {
        if (selected.length === filteredStudents.length) {
            setSelected([]);
        } else {
            setSelected(filteredStudents.map(s => s.id));
        }
    };

    const toggleStudent = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const selectAllFromClass = (classId: string) => {
        const classStudentIds = students
            .filter(s => s.class?.id === classId)
            .map(s => s.id);
        setSelected(prev => [...new Set([...prev, ...classStudentIds])]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selected.length === 0) return;

        setLoading(true);
        setFeedback(null);

        try {
            const result = await onAdd(selected);

            if (result && 'skippedCount' in result && result.skippedCount > 0) {
                setFeedback({
                    message: `${result.addedCount} students added. ${result.skippedCount} students were skipped because they already have a class for this term.`,
                    type: 'warning'
                });
                // Keep modal open to show feedback
            } else {
                // Close modal on success
                onClose();
            }
        } catch (error) {
            setFeedback({
                message: error instanceof Error ? error.message : 'Failed to add students',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Add Existing Students to Class</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {feedback && (
                    <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${feedback.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                            feedback.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                                'bg-green-50 text-green-800 border border-green-200'
                        }`}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{feedback.message}</p>
                    </div>
                )}

                <div className="p-6 border-b space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or exam number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Class Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls?.id} value={cls?.id}>
                                    {cls?.name} ({students.filter(s => s.class?.id === cls?.id).length} students)
                                </option>
                            ))}
                        </select>
                        {filterClass !== 'all' && (
                            <button
                                onClick={() => selectAllFromClass(filterClass)}
                                className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 whitespace-nowrap"
                            >
                                Select All
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-4 flex justify-between items-center">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selected.length === filteredStudents.length && filteredStudents.length > 0}
                                onChange={toggleAll}
                                className="rounded text-indigo-600"
                            />
                            <span className="text-sm font-medium">Select All ({filteredStudents.length})</span>
                        </label>
                        <span className="text-sm text-slate-500">{selected.length} selected</span>
                    </div>

                    <div className="space-y-2">
                        {filteredStudents.map(s => (
                            <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(s.id)}
                                    onChange={() => toggleStudent(s.id)}
                                    className="rounded text-indigo-600"
                                />
                                <div>
                                    <p className="font-medium">{s.name}</p>
                                    <p className="text-sm text-indigo-600">{s.examNumber}</p>
                                    {s.class && (
                                        <p className="text-xs text-slate-500">
                                            Current: {s.class.name} ({s.class.academic_year} {s.class.term})
                                        </p>
                                    )}
                                </div>
                            </label>
                        ))}
                        {filteredStudents.length === 0 && (
                            <p className="text-center text-slate-500 py-8">No students found</p>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={selected.length === 0 || loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>Adding...</>
                        ) : (
                            <>
                                Add {selected.length} Student{selected.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddExistingStudentsModal;

// import React, { useState } from 'react';
// import { X, Search, Filter } from 'lucide-react';
// import { Student } from '@/types/admin';

// interface Props {
//     students: Student[];  // ALL students
//     onClose: () => void;
//     onAdd: (studentIds: string[]) => void;
// }

// const AddExistingStudentsModal: React.FC<Props> = ({ students, onClose, onAdd }) => {
//     const [selected, setSelected] = useState<string[]>([]);
//     const [search, setSearch] = useState('');
//     const [filterClass, setFilterClass] = useState<string>('all');

//     // Get unique classes from students
//     const classes = Array.from(new Map(
//         students
//             .filter(s => s.class)
//             .map(s => [s.class?.id, s.class])
//     ).values()).filter(Boolean);

//     const filteredStudents = students.filter(s => {
//         const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
//             s.examNumber.toLowerCase().includes(search.toLowerCase());

//         const matchesClass = filterClass === 'all' || s.class?.id === filterClass;

//         return matchesSearch && matchesClass;
//     });

//     const toggleAll = () => {
//         if (selected.length === filteredStudents.length) {
//             setSelected([]);
//         } else {
//             setSelected(filteredStudents.map(s => s.id));
//         }
//     };

//     const toggleStudent = (id: string) => {
//         setSelected(prev =>
//             prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
//         );
//     };

//     const selectAllFromClass = (classId: string) => {
//         const classStudentIds = students
//             .filter(s => s.class?.id === classId)
//             .map(s => s.id);
//         setSelected(prev => [...new Set([...prev, ...classStudentIds])]);
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (selected.length > 0) {
//             onAdd(selected);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
//                 <div className="p-6 border-b flex justify-between items-center">
//                     <h3 className="text-lg font-semibold">Add Existing Students to Class</h3>
//                     <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 <div className="p-6 border-b space-y-4">
//                     {/* Search */}
//                     <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                         <input
//                             type="text"
//                             placeholder="Search by name or exam number..."
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         />
//                     </div>

//                     {/* Class Filter */}
//                     <div className="flex items-center gap-2">
//                         <Filter className="w-4 h-4 text-slate-400" />
//                         <select
//                             value={filterClass}
//                             onChange={(e) => setFilterClass(e.target.value)}
//                             className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                             <option value="all">All Classes</option>
//                             {classes.map(cls => (
//                                 <option key={cls?.id} value={cls?.id}>
//                                     {cls?.name} ({students.filter(s => s.class?.id === cls?.id).length} students)
//                                 </option>
//                             ))}
//                         </select>
//                         {filterClass !== 'all' && (
//                             <button
//                                 onClick={() => selectAllFromClass(filterClass)}
//                                 className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
//                             >
//                                 Select All from this Class
//                             </button>
//                         )}
//                     </div>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-6">
//                     <div className="mb-4 flex justify-between items-center">
//                         <label className="flex items-center gap-2">
//                             <input
//                                 type="checkbox"
//                                 checked={selected.length === filteredStudents.length && filteredStudents.length > 0}
//                                 onChange={toggleAll}
//                                 className="rounded text-indigo-600"
//                             />
//                             <span className="text-sm font-medium">Select All ({filteredStudents.length})</span>
//                         </label>
//                         <span className="text-sm text-slate-500">{selected.length} selected</span>
//                     </div>

//                     <div className="space-y-2">
//                         {filteredStudents.map(s => (
//                             <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border cursor-pointer">
//                                 <input
//                                     type="checkbox"
//                                     checked={selected.includes(s.id)}
//                                     onChange={() => toggleStudent(s.id)}
//                                     className="rounded text-indigo-600"
//                                 />
//                                 <div>
//                                     <p className="font-medium">{s.name}</p>
//                                     <p className="text-sm text-indigo-600">{s.examNumber}</p>
//                                     {s.class && (
//                                         <p className="text-xs text-slate-500">Current: {s.class.name}</p>
//                                     )}
//                                 </div>
//                             </label>
//                         ))}
//                         {filteredStudents.length === 0 && (
//                             <p className="text-center text-slate-500 py-8">No students found</p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="p-6 border-t flex justify-end gap-2">
//                     <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-50">
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSubmit}
//                         disabled={selected.length === 0}
//                         className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//                     >
//                         Add {selected.length} Student{selected.length !== 1 ? 's' : ''}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddExistingStudentsModal;
