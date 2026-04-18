// components/admin/analytics/StudentDrillDown.tsx
import React, { useState } from 'react';
import {
    ArrowLeft,
    Mail,
    Download,
    Sparkles,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Award,
    Calendar
} from 'lucide-react';
import { StudentDetail } from '@/services/analyticsService';

interface StudentDrillDownProps {
    student: StudentDetail;
    loading: boolean;
    onBack: () => void;
    onExportPDF: () => void;
    onEmailReport: () => void;
    selectedTerm?: string;
    onTermChange?: (term: string) => void;
    availableTerms?: { value: string; label: string }[];
}

const StudentDrillDown: React.FC<StudentDrillDownProps> = ({
    student,
    loading,
    onBack,
    onExportPDF,
    onEmailReport,
    selectedTerm = '',
    onTermChange,
    availableTerms = []
}) => {
    const [localTerm, setLocalTerm] = useState(selectedTerm);

    const handleTermChange = (term: string) => {
        setLocalTerm(term);
        if (onTermChange) {
            onTermChange(term);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading student data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button and Term Selector */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                {availableTerms.length > 0 && (
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <select
                            value={localTerm}
                            onChange={(e) => handleTermChange(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                            {availableTerms.map(term => (
                                <option key={term.value} value={term.value}>{term.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Student Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.status === 'At-Risk (Critical)' ? 'bg-red-100 text-red-700' :
                                student.status === 'At-Risk (High)' ? 'bg-orange-100 text-orange-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {student.status}
                            </span>
                        </div>
                        <p className="text-slate-500">
                            📚 {student.grade}  | Exam No: {student.examNumber}
                        </p>
                        <p className="text-slate-500 text-sm">👩‍🏫 Class Teacher: {student.classTeacher}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEmailReport}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"
                        >
                            <Mail className="w-4 h-4" />
                            Email Report
                        </button>
                        <button
                            onClick={onExportPDF}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"
                        >
                            <Download className="w-4 h-4" />
                            PDF Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Student KPI Cards - These would update based on selected term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Marks ({localTerm || 'Current'})</p>
                    <p className={`text-2xl font-bold ${student.currentMarks < 50 ? 'text-red-600' : student.currentMarks < 65 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {student.currentMarks}%
                    </p>
                    <p className="text-xs text-red-500">▼ Below passing</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Attendance ({localTerm || 'Current'})</p>
                    <p className={`text-2xl font-bold ${student.currentAttendance < 70 ? 'text-red-600' : student.currentAttendance < 85 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {student.currentAttendance}%
                    </p>
                    <p className="text-xs text-red-500">▼ Below 60%</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Term-over-Term</p>
                    <p className="text-2xl font-bold text-red-600">{student.termOverTerm}%</p>
                    <p className="text-xs text-red-500">▼ Declining</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Class Rank</p>
                    <p className="text-2xl font-bold text-slate-800">{student.classRank}</p>
                    <p className="text-xs text-slate-500">Needs improvement</p>
                </div>
            </div>

            {/* Performance Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Performance Timeline (All Terms)</h3>
                <div className="h-64 relative">
                    <div className="absolute inset-0 flex items-end justify-between">
                        {student.timeline.map((point, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center px-2">
                                <div
                                    className="w-full bg-indigo-500 rounded-t transition-all duration-500 hover:bg-indigo-600"
                                    style={{ height: `${point.marks * 1.2}px`, maxHeight: '100px' }}
                                />
                                <span className="text-xs text-slate-500 mt-2">{point.term}</span>
                                <span className="text-xs font-medium">{point.marks}%</span>
                                <span className="text-xs text-slate-400">Att: {point.attendance}%</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-sm text-slate-600">
                        Attendance Trend: {student.timeline.map(t => t.attendance).join('% → ')}%
                    </p>
                </div>
            </div>

            {/* Factor Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Factor Breakdown – Why is this student struggling?</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-3 py-2">Factor</th>
                                <th className="text-left px-3 py-2">Student Value</th>
                                <th className="text-left px-3 py-2">Class Avg</th>
                                <th className="text-left px-3 py-2">Status</th>
                                <th className="text-left px-3 py-2">Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {student.factorBreakdown.map((factor, idx) => (
                                <tr key={idx}>
                                    <td className="px-3 py-2 font-medium">{factor.factor}</td>
                                    <td className="px-3 py-2">{factor.studentValue}</td>
                                    <td className="px-3 py-2">{factor.classAvg}</td>
                                    <td className="px-3 py-2">{factor.status}</td>
                                    <td className="px-3 py-2">{factor.impact}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Subject-wise Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    Subject-wise Breakdown
                    <span className="text-xs font-normal text-slate-500">({localTerm || 'Current'})</span>
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-3 py-2">Subject</th>
                                <th className="text-left px-3 py-2">Marks</th>
                                <th className="text-left px-3 py-2">Attendance</th>
                                <th className="text-left px-3 py-2">Class Avg</th>
                                <th className="text-left px-3 py-2">Gap</th>
                                <th className="text-left px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {student.subjectBreakdown.map((subject, idx) => (
                                <tr key={idx}>
                                    <td className="px-3 py-2 font-medium">{subject.subject}</td>
                                    <td className={`px-3 py-2 font-medium ${subject.marks < 50 ? 'text-red-600' : 'text-slate-800'}`}>
                                        {subject.marks}%
                                    </td>
                                    <td className="px-3 py-2">{subject.attendance}%</td>
                                    <td className="px-3 py-2">{subject.classAvg}%</td>
                                    <td className="px-3 py-2 text-red-600">{subject.gap}%</td>
                                    <td className="px-3 py-2">{subject.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Historical Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Historical Performance (All Terms)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-3 py-2">Term</th>
                                <th className="text-left px-3 py-2">Attendance</th>
                                <th className="text-left px-3 py-2">Marks</th>
                                <th className="text-left px-3 py-2">CAT</th>
                                <th className="text-left px-3 py-2">Exam</th>
                                <th className="text-left px-3 py-2">Failed Subjects</th>
                                <th className="text-left px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {student.historical.map((record, idx) => (
                                <tr key={idx}>
                                    <td className="px-3 py-2 font-medium">{record.term}</td>
                                    <td className="px-3 py-2">{record.attendance}%</td>
                                    <td className={`px-3 py-2 font-medium ${record.marks < 50 ? 'text-red-600' : 'text-slate-800'}`}>
                                        {record.marks}%
                                    </td>
                                    <td className="px-3 py-2">{record.cat}%</td>
                                    <td className="px-3 py-2">{record.exam}%</td>
                                    <td className="px-3 py-2">{record.fails}</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'Failing' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recommended Interventions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Recommended Interventions
                </h3>
                <div className="space-y-3">
                    {student.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 bg-white/50 rounded-lg">
                            <span className="text-indigo-600 font-bold min-w-[24px]">{idx + 1}.</span>
                            <p className="text-slate-700">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentDrillDown;


// // components/admin/analytics/StudentDrillDown.tsx
// import React, { useState } from 'react';
// import {
//     ArrowLeft,
//     Mail,
//     Download,
//     Sparkles,
//     TrendingUp,
//     TrendingDown,
//     AlertTriangle,
//     Award,
//     Calendar
// } from 'lucide-react';
// import { StudentDetail } from '@/services/analyticsService';

// interface StudentDrillDownProps {
//     student: StudentDetail;
//     loading: boolean;
//     onBack: () => void;
//     onExportPDF: () => void;
//     onEmailReport: () => void;
//     selectedTerm?: string;
//     onTermChange?: (term: string) => void;  // ADD THIS - callback when term changes
// }

// const StudentDrillDown: React.FC<StudentDrillDownProps> = ({
//     student,
//     loading,
//     onBack,
//     onExportPDF,
//     onEmailReport,
//     selectedTerm = 'Term 4, 2025',
//     onTermChange
// }) => {
//     const [localTerm, setLocalTerm] = useState(selectedTerm);

//     const availableTerms = [
//         { value: 'Term 1, 2024', label: 'Term 1, 2024' },
//         { value: 'Term 2, 2024', label: 'Term 2, 2024' },
//         { value: 'Term 3, 2024', label: 'Term 3, 2024' },
//         { value: 'Term 4, 2024', label: 'Term 4, 2024' },
//         { value: 'Term 1, 2025', label: 'Term 1, 2025' },
//         { value: 'Term 2, 2025', label: 'Term 2, 2025' },
//         { value: 'Term 3, 2025', label: 'Term 3, 2025' },
//         { value: 'Term 4, 2025', label: 'Term 4, 2025 (Current)' }
//     ];

//     const handleTermChange = (term: string) => {
//         setLocalTerm(term);
//         if (onTermChange) {
//             onTermChange(term);
//         }
//     };

//     // if (loading) {
//     //     return (
//     //         <div className="bg-white rounded-xl p-12 text-center">
//     //             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
//     //             <p className="text-slate-500 mt-2">Loading student data...</p>
//     //         </div>
//     //     );
//     // }

//     return (
//         <div className="space-y-6">
//             {/* Back Button and Term Selector */}
//             <div className="flex justify-between items-center">
//                 <button
//                     onClick={onBack}
//                     className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
//                 >
//                     <ArrowLeft className="w-4 h-4" />
//                     Back to Dashboard
//                 </button>

//                 <div className="flex items-center gap-3">
//                     <Calendar className="w-4 h-4 text-slate-400" />
//                     <select
//                         value={localTerm}
//                         onChange={(e) => handleTermChange(e.target.value)}
//                         className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
//                     >
//                         {availableTerms.map(term => (
//                             <option key={term.value} value={term.value}>{term.label}</option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//             {/* Student Header */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <div className="flex flex-wrap justify-between items-start gap-4">
//                     <div>
//                         <div className="flex items-center gap-3 mb-2 flex-wrap">
//                             <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
//                             <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.status === 'At-Risk (Critical)' ? 'bg-red-100 text-red-700' :
//                                 student.status === 'At-Risk (High)' ? 'bg-orange-100 text-orange-700' :
//                                     'bg-yellow-100 text-yellow-700'
//                                 }`}>
//                                 {student.status}
//                             </span>
//                         </div>
//                         <p className="text-slate-500">
//                             <p className="text-slate-500">
//                                 📚 {student.grade}  | Exam No: {student.examNumber}
//                             </p>
//                         </p>
//                         <p className="text-slate-500 text-sm">👩‍🏫 Class Teacher: {student.classTeacher}</p>
//                     </div>
//                     <div className="flex gap-2">
//                         <button
//                             onClick={onEmailReport}
//                             className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"
//                         >
//                             <Mail className="w-4 h-4" />
//                             Email Report
//                         </button>
//                         <button
//                             onClick={onExportPDF}
//                             className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"
//                         >
//                             <Download className="w-4 h-4" />
//                             PDF Report
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Student KPI Cards - These would update based on selected term */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <p className="text-sm text-slate-500">Marks ({localTerm})</p>
//                     <p className={`text-2xl font-bold ${student.currentMarks < 50 ? 'text-red-600' : student.currentMarks < 65 ? 'text-yellow-600' : 'text-green-600'}`}>
//                         {student.currentMarks}%
//                     </p>
//                     <p className="text-xs text-red-500">▼ Below passing</p>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <p className="text-sm text-slate-500">Attendance ({localTerm})</p>
//                     <p className={`text-2xl font-bold ${student.currentAttendance < 70 ? 'text-red-600' : student.currentAttendance < 85 ? 'text-yellow-600' : 'text-green-600'}`}>
//                         {student.currentAttendance}%
//                     </p>
//                     <p className="text-xs text-red-500">▼ Below 60%</p>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <p className="text-sm text-slate-500">Term-over-Term</p>
//                     <p className="text-2xl font-bold text-red-600">{student.termOverTerm}%</p>
//                     <p className="text-xs text-red-500">▼ Declining</p>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <p className="text-sm text-slate-500">Class Rank</p>
//                     <p className="text-2xl font-bold text-slate-800">{student.classRank}</p>
//                     <p className="text-xs text-slate-500">Needs improvement</p>
//                 </div>
//             </div>

//             {/* Performance Timeline */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <h3 className="font-semibold text-slate-800 mb-4">Performance Timeline (All Terms)</h3>
//                 <div className="h-64 relative">
//                     <div className="absolute inset-0 flex items-end justify-between">
//                         {student.timeline.map((point, idx) => (
//                             <div key={idx} className="flex-1 flex flex-col items-center px-2">
//                                 <div
//                                     className="w-full bg-indigo-500 rounded-t transition-all duration-500 hover:bg-indigo-600"
//                                     style={{ height: `${point.marks * 1.2}px`, maxHeight: '100px' }}
//                                 />
//                                 <span className="text-xs text-slate-500 mt-2">{point.term}</span>
//                                 <span className="text-xs font-medium">{point.marks}%</span>
//                                 <span className="text-xs text-slate-400">Att: {point.attendance}%</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//                 <div className="mt-4 p-3 bg-slate-50 rounded-lg text-center">
//                     <p className="text-sm text-slate-600">
//                         Attendance Trend: {student.timeline.map(t => t.attendance).join('% → ')}%
//                     </p>
//                 </div>
//             </div>

//             {/* Factor Breakdown */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <h3 className="font-semibold text-slate-800 mb-4">Factor Breakdown – Why is this student struggling?</h3>
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="text-left px-3 py-2">Factor</th>
//                                 <th className="text-left px-3 py-2">Student Value</th>
//                                 <th className="text-left px-3 py-2">Class Avg</th>
//                                 <th className="text-left px-3 py-2">Status</th>
//                                 <th className="text-left px-3 py-2">Impact</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {student.factorBreakdown.map((factor, idx) => (
//                                 <tr key={idx}>
//                                     <td className="px-3 py-2 font-medium">{factor.factor}</td>
//                                     <td className="px-3 py-2">{factor.studentValue}</td>
//                                     <td className="px-3 py-2">{factor.classAvg}</td>
//                                     <td className="px-3 py-2">{factor.status}</td>
//                                     <td className="px-3 py-2">{factor.impact}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Subject-wise Breakdown */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                     Subject-wise Breakdown
//                     <span className="text-xs font-normal text-slate-500">({localTerm})</span>
//                 </h3>
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="text-left px-3 py-2">Subject</th>
//                                 <th className="text-left px-3 py-2">Marks</th>
//                                 <th className="text-left px-3 py-2">Attendance</th>
//                                 <th className="text-left px-3 py-2">Class Avg</th>
//                                 <th className="text-left px-3 py-2">Gap</th>
//                                 <th className="text-left px-3 py-2">Status</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {student.subjectBreakdown.map((subject, idx) => (
//                                 <tr key={idx}>
//                                     <td className="px-3 py-2 font-medium">{subject.subject}</td>
//                                     <td className={`px-3 py-2 font-medium ${subject.marks < 50 ? 'text-red-600' : 'text-slate-800'}`}>
//                                         {subject.marks}%
//                                     </td>
//                                     <td className="px-3 py-2">{subject.attendance}%</td>
//                                     <td className="px-3 py-2">{subject.classAvg}%</td>
//                                     <td className="px-3 py-2 text-red-600">{subject.gap}%</td>
//                                     <td className="px-3 py-2">{subject.status}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Historical Performance */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <h3 className="font-semibold text-slate-800 mb-4">Historical Performance (All Terms)</h3>
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="text-left px-3 py-2">Term</th>
//                                 <th className="text-left px-3 py-2">Attendance</th>
//                                 <th className="text-left px-3 py-2">Marks</th>
//                                 <th className="text-left px-3 py-2">CAT</th>
//                                 <th className="text-left px-3 py-2">Exam</th>
//                                 <th className="text-left px-3 py-2">Failed Subjects</th>
//                                 <th className="text-left px-3 py-2">Status</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {student.historical.map((record, idx) => (
//                                 <tr key={idx}>
//                                     <td className="px-3 py-2 font-medium">{record.term}</td>
//                                     <td className="px-3 py-2">{record.attendance}%</td>
//                                     <td className={`px-3 py-2 font-medium ${record.marks < 50 ? 'text-red-600' : 'text-slate-800'}`}>
//                                         {record.marks}%
//                                     </td>
//                                     <td className="px-3 py-2">{record.cat}%</td>
//                                     <td className="px-3 py-2">{record.exam}%</td>
//                                     <td className="px-3 py-2">{record.fails}</td>
//                                     <td className="px-3 py-2">
//                                         <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'Failing' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//                                             {record.status}
//                                         </span>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Recommended Interventions */}
//             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
//                 <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                     <Sparkles className="w-5 h-5 text-indigo-600" />
//                     Recommended Interventions
//                 </h3>
//                 <div className="space-y-3">
//                     {student.recommendations.map((rec, idx) => (
//                         <div key={idx} className="flex items-start gap-3 p-2 bg-white/50 rounded-lg">
//                             <span className="text-indigo-600 font-bold min-w-[24px]">{idx + 1}.</span>
//                             <p className="text-slate-700">{rec}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default StudentDrillDown;