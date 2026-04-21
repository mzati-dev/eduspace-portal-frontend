// components/attendance/TeacherAttendanceAnalytics.tsx
import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Users,
    Clock,
    AlertTriangle,
    Award,
    BarChart3,
    Activity,
    Download
} from 'lucide-react';
import { API_BASE_URL, fetchAttendanceAnalytics } from '@/services/attendanceService';

interface AnalyticsProps {
    classId: string;
    className: string;
    students: any[];
    showMessage: (msg: string, isError?: boolean) => void;
    allClasses?: any[];  // ADD THIS
    onClassChange?: (classId: string) => void;  // ADD THI
}

const TeacherAttendanceAnalytics: React.FC<AnalyticsProps> = ({ classId, className, students, showMessage, allClasses = [],
    onClassChange }) => {

    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        if (classId) {
            fetchAnalytics();
        }
    }, [classId]);

    // REPLACE the entire fetchAnalytics function with:
    const fetchAnalytics = async () => {
        try {
            // Don't pass date range - let backend use class term dates
            const data = await fetchAttendanceAnalytics(classId);
            if (data && data.trends) {
                setAnalytics(data);
            } else {
                setAnalytics(null);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setAnalytics(null);
        }
    };

    // Default empty analytics structure when no data
    const defaultAnalytics = {
        summary: {
            averageAttendance: 0,
            totalDays: 0,
            totalPresent: 0,
            totalAbsent: 0,
            totalLate: 0,
            totalExcused: 0,
            perfectAttendance: 0,
            criticalRisk: 0
        },
        trends: {
            weekly: [],
            labels: []
        },
        topPerformers: [],
        bottomPerformers: [],
        dayAnalysis: [
            { day: 'Monday', rate: 0, absent: 0 },
            { day: 'Tuesday', rate: 0, absent: 0 },
            { day: 'Wednesday', rate: 0, absent: 0 },
            { day: 'Thursday', rate: 0, absent: 0 },
            { day: 'Friday', rate: 0, absent: 0 }
        ],
        alerts: {
            critical: [],
            warning: []
        }
    };

    const displayAnalytics = analytics || defaultAnalytics;

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Attendance Analytics</h2>
                    <p className="text-slate-500">{className || 'Select a class to view analytics'}</p>
                </div>
                <button className="px-3 py-2 bg-slate-100 rounded-lg text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

            {/* Class Filter */}
            {allClasses.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Class</label>
                    <select
                        value={classId}
                        onChange={(e) => onClassChange && onClassChange(e.target.value)}
                        className="w-full md:w-64 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Select a class</option>
                        {allClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Row 1: 4 Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Avg Attendance</span>
                        {displayAnalytics.summary.averageAttendance >= 80 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{displayAnalytics.summary.averageAttendance}%</p>
                    <p className="text-xs text-slate-500 mt-1">Target: 90%</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Present</span>
                        <Users className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{displayAnalytics.summary.totalPresent}</p>
                    <p className="text-xs text-slate-500 mt-1">Total present</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Absent</span>
                        <Clock className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{displayAnalytics.summary.totalAbsent}</p>
                    <p className="text-xs text-slate-500 mt-1">
                        {displayAnalytics.summary.totalPresent + displayAnalytics.summary.totalAbsent > 0
                            ? ((displayAnalytics.summary.totalAbsent / (displayAnalytics.summary.totalPresent + displayAnalytics.summary.totalAbsent)) * 100).toFixed(1)
                            : '0'}% of total
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Perfect Attendance</span>
                        <Award className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{displayAnalytics.summary.perfectAttendance}</p>
                    <p className="text-xs text-slate-500 mt-1">students with 100%</p>
                </div>
            </div>

            {/* Row 2: 4 Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-2xl font-bold text-slate-800">{displayAnalytics.summary.totalDays}</p>
                    <p className="text-xs text-slate-500">School Days</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-2xl font-bold text-slate-800">{displayAnalytics.summary.totalLate}</p>
                    <p className="text-xs text-slate-500">Late Arrivals</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-2xl font-bold text-slate-800">{displayAnalytics.summary.totalExcused}</p>
                    <p className="text-xs text-slate-500">Excused Absences</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-2xl font-bold text-red-600">{displayAnalytics.summary.criticalRisk}</p>
                    <p className="text-xs text-slate-500">At Critical Risk</p>
                </div>
            </div>

            {/* Weekly Trend */}
            {/* Weekly Trend */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Attendance Trend
                </h3>

                {(!classId || classId === '') ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-amber-800 mb-2">No Class Selected</h3>
                        <p className="text-amber-700">
                            Please select a class from the dropdown above to view attendance trend.
                        </p>
                        <p className="text-sm text-amber-600 mt-2">
                            Analytics are calculated per class based on each class's term dates and attendance records.
                        </p>
                    </div>
                ) : displayAnalytics.trends.weekly.length > 0 ? (
                    <div className="space-y-3">
                        {displayAnalytics.trends.weekly.map((rate: number, idx: number) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">{displayAnalytics.trends.labels[idx] || `Week ${idx + 1}`}</span>
                                    <span className={`font-medium ${rate >= 75 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {rate}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${rate >= 75 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ width: `${rate}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <Activity className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p>No trend data available yet</p>
                        <p className="text-sm mt-1">Start recording attendance to see trends</p>
                    </div>
                )}
            </div>

            {/* Day Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">Attendance by Day</h3>
                    <div className="space-y-3">
                        {displayAnalytics.dayAnalysis.map((day: any) => (
                            <div key={day.day}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">{day.day}</span>
                                    <span className="text-slate-600">{day.rate}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-indigo-500"
                                        style={{ width: `${day.rate}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{day.absent} absent on average</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">Critical Alerts</h3>
                    {displayAnalytics.alerts.critical.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-red-700 mb-2">Critical (&lt;50%)</p>
                            <div className="space-y-2">
                                {displayAnalytics.alerts.critical.map((student: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                        <span className="text-sm font-medium text-red-800">{student.name}</span>
                                        <span className="text-sm font-bold text-red-600">{student.attendanceRate}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {displayAnalytics.alerts.warning.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-amber-700 mb-2">Warning (50-70%)</p>
                            <div className="space-y-2">
                                {displayAnalytics.alerts.warning.map((student: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-amber-50 rounded">
                                        <span className="text-sm font-medium text-amber-800">{student.name}</span>
                                        <span className="text-sm font-bold text-amber-600">{student.attendanceRate}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {displayAnalytics.alerts.critical.length === 0 && displayAnalytics.alerts.warning.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                            <p>No critical alerts at this time</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top & Bottom Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        Top Performers
                    </h3>
                    <div className="space-y-3">
                        {displayAnalytics.topPerformers.length > 0 ? (
                            displayAnalytics.topPerformers.map((student: any, idx: number) => (
                                <div key={student.id || idx} className="flex justify-between items-center p-2 bg-emerald-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-emerald-700">#{idx + 1}</span>
                                        <span className="text-sm font-medium text-emerald-800">{student.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600">{student.rate?.toFixed(1) || 0}%</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Award className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p>No top performer data available</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Needs Improvement
                    </h3>
                    <div className="space-y-3">
                        {displayAnalytics.bottomPerformers.length > 0 ? (
                            displayAnalytics.bottomPerformers.map((student: any, idx: number) => (
                                <div key={student.id || idx} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-red-700">#{idx + 1}</span>
                                        <span className="text-sm font-medium text-red-800">{student.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-red-600">{student.rate?.toFixed(1) || 0}%</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p>No improvement data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendanceAnalytics;