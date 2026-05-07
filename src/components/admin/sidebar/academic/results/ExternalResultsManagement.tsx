import React, { useState, useEffect } from 'react';
import { Download, Eye, FileSpreadsheet, GraduationCap, University } from 'lucide-react';

interface ExternalResultsManagementProps {
    classes: any[];
    students: any[];
    subjects: any[];
    schoolLevel: 'primary' | 'secondary';
    showMessage: (msg: string, isError?: boolean) => void;
}

interface CustomMockExam {
    id: string;
    name: string;
    description: string;
    maxScore: number;
    createdAt: Date;
}

interface MockScores {
    [studentId: string]: {
        [mockId: string]: {
            [subjectId: string]: number;
        };
    };
}

// Load custom mocks from localStorage - SCOPED BY SCHOOL
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

// Load scores for custom mocks - SCOPED BY SCHOOL
const loadMockScores = (): MockScores => {
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

// Subject configurations for each exam type
const getSubjectsForExam = (examType: string, schoolLevel: string) => {
    if (examType === 'PSLCE' || (examType === 'MOCK' && schoolLevel === 'primary')) {
        return [
            { id: 'eng', name: 'English', maxScore: 100 },
            { id: 'math', name: 'Mathematics', maxScore: 100 },
            { id: 'science', name: 'Science', maxScore: 100 },
            { id: 'chichewa', name: 'Chichewa', maxScore: 100 },
            { id: 'social', name: 'Social Studies', maxScore: 100 }
        ];
    }

    if (examType === 'JCE' || (examType === 'MOCK' && schoolLevel === 'secondary')) {
        return [
            { id: 'eng', name: 'English', maxScore: 100 },
            { id: 'math', name: 'Mathematics', maxScore: 100 },
            { id: 'bio', name: 'Biology', maxScore: 100 },
            { id: 'chem', name: 'Chemistry', maxScore: 100 },
            { id: 'physics', name: 'Physics', maxScore: 100 }
        ];
    }

    if (examType === 'MSCE') {
        return [
            { id: 'eng', name: 'English', maxScore: 100 },
            { id: 'math', name: 'Mathematics', maxScore: 100 },
            { id: 'bio', name: 'Biology', maxScore: 100 },
            { id: 'chem', name: 'Chemistry', maxScore: 100 },
            { id: 'physics', name: 'Physics', maxScore: 100 }
        ];
    }

    return [];
};

// Convert score to grade
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

const ExternalResultsManagement: React.FC<ExternalResultsManagementProps> = ({
    classes,
    students,
    subjects,
    schoolLevel,
    showMessage
}) => {
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'maneb' | 'mock' | 'secondarySelection' | 'universitySelection'>('maneb');
    const [customMocks, setCustomMocks] = useState<CustomMockExam[]>([]);
    const [mockScores, setMockScores] = useState<MockScores>({});
    const [loading, setLoading] = useState(false);

    // Get class options based on school level
    const getClassOptions = () => {
        if (schoolLevel === 'primary') {
            return [{ id: 'standard8', name: 'Standard 8' }];
        } else {
            // Secondary - only Form 2 and Form 4
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

    // Set default selected class
    useEffect(() => {
        if (schoolLevel === 'primary') {
            setSelectedClass('standard8');
        } else if (classOptions.length > 0 && !selectedClass) {
            setSelectedClass(classOptions[0].id);
        }
    }, [classOptions, schoolLevel]);

    // Load custom mocks and scores
    useEffect(() => {
        const mocks = loadCustomMocks();
        setCustomMocks(mocks);
        const scores = loadMockScores();
        setMockScores(scores);
    }, []);

    // Get students filtered by selected class
    const filteredStudents = students.filter(student => {
        if (schoolLevel === 'primary') {
            const isStandard8 = student.class?.name?.toLowerCase().includes('standard 8') ||
                student.class?.name?.toLowerCase().includes('std 8');
            return isStandard8;
        } else {
            return student.class?.id === selectedClass;
        }
    });

    // Determine exam type based on selected class
    const getExamType = (): 'PSLCE' | 'JCE' | 'MSCE' => {
        if (schoolLevel === 'primary') return 'PSLCE';

        const selectedClassObj = classOptions.find(c => c.id === selectedClass);
        const className = selectedClassObj?.name?.toLowerCase() || '';

        if (className.includes('form 4')) return 'MSCE';
        return 'JCE';
    };

    const examType = getExamType();
    const examSubjects = getSubjectsForExam(activeTab === 'maneb' ? examType : 'MOCK', schoolLevel);

    // Get score for MANEB exam
    const getManebScore = (studentId: string, subjectId: string): number | string => {
        const scores = mockScores[studentId]?.['maneb'];
        return scores?.[subjectId] ?? '';
    };

    // Get score for a specific mock
    const getMockScore = (studentId: string, mockId: string, subjectId: string): number | string => {
        return mockScores[studentId]?.[mockId]?.[subjectId] ?? '';
    };

    // Calculate student total and average for MANEB
    const calculateStudentManebTotal = (studentId: string): { total: number; average: number } => {
        let total = 0;
        let count = 0;

        for (const subject of examSubjects) {
            const score = getManebScore(studentId, subject.id);
            if (score !== '' && Number(score) > 0) {
                total += Number(score);
                count++;
            }
        }

        const average = count > 0 ? total / count : 0;
        return { total, average };
    };

    // Calculate student total and average for Mock
    const calculateStudentMockTotal = (studentId: string, mockId: string): { total: number; average: number } => {
        let total = 0;
        let count = 0;

        for (const subject of examSubjects) {
            const score = getMockScore(studentId, mockId, subject.id);
            if (score !== '' && Number(score) > 0) {
                total += Number(score);
                count++;
            }
        }

        const average = count > 0 ? total / count : 0;
        return { total, average };
    };

    // Get grade for a score
    const getGrade = (score: number): string => {
        if (schoolLevel === 'primary') {
            if (score >= 80) return 'A';
            if (score >= 70) return 'B';
            if (score >= 60) return 'C';
            if (score >= 50) return 'D';
            if (score >= 40) return 'E';
            return 'F';
        } else {
            const currentExamType = getExamType();
            return getGradeFromScore(score, currentExamType);
        }
    };

    // Get status (Pass/Fail)
    const getStatus = (score: number): string => {
        const grade = getGrade(score);
        if (grade === 'F' || grade === '9') return 'Fail';
        return 'Pass';
    };

    const classOptionsList = getClassOptions();
    const selectedClassObj = classOptionsList.find(c => c.id === selectedClass);
    const isFormFour = selectedClassObj?.name?.toLowerCase().includes('form 4') || false;
    const isFormTwo = selectedClassObj?.name?.toLowerCase().includes('form 2') || false;

    // Determine which tabs to show based on school level and selected class
    const getVisibleTabs = () => {
        const tabs = [];

        // MANEB tab - always show
        tabs.push({ id: 'maneb', label: `MANEB (${examType})`, icon: null });

        // Mock tab - always show
        tabs.push({ id: 'mock', label: 'Mock Exams', icon: null });

        // Secondary Selection tab - ONLY for Primary school
        if (schoolLevel === 'primary') {
            tabs.push({ id: 'secondarySelection', label: 'Secondary Selection', icon: GraduationCap });
        }

        // University Selection tab - ONLY for Form 4 in Secondary school
        if (schoolLevel === 'secondary' && isFormFour) {
            tabs.push({ id: 'universitySelection', label: 'University Selection', icon: University });
        }

        return tabs;
    };

    const visibleTabs = getVisibleTabs();

    // Render Secondary Selection tab (for Primary School)
    const renderSecondarySelection = () => {
        // Mock data - in real implementation, this would come from API/localStorage
        const secondarySelections = [
            { school: 'Chancellor College', program: 'Science', selectionRate: 45, studentsSelected: 12 },
            { school: 'Polytechnic', program: 'Engineering', selectionRate: 30, studentsSelected: 8 },
            { school: 'Kamuzu Academy', program: 'General', selectionRate: 25, studentsSelected: 6 },
        ];

        return (
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Secondary School Selections</h3>
                    <p className="text-sm text-blue-600">Students who have been selected to various secondary schools</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student Name</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Selected School</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Program</th>
                                <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.map((student, index) => {
                                const selection = secondarySelections[index % secondarySelections.length];
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                        <td className="px-4 py-3">{selection.school}</td>
                                        <td className="px-4 py-3">{selection.program}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                Selected
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-500">
                                        No students found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Render University Selection tab (for Form 4 Secondary)
    const renderUniversitySelection = () => {
        // Mock data - in real implementation, this would come from API/localStorage
        const universitySelections = [
            { university: 'University of Malawi', program: 'Medicine', selectionRate: 15, studentsSelected: 3 },
            { university: 'Mzuzu University', program: 'Engineering', selectionRate: 20, studentsSelected: 4 },
            { university: 'Lilongwe University', program: 'Education', selectionRate: 35, studentsSelected: 7 },
            { university: 'Malawi University of Business', program: 'Business', selectionRate: 30, studentsSelected: 6 },
        ];

        return (
            <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-800 mb-2">University Selections</h3>
                    <p className="text-sm text-purple-600">Form 4 students who have been selected to various universities</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student Name</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">University</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Program</th>
                                <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.map((student, index) => {
                                const selection = universitySelections[index % universitySelections.length];
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                        <td className="px-4 py-3">{selection.university}</td>
                                        <td className="px-4 py-3">{selection.program}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                Selected
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-500">
                                        No students found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">External Exam Results</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            View MANEB, Mock exam results, and student selections
                        </p>
                    </div>

                    {schoolLevel === 'secondary' && (
                        <div className="min-w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                {classOptions.map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Tab Navigation - Dynamically shows only relevant tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6">
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.icon && <tab.icon className="w-4 h-4" />}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content based on active tab */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading results...</p>
                    </div>
                ) : activeTab === 'maneb' ? (
                    /* MANEB Results Table */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student Name</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                    {examSubjects.map(subject => (
                                        <th key={subject.id} className="text-center px-4 py-3 text-sm font-semibold text-slate-600">
                                            {subject.name}
                                        </th>
                                    ))}
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Total</th>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Average</th>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Grade</th>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((student) => {
                                    const { total, average } = calculateStudentManebTotal(student.id);
                                    const grade = average > 0 ? getGrade(average) : '-';
                                    const status = average > 0 ? getStatus(average) : '-';

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                            <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                            {examSubjects.map(subject => {
                                                const score = getManebScore(student.id, subject.id);
                                                return (
                                                    <td key={subject.id} className="px-4 py-3 text-center">
                                                        {score !== '' ? <span className="font-medium">{score}</span> : '-'}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-3 text-center font-medium">{total.toFixed(1)}</td>
                                            <td className="px-4 py-3 text-center font-medium">{average.toFixed(1)}%</td>
                                            <td className="px-4 py-3 text-center">
                                                {grade !== '-' && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${grade === 'A' || grade === '1' ? 'bg-emerald-100 text-emerald-700' :
                                                            grade === 'B' || grade === '2' ? 'bg-blue-100 text-blue-700' :
                                                                grade === 'C' || grade === '3' ? 'bg-amber-100 text-amber-700' :
                                                                    grade === 'D' || grade === '4' ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-red-100 text-red-700'
                                                        }`}>
                                                        {grade}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {status !== '-' && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={examSubjects.length + 6} className="text-center py-8 text-slate-500">
                                            No students found for this class
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'mock' ? (
                    /* Mock Exams Results */
                    <div className="space-y-8">
                        {customMocks.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl">
                                <p className="text-slate-500">No custom mock exams created yet.</p>
                            </div>
                        ) : (
                            customMocks.map(mock => {
                                let totalScoresSum = 0;
                                let studentsWithScores = 0;

                                filteredStudents.forEach(student => {
                                    const { average } = calculateStudentMockTotal(student.id, mock.id);
                                    if (average > 0) {
                                        totalScoresSum += average;
                                        studentsWithScores++;
                                    }
                                });

                                const classAverage = studentsWithScores > 0 ? totalScoresSum / studentsWithScores : 0;

                                return (
                                    <div key={mock.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold text-amber-800">{mock.name}</h3>
                                                    <p className="text-xs text-amber-600 mt-1">
                                                        Max Score: {mock.maxScore} | Class Average: {classAverage.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student Name</th>
                                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                                        {examSubjects.map(subject => (
                                                            <th key={subject.id} className="text-center px-4 py-3 text-sm font-semibold text-slate-600">
                                                                {subject.name}
                                                            </th>
                                                        ))}
                                                        <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Total</th>
                                                        <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Average</th>
                                                        <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Grade</th>
                                                        <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {filteredStudents.map((student) => {
                                                        const { total, average } = calculateStudentMockTotal(student.id, mock.id);
                                                        const grade = average > 0 ? getGrade(average) : '-';
                                                        const status = average > 0 ? getStatus(average) : '-';

                                                        return (
                                                            <tr key={student.id} className="hover:bg-slate-50">
                                                                <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                                                <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                                                {examSubjects.map(subject => {
                                                                    const score = getMockScore(student.id, mock.id, subject.id);
                                                                    return (
                                                                        <td key={subject.id} className="px-4 py-3 text-center">
                                                                            {score !== '' ? <span className="font-medium">{score}</span> : '-'}
                                                                        </td>
                                                                    );
                                                                })}
                                                                <td className="px-4 py-3 text-center font-medium">{total.toFixed(1)}</td>
                                                                <td className="px-4 py-3 text-center font-medium">{average.toFixed(1)}%</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {grade !== '-' && (
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${grade === 'A' || grade === '1' ? 'bg-emerald-100 text-emerald-700' :
                                                                                grade === 'B' || grade === '2' ? 'bg-blue-100 text-blue-700' :
                                                                                    grade === 'C' || grade === '3' ? 'bg-amber-100 text-amber-700' :
                                                                                        grade === 'D' || grade === '4' ? 'bg-orange-100 text-orange-700' :
                                                                                            'bg-red-100 text-red-700'
                                                                            }`}>
                                                                            {grade}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {status !== '-' && (
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                            }`}>
                                                                            {status}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : activeTab === 'secondarySelection' ? (
                    renderSecondarySelection()
                ) : activeTab === 'universitySelection' ? (
                    renderUniversitySelection()
                ) : null}
            </div>
        </div>
    );
};

export default ExternalResultsManagement;

// import React, { useState, useEffect } from 'react';
// import { Download, Eye, FileSpreadsheet } from 'lucide-react';

// interface ExternalResultsManagementProps {
//     classes: any[];
//     students: any[];
//     subjects: any[];
//     schoolLevel: 'primary' | 'secondary';
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// interface CustomMockExam {
//     id: string;
//     name: string;
//     description: string;
//     maxScore: number;
//     createdAt: Date;
// }

// interface MockScores {
//     [studentId: string]: {
//         [mockId: string]: {
//             [subjectId: string]: number;
//         };
//     };
// }

// // Load custom mocks from localStorage - SCOPED BY SCHOOL
// const loadCustomMocks = (): CustomMockExam[] => {
//     const schoolId = getCurrentSchoolId();
//     const saved = localStorage.getItem(`customMockExams_${schoolId}`);
//     if (saved) {
//         try {
//             return JSON.parse(saved);
//         } catch (e) {
//             return [];
//         }
//     }
//     return [];
// };

// // Load scores for custom mocks - SCOPED BY SCHOOL
// const loadMockScores = (): MockScores => {
//     const schoolId = getCurrentSchoolId();
//     const saved = localStorage.getItem(`mockExamScores_${schoolId}`);
//     if (saved) {
//         try {
//             return JSON.parse(saved);
//         } catch (e) {
//             return {};
//         }
//     }
//     return {};
// };

// // Get current school ID from localStorage
// const getCurrentSchoolId = (): string => {
//     try {
//         const userStr = localStorage.getItem('user');
//         if (userStr) {
//             const user = JSON.parse(userStr);
//             return user.schoolId || 'default';
//         }
//     } catch (e) {
//         console.error('Failed to get school ID', e);
//     }
//     return 'default';
// };

// // Subject configurations for each exam type
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

// // Convert score to grade
// const getGradeFromScore = (score: number, examType: string): string => {
//     if (examType === 'MSCE') {
//         if (score >= 80) return '1';
//         if (score >= 75) return '2';
//         if (score >= 70) return '3';
//         if (score >= 65) return '4';
//         if (score >= 60) return '5';
//         if (score >= 55) return '6';
//         if (score >= 50) return '7';
//         if (score >= 45) return '8';
//         return '9';
//     } else {
//         if (score >= 80) return 'A';
//         if (score >= 70) return 'B';
//         if (score >= 60) return 'C';
//         if (score >= 50) return 'D';
//         if (score >= 40) return 'E';
//         return 'F';
//     }
// };

// const ExternalResultsManagement: React.FC<ExternalResultsManagementProps> = ({
//     classes,
//     students,
//     subjects,
//     schoolLevel,
//     showMessage
// }) => {
//     const [selectedClass, setSelectedClass] = useState<string>('');
//     const [activeTab, setActiveTab] = useState<'maneb' | 'mock'>('maneb');
//     const [customMocks, setCustomMocks] = useState<CustomMockExam[]>([]);
//     const [mockScores, setMockScores] = useState<MockScores>({});
//     const [loading, setLoading] = useState(false);

//     // Get class options based on school level
//     const getClassOptions = () => {
//         if (schoolLevel === 'primary') {
//             return [{ id: 'standard8', name: 'Standard 8' }];
//         } else {
//             // Secondary - only Form 2 and Form 4
//             const allClasses = Array.from(new Map(students.map(s => [s.class?.id, { id: s.class?.id, name: s.class?.name }])).values())
//                 .filter(c => c.id);
//             return allClasses.filter(cls =>
//                 cls.name?.toLowerCase().includes('form 2') ||
//                 cls.name?.toLowerCase().includes('form 4') ||
//                 cls.name?.toLowerCase().includes('form2') ||
//                 cls.name?.toLowerCase().includes('form4')
//             );
//         }
//     };

//     const classOptions = getClassOptions();

//     // Set default selected class
//     useEffect(() => {
//         if (schoolLevel === 'primary') {
//             setSelectedClass('standard8');
//         } else if (classOptions.length > 0 && !selectedClass) {
//             setSelectedClass(classOptions[0].id);
//         }
//     }, [classOptions, schoolLevel]);

//     // Load custom mocks and scores
//     useEffect(() => {
//         const mocks = loadCustomMocks();
//         setCustomMocks(mocks);
//         const scores = loadMockScores();
//         setMockScores(scores);
//     }, []);

//     // Get students filtered by selected class
//     const filteredStudents = students.filter(student => {
//         if (schoolLevel === 'primary') {
//             const isStandard8 = student.class?.name?.toLowerCase().includes('standard 8') ||
//                 student.class?.name?.toLowerCase().includes('std 8');
//             return isStandard8;
//         } else {
//             return student.class?.id === selectedClass;
//         }
//     });

//     // Determine exam type based on selected class
//     const getExamType = (): 'PSLCE' | 'JCE' | 'MSCE' => {
//         if (schoolLevel === 'primary') return 'PSLCE';

//         const selectedClassObj = classOptions.find(c => c.id === selectedClass);
//         const className = selectedClassObj?.name?.toLowerCase() || '';

//         if (className.includes('form 4')) return 'MSCE';
//         return 'JCE';
//     };

//     const examType = getExamType();
//     const examSubjects = getSubjectsForExam(activeTab === 'maneb' ? examType : 'MOCK', schoolLevel);

//     // Get score for MANEB exam
//     const getManebScore = (studentId: string, subjectId: string): number | string => {
//         const scores = mockScores[studentId]?.['maneb'];
//         return scores?.[subjectId] ?? '';
//     };

//     // Get score for a specific mock
//     const getMockScore = (studentId: string, mockId: string, subjectId: string): number | string => {
//         return mockScores[studentId]?.[mockId]?.[subjectId] ?? '';
//     };

//     // Calculate student total and average for MANEB
//     const calculateStudentManebTotal = (studentId: string): { total: number; average: number } => {
//         let total = 0;
//         let count = 0;

//         for (const subject of examSubjects) {
//             const score = getManebScore(studentId, subject.id);
//             if (score !== '' && Number(score) > 0) {
//                 total += Number(score);
//                 count++;
//             }
//         }

//         const average = count > 0 ? total / count : 0;
//         return { total, average };
//     };

//     // Calculate student total and average for Mock
//     const calculateStudentMockTotal = (studentId: string, mockId: string): { total: number; average: number } => {
//         let total = 0;
//         let count = 0;

//         for (const subject of examSubjects) {
//             const score = getMockScore(studentId, mockId, subject.id);
//             if (score !== '' && Number(score) > 0) {
//                 total += Number(score);
//                 count++;
//             }
//         }

//         const average = count > 0 ? total / count : 0;
//         return { total, average };
//     };

//     // Get grade for a score
//     const getGrade = (score: number): string => {
//         if (schoolLevel === 'primary') {
//             if (score >= 80) return 'A';
//             if (score >= 70) return 'B';
//             if (score >= 60) return 'C';
//             if (score >= 50) return 'D';
//             if (score >= 40) return 'E';
//             return 'F';
//         } else {
//             const currentExamType = getExamType();
//             return getGradeFromScore(score, currentExamType);
//         }
//     };

//     // Get status (Pass/Fail)
//     const getStatus = (score: number): string => {
//         const grade = getGrade(score);
//         if (grade === 'F' || grade === '9') return 'Fail';
//         return 'Pass';
//     };

//     const classOptionsList = getClassOptions();
//     const selectedClassObj = classOptionsList.find(c => c.id === selectedClass);
//     const isFormFour = selectedClassObj?.name?.toLowerCase().includes('form 4') || false;

//     return (
//         <div className="space-y-6">
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//                     <div>
//                         <h2 className="text-lg font-semibold text-slate-800">External Exam Results</h2>
//                         <p className="text-sm text-slate-500 mt-1">
//                             View MANEB and Mock exam results for students
//                         </p>
//                     </div>

//                     {schoolLevel === 'secondary' && (
//                         <div className="min-w-[200px]">
//                             <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
//                             <select
//                                 value={selectedClass}
//                                 onChange={(e) => setSelectedClass(e.target.value)}
//                                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                             >
//                                 {classOptions.map(cls => (
//                                     <option key={cls.id} value={cls.id}>
//                                         {cls.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     )}
//                 </div>

//                 {/* Tab Navigation */}
//                 <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6">
//                     <button
//                         onClick={() => setActiveTab('maneb')}
//                         className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'maneb'
//                                 ? 'border-indigo-600 text-indigo-600'
//                                 : 'border-transparent text-slate-500 hover:text-slate-700'
//                             }`}
//                     >
//                         MANEB ({examType})
//                     </button>

//                     <button
//                         onClick={() => setActiveTab('mock')}
//                         className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'mock'
//                                 ? 'border-indigo-600 text-indigo-600'
//                                 : 'border-transparent text-slate-500 hover:text-slate-700'
//                             }`}
//                     >
//                         Mock Exams
//                     </button>
//                 </div>

//                 {/* Content based on active tab */}
//                 {loading ? (
//                     <div className="text-center py-12">
//                         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
//                         <p className="text-slate-600">Loading results...</p>
//                     </div>
//                 ) : activeTab === 'maneb' ? (
//                     /* MANEB Results Table */
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-slate-50">
//                                 <tr>
//                                     <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student Name</th>
//                                     <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
//                                     {examSubjects.map(subject => (
//                                         <th key={subject.id} className="text-center px-4 py-3 text-sm font-semibold text-slate-600">
//                                             {subject.name}
//                                         </th>
//                                     ))}
//                                     <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Total</th>
//                                     <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Average</th>
//                                     <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Grade</th>
//                                     <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-100">
//                                 {filteredStudents.map((student) => {
//                                     const { total, average } = calculateStudentManebTotal(student.id);
//                                     const grade = average > 0 ? getGrade(average) : '-';
//                                     const status = average > 0 ? getStatus(average) : '-';

//                                     return (
//                                         <tr key={student.id} className="hover:bg-slate-50">
//                                             <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                             <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
//                                             {examSubjects.map(subject => {
//                                                 const score = getManebScore(student.id, subject.id);
//                                                 return (
//                                                     <td key={subject.id} className="px-4 py-3 text-center">
//                                                         {score !== '' ? (
//                                                             <span className="font-medium">{score}</span>
//                                                         ) : '-'}
//                                                     </td>
//                                                 );
//                                             })}
//                                             <td className="px-4 py-3 text-center font-medium">{total.toFixed(1)}</td>
//                                             <td className="px-4 py-3 text-center font-medium">{average.toFixed(1)}%</td>
//                                             <td className="px-4 py-3 text-center">
//                                                 {grade !== '-' && (
//                                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${grade === 'A' || grade === '1' ? 'bg-emerald-100 text-emerald-700' :
//                                                             grade === 'B' || grade === '2' ? 'bg-blue-100 text-blue-700' :
//                                                                 grade === 'C' || grade === '3' ? 'bg-amber-100 text-amber-700' :
//                                                                     grade === 'D' || grade === '4' ? 'bg-orange-100 text-orange-700' :
//                                                                         'bg-red-100 text-red-700'
//                                                         }`}>
//                                                         {grade}
//                                                     </span>
//                                                 )}
//                                             </td>
//                                             <td className="px-4 py-3 text-center">
//                                                 {status !== '-' && (
//                                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                                                         }`}>
//                                                         {status}
//                                                     </span>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                                 {filteredStudents.length === 0 && (
//                                     <tr>
//                                         <td colSpan={examSubjects.length + 6} className="text-center py-8 text-slate-500">
//                                             No students found for this class
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 ) : (
//                     /* Mock Exams Results */
//                     <div className="space-y-8">
//                         {customMocks.length === 0 ? (
//                             <div className="text-center py-12 bg-slate-50 rounded-xl">
//                                 <p className="text-slate-500">No custom mock exams created yet.</p>
//                             </div>
//                         ) : (
//                             customMocks.map(mock => {
//                                 // Calculate class statistics for this mock
//                                 let totalScoresSum = 0;
//                                 let studentsWithScores = 0;

//                                 filteredStudents.forEach(student => {
//                                     const { total, average } = calculateStudentMockTotal(student.id, mock.id);
//                                     if (average > 0) {
//                                         totalScoresSum += average;
//                                         studentsWithScores++;
//                                     }
//                                 });

//                                 const classAverage = studentsWithScores > 0 ? totalScoresSum / studentsWithScores : 0;

//                                 return (
//                                     <div key={mock.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                                         <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
//                                             <div className="flex justify-between items-center">
//                                                 <div>
//                                                     <h3 className="font-semibold text-amber-800">{mock.name}</h3>
//                                                     <p className="text-xs text-amber-600 mt-1">
//                                                         Max Score: {mock.maxScore} | Class Average: {classAverage.toFixed(1)}%
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full">
//                                                 <thead className="bg-slate-50">
//                                                     <tr>
//                                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student Name</th>
//                                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
//                                                         {examSubjects.map(subject => (
//                                                             <th key={subject.id} className="text-center px-4 py-3 text-sm font-semibold text-slate-600">
//                                                                 {subject.name}
//                                                             </th>
//                                                         ))}
//                                                         <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Total</th>
//                                                         <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Average</th>
//                                                         <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Grade</th>
//                                                         <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-slate-100">
//                                                     {filteredStudents.map((student) => {
//                                                         const { total, average } = calculateStudentMockTotal(student.id, mock.id);
//                                                         const grade = average > 0 ? getGrade(average) : '-';
//                                                         const status = average > 0 ? getStatus(average) : '-';

//                                                         return (
//                                                             <tr key={student.id} className="hover:bg-slate-50">
//                                                                 <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                                                 <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
//                                                                 {examSubjects.map(subject => {
//                                                                     const score = getMockScore(student.id, mock.id, subject.id);
//                                                                     return (
//                                                                         <td key={subject.id} className="px-4 py-3 text-center">
//                                                                             {score !== '' ? (
//                                                                                 <span className="font-medium">{score}</span>
//                                                                             ) : '-'}
//                                                                         </td>
//                                                                     );
//                                                                 })}
//                                                                 <td className="px-4 py-3 text-center font-medium">{total.toFixed(1)}</td>
//                                                                 <td className="px-4 py-3 text-center font-medium">{average.toFixed(1)}%</td>
//                                                                 <td className="px-4 py-3 text-center">
//                                                                     {grade !== '-' && (
//                                                                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${grade === 'A' || grade === '1' ? 'bg-emerald-100 text-emerald-700' :
//                                                                                 grade === 'B' || grade === '2' ? 'bg-blue-100 text-blue-700' :
//                                                                                     grade === 'C' || grade === '3' ? 'bg-amber-100 text-amber-700' :
//                                                                                         grade === 'D' || grade === '4' ? 'bg-orange-100 text-orange-700' :
//                                                                                             'bg-red-100 text-red-700'
//                                                                             }`}>
//                                                                             {grade}
//                                                                         </span>
//                                                                     )}
//                                                                 </td>
//                                                                 <td className="px-4 py-3 text-center">
//                                                                     {status !== '-' && (
//                                                                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                                                                             }`}>
//                                                                             {status}
//                                                                         </span>
//                                                                     )}
//                                                                 </td>
//                                                             </tr>
//                                                         );
//                                                     })}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     </div>
//                                 );
//                             })
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ExternalResultsManagement;