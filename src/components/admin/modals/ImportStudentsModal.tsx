import React, { useState, useCallback, useMemo } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, Search } from 'lucide-react';
import { previewImportFile, importSelectedStudents } from '@/services/studentService';

interface ImportStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    className: string;
    onSuccess: () => void;
}

interface PreviewStudent {
    id?: string;
    name: string;
    examNumber?: string;
    isValid: boolean;
    error?: string;
    selected: boolean;
}

const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
    isOpen,
    onClose,
    classId,
    className,
    onSuccess
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<PreviewStudent[]>([]);
    const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // ADD THIS

    // Filter preview data based on search term
    const filteredPreviewData = useMemo(() => {
        if (!searchTerm.trim()) return previewData;
        return previewData.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [previewData, searchTerm]);

    // Check if all filtered items are selected
    const isAllFilteredSelected = useMemo(() => {
        if (filteredPreviewData.length === 0) return false;
        return filteredPreviewData.every(s => s.selected);
    }, [filteredPreviewData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const validTypes = ['.csv', '.xlsx', '.xls', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
            const isValidType = validTypes.some(type =>
                selectedFile.name.endsWith(type) || selectedFile.type === type
            );

            if (!isValidType) {
                setError('Please upload CSV or Excel file (.csv, .xlsx, .xls)');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handlePreview = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const result = await previewImportFile(file, classId);
            const studentsWithSelection = result.students.map((student: any) => ({
                ...student,
                selected: true,
                isValid: true
            }));
            setPreviewData(studentsWithSelection);
            setSearchTerm(''); // Reset search when new file is loaded
            setStep('preview');
        } catch (err: any) {
            setError(err.message || 'Failed to preview file');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        const allSelected = previewData.every(s => s.selected);
        setPreviewData(prev => prev.map(s => ({ ...s, selected: !allSelected })));
    };

    // Toggle select only filtered (visible) students
    const toggleSelectFiltered = () => {
        const newSelectedState = !isAllFilteredSelected;
        setPreviewData(prev => prev.map(student => {
            const isInFilter = filteredPreviewData.some(f => f.name === student.name);
            if (isInFilter) {
                return { ...student, selected: newSelectedState };
            }
            return student;
        }));
    };

    const toggleSelectStudent = (index: number) => {
        // Need to find the actual student by name since filtered changes indices
        const student = filteredPreviewData[index];
        if (student) {
            setPreviewData(prev => prev.map(s =>
                s.name === student.name ? { ...s, selected: !s.selected } : s
            ));
        }
    };

    const handleImport = async () => {
        const selectedStudents = previewData.filter(s => s.selected);

        if (selectedStudents.length === 0) {
            setError('Please select at least one student to import');
            return;
        }

        setStep('importing');
        setLoading(true);
        setError(null);

        try {
            await importSelectedStudents(classId, selectedStudents);
            setSuccess(`Successfully imported ${selectedStudents.length} student(s) to ${className}`);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to import students');
            setStep('preview');
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        setFile(null);
        setPreviewData([]);
        setStep('upload');
        setError(null);
        setSuccess(null);
        setLoading(false);
        setSearchTerm('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Import Students from File</h3>
                        <p className="text-sm text-slate-500 mt-1">Class: {className}</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{success}</span>
                        </div>
                    )}

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-lg p-6 border-2 border-dashed border-slate-300">
                                <div className="text-center">
                                    <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-2">Upload CSV or Excel file with student names</p>
                                    <p className="text-xs text-slate-400 mb-4">Supported formats: .csv, .xlsx, .xls</p>

                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                            <Upload className="w-4 h-4" />
                                            Choose File
                                        </div>
                                    </label>

                                    {file && (
                                        <div className="mt-3 text-sm">
                                            <span className="text-emerald-600">Selected: {file.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-4">
                            {/* Search Bar - ADDED */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search students by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={previewData.length > 0 && previewData.every(s => s.selected)}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded text-indigo-600"
                                        />
                                        <span className="text-sm font-medium">Select All ({previewData.filter(s => s.selected).length}/{previewData.length})</span>
                                    </label>

                                    {/* Select Filtered Button - ADDED */}
                                    {searchTerm && filteredPreviewData.length > 0 && (
                                        <button
                                            onClick={toggleSelectFiltered}
                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            {isAllFilteredSelected ? 'Deselect' : 'Select'} Filtered ({filteredPreviewData.length})
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setStep('upload')}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    Upload Different File
                                </button>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left w-10">Select</th>
                                            <th className="px-4 py-2 text-left">Student Name</th>
                                            <th className="px-4 py-2 text-left">Exam Number (Auto-generated)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredPreviewData.map((student, index) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={student.selected}
                                                        onChange={() => toggleSelectStudent(index)}
                                                        className="w-4 h-4 rounded text-indigo-600"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 font-medium">{student.name}</td>
                                                <td className="px-4 py-2 font-mono text-indigo-600 text-xs">
                                                    {student.examNumber || 'Will be generated'}
                                                </td>
                                                {/* <td className="px-4 py-2 text-slate-500">{student.email || '-'}</td>
                                                <td className="px-4 py-2 text-slate-500">{student.phone || '-'}</td> */}
                                            </tr>
                                        ))}
                                        {filteredPreviewData.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                                                    No students match your search "{searchTerm}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
                                <strong>Note:</strong> Exam numbers will be auto-generated based on your school's format when imported.
                            </div>
                        </div>
                    )}

                    {step === 'importing' && (
                        <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                            <p className="text-slate-600">Importing students...</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    {step === 'upload' && file && (
                        <button
                            onClick={handlePreview}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Preview & Continue'}
                        </button>
                    )}

                    {step === 'preview' && (
                        <button
                            onClick={handleImport}
                            disabled={loading || previewData.filter(s => s.selected).length === 0}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            Import {previewData.filter(s => s.selected).length} Student(s)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportStudentsModal;