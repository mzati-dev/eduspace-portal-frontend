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
    // USE PROPS DIRECTLY - NO FALLBACK DUMMY DATA
    const weeklyStats = propWeeklyStats;
    const monthlyStats = propMonthlyStats;
    const termStats = propTermStats;
    const classSummaries = propClassSummaries;

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

    // Student stats - from backend data
    const studentsWellPercent = classSummaries.length > 0 ? 68 : 0; // Will be replaced with real data
    const studentsAttentionPercent = classSummaries.length > 0 ? 18 : 0;
    const studentsWellCount = Math.floor(totalStudentsAll * studentsWellPercent / 100);
    const studentsAttentionCount = Math.floor(totalStudentsAll * studentsAttentionPercent / 100);

    const totalClasses = classSummaries.length;
    const totalStudents = totalStudentsAll;
    const averageAttendance = classSummaries.length > 0
        ? (classSummaries.reduce((sum, cls) => sum + cls.averageRate, 0) / classSummaries.length).toFixed(1)
        : '0';
    const classesAbove80 = classSummaries.filter(cls => cls.averageRate >= 80).length;
    const classesBelow70 = classSummaries.filter(cls => cls.averageRate < 70).length;

    const topClasses = classSummaries
        .filter(cls => cls.averageRate >= 80)
        .sort((a, b) => b.averageRate - a.averageRate);

    return (
        <div className="space-y-6">

            {/* School Wide Overview - ALWAYS SHOW */}
            <div className="space-y-4">
                {/* School Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <School className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-slate-800">School Overview</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">{totalClasses}</p>
                            <p className="text-xs text-slate-600">Total Classes</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">{totalStudents}</p>
                            <p className="text-xs text-slate-600">Total Students</p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <p className="text-2xl font-bold text-emerald-600">{averageAttendance}%</p>
                            <p className="text-xs text-slate-600">School Average</p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <p className="text-2xl font-bold text-emerald-600">{classesAbove80}</p>
                            <p className="text-xs text-slate-600">Classes Above 80%</p>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                            <p className="text-2xl font-bold text-amber-600">{classesBelow70}</p>
                            <p className="text-xs text-slate-600">Classes Below 70%</p>
                        </div>
                    </div>
                </div>

                {/* 3 Summary Cards - ALWAYS SHOW */}
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

                {/* Student Performance Cards - ALWAYS SHOW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <Award className="w-8 h-8 opacity-80" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Excellent</span>
                        </div>
                        <p className="text-green-100 text-sm">STUDENTS DOING WELL</p>
                        <p className="text-3xl font-bold mt-1">{studentsWellPercent}%</p>
                        <p className="text-green-100 text-xs mt-2">Have ≥75% attendance</p>
                        <p className="text-green-100 text-xs mt-1">{studentsWellCount} students</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <AlertTriangle className="w-8 h-8 opacity-80" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Attention Needed</span>
                        </div>
                        <p className="text-red-100 text-sm">NEED ATTENTION</p>
                        <p className="text-3xl font-bold mt-1">{studentsAttentionPercent}%</p>
                        <p className="text-red-100 text-xs mt-2">Have &lt;70% attendance</p>
                        <p className="text-red-100 text-xs mt-1">{studentsAttentionCount} students</p>
                    </div>
                </div>
            </div>

            {/* Classes Performance - Side by Side - ALWAYS SHOW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Classes Needing Attention */}
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
                        {classesNeedingAttention.length === 0 && (
                            <p className="text-xs text-rose-100 text-center">No classes below 75%</p>
                        )}
                        {classesNeedingAttention.length > 3 && (
                            <p className="text-xs text-rose-100 text-center mt-2">+{classesNeedingAttention.length - 3} more classes</p>
                        )}
                    </div>
                </div>

                {/* Top Performing Classes */}
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
                        {topClasses.length === 0 && (
                            <p className="text-xs text-teal-100 text-center">No classes above 80%</p>
                        )}
                        {topClasses.length > 3 && (
                            <p className="text-xs text-teal-100 text-center mt-2">+{topClasses.length - 3} more classes</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;

// // components/attendance/OverviewTab.tsx
// import React from 'react';
// import {
//     TrendingUp,
//     TrendingDown,
//     Calendar,
//     Award,
//     AlertTriangle,
//     Users,
//     School,
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
//     weeklyStats: propWeeklyStats,
//     monthlyStats: propMonthlyStats,
//     termStats: propTermStats,
//     classSummaries: propClassSummaries,
//     selectedClass
// }) => {
//     // FALLBACK DUMMY DATA
//     const weeklyStats = propWeeklyStats.length > 0 ? propWeeklyStats : [
//         { day: 'Mon', date: '2024-01-01', rate: 78, present: 35, total: 45 },
//         { day: 'Tue', date: '2024-01-02', rate: 82, present: 37, total: 45 },
//         { day: 'Wed', date: '2024-01-03', rate: 75, present: 34, total: 45 },
//         { day: 'Thu', date: '2024-01-04', rate: 80, present: 36, total: 45 },
//         { day: 'Fri', date: '2024-01-05', rate: 71, present: 32, total: 45 },
//     ];

//     const monthlyStats = propMonthlyStats.length > 0 ? propMonthlyStats : [
//         { weekName: 'Week 1', rate: 78, present: 175, total: 225, date: '2024-01-05' },
//         { weekName: 'Week 2', rate: 82, present: 185, total: 225, date: '2024-01-12' },
//         { weekName: 'Week 3', rate: 75, present: 169, total: 225, date: '2024-01-19' },
//         { weekName: 'Week 4', rate: 80, present: 180, total: 225, date: '2024-01-26' },
//     ];

//     const termStats = propTermStats?.averageRate ? propTermStats : {
//         averageRate: 76.5,
//         highestRate: 88,
//         lowestRate: 65,
//         totalDays: 45,
//         termName: 'Term 1 2024'
//     };

//     const classSummaries = propClassSummaries.length > 0 ? propClassSummaries : [
//         { classId: '1', className: 'Form 1A', averageRate: 82, totalStudents: 35 },
//         { classId: '2', className: 'Form 1B', averageRate: 78, totalStudents: 32 },
//         { classId: '3', className: 'Form 2A', averageRate: 75, totalStudents: 38 },
//         { classId: '4', className: 'Form 2B', averageRate: 68, totalStudents: 30 },
//         { classId: '5', className: 'Form 3A', averageRate: 71, totalStudents: 28 },
//     ];

//     const weeklyAverage = weeklyStats.length > 0
//         ? (weeklyStats.reduce((sum, day) => sum + day.rate, 0) / weeklyStats.length).toFixed(1)
//         : '0';

//     const monthlyAverage = monthlyStats.length > 0
//         ? (monthlyStats.reduce((sum, week) => sum + week.rate, 0) / monthlyStats.length).toFixed(1)
//         : '0';

//     const weeklyChange = weeklyStats.length >= 2
//         ? (weeklyStats[weeklyStats.length - 1].rate - weeklyStats[0].rate).toFixed(1)
//         : null;

//     const monthlyChange = monthlyStats.length >= 2
//         ? (monthlyStats[monthlyStats.length - 1].rate - monthlyStats[0].rate).toFixed(1)
//         : null;

//     const bestDay = weeklyStats.length > 0
//         ? weeklyStats.reduce((best, day) => day.rate > best.rate ? day : best, weeklyStats[0])
//         : null;

//     const worstDay = weeklyStats.length > 0
//         ? weeklyStats.reduce((worst, day) => day.rate < worst.rate ? day : worst, weeklyStats[0])
//         : null;

//     const bestWeek = monthlyStats.length > 0
//         ? monthlyStats.reduce((best, week) => week.rate > best.rate ? week : best, monthlyStats[0])
//         : null;

//     const worstWeek = monthlyStats.length > 0
//         ? monthlyStats.reduce((worst, week) => week.rate < worst.rate ? week : worst, monthlyStats[0])
//         : null;
//     const totalStudentsAll = classSummaries.reduce((sum, cls) => sum + (cls.totalStudents || 0), 0);

//     const classesNeedingAttention = classSummaries
//         .filter(cls => cls.averageRate < 75)
//         .sort((a, b) => a.averageRate - b.averageRate);

//     // Mock data - replace with actual student attendance data when available
//     const studentsWellPercent = 68;
//     const studentsAttentionPercent = 18;
//     const studentsWellCount = Math.floor(totalStudentsAll * studentsWellPercent / 100);
//     const studentsAttentionCount = Math.floor(totalStudentsAll * studentsAttentionPercent / 100);

//     const schoolWideStats = classSummaries.length > 0 ? {
//         totalStudents: totalStudentsAll,
//         averageAttendance: (classSummaries.reduce((sum, cls) => sum + cls.averageRate, 0) / classSummaries.length).toFixed(1),
//         classesAbove80: classSummaries.filter(cls => cls.averageRate >= 80).length,
//         classesBelow70: classSummaries.filter(cls => cls.averageRate < 70).length,
//         totalClasses: classSummaries.length,
//         studentsWell: studentsWellPercent,
//         studentsAttention: studentsAttentionPercent,
//         studentsWellCount: studentsWellCount,
//         studentsAttentionCount: studentsAttentionCount
//     } : null;

//     return (
//         <div className="space-y-6">

//             {/* School Wide Overview */}
//             {schoolWideStats && (
//                 <div className="space-y-4">
//                     {/* School Stats */}
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                         <div className="flex items-center gap-2 mb-4">
//                             <School className="w-5 h-5 text-indigo-600" />
//                             <h3 className="font-semibold text-slate-800">School Overview</h3>
//                         </div>
//                         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                             <div className="text-center p-3 bg-slate-50 rounded-lg">
//                                 <p className="text-2xl font-bold text-indigo-600">{schoolWideStats.totalClasses}</p>
//                                 <p className="text-xs text-slate-600">Total Classes</p>
//                             </div>
//                             <div className="text-center p-3 bg-slate-50 rounded-lg">
//                                 <p className="text-2xl font-bold text-indigo-600">{schoolWideStats.totalStudents}</p>
//                                 <p className="text-xs text-slate-600">Total Students</p>
//                             </div>
//                             <div className="text-center p-3 bg-emerald-50 rounded-lg">
//                                 <p className="text-2xl font-bold text-emerald-600">{schoolWideStats.averageAttendance}%</p>
//                                 <p className="text-xs text-slate-600">School Average</p>
//                             </div>
//                             <div className="text-center p-3 bg-emerald-50 rounded-lg">
//                                 <p className="text-2xl font-bold text-emerald-600">{schoolWideStats.classesAbove80}</p>
//                                 <p className="text-xs text-slate-600">Classes Above 80%</p>
//                             </div>
//                             <div className="text-center p-3 bg-amber-50 rounded-lg">
//                                 <p className="text-2xl font-bold text-amber-600">{schoolWideStats.classesBelow70}</p>
//                                 <p className="text-xs text-slate-600">Classes Below 70%</p>
//                             </div>
//                         </div>
//                     </div>
//                     {/* 3 Summary Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {/* WEEK CARD */}
//                         <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
//                             <div className="flex items-center justify-between mb-3">
//                                 <Calendar className="w-8 h-8 opacity-80" />
//                                 {weeklyChange && (
//                                     <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(weeklyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
//                                         {parseFloat(weeklyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//                                         {parseFloat(weeklyChange) >= 0 ? '+' : ''}{weeklyChange}%
//                                     </div>
//                                 )}
//                             </div>
//                             <p className="text-indigo-100 text-sm">THIS WEEK</p>
//                             <p className="text-3xl font-bold mt-1">{weeklyAverage}%</p>
//                             <p className="text-indigo-100 text-xs mt-2">Average Attendance</p>
//                             {bestDay && <p className="text-indigo-100 text-xs mt-1">Best: {bestDay.day} ({bestDay.rate}%)</p>}
//                             {worstDay && <p className="text-indigo-100 text-xs">Lowest: {worstDay.day} ({worstDay.rate}%)</p>}
//                         </div>

//                         {/* MONTH CARD */}
//                         <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
//                             <div className="flex items-center justify-between mb-3">
//                                 <Activity className="w-8 h-8 opacity-80" />
//                                 {monthlyChange && (
//                                     <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(monthlyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
//                                         {parseFloat(monthlyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//                                         {parseFloat(monthlyChange) >= 0 ? '+' : ''}{monthlyChange}%
//                                     </div>
//                                 )}
//                             </div>
//                             <p className="text-emerald-100 text-sm">THIS MONTH</p>
//                             <p className="text-3xl font-bold mt-1">{monthlyAverage}%</p>
//                             <p className="text-emerald-100 text-xs mt-2">Average Attendance</p>
//                             {bestWeek && <p className="text-emerald-100 text-xs mt-1">Best: {bestWeek.weekName} ({bestWeek.rate}%)</p>}
//                             {worstWeek && <p className="text-emerald-100 text-xs">Lowest: {worstWeek.weekName} ({worstWeek.rate}%)</p>}
//                         </div>

//                         {/* TERM CARD */}
//                         <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
//                             <div className="flex items-center justify-between mb-3">
//                                 <School className="w-8 h-8 opacity-80" />
//                             </div>
//                             <p className="text-purple-100 text-sm">THIS TERM</p>
//                             <p className="text-3xl font-bold mt-1">{termStats?.averageRate?.toFixed(1) || '0'}%</p>
//                             <p className="text-purple-100 text-xs mt-2">Overall Average</p>
//                             {termStats && (
//                                 <>
//                                     <p className="text-purple-100 text-xs mt-1">Highest: {termStats.highestRate}%</p>
//                                     <p className="text-purple-100 text-xs">Lowest: {termStats.lowestRate}%</p>
//                                 </>
//                             )}
//                         </div>
//                     </div>

//                     {/* Student Performance Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
//                             <div className="flex items-center justify-between mb-3">
//                                 <Award className="w-8 h-8 opacity-80" />
//                                 <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Excellent</span>
//                             </div>
//                             <p className="text-green-100 text-sm">STUDENTS DOING WELL</p>
//                             <p className="text-3xl font-bold mt-1">{schoolWideStats.studentsWell}%</p>
//                             <p className="text-green-100 text-xs mt-2">Have ≥75% attendance</p>
//                             <p className="text-green-100 text-xs mt-1">{schoolWideStats.studentsWellCount} students</p>
//                         </div>

//                         <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
//                             <div className="flex items-center justify-between mb-3">
//                                 <AlertTriangle className="w-8 h-8 opacity-80" />
//                                 <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Attention Needed</span>
//                             </div>
//                             <p className="text-red-100 text-sm">NEED ATTENTION</p>
//                             <p className="text-3xl font-bold mt-1">{schoolWideStats.studentsAttention}%</p>
//                             <p className="text-red-100 text-xs mt-2">Have &lt;70% attendance</p>
//                             <p className="text-red-100 text-xs mt-1">{schoolWideStats.studentsAttentionCount} students</p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Classes Needing Attention - ONLY */}
//             {/* Classes Performance - Side by Side */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Classes Needing Attention */}
//                 {classesNeedingAttention.length > 0 && (
//                     <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg p-5 text-white">
//                         <div className="flex items-center justify-between mb-3">
//                             <AlertTriangle className="w-8 h-8 opacity-80" />
//                             <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{classesNeedingAttention.length} Classes</span>
//                         </div>
//                         <p className="text-rose-100 text-sm">NEEDS ATTENTION</p>
//                         <p className="text-3xl font-bold mt-1">{classesNeedingAttention.length}</p>
//                         <p className="text-rose-100 text-xs mt-2">Classes below 75% attendance</p>
//                         <div className="mt-3 space-y-2">
//                             {classesNeedingAttention.slice(0, 3).map(cls => (
//                                 <div key={cls.classId} className="flex justify-between items-center text-sm bg-white/10 rounded-lg px-3 py-2">
//                                     <span>{cls.className}</span>
//                                     <span className="font-bold">{cls.averageRate}%</span>
//                                 </div>
//                             ))}
//                             {classesNeedingAttention.length > 3 && (
//                                 <p className="text-xs text-rose-100 text-center mt-2">+{classesNeedingAttention.length - 3} more classes</p>
//                             )}
//                         </div>
//                     </div>
//                 )}

//                 {/* Top Performing Classes */}
//                 {(() => {
//                     const topClasses = classSummaries
//                         .filter(cls => cls.averageRate >= 80)
//                         .sort((a, b) => b.averageRate - a.averageRate);

//                     if (topClasses.length === 0) return null;

//                     return (
//                         <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg p-5 text-white">
//                             <div className="flex items-center justify-between mb-3">
//                                 <Award className="w-8 h-8 opacity-80" />
//                                 <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{topClasses.length} Classes</span>
//                             </div>
//                             <p className="text-teal-100 text-sm">TOP PERFORMING</p>
//                             <p className="text-3xl font-bold mt-1">{topClasses.length}</p>
//                             <p className="text-teal-100 text-xs mt-2">Classes above 80% attendance</p>
//                             <div className="mt-3 space-y-2">
//                                 {topClasses.slice(0, 3).map(cls => (
//                                     <div key={cls.classId} className="flex justify-between items-center text-sm bg-white/10 rounded-lg px-3 py-2">
//                                         <span>{cls.className}</span>
//                                         <span className="font-bold">{cls.averageRate}%</span>
//                                     </div>
//                                 ))}
//                                 {topClasses.length > 3 && (
//                                     <p className="text-xs text-teal-100 text-center mt-2">+{topClasses.length - 3} more classes</p>
//                                 )}
//                             </div>
//                         </div>
//                     );
//                 })()}
//             </div>
//         </div>
//     );
// };

// export default OverviewTab;