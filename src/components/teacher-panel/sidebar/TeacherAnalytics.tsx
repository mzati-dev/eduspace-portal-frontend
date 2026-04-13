// // components/teacher/TeacherAnalytics.tsx
// import React, { useState, useEffect } from 'react';
// import {
//     TrendingUp,
//     TrendingDown,
//     AlertTriangle,
//     Users,
//     BookOpen,
//     GraduationCap,
//     Brain,
//     Target,
//     Calendar,
//     Download,
//     Trophy,
//     Eye
// } from 'lucide-react';

// interface TeacherAnalyticsProps {
//     teacherId: string;
//     classes: any[];
//     students: any[];
//     subjects: any[];
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// interface ClassPerformance {
//     rank: number;
//     name: string;
//     passRate: number;
//     avgScore: number;
//     attendance: number;
//     riskStudents: number;
//     riskChange: number;
//     trend: number;
// }

// interface RiskStudent {
//     id: string;
//     name: string;
//     examNumber: string;
//     className: string;
//     attendance: number;
//     catScore: number;
//     fails: number;
//     prevDrop: number;
//     riskLevel: 'critical' | 'high' | 'medium' | 'low';
// }

// interface SubjectPerformance {
//     name: string;
//     avgScore: number;
//     passRate: number;
//     trend: number;
// }

// const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({
//     teacherId,
//     classes,
//     students,
//     subjects,
//     showMessage
// }) => {
//     const [loading, setLoading] = useState(true);
//     const [selectedTerm, setSelectedTerm] = useState<string>('Term 4, 2025');

//     // Data States
//     const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
//     const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([]);
//     const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
//     const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
//     const [keyMetrics, setKeyMetrics] = useState({
//         avgPassRate: 0,
//         avgAttendance: 0,
//         totalStudents: 0,
//         atRiskCount: 0
//     });

//     useEffect(() => {
//         loadTeacherAnalytics();
//     }, [selectedTerm]);

//     const loadTeacherAnalytics = async () => {
//         setLoading(true);
//         setTimeout(() => {
//             // Teacher's assigned classes (filter by teacher)
//             const teacherAssignedClasses = classes.filter(c => c.teacherId === teacherId || c.teacherName);
//             setTeacherClasses(teacherAssignedClasses);

//             // Class Performance Ranking (only teacher's classes)
//             const classPerf: ClassPerformance[] = teacherAssignedClasses.map((cls, idx) => ({
//                 rank: idx + 1,
//                 name: cls.name,
//                 passRate: 65 + Math.random() * 25,
//                 avgScore: 60 + Math.random() * 25,
//                 attendance: 55 + Math.random() * 35,
//                 riskStudents: Math.floor(Math.random() * 15),
//                 riskChange: Math.floor(Math.random() * 10) - 5,
//                 trend: Math.floor(Math.random() * 15) - 5
//             })).sort((a, b) => b.passRate - a.passRate).map((c, i) => ({ ...c, rank: i + 1 }));
//             setClassPerformance(classPerf);

//             // Students at risk in teacher's classes
//             const classIds = teacherAssignedClasses.map(c => c.id);
//             const atRisk = students
//                 .filter(s => classIds.includes(s.classId) && (Math.random() > 0.7))
//                 .slice(0, 8)
//                 .map((s, idx) => ({
//                     id: s.id || String(idx + 1),
//                     name: s.name,
//                     examNumber: s.examNumber || `STU${String(idx + 1).padStart(4, '0')}`,
//                     className: s.className || teacherAssignedClasses[0]?.name || 'Class',
//                     attendance: 40 + Math.random() * 30,
//                     catScore: 35 + Math.random() * 30,
//                     fails: Math.floor(Math.random() * 3),
//                     prevDrop: -Math.floor(Math.random() * 25),
//                     riskLevel: Math.random() > 0.6 ? 'critical' : Math.random() > 0.3 ? 'high' : 'medium'
//                 } as RiskStudent));
//             setRiskStudents(atRisk);

//             // Subject Performance (subjects teacher teaches)
//             const subjectPerf = subjects.slice(0, 5).map(sub => ({
//                 name: sub.name,
//                 avgScore: 55 + Math.random() * 30,
//                 passRate: 50 + Math.random() * 35,
//                 trend: Math.floor(Math.random() * 15) - 5
//             }));
//             setSubjectPerformance(subjectPerf);

//             // Key Metrics
//             const totalStudents = teacherAssignedClasses.reduce((sum, c) => sum + (c.studentCount || 25), 0);
//             setKeyMetrics({
//                 avgPassRate: Math.round(classPerf.reduce((sum, c) => sum + c.passRate, 0) / classPerf.length),
//                 avgAttendance: Math.round(classPerf.reduce((sum, c) => sum + c.attendance, 0) / classPerf.length),
//                 totalStudents: totalStudents,
//                 atRiskCount: atRisk.length
//             });

//             setLoading(false);
//         }, 800);
//     };

//     const getRiskColor = (level: string) => {
//         switch (level) {
//             case 'critical': return 'bg-red-100 text-red-700';
//             case 'high': return 'bg-orange-100 text-orange-700';
//             case 'medium': return 'bg-yellow-100 text-yellow-700';
//             default: return 'bg-green-100 text-green-700';
//         }
//     };

//     const getRiskIcon = (level: string) => {
//         switch (level) {
//             case 'critical': return '🔴';
//             case 'high': return '🟠';
//             case 'medium': return '🟡';
//             default: return '🟢';
//         }
//     };

//     if (loading) {
//         return (
//             <div className="bg-white rounded-xl p-12 text-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
//                 <p className="text-slate-500 mt-2">Loading your analytics...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">My Class Analytics</h2>
//                     <p className="text-slate-500">Performance insights for your classes</p>
//                 </div>
//                 <div className="flex gap-2">
//                     <select
//                         value={selectedTerm}
//                         onChange={(e) => setSelectedTerm(e.target.value)}
//                         className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
//                     >
//                         <option>Term 4, 2025 (Current)</option>
//                         <option>Term 3, 2025</option>
//                         <option>Term 2, 2025</option>
//                         <option>Term 1, 2025</option>
//                     </select>
//                     <button className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2">
//                         <Download className="w-4 h-4" />
//                         Export
//                     </button>
//                 </div>
//             </div>

//             {/* Key Metrics Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white">
//                     <p className="text-indigo-100 text-sm">Avg Pass Rate</p>
//                     <p className="text-3xl font-bold mt-1">{keyMetrics.avgPassRate}%</p>
//                     <p className="text-indigo-100 text-xs mt-2">Across your classes</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
//                     <p className="text-emerald-100 text-sm">Avg Attendance</p>
//                     <p className="text-3xl font-bold mt-1">{keyMetrics.avgAttendance}%</p>
//                     <p className="text-emerald-100 text-xs mt-2">Class average</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
//                     <p className="text-purple-100 text-sm">Total Students</p>
//                     <p className="text-3xl font-bold mt-1">{keyMetrics.totalStudents}</p>
//                     <p className="text-purple-100 text-xs mt-2">Across all your classes</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-5 text-white">
//                     <p className="text-rose-100 text-sm">At-Risk Students</p>
//                     <p className="text-3xl font-bold mt-1">{keyMetrics.atRiskCount}</p>
//                     <p className="text-rose-100 text-xs mt-2">Need immediate attention</p>
//                 </div>
//             </div>

//             {/* My Classes Performance */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                     <Trophy className="w-5 h-5 text-amber-500" />
//                     My Classes Performance
//                 </h3>
//                 <div className="space-y-4">
//                     {classPerformance.map(cls => (
//                         <div key={cls.name} className="p-4 bg-slate-50 rounded-lg">
//                             <div className="flex justify-between items-start mb-3">
//                                 <div>
//                                     <div className="flex items-center gap-2">
//                                         <span className="font-bold text-indigo-600">#{cls.rank}</span>
//                                         <h4 className="font-semibold text-slate-800">{cls.name}</h4>
//                                     </div>
//                                     <p className="text-xs text-slate-500">{cls.riskStudents} students at risk</p>
//                                 </div>
//                                 <div className={`flex items-center gap-1 text-sm ${cls.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                     {cls.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
//                                     {Math.abs(cls.trend)}% vs last term
//                                 </div>
//                             </div>
//                             <div className="grid grid-cols-3 gap-4">
//                                 <div>
//                                     <p className="text-xs text-slate-500">Pass Rate</p>
//                                     <p className="text-lg font-bold text-emerald-600">{Math.round(cls.passRate)}%</p>
//                                     <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1">
//                                         <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cls.passRate}%` }} />
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-slate-500">Avg Score</p>
//                                     <p className="text-lg font-bold text-indigo-600">{Math.round(cls.avgScore)}%</p>
//                                     <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1">
//                                         <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${cls.avgScore}%` }} />
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-slate-500">Attendance</p>
//                                     <p className={`text-lg font-bold ${cls.attendance >= 75 ? 'text-green-600' : cls.attendance >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
//                                         {Math.round(cls.attendance)}%
//                                     </p>
//                                     <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1">
//                                         <div className={`h-full rounded-full ${cls.attendance >= 75 ? 'bg-green-500' : cls.attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${cls.attendance}%` }} />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Students at Risk - My Classes */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                     <AlertTriangle className="w-5 h-5 text-amber-600" />
//                     Students at Risk in My Classes
//                 </h3>
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="text-left px-4 py-3">Student</th>
//                                 <th className="text-left px-4 py-3">Exam No</th>
//                                 <th className="text-left px-4 py-3">Class</th>
//                                 <th className="text-left px-4 py-3">Attendance</th>
//                                 <th className="text-left px-4 py-3">CAT Score</th>
//                                 <th className="text-left px-4 py-3">Failed</th>
//                                 <th className="text-left px-4 py-3">Risk Level</th>
//                                 <th className="text-left px-4 py-3">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {riskStudents.map(student => (
//                                 <tr key={student.id} className="hover:bg-slate-50">
//                                     <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                     <td className="px-4 py-3 text-indigo-600">{student.examNumber}</td>
//                                     <td className="px-4 py-3">{student.className}</td>
//                                     <td className="px-4 py-3 text-red-600">{Math.round(student.attendance)}%</td>
//                                     <td className="px-4 py-3 text-red-600">{Math.round(student.catScore)}%</td>
//                                     <td className="px-4 py-3">{student.fails}</td>
//                                     <td className="px-4 py-3">
//                                         <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(student.riskLevel)}`}>
//                                             {getRiskIcon(student.riskLevel)} {student.riskLevel.toUpperCase()}
//                                         </span>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <button className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200">
//                                             View Details
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Subject Performance & Factor Analysis */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Subject Performance */}
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                     <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                         <BookOpen className="w-5 h-5 text-purple-600" />
//                         My Subject Performance
//                     </h3>
//                     <div className="space-y-4">
//                         {subjectPerformance.map(subj => (
//                             <div key={subj.name}>
//                                 <div className="flex justify-between items-center mb-1">
//                                     <span className="font-medium text-slate-700">{subj.name}</span>
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-sm font-bold text-indigo-600">{Math.round(subj.avgScore)}%</span>
//                                         <span className={`text-xs flex items-center gap-1 ${subj.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                             {subj.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//                                             {Math.abs(subj.trend)}%
//                                         </span>
//                                     </div>
//                                 </div>
//                                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//                                     <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${subj.avgScore}%` }} />
//                                 </div>
//                                 <p className="text-xs text-slate-500 mt-1">Pass Rate: {Math.round(subj.passRate)}%</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Quick Insights */}
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                     <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                         <Brain className="w-5 h-5 text-indigo-600" />
//                         Quick Insights
//                     </h3>
//                     <div className="space-y-4">
//                         <div className="p-3 bg-green-50 rounded-lg">
//                             <p className="text-sm font-medium text-green-800">✅ Top Performing Class</p>
//                             <p className="text-lg font-bold text-green-600">{classPerformance[0]?.name || 'N/A'}</p>
//                             <p className="text-xs text-green-600">{Math.round(classPerformance[0]?.passRate || 0)}% pass rate</p>
//                         </div>
//                         <div className="p-3 bg-red-50 rounded-lg">
//                             <p className="text-sm font-medium text-red-800">⚠️ Needs Attention</p>
//                             <p className="text-lg font-bold text-red-600">{classPerformance[classPerformance.length - 1]?.name || 'N/A'}</p>
//                             <p className="text-xs text-red-600">{Math.round(classPerformance[classPerformance.length - 1]?.passRate || 0)}% pass rate</p>
//                         </div>
//                         <div className="p-3 bg-amber-50 rounded-lg">
//                             <p className="text-sm font-medium text-amber-800">📊 Attendance Alert</p>
//                             <p className="text-lg font-bold text-amber-600">{keyMetrics.avgAttendance}%</p>
//                             <p className="text-xs text-amber-600">Average attendance across your classes</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TeacherAnalytics;