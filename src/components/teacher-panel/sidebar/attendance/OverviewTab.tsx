import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Award,
    AlertTriangle,
    School,
    Activity
} from 'lucide-react';
import { WeeklyStats, ClassAttendanceSummary, MonthlyStats, TermStats } from '@/services/attendanceService';

interface Props {
    loading: boolean;
    selectedClass: string;
    weeklyStats: WeeklyStats[];
    monthlyStats: MonthlyStats[];
    termStats: TermStats;
    classSummaries: ClassAttendanceSummary[];
    bestStudents: any[];
    needsImprovementStudents: any[];
    showAllBest: boolean;
    setShowAllBest: (value: boolean) => void;
    showAllNeeds: boolean;
    setShowAllNeeds: (value: boolean) => void;
}

const OverviewTab: React.FC<Props> = ({
    loading,
    selectedClass,
    weeklyStats,
    monthlyStats,
    termStats,
    classSummaries,
    bestStudents,
    needsImprovementStudents,
    showAllBest,
    setShowAllBest,
    showAllNeeds,
    setShowAllNeeds
}) => {
    // Calculate weekly average
    const weeklyAverage = weeklyStats.length > 0
        ? (weeklyStats.reduce((sum, day) => sum + day.rate, 0) / weeklyStats.length).toFixed(1)
        : '0';

    // Calculate monthly average
    const monthlyAverage = monthlyStats.length > 0
        ? (monthlyStats.reduce((sum, week) => sum + week.rate, 0) / monthlyStats.length).toFixed(1)
        : '0';

    // Calculate change from previous week
    const weeklyChange = weeklyStats.length >= 2
        ? (weeklyStats[weeklyStats.length - 1].rate - weeklyStats[0].rate).toFixed(1)
        : null;

    // Calculate change from previous month
    const monthlyChange = monthlyStats.length >= 2
        ? (monthlyStats[monthlyStats.length - 1].rate - monthlyStats[0].rate).toFixed(1)
        : null;

    // Best and worst days this week
    const bestDay = weeklyStats.length > 0
        ? weeklyStats.reduce((best, day) => day.rate > best.rate ? day : best, weeklyStats[0])
        : null;

    const worstDay = weeklyStats.length > 0
        ? weeklyStats.reduce((worst, day) => day.rate < worst.rate ? day : worst, weeklyStats[0])
        : null;

    // Best and worst weeks this month
    const bestWeek = monthlyStats.length > 0
        ? monthlyStats.reduce((best, week) => week.rate > best.rate ? week : best, monthlyStats[0])
        : null;

    const worstWeek = monthlyStats.length > 0
        ? monthlyStats.reduce((worst, week) => week.rate < worst.rate ? week : worst, monthlyStats[0])
        : null;

    // Current class data
    const currentClass = classSummaries.find(c => c.classId === selectedClass);
    const totalStudents = currentClass?.totalStudents || 0;
    const classAverage = currentClass?.averageRate || 0;

    // Student stats
    const studentsWellCount = bestStudents.length;
    const studentsWellPercent = totalStudents > 0 ? ((studentsWellCount / totalStudents) * 100).toFixed(1) : '0';
    const studentsAttentionCount = needsImprovementStudents.length;
    const studentsAttentionPercent = totalStudents > 0 ? ((studentsAttentionCount / totalStudents) * 100).toFixed(1) : '0';

    return (
        <div className="space-y-6">
            {/* Class Overview */}
            <div className="space-y-4">
                {/* Class Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <School className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-slate-800">Class Overview</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">{totalStudents}</p>
                            <p className="text-xs text-slate-600">Total Students</p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <p className="text-2xl font-bold text-emerald-600">{classAverage}%</p>
                            <p className="text-xs text-slate-600">Class Average</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{bestStudents.length}</p>
                            <p className="text-xs text-slate-600">Above 90%</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{needsImprovementStudents.length}</p>
                            <p className="text-xs text-slate-600">Below 70%</p>
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
                                <p className="text-purple-100 text-xs mt-1">Highest: {termStats.highestRate || 0}%</p>
                                <p className="text-purple-100 text-xs">Lowest: {termStats.lowestRate || 0}%</p>
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
        </div>
    );
};

export default OverviewTab;

// import React from 'react';
// import {
//     TrendingUp,
//     TrendingDown,
//     Calendar,
//     Award,
//     AlertTriangle,
//     School,
//     Activity
// } from 'lucide-react';
// import { WeeklyStats, ClassAttendanceSummary, MonthlyStats, TermStats } from '@/services/attendanceService';

// interface Props {
//     loading: boolean;
//     selectedClass: string;
//     weeklyStats: WeeklyStats[];
//     monthlyStats: MonthlyStats[];
//     termStats: TermStats;
//     classSummaries: ClassAttendanceSummary[];
//     bestStudents: any[];
//     needsImprovementStudents: any[];
//     showAllBest: boolean;
//     setShowAllBest: (value: boolean) => void;
//     showAllNeeds: boolean;
//     setShowAllNeeds: (value: boolean) => void;
// }

// const OverviewTab: React.FC<Props> = ({
//     loading,
//     selectedClass,
//     weeklyStats,
//     monthlyStats,
//     termStats,
//     classSummaries,
//     bestStudents,
//     needsImprovementStudents,
//     showAllBest,
//     setShowAllBest,
//     showAllNeeds,
//     setShowAllNeeds
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

//     // Current class data
//     const currentClass = classSummaries.find(c => c.classId === selectedClass);
//     const totalStudents = currentClass?.totalStudents || 35;
//     const classAverage = currentClass?.averageRate || 78;

//     // Student stats
//     const studentsWellCount = bestStudents.length || 5;
//     const studentsWellPercent = totalStudents > 0 ? ((studentsWellCount / totalStudents) * 100).toFixed(1) : 68;
//     const studentsAttentionCount = needsImprovementStudents.length || 5;
//     const studentsAttentionPercent = totalStudents > 0 ? ((studentsAttentionCount / totalStudents) * 100).toFixed(1) : 18;

//     return (
//         <div className="space-y-6">
//             {/* Class Overview */}
//             <div className="space-y-4">
//                 {/* Class Stats */}
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                     <div className="flex items-center gap-2 mb-4">
//                         <School className="w-5 h-5 text-indigo-600" />
//                         <h3 className="font-semibold text-slate-800">Class Overview</h3>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <div className="text-center p-3 bg-slate-50 rounded-lg">
//                             <p className="text-2xl font-bold text-indigo-600">{totalStudents}</p>
//                             <p className="text-xs text-slate-600">Total Students</p>
//                         </div>
//                         <div className="text-center p-3 bg-emerald-50 rounded-lg">
//                             <p className="text-2xl font-bold text-emerald-600">{classAverage}%</p>
//                             <p className="text-xs text-slate-600">Class Average</p>
//                         </div>
//                         <div className="text-center p-3 bg-green-50 rounded-lg">
//                             <p className="text-2xl font-bold text-green-600">{bestStudents.length}</p>
//                             <p className="text-xs text-slate-600">Above 90%</p>
//                         </div>
//                         <div className="text-center p-3 bg-red-50 rounded-lg">
//                             <p className="text-2xl font-bold text-red-600">{needsImprovementStudents.length}</p>
//                             <p className="text-xs text-slate-600">Below 70%</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 3 Summary Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     {/* WEEK CARD */}
//                     <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
//                         <div className="flex items-center justify-between mb-3">
//                             <Calendar className="w-8 h-8 opacity-80" />
//                             {weeklyChange && (
//                                 <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(weeklyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
//                                     {parseFloat(weeklyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//                                     {parseFloat(weeklyChange) >= 0 ? '+' : ''}{weeklyChange}%
//                                 </div>
//                             )}
//                         </div>
//                         <p className="text-indigo-100 text-sm">THIS WEEK</p>
//                         <p className="text-3xl font-bold mt-1">{weeklyAverage}%</p>
//                         <p className="text-indigo-100 text-xs mt-2">Average Attendance</p>
//                         {bestDay && <p className="text-indigo-100 text-xs mt-1">Best: {bestDay.day} ({bestDay.rate}%)</p>}
//                         {worstDay && <p className="text-indigo-100 text-xs">Lowest: {worstDay.day} ({worstDay.rate}%)</p>}
//                     </div>

//                     {/* MONTH CARD */}
//                     <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
//                         <div className="flex items-center justify-between mb-3">
//                             <Activity className="w-8 h-8 opacity-80" />
//                             {monthlyChange && (
//                                 <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parseFloat(monthlyChange) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
//                                     {parseFloat(monthlyChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//                                     {parseFloat(monthlyChange) >= 0 ? '+' : ''}{monthlyChange}%
//                                 </div>
//                             )}
//                         </div>
//                         <p className="text-emerald-100 text-sm">THIS MONTH</p>
//                         <p className="text-3xl font-bold mt-1">{monthlyAverage}%</p>
//                         <p className="text-emerald-100 text-xs mt-2">Average Attendance</p>
//                         {bestWeek && <p className="text-emerald-100 text-xs mt-1">Best: {bestWeek.weekName} ({bestWeek.rate}%)</p>}
//                         {worstWeek && <p className="text-emerald-100 text-xs">Lowest: {worstWeek.weekName} ({worstWeek.rate}%)</p>}
//                     </div>

//                     {/* TERM CARD */}
//                     <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
//                         <div className="flex items-center justify-between mb-3">
//                             <School className="w-8 h-8 opacity-80" />
//                         </div>
//                         <p className="text-purple-100 text-sm">THIS TERM</p>
//                         <p className="text-3xl font-bold mt-1">{termStats?.averageRate?.toFixed(1) || '76'}%</p>
//                         <p className="text-purple-100 text-xs mt-2">Overall Average</p>
//                         {termStats && (
//                             <>
//                                 <p className="text-purple-100 text-xs mt-1">Highest: {termStats.highestRate || 88}%</p>
//                                 <p className="text-purple-100 text-xs">Lowest: {termStats.lowestRate || 65}%</p>
//                             </>
//                         )}
//                     </div>
//                 </div>

//                 {/* Student Performance Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
//                         <div className="flex items-center justify-between mb-3">
//                             <Award className="w-8 h-8 opacity-80" />
//                             <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Excellent</span>
//                         </div>
//                         <p className="text-green-100 text-sm">STUDENTS DOING WELL</p>
//                         <p className="text-3xl font-bold mt-1">{studentsWellPercent}%</p>
//                         <p className="text-green-100 text-xs mt-2">Have ≥75% attendance</p>
//                         <p className="text-green-100 text-xs mt-1">{studentsWellCount} students</p>
//                     </div>

//                     <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
//                         <div className="flex items-center justify-between mb-3">
//                             <AlertTriangle className="w-8 h-8 opacity-80" />
//                             <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Attention Needed</span>
//                         </div>
//                         <p className="text-red-100 text-sm">NEED ATTENTION</p>
//                         <p className="text-3xl font-bold mt-1">{studentsAttentionPercent}%</p>
//                         <p className="text-red-100 text-xs mt-2">Have &lt;70% attendance</p>
//                         <p className="text-red-100 text-xs mt-1">{studentsAttentionCount} students</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OverviewTab;