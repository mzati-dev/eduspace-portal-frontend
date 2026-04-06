// components/attendance/PatternsTab.tsx
import React from 'react';
import { TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { AttendancePattern, ClassPerformance, PeakLateTime } from '@/services/attendanceService';

interface PatternsTabProps {
    loadingPatterns: boolean;
    patterns: {
        highestAbsenceDay: string;
        highestAbsenceRate: string;
        bestAttendanceDay: string;
        bestAttendanceRate: string;
        peakLateTime: string;
    };
    dailyPatterns: AttendancePattern[];
    classPerformance: ClassPerformance[];
    peakLateTimes: PeakLateTime[];
}

const PatternsTab: React.FC<PatternsTabProps> = ({
    loadingPatterns,
    patterns,
    dailyPatterns,
    classPerformance,
    peakLateTimes
}) => {
    return (
        <div className="space-y-6">
            {/* Patterns Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Highest Absence Day</h3>
                            <p className="text-sm text-slate-500">{patterns.highestAbsenceDay || 'N/A'}</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{patterns.highestAbsenceRate}%</p>
                    <p className="text-sm text-slate-500 mt-1">Average absence rate</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Best Attendance Day</h3>
                            <p className="text-sm text-slate-500">{patterns.bestAttendanceDay || 'N/A'}</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{patterns.bestAttendanceRate}%</p>
                    <p className="text-sm text-slate-500 mt-1">Average attendance rate</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Peak Late Arrivals</h3>
                            <p className="text-sm text-slate-500">{peakLateTimes[0]?.day || 'Monday'}</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{patterns.peakLateTime}</p>
                    <p className="text-sm text-slate-500 mt-1">Most common late check-in time</p>
                </div>
            </div>

            {/* Weekly Pattern Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Daily Attendance Patterns (Last 30 Days)</h3>
                {loadingPatterns ? (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                        Loading patterns...
                    </div>
                ) : dailyPatterns.length > 0 ? (
                    <div className="h-64 flex items-end justify-between gap-2">
                        {dailyPatterns.slice(0, 7).map((day, index) => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700"
                                    style={{ height: `${day.rate * 2}px` }}
                                />
                                <span className="text-sm font-medium text-slate-600">{day.day}</span>
                                <span className="text-xs text-slate-500">{day.rate}%</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                        Select a class to view patterns
                    </div>
                )}
            </div>

            {/* Class-wise Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Class Attendance Comparison</h3>
                <div className="space-y-3">
                    {classPerformance.length > 0 ? (
                        classPerformance.map(cls => (
                            <div key={cls.classId} className="flex items-center gap-4">
                                <span className="w-24 text-sm font-medium text-slate-600">{cls.className}</span>
                                <div className="flex-1">
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${cls.trend === 'up' ? 'bg-green-600' :
                                                cls.trend === 'down' ? 'bg-red-600' : 'bg-indigo-600'
                                                }`}
                                            style={{ width: `${cls.averageRate}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-slate-800">{cls.averageRate}%</span>
                                {cls.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                                {cls.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-500">No class data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatternsTab;