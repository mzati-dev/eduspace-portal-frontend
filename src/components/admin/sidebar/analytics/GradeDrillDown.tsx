// components/admin/analytics/GradeDrillDown.tsx
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface GradeDrillDownProps {
    gradeName: string;
    students: any[];
    onViewStudent: (studentId: string) => void;
    onBack: () => void;
    selectedTerm?: string;
    availableTerms?: { value: string; label: string }[];
    onTermChange?: (term: string) => void;
}

const GradeDrillDown: React.FC<GradeDrillDownProps> = ({
    gradeName,
    students,
    onViewStudent,
    onBack,
    selectedTerm = '',
    availableTerms = [],
    onTermChange
}) => {
    const [localTerm, setLocalTerm] = useState(selectedTerm);

    const handleTermChange = (term: string) => {
        setLocalTerm(term);
        if (onTermChange) {
            onTermChange(term);
        }
    };

    const getRiskBadge = (level: string) => {
        switch (level) {
            case 'critical': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">🔴 CRITICAL</span>;
            case 'high': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">🟠 HIGH</span>;
            case 'medium': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">🟡 MEDIUM</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">🟢 LOW</span>;
        }
    };

    if (students.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                        ← Back to Dashboard
                    </button>
                    {availableTerms.length > 0 && (
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <select
                                value={localTerm}
                                onChange={(e) => handleTermChange(e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                            >
                                {availableTerms.map(term => (
                                    <option key={term.value} value={term.value}>{term.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <p className="text-slate-500">No students found in {gradeName}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                    ← Back to Dashboard
                </button>

                {availableTerms.length > 0 && (
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <select
                            value={localTerm}
                            onChange={(e) => handleTermChange(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                            {availableTerms.map(term => (
                                <option key={term.value} value={term.value}>{term.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-800">{gradeName} - All Students</h2>
                <p className="text-slate-500 mt-1">
                    {students.length} students in this grade
                    {localTerm && <span className="ml-2 text-indigo-600">(Term: {localTerm})</span>}
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam No</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">CAT Score</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Current Marks</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Failed Subjects</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Level</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                    <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${student.attendance < 60 ? 'text-red-600' : student.attendance < 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {Math.round(student.attendance)}%
                                        </span>
                                        <div className="w-16 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full rounded-full ${student.attendance < 60 ? 'bg-red-500' : student.attendance < 75 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${student.attendance}%` }} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${student.catScore < 50 ? 'text-red-600' : student.catScore < 65 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {Math.round(student.catScore)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${student.currentMarks < 50 ? 'text-red-600' : student.currentMarks < 65 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {Math.round(student.currentMarks)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${student.fails > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {student.fails}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{getRiskBadge(student.riskLevel)}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onViewStudent(student.id)}
                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GradeDrillDown;