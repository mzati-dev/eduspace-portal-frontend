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
import { KeyMetric, GradeRanking, FactorAnalysis, RiskStudent, SubjectDifficulty, ExamGap, CohortTracking } from './types';
import { ClassResultStudent } from '@/types/admin';

interface AnalyticsMainProps {
    loading: boolean;
    // selectedTerm: string;
    // setSelectedTerm: (term: string) => void;
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
    // ===== NEW: Assessment type change handler =====
    onAssessmentTypeChange?: (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => void;
    assessmentType?: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
    calculateGrade?: (score: number, passMark?: number, isAbsent?: boolean, className?: string) => string;
    activeConfig?: any;
    students?: any[];
    classResults?: ClassResultStudent[];
    currentPassRates?: any[];
}

const AnalyticsMain: React.FC<AnalyticsMainProps> = ({
    loading,
    // selectedTerm,
    // setSelectedTerm,
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
    onFilterByClass,
    availableTerms = [],
    // ===== NEW: Receive the prop =====
    onAssessmentTypeChange,
    assessmentType = 'overall',
    calculateGrade,
    activeConfig,
    students = [],
    classResults = [],
    currentPassRates = [],
}) => {
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
    // ===== NEW: State for assessment type =====


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

    const handleClassFilterChange = (classId: string) => {
        setSelectedClassFilter(classId);
        if (onFilterByClass) {
            onFilterByClass(classId);
        }
    };

    // ===== NEW: Handle assessment type change =====
    // ===== NEW: Handle assessment type change =====
    const handleAssessmentTypeChange = (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => {
        if (onAssessmentTypeChange) {
            onAssessmentTypeChange(type);
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
            <div className="text-center mt-4 mb-6">
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
                    {/* <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Time Period:</span>
                        <select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            {availableTerms && availableTerms.length > 0 ? (
                                availableTerms.map(term => (
                                    <option key={term.value} value={term.value}>{term.label}</option>
                                ))
                            ) : (
                                <option value="">No terms available</option>
                            )}
                        </select>
                    </div> */}

                    {/* ===== NEW: Assessment Type Selector ===== */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">Assessment:</span>
                        <select
                            value={assessmentType}
                            onChange={(e) => handleAssessmentTypeChange(e.target.value as 'qa1' | 'qa2' | 'endOfTerm' | 'overall')}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                            <option value="overall">Overall</option>
                            <option value="qa1">QA1</option>
                            <option value="qa2">QA2</option>
                            <option value="endOfTerm">End of Term</option>
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
            {/* Key Metrics Cards - 5 boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

                {/* Box 1: Total Students (Whole School) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <p className="text-2xl font-bold text-slate-800">{students.length}</p>
                    <p className="text-sm text-slate-500">Total Students (Whole School)</p>
                </div>

                {/* Box 2: Class Average */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <p className="text-2xl font-bold text-indigo-600">
                        {(() => {
                            const filtered = selectedClassFilter !== 'all'
                                ? classResults.filter(s => {
                                    const student = students.find(st => st.id === s.id);
                                    return student?.class?.id === selectedClassFilter;
                                })
                                : classResults;
                            const total = filtered.reduce((sum, student) => {
                                let totalScore = 0, count = 0;
                                student.subjects.forEach(subject => {
                                    let score = 0;
                                    if (assessmentType === 'qa1') score = subject.qa1 || 0;
                                    else if (assessmentType === 'qa2') score = subject.qa2 || 0;
                                    else if (assessmentType === 'endOfTerm') score = subject.endOfTerm || 0;
                                    else {
                                        const qa1 = subject.qa1 || 0, qa2 = subject.qa2 || 0, endTerm = subject.endOfTerm || 0;
                                        score = (qa1 + qa2 + endTerm) / 3;
                                    }
                                    if (score > 0) { totalScore += score; count++; }
                                });
                                return sum + (count > 0 ? totalScore / count : 0);
                            }, 0);
                            return (filtered.length > 0 ? total / filtered.length : 0).toFixed(1) + '%';
                        })()}
                    </p>
                    <p className="text-sm text-slate-500">
                        Class Average ({selectedClassFilter !== 'all' ? classes.find(c => c.id === selectedClassFilter)?.name : 'All Classes'})
                    </p>
                </div>

                {/* Box 3: Students with Scores / Total Class Students */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <p className="text-2xl font-bold text-slate-800">
                        {(() => {
                            const classResultsFiltered = classResults.filter(s => {
                                const student = students.find(st => st.id === s.id);
                                return student?.class?.id === selectedClassFilter;
                            });
                            const classStudents = students.filter(s => s.class?.id === selectedClassFilter);
                            return classResultsFiltered.length + ' / ' + classStudents.length;
                        })()}
                    </p>
                    <p className="text-sm text-slate-500">
                        Students with Scores ({selectedClassFilter !== 'all' ? classes.find(c => c.id === selectedClassFilter)?.name : 'All Classes'})
                    </p>
                </div>

                {/* Box 4: Pass Rate */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <p className="text-2xl font-bold text-emerald-600">
                        {(() => {
                            const classObj = selectedClassFilter !== 'all' ? classes.find(c => c.id === selectedClassFilter) : null;
                            if (classObj) {
                                const passData = currentPassRates.find(c => c.className === classObj.name);
                                return (passData?.qa1PassRate || 0) + '%';
                            }
                            const total = currentPassRates.reduce((sum, c) => sum + c.qa1PassRate, 0);
                            return (currentPassRates.length > 0 ? total / currentPassRates.length : 0).toFixed(1) + '%';
                        })()}
                    </p>
                    <p className="text-sm text-slate-500">
                        Pass Rate ({selectedClassFilter !== 'all' ? classes.find(c => c.id === selectedClassFilter)?.name : 'All Classes'})
                    </p>
                </div>

                {/* Box 5: Passed / Failed */}
                {/* Box 5: Passed / Failed */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <p className="text-2xl font-bold text-slate-800">
                        {(() => {
                            let passed = 0, failed = 0;
                            const className = selectedClassFilter !== 'all' ? classes.find(c => c.id === selectedClassFilter)?.name : '';
                            const filtered = selectedClassFilter !== 'all'
                                ? classResults.filter(s => {
                                    const student = students.find(st => st.id === s.id);
                                    return student?.class?.id === selectedClassFilter;
                                })
                                : classResults;
                            filtered.forEach(student => {
                                // Calculate student's OVERALL average across ALL subjects
                                let totalScore = 0, count = 0;
                                student.subjects.forEach(subject => {
                                    let score = 0;
                                    if (assessmentType === 'qa1') score = subject.qa1 || 0;
                                    else if (assessmentType === 'qa2') score = subject.qa2 || 0;
                                    else if (assessmentType === 'endOfTerm') score = subject.endOfTerm || 0;
                                    else {
                                        const qa1 = subject.qa1 || 0, qa2 = subject.qa2 || 0, endTerm = subject.endOfTerm || 0;
                                        score = (qa1 + qa2 + endTerm) / 3;
                                    }
                                    if (score >= 0) { totalScore += score; count++; }
                                });
                                if (count > 0) {
                                    const avg = totalScore / count;
                                    const grade = calculateGrade(avg, activeConfig?.pass_mark, false, className);
                                    if (grade !== 'F') {
                                        passed++;
                                    } else {
                                        failed++;
                                    }
                                }
                            });
                            return passed + ' / ' + failed;
                        })()}
                    </p>
                    <p className="text-sm text-slate-500">
                        Passed / Failed ({selectedClassFilter !== 'all' ? classes.find(c => c.id === selectedClassFilter)?.name : 'All Classes'})
                    </p>
                </div>
            </div>

            {/* Performance Trend */}
            {/* Performance Trend */}
            {cohortTracking && cohortTracking.data.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        {selectedClassFilter === 'all' ? 'School' : 'Class'} Performance Trend
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Distribution of students by score range
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
                                        style={{ height: `${Math.max(4, (value / 100) * 180)}px`, maxHeight: '180px' }}
                                    />
                                    <span className="text-xs text-slate-500 mt-2 font-medium text-center">{cohortTracking.labels[idx]}</span>
                                    <span className="text-xs font-bold text-slate-700">{value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center text-xs text-slate-400 mt-1">
                        Each bar shows the percentage of students in that score range
                    </div>

                </div>
            )}

            {/* Grade/Class Performance Ranking */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Class Performance Ranking
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
                                    <td className="px-4 py-3 font-bold text-slate-800">
                                        #{currentPassRates
                                            .sort((a, b) => b.qa1PassRate - a.qa1PassRate)
                                            .findIndex(c => c.className === grade.name) + 1}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{grade.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentPassRates.find(c => c.className === grade.name)?.qa1PassRate || 0}%` }} />
                                            </div>
                                            <span className="text-sm">{currentPassRates.find(c => c.className === grade.name)?.qa1PassRate || 0}%</span>
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
                                           {Math.abs(grade.trend).toFixed(2)}%
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
                                <th className="text-left px-3 py-2">Attendance</th>
                                <th className="text-left px-3 py-2">Average Score</th>
                                <th className="text-left px-3 py-2">Failed Subjects</th>
                                <th className="text-left px-3 py-2">Performance Drop</th>
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

            {/* Top Performers Section */}
            {/* Top Performers Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Top Performers
                    {selectedClassFilter !== 'all' && (
                        <span className="text-xs font-normal text-indigo-600 ml-2">(Filtered)</span>
                    )}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-3 py-2">Rank</th>
                                <th className="text-left px-3 py-2">Student Name</th>
                                <th className="text-left px-3 py-2">Average Score</th>
                                <th className="text-left px-3 py-2">Grade</th>
                                <th className="text-left px-3 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(() => {
                                // Filter classResults by selected class
                                const filteredClassResults = selectedClassFilter !== 'all'
                                    ? classResults.filter(student => {
                                        const studentInfo = students.find(s => s.id === student.id);
                                        return studentInfo?.class?.id === selectedClassFilter;
                                    })
                                    : classResults;

                                const studentAverages = filteredClassResults.map(student => {
                                    let totalScore = 0;
                                    let subjectCount = 0;

                                    student.subjects.forEach(subject => {
                                        let score = 0;
                                        let isAbsent = false;

                                        if (assessmentType === 'qa1') {
                                            score = subject.qa1 || 0;
                                            isAbsent = subject.qa1_absent || false;
                                        } else if (assessmentType === 'qa2') {
                                            score = subject.qa2 || 0;
                                            isAbsent = subject.qa2_absent || false;
                                        } else if (assessmentType === 'endOfTerm') {
                                            score = subject.endOfTerm || 0;
                                            isAbsent = subject.endOfTerm_absent || false;
                                        } else {
                                            const qa1 = subject.qa1 || 0;
                                            const qa2 = subject.qa2 || 0;
                                            const endTerm = subject.endOfTerm || 0;
                                            score = (qa1 + qa2 + endTerm) / 3;
                                            isAbsent = subject.qa1_absent || subject.qa2_absent || subject.endOfTerm_absent;
                                        }

                                        // Count ALL subjects (including absent) for the average
                                        // This matches the class results table behavior
                                        if (isAbsent) {
                                            // Absent counts as 0
                                            totalScore += 0;
                                            subjectCount++;
                                        } else if (score !== null && score >= 0) {
                                            totalScore += score;
                                            subjectCount++;
                                        }
                                    });

                                    return {
                                        id: student.id,
                                        name: student.name,
                                        average: subjectCount > 0 ? totalScore / subjectCount : 0
                                    };
                                });

                                const topStudents = studentAverages
                                    .filter(s => s.average > 0)
                                    .sort((a, b) => b.average - a.average)
                                    .slice(0, 5);

                                if (topStudents.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-slate-500">
                                                No scores available
                                            </td>
                                        </tr>
                                    );
                                }

                                return topStudents.map((student, index) => {
                                    let grade = 'F';
                                    if (student.average >= 80) grade = 'A';
                                    else if (student.average >= 70) grade = 'B';
                                    else if (student.average >= 60) grade = 'C';
                                    else if (student.average >= 50) grade = 'D';

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 font-bold text-slate-400">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-slate-800">{student.name}</td>
                                            <td className="px-3 py-2 font-medium text-green-600">{student.average.toFixed(1)}%</td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                                        grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                            grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                                                    {grade}
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
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-slate-400 mt-3">👆 Click any student name to view detailed profile</p>
            </div>
            {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Top Performers
                    {selectedClassFilter !== 'all' && (
                        <span className="text-xs font-normal text-indigo-600 ml-2">(Filtered)</span>
                    )}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-3 py-2">Rank</th>
                                <th className="text-left px-3 py-2">Student Name</th>
                                <th className="text-left px-3 py-2">Average Score</th>
                                <th className="text-left px-3 py-2">Grade</th>
                                <th className="text-left px-3 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(() => {
                                const studentAverages = classResults.map(student => {
                                    let totalScore = 0;
                                    let count = 0;

                                    student.subjects.forEach(subject => {
                                        let score = 0;
                                        if (assessmentType === 'qa1') {
                                            score = subject.qa1 || 0;
                                        } else if (assessmentType === 'qa2') {
                                            score = subject.qa2 || 0;
                                        } else if (assessmentType === 'endOfTerm') {
                                            score = subject.endOfTerm || 0;
                                        } else {
                                            const qa1 = subject.qa1 || 0;
                                            const qa2 = subject.qa2 || 0;
                                            const endTerm = subject.endOfTerm || 0;
                                            score = (qa1 + qa2 + endTerm) / 3;
                                        }
                                        if (score > 0) {
                                            totalScore += score;
                                            count++;
                                        }
                                    });

                                    return {
                                        id: student.id,
                                        name: student.name,
                                        average: count > 0 ? totalScore / count : 0
                                    };
                                });

                                const topStudents = studentAverages
                                    .filter(s => s.average > 0)
                                    .sort((a, b) => b.average - a.average)
                                    .slice(0, 5);

                                if (topStudents.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-slate-500">
                                                No scores available
                                            </td>
                                        </tr>
                                    );
                                }

                                return topStudents.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-3 py-2 font-bold text-slate-400">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </td>
                                        <td className="px-3 py-2 font-medium text-slate-800">{student.name}</td>
                                        <td className="px-3 py-2 font-medium text-green-600">{student.average.toFixed(1)}%</td>
                                        <td className="px-3 py-2">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                {student.average >= 80 ? 'A' : student.average >= 70 ? 'B' : student.average >= 60 ? 'C' : 'D'}
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
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-slate-400 mt-3">👆 Click any student name to view detailed profile</p>
            </div> */}

            {/* Subject Difficulty Ranking & Exam Gap */}
            <div className="grid grid-cols-1 gap-6">
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
                                        <p className="text-sm font-medium">Subject Average Score: {subject.avgScore}%</p>
                                        <p className="text-xs text-slate-500">Subject Pass Rate: {subject.passRate}%</p>
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

            </div>
        </div>
    );
};

export default AnalyticsMain;
