// components/teacher/analytics/TeacherAnalyticsMain.tsx
import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Users,
    BookOpen,
    GraduationCap,
    Brain,
    Target,
    Calendar,
    Download,
    Trophy
} from 'lucide-react';
import {
    TeacherKeyMetric,
    TeacherClassRanking,
    TeacherFactorAnalysis,
    TeacherRiskStudent,
    TeacherSubjectDifficulty,
    TeacherExamGap,
    TeacherCohortTracking
} from './TeacherAnalyticsTypes';

interface TeacherAnalyticsMainProps {
    loading: boolean;
    selectedTerm: string;
    setSelectedTerm: (term: string) => void;
    keyMetrics: TeacherKeyMetric[];
    classRanking: TeacherClassRanking[];
    factorAnalysis: TeacherFactorAnalysis[];
    riskStudents: TeacherRiskStudent[];
    subjectDifficulty: TeacherSubjectDifficulty[];
    examGap: TeacherExamGap[];
    cohortTracking: TeacherCohortTracking | null;
    onViewStudent: (studentId: string) => void;
    onViewClass: (className: string) => void;
    onCompareMode: () => void;
    onExportReport: () => void;
}

const TeacherAnalyticsMain: React.FC<TeacherAnalyticsMainProps> = ({
    loading,
    selectedTerm,
    setSelectedTerm,
    keyMetrics,
    classRanking,
    factorAnalysis,
    riskStudents,
    subjectDifficulty,
    examGap,
    cohortTracking,
    onViewStudent,
    onViewClass,
    onCompareMode,
    onExportReport
}) => {
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'critical': return '🔴';
            case 'high': return '🟠';
            case 'medium': return '🟡';
            default: return '🟢';
        }
    };

    const terms = ['Term 4, 2025 (Current)', 'Term 3, 2025', 'Term 2, 2025', 'Term 1, 2025', 'All Terms'];

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading your analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Class Analytics</h2>
                    <p className="text-slate-500">Performance insights for your classes</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onCompareMode}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <TrendingUp className="w-4 h-4" />
                        Compare Terms
                    </button>
                    <button
                        onClick={onExportReport}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Time Period Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Time Period:</span>
                    <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        {terms.map(term => (
                            <option key={term} value={term}>{term}</option>
                        ))}
                    </select>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Apply</button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {keyMetrics.map((metric, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 bg-slate-100 rounded-lg ${metric.color}`}>
                                {metric.icon === 'trending-up' && <TrendingUp className="w-5 h-5" />}
                                {metric.icon === 'users' && <Users className="w-5 h-5" />}
                                {metric.icon === 'graduation-cap' && <GraduationCap className="w-5 h-5" />}
                                {metric.icon === 'brain' && <Brain className="w-5 h-5" />}
                            </div>
                            <span className={`text-xs font-medium ${metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-slate-600'} bg-slate-100 px-2 py-1 rounded-full`}>
                                {metric.change !== 0 && (metric.change > 0 ? '▲' : '▼')} {Math.abs(metric.change)}% {metric.vsText}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
                        <p className="text-sm text-slate-500">{metric.label}</p>
                    </div>
                ))}
            </div>

            {/* My Classes Performance Ranking - CLICKABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    My Classes Performance Ranking
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Rank</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Pass %</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Avg Score</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Students</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {classRanking.map(cls => (
                                <tr
                                    key={cls.rank}
                                    className="hover:bg-slate-50 cursor-pointer"
                                    onClick={() => onViewClass(cls.name)}
                                >
                                    <td className="px-4 py-3 font-bold text-slate-800">#{cls.rank}</td>
                                    <td className="px-4 py-3 font-medium text-indigo-600 hover:underline">{cls.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cls.passRate}%` }} />
                                            </div>
                                            <span className="text-sm">{Math.round(cls.passRate)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{Math.round(cls.avgScore)}%</td>
                                    <td className="px-4 py-3">{Math.round(cls.attendance)}%</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm ${cls.riskChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {cls.riskStudents} ({cls.riskChange > 0 ? '▲' : '▼'}{Math.abs(cls.riskChange)})
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`flex items-center gap-1 text-sm ${cls.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {cls.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {Math.abs(cls.trend)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-slate-400 mt-3">👆 Click any class to view all students</p>
            </div>

            {/* Factor Analysis & Risk Model - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Factor Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-indigo-600" />
                        Factor Analysis – What Drives Performance?
                    </h3>
                    <div className="space-y-3">
                        {factorAnalysis.map((factor, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-slate-800">{factor.factor}</span>
                                    <span className={`text-sm font-bold ${factor.correlation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        r = {factor.correlation}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Impact: {factor.impact}</span>
                                    <span className="text-slate-500">{factor.insight}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Multi-Factor Risk Model */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        Multi-Factor Risk Model – Students at Risk
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-3 py-2">Student</th>
                                    <th className="text-left px-3 py-2">Class</th>
                                    <th className="text-left px-3 py-2">Att</th>
                                    <th className="text-left px-3 py-2">CAT</th>
                                    <th className="text-left px-3 py-2">Fails</th>
                                    <th className="text-left px-3 py-2">Prev Drop</th>
                                    <th className="text-left px-3 py-2">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {riskStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onViewStudent(student.id)}>
                                        <td className="px-3 py-2 font-medium text-indigo-600">{student.name}</td>
                                        <td className="px-3 py-2">{student.className}</td>
                                        <td className="px-3 py-2 text-red-600">{Math.round(student.attendance)}%</td>
                                        <td className="px-3 py-2 text-red-600">{Math.round(student.catScore)}%</td>
                                        <td className="px-3 py-2">{student.fails}</td>
                                        <td className="px-3 py-2">{student.prevDrop}%</td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(student.riskLevel)}`}>
                                                {getRiskIcon(student.riskLevel)} {student.riskLevel.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-slate-400 mt-3">👆 Click any student name to view detailed profile</p>
                </div>
            </div>

            {/* Subject Difficulty Ranking & Exam Gap - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Difficulty Ranking */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        Subject Difficulty Ranking (My Subjects)
                    </h3>
                    <div className="space-y-3">
                        {subjectDifficulty.map(subject => (
                            <div key={subject.rank} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-500">#{subject.rank}</span>
                                    <span className="font-medium text-slate-800">{subject.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{Math.round(subject.avgScore)}%</p>
                                        <p className="text-xs text-slate-500">Pass {Math.round(subject.passRate)}%</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${subject.action.includes('⚠️') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {subject.action}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CAT vs End of Term Exam Gap */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-600" />
                        CAT vs End of Term Exam Gap Analysis
                    </h3>
                    <div className="space-y-4">
                        {examGap.map(gap => (
                            <div key={gap.className} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-slate-800">{gap.className}</span>
                                    <span className={`text-sm font-bold ${gap.gap > 8 ? 'text-red-600' : 'text-amber-600'}`}>
                                        Gap: {Math.round(gap.gap)}%
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                    <div>
                                        <p className="text-slate-500">Avg CAT</p>
                                        <p className="font-medium">{Math.round(gap.avgCAT)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Avg Exam</p>
                                        <p className="font-medium">{Math.round(gap.avgExam)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">15%+ Drop</p>
                                        <p className="font-medium text-red-600">{gap.studentsDrop} students</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Trajectory */}
            {cohortTracking && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Performance Trajectory – Cohort Tracking
                    </h3>
                    <div className="mb-4">
                        <p className="font-medium text-slate-800">{cohortTracking.cohort}</p>
                    </div>
                    <div className="h-48 relative mb-4">
                        <div className="absolute inset-0 flex items-end justify-between">
                            {cohortTracking.data.map((value, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center px-2">
                                    <div
                                        className="w-full bg-indigo-500 rounded-t transition-all duration-500 hover:bg-indigo-600"
                                        style={{ height: `${value}px`, maxHeight: '120px' }}
                                    />
                                    <span className="text-xs text-slate-500 mt-2">{cohortTracking.labels[idx]}</span>
                                    <span className="text-xs font-medium">{value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-green-600 font-semibold">{cohortTracking.improving} students</p>
                            <p className="text-xs text-slate-600">Improving for 2+ terms ✅</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-red-600 font-semibold">{cohortTracking.declining} students</p>
                            <p className="text-xs text-slate-600">Declining for 2+ terms ⚠️</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Reports Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-slate-600" />
                    Reports & Exports
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className="px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left flex items-center justify-between">
                        <span>📊 At-Risk Students List (Excel)</span>
                        <Download className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left flex items-center justify-between">
                        <span>📈 Class Performance Summary (PDF)</span>
                        <Download className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left flex items-center justify-between">
                        <span>📚 Subject Difficulty Analysis (Excel)</span>
                        <Download className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherAnalyticsMain;