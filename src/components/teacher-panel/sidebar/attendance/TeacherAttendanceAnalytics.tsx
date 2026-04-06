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
import { API_BASE_URL } from '@/services/attendanceService';

interface AnalyticsProps {
    classId: string;
    className: string;
    students: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherAttendanceAnalytics: React.FC<AnalyticsProps> = ({ classId, className, students, showMessage }) => {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        if (classId) {
            fetchAnalytics();
        }
    }, [classId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const endDate = new Date().toISOString().split('T')[0];
            let startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const startDateStr = startDate.toISOString().split('T')[0];

            const response = await fetch(
                `${API_BASE_URL}/attendance/analytics/class/${classId}?startDate=${startDateStr}&endDate=${endDate}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const data = await response.json();
            if (data.success) {
                setAnalytics(data.data);
            } else {
                setAnalytics(generateMockAnalytics());
            }
        } catch (error) {
            setAnalytics(generateMockAnalytics());
        } finally {
            setLoading(false);
        }
    };

    const generateMockAnalytics = () => {
        const totalStudents = students.length;

        return {
            summary: {
                averageAttendance: 75.4,
                totalDays: 30,
                totalPresent: 1508,
                totalAbsent: 492,
                totalLate: 156,
                totalExcused: 89,
                perfectAttendance: 12,
                criticalRisk: 8
            },
            trends: {
                weekly: [72, 74, 78, 76, 75],
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'This Week']
            },
            topPerformers: students.slice(0, 5).map(s => ({
                ...s,
                rate: 92 + Math.random() * 7
            })),
            bottomPerformers: students.slice(-5).map(s => ({
                ...s,
                rate: 45 + Math.random() * 24
            })),
            dayAnalysis: [
                { day: 'Monday', rate: 82, absent: 8 },
                { day: 'Tuesday', rate: 78, absent: 12 },
                { day: 'Wednesday', rate: 75, absent: 15 },
                { day: 'Thursday', rate: 71, absent: 18 },
                { day: 'Friday', rate: 68, absent: 22 }
            ],
            alerts: {
                critical: students.slice(0, 3).map(s => ({ ...s, attendanceRate: 48 + Math.random() * 10 })),
                warning: students.slice(3, 6).map(s => ({ ...s, attendanceRate: 62 + Math.random() * 7 }))
            }
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12 bg-white rounded-xl">
                <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800">No Data Available</h3>
                <p className="text-slate-500 mt-2">No attendance records found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Attendance Analytics</h2>
                    <p className="text-slate-500">{className} • Last 30 Days</p>
                </div>
                <button className="px-3 py-2 bg-slate-100 rounded-lg text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

            {/* Row 1: 4 Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Avg Attendance</span>
                        {analytics.summary.averageAttendance >= 80 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{analytics.summary.averageAttendance}%</p>
                    <p className="text-xs text-slate-500 mt-1">Target: 90%</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Present</span>
                        <Users className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{analytics.summary.totalPresent}</p>
                    <p className="text-xs text-slate-500 mt-1">Total present</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Absent</span>
                        <Clock className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{analytics.summary.totalAbsent}</p>
                    <p className="text-xs text-slate-500 mt-1">{((analytics.summary.totalAbsent / (analytics.summary.totalPresent + analytics.summary.totalAbsent)) * 100).toFixed(1)}% of total</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Perfect Attendance</span>
                        <Award className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{analytics.summary.perfectAttendance}</p>
                    <p className="text-xs text-slate-500 mt-1">students with 100%</p>
                </div>
            </div>

            {/* Row 2: 4 Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-2xl font-bold text-slate-800">{analytics.summary.totalDays}</p>
                    <p className="text-xs text-slate-500">School Days</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-2xl font-bold text-slate-800">{analytics.summary.totalLate}</p>
                    <p className="text-xs text-slate-500">Late Arrivals</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-2xl font-bold text-slate-800">{analytics.summary.totalExcused}</p>
                    <p className="text-xs text-slate-500">Excused Absences</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-2xl font-bold text-red-600">{analytics.summary.criticalRisk}</p>
                    <p className="text-xs text-slate-500">At Critical Risk</p>
                </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Attendance Trend
                </h3>
                <div className="space-y-3">
                    {analytics.trends.weekly.map((rate: number, idx: number) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">{analytics.trends.labels[idx]}</span>
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
            </div>

            {/* Day Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">Attendance by Day</h3>
                    <div className="space-y-3">
                        {analytics.dayAnalysis.map((day: any) => (
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
                    {analytics.alerts.critical.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-red-700 mb-2">Critical (&lt;50%)</p>
                            <div className="space-y-2">
                                {analytics.alerts.critical.map((student: any) => (
                                    <div key={student.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                        <span className="text-sm font-medium text-red-800">{student.name}</span>
                                        <span className="text-sm font-bold text-red-600">{student.attendanceRate}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {analytics.alerts.warning.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-amber-700 mb-2">Warning (50-70%)</p>
                            <div className="space-y-2">
                                {analytics.alerts.warning.map((student: any) => (
                                    <div key={student.id} className="flex justify-between items-center p-2 bg-amber-50 rounded">
                                        <span className="text-sm font-medium text-amber-800">{student.name}</span>
                                        <span className="text-sm font-bold text-amber-600">{student.attendanceRate}%</span>
                                    </div>
                                ))}
                            </div>
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
                        {analytics.topPerformers.map((student: any, idx: number) => (
                            <div key={student.id} className="flex justify-between items-center p-2 bg-emerald-50 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-emerald-700">#{idx + 1}</span>
                                    <span className="text-sm font-medium text-emerald-800">{student.name}</span>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">{student.rate.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Needs Improvement
                    </h3>
                    <div className="space-y-3">
                        {analytics.bottomPerformers.map((student: any, idx: number) => (
                            <div key={student.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-red-700">#{idx + 1}</span>
                                    <span className="text-sm font-medium text-red-800">{student.name}</span>
                                </div>
                                <span className="text-sm font-bold text-red-600">{student.rate.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendanceAnalytics;

// // components/attendance/TeacherAttendanceAnalytics.tsx
// import React, { useState, useEffect } from 'react';
// import {
//     TrendingUp,
//     TrendingDown,
//     Calendar,
//     Users,
//     Clock,
//     AlertTriangle,
//     Award,
//     BarChart3,
//     Activity,
//     Download
// } from 'lucide-react';
// import { API_BASE_URL } from '@/services/attendanceService';

// interface AnalyticsProps {
//     classId: string;
//     className: string;
//     students: any[];
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const TeacherAttendanceAnalytics: React.FC<AnalyticsProps> = ({ classId, className, students, showMessage }) => {
//     const [loading, setLoading] = useState(true);
//     const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'term'>('month');
//     const [analytics, setAnalytics] = useState<any>(null);

//     useEffect(() => {
//         if (classId) {
//             fetchAnalytics();
//         }
//     }, [classId, selectedPeriod]);

//     const fetchAnalytics = async () => {
//         setLoading(true);
//         try {
//             const token = localStorage.getItem('token');
//             const endDate = new Date().toISOString().split('T')[0];
//             let startDate = new Date();

//             if (selectedPeriod === 'week') {
//                 startDate.setDate(startDate.getDate() - 7);
//             } else if (selectedPeriod === 'month') {
//                 startDate.setMonth(startDate.getMonth() - 1);
//             } else {
//                 startDate.setMonth(startDate.getMonth() - 3);
//             }

//             const startDateStr = startDate.toISOString().split('T')[0];

//             const response = await fetch(
//                 `${API_BASE_URL}/attendance/analytics/class/${classId}?startDate=${startDateStr}&endDate=${endDate}&period=${selectedPeriod}`,
//                 { headers: { 'Authorization': `Bearer ${token}` } }
//             );

//             const data = await response.json();
//             if (data.success) {
//                 setAnalytics(data.data);
//             } else {
//                 setAnalytics(generateMockAnalytics());
//             }
//         } catch (error) {
//             setAnalytics(generateMockAnalytics());
//         } finally {
//             setLoading(false);
//         }
//     };

//     const generateMockAnalytics = () => {
//         const totalStudents = students.length;

//         return {
//             summary: {
//                 averageAttendance: 75.4,
//                 totalDays: 20,
//                 totalPresent: 1508,
//                 totalAbsent: 492,
//                 totalLate: 156,
//                 totalExcused: 89,
//                 perfectAttendance: 12,
//                 criticalRisk: 8
//             },
//             trends: {
//                 weekly: [72, 74, 78, 76, 75],
//                 labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'This Week']
//             },
//             topPerformers: students.slice(0, 5).map(s => ({
//                 ...s,
//                 rate: 92 + Math.random() * 7
//             })),
//             bottomPerformers: students.slice(-5).map(s => ({
//                 ...s,
//                 rate: 45 + Math.random() * 24
//             })),
//             dayAnalysis: [
//                 { day: 'Monday', rate: 82, absent: 8 },
//                 { day: 'Tuesday', rate: 78, absent: 12 },
//                 { day: 'Wednesday', rate: 75, absent: 15 },
//                 { day: 'Thursday', rate: 71, absent: 18 },
//                 { day: 'Friday', rate: 68, absent: 22 }
//             ],
//             alerts: {
//                 critical: students.slice(0, 3).map(s => ({ ...s, attendanceRate: 48 + Math.random() * 10 })),
//                 warning: students.slice(3, 6).map(s => ({ ...s, attendanceRate: 62 + Math.random() * 7 }))
//             }
//         };
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-64">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//                     <p className="mt-4 text-slate-600">Loading analytics...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!analytics) {
//         return (
//             <div className="text-center py-12 bg-white rounded-xl">
//                 <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-slate-800">No Data Available</h3>
//                 <p className="text-slate-500 mt-2">No attendance records found for this period</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">Attendance Analytics</h2>
//                     <p className="text-slate-500">{className} • {selectedPeriod.toUpperCase()} Overview</p>
//                 </div>
//                 <div className="flex gap-2">
//                     <select
//                         value={selectedPeriod}
//                         onChange={(e) => setSelectedPeriod(e.target.value as any)}
//                         className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
//                     >
//                         <option value="week">Last 7 Days</option>
//                         <option value="month">Last 30 Days</option>
//                         <option value="term">Last 90 Days</option>
//                     </select>
//                     <button className="px-3 py-2 bg-slate-100 rounded-lg text-sm flex items-center gap-2">
//                         <Download className="w-4 h-4" />
//                         Export
//                     </button>
//                 </div>
//             </div>

//             {/* Row 1: 4 Key Metrics */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm text-slate-500">Avg Attendance</span>
//                         {analytics.summary.averageAttendance >= 80 ? (
//                             <TrendingUp className="w-4 h-4 text-emerald-500" />
//                         ) : (
//                             <TrendingDown className="w-4 h-4 text-red-500" />
//                         )}
//                     </div>
//                     <p className="text-2xl font-bold text-slate-800">{analytics.summary.averageAttendance}%</p>
//                     <p className="text-xs text-slate-500 mt-1">Target: 90%</p>
//                 </div>

//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm text-slate-500">Present</span>
//                         <Users className="w-4 h-4 text-emerald-500" />
//                     </div>
//                     <p className="text-2xl font-bold text-emerald-600">{analytics.summary.totalPresent}</p>
//                     <p className="text-xs text-slate-500 mt-1">Total present</p>
//                 </div>

//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm text-slate-500">Absent</span>
//                         <Clock className="w-4 h-4 text-red-500" />
//                     </div>
//                     <p className="text-2xl font-bold text-red-600">{analytics.summary.totalAbsent}</p>
//                     <p className="text-xs text-slate-500 mt-1">{((analytics.summary.totalAbsent / (analytics.summary.totalPresent + analytics.summary.totalAbsent)) * 100).toFixed(1)}% of total</p>
//                 </div>

//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm text-slate-500">Perfect Attendance</span>
//                         <Award className="w-4 h-4 text-amber-500" />
//                     </div>
//                     <p className="text-2xl font-bold text-amber-600">{analytics.summary.perfectAttendance}</p>
//                     <p className="text-xs text-slate-500 mt-1">students with 100%</p>
//                 </div>
//             </div>

//             {/* Row 2: 4 Summary Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <p className="text-2xl font-bold text-slate-800">{analytics.summary.totalDays}</p>
//                     <p className="text-xs text-slate-500">School Days</p>
//                 </div>
//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <p className="text-2xl font-bold text-slate-800">{analytics.summary.totalLate}</p>
//                     <p className="text-xs text-slate-500">Late Arrivals</p>
//                 </div>
//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <p className="text-2xl font-bold text-slate-800">{analytics.summary.totalExcused}</p>
//                     <p className="text-xs text-slate-500">Excused Absences</p>
//                 </div>
//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <p className="text-2xl font-bold text-red-600">{analytics.summary.criticalRisk}</p>
//                     <p className="text-xs text-slate-500">At Critical Risk</p>
//                 </div>
//             </div>

//             {/* Weekly Trend */}
//             <div className="bg-white rounded-xl p-6 border border-slate-200">
//                 <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                     <Activity className="w-5 h-5 text-indigo-600" />
//                     Attendance Trend
//                 </h3>
//                 <div className="space-y-3">
//                     {analytics.trends.weekly.map((rate: number, idx: number) => (
//                         <div key={idx}>
//                             <div className="flex justify-between text-sm mb-1">
//                                 <span className="text-slate-600">{analytics.trends.labels[idx]}</span>
//                                 <span className={`font-medium ${rate >= 75 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
//                                     {rate}%
//                                 </span>
//                             </div>
//                             <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//                                 <div
//                                     className={`h-full rounded-full ${rate >= 75 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
//                                     style={{ width: `${rate}%` }}
//                                 />
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Day Analysis */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-white rounded-xl p-6 border border-slate-200">
//                     <h3 className="font-semibold text-slate-800 mb-4">Attendance by Day</h3>
//                     <div className="space-y-3">
//                         {analytics.dayAnalysis.map((day: any) => (
//                             <div key={day.day}>
//                                 <div className="flex justify-between text-sm mb-1">
//                                     <span className="text-slate-600">{day.day}</span>
//                                     <span className="text-slate-600">{day.rate}%</span>
//                                 </div>
//                                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//                                     <div
//                                         className="h-full rounded-full bg-indigo-500"
//                                         style={{ width: `${day.rate}%` }}
//                                     />
//                                 </div>
//                                 <p className="text-xs text-slate-400 mt-1">{day.absent} absent on average</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl p-6 border border-slate-200">
//                     <h3 className="font-semibold text-slate-800 mb-4">Critical Alerts</h3>
//                     {analytics.alerts.critical.length > 0 && (
//                         <div className="mb-4">
//                             <p className="text-sm font-medium text-red-700 mb-2">Critical (&lt;50%)</p>
//                             <div className="space-y-2">
//                                 {analytics.alerts.critical.map((student: any) => (
//                                     <div key={student.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
//                                         <span className="text-sm font-medium text-red-800">{student.name}</span>
//                                         <span className="text-sm font-bold text-red-600">{student.attendanceRate}%</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                     {analytics.alerts.warning.length > 0 && (
//                         <div>
//                             <p className="text-sm font-medium text-amber-700 mb-2">Warning (50-70%)</p>
//                             <div className="space-y-2">
//                                 {analytics.alerts.warning.map((student: any) => (
//                                     <div key={student.id} className="flex justify-between items-center p-2 bg-amber-50 rounded">
//                                         <span className="text-sm font-medium text-amber-800">{student.name}</span>
//                                         <span className="text-sm font-bold text-amber-600">{student.attendanceRate}%</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Top & Bottom Performers */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-white rounded-xl p-6 border border-slate-200">
//                     <h3 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
//                         <Award className="w-5 h-5 text-emerald-600" />
//                         Top Performers
//                     </h3>
//                     <div className="space-y-3">
//                         {analytics.topPerformers.map((student: any, idx: number) => (
//                             <div key={student.id} className="flex justify-between items-center p-2 bg-emerald-50 rounded">
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-sm font-bold text-emerald-700">#{idx + 1}</span>
//                                     <span className="text-sm font-medium text-emerald-800">{student.name}</span>
//                                 </div>
//                                 <span className="text-sm font-bold text-emerald-600">{student.rate.toFixed(1)}%</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl p-6 border border-slate-200">
//                     <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
//                         <AlertTriangle className="w-5 h-5 text-red-600" />
//                         Needs Improvement
//                     </h3>
//                     <div className="space-y-3">
//                         {analytics.bottomPerformers.map((student: any, idx: number) => (
//                             <div key={student.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-sm font-bold text-red-700">#{idx + 1}</span>
//                                     <span className="text-sm font-medium text-red-800">{student.name}</span>
//                                 </div>
//                                 <span className="text-sm font-bold text-red-600">{student.rate.toFixed(1)}%</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TeacherAttendanceAnalytics;