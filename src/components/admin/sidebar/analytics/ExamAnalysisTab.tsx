// components/admin/analytics/ExamAnalysisTab.tsx
import React, { useState } from 'react';
import { GraduationCap, Award, AlertTriangle, Download, Users, Search, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import StudentExamDetail from './StudentExamDetail';

interface ExamAnalysisTabProps {
    examType: 'PSLCE' | 'JCE' | 'MSCE';
    loading: boolean;
    onExport: () => void;
    onViewStudent: (studentId: string) => void;
}

// Types for different exam types
interface PSLCEStudent {
    id: string;
    name: string;
    examNumber: string;
    grade: string;
    english: number;
    math: number;
    science: number;
    chichewa: number;
    social: number;
    passed: boolean;
    selectedTo: string | null;
}

interface JCEStudent {
    id: string;
    name: string;
    examNumber: string;
    grade: string;
    english: string;
    math: string;
    biology: string;
    chemistry: string;
    physics: string;
    passed: boolean;
}

interface MSCEStudent {
    id: string;
    name: string;
    examNumber: string;
    grade: string;
    points: number;
    passed: boolean;
    selectedTo: string | null;
    program: string | null;
}

// MOCK DATA - PSLCE (Standard 8) - WITH SUBJECT SCORES
const mockPSLCEData = {
    year: 2025,
    totalStudents: 245,
    passed: 198,
    allStudents: [
        { id: '1', name: 'Chisomo Banda', examNumber: 'STU0001', grade: 'Standard 8', english: 85, math: 82, science: 88, chichewa: 90, social: 84, passed: true, selectedTo: 'Kamuzu Academy' },
        { id: '2', name: 'Mary Phiri', examNumber: 'STU0002', grade: 'Standard 8', english: 82, math: 78, science: 85, chichewa: 88, social: 80, passed: true, selectedTo: 'Bishop Mackenzie' },
        { id: '3', name: 'Peter Mwale', examNumber: 'STU0003', grade: 'Standard 8', english: 65, math: 58, science: 62, chichewa: 70, social: 60, passed: true, selectedTo: 'Lilongwe Girls' },
        { id: '4', name: 'Alice Kachingwe', examNumber: 'STU0004', grade: 'Standard 8', english: 45, math: 38, science: 42, chichewa: 50, social: 40, passed: false, selectedTo: null },
        { id: '5', name: 'John Gondwe', examNumber: 'STU0005', grade: 'Standard 8', english: 72, math: 68, science: 70, chichewa: 75, social: 68, passed: true, selectedTo: 'St. Mary\'s' },
        { id: '6', name: 'James Banda', examNumber: 'STU0006', grade: 'Standard 8', english: 35, math: 28, science: 32, chichewa: 40, social: 30, passed: false, selectedTo: null },
    ] as PSLCEStudent[]
};

// MOCK DATA - JCE (Form 2) - Only student name, class (Form 2), status, action
const mockJCEData = {
    year: 2025,
    totalStudents: 312,
    passed: 248,
    allStudents: [
        { id: '1', name: 'Chisomo Banda', examNumber: 'STU0001', grade: 'Form 2', english: 'A', math: 'B', biology: 'A', chemistry: 'B', physics: 'B', passed: true },
        { id: '2', name: 'Mary Phiri', examNumber: 'STU0002', grade: 'Form 2', english: 'B', math: 'B', biology: 'A', chemistry: 'B', physics: 'C', passed: true },
        { id: '6', name: 'James Banda', examNumber: 'STU0006', grade: 'Form 2', english: 'F', math: 'F', biology: 'E', chemistry: 'F', physics: 'F', passed: false },
    ] as JCEStudent[]
};

// MOCK DATA - MSCE (Form 4)
const mockMSCEData = {
    year: 2025,
    totalStudents: 189,
    passed: 156,
    allStudents: [
        { id: '1', name: 'Chisomo Banda', examNumber: 'STU0001', grade: 'Form 4', points: 6, passed: true, selectedTo: 'University of Malawi', program: 'Medicine' },
        { id: '2', name: 'Mary Phiri', examNumber: 'STU0002', grade: 'Form 4', points: 12, passed: true, selectedTo: 'MUBAS', program: 'Engineering' },
        { id: '3', name: 'Peter Mwale', examNumber: 'STU0003', grade: 'Form 4', points: 48, passed: false, selectedTo: null, program: null },
        { id: '4', name: 'Alice Kachingwe', examNumber: 'STU0004', grade: 'Form 4', points: 8, passed: true, selectedTo: 'LUANAR', program: 'Agriculture' },
        { id: '5', name: 'John Gondwe', examNumber: 'STU0005', grade: 'Form 4', points: 15, passed: true, selectedTo: 'Kamuzu University', program: 'Nursing' },
        { id: '6', name: 'James Banda', examNumber: 'STU0006', grade: 'Form 4', points: 48, passed: false, selectedTo: null, program: null },
    ] as MSCEStudent[]
};

const ExamAnalysisTab: React.FC<ExamAnalysisTabProps> = ({
    examType,
    loading,
    onExport,
    onViewStudent
}) => {
    const [view, setView] = useState<'overview' | 'results' | 'selections'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    const getData = () => {
        switch (examType) {
            case 'PSLCE': return mockPSLCEData;
            case 'JCE': return mockJCEData;
            case 'MSCE': return mockMSCEData;
            default: return mockMSCEData;
        }
    };

    const currentData = getData();
    const isMSCE = examType === 'MSCE';
    const isPSLCE = examType === 'PSLCE';
    const isJCE = examType === 'JCE';

    const filteredStudents = currentData.allStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.examNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getExamTitle = () => {
        switch (examType) {
            case 'PSLCE': return 'PSLCE (Standard 8) Results';
            case 'JCE': return 'JCE (Form 2) Results';
            case 'MSCE': return 'MSCE (Form 4) Results';
            default: return 'Exam Results';
        }
    };

    // Calculate statistics for MSCE
    // Calculate statistics for MSCE
    const calculateMSCEStats = () => {
        const students = currentData.allStudents as MSCEStudent[];
        const points = students.map(s => s.points);
        const highestPoints = Math.min(...points);
        const lowestPoints = Math.max(...points);
        const below10Points = students.filter(s => s.points <= 10).length;
        const below20Points = students.filter(s => s.points <= 20 && s.points > 10).length;
        const passRate = ((currentData.passed / currentData.totalStudents) * 100).toFixed(1);

        // Mock point distribution for each subject (points 1-9 only)
        const pointDistribution = [
            { name: 'English', points: [1, 1, 0, 0, 0, 0, 0, 0, 0] },
            { name: 'Mathematics', points: [0, 2, 0, 0, 0, 0, 0, 0, 0] },
            { name: 'Biology', points: [2, 0, 0, 0, 0, 0, 0, 0, 0] },
            { name: 'Chemistry', points: [0, 2, 0, 0, 0, 0, 0, 0, 0] },
            { name: 'Physics', points: [0, 1, 1, 0, 0, 0, 0, 0, 0] }
        ];

        return {
            highestPoints,
            lowestPoints,
            below10Points,
            below20Points,
            passRate,
            pointDistribution
        };
    };

    // Calculate statistics for PSLCE - Show grade distribution by subject (like JCE)
    const calculatePSLCEStats = () => {
        const students = currentData.allStudents as PSLCEStudent[];
        const subjects = ['english', 'math', 'science', 'chichewa', 'social'];
        const passRate = ((currentData.passed / currentData.totalStudents) * 100).toFixed(1);

        const getGradeFromScore = (score: number): string => {
            if (score >= 80) return 'A';
            if (score >= 70) return 'B';
            if (score >= 60) return 'C';
            if (score >= 50) return 'D';
            if (score >= 40) return 'E';
            return 'F';
        };

        const gradeCounts = subjects.map(subj => {
            const scores = students.map(s => s[subj as keyof PSLCEStudent] as number);
            const countA = scores.filter(s => getGradeFromScore(s) === 'A').length;
            const countB = scores.filter(s => getGradeFromScore(s) === 'B').length;
            const countC = scores.filter(s => getGradeFromScore(s) === 'C').length;
            const countD = scores.filter(s => getGradeFromScore(s) === 'D').length;
            const countE = scores.filter(s => getGradeFromScore(s) === 'E').length;
            const countF = scores.filter(s => getGradeFromScore(s) === 'F').length;
            return {
                name: subj.charAt(0).toUpperCase() + subj.slice(1),
                A: countA,
                B: countB,
                C: countC,
                D: countD,
                E: countE,
                F: countF
            };
        });

        return { passRate, gradeCounts };
    };



    // Calculate statistics for JCE - Show subjects with more As, Bs, Cs, Ds
    const calculateJCEStats = () => {
        const students = currentData.allStudents as JCEStudent[];
        const subjects = ['english', 'math', 'biology', 'chemistry', 'physics'];
        const passRate = ((currentData.passed / currentData.totalStudents) * 100).toFixed(1);

        const gradeCounts = subjects.map(subj => {
            const grades = students.map(s => s[subj as keyof JCEStudent] as string);
            const countA = grades.filter(g => g === 'A').length;
            const countB = grades.filter(g => g === 'B').length;
            const countC = grades.filter(g => g === 'C').length;
            const countD = grades.filter(g => g === 'D').length;
            const countE = grades.filter(g => g === 'E').length;
            const countF = grades.filter(g => g === 'F').length;
            return {
                name: subj.charAt(0).toUpperCase() + subj.slice(1),
                A: countA,
                B: countB,
                C: countC,
                D: countD,
                E: countE,
                F: countF
            };
        });

        return { passRate, gradeCounts };
    };

    const msceStats = isMSCE ? calculateMSCEStats() : null;
    const pslceStats = isPSLCE ? calculatePSLCEStats() : null;
    const jceStats = isJCE ? calculateJCEStats() : null;
    const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
    const [selectedYear, setSelectedYear] = useState<number>(2025);



    // ADD THE handleViewStudent FUNCTION HERE ↓
    const handleViewStudent = (student: any) => {
        // Enrich student with subject data based on exam type
        let enrichedStudent = { ...student };

        if (isPSLCE) {
            // In real implementation, fetch from backend
            enrichedStudent.subjects = {
                english: 85,
                math: 82,
                science: 88,
                chichewa: 90,
                social: 84
            };
        } else if (isJCE) {
            enrichedStudent.subjects = {
                english: student.english || 'A',
                math: student.math || 'B',
                biology: student.biology || 'A',
                chemistry: student.chemistry || 'B',
                physics: student.physics || 'B'
            };
        } else if (isMSCE) {
            enrichedStudent.subjects = {
                english: 'A',
                math: 'A',
                biology: 'A',
                chemistry: 'B',
                physics: 'B'
            };
        }

        setSelectedStudentDetail(enrichedStudent);
    };
    // END OF handleViewStudent FUNCTION ↑

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{getExamTitle()}</h2>
                    <p className="text-slate-500">Year: {currentData.year} | Total Students: {currentData.totalStudents}</p>
                </div>
                <button
                    onClick={onExport}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export Report
                </button>

                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                        <option value={2024}>2024 Academic Year</option>
                        <option value={2025}>2025 Academic Year</option>
                        <option value={2026}>2026 Academic Year</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setView('overview')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${view === 'overview'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setView('results')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${view === 'results'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Users className="w-4 h-4 inline mr-2" />
                    Student Results
                </button>
                {(isPSLCE || isMSCE) && (
                    <button
                        onClick={() => setView('selections')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${view === 'selections'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {isPSLCE ? 'Secondary Selections' : 'University Selections'}
                    </button>
                )}
            </div>

            {/* Overview Tab */}
            {view === 'overview' && (
                <div className="space-y-6">
                    {/* Key Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="p-2 bg-indigo-100 rounded-lg w-fit mb-3">
                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{currentData.totalStudents}</p>
                            <p className="text-sm text-slate-500">Total Students</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="p-2 bg-emerald-100 rounded-lg w-fit mb-3">
                                <Award className="w-5 h-5 text-emerald-600" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{currentData.passed}</p>
                            <p className="text-sm text-slate-500">Passed</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="p-2 bg-red-100 rounded-lg w-fit mb-3">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <p className="text-2xl font-bold text-red-600">{currentData.totalStudents - currentData.passed}</p>
                            <p className="text-sm text-slate-500">Failed</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                                {isMSCE ? msceStats?.passRate : isPSLCE ? pslceStats?.passRate : jceStats?.passRate}%
                            </p>
                            <p className="text-sm text-slate-500">Pass Rate</p>
                        </div>
                    </div>

                    {/* Subject Performance Stats Cards - PSLCE and JCE only */}
                    {(isPSLCE || isJCE) && (
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            {/* Highest Pass Rate */}
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
                                <p className="text-green-100 text-xs">HIGHEST PASS RATE</p>
                                <p className="text-2xl font-bold mt-1">
                                    {isPSLCE
                                        ? pslceStats?.gradeCounts.reduce((highest, current) => {
                                            const total = current.A + current.B + current.C + current.D + current.E + current.F;
                                            const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
                                            if (passRate > (highest.passRate || 0)) {
                                                return { name: current.name, passRate: passRate };
                                            }
                                            return highest;
                                        }, { name: '', passRate: 0 }).name || 'N/A'
                                        : jceStats?.gradeCounts.reduce((highest, current) => {
                                            const total = current.A + current.B + current.C + current.D + current.E + current.F;
                                            const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
                                            if (passRate > (highest.passRate || 0)) {
                                                return { name: current.name, passRate: passRate };
                                            }
                                            return highest;
                                        }, { name: '', passRate: 0 }).name || 'N/A'
                                    }
                                </p>
                                <p className="text-green-100 text-xs mt-1">
                                    {isPSLCE
                                        ? `${pslceStats?.gradeCounts.reduce((highest, current) => {
                                            const total = current.A + current.B + current.C + current.D + current.E + current.F;
                                            const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
                                            if (passRate > (highest.passRate || 0)) {
                                                return { passRate: passRate };
                                            }
                                            return highest;
                                        }, { passRate: 0 }).passRate.toFixed(1)}% pass rate`
                                        : `${jceStats?.gradeCounts.reduce((highest, current) => {
                                            const total = current.A + current.B + current.C + current.D + current.E + current.F;
                                            const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
                                            if (passRate > (highest.passRate || 0)) {
                                                return { passRate: passRate };
                                            }
                                            return highest;
                                        }, { passRate: 0 }).passRate.toFixed(1)}% pass rate`
                                    }
                                </p>
                            </div>

                            {/* Lowest Pass Rate */}
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
                                <p className="text-red-100 text-xs">LOWEST PASS RATE</p>
                                <p className="text-2xl font-bold mt-1">
                                    {isPSLCE
                                        ? pslceStats?.gradeCounts.reduce((lowest, current) => {
                                            const total = current.A + current.B + current.C + current.D + current.E + current.F;
                                            const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
                                            if (passRate < (lowest.passRate ?? 100)) {
                                                return { name: current.name, passRate: passRate };
                                            }
                                            return lowest;
                                        }, { name: '', passRate: 100 }).name || 'N/A'
                                        : jceStats?.gradeCounts.reduce((lowest, current) => {
                                            const total = current.A + current.B + current.C + current.D + current.E + current.F;
                                            const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
                                            if (passRate < (lowest.passRate ?? 100)) {
                                                return { name: current.name, passRate: passRate };
                                            }
                                            return lowest;
                                        }, { name: '', passRate: 100 }).name || 'N/A'
                                    }
                                </p>
                                <p className="text-red-100 text-xs mt-1">
                                    {isPSLCE
                                        ? `${pslceStats?.gradeCounts.reduce((lowest, current) => {
                                            const total = current.A + current.B + current.C + current.D + current.E + current.F;
                                            const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
                                            if (passRate < (lowest.passRate ?? 100)) {
                                                return { passRate: passRate };
                                            }
                                            return lowest;
                                        }, { passRate: 100 }).passRate.toFixed(1)}% pass rate`
                                        : `${jceStats?.gradeCounts.reduce((lowest, current) => {
                                            const total = current.A + current.B + current.C + current.D + current.E + current.F;
                                            const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
                                            if (passRate < (lowest.passRate ?? 100)) {
                                                return { passRate: passRate };
                                            }
                                            return lowest;
                                        }, { passRate: 100 }).passRate.toFixed(1)}% pass rate`
                                    }
                                </p>
                            </div>

                            {/* Most A's */}
                            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
                                <p className="text-yellow-100 text-xs">MOST A's</p>
                                <p className="text-2xl font-bold mt-1">
                                    {isPSLCE
                                        ? pslceStats?.gradeCounts.reduce((highest, current) => {
                                            if (current.A > (highest.count || 0)) {
                                                return { name: current.name, count: current.A };
                                            }
                                            return highest;
                                        }, { name: '', count: 0 }).name || 'N/A'
                                        : jceStats?.gradeCounts.reduce((highest, current) => {
                                            if (current.A > (highest.count || 0)) {
                                                return { name: current.name, count: current.A };
                                            }
                                            return highest;
                                        }, { name: '', count: 0 }).name || 'N/A'
                                    }
                                </p>
                                <p className="text-yellow-100 text-xs mt-1">
                                    {isPSLCE
                                        ? `${pslceStats?.gradeCounts.reduce((highest, current) => {
                                            if (current.A > (highest.count || 0)) {
                                                return { count: current.A };
                                            }
                                            return highest;
                                        }, { count: 0 }).count} students scored A`
                                        : `${jceStats?.gradeCounts.reduce((highest, current) => {
                                            if (current.A > (highest.count || 0)) {
                                                return { count: current.A };
                                            }
                                            return highest;
                                        }, { count: 0 }).count} students scored A`
                                    }
                                </p>
                            </div>

                            {/* Most B's */}
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
                                <p className="text-blue-100 text-xs">MOST B's</p>
                                <p className="text-2xl font-bold mt-1">
                                    {isPSLCE
                                        ? pslceStats?.gradeCounts.reduce((highest, current) => {
                                            if (current.B > (highest.count || 0)) {
                                                return { name: current.name, count: current.B };
                                            }
                                            return highest;
                                        }, { name: '', count: 0 }).name || 'N/A'
                                        : jceStats?.gradeCounts.reduce((highest, current) => {
                                            if (current.B > (highest.count || 0)) {
                                                return { name: current.name, count: current.B };
                                            }
                                            return highest;
                                        }, { name: '', count: 0 }).name || 'N/A'
                                    }
                                </p>
                                <p className="text-blue-100 text-xs mt-1">
                                    {isPSLCE
                                        ? `${pslceStats?.gradeCounts.reduce((highest, current) => {
                                            if (current.B > (highest.count || 0)) {
                                                return { count: current.B };
                                            }
                                            return highest;
                                        }, { count: 0 }).count} students scored B`
                                        : `${jceStats?.gradeCounts.reduce((highest, current) => {
                                            if (current.B > (highest.count || 0)) {
                                                return { count: current.B };
                                            }
                                            return highest;
                                        }, { count: 0 }).count} students scored B`
                                    }
                                </p>
                            </div>

                            {/* Most Common Grade */}
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
                                <p className="text-purple-100 text-xs">MOST COMMON GRADE</p>
                                <p className="text-2xl font-bold mt-1">
                                    {(() => {
                                        const gradeCounts = isPSLCE ? pslceStats?.gradeCounts : jceStats?.gradeCounts;
                                        if (!gradeCounts) return 'N/A';

                                        const totals = {
                                            A: gradeCounts.reduce((sum, subj) => sum + subj.A, 0),
                                            B: gradeCounts.reduce((sum, subj) => sum + subj.B, 0),
                                            C: gradeCounts.reduce((sum, subj) => sum + subj.C, 0),
                                            D: gradeCounts.reduce((sum, subj) => sum + subj.D, 0),
                                            E: gradeCounts.reduce((sum, subj) => sum + subj.E, 0),
                                            F: gradeCounts.reduce((sum, subj) => sum + subj.F, 0)
                                        };

                                        const mostCommon = Object.entries(totals).reduce((a, b) => a[1] > b[1] ? a : b);
                                        return `${mostCommon[0]} (${mostCommon[1]})`;
                                    })()}
                                </p>
                                <p className="text-purple-100 text-xs mt-1">Most frequent grade across all subjects</p>
                            </div>

                            {/* Least Common Grade */}
                            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 text-white">
                                <p className="text-pink-100 text-xs">LEAST COMMON GRADE</p>
                                <p className="text-2xl font-bold mt-1">
                                    {(() => {
                                        const gradeCounts = isPSLCE ? pslceStats?.gradeCounts : jceStats?.gradeCounts;
                                        if (!gradeCounts) return 'N/A';

                                        const totals = {
                                            A: gradeCounts.reduce((sum, subj) => sum + subj.A, 0),
                                            B: gradeCounts.reduce((sum, subj) => sum + subj.B, 0),
                                            C: gradeCounts.reduce((sum, subj) => sum + subj.C, 0),
                                            D: gradeCounts.reduce((sum, subj) => sum + subj.D, 0),
                                            E: gradeCounts.reduce((sum, subj) => sum + subj.E, 0),
                                            F: gradeCounts.reduce((sum, subj) => sum + subj.F, 0)
                                        };

                                        const leastCommon = Object.entries(totals).reduce((a, b) => a[1] < b[1] ? a : b);
                                        return `${leastCommon[0]} (${leastCommon[1]})`;
                                    })()}
                                </p>
                                <p className="text-pink-100 text-xs mt-1">Least frequent grade across all subjects</p>
                            </div>
                        </div>
                    )}

                    {/* MSCE Specific Stats - Point Distribution by Subject */}
                    {isMSCE && msceStats && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                    <p className="text-sm text-slate-500">Highest (Best)</p>
                                    <p className="text-2xl font-bold text-green-600">{msceStats.highestPoints} points</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                    <p className="text-sm text-slate-500">Lowest (Worst)</p>
                                    <p className="text-2xl font-bold text-red-600">{msceStats.lowestPoints} points</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                    <p className="text-sm text-slate-500">Students ≤ 10 points</p>
                                    <p className="text-2xl font-bold text-emerald-600">{msceStats.below10Points}</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                    <p className="text-sm text-slate-500">Students 11-20 points</p>
                                    <p className="text-2xl font-bold text-blue-600">{msceStats.below20Points}</p>
                                </div>
                            </div>

                            {/* 6 Stats Cards for MSCE */}
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                {/* Highest Pass Rate */}
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
                                    <p className="text-green-100 text-xs">HIGHEST PASS RATE</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {msceStats.pointDistribution.reduce((highest, current) => {
                                            const total = current.points.reduce((a, b) => a + b, 0);
                                            const passed = current.points.slice(0, 6).reduce((a, b) => a + b, 0);
                                            const passRate = total > 0 ? (passed / total) * 100 : 0;
                                            if (passRate > (highest.passRate || 0)) {
                                                return { name: current.name, passRate: passRate };
                                            }
                                            return highest;
                                        }, { name: '', passRate: 0 }).name || 'N/A'}
                                    </p>

                                    <p className="text-green-100 text-xs mt-1">
                                        {msceStats.pointDistribution.reduce((highest, current) => {
                                            const total = current.points.reduce((a, b) => a + b, 0);
                                            const passed = current.points.slice(0, 6).reduce((a, b) => a + b, 0);
                                            const passRate = total > 0 ? (passed / total) * 100 : 0;
                                            if (passRate > (highest.passRate || 0)) {
                                                return { passRate: passRate };
                                            }
                                            return highest;
                                        }, { passRate: 0 }).passRate.toFixed(1)}% pass rate
                                    </p>
                                </div>

                                {/* Lowest Pass Rate */}
                                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
                                    <p className="text-red-100 text-xs">LOWEST PASS RATE</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {msceStats.pointDistribution.reduce((lowest, current) => {
                                            const total = current.points.reduce((a, b) => a + b, 0);
                                            const passed = current.points.slice(0, 6).reduce((a, b) => a + b, 0);
                                            const passRate = total > 0 ? (passed / total) * 100 : 100;
                                            if (passRate < (lowest.passRate ?? 100)) {
                                                return { name: current.name, passRate: passRate };
                                            }
                                            return lowest;
                                        }, { name: '', passRate: 100 }).name || 'N/A'}
                                    </p>
                                    <p className="text-red-100 text-xs mt-1">
                                        {msceStats.pointDistribution.reduce((lowest, current) => {
                                            const total = current.points.reduce((a, b) => a + b, 0);
                                            const passed = current.points.slice(0, 6).reduce((a, b) => a + b, 0);
                                            const passRate = total > 0 ? (passed / total) * 100 : 100;
                                            if (passRate < (lowest.passRate ?? 100)) {
                                                return { passRate: passRate };
                                            }
                                            return lowest;
                                        }, { passRate: 100 }).passRate.toFixed(1)}% pass rate
                                    </p>
                                </div>

                                {/* Most 1's (Best Grade) */}
                                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
                                    <p className="text-yellow-100 text-xs">MOST 1's (BEST)</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {msceStats.pointDistribution.reduce((highest, current) => {
                                            if (current.points[0] > (highest.count || 0)) {
                                                return { name: current.name, count: current.points[0] };
                                            }
                                            return highest;
                                        }, { name: '', count: 0 }).name || 'N/A'
                                        }
                                    </p>
                                    <p className="text-yellow-100 text-xs mt-1">
                                        {msceStats.pointDistribution.reduce((highest, current) => {
                                            if (current.points[0] > (highest.count || 0)) {
                                                return { count: current.points[0] };
                                            }
                                            return highest;
                                        }, { count: 0 }).count} students scored 1 point
                                    </p>
                                </div>

                                {/* Most 2's */}
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
                                    <p className="text-blue-100 text-xs">MOST 2's</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {msceStats.pointDistribution.reduce((highest, current) => {
                                            if (current.points[1] > (highest.count || 0)) {
                                                return { name: current.name, count: current.points[1] };
                                            }
                                            return highest;
                                        }, { name: '', count: 0 }).name || 'N/A'
                                        }
                                    </p>
                                    <p className="text-blue-100 text-xs mt-1">
                                        {msceStats.pointDistribution.reduce((highest, current) => {
                                            if (current.points[1] > (highest.count || 0)) {
                                                return { count: current.points[1] };
                                            }
                                            return highest;
                                        }, { count: 0 }).count} students scored 2 points
                                    </p>
                                </div>

                                {/* Most Common Point */}
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
                                    <p className="text-purple-100 text-xs">MOST COMMON POINT</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {(() => {
                                            const totals = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                                            msceStats.pointDistribution.forEach(subj => {
                                                subj.points.forEach((count, idx) => {
                                                    totals[idx] += count;
                                                });
                                            });
                                            const mostCommon = totals.reduce((max, curr, idx) => curr > max.count ? { point: idx + 1, count: curr } : max, { point: 1, count: 0 });
                                            return `${mostCommon.point} (${mostCommon.count})`;
                                        })()}
                                    </p>
                                    <p className="text-purple-100 text-xs mt-1">Most frequent point across all subjects</p>
                                </div>

                                {/* Least Common Point */}
                                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 text-white">
                                    <p className="text-pink-100 text-xs">LEAST COMMON POINT</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {(() => {
                                            const totals = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                                            msceStats.pointDistribution.forEach(subj => {
                                                subj.points.forEach((count, idx) => {
                                                    totals[idx] += count;
                                                });
                                            });
                                            const leastCommon = totals.reduce((min, curr, idx) => curr < min.count ? { point: idx + 1, count: curr } : min, { point: 1, count: Infinity });
                                            return `${leastCommon.point} (${leastCommon.count})`;
                                        })()}
                                    </p>
                                    <p className="text-pink-100 text-xs mt-1">Least frequent point across all subjects</p>
                                </div>
                            </div>

                            {/* Point Distribution by Subject */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-semibold text-slate-800 mb-4">Point Distribution by Subject</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-left px-4 py-3">Subject</th>
                                                <th className="text-center px-2 py-2 bg-green-100">1</th>
                                                <th className="text-center px-2 py-2 bg-green-100">2</th>
                                                <th className="text-center px-2 py-2 bg-green-100">3</th>
                                                <th className="text-center px-2 py-2 bg-green-100">4</th>
                                                <th className="text-center px-2 py-2 bg-green-100">5</th>
                                                <th className="text-center px-2 py-2 bg-green-100">6</th>
                                                <th className="text-center px-2 py-2 bg-green-100">7</th>
                                                <th className="text-center px-2 py-2 bg-green-100">8</th>
                                                <th className="text-center px-2 py-2 bg-green-100">9</th>
                                                <th className="text-center px-2 py-2 bg-emerald-100">Pass Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {msceStats.pointDistribution.map(subj => {
                                                const total = subj.points.reduce((a, b) => a + b, 0);
                                                const passed = subj.points.slice(0, 6).reduce((a, b) => a + b, 0);
                                                const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
                                                return (
                                                    <tr key={subj.name}>
                                                        <td className="px-4 py-3 font-medium">{subj.name}</td>
                                                        {subj.points.map((count, idx) => (
                                                            <td key={idx} className="text-center px-2 py-2 font-bold text-green-700">{count}</td>
                                                        ))}
                                                        <td className="text-center px-2 py-2 font-bold text-emerald-600">{passRate}%</td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Total Row */}
                                            <tr className="bg-slate-100 font-bold">
                                                <td className="px-4 py-3 font-bold text-slate-800">TOTAL</td>
                                                {msceStats.pointDistribution[0]?.points.map((_, idx) => (
                                                    <td key={idx} className="text-center px-2 py-2 font-bold text-green-800">
                                                        {msceStats.pointDistribution.reduce((sum, subj) => sum + subj.points[idx], 0)}
                                                    </td>
                                                ))}
                                                <td className="text-center px-2 py-2 font-bold text-emerald-600">-</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                    {/* JCE Specific Stats - Show grade distribution */}
                    {isJCE && jceStats && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-800 mb-4">Grade Distribution by Subject</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left px-4 py-3">Subject</th>
                                            <th className="text-center px-2 py-3 bg-green-100">A</th>
                                            <th className="text-center px-2 py-3 bg-blue-100">B</th>
                                            <th className="text-center px-2 py-3 bg-yellow-100">C</th>
                                            <th className="text-center px-2 py-3 bg-orange-100">D</th>
                                            <th className="text-center px-2 py-3 bg-red-100">E</th>
                                            <th className="text-center px-2 py-3 bg-red-200">F</th>
                                            <th className="text-center px-2 py-3 bg-emerald-100">Pass Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {jceStats.gradeCounts.map(subj => {
                                            const totalStudents = subj.A + subj.B + subj.C + subj.D + subj.E + subj.F;
                                            const passed = subj.A + subj.B + subj.C + subj.D;
                                            const passRate = ((passed / totalStudents) * 100).toFixed(1);
                                            return (
                                                <tr key={subj.name}>
                                                    <td className="px-4 py-3 font-medium">{subj.name}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-green-700">{subj.A}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-blue-700">{subj.B}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-yellow-700">{subj.C}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-orange-700">{subj.D}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-red-700">{subj.E}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-red-800">{subj.F}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-emerald-600">{passRate}%</td>
                                                </tr>
                                            );
                                        })}
                                        {/* Total Row */}
                                        <tr className="bg-slate-100 font-bold">
                                            <td className="px-4 py-3 font-bold text-slate-800">TOTAL</td>
                                            <td className="text-center px-2 py-3 font-bold text-green-700">
                                                {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.A, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-blue-700">
                                                {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.B, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-yellow-700">
                                                {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.C, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-orange-700">
                                                {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.D, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-red-700">
                                                {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.E, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-red-800">
                                                {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.F, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-emerald-600">
                                                -
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {/* PSLCE Specific Stats - Grade distribution by subject */}
                    {isPSLCE && pslceStats && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-800 mb-4">Grade Distribution by Subject</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left px-4 py-3">Subject</th>
                                            <th className="text-center px-2 py-3 bg-green-100">A</th>
                                            <th className="text-center px-2 py-3 bg-blue-100">B</th>
                                            <th className="text-center px-2 py-3 bg-yellow-100">C</th>
                                            <th className="text-center px-2 py-3 bg-orange-100">D</th>
                                            <th className="text-center px-2 py-3 bg-red-100">E</th>
                                            <th className="text-center px-2 py-3 bg-red-200">F</th>
                                            <th className="text-center px-2 py-3 bg-emerald-100">Pass Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pslceStats.gradeCounts.map(subj => {
                                            const totalStudents = subj.A + subj.B + subj.C + subj.D + subj.E + subj.F;
                                            const passed = subj.A + subj.B + subj.C + subj.D;
                                            const passRate = ((passed / totalStudents) * 100).toFixed(1);
                                            return (
                                                <tr key={subj.name}>
                                                    <td className="px-4 py-3 font-medium">{subj.name}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-green-700">{subj.A}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-blue-700">{subj.B}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-yellow-700">{subj.C}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-orange-700">{subj.D}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-red-700">{subj.E}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-red-800">{subj.F}</td>
                                                    <td className="text-center px-2 py-3 font-bold text-emerald-600">{passRate}%</td>
                                                </tr>
                                            );
                                        })}
                                        {/* Total Row */}
                                        <tr className="bg-slate-100 font-bold">
                                            <td className="px-4 py-3 font-bold text-slate-800">TOTAL</td>
                                            <td className="text-center px-2 py-3 font-bold text-green-700">
                                                {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.A, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-blue-700">
                                                {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.B, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-yellow-700">
                                                {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.C, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-orange-700">
                                                {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.D, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-red-700">
                                                {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.E, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-red-800">
                                                {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.F, 0)}
                                            </td>
                                            <td className="text-center px-2 py-3 font-bold text-emerald-600">
                                                -
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Student Results Tab - Simplified for PSLCE and JCE */}
            {view === 'results' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name or exam number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3">Student</th>
                                    <th className="text-left px-4 py-3">Exam Number</th>
                                    <th className="text-left px-4 py-3">Class</th>
                                    {isMSCE && (
                                        <th className="text-left px-4 py-3">Points</th>
                                    )}
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-left px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((student: any) => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{student.name}</td>
                                        <td className="px-4 py-3 font-mono text-indigo-600">{student.examNumber}</td>
                                        <td className="px-4 py-3">{student.grade}</td>
                                        {isMSCE && (
                                            <td className="px-4 py-3 font-bold">{(student as MSCEStudent).points}</td>
                                        )}
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {student.passed ? 'Passed' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleViewStudent(student)} className="text-indigo-600 hover:text-indigo-800">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Selections Tab - PSLCE Secondary Selections */}
            {view === 'selections' && isPSLCE && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-semibold text-slate-800">Secondary School Selections</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3">Student</th>
                                    <th className="text-left px-4 py-3">Exam Number</th>
                                    <th className="text-left px-4 py-3">Class</th>
                                    <th className="text-left px-4 py-3">Selected School</th>
                                    <th className="text-left px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(currentData.allStudents as PSLCEStudent[]).filter(s => s.selectedTo).map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">{student.name}</td>
                                        <td className="px-4 py-3 font-mono text-indigo-600">{student.examNumber}</td>
                                        <td className="px-4 py-3">{student.grade}</td>
                                        <td className="px-4 py-3">{student.selectedTo}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewStudent(student)}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Selections Tab - MSCE University Selections */}
            {view === 'selections' && isMSCE && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-semibold text-slate-800">University Selections</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3">Student</th>
                                    <th className="text-left px-4 py-3">Exam Number</th>
                                    <th className="text-left px-4 py-3">Class</th>
                                    <th className="text-left px-4 py-3">Points</th>
                                    <th className="text-left px-4 py-3">University</th>
                                    <th className="text-left px-4 py-3">Program</th>
                                    <th className="text-left px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(currentData.allStudents as MSCEStudent[]).filter(s => s.selectedTo).map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">{student.name}</td>
                                        <td className="px-4 py-3 font-mono text-indigo-600">{student.examNumber}</td>
                                        <td className="px-4 py-3">{student.grade}</td>
                                        <td className="px-4 py-3 font-bold">{student.points}</td>
                                        <td className="px-4 py-3">{student.selectedTo}</td>
                                        <td className="px-4 py-3">{student.program}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewStudent(student)}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add this at the bottom, before the last closing tags */}
            {selectedStudentDetail && (
                <StudentExamDetail
                    student={selectedStudentDetail}
                    examType={examType}
                    onClose={() => setSelectedStudentDetail(null)}
                />
            )}
        </div>
    );
};

export default ExamAnalysisTab;