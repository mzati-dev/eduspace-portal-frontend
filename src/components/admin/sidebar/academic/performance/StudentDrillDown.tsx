import React, { useState } from 'react';
import {
    ArrowLeft,
    Mail,
    Download,
    Sparkles,
    Calendar,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import { StudentDetail } from '@/services/analyticsService';

interface StudentDrillDownProps {
    student: StudentDetail;
    loading: boolean;
    onBack: () => void;
    onExportPDF: () => void;
    onEmailReport: () => void;
    selectedTerm?: string;
    onTermChange?: (term: string) => void;
    availableTerms?: { value: string; label: string }[];
    assessmentType?: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
}

const StudentDrillDown: React.FC<StudentDrillDownProps> = ({
    student,
    loading,
    onBack,
    onExportPDF,
    onEmailReport,
    selectedTerm = '',
    onTermChange,
    availableTerms = [],
    assessmentType
}) => {
    const [localTerm, setLocalTerm] = useState(selectedTerm);

    const handleTermChange = (term: string) => {
        setLocalTerm(term);
        if (onTermChange) {
            onTermChange(term);
        }
    };

    // Helper: Get assessment type label
    const getAssessmentLabel = (type?: string): string => {
        if (type === 'qa1') return 'Test 1';
        if (type === 'qa2') return 'Test 2';
        if (type === 'endOfTerm') return 'End of Term';
        return 'Overall';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading student data...</p>
            </div>
        );
    }

    // Helper: Get trend indicator
    const getTrend = (value: number, threshold: number = 50) => {
        if (value >= threshold) {
            return { icon: <TrendingUp className="w-3 h-3 text-emerald-500" />, label: 'Good', color: 'text-emerald-600' };
        } else if (value >= threshold * 0.7) {
            return { icon: <Minus className="w-3 h-3 text-yellow-500" />, label: 'Average', color: 'text-yellow-600' };
        } else {
            return { icon: <TrendingDown className="w-3 h-3 text-red-500" />, label: 'Needs improvement', color: 'text-red-600' };
        }
    };

    // Helper: Get status badge
    const getStatusBadge = (status: string) => {
        if (status.includes('Critical')) {
            return { bg: 'bg-red-100', text: 'text-red-700', label: '🔴 Critical' };
        } else if (status.includes('High')) {
            return { bg: 'bg-orange-100', text: 'text-orange-700', label: '🟠 At Risk' };
        } else if (status.includes('Medium')) {
            return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🟡 Warning' };
        } else {
            return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '🟢 On Track' };
        }
    };

    const statusBadge = getStatusBadge(student.status);
    const marksTrend = getTrend(student.currentMarks, 50);
    const attendanceTrend = getTrend(student.currentAttendance, 75);

    return (
        <div className="space-y-6">
            {/* Back Button and Term Selector */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
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

            {/* Assessment Type Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        <div>
                            <p className="text-xs text-indigo-200 font-medium">VIEWING</p>
                            <p className="text-xl font-bold">{getAssessmentLabel(assessmentType)} Results</p>
                        </div>
                    </div>
                    <div className="bg-white/20 rounded-lg px-4 py-2 text-sm font-medium">
                        {localTerm || 'Current Term'}
                    </div>
                </div>
            </div>

            {/* Student Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                {statusBadge.label}
                            </span>
                            {/* ===== ADD THIS: Assessment Type Badge ===== */}
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                                📊 {getAssessmentLabel(assessmentType)}
                            </span>
                        </div>
                        <p className="text-slate-500">
                            📚 {student.grade}  | Exam No: {student.examNumber}
                        </p>
                        <p className="text-slate-500 text-sm">👩‍🏫 Class Teacher: {student.classTeacher || 'Not Assigned'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEmailReport}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"
                        >
                            <Mail className="w-4 h-4" />
                            Email Report
                        </button>
                        <button
                            onClick={onExportPDF}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"
                        >
                            <Download className="w-4 h-4" />
                            PDF Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Student KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Marks ({getAssessmentLabel(assessmentType)})</p>
                    <p className={`text-2xl font-bold ${student.currentMarks >= 70 ? 'text-emerald-600' : student.currentMarks >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {student.currentMarks}%
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        {marksTrend.icon}
                        <span className={`text-xs ${marksTrend.color}`}>{marksTrend.label}</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Attendance ({localTerm || 'Current'})</p>
                    <p className={`text-2xl font-bold ${student.currentAttendance >= 85 ? 'text-emerald-600' : student.currentAttendance >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {student.currentAttendance}%
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        {attendanceTrend.icon}
                        <span className={`text-xs ${attendanceTrend.color}`}>{attendanceTrend.label}</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Term-over-Term Change</p>
                    <p className={`text-2xl font-bold ${student.termOverTerm > 5 ? 'text-emerald-600' : student.termOverTerm < -5 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {student.termOverTerm > 0 ? '+' : ''}{student.termOverTerm}%
                    </p>
                    {student.termOverTerm > 0 ? (
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs text-emerald-600">Improving</span>
                        </div>
                    ) : student.termOverTerm < 0 ? (
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingDown className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-600">Declining</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 mt-1">
                            <Minus className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600">Stable</span>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Class Rank</p>
                    <p className="text-2xl font-bold text-slate-800">
                        {student.classRank !== 'N/A' ? `#${student.classRank}` : 'N/A'}
                    </p>
                    {student.classRank !== 'N/A' && (
                        <p className="text-xs text-slate-500 mt-1">
                            {parseInt(student.classRank) <= 3 ? '🏆 Top performer' :
                                parseInt(student.classRank) <= 10 ? 'Good standing' : 'Needs improvement'}
                        </p>
                    )}
                </div>
            </div>

            {/* Performance Timeline */}
            {student.timeline && student.timeline.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">
                        Performance Timeline ({getAssessmentLabel(assessmentType)})
                    </h3>
                    <div className="h-64 relative">
                        <div className="absolute inset-0 flex items-end justify-between">
                            {student.timeline.map((point, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center px-2">
                                    <div
                                        className="w-full bg-indigo-500 rounded-t transition-all duration-500 hover:bg-indigo-600"
                                        style={{ height: `${Math.max(10, point.marks * 1.2)}px` }}
                                    />
                                    <span className="text-xs text-slate-500 mt-2">{point.term}</span>
                                    <span className="text-xs font-medium">{point.marks}%</span>
                                    <span className="text-xs text-slate-400">Att: {point.attendance}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Factor Breakdown - Only show if student is struggling */}
            {student.currentMarks < 60 && student.factorBreakdown && student.factorBreakdown.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Factor Breakdown – Why is this student struggling?</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-3 py-2">Factor</th>
                                    <th className="text-left px-3 py-2">Student Value</th>
                                    <th className="text-left px-3 py-2">Class Avg</th>
                                    <th className="text-left px-3 py-2">Status</th>
                                    <th className="text-left px-3 py-2">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {student.factorBreakdown.map((factor, idx) => (
                                    <tr key={idx}>
                                        <td className="px-3 py-2 font-medium">{factor.factor}</td>
                                        <td className="px-3 py-2">{factor.studentValue}</td>
                                        <td className="px-3 py-2">{factor.classAvg}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${factor.status === 'Below Average' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {factor.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">{factor.impact}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Subject-wise Breakdown */}
            {student.subjectBreakdown && student.subjectBreakdown.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        Subject-wise Breakdown
                        <span className="text-xs font-normal text-slate-500">({localTerm || 'Current'} - {getAssessmentLabel(assessmentType)})</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-3 py-2">Subject</th>
                                    <th className="text-left px-3 py-2">Marks</th>
                                    <th className="text-left px-3 py-2">Attendance</th>
                                    <th className="text-left px-3 py-2">Class Avg</th>
                                    <th className="text-left px-3 py-2">Gap</th>
                                    <th className="text-left px-3 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {student.subjectBreakdown.map((subject, idx) => {
                                    const isAboveAvg = subject.gap >= 0;
                                    return (
                                        <tr key={idx}>
                                            <td className="px-3 py-2 font-medium">{subject.subject}</td>
                                            <td className={`px-3 py-2 font-medium ${subject.marks >= 70 ? 'text-emerald-600' : subject.marks >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {subject.marks}%
                                            </td>
                                            <td className="px-3 py-2">{subject.attendance}%</td>
                                            <td className="px-3 py-2">{subject.classAvg}%</td>
                                            <td className={`px-3 py-2 font-medium ${isAboveAvg ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {isAboveAvg ? '+' : ''}{subject.gap}%
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${subject.status === 'On track' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {subject.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* {student.subjectBreakdown.map((subject, idx) => {
                                    const isAboveAvg = subject.gap <= 0;
                                    return (
                                        <tr key={idx}>
                                            <td className="px-3 py-2 font-medium">{subject.subject}</td>
                                            <td className={`px-3 py-2 font-medium ${subject.marks >= 70 ? 'text-emerald-600' : subject.marks >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {subject.marks}%
                                            </td>
                                            <td className="px-3 py-2">{subject.attendance}%</td>
                                            <td className="px-3 py-2">{subject.classAvg}%</td>
                                            <td className={`px-3 py-2 font-medium ${isAboveAvg ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {isAboveAvg ? '+' : ''}{subject.gap}%
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${subject.status === 'On track' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {subject.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })} */}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Historical Performance */}
            {student.historical && student.historical.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">
                        Historical Performance ({getAssessmentLabel(assessmentType)})
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-3 py-2">Term</th>
                                    <th className="text-left px-3 py-2">Attendance</th>
                                    <th className="text-left px-3 py-2">Marks</th>
                                    <th className="text-left px-3 py-2">Failed Subjects</th>
                                    <th className="text-left px-3 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {student.historical.map((record, idx) => (
                                    <tr key={idx}>
                                        <td className="px-3 py-2 font-medium">{record.term}</td>
                                        <td className="px-3 py-2">{record.attendance}%</td>
                                        <td className={`px-3 py-2 font-medium ${record.marks >= 70 ? 'text-emerald-600' : record.marks >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {record.marks}%
                                        </td>
                                        <td className="px-3 py-2">{record.fails || 0}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'Passing' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {record.status || (record.marks >= 50 ? 'Passing' : 'Failing')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recommended Interventions */}
            {student.recommendations && student.recommendations.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        Recommended Interventions
                    </h3>
                    <div className="space-y-3">
                        {student.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-2 bg-white/50 rounded-lg">
                                <span className="text-indigo-600 font-bold min-w-[24px]">{idx + 1}.</span>
                                <p className="text-slate-700">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDrillDown;