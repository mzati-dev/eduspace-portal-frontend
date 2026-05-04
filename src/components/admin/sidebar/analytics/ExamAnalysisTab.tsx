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

