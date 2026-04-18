// components/admin/analytics/AnalyticsMain.tsx
import React, { useState } from 'react';
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
    Trophy,
    Eye,
    Filter
} from 'lucide-react';
import {
    KeyMetric,
    GradeRanking,
    FactorAnalysis,
    RiskStudent,
    SubjectDifficulty,
    ExamGap,
    CohortTracking
} from './types';

interface AnalyticsMainProps {
    loading: boolean;
    selectedTerm: string;
    setSelectedTerm: (term: string) => void;
    keyMetrics: KeyMetric[];
    gradeRanking: GradeRanking[];
    factorAnalysis: FactorAnalysis[];
    riskStudents: RiskStudent[];
    subjectDifficulty: SubjectDifficulty[];
    examGap: ExamGap[];
    cohortTracking: CohortTracking | null;
    onViewStudent: (studentId: string) => void;
    onViewGrade: (gradeName: string) => void;
    onCompareMode: () => void;
    onExportReport: () => void;
    onViewExamAnalysis?: () => void;
    // NEW: Class filtering props
    classes?: any[];
    onFilterByClass?: (classId: string) => void;
    availableTerms?: { value: string; label: string }[];
}

const AnalyticsMain: React.FC<AnalyticsMainProps> = ({
    loading,
    selectedTerm,
    setSelectedTerm,
    keyMetrics,
    gradeRanking,
    factorAnalysis,
    riskStudents,
    subjectDifficulty,
    examGap,
    cohortTracking,
    onViewStudent,
    onViewGrade,
    onCompareMode,
    onViewExamAnalysis,
    onExportReport,
    classes = [],
    onFilterByClass
}) => {
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

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

    const handleClassFilterChange = (classId: string) => {
        setSelectedClassFilter(classId);
        if (onFilterByClass) {
            onFilterByClass(classId);
        }
    };

    // Filter grade ranking based on selected class
    const filteredGradeRanking = selectedClassFilter === 'all'
        ? gradeRanking
        : gradeRanking.filter(grade => grade.name === classes.find(c => c.id === selectedClassFilter)?.name);

    // Filter factor analysis (would need API support for class-specific data)
    // For now, show all or add a note when filtered
    const filteredFactorAnalysis = selectedClassFilter === 'all'
        ? factorAnalysis
        : factorAnalysis.map(factor => ({ ...factor, insight: `${factor.insight} (Class view)` }));

    // Filter risk students based on selected class
    const filteredRiskStudents = selectedClassFilter === 'all'
        ? riskStudents
        : riskStudents.filter(student => student.grade === classes.find(c => c.id === selectedClassFilter)?.name);

    // Filter subject difficulty (would need API support)
    const filteredSubjectDifficulty = selectedClassFilter === 'all'
        ? subjectDifficulty
        : subjectDifficulty.map(sub => ({ ...sub, action: `${sub.action} (Class view)` }));

    // Filter exam gap based on selected class
    const filteredExamGap = selectedClassFilter === 'all'
        ? examGap
        : examGap.filter(gap => gap.grade === classes.find(c => c.id === selectedClassFilter)?.name);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Performance Analytics</h2>
                    <p className="text-slate-500">Comprehensive academic performance analysis across all grades</p>
                </div>
            </div>

            {/* Class Filter & Time Period Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-6">
                    {/* Class Filter */}
                    {classes.length > 0 && (
                        <div className="flex items-center gap-3">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">Filter by Class:</span>
                            <select
                                value={selectedClassFilter}
                                onChange={(e) => handleClassFilterChange(e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                <option value="all">All Classes</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Time Period Selector */}
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Time Period:</span>
                        <select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            {terms.map(term => (
                                <option key={term} value={term}>{term}</option>
                            ))}
                        </select>
                    </div>

                    {/* Show active filter indicator */}
                    {selectedClassFilter !== 'all' && (
                        <div className="ml-auto">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                Filtered by: {classes.find(c => c.id === selectedClassFilter)?.name}
                                <button onClick={() => handleClassFilterChange('all')} className="ml-1 hover:text-indigo-900">✕</button>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Reports Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Download className="w-5 h-5 text-indigo-600" />
                    Quick Reports
                </h3>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm flex items-center gap-2 border border-slate-200">
                        <span>📊 At-Risk Students List</span>
                        <Download className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm flex items-center gap-2 border border-slate-200">
                        <span>📈 Grade Performance Summary</span>
                        <Download className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm flex items-center gap-2 border border-slate-200">
                        <span>📚 Subject Difficulty Analysis</span>
                        <Download className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Key Metrics Cards - Show class-specific note when filtered */}
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
                        <p className="text-sm text-slate-500">
                            {metric.label}
                            {selectedClassFilter !== 'all' && (
                                <span className="block text-xs text-indigo-600">(Filtered by class)</span>
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* Performance Trend */}
            {cohortTracking && cohortTracking.data.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        {selectedClassFilter === 'all' ? 'School' : 'Class'} Performance Trend
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Overall pass rate across terms
                        {selectedClassFilter !== 'all' && (
                            <span className="ml-2 text-indigo-600"> - {classes.find(c => c.id === selectedClassFilter)?.name}</span>
                        )}
                    </p>
                    <div className="h-64 relative mb-4">
                        <div className="absolute inset-0 flex items-end justify-between">
                            {cohortTracking.data.map((value, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center px-2">
                                    <div
                                        className="w-full bg-indigo-500 rounded-t transition-all duration-500 hover:bg-indigo-600"
                                        style={{ height: `${(value / 100) * 180}px`, maxHeight: '180px', minHeight: '20px' }}
                                    />
                                    <span className="text-xs text-slate-500 mt-2 font-medium text-center">{cohortTracking.labels[idx]}</span>
                                    <span className="text-xs font-bold text-slate-700">{value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{cohortTracking.improving || 0}</p>
                            <p className="text-xs text-slate-600">Students improving for 2+ terms ✅</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{cohortTracking.declining || 0}</p>
                            <p className="text-xs text-slate-600">Students declining for 2+ terms ⚠️</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Grade/Class Performance Ranking */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Grade/Class Performance Ranking
                    {selectedClassFilter !== 'all' && (
                        <span className="text-sm font-normal text-indigo-600 ml-2">(Filtered)</span>
                    )}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Rank</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Grade/Class</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Pass %</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Avg Score</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Students</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredGradeRanking.map(grade => (
                                <tr key={grade.rank} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-bold text-slate-800">#{grade.rank}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{grade.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${grade.passRate}%` }} />
                                            </div>
                                            <span className="text-sm">{grade.passRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{grade.avgScore}%</td>
                                    <td className="px-4 py-3">{grade.attendance}%</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm ${grade.riskChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {grade.riskStudents} ({grade.riskChange > 0 ? '▲' : '▼'}{Math.abs(grade.riskChange)})
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`flex items-center gap-1 text-sm ${grade.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {grade.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {Math.abs(grade.trend)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onViewGrade(grade.name)}
                                            className="px-3 py-1.5 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md flex items-center gap-1 transition-colors"
                                        >
                                            <Users className="w-3 h-3" />
                                            View Class
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-slate-400 mt-3">👆 Click any grade/class to view all students</p>
            </div>

            {/* Factor Analysis & Risk Model */}
            {/* Factor Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    Factor Analysis – What Drives Performance?
                    {selectedClassFilter !== 'all' && (
                        <span className="text-xs font-normal text-indigo-600 ml-2">(Class-level view)</span>
                    )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredFactorAnalysis.map((factor, idx) => (
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

            {/* Multi-Factor Risk Model - FULL WIDTH */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Multi-Factor Risk Model – Students at Risk
                    {selectedClassFilter !== 'all' && (
                        <span className="text-xs font-normal text-indigo-600 ml-2">(Filtered)</span>
                    )}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-3 py-2">Student</th>
                                <th className="text-left px-3 py-2">Grade</th>
                                <th className="text-left px-3 py-2">Att</th>
                                <th className="text-left px-3 py-2">CAT</th>
                                <th className="text-left px-3 py-2">Fails</th>
                                <th className="text-left px-3 py-2">Prev Drop</th>
                                <th className="text-left px-3 py-2">Risk Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRiskStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 font-medium text-slate-800">{student.name}</td>
                                    <td className="px-3 py-2">{student.grade}</td>
                                    <td className="px-3 py-2">{student.attendance}%</td>
                                    <td className="px-3 py-2">{student.catScore}%</td>
                                    <td className="px-3 py-2">{student.fails}</td>
                                    <td className="px-3 py-2">{student.prevDrop}%</td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(student.riskLevel)}`}>
                                            {getRiskIcon(student.riskLevel)} {student.riskLevel.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <button
                                            onClick={() => onViewStudent(student.id)}
                                            className="px-3 py-1.5 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md flex items-center gap-1 transition-colors"
                                        >
                                            <Eye className="w-3 h-3" />
                                            View Student
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-slate-400 mt-3">👆 Click any student name to view detailed profile</p>
            </div>

            {/* Subject Difficulty Ranking & Exam Gap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Difficulty Ranking */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        Subject Difficulty Ranking
                        {selectedClassFilter === 'all' ? ' (School-wide)' : ` (${classes.find(c => c.id === selectedClassFilter)?.name})`}
                    </h3>
                    <div className="space-y-3">
                        {filteredSubjectDifficulty.map(subject => (
                            <div key={subject.rank} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-500">#{subject.rank}</span>
                                    <span className="font-medium text-slate-800">{subject.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{subject.avgScore}%</p>
                                        <p className="text-xs text-slate-500">Pass {subject.passRate}%</p>
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
                        {selectedClassFilter !== 'all' && (
                            <span className="text-xs font-normal text-indigo-600 ml-2">(Filtered)</span>
                        )}
                    </h3>
                    <div className="space-y-4">
                        {filteredExamGap.map(gap => (
                            <div key={gap.grade} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-slate-800">{gap.grade}</span>
                                    <span className={`text-sm font-bold ${gap.gap > 8 ? 'text-red-600' : 'text-amber-600'}`}>
                                        Gap: {gap.gap}%
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                    <div>
                                        <p className="text-slate-500">Avg CAT</p>
                                        <p className="font-medium">{gap.avgCAT}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Avg Exam</p>
                                        <p className="font-medium">{gap.avgExam}%</p>
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
        </div>
    );
};

export default AnalyticsMain;

