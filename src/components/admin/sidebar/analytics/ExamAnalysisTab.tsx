// components/admin/analytics/ExamAnalysisTab.tsx
import React, { useState } from 'react';
import { GraduationCap, Award, AlertTriangle, Download, TrendingUp, TrendingDown, Calendar, School, University } from 'lucide-react';

interface ExamAnalysisTabProps {
    examType: 'PSLCE' | 'JCE' | 'MSCE';
    schoolLevel?: 'primary' | 'secondary';
    loading: boolean;
    onExport: () => void;
    onViewStudent: (studentId: string) => void;
    examData?: any;
    secondarySelections?: any[];
    universitySelections?: any[];
}

const ExamAnalysisTab: React.FC<ExamAnalysisTabProps> = ({
    examType,
    schoolLevel,
    loading,
    onExport,
    onViewStudent,
    examData,
    secondarySelections = [],
    universitySelections = [],
}) => {
    const [selectedYear, setSelectedYear] = useState<number>(2025);

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading exam data...</p>
            </div>
        );
    }

    if (!examData) {
        return (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <p className="text-slate-500">No exam data available</p>
            </div>
        );
    }

    const getExamTitle = () => {
        switch (examType) {
            case 'PSLCE': return 'PSLCE (Standard 8) Results';
            case 'JCE': return 'JCE (Form 2) Results';
            case 'MSCE': return 'MSCE (Form 4) Results';
            default: return 'Exam Results';
        }
    };

    const isMSCE = examType === 'MSCE';
    const isPSLCE = examType === 'PSLCE';
    const isJCE = examType === 'JCE';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{getExamTitle()}</h2>
                    <p className="text-slate-500">Year: {examData.year} | Total Students: {examData.totalStudents}</p>
                </div>
                <div className="flex gap-2">
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
            </div>

            {/* Overview Tab - Only Tab */}
            <div className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="p-2 bg-indigo-100 rounded-lg w-fit mb-3">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{examData.totalStudents}</p>
                        <p className="text-sm text-slate-500">Total Students</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="p-2 bg-emerald-100 rounded-lg w-fit mb-3">
                            <Award className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">{examData.passed}</p>
                        <p className="text-sm text-slate-500">Passed</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="p-2 bg-red-100 rounded-lg w-fit mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <p className="text-2xl font-bold text-red-600">{examData.totalStudents - examData.passed}</p>
                        <p className="text-sm text-slate-500">Failed</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{examData.passRate}%</p>
                        <p className="text-sm text-slate-500">Pass Rate</p>
                    </div>
                </div>

                {/* Selection Statistics - Only for PSLCE and MSCE */}
                {(isPSLCE && secondarySelections.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
                                <School className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{examData.selectionRate || 0}%</p>
                            <p className="text-sm text-slate-500">Students Selected to Secondary Schools</p>
                            <p className="text-xs text-slate-400 mt-1">{secondarySelections.length} out of {examData.totalStudents} students</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <h4 className="font-semibold text-slate-700 mb-2">Top Secondary Schools</h4>
                            <div className="space-y-2">
                                {examData.topSchools?.slice(0, 5).map((school: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">{school.name}</span>
                                        <span className="text-sm font-semibold text-purple-600">{school.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(isMSCE && universitySelections.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
                                <University className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{examData.selectionRate || 0}%</p>
                            <p className="text-sm text-slate-500">Students Selected to Universities</p>
                            <p className="text-xs text-slate-400 mt-1">{universitySelections.length} out of {examData.totalStudents} students</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <h4 className="font-semibold text-slate-700 mb-2">Top Universities</h4>
                            <div className="space-y-2">
                                {examData.topUniversities?.slice(0, 5).map((uni: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">{uni.name}</span>
                                        <span className="text-sm font-semibold text-purple-600">{uni.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Subject Performance Table - All exam types */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Subject Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3">Subject</th>
                                    <th className="text-center px-4 py-3">Average Score</th>
                                    <th className="text-center px-4 py-3">Pass Rate</th>
                                    <th className="text-center px-4 py-3">Highest Score</th>
                                    <th className="text-center px-4 py-3">Lowest Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {examData.subjectPerformance?.map((subject: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 font-medium">{subject.name}</td>
                                        <td className="text-center px-4 py-3">{subject.averageScore}%</td>
                                        <td className="text-center px-4 py-3">{subject.passRate}%</td>
                                        <td className="text-center px-4 py-3">{subject.highestScore}%</td>
                                        <td className="text-center px-4 py-3">{subject.lowestScore}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Student Results Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Student Results</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3">Student Name</th>
                                    <th className="text-left px-4 py-3">Exam Number</th>
                                    <th className="text-left px-4 py-3">Grade</th>
                                    <th className="text-center px-4 py-3">Status</th>
                                    <th className="text-center px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {examData.allStudents?.map((student: any) => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{student.name}</td>
                                        <td className="px-4 py-3 font-mono text-sm">{student.examNumber}</td>
                                        <td className="px-4 py-3">{student.grade}</td>
                                        <td className="text-center px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {student.passed ? 'Passed' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="text-center px-4 py-3">
                                            <button
                                                onClick={() => onViewStudent(student.id)}
                                                className="px-3 py-1.5 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamAnalysisTab;

// // components/admin/analytics/ExamAnalysisTab.tsx
// import React, { useState } from 'react';
// import { GraduationCap, Award, AlertTriangle, Download, TrendingUp, TrendingDown, Calendar, School, University } from 'lucide-react';

// interface ExamAnalysisTabProps {
//     examType: 'PSLCE' | 'JCE' | 'MSCE';
//     schoolLevel?: 'primary' | 'secondary';
//     loading: boolean;
//     onExport: () => void;
//     onViewStudent: (studentId: string) => void;
//     examData?: any;
//     secondarySelections?: any[];
//     universitySelections?: any[];
// }

// // Types for different exam types
// interface PSLCEStudent {
//     id: string;
//     name: string;
//     examNumber: string;
//     grade: string;
//     english: number;
//     math: number;
//     science: number;
//     chichewa: number;
//     social: number;
//     passed: boolean;
//     selectedTo: string | null;
// }

// interface JCEStudent {
//     id: string;
//     name: string;
//     examNumber: string;
//     grade: string;
//     english: string;
//     math: string;
//     biology: string;
//     chemistry: string;
//     physics: string;
//     passed: boolean;
// }

// interface MSCEStudent {
//     id: string;
//     name: string;
//     examNumber: string;
//     grade: string;
//     points: number;
//     passed: boolean;
//     selectedTo: string | null;
//     program: string | null;
// }

// // MOCK DATA - PSLCE (Standard 8)
// const mockPSLCEData = {
//     year: 2025,
//     totalStudents: 245,
//     passed: 198,
//     allStudents: [
//         { id: '1', name: 'Chisomo Banda', examNumber: 'STU0001', grade: 'Standard 8', english: 85, math: 82, science: 88, chichewa: 90, social: 84, passed: true, selectedTo: 'Kamuzu Academy' },
//         { id: '2', name: 'Mary Phiri', examNumber: 'STU0002', grade: 'Standard 8', english: 82, math: 78, science: 85, chichewa: 88, social: 80, passed: true, selectedTo: 'Bishop Mackenzie' },
//         { id: '3', name: 'Peter Mwale', examNumber: 'STU0003', grade: 'Standard 8', english: 65, math: 58, science: 62, chichewa: 70, social: 60, passed: true, selectedTo: 'Lilongwe Girls' },
//         { id: '4', name: 'Alice Kachingwe', examNumber: 'STU0004', grade: 'Standard 8', english: 45, math: 38, science: 42, chichewa: 50, social: 40, passed: false, selectedTo: null },
//         { id: '5', name: 'John Gondwe', examNumber: 'STU0005', grade: 'Standard 8', english: 72, math: 68, science: 70, chichewa: 75, social: 68, passed: true, selectedTo: 'St. Mary\'s' },
//         { id: '6', name: 'James Banda', examNumber: 'STU0006', grade: 'Standard 8', english: 35, math: 28, science: 32, chichewa: 40, social: 30, passed: false, selectedTo: null },
//     ] as PSLCEStudent[]
// };

// // MOCK DATA - JCE (Form 2)
// const mockJCEData = {
//     year: 2025,
//     totalStudents: 312,
//     passed: 248,
//     allStudents: [
//         { id: '1', name: 'Chisomo Banda', examNumber: 'STU0001', grade: 'Form 2', english: 'A', math: 'B', biology: 'A', chemistry: 'B', physics: 'B', passed: true },
//         { id: '2', name: 'Mary Phiri', examNumber: 'STU0002', grade: 'Form 2', english: 'B', math: 'B', biology: 'A', chemistry: 'B', physics: 'C', passed: true },
//         { id: '6', name: 'James Banda', examNumber: 'STU0006', grade: 'Form 2', english: 'F', math: 'F', biology: 'E', chemistry: 'F', physics: 'F', passed: false },
//     ] as JCEStudent[]
// };

// // MOCK DATA - MSCE (Form 4)
// const mockMSCEData = {
//     year: 2025,
//     totalStudents: 189,
//     passed: 156,
//     allStudents: [
//         { id: '1', name: 'Chisomo Banda', examNumber: 'STU0001', grade: 'Form 4', points: 6, passed: true, selectedTo: 'University of Malawi', program: 'Medicine' },
//         { id: '2', name: 'Mary Phiri', examNumber: 'STU0002', grade: 'Form 4', points: 12, passed: true, selectedTo: 'MUBAS', program: 'Engineering' },
//         { id: '3', name: 'Peter Mwale', examNumber: 'STU0003', grade: 'Form 4', points: 48, passed: false, selectedTo: null, program: null },
//         { id: '4', name: 'Alice Kachingwe', examNumber: 'STU0004', grade: 'Form 4', points: 8, passed: true, selectedTo: 'LUANAR', program: 'Agriculture' },
//         { id: '5', name: 'John Gondwe', examNumber: 'STU0005', grade: 'Form 4', points: 15, passed: true, selectedTo: 'Kamuzu University', program: 'Nursing' },
//         { id: '6', name: 'James Banda', examNumber: 'STU0006', grade: 'Form 4', points: 48, passed: false, selectedTo: null, program: null },
//     ] as MSCEStudent[]
// };

// const ExamAnalysisTab: React.FC<ExamAnalysisTabProps> = ({
//     examType,
//     schoolLevel,
//     loading,
//     onExport,
//     onViewStudent,
// }) => {
//     const [selectedYear, setSelectedYear] = useState<number>(2025);

//     const getData = () => {
//         switch (examType) {
//             case 'PSLCE': return mockPSLCEData;
//             case 'JCE': return mockJCEData;
//             case 'MSCE': return mockMSCEData;
//             default: return mockMSCEData;
//         }
//     };

//     const currentData = getData();
//     const isMSCE = examType === 'MSCE';
//     const isPSLCE = examType === 'PSLCE';
//     const isJCE = examType === 'JCE';

//     const getExamTitle = () => {
//         switch (examType) {
//             case 'PSLCE': return 'PSLCE (Standard 8) Results';
//             case 'JCE': return 'JCE (Form 2) Results';
//             case 'MSCE': return 'MSCE (Form 4) Results';
//             default: return 'Exam Results';
//         }
//     };

//     // Calculate statistics for MSCE
//     const calculateMSCEStats = () => {
//         const students = currentData.allStudents as MSCEStudent[];
//         const points = students.map(s => s.points);
//         const highestPoints = Math.min(...points);
//         const lowestPoints = Math.max(...points);
//         const below10Points = students.filter(s => s.points <= 10).length;
//         const below20Points = students.filter(s => s.points <= 20 && s.points > 10).length;
//         const passRate = ((currentData.passed / currentData.totalStudents) * 100).toFixed(1);

//         // Calculate selection statistics
//         const selectedStudents = students.filter(s => s.selectedTo);
//         const selectionRate = ((selectedStudents.length / currentData.totalStudents) * 100).toFixed(1);

//         // Group by university
//         const universityGroups: { [key: string]: number } = {};
//         selectedStudents.forEach(s => {
//             if (s.selectedTo) {
//                 universityGroups[s.selectedTo] = (universityGroups[s.selectedTo] || 0) + 1;
//             }
//         });
//         const topUniversities = Object.entries(universityGroups)
//             .map(([name, count]) => ({ name, count, percentage: ((count / selectedStudents.length) * 100).toFixed(1) }))
//             .sort((a, b) => b.count - a.count)
//             .slice(0, 5);

//         // Group by program
//         const programGroups: { [key: string]: number } = {};
//         selectedStudents.forEach(s => {
//             if (s.program) {
//                 programGroups[s.program] = (programGroups[s.program] || 0) + 1;
//             }
//         });
//         const topPrograms = Object.entries(programGroups)
//             .map(([name, count]) => ({ name, count, percentage: ((count / selectedStudents.length) * 100).toFixed(1) }))
//             .sort((a, b) => b.count - a.count)
//             .slice(0, 5);

//         // Mock point distribution for each subject
//         const pointDistribution = [
//             { name: 'English', points: [1, 1, 0, 0, 0, 0, 0, 0, 0] },
//             { name: 'Mathematics', points: [0, 2, 0, 0, 0, 0, 0, 0, 0] },
//             { name: 'Biology', points: [2, 0, 0, 0, 0, 0, 0, 0, 0] },
//             { name: 'Chemistry', points: [0, 2, 0, 0, 0, 0, 0, 0, 0] },
//             { name: 'Physics', points: [0, 1, 1, 0, 0, 0, 0, 0, 0] }
//         ];

//         return {
//             highestPoints,
//             lowestPoints,
//             below10Points,
//             below20Points,
//             passRate,
//             pointDistribution,
//             selectionRate,
//             topUniversities,
//             topPrograms,
//             selectedCount: selectedStudents.length
//         };
//     };

//     // Calculate statistics for PSLCE
//     const calculatePSLCEStats = () => {
//         const students = currentData.allStudents as PSLCEStudent[];
//         const subjects = ['english', 'math', 'science', 'chichewa', 'social'];
//         const passRate = ((currentData.passed / currentData.totalStudents) * 100).toFixed(1);

//         // Calculate selection statistics
//         const selectedStudents = students.filter(s => s.selectedTo);
//         const selectionRate = ((selectedStudents.length / currentData.totalStudents) * 100).toFixed(1);

//         // Group by school
//         const schoolGroups: { [key: string]: number } = {};
//         selectedStudents.forEach(s => {
//             if (s.selectedTo) {
//                 schoolGroups[s.selectedTo] = (schoolGroups[s.selectedTo] || 0) + 1;
//             }
//         });
//         const topSchools = Object.entries(schoolGroups)
//             .map(([name, count]) => ({ name, count, percentage: ((count / selectedStudents.length) * 100).toFixed(1) }))
//             .sort((a, b) => b.count - a.count)
//             .slice(0, 5);

//         const getGradeFromScore = (score: number): string => {
//             if (score >= 80) return 'A';
//             if (score >= 70) return 'B';
//             if (score >= 60) return 'C';
//             if (score >= 50) return 'D';
//             if (score >= 40) return 'E';
//             return 'F';
//         };

//         const gradeCounts = subjects.map(subj => {
//             const scores = students.map(s => s[subj as keyof PSLCEStudent] as number);
//             const countA = scores.filter(s => getGradeFromScore(s) === 'A').length;
//             const countB = scores.filter(s => getGradeFromScore(s) === 'B').length;
//             const countC = scores.filter(s => getGradeFromScore(s) === 'C').length;
//             const countD = scores.filter(s => getGradeFromScore(s) === 'D').length;
//             const countE = scores.filter(s => getGradeFromScore(s) === 'E').length;
//             const countF = scores.filter(s => getGradeFromScore(s) === 'F').length;
//             return {
//                 name: subj.charAt(0).toUpperCase() + subj.slice(1),
//                 A: countA,
//                 B: countB,
//                 C: countC,
//                 D: countD,
//                 E: countE,
//                 F: countF
//             };
//         });

//         return { passRate, gradeCounts, selectionRate, topSchools, selectedCount: selectedStudents.length };
//     };

//     // Calculate statistics for JCE
//     const calculateJCEStats = () => {
//         const students = currentData.allStudents as JCEStudent[];
//         const subjects = ['english', 'math', 'biology', 'chemistry', 'physics'];
//         const passRate = ((currentData.passed / currentData.totalStudents) * 100).toFixed(1);

//         const gradeCounts = subjects.map(subj => {
//             const grades = students.map(s => s[subj as keyof JCEStudent] as string);
//             const countA = grades.filter(g => g === 'A').length;
//             const countB = grades.filter(g => g === 'B').length;
//             const countC = grades.filter(g => g === 'C').length;
//             const countD = grades.filter(g => g === 'D').length;
//             const countE = grades.filter(g => g === 'E').length;
//             const countF = grades.filter(g => g === 'F').length;
//             return {
//                 name: subj.charAt(0).toUpperCase() + subj.slice(1),
//                 A: countA,
//                 B: countB,
//                 C: countC,
//                 D: countD,
//                 E: countE,
//                 F: countF
//             };
//         });

//         return { passRate, gradeCounts };
//     };

//     const msceStats = isMSCE ? calculateMSCEStats() : null;
//     const pslceStats = isPSLCE ? calculatePSLCEStats() : null;
//     const jceStats = isJCE ? calculateJCEStats() : null;

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">{getExamTitle()}</h2>
//                     <p className="text-slate-500">Year: {currentData.year} | Total Students: {currentData.totalStudents}</p>
//                 </div>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={onExport}
//                         className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
//                     >
//                         <Download className="w-4 h-4" />
//                         Export Report
//                     </button>
//                     <div className="flex items-center gap-2">
//                         <Calendar className="w-4 h-4 text-slate-500" />
//                         <select
//                             value={selectedYear}
//                             onChange={(e) => setSelectedYear(Number(e.target.value))}
//                             className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
//                         >
//                             <option value={2024}>2024 Academic Year</option>
//                             <option value={2025}>2025 Academic Year</option>
//                             <option value={2026}>2026 Academic Year</option>
//                         </select>
//                     </div>
//                 </div>
//             </div>

//             {/* Overview Tab - Only Tab */}
//             <div className="space-y-6">
//                 {/* Key Stats */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                         <div className="p-2 bg-indigo-100 rounded-lg w-fit mb-3">
//                             <GraduationCap className="w-5 h-5 text-indigo-600" />
//                         </div>
//                         <p className="text-2xl font-bold text-slate-800">{currentData.totalStudents}</p>
//                         <p className="text-sm text-slate-500">Total Students</p>
//                     </div>
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                         <div className="p-2 bg-emerald-100 rounded-lg w-fit mb-3">
//                             <Award className="w-5 h-5 text-emerald-600" />
//                         </div>
//                         <p className="text-2xl font-bold text-emerald-600">{currentData.passed}</p>
//                         <p className="text-sm text-slate-500">Passed</p>
//                     </div>
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                         <div className="p-2 bg-red-100 rounded-lg w-fit mb-3">
//                             <AlertTriangle className="w-5 h-5 text-red-600" />
//                         </div>
//                         <p className="text-2xl font-bold text-red-600">{currentData.totalStudents - currentData.passed}</p>
//                         <p className="text-sm text-slate-500">Failed</p>
//                     </div>
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                         <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3">
//                             <TrendingUp className="w-5 h-5 text-blue-600" />
//                         </div>
//                         <p className="text-2xl font-bold text-blue-600">
//                             {isMSCE ? msceStats?.passRate : isPSLCE ? pslceStats?.passRate : jceStats?.passRate}%
//                         </p>
//                         <p className="text-sm text-slate-500">Pass Rate</p>
//                     </div>
//                 </div>

//                 {/* Selection Statistics - Only for PSLCE and MSCE */}
//                 {(isPSLCE && pslceStats) && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                             <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
//                                 <School className="w-5 h-5 text-purple-600" />
//                             </div>
//                             <p className="text-2xl font-bold text-purple-600">{pslceStats.selectionRate}%</p>
//                             <p className="text-sm text-slate-500">Students Selected to Secondary Schools</p>
//                             <p className="text-xs text-slate-400 mt-1">{pslceStats.selectedCount} out of {currentData.totalStudents} students</p>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                             <h4 className="font-semibold text-slate-700 mb-2">Top Secondary Schools</h4>
//                             <div className="space-y-2">
//                                 {pslceStats.topSchools.map((school, idx) => (
//                                     <div key={idx} className="flex justify-between items-center">
//                                         <span className="text-sm text-slate-600">{school.name}</span>
//                                         <span className="text-sm font-semibold text-purple-600">{school.percentage}%</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {(isMSCE && msceStats) && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                             <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
//                                 <University className="w-5 h-5 text-purple-600" />
//                             </div>
//                             <p className="text-2xl font-bold text-purple-600">{msceStats.selectionRate}%</p>
//                             <p className="text-sm text-slate-500">Students Selected to Universities</p>
//                             <p className="text-xs text-slate-400 mt-1">{msceStats.selectedCount} out of {currentData.totalStudents} students</p>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                             <h4 className="font-semibold text-slate-700 mb-2">Top Universities</h4>
//                             <div className="space-y-2">
//                                 {msceStats.topUniversities.map((uni, idx) => (
//                                     <div key={idx} className="flex justify-between items-center">
//                                         <span className="text-sm text-slate-600">{uni.name}</span>
//                                         <span className="text-sm font-semibold text-purple-600">{uni.percentage}%</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Subject Performance Stats Cards - PSLCE and JCE only */}
//                 {(isPSLCE || isJCE) && (
//                     <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
//                         <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
//                             <p className="text-green-100 text-xs">HIGHEST PASS RATE</p>
//                             <p className="text-2xl font-bold mt-1">
//                                 {isPSLCE
//                                     ? pslceStats?.gradeCounts.reduce((highest, current) => {
//                                         const total = current.A + current.B + current.C + current.D + current.E + current.F;
//                                         const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
//                                         if (passRate > (highest.passRate || 0)) {
//                                             return { name: current.name, passRate: passRate };
//                                         }
//                                         return highest;
//                                     }, { name: '', passRate: 0 }).name || 'N/A'
//                                     : jceStats?.gradeCounts.reduce((highest, current) => {
//                                         const total = current.A + current.B + current.C + current.D + current.E + current.F;
//                                         const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
//                                         if (passRate > (highest.passRate || 0)) {
//                                             return { name: current.name, passRate: passRate };
//                                         }
//                                         return highest;
//                                     }, { name: '', passRate: 0 }).name || 'N/A'
//                                 }
//                             </p>
//                             <p className="text-green-100 text-xs mt-1">
//                                 {isPSLCE
//                                     ? `${pslceStats?.gradeCounts.reduce((highest, current) => {
//                                         const total = current.A + current.B + current.C + current.D + current.E + current.F;
//                                         const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
//                                         if (passRate > (highest.passRate || 0)) {
//                                             return { passRate: passRate };
//                                         }
//                                         return highest;
//                                     }, { passRate: 0 }).passRate.toFixed(1)}% pass rate`
//                                     : `${jceStats?.gradeCounts.reduce((highest, current) => {
//                                         const total = current.A + current.B + current.C + current.D + current.E + current.F;
//                                         const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
//                                         if (passRate > (highest.passRate || 0)) {
//                                             return { passRate: passRate };
//                                         }
//                                         return highest;
//                                     }, { passRate: 0 }).passRate.toFixed(1)}% pass rate`
//                                 }
//                             </p>
//                         </div>

//                         <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
//                             <p className="text-red-100 text-xs">LOWEST PASS RATE</p>
//                             <p className="text-2xl font-bold mt-1">
//                                 {isPSLCE
//                                     ? pslceStats?.gradeCounts.reduce((lowest, current) => {
//                                         const total = current.A + current.B + current.C + current.D + current.E + current.F;
//                                         const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
//                                         if (passRate < (lowest.passRate ?? 100)) {
//                                             return { name: current.name, passRate: passRate };
//                                         }
//                                         return lowest;
//                                     }, { name: '', passRate: 100 }).name || 'N/A'
//                                     : jceStats?.gradeCounts.reduce((lowest, current) => {
//                                         const total = current.A + current.B + current.C + current.D + current.E + current.F;
//                                         const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
//                                         if (passRate < (lowest.passRate ?? 100)) {
//                                             return { name: current.name, passRate: passRate };
//                                         }
//                                         return lowest;
//                                     }, { name: '', passRate: 100 }).name || 'N/A'
//                                 }
//                             </p>
//                             <p className="text-red-100 text-xs mt-1">
//                                 {isPSLCE
//                                     ? `${pslceStats?.gradeCounts.reduce((lowest, current) => {
//                                         const total = current.A + current.B + current.C + current.D + current.E + current.F;
//                                         const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
//                                         if (passRate < (lowest.passRate ?? 100)) {
//                                             return { passRate: passRate };
//                                         }
//                                         return lowest;
//                                     }, { passRate: 100 }).passRate.toFixed(1)}% pass rate`
//                                     : `${jceStats?.gradeCounts.reduce((lowest, current) => {
//                                         const total = current.A + current.B + current.C + current.D + current.E + current.F;
//                                         const passRate = ((current.A + current.B + current.C + current.D) / total) * 100;
//                                         if (passRate < (lowest.passRate ?? 100)) {
//                                             return { passRate: passRate };
//                                         }
//                                         return lowest;
//                                     }, { passRate: 100 }).passRate.toFixed(1)}% pass rate`
//                                 }
//                             </p>
//                         </div>

//                         <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
//                             <p className="text-yellow-100 text-xs">MOST A's</p>
//                             <p className="text-2xl font-bold mt-1">
//                                 {isPSLCE
//                                     ? pslceStats?.gradeCounts.reduce((highest, current) => {
//                                         if (current.A > (highest.count || 0)) {
//                                             return { name: current.name, count: current.A };
//                                         }
//                                         return highest;
//                                     }, { name: '', count: 0 }).name || 'N/A'
//                                     : jceStats?.gradeCounts.reduce((highest, current) => {
//                                         if (current.A > (highest.count || 0)) {
//                                             return { name: current.name, count: current.A };
//                                         }
//                                         return highest;
//                                     }, { name: '', count: 0 }).name || 'N/A'
//                                 }
//                             </p>
//                             <p className="text-yellow-100 text-xs mt-1">
//                                 {isPSLCE
//                                     ? `${pslceStats?.gradeCounts.reduce((highest, current) => {
//                                         if (current.A > (highest.count || 0)) {
//                                             return { count: current.A };
//                                         }
//                                         return highest;
//                                     }, { count: 0 }).count} students scored A`
//                                     : `${jceStats?.gradeCounts.reduce((highest, current) => {
//                                         if (current.A > (highest.count || 0)) {
//                                             return { count: current.A };
//                                         }
//                                         return highest;
//                                     }, { count: 0 }).count} students scored A`
//                                 }
//                             </p>
//                         </div>

//                         <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
//                             <p className="text-blue-100 text-xs">MOST B's</p>
//                             <p className="text-2xl font-bold mt-1">
//                                 {isPSLCE
//                                     ? pslceStats?.gradeCounts.reduce((highest, current) => {
//                                         if (current.B > (highest.count || 0)) {
//                                             return { name: current.name, count: current.B };
//                                         }
//                                         return highest;
//                                     }, { name: '', count: 0 }).name || 'N/A'
//                                     : jceStats?.gradeCounts.reduce((highest, current) => {
//                                         if (current.B > (highest.count || 0)) {
//                                             return { name: current.name, count: current.B };
//                                         }
//                                         return highest;
//                                     }, { name: '', count: 0 }).name || 'N/A'
//                                 }
//                             </p>
//                             <p className="text-blue-100 text-xs mt-1">
//                                 {isPSLCE
//                                     ? `${pslceStats?.gradeCounts.reduce((highest, current) => {
//                                         if (current.B > (highest.count || 0)) {
//                                             return { count: current.B };
//                                         }
//                                         return highest;
//                                     }, { count: 0 }).count} students scored B`
//                                     : `${jceStats?.gradeCounts.reduce((highest, current) => {
//                                         if (current.B > (highest.count || 0)) {
//                                             return { count: current.B };
//                                         }
//                                         return highest;
//                                     }, { count: 0 }).count} students scored B`
//                                 }
//                             </p>
//                         </div>

//                         <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
//                             <p className="text-purple-100 text-xs">MOST COMMON GRADE</p>
//                             <p className="text-2xl font-bold mt-1">
//                                 {(() => {
//                                     const gradeCounts = isPSLCE ? pslceStats?.gradeCounts : jceStats?.gradeCounts;
//                                     if (!gradeCounts) return 'N/A';

//                                     const totals = {
//                                         A: gradeCounts.reduce((sum, subj) => sum + subj.A, 0),
//                                         B: gradeCounts.reduce((sum, subj) => sum + subj.B, 0),
//                                         C: gradeCounts.reduce((sum, subj) => sum + subj.C, 0),
//                                         D: gradeCounts.reduce((sum, subj) => sum + subj.D, 0),
//                                         E: gradeCounts.reduce((sum, subj) => sum + subj.E, 0),
//                                         F: gradeCounts.reduce((sum, subj) => sum + subj.F, 0)
//                                     };

//                                     const mostCommon = Object.entries(totals).reduce((a, b) => a[1] > b[1] ? a : b);
//                                     return `${mostCommon[0]} (${mostCommon[1]})`;
//                                 })()}
//                             </p>
//                             <p className="text-purple-100 text-xs mt-1">Most frequent grade across all subjects</p>
//                         </div>

//                         <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 text-white">
//                             <p className="text-pink-100 text-xs">LEAST COMMON GRADE</p>
//                             <p className="text-2xl font-bold mt-1">
//                                 {(() => {
//                                     const gradeCounts = isPSLCE ? pslceStats?.gradeCounts : jceStats?.gradeCounts;
//                                     if (!gradeCounts) return 'N/A';

//                                     const totals = {
//                                         A: gradeCounts.reduce((sum, subj) => sum + subj.A, 0),
//                                         B: gradeCounts.reduce((sum, subj) => sum + subj.B, 0),
//                                         C: gradeCounts.reduce((sum, subj) => sum + subj.C, 0),
//                                         D: gradeCounts.reduce((sum, subj) => sum + subj.D, 0),
//                                         E: gradeCounts.reduce((sum, subj) => sum + subj.E, 0),
//                                         F: gradeCounts.reduce((sum, subj) => sum + subj.F, 0)
//                                     };

//                                     const leastCommon = Object.entries(totals).reduce((a, b) => a[1] < b[1] ? a : b);
//                                     return `${leastCommon[0]} (${leastCommon[1]})`;
//                                 })()}
//                             </p>
//                             <p className="text-pink-100 text-xs mt-1">Least frequent grade across all subjects</p>
//                         </div>
//                     </div>
//                 )}

//                 {/* MSCE Specific Stats */}
//                 {isMSCE && msceStats && (
//                     <>
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                                 <p className="text-sm text-slate-500">Highest (Best)</p>
//                                 <p className="text-2xl font-bold text-green-600">{msceStats.highestPoints} points</p>
//                             </div>
//                             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                                 <p className="text-sm text-slate-500">Lowest (Worst)</p>
//                                 <p className="text-2xl font-bold text-red-600">{msceStats.lowestPoints} points</p>
//                             </div>
//                             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                                 <p className="text-sm text-slate-500">Students ≤ 10 points</p>
//                                 <p className="text-2xl font-bold text-emerald-600">{msceStats.below10Points}</p>
//                             </div>
//                             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                                 <p className="text-sm text-slate-500">Students 11-20 points</p>
//                                 <p className="text-2xl font-bold text-blue-600">{msceStats.below20Points}</p>
//                             </div>
//                         </div>

//                         {/* 6 Stats Cards for MSCE */}
//                         <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
//                             <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
//                                 <p className="text-green-100 text-xs">HIGHEST PASS RATE</p>
//                                 <p className="text-2xl font-bold mt-1">
//                                     {msceStats.pointDistribution.reduce((highest, current) => {
//                                         const total = current.points.reduce((a, b) => a + b, 0);
//                                         const passed = current.points.slice(0, 6).reduce((a, b) => a + b, 0);
//                                         const passRate = total > 0 ? (passed / total) * 100 : 0;
//                                         if (passRate > (highest.passRate || 0)) {
//                                             return { name: current.name, passRate: passRate };
//                                         }
//                                         return highest;
//                                     }, { name: '', passRate: 0 }).name || 'N/A'}
//                                 </p>
//                                 <p className="text-green-100 text-xs mt-1">
//                                     {msceStats.pointDistribution.reduce((highest, current) => {
//                                         const total = current.points.reduce((a, b) => a + b, 0);
//                                         const passed = current.points.slice(0, 6).reduce((a, b) => a + b, 0);
//                                         const passRate = total > 0 ? (passed / total) * 100 : 0;
//                                         if (passRate > (highest.passRate || 0)) {
//                                             return { passRate: passRate };
//                                         }
//                                         return highest;
//                                     }, { passRate: 0 }).passRate.toFixed(1)}% pass rate
//                                 </p>
//                             </div>

//                             <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
//                                 <p className="text-red-100 text-xs">LOWEST PASS RATE</p>
//                                 <p className="text-2xl font-bold mt-1">
//                                     {msceStats.pointDistribution.reduce((lowest, current) => {
//                                         const total = current.points.reduce((a, b) => a + b, 0);
//                                         const passed = current.points.slice(0, 6).reduce((a, b) => a + b, 0);
//                                         const passRate = total > 0 ? (passed / total) * 100 : 100;
//                                         if (passRate < (lowest.passRate ?? 100)) {
//                                             return { name: current.name, passRate: passRate };
//                                         }
//                                         return lowest;
//                                     }, { name: '', passRate: 100 }).name || 'N/A'}
//                                 </p>
//                                 <p className="text-red-100 text-xs mt-1">
//                                     {msceStats.pointDistribution.reduce((lowest, current) => {
//                                         const total = current.points.reduce((a, b) => a + b, 0);
//                                         const passed = current.points.slice(0, 6).reduce((a, b) => a + b, 0);
//                                         const passRate = total > 0 ? (passed / total) * 100 : 100;
//                                         if (passRate < (lowest.passRate ?? 100)) {
//                                             return { passRate: passRate };
//                                         }
//                                         return lowest;
//                                     }, { passRate: 100 }).passRate.toFixed(1)}% pass rate
//                                 </p>
//                             </div>

//                             <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
//                                 <p className="text-yellow-100 text-xs">MOST 1's (BEST)</p>
//                                 <p className="text-2xl font-bold mt-1">
//                                     {msceStats.pointDistribution.reduce((highest, current) => {
//                                         if (current.points[0] > (highest.count || 0)) {
//                                             return { name: current.name, count: current.points[0] };
//                                         }
//                                         return highest;
//                                     }, { name: '', count: 0 }).name || 'N/A'}
//                                 </p>
//                                 <p className="text-yellow-100 text-xs mt-1">
//                                     {msceStats.pointDistribution.reduce((highest, current) => {
//                                         if (current.points[0] > (highest.count || 0)) {
//                                             return { count: current.points[0] };
//                                         }
//                                         return highest;
//                                     }, { count: 0 }).count} students scored 1 point
//                                 </p>
//                             </div>

//                             <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
//                                 <p className="text-blue-100 text-xs">MOST 2's</p>
//                                 <p className="text-2xl font-bold mt-1">
//                                     {msceStats.pointDistribution.reduce((highest, current) => {
//                                         if (current.points[1] > (highest.count || 0)) {
//                                             return { name: current.name, count: current.points[1] };
//                                         }
//                                         return highest;
//                                     }, { name: '', count: 0 }).name || 'N/A'}
//                                 </p>
//                                 <p className="text-blue-100 text-xs mt-1">
//                                     {msceStats.pointDistribution.reduce((highest, current) => {
//                                         if (current.points[1] > (highest.count || 0)) {
//                                             return { count: current.points[1] };
//                                         }
//                                         return highest;
//                                     }, { count: 0 }).count} students scored 2 points
//                                 </p>
//                             </div>

//                             <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
//                                 <p className="text-purple-100 text-xs">MOST COMMON POINT</p>
//                                 <p className="text-2xl font-bold mt-1">
//                                     {(() => {
//                                         const totals = [0, 0, 0, 0, 0, 0, 0, 0, 0];
//                                         msceStats.pointDistribution.forEach(subj => {
//                                             subj.points.forEach((count, idx) => {
//                                                 totals[idx] += count;
//                                             });
//                                         });
//                                         const mostCommon = totals.reduce((max, curr, idx) => curr > max.count ? { point: idx + 1, count: curr } : max, { point: 1, count: 0 });
//                                         return `${mostCommon.point} (${mostCommon.count})`;
//                                     })()}
//                                 </p>
//                                 <p className="text-purple-100 text-xs mt-1">Most frequent point across all subjects</p>
//                             </div>

//                             <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 text-white">
//                                 <p className="text-pink-100 text-xs">LEAST COMMON POINT</p>
//                                 <p className="text-2xl font-bold mt-1">
//                                     {(() => {
//                                         const totals = [0, 0, 0, 0, 0, 0, 0, 0, 0];
//                                         msceStats.pointDistribution.forEach(subj => {
//                                             subj.points.forEach((count, idx) => {
//                                                 totals[idx] += count;
//                                             });
//                                         });
//                                         const leastCommon = totals.reduce((min, curr, idx) => curr < min.count ? { point: idx + 1, count: curr } : min, { point: 1, count: Infinity });
//                                         return `${leastCommon.point} (${leastCommon.count})`;
//                                     })()}
//                                 </p>
//                                 <p className="text-pink-100 text-xs mt-1">Least frequent point across all subjects</p>
//                             </div>
//                         </div>

//                         {/* Point Distribution by Subject */}
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                             <h3 className="font-semibold text-slate-800 mb-4">Point Distribution by Subject</h3>
//                             <div className="overflow-x-auto">
//                                 <table className="w-full">
//                                     <thead className="bg-slate-50">
//                                         <tr>
//                                             <th className="text-left px-4 py-3">Subject</th>
//                                             <th className="text-center px-2 py-2 bg-green-100">1</th>
//                                             <th className="text-center px-2 py-2 bg-green-100">2</th>
//                                             <th className="text-center px-2 py-2 bg-green-100">3</th>
//                                             <th className="text-center px-2 py-2 bg-green-100">4</th>
//                                             <th className="text-center px-2 py-2 bg-green-100">5</th>
//                                             <th className="text-center px-2 py-2 bg-green-100">6</th>
//                                             <th className="text-center px-2 py-2 bg-green-100">7</th>
//                                             <th className="text-center px-2 py-2 bg-green-100">8</th>
//                                             <th className="text-center px-2 py-2 bg-green-100">9</th>
//                                             <th className="text-center px-2 py-2 bg-emerald-100">Pass Rate</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-slate-100">
//                                         {msceStats.pointDistribution.map(subj => {
//                                             const total = subj.points.reduce((a, b) => a + b, 0);
//                                             const passed = subj.points.slice(0, 6).reduce((a, b) => a + b, 0);
//                                             const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
//                                             return (
//                                                 <tr key={subj.name}>
//                                                     <td className="px-4 py-3 font-medium">{subj.name}</td>
//                                                     {subj.points.map((count, idx) => (
//                                                         <td key={idx} className="text-center px-2 py-2 font-bold text-green-700">{count}</td>
//                                                     ))}
//                                                     <td className="text-center px-2 py-2 font-bold text-emerald-600">{passRate}%</td>
//                                                 </tr>
//                                             );
//                                         })}
//                                         <tr className="bg-slate-100 font-bold">
//                                             <td className="px-4 py-3 font-bold text-slate-800">TOTAL</td>
//                                             {msceStats.pointDistribution[0]?.points.map((_, idx) => (
//                                                 <td key={idx} className="text-center px-2 py-2 font-bold text-green-800">
//                                                     {msceStats.pointDistribution.reduce((sum, subj) => sum + subj.points[idx], 0)}
//                                                 </td>
//                                             ))}
//                                             <td className="text-center px-2 py-2 font-bold text-emerald-600">-</td>
//                                         </tr>
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </>
//                 )}

//                 {/* JCE Specific Stats - Grade distribution by subject */}
//                 {isJCE && jceStats && (
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                         <h3 className="font-semibold text-slate-800 mb-4">Grade Distribution by Subject</h3>
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="text-left px-4 py-3">Subject</th>
//                                         <th className="text-center px-2 py-3 bg-green-100">A</th>
//                                         <th className="text-center px-2 py-3 bg-blue-100">B</th>
//                                         <th className="text-center px-2 py-3 bg-yellow-100">C</th>
//                                         <th className="text-center px-2 py-3 bg-orange-100">D</th>
//                                         <th className="text-center px-2 py-3 bg-red-100">E</th>
//                                         <th className="text-center px-2 py-3 bg-red-200">F</th>
//                                         <th className="text-center px-2 py-3 bg-emerald-100">Pass Rate</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {jceStats.gradeCounts.map(subj => {
//                                         const totalStudents = subj.A + subj.B + subj.C + subj.D + subj.E + subj.F;
//                                         const passed = subj.A + subj.B + subj.C + subj.D;
//                                         const passRate = ((passed / totalStudents) * 100).toFixed(1);
//                                         return (
//                                             <tr key={subj.name}>
//                                                 <td className="px-4 py-3 font-medium">{subj.name}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-green-700">{subj.A}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-blue-700">{subj.B}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-yellow-700">{subj.C}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-orange-700">{subj.D}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-red-700">{subj.E}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-red-800">{subj.F}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-emerald-600">{passRate}%</td>
//                                             </tr>
//                                         );
//                                     })}
//                                     <tr className="bg-slate-100 font-bold">
//                                         <td className="px-4 py-3 font-bold text-slate-800">TOTAL</td>
//                                         <td className="text-center px-2 py-3 font-bold text-green-700">
//                                             {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.A, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-blue-700">
//                                             {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.B, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-yellow-700">
//                                             {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.C, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-orange-700">
//                                             {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.D, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-red-700">
//                                             {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.E, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-red-800">
//                                             {jceStats.gradeCounts.reduce((sum, subj) => sum + subj.F, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-emerald-600">-</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}

//                 {/* PSLCE Specific Stats - Grade distribution by subject */}
//                 {isPSLCE && pslceStats && (
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                         <h3 className="font-semibold text-slate-800 mb-4">Grade Distribution by Subject</h3>
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="text-left px-4 py-3">Subject</th>
//                                         <th className="text-center px-2 py-3 bg-green-100">A</th>
//                                         <th className="text-center px-2 py-3 bg-blue-100">B</th>
//                                         <th className="text-center px-2 py-3 bg-yellow-100">C</th>
//                                         <th className="text-center px-2 py-3 bg-orange-100">D</th>
//                                         <th className="text-center px-2 py-3 bg-red-100">E</th>
//                                         <th className="text-center px-2 py-3 bg-red-200">F</th>
//                                         <th className="text-center px-2 py-3 bg-emerald-100">Pass Rate</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {pslceStats.gradeCounts.map(subj => {
//                                         const totalStudents = subj.A + subj.B + subj.C + subj.D + subj.E + subj.F;
//                                         const passed = subj.A + subj.B + subj.C + subj.D;
//                                         const passRate = ((passed / totalStudents) * 100).toFixed(1);
//                                         return (
//                                             <tr key={subj.name}>
//                                                 <td className="px-4 py-3 font-medium">{subj.name}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-green-700">{subj.A}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-blue-700">{subj.B}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-yellow-700">{subj.C}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-orange-700">{subj.D}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-red-700">{subj.E}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-red-800">{subj.F}</td>
//                                                 <td className="text-center px-2 py-3 font-bold text-emerald-600">{passRate}%</td>
//                                             </tr>
//                                         );
//                                     })}
//                                     <tr className="bg-slate-100 font-bold">
//                                         <td className="px-4 py-3 font-bold text-slate-800">TOTAL</td>
//                                         <td className="text-center px-2 py-3 font-bold text-green-700">
//                                             {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.A, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-blue-700">
//                                             {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.B, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-yellow-700">
//                                             {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.C, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-orange-700">
//                                             {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.D, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-red-700">
//                                             {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.E, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-red-800">
//                                             {pslceStats.gradeCounts.reduce((sum, subj) => sum + subj.F, 0)}
//                                         </td>
//                                         <td className="text-center px-2 py-3 font-bold text-emerald-600">-</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ExamAnalysisTab;