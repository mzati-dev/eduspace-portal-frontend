// components/admin/analytics/CompareTerms.tsx
import React from 'react';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Download
} from 'lucide-react';
import { CompareData } from './types';

interface CompareTermsProps {
    loading: boolean;
    term1: string;
    term2: string;
    setTerm1: (term: string) => void;
    setTerm2: (term: string) => void;
    compareData: CompareData | null;
    onCompare: () => void;
    onBack: () => void;
    onExportReport: () => void;
}

const CompareTerms: React.FC<CompareTermsProps> = ({
    loading,
    term1,
    term2,
    setTerm1,
    setTerm2,
    compareData,
    onCompare,
    onBack,
    onExportReport
}) => {
    const availableTerms = ['Term 4, 2025', 'Term 3, 2025', 'Term 2, 2025', 'Term 1, 2025'];

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading comparison data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Performance Analytics – Compare Mode</h2>
                    <p className="text-slate-500">Compare performance across two terms</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onExportReport}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Term Selectors */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Compare Term 1</label>
                        <select
                            value={term1}
                            onChange={(e) => setTerm1(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            {availableTerms.map(term => (
                                <option key={term} value={term}>{term}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">vs Term 2</label>
                        <select
                            value={term2}
                            onChange={(e) => setTerm2(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            {availableTerms.filter(t => t !== term1).map(term => (
                                <option key={term} value={term}>{term}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button
                    onClick={onCompare}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                    Compare Terms
                </button>
            </div>

            {compareData && (
                <>
                    {/* Comparison KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <p className="text-sm text-slate-500 mb-2">Overall Pass %</p>
                            <div className="flex justify-between items-baseline">
                                <p className="text-2xl font-bold text-slate-800">{compareData.overallPass1}%</p>
                                <p className="text-lg text-slate-400">vs</p>
                                <p className="text-2xl font-bold text-slate-800">{compareData.overallPass2}%</p>
                            </div>
                            <p className={`text-sm mt-2 flex items-center gap-1 ${compareData.overallPass1 - compareData.overallPass2 > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {compareData.overallPass1 - compareData.overallPass2 > 0 ? '▲' : '▼'}
                                {Math.abs(compareData.overallPass1 - compareData.overallPass2)}% change
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <p className="text-sm text-slate-500 mb-2">Average Score</p>
                            <div className="flex justify-between items-baseline">
                                <p className="text-2xl font-bold text-slate-800">{compareData.avgScore1}%</p>
                                <p className="text-lg text-slate-400">vs</p>
                                <p className="text-2xl font-bold text-slate-800">{compareData.avgScore2}%</p>
                            </div>
                            <p className={`text-sm mt-2 flex items-center gap-1 ${compareData.avgScore1 - compareData.avgScore2 > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {compareData.avgScore1 - compareData.avgScore2 > 0 ? '▲' : '▼'}
                                {Math.abs(compareData.avgScore1 - compareData.avgScore2)}% change
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <p className="text-sm text-slate-500 mb-2">Avg Attendance</p>
                            <div className="flex justify-between items-baseline">
                                <p className="text-2xl font-bold text-slate-800">{compareData.avgAttendance1}%</p>
                                <p className="text-lg text-slate-400">vs</p>
                                <p className="text-2xl font-bold text-slate-800">{compareData.avgAttendance2}%</p>
                            </div>
                            <p className={`text-sm mt-2 flex items-center gap-1 ${compareData.avgAttendance1 - compareData.avgAttendance2 > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {compareData.avgAttendance1 - compareData.avgAttendance2 > 0 ? '▲' : '▼'}
                                {Math.abs(compareData.avgAttendance1 - compareData.avgAttendance2)}% change
                            </p>
                        </div>
                    </div>

                    {/* Grade/Class Comparison */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Grade/Class Comparison</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 py-3">Grade/Class</th>
                                        <th className="text-left px-4 py-3">Pass % {compareData.term1}</th>
                                        <th className="text-left px-4 py-3">Pass % {compareData.term2}</th>
                                        <th className="text-left px-4 py-3">Change</th>
                                        <th className="text-left px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {compareData.departments.map((dept, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium">{dept.name}</td>
                                            <td className="px-4 py-3">{dept.passRate1}%</td>
                                            <td className="px-4 py-3">{dept.passRate2}%</td>
                                            <td className={`px-4 py-3 font-medium ${dept.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {dept.change > 0 ? '▲' : '▼'} {Math.abs(dept.change)}%
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${dept.status.includes('Significant') ? 'bg-red-100 text-red-700' :
                                                        dept.status.includes('Slight') ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                    }`}>
                                                    {dept.status.includes('Significant') && '🔴'}
                                                    {dept.status.includes('Slight') && '🟡'}
                                                    {!dept.status.includes('Significant') && !dept.status.includes('Slight') && '🟢'}
                                                    {' '}{dept.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* New At-Risk Students */}
                    {compareData.newRiskStudents.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                New At-Risk Students (Not at risk in {compareData.term2}, now at risk in {compareData.term1})
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left px-4 py-3">Student Name</th>
                                            <th className="text-left px-4 py-3">Grade</th>
                                            <th className="text-left px-4 py-3">{compareData.term1} Att</th>
                                            <th className="text-left px-4 py-3">{compareData.term1} Marks</th>
                                            <th className="text-left px-4 py-3">{compareData.term2} Marks</th>
                                            <th className="text-left px-4 py-3">Drop</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {compareData.newRiskStudents.map((student, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-indigo-600">{student.name}</td>
                                                <td className="px-4 py-3">{student.grade}</td>
                                                <td className="px-4 py-3">{student.att2}%</td>
                                                <td className="px-4 py-3">{student.marks2}%</td>
                                                <td className="px-4 py-3">{student.marks1}%</td>
                                                <td className="px-4 py-3 text-red-600 font-medium">{student.drop}% ⚠️</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!compareData && !loading && (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">Select two terms and click "Compare Terms" to see results</p>
                </div>
            )}
        </div>
    );
};

export default CompareTerms;