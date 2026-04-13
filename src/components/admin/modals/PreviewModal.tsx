import React, { useState } from 'react';
import { X, CheckSquare, Square } from 'lucide-react';
import { StudentData } from '@/services/studentService';
import QAAssessment from '@/components/app/searchResults/QAAssessment';
import ReportCard from '@/components/app/searchResults/ReportCard';

interface PreviewReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: StudentData[];
    onArchive: (assessmentType: 'qa1' | 'qa2' | 'endOfTerm' | 'overall' | 'all', studentIds?: string[]) => Promise<void>;
    classId?: string;
    term?: string;
}

const PreviewReportModal: React.FC<PreviewReportModalProps> = ({
    isOpen,
    onClose,
    data,
    onArchive,
    classId,
    term
}) => {
    const [selectedType, setSelectedType] = useState<'qa1' | 'qa2' | 'endOfTerm' | 'overall' | 'all'>('overall');
    const [loading, setLoading] = useState(false);
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);

    // State for batch selection
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // State for preview modal
    const [previewStudent, setPreviewStudent] = useState<StudentData | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    if (!isOpen || !data.length) return null;

    // Handle select all
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedStudents(new Set());
        } else {
            const allIds = new Set(data.map(s => s.id));
            setSelectedStudents(allIds);
        }
        setSelectAll(!selectAll);
    };

    // Handle individual student selection
    const handleSelectStudent = (studentId: string) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
        setSelectAll(newSelected.size === data.length);
    };

    // Archive with selected students
    const handleArchive = async () => {
        if (selectedStudents.size === 0) {
            alert('Please select at least one student to archive');
            return;
        }

        setLoading(true);
        try {
            const studentIds = Array.from(selectedStudents);
            await onArchive(selectedType, studentIds);
            onClose();
        } catch (error) {
            console.error('Archive failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle preview student - opens in a proper popup modal
    const handlePreviewStudent = (student: StudentData) => {
        setPreviewStudent(student);
        setShowPreviewModal(true);
    };

    const currentStudent = data[selectedStudentIndex];
    const selectedCount = selectedStudents.size;

    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800">📋 Report Cards Preview</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="px-6 pt-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg">
                            <label className="text-sm font-medium text-slate-700">Report Type:</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as any)}
                                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                            >
                                <option value="qa1">Quarterly Assessment 1 (QA1)</option>
                                <option value="qa2">Quarterly Assessment 2 (QA2)</option>
                                <option value="endOfTerm">End of Term</option>
                                <option value="overall">Complete Report Card (Overall)</option>
                                <option value="all">All Reports (QA1, QA2, End Term & Overall)</option>
                            </select>
                        </div>

                        {/* Selection Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100"
                            >
                                {selectAll ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                {selectAll ? 'Deselect All' : 'Select All'}
                            </button>
                            <span className="text-sm text-slate-600">
                                {selectedCount} of {data.length} selected
                            </span>
                        </div>

                        {/* Student Navigation (only show when 1 student selected for preview) */}
                        {selectedStudents.size === 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedStudentIndex(prev => Math.max(0, prev - 1))}
                                    disabled={selectedStudentIndex === 0}
                                    className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm">
                                    Student {selectedStudentIndex + 1} of {data.length}
                                </span>
                                <button
                                    onClick={() => setSelectedStudentIndex(prev => Math.min(data.length - 1, prev + 1))}
                                    disabled={selectedStudentIndex === data.length - 1}
                                    className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* NEW: INFO BOX - FIXED ON TOP, NOT SCROLLABLE */}
                    <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex-shrink-0">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">📌</div>
                            <div>
                                <p className="font-semibold text-blue-800">{selectedCount} student(s) selected</p>
                                <p className="text-sm text-blue-700 mt-1">Click "Archive" to archive all selected students</p>
                                <p className="text-sm text-blue-700">Select a single student or click <span className="font-medium bg-blue-200 px-2 py-0.5 rounded">Preview</span> button to preview their report card</p>
                            </div>
                        </div>
                    </div>

                    {/* Student List with Checkboxes and Preview Buttons - SCROLLABLE */}
                    <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                        <div className="max-h-48 overflow-y-auto">
                            <div className="space-y-1">
                                {data.map((student, idx) => (
                                    <div
                                        key={student.id}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedStudents.has(student.id)
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.has(student.id)}
                                            onChange={() => handleSelectStudent(student.id)}
                                            className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                                        />
                                        <span
                                            className="font-mono text-sm w-32 cursor-pointer"
                                            onClick={() => {
                                                setSelectedStudents(new Set([student.id]));
                                                setSelectAll(false);
                                                setSelectedStudentIndex(idx);
                                            }}
                                        >
                                            {student.examNumber}
                                        </span>
                                        <span
                                            className="flex-1 text-sm cursor-pointer"
                                            onClick={() => {
                                                setSelectedStudents(new Set([student.id]));
                                                setSelectAll(false);
                                                setSelectedStudentIndex(idx);
                                            }}
                                        >
                                            {student.name}
                                        </span>

                                        {/* Preview Button - TEXT instead of Eye icon */}
                                        <button
                                            onClick={() => handlePreviewStudent(student)}
                                            className="px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                                        >
                                            Preview
                                        </button>

                                        {selectedStudents.has(student.id) && (
                                            <span className="text-xs text-indigo-600">✓ Selected</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview content area - SCROLLABLE */}
                    <div className="flex-1 overflow-auto p-6">
                        {selectedStudents.size === 1 ? (
                            selectedType === 'all' ? (
                                <div className="space-y-8">
                                    <div>
                                        <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                                            <h3 className="text-lg font-semibold text-indigo-800">QA1 Assessment</h3>
                                        </div>
                                        <QAAssessment studentData={currentStudent} activeTab="qa1" showPDFOnly={true} />
                                    </div>
                                    <div className="border-t pt-8">
                                        <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                                            <h3 className="text-lg font-semibold text-indigo-800">QA2 Assessment</h3>
                                        </div>
                                        <QAAssessment studentData={currentStudent} activeTab="qa2" showPDFOnly={true} />
                                    </div>
                                    <div className="border-t pt-8">
                                        <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                                            <h3 className="text-lg font-semibold text-indigo-800">End of Term Assessment</h3>
                                        </div>
                                        <QAAssessment studentData={currentStudent} activeTab="endOfTerm" showPDFOnly={true} />
                                    </div>
                                    <div className="border-t pt-8">
                                        <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                                            <h3 className="text-lg font-semibold text-indigo-800">Complete Report Card (Overall)</h3>
                                        </div>
                                        <ReportCard studentData={currentStudent} showActions={false} showPDFOnly={true} />
                                    </div>
                                </div>
                            ) : selectedType === 'overall' ? (
                                <ReportCard studentData={currentStudent} showActions={false} showPDFOnly={true} />
                            ) : (
                                <QAAssessment
                                    studentData={currentStudent}
                                    activeTab={selectedType as 'qa1' | 'qa2' | 'endOfTerm'}
                                    showPDFOnly={true}
                                />
                            )
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p className="text-lg">📌 {selectedCount} student(s) selected</p>
                                <p className="text-sm mt-2">Click "Archive" to archive all selected students</p>
                                <p className="text-xs mt-4">Select a single student or click "Preview" to preview their report card</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleArchive}
                            disabled={loading || selectedStudents.size === 0}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Archiving {selectedCount} student(s)...
                                </>
                            ) : (
                                <>
                                    <span>📋</span>
                                    Archive {selectedType === 'all' ? 'All Reports' :
                                        selectedType === 'qa1' ? 'QA1' :
                                            selectedType === 'qa2' ? 'QA2' :
                                                selectedType === 'endOfTerm' ? 'End of Term' :
                                                    'Complete Report Card'}
                                    ({selectedCount})
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* POPUP PREVIEW MODAL - Proper popup on top */}
            {showPreviewModal && previewStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    Preview Report Card
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {previewStudent.name} ({previewStudent.examNumber})
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-6 bg-slate-50">
                            {selectedType === 'all' ? (
                                <div className="space-y-8">
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                                            <h3 className="text-lg font-semibold text-indigo-800">QA1 Assessment</h3>
                                        </div>
                                        <QAAssessment studentData={previewStudent} activeTab="qa1" showPDFOnly={true} />
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                                            <h3 className="text-lg font-semibold text-indigo-800">QA2 Assessment</h3>
                                        </div>
                                        <QAAssessment studentData={previewStudent} activeTab="qa2" showPDFOnly={true} />
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                                            <h3 className="text-lg font-semibold text-indigo-800">End of Term Assessment</h3>
                                        </div>
                                        <QAAssessment studentData={previewStudent} activeTab="endOfTerm" showPDFOnly={true} />
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                                            <h3 className="text-lg font-semibold text-indigo-800">Complete Report Card (Overall)</h3>
                                        </div>
                                        <ReportCard studentData={previewStudent} showActions={false} showPDFOnly={true} />
                                    </div>
                                </div>
                            ) : selectedType === 'overall' ? (
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <ReportCard studentData={previewStudent} showActions={false} showPDFOnly={true} />
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <QAAssessment
                                        studentData={previewStudent}
                                        activeTab={selectedType as 'qa1' | 'qa2' | 'endOfTerm'}
                                        showPDFOnly={true}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t flex justify-end gap-3 bg-white">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    if (!selectedStudents.has(previewStudent.id)) {
                                        handleSelectStudent(previewStudent.id);
                                    }
                                    setShowPreviewModal(false);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                {selectedStudents.has(previewStudent.id) ? '✓ Already Selected' : '+ Select This Student'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PreviewReportModal;

// import React, { useState } from 'react';
// import { X } from 'lucide-react';
// import { StudentData } from '@/services/studentService';
// import QAAssessment from '@/components/app/searchResults/QAAssessment';
// import ReportCard from '@/components/app/searchResults/ReportCard';
// // import QAAssessment from '@/components/QAAssessment';
// // import ReportCard from '@/components/ReportCard';

// interface PreviewReportModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     data: StudentData[];
//     onArchive: (assessmentType: 'qa1' | 'qa2' | 'endOfTerm' | 'overall' | 'all') => Promise<void>;
//     classId?: string;
//     term?: string;
// }

// const PreviewReportModal: React.FC<PreviewReportModalProps> = ({
//     isOpen,
//     onClose,
//     data,
//     onArchive,
//     classId,
//     term
// }) => {
//     const [selectedType, setSelectedType] = useState<'qa1' | 'qa2' | 'endOfTerm' | 'overall' | 'all'>('overall');
//     const [loading, setLoading] = useState(false);
//     const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);

//     if (!isOpen || !data.length) return null;

//     const handleArchive = async () => {
//         setLoading(true);
//         try {
//             await onArchive(selectedType);
//             onClose();
//         } catch (error) {
//             console.error('Archive failed:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const currentStudent = data[selectedStudentIndex];

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
//                 <div className="flex items-center justify-between p-6 border-b border-slate-200">
//                     <h2 className="text-xl font-semibold text-slate-800">📋 Report Cards Preview</h2>
//                     <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 {/* Controls */}
//                 <div className="px-6 pt-4 flex items-center justify-between">
//                     <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg">
//                         <label className="text-sm font-medium text-slate-700">Report Type:</label>
//                         <select
//                             value={selectedType}
//                             onChange={(e) => setSelectedType(e.target.value as any)}
//                             className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
//                         >
//                             <option value="qa1">Quarterly Assessment 1 (QA1)</option>
//                             <option value="qa2">Quarterly Assessment 2 (QA2)</option>
//                             <option value="endOfTerm">End of Term</option>
//                             <option value="overall">Complete Report Card (Overall)</option>
//                             <option value="all">All Reports (QA1, QA2, End Term & Overall)</option>
//                         </select>
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={() => setSelectedStudentIndex(prev => Math.max(0, prev - 1))}
//                             disabled={selectedStudentIndex === 0}
//                             className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
//                         >
//                             Previous
//                         </button>
//                         <span className="text-sm">
//                             Student {selectedStudentIndex + 1} of {data.length}
//                         </span>
//                         <button
//                             onClick={() => setSelectedStudentIndex(prev => Math.min(data.length - 1, prev + 1))}
//                             disabled={selectedStudentIndex === data.length - 1}
//                             className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </div>

//                 {/* Preview content */}
//                 <div className="flex-1 overflow-auto p-6">
//                     {/* {selectedType === 'all' ? (
//                         // Show all four reports
//                         <div className="space-y-8">
//                             <div>
//                                 <div className="bg-indigo-50 p-3 rounded-lg mb-4">
//                                     <h3 className="text-lg font-semibold text-indigo-800">QA1 Assessment</h3>
//                                 </div>
//                                 <QAAssessment studentData={currentStudent} activeTab="qa1" />
//                             </div>

//                             <div className="border-t pt-8">
//                                 <div className="bg-indigo-50 p-3 rounded-lg mb-4">
//                                     <h3 className="text-lg font-semibold text-indigo-800">QA2 Assessment</h3>
//                                 </div>
//                                 <QAAssessment studentData={currentStudent} activeTab="qa2" />
//                             </div>

//                             <div className="border-t pt-8">
//                                 <div className="bg-indigo-50 p-3 rounded-lg mb-4">
//                                     <h3 className="text-lg font-semibold text-indigo-800">End of Term Assessment</h3>
//                                 </div>
//                                 <QAAssessment studentData={currentStudent} activeTab="endOfTerm" />
//                             </div>

//                             <div className="border-t pt-8">
//                                 <div className="bg-indigo-50 p-3 rounded-lg mb-4">
//                                     <h3 className="text-lg font-semibold text-indigo-800">Complete Report Card (Overall)</h3>
//                                 </div>
//                                 <ReportCard studentData={currentStudent} showActions={false} />
//                             </div>
//                         </div>
//                     ) : selectedType === 'overall' ? (
//                         <ReportCard studentData={currentStudent} showActions={false} />
//                     ) : (
//                         <QAAssessment
//                             studentData={currentStudent}
//                             activeTab={selectedType as 'qa1' | 'qa2' | 'endOfTerm'}
//                         />
//                     )} */}
//                     {selectedType === 'all' ? (
//                         // Show all four reports
//                         <div className="space-y-8">
//                             <div>
//                                 <div className="bg-indigo-50 p-3 rounded-lg mb-4">
//                                     <h3 className="text-lg font-semibold text-indigo-800">QA1 Assessment</h3>
//                                 </div>
//                                 <QAAssessment studentData={currentStudent} activeTab="qa1" showPDFOnly={true} />
//                             </div>

//                             <div className="border-t pt-8">
//                                 <div className="bg-indigo-50 p-3 rounded-lg mb-4">
//                                     <h3 className="text-lg font-semibold text-indigo-800">QA2 Assessment</h3>
//                                 </div>
//                                 <QAAssessment studentData={currentStudent} activeTab="qa2" showPDFOnly={true} />
//                             </div>

//                             <div className="border-t pt-8">
//                                 <div className="bg-indigo-50 p-3 rounded-lg mb-4">
//                                     <h3 className="text-lg font-semibold text-indigo-800">End of Term Assessment</h3>
//                                 </div>
//                                 <QAAssessment studentData={currentStudent} activeTab="endOfTerm" showPDFOnly={true} />
//                             </div>

//                             <div className="border-t pt-8">
//                                 <div className="bg-indigo-50 p-3 rounded-lg mb-4">
//                                     <h3 className="text-lg font-semibold text-indigo-800">Complete Report Card (Overall)</h3>
//                                 </div>
//                                 <ReportCard studentData={currentStudent} showActions={false} showPDFOnly={true} />
//                             </div>
//                         </div>
//                     ) : selectedType === 'overall' ? (
//                         <ReportCard studentData={currentStudent} showActions={false} showPDFOnly={true} />
//                     ) : (
//                         <QAAssessment
//                             studentData={currentStudent}
//                             activeTab={selectedType as 'qa1' | 'qa2' | 'endOfTerm'}
//                             showPDFOnly={true}
//                         />
//                     )}
//                 </div>

//                 <div className="p-6 border-t flex justify-end gap-2">
//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//                     >
//                         Close
//                     </button>
//                     <button
//                         onClick={handleArchive}
//                         disabled={loading}
//                         className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
//                     >
//                         {loading ? (
//                             <>
//                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                 Archiving...
//                             </>
//                         ) : (
//                             <>
//                                 <span>📋</span> Archive {selectedType === 'all' ? 'All Reports' :
//                                     selectedType === 'qa1' ? 'QA1' :
//                                         selectedType === 'qa2' ? 'QA2' :
//                                             selectedType === 'endOfTerm' ? 'End of Term' :
//                                                 'Complete Report Card'}
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PreviewReportModal;