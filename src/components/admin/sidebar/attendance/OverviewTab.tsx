// components/attendance/OverviewTab.tsx
import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Award,
    AlertTriangle,
    Users,
    School,
    Activity
} from 'lucide-react';
import { ClassAttendanceSummary, WeeklyStats, MonthlyStats, TermStats } from '@/services/attendanceService';

interface OverviewTabProps {
    loading: boolean;
    weeklyStats: WeeklyStats[];
    monthlyStats: MonthlyStats[];
    termStats: TermStats;
    classSummaries: ClassAttendanceSummary[];
    selectedClass: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
    loading,
    weeklyStats: propWeeklyStats,
    monthlyStats: propMonthlyStats,
    termStats: propTermStats,
    classSummaries: propClassSummaries,
    selectedClass
}) => {
    // FALLBACK DUMMY DATA
    const weeklyStats = propWeeklyStats.length > 0 ? propWeeklyStats : [
        { day: 'Mon', date: '2024-01-01', rate: 78, present: 35, total: 45 },
        { day: 'Tue', date: '2024-01-02', rate: 82, present: 37, total: 45 },
        { day: 'Wed', date: '2024-01-03', rate: 75, present: 34, total: 45 },
        { day: 'Thu', date: '2024-01-04', rate: 80, present: 36, total: 45 },
        { day: 'Fri', date: '2024-01-05', rate: 71, present: 32, total: 45 },
    ];

    const monthlyStats = propMonthlyStats.length > 0 ? propMonthlyStats : [
        { weekName: 'Week 1', rate: 78, present: 175, total: 225, date: '2024-01-05' },
        { weekName: 'Week 2', rate: 82, present: 185, total: 225, date: '2024-01-12' },
        { weekName: 'Week 3', rate: 75, present: 169, total: 225, date: '2024-01-19' },
        { weekName: 'Week 4', rate: 80, present: 180, total: 225, date: '2024-01-26' },
    ];

    const termStats = propTermStats?.averageRate ? propTermStats : {
        averageRate: 76.5,
        highestRate: 88,
        lowestRate: 65,
        totalDays: 45,
        termName: 'Term 1 2024'
    };

    const classSummaries = propClassSummaries.length > 0 ? propClassSummaries : [
        { classId: '1', className: 'Form 1A', averageRate: 82, totalStudents: 35 },
        { classId: '2', className: 'Form 1B', averageRate: 78, totalStudents: 32 },
        { classId: '3', className: 'Form 2A', averageRate: 75, totalStudents: 38 },
        { classId: '4', className: 'Form 2B', averageRate: 68, totalStudents: 30 },
        { classId: '5', className: 'Form 3A', averageRate: 71, totalStudents: 28 },
    ];

    const weeklyAverage = weeklyStats.length > 0
        ? (weeklyStats.reduce((sum, day) => sum + day.rate, 0) / weeklyStats.length).toFixed(1)
        : '0';

    const monthlyAverage = monthlyStats.length > 0
        ? (monthlyStats.reduce((sum, week) => sum + week.rate, 0) / monthlyStats.length).toFixed(1)
        : '0';

    const weeklyChange = weeklyStats.length >= 2
        ? (weeklyStats[weeklyStats.length - 1].rate - weeklyStats[0].rate).toFixed(1)
        : null;

    const monthlyChange = monthlyStats.length >= 2
        ? (monthlyStats[monthlyStats.length - 1].rate - monthlyStats[0].rate).toFixed(1)
        : null;

    const bestDay = weeklyStats.length > 0
        ? weeklyStats.reduce((best, day) => day.rate > best.rate ? day : best, weeklyStats[0])
        : null;

    const worstDay = weeklyStats.length > 0
        ? weeklyStats.reduce((worst, day) => day.rate < worst.rate ? day : worst, weeklyStats[0])
        : null;

    const bestWeek = monthlyStats.length > 0
        ? monthlyStats.reduce((best, week) => week.rate > best.rate ? week : best, monthlyStats[0])
        : null;

    const worstWeek = monthlyStats.length > 0
        ? monthlyStats.reduce((worst, week) => week.rate < worst.rate ? week : worst, monthlyStats[0])
        : null;
    const totalStudentsAll = classSummaries.reduce((sum, cls) => sum + (cls.totalStudents || 0), 0);

    const classesNeedingAttention = classSummaries
        .filter(cls => cls.averageRate < 75)
        .sort((a, b) => a.averageRate - b.averageRate);

    // Mock data - replace with actual student attendance data when available
    const studentsWellPercent = 68;
    const studentsAttentionPercent = 18;
    const studentsWellCount = Math.floor(totalStudentsAll * studentsWellPercent / 100);
    const studentsAttentionCount = Math.floor(totalStudentsAll * studentsAttentionPercent / 100);

    const schoolWideStats = classSummaries.length > 0 ? {
        totalStudents: totalStudentsAll,
        averageAttendance: (classSummaries.reduce((sum, cls) => sum + cls.averageRate, 0) / classSummaries.length).toFixed(1),
        classesAbove80: classSummaries.filter(cls => cls.averageRate >= 80).length,
        classesBelow70: classSummaries.filter(cls => cls.averageRate < 70).length,
        totalClasses: classSummaries.length,
        studentsWell: studentsWellPercent,
        studentsAttention: studentsAttentionPercent,
        studentsWellCount: studentsWellCount,
        studentsAttentionCount: studentsAttentionCount
    } : null;

    return (
        <div className="space-y-6">

            {/* School Wide Overview */}
            {schoolWideStats && (
                <div className="space-y-4">
                    {/* School Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <School className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold text-slate-800">School Overview</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-2xl font-bold text-indigo-600">{schoolWideStats.totalClasses}</p>
                                <p className="text-xs text-slate-600">Total Classes</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-2xl font-bold text-indigo-600">{schoolWideStats.totalStudents}</p>
                                <p className="text-xs text-slate-600">Total Students</p>
                            </div>
                            <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                <p className="text-2xl font-bold text-emerald-600">{schoolWideStats.averageAttendance}%</p>
                                <p className="text-xs text-slate-600">School Average</p>
                            </div>
                            <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                <p className="text-2xl font-bold text-emerald-600">{schoolWideStats.classesAbove80}</p>
                                <p className="text-xs text-slate-600">Classes Above 80%</p>
                            </div>
                            <div className="text-center p-3 bg-amber-50 rounded-lg">
                                <p className="text-2xl font-bold text-amber-600">{schoolWideStats.classesBelow70}</p>
                                <p className="text-xs text-slate-600">Classes Below 70%</p>
                            </div>
                        </div>
                    </div>
                    {/* 3 Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* WEEK CARD */}
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <Calendar className="w-8 h-8 opacity-80" />
                                {weeklyChange && (
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(weeklyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                        {parseFloat(weeklyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {parseFloat(weeklyChange) >= 0 ? '+' : ''}{weeklyChange}%
                                    </div>
                                )}
                            </div>
                            <p className="text-indigo-100 text-sm">THIS WEEK</p>
                            <p className="text-3xl font-bold mt-1">{weeklyAverage}%</p>
                            <p className="text-indigo-100 text-xs mt-2">Average Attendance</p>
                            {bestDay && <p className="text-indigo-100 text-xs mt-1">Best: {bestDay.day} ({bestDay.rate}%)</p>}
                            {worstDay && <p className="text-indigo-100 text-xs">Lowest: {worstDay.day} ({worstDay.rate}%)</p>}
                        </div>

                        {/* MONTH CARD */}
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <Activity className="w-8 h-8 opacity-80" />
                                {monthlyChange && (
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(monthlyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                        {parseFloat(monthlyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {parseFloat(monthlyChange) >= 0 ? '+' : ''}{monthlyChange}%
                                    </div>
                                )}
                            </div>
                            <p className="text-emerald-100 text-sm">THIS MONTH</p>
                            <p className="text-3xl font-bold mt-1">{monthlyAverage}%</p>
                            <p className="text-emerald-100 text-xs mt-2">Average Attendance</p>
                            {bestWeek && <p className="text-emerald-100 text-xs mt-1">Best: {bestWeek.weekName} ({bestWeek.rate}%)</p>}
                            {worstWeek && <p className="text-emerald-100 text-xs">Lowest: {worstWeek.weekName} ({worstWeek.rate}%)</p>}
                        </div>

                        {/* TERM CARD */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <School className="w-8 h-8 opacity-80" />
                            </div>
                            <p className="text-purple-100 text-sm">THIS TERM</p>
                            <p className="text-3xl font-bold mt-1">{termStats?.averageRate?.toFixed(1) || '0'}%</p>
                            <p className="text-purple-100 text-xs mt-2">Overall Average</p>
                            {termStats && (
                                <>
                                    <p className="text-purple-100 text-xs mt-1">Highest: {termStats.highestRate}%</p>
                                    <p className="text-purple-100 text-xs">Lowest: {termStats.lowestRate}%</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Student Performance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <Award className="w-8 h-8 opacity-80" />
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Excellent</span>
                            </div>
                            <p className="text-green-100 text-sm">STUDENTS DOING WELL</p>
                            <p className="text-3xl font-bold mt-1">{schoolWideStats.studentsWell}%</p>
                            <p className="text-green-100 text-xs mt-2">Have ≥75% attendance</p>
                            <p className="text-green-100 text-xs mt-1">{schoolWideStats.studentsWellCount} students</p>
                        </div>

                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <AlertTriangle className="w-8 h-8 opacity-80" />
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Attention Needed</span>
                            </div>
                            <p className="text-red-100 text-sm">NEED ATTENTION</p>
                            <p className="text-3xl font-bold mt-1">{schoolWideStats.studentsAttention}%</p>
                            <p className="text-red-100 text-xs mt-2">Have &lt;70% attendance</p>
                            <p className="text-red-100 text-xs mt-1">{schoolWideStats.studentsAttentionCount} students</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Classes Needing Attention - ONLY */}
            {/* Classes Performance - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Classes Needing Attention */}
                {classesNeedingAttention.length > 0 && (
                    <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg p-5 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <AlertTriangle className="w-8 h-8 opacity-80" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{classesNeedingAttention.length} Classes</span>
                        </div>
                        <p className="text-rose-100 text-sm">NEEDS ATTENTION</p>
                        <p className="text-3xl font-bold mt-1">{classesNeedingAttention.length}</p>
                        <p className="text-rose-100 text-xs mt-2">Classes below 75% attendance</p>
                        <div className="mt-3 space-y-2">
                            {classesNeedingAttention.slice(0, 3).map(cls => (
                                <div key={cls.classId} className="flex justify-between items-center text-sm bg-white/10 rounded-lg px-3 py-2">
                                    <span>{cls.className}</span>
                                    <span className="font-bold">{cls.averageRate}%</span>
                                </div>
                            ))}
                            {classesNeedingAttention.length > 3 && (
                                <p className="text-xs text-rose-100 text-center mt-2">+{classesNeedingAttention.length - 3} more classes</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Top Performing Classes */}
                {(() => {
                    const topClasses = classSummaries
                        .filter(cls => cls.averageRate >= 80)
                        .sort((a, b) => b.averageRate - a.averageRate);

                    if (topClasses.length === 0) return null;

                    return (
                        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg p-5 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <Award className="w-8 h-8 opacity-80" />
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{topClasses.length} Classes</span>
                            </div>
                            <p className="text-teal-100 text-sm">TOP PERFORMING</p>
                            <p className="text-3xl font-bold mt-1">{topClasses.length}</p>
                            <p className="text-teal-100 text-xs mt-2">Classes above 80% attendance</p>
                            <div className="mt-3 space-y-2">
                                {topClasses.slice(0, 3).map(cls => (
                                    <div key={cls.classId} className="flex justify-between items-center text-sm bg-white/10 rounded-lg px-3 py-2">
                                        <span>{cls.className}</span>
                                        <span className="font-bold">{cls.averageRate}%</span>
                                    </div>
                                ))}
                                {topClasses.length > 3 && (
                                    <p className="text-xs text-teal-100 text-center mt-2">+{topClasses.length - 3} more classes</p>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default OverviewTab;

// // components/attendance/OverviewTab.tsx
// import React, { useEffect, useState } from 'react';
// import {
//     TrendingUp,
//     TrendingDown,
//     Calendar,
//     Award,
//     AlertTriangle,
//     CheckCircle,
//     BarChart3,
//     Users,
//     School,
//     Star,
//     Target,
//     ThumbsUp,
//     ThumbsDown,
//     Activity
// } from 'lucide-react';
// import { ClassAttendanceSummary, WeeklyStats, MonthlyStats, TermStats } from '@/services/attendanceService';

// interface OverviewTabProps {
//     loading: boolean;
//     weeklyStats: WeeklyStats[];
//     monthlyStats: MonthlyStats[];
//     termStats: TermStats;
//     classSummaries: ClassAttendanceSummary[];
//     selectedClass: string;
// }

// const OverviewTab: React.FC<OverviewTabProps> = ({
//     loading,
//     weeklyStats,
//     monthlyStats,
//     termStats,
//     classSummaries,

// }) => {


//     // Calculate weekly average
//     const weeklyAverage = weeklyStats.length > 0
//         ? (weeklyStats.reduce((sum, day) => sum + day.rate, 0) / weeklyStats.length).toFixed(1)
//         : '0';

//     // Calculate monthly average
//     const monthlyAverage = monthlyStats.length > 0
//         ? (monthlyStats.reduce((sum, week) => sum + week.rate, 0) / monthlyStats.length).toFixed(1)
//         : '0';

//     // Calculate change from previous week
//     const weeklyChange = weeklyStats.length >= 2
//         ? (weeklyStats[weeklyStats.length - 1].rate - weeklyStats[0].rate).toFixed(1)
//         : null;

//     // Calculate change from previous month
//     const monthlyChange = monthlyStats.length >= 2
//         ? (monthlyStats[monthlyStats.length - 1].rate - monthlyStats[0].rate).toFixed(1)
//         : null;

//     // Best and worst days this week
//     const bestDay = weeklyStats.length > 0
//         ? weeklyStats.reduce((best, day) => day.rate > best.rate ? day : best, weeklyStats[0])
//         : null;

//     const worstDay = weeklyStats.length > 0
//         ? weeklyStats.reduce((worst, day) => day.rate < worst.rate ? day : worst, weeklyStats[0])
//         : null;

//     // Best and worst weeks this month
//     const bestWeek = monthlyStats.length > 0
//         ? monthlyStats.reduce((best, week) => week.rate > best.rate ? week : best, monthlyStats[0])
//         : null;

//     const worstWeek = monthlyStats.length > 0
//         ? monthlyStats.reduce((worst, week) => week.rate < worst.rate ? week : worst, monthlyStats[0])
//         : null;

//     // Classes needing attention
//     const classesNeedingAttention = classSummaries
//         .filter(cls => cls.averageRate < 75)
//         .sort((a, b) => a.averageRate - b.averageRate);

//     // School wide stats
//     const schoolWideStats = classSummaries.length > 0 ? {
//         totalStudents: classSummaries.reduce((sum, cls) => sum + (cls.totalStudents || 0), 0),
//         averageAttendance: (classSummaries.reduce((sum, cls) => sum + cls.averageRate, 0) / classSummaries.length).toFixed(1),
//         classesBelow70: classSummaries.filter(cls => cls.averageRate < 70).length,
//         totalClasses: classSummaries.length
//     } : null;

//     return (
//         <div className="space-y-6">
//             {/* Week, Month, Term Summary Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {/* WEEK CARD */}
//                 <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
//                     <div className="flex items-center justify-between mb-3">
//                         <Calendar className="w-8 h-8 opacity-80" />
//                         {weeklyChange && (
//                             <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(weeklyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
//                                 {parseFloat(weeklyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//                                 {parseFloat(weeklyChange) >= 0 ? '+' : ''}{weeklyChange}%
//                             </div>
//                         )}
//                     </div>
//                     <p className="text-indigo-100 text-sm">THIS WEEK</p>
//                     <p className="text-3xl font-bold mt-1">{weeklyAverage}%</p>
//                     <p className="text-indigo-100 text-xs mt-2">Average Attendance</p>
//                     {bestDay && (
//                         <p className="text-indigo-100 text-xs mt-1">Best: {bestDay.day} ({bestDay.rate}%)</p>
//                     )}
//                     {worstDay && (
//                         <p className="text-indigo-100 text-xs">Lowest: {worstDay.day} ({worstDay.rate}%)</p>
//                     )}
//                 </div>

//                 {/* MONTH CARD */}
//                 <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
//                     <div className="flex items-center justify-between mb-3">
//                         <Activity className="w-8 h-8 opacity-80" />
//                         {monthlyChange && (
//                             <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(monthlyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
//                                 {parseFloat(monthlyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//                                 {parseFloat(monthlyChange) >= 0 ? '+' : ''}{monthlyChange}%
//                             </div>
//                         )}
//                     </div>
//                     <p className="text-emerald-100 text-sm">THIS MONTH</p>
//                     <p className="text-3xl font-bold mt-1">{monthlyAverage}%</p>
//                     <p className="text-emerald-100 text-xs mt-2">Average Attendance</p>
//                     {bestWeek && (
//                         <p className="text-emerald-100 text-xs mt-1">Best: {bestWeek.weekName} ({bestWeek.rate}%)</p>
//                     )}
//                     {worstWeek && (
//                         <p className="text-emerald-100 text-xs">Lowest: {worstWeek.weekName} ({worstWeek.rate}%)</p>
//                     )}
//                 </div>

//                 {/* TERM CARD */}
//                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
//                     <div className="flex items-center justify-between mb-3">
//                         <School className="w-8 h-8 opacity-80" />
//                     </div>
//                     <p className="text-purple-100 text-sm">THIS TERM</p>
//                     <p className="text-3xl font-bold mt-1">{termStats?.averageRate?.toFixed(1) || '0'}%</p>
//                     <p className="text-purple-100 text-xs mt-2">Overall Average</p>
//                     {termStats && (
//                         <>
//                             <p className="text-purple-100 text-xs mt-1">Highest: {termStats.highestRate}%</p>
//                             <p className="text-purple-100 text-xs">Lowest: {termStats.lowestRate}%</p>
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* School Wide Overview */}
//             {schoolWideStats && (
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                     <div className="flex items-center gap-2 mb-4">
//                         <School className="w-5 h-5 text-indigo-600" />
//                         <h3 className="font-semibold text-slate-800">School Wide Overview</h3>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <div className="text-center p-3 bg-slate-50 rounded-lg">
//                             <p className="text-2xl font-bold text-indigo-600">{schoolWideStats.totalClasses}</p>
//                             <p className="text-xs text-slate-600">Total Classes</p>
//                         </div>
//                         <div className="text-center p-3 bg-slate-50 rounded-lg">
//                             <p className="text-2xl font-bold text-indigo-600">{schoolWideStats.totalStudents}</p>
//                             <p className="text-xs text-slate-600">Total Students</p>
//                         </div>
//                         <div className="text-center p-3 bg-emerald-50 rounded-lg">
//                             <p className="text-2xl font-bold text-emerald-600">{schoolWideStats.averageAttendance}%</p>
//                             <p className="text-xs text-slate-600">School Average</p>
//                         </div>
//                         <div className="text-center p-3 bg-amber-50 rounded-lg">
//                             <p className="text-2xl font-bold text-amber-600">{schoolWideStats.classesBelow70}</p>
//                             <p className="text-xs text-slate-600">Classes Below 70%</p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Weekly Trend */}
//             {weeklyStats.length > 0 && (
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                     <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
//                         <Calendar className="w-5 h-5 text-indigo-600" />
//                         This Week's Attendance Trend
//                     </h3>
//                     <div className="grid grid-cols-7 gap-2">
//                         {weeklyStats.map((day) => (
//                             <div key={day.date} className="text-center">
//                                 <div className="text-sm font-medium text-slate-600 mb-2">{day.day}</div>
//                                 <div className="relative h-32 bg-slate-100 rounded-lg overflow-hidden group">
//                                     <div
//                                         className={`absolute bottom-0 w-full transition-all duration-500 ${day.rate >= 90 ? 'bg-emerald-500' :
//                                             day.rate >= 75 ? 'bg-indigo-500' :
//                                                 day.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
//                                             }`}
//                                         style={{ height: `${day.rate}%` }}
//                                     />
//                                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
//                                         <span className="text-white text-xs font-bold">{day.rate}%</span>
//                                     </div>
//                                 </div>
//                                 <div className="mt-2 text-sm font-semibold text-slate-700">{day.rate}%</div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Monthly Trend */}
//             {monthlyStats.length > 0 && (
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                     <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
//                         <Activity className="w-5 h-5 text-indigo-600" />
//                         This Month's Attendance Trend
//                     </h3>
//                     <div className="space-y-4">
//                         {monthlyStats.map((week, idx) => (
//                             <div key={idx}>
//                                 <div className="flex justify-between mb-2">
//                                     <span className="text-sm font-medium text-slate-700">{week.weekName}</span>
//                                     <span className="text-sm font-bold text-indigo-600">{week.rate}%</span>
//                                 </div>
//                                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
//                                     <div
//                                         className={`h-full rounded-full ${week.rate >= 90 ? 'bg-emerald-500' :
//                                             week.rate >= 75 ? 'bg-indigo-500' :
//                                                 week.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
//                                             }`}
//                                         style={{ width: `${week.rate}%` }}
//                                     />
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Classes Needing Attention */}
//             {classesNeedingAttention.length > 0 && (
//                 <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-6">
//                     <div className="flex items-center gap-2 mb-4">
//                         <AlertTriangle className="w-5 h-5 text-amber-600" />
//                         <h3 className="font-semibold text-amber-800">Classes That Need More Attention</h3>
//                         <span className="ml-auto text-sm text-amber-600">{classesNeedingAttention.length} classes below 75%</span>
//                     </div>
//                     <div className="space-y-3">
//                         {classesNeedingAttention.map(cls => (
//                             <div key={cls.classId} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
//                                 <div>
//                                     <p className="font-medium text-slate-800">{cls.className}</p>
//                                     <p className="text-xs text-slate-500">{cls.totalStudents || 0} students</p>
//                                 </div>
//                                 <div className="text-right">
//                                     <span className="text-lg font-bold text-amber-600">{cls.averageRate}%</span>
//                                     <p className="text-xs text-amber-500">Needs improvement</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* All Classes Performance */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
//                     <School className="w-5 h-5 text-indigo-600" />
//                     All Classes Performance
//                 </h3>
//                 {loading ? (
//                     <div className="text-center py-8 text-slate-500">Loading...</div>
//                 ) : classSummaries.length > 0 ? (
//                     <div className="space-y-4">
//                         {classSummaries.map(cls => (
//                             <div key={cls.classId}>
//                                 <div className="flex items-center justify-between mb-1">
//                                     <span className="text-sm font-medium text-slate-700">{cls.className}</span>
//                                     <div className="flex items-center gap-2">
//                                         <span className={`text-sm font-bold ${cls.averageRate >= 90 ? 'text-emerald-600' :
//                                             cls.averageRate >= 75 ? 'text-indigo-600' :
//                                                 cls.averageRate >= 60 ? 'text-amber-600' : 'text-red-600'
//                                             }`}>
//                                             {cls.averageRate}%
//                                         </span>
//                                         {cls.averageRate >= 90 && <Award className="w-4 h-4 text-emerald-500" />}
//                                         {cls.averageRate < 70 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
//                                     </div>
//                                 </div>
//                                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
//                                     <div
//                                         className={`h-full rounded-full ${cls.averageRate >= 90 ? 'bg-emerald-500' :
//                                             cls.averageRate >= 75 ? 'bg-indigo-500' :
//                                                 cls.averageRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
//                                             }`}
//                                         style={{ width: `${cls.averageRate}%` }}
//                                     />
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-8 text-slate-500">No class data available</div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default OverviewTab;

// // // components/attendance/OverviewTab.tsx
// // import React, { useEffect, useState } from 'react';
// // import {
// //     TrendingUp,
// //     TrendingDown,
// //     Calendar,
// //     Award,
// //     AlertTriangle,
// //     CheckCircle,
// //     BarChart3,
// //     Users,
// //     School,
// //     Star,
// //     Target,
// //     ThumbsUp,
// //     ThumbsDown,
// //     Activity
// // } from 'lucide-react';
// // import { ClassAttendanceSummary, WeeklyStats, MonthlyStats, TermStats } from '@/services/attendanceService';

// // interface OverviewTabProps {
// //     loading: boolean;
// //     weeklyStats: WeeklyStats[];
// //     monthlyStats: MonthlyStats[];
// //     termStats: TermStats;
// //     classSummaries: ClassAttendanceSummary[];
// //     bestStudents: any[];
// //     needsImprovementStudents: any[];
// //     showAllBest: boolean;
// //     setShowAllBest: (show: boolean) => void;
// //     showAllNeeds: boolean;
// //     setShowAllNeeds: (show: boolean) => void;
// //     selectedClass: string;
// // }

// // const OverviewTab: React.FC<OverviewTabProps> = ({
// //     loading,
// //     weeklyStats,
// //     monthlyStats,
// //     termStats,
// //     classSummaries,
// //     bestStudents,
// //     needsImprovementStudents,
// //     showAllBest,
// //     setShowAllBest,
// //     showAllNeeds,
// //     setShowAllNeeds,
// //     selectedClass
// // }) => {
// //     // Calculate weekly average
// //     const weeklyAverage = weeklyStats.length > 0
// //         ? (weeklyStats.reduce((sum, day) => sum + day.rate, 0) / weeklyStats.length).toFixed(1)
// //         : '0';

// //     // Calculate monthly average
// //     const monthlyAverage = monthlyStats.length > 0
// //         ? (monthlyStats.reduce((sum, week) => sum + week.rate, 0) / monthlyStats.length).toFixed(1)
// //         : '0';

// //     // Calculate change from previous week
// //     const weeklyChange = weeklyStats.length >= 2
// //         ? (weeklyStats[weeklyStats.length - 1].rate - weeklyStats[0].rate).toFixed(1)
// //         : null;

// //     // Calculate change from previous month
// //     const monthlyChange = monthlyStats.length >= 2
// //         ? (monthlyStats[monthlyStats.length - 1].rate - monthlyStats[0].rate).toFixed(1)
// //         : null;

// //     // Best and worst days this week
// //     const bestDay = weeklyStats.length > 0
// //         ? weeklyStats.reduce((best, day) => day.rate > best.rate ? day : best, weeklyStats[0])
// //         : null;

// //     const worstDay = weeklyStats.length > 0
// //         ? weeklyStats.reduce((worst, day) => day.rate < worst.rate ? day : worst, weeklyStats[0])
// //         : null;

// //     // Best and worst weeks this month
// //     const bestWeek = monthlyStats.length > 0
// //         ? monthlyStats.reduce((best, week) => week.rate > best.rate ? week : best, monthlyStats[0])
// //         : null;

// //     const worstWeek = monthlyStats.length > 0
// //         ? monthlyStats.reduce((worst, week) => week.rate < worst.rate ? week : worst, monthlyStats[0])
// //         : null;

// //     // Classes needing attention
// //     const classesNeedingAttention = classSummaries
// //         .filter(cls => cls.averageRate < 75)
// //         .sort((a, b) => a.averageRate - b.averageRate);

// //     // School wide stats
// //     const schoolWideStats = classSummaries.length > 0 ? {
// //         totalStudents: classSummaries.reduce((sum, cls) => sum + (cls.totalStudents || 0), 0),
// //         averageAttendance: (classSummaries.reduce((sum, cls) => sum + cls.averageRate, 0) / classSummaries.length).toFixed(1),
// //         classesBelow70: classSummaries.filter(cls => cls.averageRate < 70).length,
// //         totalClasses: classSummaries.length
// //     } : null;

// //     return (
// //         <div className="space-y-6">
// //             {/* Week, Month, Term Summary Cards - All visible at once */}
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                 {/* WEEK CARD */}
// //                 <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between mb-3">
// //                         <Calendar className="w-8 h-8 opacity-80" />
// //                         {weeklyChange && (
// //                             <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(weeklyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
// //                                 {parseFloat(weeklyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
// //                                 {parseFloat(weeklyChange) >= 0 ? '+' : ''}{weeklyChange}%
// //                             </div>
// //                         )}
// //                     </div>
// //                     <p className="text-indigo-100 text-sm">THIS WEEK</p>
// //                     <p className="text-3xl font-bold mt-1">{weeklyAverage}%</p>
// //                     <p className="text-indigo-100 text-xs mt-2">Average Attendance</p>
// //                     {bestDay && (
// //                         <p className="text-indigo-100 text-xs mt-1">Best: {bestDay.day} ({bestDay.rate}%)</p>
// //                     )}
// //                     {worstDay && (
// //                         <p className="text-indigo-100 text-xs">Needs: {worstDay.day} ({worstDay.rate}%)</p>
// //                     )}
// //                 </div>

// //                 {/* MONTH CARD */}
// //                 <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between mb-3">
// //                         <Activity className="w-8 h-8 opacity-80" />
// //                         {monthlyChange && (
// //                             <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(monthlyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
// //                                 {parseFloat(monthlyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
// //                                 {parseFloat(monthlyChange) >= 0 ? '+' : ''}{monthlyChange}%
// //                             </div>
// //                         )}
// //                     </div>
// //                     <p className="text-emerald-100 text-sm">THIS MONTH</p>
// //                     <p className="text-3xl font-bold mt-1">{monthlyAverage}%</p>
// //                     <p className="text-emerald-100 text-xs mt-2">Average Attendance</p>
// //                     {bestWeek && (
// //                         <p className="text-emerald-100 text-xs mt-1">Best: {bestWeek.weekName} ({bestWeek.rate}%)</p>
// //                     )}
// //                     {worstWeek && (
// //                         <p className="text-emerald-100 text-xs">Needs: {worstWeek.weekName} ({worstWeek.rate}%)</p>
// //                     )}
// //                 </div>

// //                 {/* TERM CARD */}
// //                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between mb-3">
// //                         <School className="w-8 h-8 opacity-80" />
// //                     </div>
// //                     <p className="text-purple-100 text-sm">THIS TERM</p>
// //                     <p className="text-3xl font-bold mt-1">{termStats?.averageRate?.toFixed(1) || '0'}%</p>
// //                     <p className="text-purple-100 text-xs mt-2">Overall Average</p>
// //                     {termStats && (
// //                         <>
// //                             <p className="text-purple-100 text-xs mt-1">Highest: {termStats.highestRate}%</p>
// //                             <p className="text-purple-100 text-xs">Lowest: {termStats.lowestRate}%</p>
// //                         </>
// //                     )}
// //                 </div>
// //             </div>

// //             {/* School Wide Overview */}
// //             {schoolWideStats && (
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <div className="flex items-center gap-2 mb-4">
// //                         <School className="w-5 h-5 text-indigo-600" />
// //                         <h3 className="font-semibold text-slate-800">School Wide Overview</h3>
// //                     </div>
// //                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //                         <div className="text-center p-3 bg-slate-50 rounded-lg">
// //                             <p className="text-2xl font-bold text-indigo-600">{schoolWideStats.totalClasses}</p>
// //                             <p className="text-xs text-slate-600">Total Classes</p>
// //                         </div>
// //                         <div className="text-center p-3 bg-slate-50 rounded-lg">
// //                             <p className="text-2xl font-bold text-indigo-600">{schoolWideStats.totalStudents}</p>
// //                             <p className="text-xs text-slate-600">Total Students</p>
// //                         </div>
// //                         <div className="text-center p-3 bg-emerald-50 rounded-lg">
// //                             <p className="text-2xl font-bold text-emerald-600">{schoolWideStats.averageAttendance}%</p>
// //                             <p className="text-xs text-slate-600">School Average</p>
// //                         </div>
// //                         <div className="text-center p-3 bg-amber-50 rounded-lg">
// //                             <p className="text-2xl font-bold text-amber-600">{schoolWideStats.classesBelow70}</p>
// //                             <p className="text-xs text-slate-600">Classes Below 70%</p>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Weekly Trend */}
// //             {weeklyStats.length > 0 && (
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
// //                         <Calendar className="w-5 h-5 text-indigo-600" />
// //                         This Week's Attendance Trend
// //                     </h3>
// //                     <div className="grid grid-cols-7 gap-2">
// //                         {weeklyStats.map((day) => (
// //                             <div key={day.date} className="text-center">
// //                                 <div className="text-sm font-medium text-slate-600 mb-2">{day.day}</div>
// //                                 <div className="relative h-32 bg-slate-100 rounded-lg overflow-hidden group">
// //                                     <div
// //                                         className={`absolute bottom-0 w-full transition-all duration-500 ${day.rate >= 90 ? 'bg-emerald-500' :
// //                                             day.rate >= 75 ? 'bg-indigo-500' :
// //                                                 day.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
// //                                             }`}
// //                                         style={{ height: `${day.rate}%` }}
// //                                     />
// //                                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
// //                                         <span className="text-white text-xs font-bold">{day.rate}%</span>
// //                                     </div>
// //                                 </div>
// //                                 <div className="mt-2 text-sm font-semibold text-slate-700">{day.rate}%</div>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Monthly Trend */}
// //             {monthlyStats.length > 0 && (
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
// //                         <Activity className="w-5 h-5 text-indigo-600" />
// //                         This Month's Attendance Trend
// //                     </h3>
// //                     <div className="space-y-4">
// //                         {monthlyStats.map((week, idx) => (
// //                             <div key={idx}>
// //                                 <div className="flex justify-between mb-2">
// //                                     <span className="text-sm font-medium text-slate-700">{week.weekName}</span>
// //                                     <span className="text-sm font-bold text-indigo-600">{week.rate}%</span>
// //                                 </div>
// //                                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
// //                                     <div
// //                                         className={`h-full rounded-full ${week.rate >= 90 ? 'bg-emerald-500' :
// //                                             week.rate >= 75 ? 'bg-indigo-500' :
// //                                                 week.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
// //                                             }`}
// //                                         style={{ width: `${week.rate}%` }}
// //                                     />
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Classes Needing Attention */}
// //             {classesNeedingAttention.length > 0 && (
// //                 <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-6">
// //                     <div className="flex items-center gap-2 mb-4">
// //                         <AlertTriangle className="w-5 h-5 text-amber-600" />
// //                         <h3 className="font-semibold text-amber-800">Classes That Need More Attention</h3>
// //                         <span className="ml-auto text-sm text-amber-600">{classesNeedingAttention.length} classes below 75%</span>
// //                     </div>
// //                     <div className="space-y-3">
// //                         {classesNeedingAttention.map(cls => (
// //                             <div key={cls.classId} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
// //                                 <div>
// //                                     <p className="font-medium text-slate-800">{cls.className}</p>
// //                                     <p className="text-xs text-slate-500">{cls.totalStudents || 0} students</p>
// //                                 </div>
// //                                 <div className="text-right">
// //                                     <span className="text-lg font-bold text-amber-600">{cls.averageRate}%</span>
// //                                     <p className="text-xs text-amber-500">Needs improvement</p>
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Class Performance Summary */}
// //             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                 <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
// //                     <School className="w-5 h-5 text-indigo-600" />
// //                     All Classes Performance
// //                 </h3>
// //                 {loading ? (
// //                     <div className="text-center py-8 text-slate-500">Loading...</div>
// //                 ) : classSummaries.length > 0 ? (
// //                     <div className="space-y-4">
// //                         {classSummaries.map(cls => (
// //                             <div key={cls.classId}>
// //                                 <div className="flex items-center justify-between mb-1">
// //                                     <span className="text-sm font-medium text-slate-700">{cls.className}</span>
// //                                     <div className="flex items-center gap-2">
// //                                         <span className={`text-sm font-bold ${cls.averageRate >= 90 ? 'text-emerald-600' :
// //                                             cls.averageRate >= 75 ? 'text-indigo-600' :
// //                                                 cls.averageRate >= 60 ? 'text-amber-600' : 'text-red-600'
// //                                             }`}>
// //                                             {cls.averageRate}%
// //                                         </span>
// //                                         {cls.averageRate >= 90 && <Award className="w-4 h-4 text-emerald-500" />}
// //                                         {cls.averageRate < 70 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
// //                                     </div>
// //                                 </div>
// //                                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
// //                                     <div
// //                                         className={`h-full rounded-full ${cls.averageRate >= 90 ? 'bg-emerald-500' :
// //                                             cls.averageRate >= 75 ? 'bg-indigo-500' :
// //                                                 cls.averageRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
// //                                             }`}
// //                                         style={{ width: `${cls.averageRate}%` }}
// //                                     />
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 ) : (
// //                     <div className="text-center py-8 text-slate-500">No class data available</div>
// //                 )}
// //             </div>

// //             {/* Learners Needing Attention */}
// //             {needsImprovementStudents.length > 0 && (
// //                 <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-sm border border-red-200 p-6">
// //                     <div className="flex items-center gap-2 mb-4">
// //                         <Users className="w-5 h-5 text-red-600" />
// //                         <h3 className="font-semibold text-red-800">Learners That Need More Attention</h3>
// //                         <span className="ml-auto text-sm text-red-600">{needsImprovementStudents.length} students below 70%</span>
// //                     </div>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //                         {needsImprovementStudents.slice(0, 10).map((student) => (
// //                             <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
// //                                 <div>
// //                                     <p className="font-medium text-slate-800">{student.name}</p>
// //                                     <p className="text-xs text-slate-500">{student.examNumber}</p>
// //                                 </div>
// //                                 <div className="text-right">
// //                                     <span className="text-lg font-bold text-red-600">{student.attendanceRate}%</span>
// //                                     <p className="text-xs text-red-500">Absent: {student.absentCount} days</p>
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Student Lists - Best and Needs Improvement */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 {/* Best Attendance */}
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                         <div>
// //                             <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
// //                                 <Star className="w-5 h-5 text-emerald-600" />
// //                                 Best Attendance
// //                             </h3>
// //                             <p className="text-xs text-emerald-600">Students with ≥90% attendance</p>
// //                         </div>
// //                         {bestStudents.length > 5 && (
// //                             <button
// //                                 onClick={() => setShowAllBest(!showAllBest)}
// //                                 className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
// //                             >
// //                                 {showAllBest ? 'Show Less' : `View All (${bestStudents.length})`}
// //                             </button>
// //                         )}
// //                     </div>
// //                     {loading ? (
// //                         <div className="text-center py-8">Loading...</div>
// //                     ) : bestStudents.length > 0 ? (
// //                         <div className="space-y-2 max-h-96 overflow-y-auto">
// //                             {(showAllBest ? bestStudents : bestStudents.slice(0, 5)).map((student, index) => (
// //                                 <div key={student.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
// //                                     <div className="flex items-center gap-3">
// //                                         <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center">
// //                                             <span className="text-xs font-bold text-emerald-700">{index + 1}</span>
// //                                         </div>
// //                                         <div>
// //                                             <p className="font-medium text-emerald-800">{student.name}</p>
// //                                             <p className="text-xs text-emerald-600">{student.examNumber}</p>
// //                                         </div>
// //                                     </div>
// //                                     <div className="text-right">
// //                                         <span className="text-sm font-bold text-emerald-700">{student.attendanceRate}%</span>
// //                                     </div>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         <div className="text-center py-8 text-slate-500">No students with ≥90% attendance</div>
// //                     )}
// //                 </div>

// //                 {/* Needs Improvement Students */}
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                         <div>
// //                             <h3 className="font-semibold text-amber-800 flex items-center gap-2">
// //                                 <Target className="w-5 h-5 text-amber-600" />
// //                                 Needs Improvement
// //                             </h3>
// //                             <p className="text-xs text-amber-600">Students with &lt;70% attendance</p>
// //                         </div>
// //                         {needsImprovementStudents.length > 5 && (
// //                             <button
// //                                 onClick={() => setShowAllNeeds(!showAllNeeds)}
// //                                 className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
// //                             >
// //                                 {showAllNeeds ? 'Show Less' : `View All (${needsImprovementStudents.length})`}
// //                             </button>
// //                         )}
// //                     </div>
// //                     {loading ? (
// //                         <div className="text-center py-8">Loading...</div>
// //                     ) : needsImprovementStudents.length > 0 ? (
// //                         <div className="space-y-2 max-h-96 overflow-y-auto">
// //                             {(showAllNeeds ? needsImprovementStudents : needsImprovementStudents.slice(0, 5)).map((student, index) => (
// //                                 <div key={student.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
// //                                     <div className="flex items-center gap-3">
// //                                         <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center">
// //                                             <span className="text-xs font-bold text-amber-700">{index + 1}</span>
// //                                         </div>
// //                                         <div>
// //                                             <p className="font-medium text-amber-800">{student.name}</p>
// //                                             <p className="text-xs text-amber-600">{student.examNumber}</p>
// //                                         </div>
// //                                     </div>
// //                                     <div className="text-right">
// //                                         <span className="text-sm font-bold text-amber-700">{student.attendanceRate}%</span>
// //                                     </div>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         <div className="text-center py-8 text-slate-500">Great job! No students below 70%</div>
// //                     )}
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default OverviewTab;

// // // components/attendance/OverviewTab.tsx
// // // REMOVED DUPLICATES: Class averages were shown twice, weekly trend had redundant info
// // // Now each section shows UNIQUE information

// // import React from 'react';
// // import {
// //     TrendingUp,
// //     TrendingDown,
// //     Calendar,
// //     Award,
// //     AlertTriangle,
// //     CheckCircle,
// //     Clock,
// //     BarChart3,
// //     Users,
// //     School,
// //     Star,
// //     Target,
// //     ThumbsUp,
// //     ThumbsDown,
// //     Send
// // } from 'lucide-react';
// // import { ClassAttendanceSummary, WeeklyStats } from '@/services/attendanceService';

// // interface OverviewTabProps {
// //     loading: boolean;
// //     weeklyStats: WeeklyStats[];
// //     classSummaries: ClassAttendanceSummary[];
// //     bestStudents: any[];
// //     needsImprovementStudents: any[];
// //     showAllBest: boolean;
// //     setShowAllBest: (show: boolean) => void;
// //     showAllNeeds: boolean;
// //     setShowAllNeeds: (show: boolean) => void;
// //     selectedClass: string;
// // }

// // const OverviewTab: React.FC<OverviewTabProps> = ({
// //     loading,
// //     weeklyStats,
// //     classSummaries,
// //     bestStudents,
// //     needsImprovementStudents,
// //     showAllBest,
// //     setShowAllBest,
// //     showAllNeeds,
// //     setShowAllNeeds,
// //     selectedClass
// // }) => {
// //     // Calculate overall average from weekly stats
// //     const overallAverage = weeklyStats.length > 0
// //         ? (weeklyStats.reduce((sum, day) => sum + day.rate, 0) / weeklyStats.length).toFixed(1)
// //         : 0;

// //     // Find best and worst day from weekly stats
// //     const bestDay = weeklyStats.length > 0
// //         ? weeklyStats.reduce((best, day) => day.rate > best.rate ? day : best, weeklyStats[0])
// //         : null;

// //     const worstDay = weeklyStats.length > 0
// //         ? weeklyStats.reduce((worst, day) => day.rate < worst.rate ? day : worst, weeklyStats[0])
// //         : null;

// //     return (
// //         <div className="space-y-6">
// //             {/* Summary Cards - Now shows ONLY key metrics without duplication */}
// //             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //                 <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between">
// //                         <div>
// //                             <p className="text-indigo-100 text-sm">Weekly Average</p>
// //                             <p className="text-3xl font-bold mt-1">{overallAverage}%</p>
// //                             <p className="text-indigo-100 text-xs mt-2">Overall attendance rate</p>
// //                         </div>
// //                         <div className="bg-white/20 rounded-full p-3">
// //                             <BarChart3 className="w-6 h-6" />
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between">
// //                         <div>
// //                             <p className="text-emerald-100 text-sm">Peak Performance</p>
// //                             <p className="text-2xl font-bold mt-1">{bestDay?.day || 'N/A'}</p>
// //                             {bestDay && (
// //                                 <p className="text-emerald-100 text-xs mt-2">{bestDay.rate}% attendance</p>
// //                             )}
// //                         </div>
// //                         <div className="bg-white/20 rounded-full p-3">
// //                             <ThumbsUp className="w-6 h-6" />
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between">
// //                         <div>
// //                             <p className="text-amber-100 text-sm">Improvement Area</p>
// //                             <p className="text-2xl font-bold mt-1">{worstDay?.day || 'N/A'}</p>
// //                             {worstDay && (
// //                                 <p className="text-amber-100 text-xs mt-2">{worstDay.rate}% attendance</p>
// //                             )}
// //                         </div>
// //                         <div className="bg-white/20 rounded-full p-3">
// //                             <ThumbsDown className="w-6 h-6" />
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between">
// //                         <div>
// //                             <p className="text-purple-100 text-sm">Total Classes</p>
// //                             <p className="text-3xl font-bold mt-1">{classSummaries.length}</p>
// //                             <p className="text-purple-100 text-xs mt-2">Active this week</p>
// //                         </div>
// //                         <div className="bg-white/20 rounded-full p-3">
// //                             <School className="w-6 h-6" />
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>

// //             {/* Weekly Trend - Main visualization for Overview */}
// //             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                 <div className="flex items-center justify-between mb-6">
// //                     <div>
// //                         <h3 className="font-semibold text-slate-800 flex items-center gap-2">
// //                             <Calendar className="w-5 h-5 text-indigo-600" />
// //                             Weekly Attendance Trend
// //                         </h3>
// //                         <p className="text-sm text-slate-500 mt-1">Day-by-day breakdown for this week</p>
// //                     </div>
// //                 </div>

// //                 {loading ? (
// //                     <div className="text-center py-8 text-slate-500">Loading weekly stats...</div>
// //                 ) : weeklyStats.length > 0 ? (
// //                     <div className="grid grid-cols-7 gap-2">
// //                         {weeklyStats.map((day) => (
// //                             <div key={day.date} className="text-center">
// //                                 <div className="text-sm font-medium text-slate-600 mb-2">{day.day}</div>
// //                                 <div className="relative h-32 bg-slate-100 rounded-lg overflow-hidden group">
// //                                     <div
// //                                         className={`absolute bottom-0 w-full transition-all duration-500 ${day.rate >= 90 ? 'bg-emerald-500' :
// //                                             day.rate >= 75 ? 'bg-indigo-500' :
// //                                                 day.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
// //                                             }`}
// //                                         style={{ height: `${day.rate}%` }}
// //                                     />
// //                                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
// //                                         <span className="text-white text-xs font-bold">{day.rate}%</span>
// //                                     </div>
// //                                 </div>
// //                                 <div className="mt-2 text-sm font-semibold text-slate-700">{day.rate}%</div>
// //                                 <div className="text-xs text-slate-400 mt-1">
// //                                     {day.present || 0}/{day.total || 0}
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 ) : (
// //                     <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
// //                         <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
// //                         <p>{selectedClass !== 'all' ? 'No weekly attendance data available' : 'Select a class to view weekly attendance trends'}</p>
// //                     </div>
// //                 )}
// //             </div>

// //             {/* Class Performance - Now shows ONLY classes without duplication */}
// //             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                 <div className="flex items-center justify-between mb-6">
// //                     <div>
// //                         <h3 className="font-semibold text-slate-800 flex items-center gap-2">
// //                             <School className="w-5 h-5 text-indigo-600" />
// //                             Class Performance
// //                         </h3>
// //                         <p className="text-sm text-slate-500 mt-1">Current average attendance by class</p>
// //                     </div>
// //                 </div>

// //                 {loading ? (
// //                     <div className="text-center py-8 text-slate-500">Loading class averages...</div>
// //                 ) : classSummaries.length > 0 ? (
// //                     <div className="space-y-4">
// //                         {classSummaries.map(cls => (
// //                             <div key={cls.classId} className="group">
// //                                 <div className="flex items-center justify-between mb-1">
// //                                     <span className="text-sm font-medium text-slate-700">{cls.className}</span>
// //                                     <div className="flex items-center gap-2">
// //                                         <span className={`text-sm font-bold ${cls.averageRate >= 90 ? 'text-emerald-600' :
// //                                             cls.averageRate >= 75 ? 'text-indigo-600' :
// //                                                 cls.averageRate >= 60 ? 'text-amber-600' : 'text-red-600'
// //                                             }`}>
// //                                             {cls.averageRate}%
// //                                         </span>
// //                                         {cls.averageRate >= 90 && <Award className="w-4 h-4 text-emerald-500" />}
// //                                         {cls.averageRate < 70 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
// //                                     </div>
// //                                 </div>
// //                                 <div className="flex items-center gap-4">
// //                                     <div className="flex-1">
// //                                         <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
// //                                             <div
// //                                                 className={`h-full rounded-full transition-all duration-500 ${cls.averageRate >= 90 ? 'bg-emerald-500' :
// //                                                     cls.averageRate >= 75 ? 'bg-indigo-500' :
// //                                                         cls.averageRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
// //                                                     }`}
// //                                                 style={{ width: `${cls.averageRate}%` }}
// //                                             />
// //                                         </div>
// //                                     </div>
// //                                     <div className="text-xs text-slate-400 min-w-[80px] text-right">
// //                                         {cls.totalStudents || 0} students
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 ) : (
// //                     <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
// //                         <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
// //                         <p>No class data available</p>
// //                     </div>
// //                 )}
// //             </div>

// //             {/* Student Lists - UNIQUE to OverviewTab (PatternsTab doesn't have this) */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 {/* Best Attendance */}
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                         <div>
// //                             <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
// //                                 <Star className="w-5 h-5 text-emerald-600" />
// //                                 Top Performers
// //                             </h3>
// //                             <p className="text-xs text-emerald-600 mt-1">Students with ≥90% attendance</p>
// //                         </div>
// //                         {bestStudents.length > 5 && (
// //                             <button
// //                                 onClick={() => setShowAllBest(!showAllBest)}
// //                                 className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
// //                             >
// //                                 {showAllBest ? 'Show Less' : `View All (${bestStudents.length})`}
// //                             </button>
// //                         )}
// //                     </div>

// //                     {loading ? (
// //                         <div className="text-center py-8 text-slate-500">Loading...</div>
// //                     ) : bestStudents.length > 0 ? (
// //                         <div className="space-y-2 max-h-96 overflow-y-auto">
// //                             {(showAllBest ? bestStudents : bestStudents.slice(0, 5)).map((student, index) => (
// //                                 <div key={student.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
// //                                     <div className="flex items-center gap-3">
// //                                         <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center">
// //                                             <span className="text-xs font-bold text-emerald-700">{index + 1}</span>
// //                                         </div>
// //                                         <div>
// //                                             <p className="font-medium text-emerald-800">{student.name}</p>
// //                                             <p className="text-xs text-emerald-600">{student.examNumber}</p>
// //                                         </div>
// //                                     </div>
// //                                     <div className="text-right">
// //                                         <span className="text-sm font-bold text-emerald-700">{student.attendanceRate}%</span>
// //                                         <div className="text-xs text-emerald-500 mt-0.5">
// //                                             {student.presentCount || 0}/{student.totalDays || 0} days
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
// //                             <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
// //                             <p>No students with ≥90% attendance</p>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {/* Needs Improvement */}
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                         <div>
// //                             <h3 className="font-semibold text-amber-800 flex items-center gap-2">
// //                                 <Target className="w-5 h-5 text-amber-600" />
// //                                 Needs Attention
// //                             </h3>
// //                             <p className="text-xs text-amber-600 mt-1">Students with &lt;70% attendance</p>
// //                         </div>
// //                         {needsImprovementStudents.length > 5 && (
// //                             <button
// //                                 onClick={() => setShowAllNeeds(!showAllNeeds)}
// //                                 className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
// //                             >
// //                                 {showAllNeeds ? 'Show Less' : `View All (${needsImprovementStudents.length})`}
// //                             </button>
// //                         )}
// //                     </div>

// //                     {loading ? (
// //                         <div className="text-center py-8 text-slate-500">Loading...</div>
// //                     ) : needsImprovementStudents.length > 0 ? (
// //                         <div className="space-y-2 max-h-96 overflow-y-auto">
// //                             {(showAllNeeds ? needsImprovementStudents : needsImprovementStudents.slice(0, 5)).map((student, index) => (
// //                                 <div key={student.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
// //                                     <div className="flex items-center gap-3">
// //                                         <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center">
// //                                             <span className="text-xs font-bold text-amber-700">{index + 1}</span>
// //                                         </div>
// //                                         <div>
// //                                             <p className="font-medium text-amber-800">{student.name}</p>
// //                                             <p className="text-xs text-amber-600">{student.examNumber}</p>
// //                                         </div>
// //                                     </div>
// //                                     <div className="text-right">
// //                                         <span className="text-sm font-bold text-amber-700">{student.attendanceRate}%</span>
// //                                         <div className="text-xs text-amber-500 mt-0.5">
// //                                             Missing {student.absentCount || 0} days
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
// //                             <ThumbsUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
// //                             <p>Great job! No students with &lt;70% attendance</p>
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default OverviewTab;

// // // components/attendance/OverviewTab.tsx
// // import React from 'react';
// // import {
// //     TrendingUp,
// //     TrendingDown,
// //     Calendar,
// //     Award,
// //     AlertTriangle,
// //     CheckCircle,
// //     Clock,
// //     BarChart3,
// //     Users,
// //     School,
// //     Star,
// //     Target,
// //     ThumbsUp,
// //     ThumbsDown
// // } from 'lucide-react';
// // import { ClassAttendanceSummary, WeeklyStats } from '@/services/attendanceService';

// // interface OverviewTabProps {
// //     loading: boolean;
// //     weeklyStats: WeeklyStats[];
// //     classSummaries: ClassAttendanceSummary[];
// //     bestStudents: any[];
// //     needsImprovementStudents: any[];
// //     showAllBest: boolean;
// //     setShowAllBest: (show: boolean) => void;
// //     showAllNeeds: boolean;
// //     setShowAllNeeds: (show: boolean) => void;
// //     selectedClass: string;
// // }

// // const OverviewTab: React.FC<OverviewTabProps> = ({
// //     loading,
// //     weeklyStats,
// //     classSummaries,
// //     bestStudents,
// //     needsImprovementStudents,
// //     showAllBest,
// //     setShowAllBest,
// //     showAllNeeds,
// //     setShowAllNeeds,
// //     selectedClass
// // }) => {
// //     // Calculate overall average from weekly stats
// //     const overallAverage = weeklyStats.length > 0
// //         ? (weeklyStats.reduce((sum, day) => sum + day.rate, 0) / weeklyStats.length).toFixed(1)
// //         : 0;

// //     // Find best and worst day from weekly stats
// //     const bestDay = weeklyStats.length > 0
// //         ? weeklyStats.reduce((best, day) => day.rate > best.rate ? day : best, weeklyStats[0])
// //         : null;

// //     const worstDay = weeklyStats.length > 0
// //         ? weeklyStats.reduce((worst, day) => day.rate < worst.rate ? day : worst, weeklyStats[0])
// //         : null;

// //     // Calculate overall class average
// //     const classOverallAverage = classSummaries.length > 0
// //         ? (classSummaries.reduce((sum, cls) => sum + cls.averageRate, 0) / classSummaries.length).toFixed(1)
// //         : 0;

// //     // Find best and worst performing class
// //     const bestClass = classSummaries.length > 0
// //         ? classSummaries.reduce((best, cls) => cls.averageRate > best.averageRate ? cls : best, classSummaries[0])
// //         : null;

// //     const worstClass = classSummaries.length > 0
// //         ? classSummaries.reduce((worst, cls) => cls.averageRate < worst.averageRate ? cls : worst, classSummaries[0])
// //         : null;

// //     return (
// //         <div className="space-y-6">
// //             {/* Summary Cards - New */}
// //             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //                 <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between">
// //                         <div>
// //                             <p className="text-indigo-100 text-sm">Overall Attendance</p>
// //                             <p className="text-3xl font-bold mt-1">{overallAverage}%</p>
// //                             {bestDay && (
// //                                 <p className="text-indigo-100 text-xs mt-2">Best day: {bestDay.day} ({bestDay.rate}%)</p>
// //                             )}
// //                         </div>
// //                         <div className="bg-white/20 rounded-full p-3">
// //                             <BarChart3 className="w-6 h-6" />
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between">
// //                         <div>
// //                             <p className="text-emerald-100 text-sm">Best Day This Week</p>
// //                             <p className="text-3xl font-bold mt-1">{bestDay?.day || 'N/A'}</p>
// //                             {bestDay && (
// //                                 <p className="text-emerald-100 text-xs mt-2">{bestDay.rate}% attendance</p>
// //                             )}
// //                         </div>
// //                         <div className="bg-white/20 rounded-full p-3">
// //                             <ThumbsUp className="w-6 h-6" />
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between">
// //                         <div>
// //                             <p className="text-amber-100 text-sm">Needs Improvement Day</p>
// //                             <p className="text-3xl font-bold mt-1">{worstDay?.day || 'N/A'}</p>
// //                             {worstDay && (
// //                                 <p className="text-amber-100 text-xs mt-2">{worstDay.rate}% attendance</p>
// //                             )}
// //                         </div>
// //                         <div className="bg-white/20 rounded-full p-3">
// //                             <ThumbsDown className="w-6 h-6" />
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
// //                     <div className="flex items-center justify-between">
// //                         <div>
// //                             <p className="text-purple-100 text-sm">Classes Average</p>
// //                             <p className="text-3xl font-bold mt-1">{classOverallAverage}%</p>
// //                             {bestClass && (
// //                                 <p className="text-purple-100 text-xs mt-2">Top: {bestClass.className}</p>
// //                             )}
// //                         </div>
// //                         <div className="bg-white/20 rounded-full p-3">
// //                             <School className="w-6 h-6" />
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>

// //             {/* Weekly Summary - Enhanced */}
// //             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                 <div className="flex items-center justify-between mb-6">
// //                     <div>
// //                         <h3 className="font-semibold text-slate-800 flex items-center gap-2">
// //                             <Calendar className="w-5 h-5 text-indigo-600" />
// //                             This Week's Attendance Trend
// //                         </h3>
// //                         <p className="text-sm text-slate-500 mt-1">Daily attendance rates for the current week</p>
// //                     </div>
// //                     {weeklyStats.length > 0 && (
// //                         <div className="text-sm text-slate-500">
// //                             Average: <span className="font-bold text-indigo-600">{overallAverage}%</span>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {loading ? (
// //                     <div className="text-center py-8 text-slate-500">Loading weekly stats...</div>
// //                 ) : weeklyStats.length > 0 ? (
// //                     <>
// //                         <div className="grid grid-cols-7 gap-2">
// //                             {weeklyStats.map((day) => (
// //                                 <div key={day.date} className="text-center">
// //                                     <div className="text-sm font-medium text-slate-600 mb-2">{day.day}</div>
// //                                     <div className="relative h-32 bg-slate-100 rounded-lg overflow-hidden group">
// //                                         <div
// //                                             className={`absolute bottom-0 w-full transition-all duration-500 ${day.rate >= 90 ? 'bg-emerald-500' :
// //                                                     day.rate >= 75 ? 'bg-indigo-500' :
// //                                                         day.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
// //                                                 }`}
// //                                             style={{ height: `${day.rate}%` }}
// //                                         />
// //                                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
// //                                             <span className="text-white text-xs font-bold">{day.rate}%</span>
// //                                         </div>
// //                                     </div>
// //                                     <div className="mt-2 text-sm font-semibold text-slate-700">{day.rate}%</div>
// //                                     <div className="text-xs text-slate-400 mt-1">
// //                                         {day.present || 0}/{day.total || 0}
// //                                     </div>
// //                                 </div>
// //                             ))}
// //                         </div>

// //                         {/* Trend Analysis */}
// //                         <div className="mt-6 pt-4 border-t border-slate-100">
// //                             <div className="flex flex-wrap gap-4 justify-between items-center">
// //                                 <div className="flex items-center gap-4">
// //                                     <div className="flex items-center gap-2">
// //                                         <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
// //                                         <span className="text-xs text-slate-600">Excellent (≥90%)</span>
// //                                     </div>
// //                                     <div className="flex items-center gap-2">
// //                                         <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
// //                                         <span className="text-xs text-slate-600">Good (75-89%)</span>
// //                                     </div>
// //                                     <div className="flex items-center gap-2">
// //                                         <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
// //                                         <span className="text-xs text-slate-600">Fair (60-74%)</span>
// //                                     </div>
// //                                     <div className="flex items-center gap-2">
// //                                         <div className="w-3 h-3 bg-red-500 rounded-full"></div>
// //                                         <span className="text-xs text-slate-600">Poor (&lt;60%)</span>
// //                                     </div>
// //                                 </div>
// //                                 {bestDay && worstDay && (
// //                                     <div className="text-xs text-slate-500">
// //                                         <span className="text-emerald-600">↑ Best: {bestDay.day}</span>
// //                                         <span className="mx-2">•</span>
// //                                         <span className="text-red-600">↓ Needs: {worstDay.day}</span>
// //                                     </div>
// //                                 )}
// //                             </div>
// //                         </div>
// //                     </>
// //                 ) : (
// //                     <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
// //                         <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
// //                         <p>{selectedClass !== 'all' ? 'No weekly attendance data available' : 'Select a class to view weekly attendance trends'}</p>
// //                     </div>
// //                 )}
// //             </div>

// //             {/* Class Averages - Enhanced */}
// //             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                 <div className="flex items-center justify-between mb-6">
// //                     <div>
// //                         <h3 className="font-semibold text-slate-800 flex items-center gap-2">
// //                             <School className="w-5 h-5 text-indigo-600" />
// //                             Class Performance Overview
// //                         </h3>
// //                         <p className="text-sm text-slate-500 mt-1">Average attendance rates by class</p>
// //                     </div>
// //                     {classSummaries.length > 0 && (
// //                         <div className="text-sm text-slate-500">
// //                             Average: <span className="font-bold text-indigo-600">{classOverallAverage}%</span>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {loading ? (
// //                     <div className="text-center py-8 text-slate-500">Loading class averages...</div>
// //                 ) : classSummaries.length > 0 ? (
// //                     <div className="space-y-4">
// //                         {classSummaries.map(cls => (
// //                             <div key={cls.classId} className="group">
// //                                 <div className="flex items-center justify-between mb-1">
// //                                     <span className="text-sm font-medium text-slate-700">{cls.className}</span>
// //                                     <div className="flex items-center gap-2">
// //                                         <span className={`text-sm font-bold ${cls.averageRate >= 90 ? 'text-emerald-600' :
// //                                                 cls.averageRate >= 75 ? 'text-indigo-600' :
// //                                                     cls.averageRate >= 60 ? 'text-amber-600' : 'text-red-600'
// //                                             }`}>
// //                                             {cls.averageRate}%
// //                                         </span>
// //                                         {cls.averageRate >= 90 && <Award className="w-4 h-4 text-emerald-500" />}
// //                                         {cls.averageRate < 70 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
// //                                     </div>
// //                                 </div>
// //                                 <div className="flex items-center gap-4">
// //                                     <div className="flex-1">
// //                                         <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
// //                                             <div
// //                                                 className={`h-full rounded-full transition-all duration-500 ${cls.averageRate >= 90 ? 'bg-emerald-500' :
// //                                                         cls.averageRate >= 75 ? 'bg-indigo-500' :
// //                                                             cls.averageRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
// //                                                     }`}
// //                                                 style={{ width: `${cls.averageRate}%` }}
// //                                             />
// //                                         </div>
// //                                     </div>
// //                                     <div className="text-xs text-slate-400 min-w-[80px] text-right">
// //                                         {cls.totalStudents || 0} students
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 ) : (
// //                     <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
// //                         <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
// //                         <p>No class data available</p>
// //                     </div>
// //                 )}
// //             </div>

// //             {/* Top/Bottom Performers - Enhanced */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 {/* Best Attendance */}
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                         <div>
// //                             <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
// //                                 <Star className="w-5 h-5 text-emerald-600" />
// //                                 Top Performers
// //                             </h3>
// //                             <p className="text-xs text-emerald-600 mt-1">Students with ≥90% attendance</p>
// //                         </div>
// //                         {bestStudents.length > 5 && (
// //                             <button
// //                                 onClick={() => setShowAllBest(!showAllBest)}
// //                                 className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
// //                             >
// //                                 {showAllBest ? 'Show Less' : `View All (${bestStudents.length})`}
// //                             </button>
// //                         )}
// //                     </div>

// //                     {loading ? (
// //                         <div className="text-center py-8 text-slate-500">Loading...</div>
// //                     ) : bestStudents.length > 0 ? (
// //                         <div className="space-y-2 max-h-96 overflow-y-auto">
// //                             {(showAllBest ? bestStudents : bestStudents.slice(0, 5)).map((student, index) => (
// //                                 <div key={student.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
// //                                     <div className="flex items-center gap-3">
// //                                         <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center">
// //                                             <span className="text-xs font-bold text-emerald-700">{index + 1}</span>
// //                                         </div>
// //                                         <div>
// //                                             <p className="font-medium text-emerald-800">{student.name}</p>
// //                                             <p className="text-xs text-emerald-600">{student.examNumber}</p>
// //                                         </div>
// //                                     </div>
// //                                     <div className="text-right">
// //                                         <span className="text-sm font-bold text-emerald-700">{student.attendanceRate}%</span>
// //                                         <div className="text-xs text-emerald-500 mt-0.5">
// //                                             {student.presentCount || 0}/{student.totalDays || 0} days
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
// //                             <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
// //                             <p>No students with ≥90% attendance</p>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {/* Needs Improvement */}
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                         <div>
// //                             <h3 className="font-semibold text-amber-800 flex items-center gap-2">
// //                                 <Target className="w-5 h-5 text-amber-600" />
// //                                 Needs Attention
// //                             </h3>
// //                             <p className="text-xs text-amber-600 mt-1">Students with &lt;70% attendance</p>
// //                         </div>
// //                         {needsImprovementStudents.length > 5 && (
// //                             <button
// //                                 onClick={() => setShowAllNeeds(!showAllNeeds)}
// //                                 className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
// //                             >
// //                                 {showAllNeeds ? 'Show Less' : `View All (${needsImprovementStudents.length})`}
// //                             </button>
// //                         )}
// //                     </div>

// //                     {loading ? (
// //                         <div className="text-center py-8 text-slate-500">Loading...</div>
// //                     ) : needsImprovementStudents.length > 0 ? (
// //                         <div className="space-y-2 max-h-96 overflow-y-auto">
// //                             {(showAllNeeds ? needsImprovementStudents : needsImprovementStudents.slice(0, 5)).map((student, index) => (
// //                                 <div key={student.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
// //                                     <div className="flex items-center gap-3">
// //                                         <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center">
// //                                             <span className="text-xs font-bold text-amber-700">{index + 1}</span>
// //                                         </div>
// //                                         <div>
// //                                             <p className="font-medium text-amber-800">{student.name}</p>
// //                                             <p className="text-xs text-amber-600">{student.examNumber}</p>
// //                                         </div>
// //                                     </div>
// //                                     <div className="text-right">
// //                                         <span className="text-sm font-bold text-amber-700">{student.attendanceRate}%</span>
// //                                         <div className="text-xs text-amber-500 mt-0.5">
// //                                             Missing {student.absentCount || 0} days
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
// //                             <ThumbsUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
// //                             <p>Great job! No students with &lt;70% attendance</p>
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default OverviewTab;

// // // components/attendance/OverviewTab.tsx
// // import React from 'react';
// // import { TrendingUp, TrendingDown } from 'lucide-react';
// // import { ClassAttendanceSummary, WeeklyStats } from '@/services/attendanceService';


// // interface OverviewTabProps {
// //     loading: boolean;
// //     weeklyStats: WeeklyStats[];
// //     classSummaries: ClassAttendanceSummary[];
// //     bestStudents: any[];
// //     needsImprovementStudents: any[];
// //     showAllBest: boolean;
// //     setShowAllBest: (show: boolean) => void;
// //     showAllNeeds: boolean;
// //     setShowAllNeeds: (show: boolean) => void;
// //     selectedClass: string;
// // }

// // const OverviewTab: React.FC<OverviewTabProps> = ({
// //     loading,
// //     weeklyStats,
// //     classSummaries,
// //     bestStudents,
// //     needsImprovementStudents,
// //     showAllBest,
// //     setShowAllBest,
// //     showAllNeeds,
// //     setShowAllNeeds,
// //     selectedClass
// // }) => {
// //     return (
// //         <div className="space-y-6">
// //             {/* Weekly Summary */}
// //             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                 <h3 className="font-semibold text-slate-800 mb-4">This Week's Attendance</h3>
// //                 {loading ? (
// //                     <div className="text-center py-8 text-slate-500">Loading weekly stats...</div>
// //                 ) : weeklyStats.length > 0 ? (
// //                     <div className="grid grid-cols-7 gap-2">
// //                         {weeklyStats.map((day) => (
// //                             <div key={day.date} className="text-center">
// //                                 <div className="text-sm font-medium text-slate-600 mb-2">{day.day}</div>
// //                                 <div className="relative h-24 bg-slate-100 rounded-lg overflow-hidden">
// //                                     <div
// //                                         className="absolute bottom-0 w-full bg-indigo-600 transition-all"
// //                                         style={{ height: `${day.rate}%` }}
// //                                     />
// //                                 </div>
// //                                 <div className="mt-2 text-sm font-semibold text-slate-700">{day.rate}%</div>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 ) : (
// //                     <div className="text-center py-8 text-slate-500">
// //                         {selectedClass !== 'all' ? 'No weekly data available' : 'Select a class to view weekly stats'}
// //                     </div>
// //                 )}
// //             </div>

// //             {/* Class Averages */}
// //             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                 <h3 className="font-semibold text-slate-800 mb-4">Class Attendance Averages</h3>
// //                 {loading ? (
// //                     <div className="text-center py-4 text-slate-500">Loading class averages...</div>
// //                 ) : classSummaries.length > 0 ? (
// //                     <div className="space-y-3">
// //                         {classSummaries.slice(0, 5).map(cls => (
// //                             <div key={cls.classId} className="flex items-center gap-4">
// //                                 <span className="w-32 text-sm font-medium text-slate-600">{cls.className}</span>
// //                                 <div className="flex-1">
// //                                     <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
// //                                         <div
// //                                             className="h-full bg-indigo-600 rounded-full"
// //                                             style={{ width: `${cls.averageRate}%` }}
// //                                         />
// //                                     </div>
// //                                 </div>
// //                                 <span className="text-sm font-medium text-slate-800">{cls.averageRate}%</span>
// //                             </div>
// //                         ))}
// //                     </div>
// //                 ) : (
// //                     <div className="text-center py-4 text-slate-500">No class data available</div>
// //                 )}
// //             </div>

// //             {/* Top/Bottom Performers */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 {/* Best Attendance */}
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                         <h3 className="font-semibold text-green-800 flex items-center gap-2">
// //                             <TrendingUp className="w-5 h-5 text-green-600" />
// //                             Best Attendance (≥90%)
// //                         </h3>
// //                         {bestStudents.length > 5 && (
// //                             <button
// //                                 onClick={() => setShowAllBest(!showAllBest)}
// //                                 className="text-sm text-indigo-600 hover:text-indigo-800"
// //                             >
// //                                 {showAllBest ? 'Show Less' : `See All (${bestStudents.length})`}
// //                             </button>
// //                         )}
// //                     </div>
// //                     {loading ? (
// //                         <div className="text-center py-4 text-slate-500">Loading...</div>
// //                     ) : bestStudents.length > 0 ? (
// //                         <div className="space-y-3 max-h-80 overflow-y-auto">
// //                             {(showAllBest ? bestStudents : bestStudents.slice(0, 5)).map(student => (
// //                                 <div key={student.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
// //                                     <div>
// //                                         <p className="font-medium text-green-800">{student.name}</p>
// //                                         <p className="text-xs text-green-600">{student.examNumber}</p>
// //                                     </div>
// //                                     <span className="text-sm font-bold text-green-700">{student.attendanceRate}%</span>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         <div className="text-center py-4 text-slate-500">
// //                             No students with ≥90% attendance
// //                         </div>
// //                     )}
// //                 </div>

// //                 {/* Needs Improvement */}
// //                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                         <h3 className="font-semibold text-red-800 flex items-center gap-2">
// //                             <TrendingDown className="w-5 h-5 text-red-600" />
// //                             Needs Improvement (&lt;70%)
// //                         </h3>
// //                         {needsImprovementStudents.length > 5 && (
// //                             <button
// //                                 onClick={() => setShowAllNeeds(!showAllNeeds)}
// //                                 className="text-sm text-indigo-600 hover:text-indigo-800"
// //                             >
// //                                 {showAllNeeds ? 'Show Less' : `See All (${needsImprovementStudents.length})`}
// //                             </button>
// //                         )}
// //                     </div>
// //                     {loading ? (
// //                         <div className="text-center py-4 text-slate-500">Loading...</div>
// //                     ) : needsImprovementStudents.length > 0 ? (
// //                         <div className="space-y-3 max-h-80 overflow-y-auto">
// //                             {(showAllNeeds ? needsImprovementStudents : needsImprovementStudents.slice(0, 5)).map(student => (
// //                                 <div key={student.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
// //                                     <div>
// //                                         <p className="font-medium text-red-800">{student.name}</p>
// //                                         <p className="text-xs text-red-600">{student.examNumber}</p>
// //                                     </div>
// //                                     <span className="text-sm font-bold text-red-700">{student.attendanceRate}%</span>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         <div className="text-center py-4 text-slate-500">
// //                             No students with &lt;70% attendance
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default OverviewTab;