import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Save, X, Search, AlertCircle, CheckCircle, FileSpreadsheet, ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';

interface CustomMockExam {
    id: string;
    name: string;
    description: string;
    maxScore: number;
    createdAt: Date;
}

interface NationalMockExamResultsEntryProps {
    examType: 'PSLCE' | 'JCE' | 'MSCE' | 'MOCK';
    schoolLevel: 'primary' | 'secondary';
    students: any[];
    subjects: any[];
    onSave: (results: any[]) => Promise<void>;
    onBack: () => void;
    showMessage: (msg: string, isError?: boolean) => void;
    onExamTypeChange?: (type: 'PSLCE' | 'JCE' | 'MSCE' | 'MOCK', mockExamId?: string) => void;
}

// Subject configurations for each exam type
// const getSubjectsForExam = (examType: string, schoolLevel: string) => {
//     if (examType === 'PSLCE' || (examType === 'MOCK' && schoolLevel === 'primary')) {
//         return [
//             { id: 'eng', name: 'English', maxScore: 100 },
//             { id: 'math', name: 'Mathematics', maxScore: 100 },
//             { id: 'science', name: 'Science', maxScore: 100 },
//             { id: 'chichewa', name: 'Chichewa', maxScore: 100 },
//             { id: 'social', name: 'Social Studies', maxScore: 100 }
//         ];
//     }

//     if (examType === 'JCE' || (examType === 'MOCK' && schoolLevel === 'secondary')) {
//         return [
//             { id: 'eng', name: 'English', maxScore: 100 },
//             { id: 'math', name: 'Mathematics', maxScore: 100 },
//             { id: 'bio', name: 'Biology', maxScore: 100 },
//             { id: 'chem', name: 'Chemistry', maxScore: 100 },
//             { id: 'physics', name: 'Physics', maxScore: 100 }
//         ];
//     }

//     if (examType === 'MSCE') {
//         return [
//             { id: 'eng', name: 'English', maxScore: 100 },
//             { id: 'math', name: 'Mathematics', maxScore: 100 },
//             { id: 'bio', name: 'Biology', maxScore: 100 },
//             { id: 'chem', name: 'Chemistry', maxScore: 100 },
//             { id: 'physics', name: 'Physics', maxScore: 100 }
//         ];
//     }

//     return [];
// };

// Convert score to grade based on exam type
const getGradeFromScore = (score: number, examType: string): string => {
    if (examType === 'MSCE') {
        if (score >= 80) return '1';
        if (score >= 75) return '2';
        if (score >= 70) return '3';
        if (score >= 65) return '4';
        if (score >= 60) return '5';
        if (score >= 55) return '6';
        if (score >= 50) return '7';
        if (score >= 45) return '8';
        return '9';
    } else {
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        if (score >= 40) return 'E';
        return 'F';
    }
};

// Load saved custom mocks from localStorage
// const loadCustomMocks = (): CustomMockExam[] => {
//     const saved = localStorage.getItem('customMockExams');
//     if (saved) {
//         try {
//             return JSON.parse(saved);
//         } catch (e) {
//             return [];
//         }
//     }
//     return [];
// };

// // Save custom mocks to localStorage
// const saveCustomMocks = (mocks: CustomMockExam[]) => {
//     localStorage.setItem('customMockExams', JSON.stringify(mocks));
// };

// // Load scores for custom mocks
// const loadMockScores = () => {
//     const saved = localStorage.getItem('mockExamScores');
//     if (saved) {
//         try {
//             return JSON.parse(saved);
//         } catch (e) {
//             return {};
//         }
//     }
//     return {};
// };

// // Save scores for custom mocks
// const saveMockScores = (scores: any) => {
//     localStorage.setItem('mockExamScores', JSON.stringify(scores));
// };

// Get current school ID from localStorage
const getCurrentSchoolId = (): string => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.schoolId || 'default';
        }
    } catch (e) {
        console.error('Failed to get school ID', e);
    }
    return 'default';
};

// Load saved custom mocks from localStorage - SCOPED BY SCHOOL
const loadCustomMocks = (): CustomMockExam[] => {
    const schoolId = getCurrentSchoolId();
    const saved = localStorage.getItem(`customMockExams_${schoolId}`);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return [];
        }
    }
    return [];
};

// Save custom mocks to localStorage - SCOPED BY SCHOOL
const saveCustomMocks = (mocks: CustomMockExam[]) => {
    const schoolId = getCurrentSchoolId();
    localStorage.setItem(`customMockExams_${schoolId}`, JSON.stringify(mocks));
};

// Load scores for custom mocks - SCOPED BY SCHOOL
const loadMockScores = () => {
    const schoolId = getCurrentSchoolId();
    const saved = localStorage.getItem(`mockExamScores_${schoolId}`);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return {};
        }
    }
    return {};
};

// Save scores for custom mocks - SCOPED BY SCHOOL
const saveMockScores = (scores: any) => {
    const schoolId = getCurrentSchoolId();
    localStorage.setItem(`mockExamScores_${schoolId}`, JSON.stringify(scores));
};

const NationalMockExamResultsEntry: React.FC<NationalMockExamResultsEntryProps> = ({
    examType,
    schoolLevel,
    students,
    subjects,
    onSave,
    onBack,
    showMessage,
    onExamTypeChange
}) => {
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
    const [customMocks, setCustomMocks] = useState<CustomMockExam[]>([]);
    const [showCreateMockModal, setShowCreateMockModal] = useState(false);
    const [newMockName, setNewMockName] = useState('');
    const [newMockDescription, setNewMockDescription] = useState('');
    const [newMockMaxScore, setNewMockMaxScore] = useState(100);
    const [editingMock, setEditingMock] = useState<CustomMockExam | null>(null);
    const [mockScores, setMockScores] = useState<any>({});

    // const examSubjects = getSubjectsForExam(examType, schoolLevel);
    // Use subjects from database - map to the format expected by the component
const examSubjects = subjects.map(subject => ({
    id: subject.id,
    name: subject.name,
    maxScore: 100
}));

    // Load custom mocks and scores on mount
    useEffect(() => {
        const mocks = loadCustomMocks();
        setCustomMocks(mocks);
        const scores = loadMockScores();
        setMockScores(scores);
    }, []);

    const getClassOptions = () => {
        if (schoolLevel === 'primary') {
            return [{ id: 'standard8', name: 'Standard 8' }];
        } else {
            const allClasses = Array.from(new Map(students.map(s => [s.class?.id, { id: s.class?.id, name: s.class?.name }])).values())
                .filter(c => c.id);
            return allClasses.filter(cls =>
                cls.name?.toLowerCase().includes('form 2') ||
                cls.name?.toLowerCase().includes('form 4') ||
                cls.name?.toLowerCase().includes('form2') ||
                cls.name?.toLowerCase().includes('form4')
            );
        }
    };

    const classOptions = getClassOptions();

    useEffect(() => {
        if (schoolLevel === 'primary') {
            setSelectedClass('standard8');
        } else if (classOptions.length > 0 && !selectedClass) {
            setSelectedClass(classOptions[0].id);
        }
    }, []);

    // ADD THIS NEW useEffect AFTER THE ONE ABOVE
    useEffect(() => {
        // Only run when on MANEB tab (not MOCK) and we have a selected class
        if (examType !== 'MOCK' && schoolLevel === 'secondary' && selectedClass) {
            const selectedClassObj = classOptions.find(c => c.id === selectedClass);
            const className = selectedClassObj?.name?.toLowerCase() || '';

            // Determine the correct exam type based on selected class
            let correctExamType: 'JCE' | 'MSCE' = 'JCE';
            if (className.includes('form 4')) {
                correctExamType = 'MSCE';
            } else if (className.includes('form 2')) {
                correctExamType = 'JCE';
            }

            // If the current examType doesn't match the correct one, update it
            if (examType !== correctExamType) {
                onExamTypeChange?.(correctExamType);
            }
        }
    }, [selectedClass, classOptions, examType, schoolLevel]);

    const filteredStudents = students.filter(student => {
        if (schoolLevel === 'primary') {
            const isStandard8 = student.class?.name?.toLowerCase().includes('standard 8') ||
                student.class?.name?.toLowerCase().includes('std 8');
            if (!selectedClass || selectedClass === 'standard8') {
                return isStandard8;
            }
            return false;
        } else {
            const matchesClass = !selectedClass || student.class?.id === selectedClass;
            const matchesSearch = !searchTerm ||
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.examNumber.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesClass && matchesSearch;
        }
    });

    const finalFilteredStudents = schoolLevel === 'primary'
        ? filteredStudents.filter(student => {
            const matchesSearch = !searchTerm ||
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.examNumber.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        : filteredStudents;

    const getScoreForMock = (studentId: string, mockId: string, subjectId: string): number | string => {
        return mockScores[studentId]?.[mockId]?.[subjectId] ?? '';
    };

    const updateScoreForMock = (studentId: string, mockId: string, subjectId: string, value: string) => {
        const numValue = value === '' ? 0 : Math.min(100, Math.max(0, parseInt(value) || 0));
        const newScores = { ...mockScores };
        if (!newScores[studentId]) newScores[studentId] = {};
        if (!newScores[studentId][mockId]) newScores[studentId][mockId] = {};
        newScores[studentId][mockId][subjectId] = numValue;
        setMockScores(newScores);
        saveMockScores(newScores);
    };

    const loadStudentResults = (student: any) => {
        setSelectedStudent(student);
    };

    const handleSaveCurrentStudent = async () => {
        if (!selectedStudent) return;
        setSaving(true);
        try {
            const resultsToSave = [];

            if (examType !== 'MOCK') {
                // Save MANEB exam scores
                const manebScores: Record<string, number> = {};
                for (const subject of examSubjects) {
                    const score = getScoreForMock(selectedStudent.id, 'maneb', subject.id);
                    if (score !== '' && Number(score) > 0) {
                        manebScores[subject.id] = Number(score);
                    }
                }
                if (Object.keys(manebScores).length > 0) {
                    resultsToSave.push({
                        studentId: selectedStudent.id,
                        studentName: selectedStudent.name,
                        examNumber: selectedStudent.examNumber,
                        examType: examType,
                        scores: manebScores,
                        year: new Date().getFullYear()
                    });
                }
            } else {
                // Save custom mock scores
                for (const mock of customMocks) {
                    const scores = mockScores[selectedStudent.id]?.[mock.id] || {};
                    if (Object.keys(scores).length > 0) {
                        resultsToSave.push({
                            studentId: selectedStudent.id,
                            studentName: selectedStudent.name,
                            examNumber: selectedStudent.examNumber,
                            examType: 'MOCK',
                            mockExamId: mock.id,
                            mockExamName: mock.name,
                            scores: scores,
                            year: new Date().getFullYear()
                        });
                    }
                }
            }

            await onSave(resultsToSave);
            showMessage(`Results saved for ${selectedStudent.name}!`);
        } catch (error) {
            showMessage('Failed to save results', true);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateMockExam = () => {
        if (!newMockName.trim()) {
            showMessage('Please enter a mock exam name', true);
            return;
        }

        if (editingMock) {
            const updatedMocks = customMocks.map(mock =>
                mock.id === editingMock.id
                    ? { ...mock, name: newMockName, description: newMockDescription, maxScore: newMockMaxScore }
                    : mock
            );
            setCustomMocks(updatedMocks);
            saveCustomMocks(updatedMocks);
            showMessage(`Mock exam "${newMockName}" updated!`);
        } else {
            const newMock: CustomMockExam = {
                id: Date.now().toString(),
                name: newMockName,
                description: newMockDescription,
                maxScore: newMockMaxScore,
                createdAt: new Date()
            };
            const updatedMocks = [...customMocks, newMock];
            setCustomMocks(updatedMocks);
            saveCustomMocks(updatedMocks);
            showMessage(`Mock exam "${newMockName}" created!`);
        }

        setNewMockName('');
        setNewMockDescription('');
        setNewMockMaxScore(100);
        setEditingMock(null);
        setShowCreateMockModal(false);
    };

    const handleEditMockExam = (mock: CustomMockExam) => {
        setEditingMock(mock);
        setNewMockName(mock.name);
        setNewMockDescription(mock.description || '');
        setNewMockMaxScore(mock.maxScore);
        setShowCreateMockModal(true);
    };

    const handleDeleteMockExam = (mockId: string) => {
        if (window.confirm('Are you sure you want to delete this mock exam? All associated scores will be lost.')) {
            const updatedMocks = customMocks.filter(m => m.id !== mockId);
            setCustomMocks(updatedMocks);
            saveCustomMocks(updatedMocks);

            const updatedScores = { ...mockScores };
            Object.keys(updatedScores).forEach(studentId => {
                delete updatedScores[studentId][mockId];
                if (Object.keys(updatedScores[studentId]).length === 0) {
                    delete updatedScores[studentId];
                }
            });
            setMockScores(updatedScores);
            saveMockScores(updatedScores);
            showMessage('Mock exam deleted!');
        }
    };

    const getExamTitle = () => {
        // Get class name from the filtered students if available
        let className = '';

        if (schoolLevel === 'primary') {
            className = 'Standard 8';
        } else {
            // First try to get from selectedClass filter
            const selectedClassObj = classOptions.find(c => c.id === selectedClass);
            if (selectedClassObj && selectedClassObj.name) {
                className = selectedClassObj.name;
            }
            // If no class selected in filter, try to get from first filtered student
            else if (finalFilteredStudents.length > 0 && finalFilteredStudents[0].class?.name) {
                className = finalFilteredStudents[0].class.name;
            }
            // Last resort - use first available class option
            else if (classOptions.length > 0 && classOptions[0].name) {
                className = classOptions[0].name;
            }
        }

        if (examType === 'MOCK') {
            if (schoolLevel === 'primary') {
                return `PSLCE Mock Exam Results - ${className}`;
            } else {
                if (className.toLowerCase().includes('form 2')) {
                    return `JCE Mock Exam Results - ${className}`;
                } else if (className.toLowerCase().includes('form 4')) {
                    return `MSCE Mock Exam Results - ${className}`;
                }
                return `Mock Exam Results - ${className}`;
            }
        }

        if (examType === 'PSLCE') return `PSLCE National Exam Results - ${className}`;
        if (examType === 'JCE') return `JCE National Exam Results - ${className}`;
        if (examType === 'MSCE') return `MSCE National Exam Results - ${className}`;

        return `Exam Results - ${className}`;
    };

    // If a student is selected, show individual entry screen with custom mock columns
    if (selectedStudent) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setSelectedStudent(null);
                            }}
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">{selectedStudent.name}</h2>
                            <p className="text-sm text-slate-500">{selectedStudent.examNumber} | {selectedStudent.class?.name || 'No Class'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveCurrentStudent}
                        disabled={saving}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Results
                            </>
                        )}
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">
                            {examType === 'MOCK' ? 'Mock Exam Scores' : `${examType} National Exam Scores`}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Enter scores for each subject (0-100)</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Subject</th>
                                    {/* For MANEB exams - single score column */}
                                    {examType !== 'MOCK' && (
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">
                                            Score (0-100)
                                        </th>
                                    )}
                                    {/* For MOCK exams - multiple custom mock columns */}
                                    {examType === 'MOCK' && customMocks.map(mock => (
                                        <th key={mock.id} className="text-center px-6 py-3 text-sm font-semibold text-slate-600">
                                            {mock.name}
                                            <br />
                                            <span className="text-xs font-normal">(0-{mock.maxScore})</span>
                                        </th>
                                    ))}
                                    <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {examSubjects.map((subject) => {
                                    let totalScore = 0;
                                    let validScores = 0;

                                    return (
                                        <tr key={subject.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-800">{subject.name}</td>

                                            {/* For MANEB exams - single score input */}
                                            {examType !== 'MOCK' && (
                                                <td className="px-6 py-4 text-center">
                                                    <div className="relative flex items-center justify-center gap-1">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={getScoreForMock(selectedStudent.id, 'maneb', subject.id)}
                                                            onChange={(e) => updateScoreForMock(selectedStudent.id, 'maneb', subject.id, e.target.value)}
                                                            className="w-24 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-slate-300"
                                                            placeholder="-"
                                                        />
                                                    </div>
                                                </td>
                                            )}

                                            {/* For MOCK exams - multiple custom mock columns */}
                                            {examType === 'MOCK' && customMocks.map(mock => {
                                                const currentScore = getScoreForMock(selectedStudent.id, mock.id, subject.id);
                                                const scoreNum = currentScore !== '' ? Number(currentScore) : 0;
                                                if (scoreNum > 0) {
                                                    totalScore += scoreNum;
                                                    validScores++;
                                                }

                                                return (
                                                    <td key={mock.id} className="px-6 py-4 text-center">
                                                        <div className="relative flex items-center justify-center gap-1">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={mock.maxScore}
                                                                value={currentScore}
                                                                onChange={(e) => updateScoreForMock(selectedStudent.id, mock.id, subject.id, e.target.value)}
                                                                className={`w-24 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${currentScore !== '' && Number(currentScore) >= 0
                                                                    ? 'border-purple-300 bg-purple-50'
                                                                    : 'border-slate-300'
                                                                    }`}
                                                                placeholder="-"
                                                            />
                                                            {currentScore !== '' && Number(currentScore) >= 0 && (
                                                                <button
                                                                    onClick={() => updateScoreForMock(selectedStudent.id, mock.id, subject.id, '')}
                                                                    className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                                    title="Clear score"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}

                                            <td className="px-6 py-4 text-center font-bold">
                                                {(() => {
                                                    let grade = '-';
                                                    if (examType !== 'MOCK') {
                                                        const score = getScoreForMock(selectedStudent.id, 'maneb', subject.id);
                                                        if (score !== '' && Number(score) > 0) {
                                                            grade = getGradeFromScore(Number(score), examType);
                                                        }
                                                    } else if (validScores > 0) {
                                                        const avgScore = totalScore / validScores;
                                                        grade = getGradeFromScore(avgScore, 'MOCK');
                                                    }
                                                    return grade !== '-' ? (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${grade === 'A' || grade === '1' || grade === 'Distinction' ? 'bg-emerald-100 text-emerald-700' :
                                                            grade === 'B' || grade === '2' || grade === 'Merit' ? 'bg-blue-100 text-blue-700' :
                                                                grade === 'C' || grade === '3' || grade === 'Credit' ? 'bg-amber-100 text-amber-700' :
                                                                    grade === 'D' || grade === '4' ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-red-100 text-red-700'
                                                            }`}>
                                                            {grade}
                                                        </span>
                                                    ) : '-';
                                                })()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>



            </div>
        );
    }

    // Student list view
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{getExamTitle()}</h2>
                    <p className="text-slate-500">Click on a student to enter their exam results</p>
                </div>
                {/* <button
                    onClick={onBack}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button> */}
            </div>

            {/* Exam Type Selector */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <button
                    onClick={() => {
                        if (schoolLevel === 'primary') {
                            onExamTypeChange?.('PSLCE');
                        } else {
                            // For secondary, check what class is selected in the filter dropdown
                            const selectedClassObj = classOptions.find(c => c.id === selectedClass);
                            const className = selectedClassObj?.name?.toLowerCase() || '';

                            // If Form 4 is selected, use MSCE, otherwise use JCE
                            if (className.includes('form 4')) {
                                onExamTypeChange?.('MSCE');
                            } else {
                                // Default to JCE for Form 2 or when no class selected
                                onExamTypeChange?.('JCE');
                            }
                        }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${examType !== 'MOCK'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-slate-600 hover:bg-gray-300'
                        }`}
                >
                    {schoolLevel === 'primary'
                        ? 'PSLCE (MANEB)'
                        : schoolLevel === 'secondary'
                            ? (() => {
                                const selectedClassObj = classOptions.find(c => c.id === selectedClass);
                                const className = selectedClassObj?.name || '';
                                if (className.toLowerCase().includes('form 4')) {
                                    return 'MSCE (MANEB)';
                                } else {
                                    return 'JCE (MANEB)';
                                }
                            })()
                            : 'MANEB Exam'
                    }
                </button>

                <button
                    onClick={() => onExamTypeChange?.('MOCK')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${examType === 'MOCK'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-200 text-slate-600 hover:bg-gray-300'
                        }`}
                >
                    Mock Exam
                </button>
            </div>

            {/* Custom Mocks Section - Only shows when Mock Exam is selected */}
            {examType === 'MOCK' && (
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-slate-800">Custom Mock Exams</h3>
                        <button
                            onClick={() => {
                                setEditingMock(null);
                                setNewMockName('');
                                setNewMockDescription('');
                                setNewMockMaxScore(100);
                                setShowCreateMockModal(true);
                            }}
                            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add Mock
                        </button>
                    </div>

                    {customMocks.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">
                            No custom mocks created yet. Click "Add Mock" to create one.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {customMocks.map(mock => (
                                <div
                                    key={mock.id}
                                    className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-slate-100 text-slate-700"
                                >
                                    {mock.name}
                                    <span className="text-xs text-slate-400">(Max: {mock.maxScore})</span>
                                    <button
                                        onClick={() => handleEditMockExam(mock)}
                                        className="text-xs hover:text-indigo-600"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMockExam(mock.id)}
                                        className="text-xs hover:text-red-600"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Mock Exam Modal */}
            {showCreateMockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">
                                {editingMock ? 'Edit Mock Exam' : 'Create New Mock Exam'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateMockModal(false);
                                    setEditingMock(null);
                                    setNewMockName('');
                                    setNewMockDescription('');
                                    setNewMockMaxScore(100);
                                }}
                                className="p-1 hover:bg-slate-100 rounded"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Mock Exam Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newMockName}
                                    onChange={(e) => setNewMockName(e.target.value)}
                                    placeholder="e.g., Term 1 Mock, Mid-Year Mock"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newMockDescription}
                                    onChange={(e) => setNewMockDescription(e.target.value)}
                                    placeholder="e.g., First mock exam of the term"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Max Score (0-100)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newMockMaxScore}
                                    onChange={(e) => setNewMockMaxScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 100)))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCreateMockExam}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    {editingMock ? 'Update' : 'Create'} Mock Exam
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateMockModal(false);
                                        setEditingMock(null);
                                        setNewMockName('');
                                        setNewMockDescription('');
                                        setNewMockMaxScore(100);
                                    }}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'manual'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Manual Entry
                </button>
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'upload'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Excel Upload
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {schoolLevel === 'secondary' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Class</option>
                                {classOptions.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className={schoolLevel === 'secondary' ? "md:col-span-2" : "md:col-span-3"}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Search Student</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or exam number..."
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Grid/Layout */}
            {activeTab === 'manual' && (
                <>
                    {schoolLevel === 'secondary' && !selectedClass ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                            <p className="text-slate-500">Please select a class to view students</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {schoolLevel === 'primary' ? (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            Standard 8 - {new Date().getFullYear()}
                                        </h3>
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                                            {finalFilteredStudents.length} students
                                        </span>
                                    </div>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {finalFilteredStudents.map((student) => (
                                            <button
                                                key={student.id}
                                                onClick={() => loadStudentResults(student)}
                                                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left hover:bg-indigo-50"
                                            >
                                                <p className="font-mono text-sm text-indigo-600">{student.examNumber}</p>
                                                <p className="font-semibold text-slate-800 mt-1">{student.name}</p>
                                                <p className="text-sm text-slate-500">Standard 8</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                classOptions.map(cls => {
                                    const classStudents = finalFilteredStudents.filter(s => s.class?.id === cls.id);
                                    if (classStudents.length === 0) return null;

                                    return (
                                        <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    {cls.name}
                                                </h3>
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                                                    {classStudents.length} students
                                                </span>
                                            </div>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {classStudents.map((student) => (
                                                    <button
                                                        key={student.id}
                                                        onClick={() => loadStudentResults(student)}
                                                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left hover:bg-indigo-50"
                                                    >
                                                        <p className="font-mono text-sm text-indigo-600">{student.examNumber}</p>
                                                        <p className="font-semibold text-slate-800 mt-1">{student.name}</p>
                                                        <p className="text-sm text-slate-500">{cls.name}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Excel Upload Tab */}
            {activeTab === 'upload' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <div className="text-center">
                        <FileSpreadsheet className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload Excel File</h3>
                        <p className="text-slate-500 mb-4">
                            Upload an Excel file with student results. The file should have columns for:
                           Exam Number, {subjects.map(s => s.name).join(', ')}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download Template
                            </button>
                            <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Upload File
                                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={() => showMessage('Excel upload coming soon!')} />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NationalMockExamResultsEntry;