// components/admin/analytics/GradeDrillDown.tsx
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface GradeDrillDownProps {
    gradeName: string;
    students: any[];
    onViewStudent: (studentId: string) => void;
    onBack: () => void;
    selectedTerm?: string;
    availableTerms?: { value: string; label: string }[];
    onTermChange?: (term: string) => void;
    loading?: boolean;
}

const GradeDrillDown: React.FC<GradeDrillDownProps> = ({
    gradeName,
    students,
    onViewStudent,
    onBack,
    selectedTerm = '',
    availableTerms = [],
    onTermChange,
    loading = false,
}) => {
    const [localTerm, setLocalTerm] = useState(selectedTerm);

    const handleTermChange = (term: string) => {
        setLocalTerm(term);
        if (onTermChange) {
            onTermChange(term);
        }
    };

    const getRiskBadge = (level: string) => {
        switch (level) {
            case 'critical': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">🔴 CRITICAL</span>;
            case 'high': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">🟠 HIGH</span>;
            case 'medium': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">🟡 MEDIUM</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">🟢 LOW</span>;
        }
    };

    // ✅ CHECK LOADING FIRST
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                        ← Back to Dashboard
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
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-slate-500 mt-4">Loading student data for {gradeName}...</p>
                    <p className="text-sm text-slate-400 mt-1">Fetching archived results...</p>
                </div>
            </div>
        );
    }

    // ✅ THEN CHECK EMPTY STUDENTS
    if (students.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                        ← Back to Dashboard
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
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <p className="text-slate-500">No students found in {gradeName}</p>
                </div>
            </div>
        );
    }

    // ✅ DISPLAY DATA
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                    ← Back to Dashboard
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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-800">{gradeName} - All Students</h2>
                <p className="text-slate-500 mt-1">
                    {students.length} students in this grade
                    {localTerm && <span className="ml-2 text-indigo-600">(Term: {localTerm})</span>}
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam No</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Average Score</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Subjects Passed</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Subjects Failed</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Level</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student) => {
                                const passedCount = student.passed || 0;

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${student.currentMarks < 50 ? 'text-red-600' : student.currentMarks < 65 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {Math.round(student.currentMarks)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {student.attendance ? (
                                                <span className={`font-medium ${student.attendance >= 90 ? 'text-emerald-600' :
                                                    student.attendance >= 75 ? 'text-blue-600' :
                                                        student.attendance >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {Math.round(student.attendance)}%
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="font-medium text-emerald-600">
                                                {passedCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-medium ${student.fails > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {student.fails}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{getRiskBadge(student.riskLevel)}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => onViewStudent(student.id)}
                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GradeDrillDown;

// // components/admin/analytics/GradeDrillDown.tsx
// import React, { useState } from 'react';
// import { Calendar } from 'lucide-react';

// interface GradeDrillDownProps {
//     gradeName: string;
//     students: any[];
//     onViewStudent: (studentId: string) => void;
//     onBack: () => void;
//     selectedTerm?: string;
//     availableTerms?: { value: string; label: string }[];
//     onTermChange?: (term: string) => void;
// }

// const GradeDrillDown: React.FC<GradeDrillDownProps> = ({
//     gradeName,
//     students,
//     onViewStudent,
//     onBack,
//     selectedTerm = '',
//     availableTerms = [],
//     onTermChange
// }) => {
//     const [localTerm, setLocalTerm] = useState(selectedTerm);

//     const handleTermChange = (term: string) => {
//         setLocalTerm(term);
//         if (onTermChange) {
//             onTermChange(term);
//         }
//     };

//     const getRiskBadge = (level: string) => {
//         switch (level) {
//             case 'critical': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">🔴 CRITICAL</span>;
//             case 'high': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">🟠 HIGH</span>;
//             case 'medium': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">🟡 MEDIUM</span>;
//             default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">🟢 LOW</span>;
//         }
//     };

//     if (students.length === 0) {
//         return (
//             <div className="space-y-6">
//                 <div className="flex justify-between items-center">
//                     <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
//                         ← Back to Dashboard
//                     </button>
//                     {availableTerms.length > 0 && (
//                         <div className="flex items-center gap-3">
//                             <Calendar className="w-4 h-4 text-slate-400" />
//                             <select
//                                 value={localTerm}
//                                 onChange={(e) => handleTermChange(e.target.value)}
//                                 className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
//                             >
//                                 {availableTerms.map(term => (
//                                     <option key={term.value} value={term.value}>{term.label}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     )}
//                 </div>
//                 <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
//                     <p className="text-slate-500">No students found in {gradeName}</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex justify-between items-center">
//                 <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
//                     ← Back to Dashboard
//                 </button>

//                 {availableTerms.length > 0 && (
//                     <div className="flex items-center gap-3">
//                         <Calendar className="w-4 h-4 text-slate-400" />
//                         <select
//                             value={localTerm}
//                             onChange={(e) => handleTermChange(e.target.value)}
//                             className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
//                         >
//                             {availableTerms.map(term => (
//                                 <option key={term.value} value={term.value}>{term.label}</option>
//                             ))}
//                         </select>
//                     </div>
//                 )}
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <h2 className="text-2xl font-bold text-slate-800">{gradeName} - All Students</h2>
//                 <p className="text-slate-500 mt-1">
//                     {students.length} students in this grade
//                     {localTerm && <span className="ml-2 text-indigo-600">(Term: {localTerm})</span>}
//                 </p>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam No</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Average Score</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance</th>  {/* ← ADD THIS LINE */}
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Subjects Passed</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Subjects Failed</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Level</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {students.map((student) => {
//                                 const passedCount = student.passed || 0;

//                                 return (
//                                     <tr key={student.id} className="hover:bg-slate-50 transition-colors">
//                                         <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                         <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
//                                         <td className="px-4 py-3">
//                                             <span className={`font-medium ${student.currentMarks < 50 ? 'text-red-600' : student.currentMarks < 65 ? 'text-yellow-600' : 'text-green-600'}`}>
//                                                 {Math.round(student.currentMarks)}%
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3">
//                                             {student.attendance ? (
//                                                 <span className={`font-medium ${student.attendance >= 90 ? 'text-emerald-600' :
//                                                         student.attendance >= 75 ? 'text-blue-600' :
//                                                             student.attendance >= 60 ? 'text-yellow-600' : 'text-red-600'
//                                                     }`}>
//                                                     {Math.round(student.attendance)}%
//                                                 </span>
//                                             ) : (
//                                                 <span className="text-slate-400 text-sm">-</span>
//                                             )}
//                                         </td>
//                                         <td className="px-4 py-3 text-center">
//                                             <span className="font-medium text-emerald-600">
//                                                 {passedCount}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 text-center">
//                                             <span className={`font-medium ${student.fails > 0 ? 'text-red-600' : 'text-green-600'}`}>
//                                                 {student.fails}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3">{getRiskBadge(student.riskLevel)}</td>
//                                         <td className="px-4 py-3">
//                                             <button
//                                                 onClick={() => onViewStudent(student.id)}
//                                                 className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
//                                             >
//                                                 View Profile
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default GradeDrillDown;