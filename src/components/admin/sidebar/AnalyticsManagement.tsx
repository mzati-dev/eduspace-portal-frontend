import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Users,
    BookOpen,
    GraduationCap,
    BarChart3,
    PieChart,
    LineChart,
    Download,
    Filter,
    Calendar,
    Target,
    Award,
    Brain,
    Clock,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Zap,
    Shield,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import {
    fetchAtRiskStudents,
    fetchClassPerformance,
    fetchSubjectPerformance,
    fetchTrendData,
    fetchKeyMetrics,
    fetchPredictionSummary,
    fetchInterventionSummary,
    generatePredictions,
    exportAnalyticsReport,
    StudentRisk,
    ClassPerformance,
    SubjectPerformance,
    TrendData,
    KeyMetrics,
    PredictionSummary,
    InterventionSummary
} from '@/services/analyticsService';

interface Props {
    classes: any[];
    students: any[];
    subjects: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const AnalyticsManagement: React.FC<Props> = ({ classes, students, subjects, showMessage }) => {
    const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'term' | 'year'>('term');
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [selectedMetric, setSelectedMetric] = useState<'academic' | 'attendance' | 'behavior'>('academic');
    const [showPredictions, setShowPredictions] = useState<boolean>(true);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Real data states
    const [riskStudents, setRiskStudents] = useState<StudentRisk[]>([]);
    const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([]);
    const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [metrics, setMetrics] = useState<KeyMetrics>({
        overallPerformance: 0,
        performanceTrend: 0,
        studentsOnTrack: 0,
        studentsOnTrackPercentage: 0,
        studentsAtRisk: 0,
        distinctions: 0,
        distinctionsTrend: 0,
        targetAchievement: 0
    });
    const [predictions, setPredictions] = useState<PredictionSummary>({
        predictedPassRate: 0,
        studentsImproving: 0,
        studentsImprovingPercentage: 0,
        studentsDeclining: 0,
        studentsDecliningPercentage: 0,
        studentsStable: 0,
        studentsStablePercentage: 0,
        predictedDistinctions: 0
    });
    const [interventions, setInterventions] = useState<InterventionSummary>({
        studentsNeedingSupport: 0,
        honorRollCount: 0,
        chronicAbsenteeism: 0
    });

    // Load all data
    useEffect(() => {
        loadAnalyticsData();
    }, [selectedTimeframe, selectedClass, selectedMetric]);

    const loadAnalyticsData = async () => {
        setLoadingData(true);
        try {
            const classFilter = selectedClass !== 'all' ? selectedClass : undefined;

            const [
                riskData,
                classData,
                subjectData,
                trendData,
                metricsData,
                predictionsData,
                interventionsData
            ] = await Promise.all([
                fetchAtRiskStudents(classFilter, selectedTimeframe),
                fetchClassPerformance(selectedTimeframe),
                fetchSubjectPerformance(selectedTimeframe),
                fetchTrendData(selectedMetric, selectedTimeframe, classFilter),
                fetchKeyMetrics(selectedTimeframe, classFilter),
                fetchPredictionSummary(selectedTimeframe),
                fetchInterventionSummary()
            ]);

            setRiskStudents(riskData);
            setClassPerformance(classData);
            setSubjectPerformance(subjectData);
            setTrendData(trendData);
            setMetrics(metricsData);
            setPredictions(predictionsData);
            setInterventions(interventionsData);
        } catch (error) {
            showMessage('Failed to load analytics data', true);
        } finally {
            setLoadingData(false);
        }
    };

    const handleGeneratePredictions = async () => {
        setLoading(true);
        try {
            await generatePredictions();
            // Reload predictions after generation
            const newPredictions = await fetchPredictionSummary(selectedTimeframe);
            setPredictions(newPredictions);
            showMessage('Predictions updated based on latest data');
        } catch (error: any) {
            showMessage(error.message || 'Failed to generate predictions', true);
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = async () => {
        setLoading(true);
        try {
            const classFilter = selectedClass !== 'all' ? selectedClass : undefined;
            const blob = await exportAnalyticsReport('pdf', selectedTimeframe, classFilter);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showMessage('Analytics report exported successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to export report', true);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
            default: return <ChevronRight className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Analytics & Insights</h2>
                    <p className="text-slate-500">Data-driven insights for better decision making</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleGeneratePredictions}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Brain className="w-4 h-4" />
                        Generate Predictions
                    </button>
                    <button
                        onClick={handleExportReport}
                        disabled={loading}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Timeframe</label>
                        <select
                            value={selectedTimeframe}
                            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="term">This Term</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Metric</label>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="academic">Academic Performance</option>
                            <option value="attendance">Attendance</option>
                            <option value="behavior">Behavior</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Predictions</label>
                        <div className="flex items-center h-10">
                            <button
                                onClick={() => setShowPredictions(!showPredictions)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${showPredictions
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                {showPredictions ? 'Hide Predictions' : 'Show Predictions'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loadingData && (
                <div className="bg-white rounded-xl p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-slate-500 mt-2">Loading analytics...</p>
                </div>
            )}

            {/* Key Metrics Cards */}
            {!loadingData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${metrics.performanceTrend > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                                }`}>
                                {metrics.performanceTrend > 0 ? '+' : ''}{metrics.performanceTrend}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{metrics.overallPerformance}%</p>
                        <p className="text-sm text-slate-500">Overall Performance</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                {metrics.studentsAtRisk} at risk
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{metrics.studentsOnTrackPercentage}%</p>
                        <p className="text-sm text-slate-500">Students on Track</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${metrics.distinctionsTrend > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                                }`}>
                                {metrics.distinctionsTrend > 0 ? '+' : ''}{metrics.distinctionsTrend}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{metrics.distinctions}</p>
                        <p className="text-sm text-slate-500">Distinctions</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-amber-100 rounded-lg">
                                <Target className="w-6 h-6 text-amber-600" />
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                {metrics.targetAchievement}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{metrics.targetAchievement}%</p>
                        <p className="text-sm text-slate-500">Target Achievement</p>
                    </div>
                </div>
            )}

            {/* Early Warning System */}
            {!loadingData && showPredictions && riskStudents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <h3 className="font-semibold text-slate-800">Early Warning System - At Risk Students</h3>
                        </div>
                        <span className="text-sm text-slate-500">{riskStudents.length} students identified</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Level</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Score</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Current Avg</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Predicted</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Trend</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Factors</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {riskStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-slate-800">{student.name}</p>
                                                <p className="text-xs text-indigo-600">{student.examNumber}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{student.class}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(student.riskLevel)}`}>
                                                {student.riskLevel.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${student.riskScore > 75 ? 'bg-red-600' :
                                                            student.riskScore > 50 ? 'bg-yellow-600' : 'bg-green-600'
                                                            }`}
                                                        style={{ width: `${student.riskScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-600">{student.riskScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${student.currentAverage < 50 ? 'text-red-600' :
                                                student.currentAverage < 65 ? 'text-yellow-600' : 'text-green-600'
                                                }`}>
                                                {student.currentAverage}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-indigo-600">{student.predictedGrade}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${student.attendanceRate < 70 ? 'text-red-600' :
                                                student.attendanceRate < 85 ? 'text-yellow-600' : 'text-green-600'
                                                }`}>
                                                {student.attendanceRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {getTrendIcon(student.trend)}
                                                <span className="text-sm text-slate-600 capitalize">{student.trend}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {student.factors.slice(0, 2).map((factor, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                                                        {factor}
                                                    </span>
                                                ))}
                                                {student.factors.length > 2 && (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                                                        +{student.factors.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium">
                            View All Risk Factors →
                        </button>
                    </div>
                </div>
            )}

            {/* Performance Trends */}
            {!loadingData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trend Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Performance Trends</h3>
                        {trendData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-slate-500">
                                No trend data available
                            </div>
                        ) : (
                            <>
                                <div className="h-64 relative">
                                    <div className="absolute inset-0 flex items-end justify-between">
                                        {trendData.map((data, index) => (
                                            <div key={index} className="flex-1 flex flex-col items-center px-1">
                                                <div className="w-full space-y-1">
                                                    <div
                                                        className="w-full bg-indigo-600 rounded-t"
                                                        style={{ height: `${data.overall * 2}px` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-500 mt-2">{data.period}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-center gap-4 mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                                        <span className="text-xs text-slate-600">Overall</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Prediction Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Prediction Analysis</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-5 h-5 text-indigo-600" />
                                    <span className="font-medium text-indigo-900">End of Term Projections</span>
                                </div>
                                <p className="text-2xl font-bold text-indigo-600">{predictions.predictedPassRate}%</p>
                                <p className="text-sm text-indigo-700">Predicted pass rate</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Students improving</span>
                                    <span className="font-medium text-green-600">{predictions.studentsImproving} ({predictions.studentsImprovingPercentage}%)</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Students declining</span>
                                    <span className="font-medium text-red-600">{predictions.studentsDeclining} ({predictions.studentsDecliningPercentage}%)</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Students stable</span>
                                    <span className="font-medium text-slate-600">{predictions.studentsStable} ({predictions.studentsStablePercentage}%)</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <h4 className="text-sm font-medium text-slate-700 mb-2">Predicted Distinctions</h4>
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-600" />
                                    <span className="text-lg font-bold text-slate-800">{predictions.predictedDistinctions}</span>
                                    <span className="text-sm text-slate-500">students</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparative Insights */}
            {!loadingData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Class Performance Comparison */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Class Performance Comparison</h3>
                        {classPerformance.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No class data available</div>
                        ) : (
                            <div className="space-y-4">
                                {classPerformance.map(cls => (
                                    <div key={cls.classId} className="p-4 bg-slate-50 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-slate-800">{cls.className}</h4>
                                                <p className="text-xs text-slate-500">{cls.totalStudents} students</p>
                                            </div>
                                            <div className={`flex items-center gap-1 text-sm ${cls.trend > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {cls.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {Math.abs(cls.trend)}%
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-slate-500">Average</p>
                                                <p className="text-lg font-bold text-slate-800">{cls.averageScore}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Pass Rate</p>
                                                <p className="text-lg font-bold text-green-600">{cls.passRate}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Top Subject</p>
                                                <p className="text-sm font-medium text-indigo-600">{cls.topSubject}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Needs Improvement</p>
                                                <p className="text-sm font-medium text-amber-600">{cls.strugglingSubject}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Subject Performance */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Subject Performance Analysis</h3>
                        {subjectPerformance.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No subject data available</div>
                        ) : (
                            <div className="space-y-4">
                                {subjectPerformance.map(subject => (
                                    <div key={subject.subjectId} className="p-4 bg-slate-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium text-slate-800">{subject.name}</h4>
                                            <div className={`flex items-center gap-1 text-sm ${subject.trend > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {subject.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {Math.abs(subject.trend)}%
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="p-2 bg-white rounded">
                                                <p className="text-xs text-slate-500">Average</p>
                                                <p className="text-sm font-bold text-slate-800">{subject.averageScore}%</p>
                                            </div>
                                            <div className="p-2 bg-white rounded">
                                                <p className="text-xs text-slate-500">Pass Rate</p>
                                                <p className="text-sm font-bold text-green-600">{subject.passRate}%</p>
                                            </div>
                                            <div className="p-2 bg-white rounded">
                                                <p className="text-xs text-slate-500">Distinction</p>
                                                <p className="text-sm font-bold text-purple-600">{subject.distinctionRate}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Additional Insights Cards */}
            {!loadingData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-sm p-6 text-white">
                        <Zap className="w-8 h-8 mb-3 text-indigo-200" />
                        <h4 className="text-lg font-semibold mb-1">Intervention Needed</h4>
                        <p className="text-3xl font-bold mb-2">{interventions.studentsNeedingSupport} students</p>
                        <p className="text-indigo-100 text-sm">Require immediate academic support</p>
                        <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                            View Intervention List
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-sm p-6 text-white">
                        <Shield className="w-8 h-8 mb-3 text-emerald-200" />
                        <h4 className="text-lg font-semibold mb-1">On Track</h4>
                        <p className="text-3xl font-bold mb-2">{interventions.honorRollCount} students</p>
                        <p className="text-emerald-100 text-sm">Meeting or exceeding expectations</p>
                        <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                            View Honor Roll
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl shadow-sm p-6 text-white">
                        <Clock className="w-8 h-8 mb-3 text-amber-200" />
                        <h4 className="text-lg font-semibold mb-1">Attendance Alert</h4>
                        <p className="text-3xl font-bold mb-2">{interventions.chronicAbsenteeism}%</p>
                        <p className="text-amber-100 text-sm">Chronic absenteeism rate</p>
                        <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                            View Attendance Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsManagement;