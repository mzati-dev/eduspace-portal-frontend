// components/admin/analytics/StudentExamDetail.tsx
import React from 'react';
import { X, Award, AlertTriangle, GraduationCap } from 'lucide-react';

interface StudentExamDetailProps {
    student: any;
    examType: 'PSLCE' | 'JCE' | 'MSCE';
    onClose: () => void;
}

const StudentExamDetail: React.FC<StudentExamDetailProps> = ({ student, examType, onClose }) => {
    const isMSCE = examType === 'MSCE';
    const isJCE = examType === 'JCE';
    const isPSLCE = examType === 'PSLCE';

    // Mock subject data for PSLCE (percentage scores)
    const getPSLCESubjects = () => ({
        english: 85,
        math: 82,
        science: 88,
        chichewa: 90,
        social: 84
    });

    // Mock subject data for JCE (letter grades A-F)
    const getJCESubjects = () => ({
        english: 'A',
        math: 'B',
        biology: 'A',
        chemistry: 'B',
        physics: 'B'
    });

    // Mock subject data for MSCE (POINTS only - lower is better)
    const getMSCESubjects = () => ({
        english: 8,
        math: 6,
        biology: 9,
        chemistry: 11,
        physics: 13
    });

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-green-100 text-green-700';
            case 'B': return 'bg-blue-100 text-blue-700';
            case 'C': return 'bg-yellow-100 text-yellow-700';
            case 'D': return 'bg-orange-100 text-orange-700';
            case 'E': return 'bg-red-100 text-red-700';
            case 'F': return 'bg-red-200 text-red-800';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPointsColor = (points: number) => {
        if (points <= 10) return 'text-green-600 font-bold';
        if (points <= 20) return 'text-blue-600';
        if (points <= 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-blue-600';
        return 'text-red-600';
    };

    const getPointsGrade = (points: number) => {
        if (points <= 10) return 'Excellent';
        if (points <= 20) return 'Good';
        if (points <= 30) return 'Average';
        return 'Needs Improvement';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                            <p className="text-slate-500">
                                {student.examNumber} • {student.grade}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6 flex items-center gap-3 flex-wrap">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${student.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {student.passed ? 'Passed' : 'Failed'}
                        </div>
                        {isMSCE && (
                            <div className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                                Total Points: {student.points}
                            </div>
                        )}
                        {isPSLCE && student.selectedTo && (
                            <div className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                                Selected: {student.selectedTo}
                            </div>
                        )}
                        {isMSCE && student.selectedTo && (
                            <div className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                                {student.selectedTo} - {student.program}
                            </div>
                        )}
                    </div>

                    {/* Subject Results */}
                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                            Subject Results
                        </h3>

                        {isPSLCE && (
                            <div className="space-y-3">
                                {Object.entries(getPSLCESubjects()).map(([subject, score]) => (
                                    <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="font-medium text-slate-700 capitalize">{subject}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${score}%` }}
                                                />
                                            </div>
                                            <span className={`font-bold w-12 text-right ${getScoreColor(score as number)}`}>
                                                {score}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        📊 Average Score: {(Object.values(getPSLCESubjects()).reduce((a, b) => a + b, 0) / 5).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        )}

                        {isJCE && (
                            <div className="space-y-3">
                                {Object.entries(getJCESubjects()).map(([subject, grade]) => (
                                    <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="font-medium text-slate-700 capitalize">{subject}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(grade as string)}`}>
                                            {grade}
                                        </span>
                                    </div>
                                ))}
                                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        📊 Best Subject: {Object.entries(getJCESubjects()).find(([_, g]) => g === 'A')?.[0] || 'None'} (A)
                                    </p>
                                </div>
                            </div>
                        )}

                        {isMSCE && (
                            <div className="space-y-3">
                                {Object.entries(getMSCESubjects()).map(([subject, points]) => (
                                    <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="font-medium text-slate-700 capitalize">{subject}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${100 - ((points as number) / 36) * 100}%` }}
                                                />
                                            </div>
                                            <span className={`font-bold w-12 text-right ${getPointsColor(points as number)}`}>
                                                {points} pts
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        📊 Total Points: {student.points} - {getPointsGrade(student.points)}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">* Lower points = better performance (1 is best, 36 is worst)</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    <div className="border-t border-slate-200 pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-600" />
                            Recommendations
                        </h3>
                        {student.passed ? (
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-green-700">
                                    ✅ Student has successfully completed {examType === 'PSLCE' ? 'Standard 8' : examType === 'JCE' ? 'Form 2' : 'Form 4'}.
                                    {isPSLCE && student.selectedTo && ` Selected to ${student.selectedTo} for secondary education.`}
                                    {isMSCE && student.selectedTo && ` Selected to ${student.selectedTo} for ${student.program}.`}
                                </p>
                            </div>
                        ) : (
                            <div className="p-3 bg-red-50 rounded-lg">
                                <p className="text-red-700 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    ⚠️ Student did not pass. Requires remedial support and re-examination.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentExamDetail;

// // components/admin/analytics/StudentExamDetail.tsx
// import React from 'react';
// import { X, Award, AlertTriangle, GraduationCap } from 'lucide-react';

// interface StudentExamDetailProps {
//     student: any;
//     examType: 'PSLCE' | 'JCE' | 'MSCE';
//     onClose: () => void;
// }

// const StudentExamDetail: React.FC<StudentExamDetailProps> = ({ student, examType, onClose }) => {
//     const isMSCE = examType === 'MSCE';
//     const isJCE = examType === 'JCE';
//     const isPSLCE = examType === 'PSLCE';

//     // Mock subject data for PSLCE (would come from backend)
//     const getPSLCESubjects = () => ({
//         english: 85,
//         math: 82,
//         science: 88,
//         chichewa: 90,
//         social: 84
//     });

//     // Mock subject data for JCE (would come from backend)
//     const getJCESubjects = () => ({
//         english: 'A',
//         math: 'B',
//         biology: 'A',
//         chemistry: 'B',
//         physics: 'B'
//     });

//     // Mock subject data for MSCE (would come from backend)
//     const getMSCESubjects = () => ({
//         english: 'A',
//         math: 'A',
//         biology: 'A',
//         chemistry: 'B',
//         physics: 'B'
//     });

//     const getGradeColor = (grade: string) => {
//         switch (grade) {
//             case 'A': return 'bg-green-100 text-green-700';
//             case 'B': return 'bg-blue-100 text-blue-700';
//             case 'C': return 'bg-yellow-100 text-yellow-700';
//             case 'D': return 'bg-orange-100 text-orange-700';
//             case 'E': return 'bg-red-100 text-red-700';
//             case 'F': return 'bg-red-200 text-red-800';
//             default: return 'bg-slate-100 text-slate-700';
//         }
//     };

//     const getScoreColor = (score: number) => {
//         if (score >= 80) return 'text-green-600';
//         if (score >= 50) return 'text-blue-600';
//         return 'text-red-600';
//     };

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//                 <div className="p-6">
//                     {/* Header */}
//                     <div className="flex justify-between items-center mb-6">
//                         <div>
//                             <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
//                             <p className="text-slate-500">
//                                 {student.examNumber} • {student.grade}
//                             </p>
//                         </div>
//                         <button
//                             onClick={onClose}
//                             className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                         >
//                             <X className="w-5 h-5 text-slate-500" />
//                         </button>
//                     </div>

//                     {/* Status Badge */}
//                     <div className="mb-6 flex items-center gap-3">
//                         <div className={`px-3 py-1 rounded-full text-sm font-medium ${student.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                             {student.passed ? 'Passed' : 'Failed'}
//                         </div>
//                         {isMSCE && (
//                             <div className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
//                                 Points: {student.points}
//                             </div>
//                         )}
//                         {isPSLCE && student.selectedTo && (
//                             <div className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
//                                 Selected: {student.selectedTo}
//                             </div>
//                         )}
//                         {isMSCE && student.selectedTo && (
//                             <div className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
//                                 {student.selectedTo} - {student.program}
//                             </div>
//                         )}
//                     </div>

//                     {/* Subject Results */}
//                     <div className="border-t border-slate-200 pt-6">
//                         <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                             <GraduationCap className="w-5 h-5 text-indigo-600" />
//                             Subject Results
//                         </h3>

//                         {isPSLCE && (
//                             <div className="space-y-3">
//                                 {Object.entries(getPSLCESubjects()).map(([subject, score]) => (
//                                     <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
//                                         <span className="font-medium text-slate-700 capitalize">{subject}</span>
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
//                                                 <div
//                                                     className="h-full bg-indigo-500 rounded-full"
//                                                     style={{ width: `${score}%` }}
//                                                 />
//                                             </div>
//                                             <span className={`font-bold w-12 text-right ${getScoreColor(score as number)}`}>
//                                                 {score}%
//                                             </span>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                                     <p className="text-sm text-green-700">
//                                         📊 Average Score: {(Object.values(getPSLCESubjects()).reduce((a, b) => a + b, 0) / 5).toFixed(1)}%
//                                     </p>
//                                 </div>
//                             </div>
//                         )}

//                         {isJCE && (
//                             <div className="space-y-3">
//                                 {Object.entries(getJCESubjects()).map(([subject, grade]) => (
//                                     <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
//                                         <span className="font-medium text-slate-700 capitalize">{subject}</span>
//                                         <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(grade as string)}`}>
//                                             {grade}
//                                         </span>
//                                     </div>
//                                 ))}
//                                 <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                                     <p className="text-sm text-green-700">
//                                         📊 Best Subject: {Object.entries(getJCESubjects()).find(([_, g]) => g === 'A')?.[0] || 'None'} (A)
//                                     </p>
//                                 </div>
//                             </div>
//                         )}

//                         {isMSCE && (
//                             <div className="space-y-3">
//                                 {Object.entries(getMSCESubjects()).map(([subject, grade]) => (
//                                     <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
//                                         <span className="font-medium text-slate-700 capitalize">{subject}</span>
//                                         <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(grade as string)}`}>
//                                             {grade}
//                                         </span>
//                                     </div>
//                                 ))}
//                                 <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                                     <p className="text-sm text-green-700">
//                                         📊 Total Points: {student.points} | Grade: {student.points <= 10 ? 'Excellent' : student.points <= 20 ? 'Good' : student.points <= 30 ? 'Average' : 'Needs Improvement'}
//                                     </p>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Recommendations */}
//                     <div className="border-t border-slate-200 pt-6 mt-6">
//                         <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                             <Award className="w-5 h-5 text-amber-600" />
//                             Recommendations
//                         </h3>
//                         {student.passed ? (
//                             <div className="p-3 bg-green-50 rounded-lg">
//                                 <p className="text-green-700">
//                                     ✅ Student has successfully completed {examType === 'PSLCE' ? 'Standard 8' : examType === 'JCE' ? 'Form 2' : 'Form 4'}.
//                                     {isPSLCE && student.selectedTo && ` Selected to ${student.selectedTo} for secondary education.`}
//                                     {isMSCE && student.selectedTo && ` Selected to ${student.selectedTo} for ${student.program}.`}
//                                 </p>
//                             </div>
//                         ) : (
//                             <div className="p-3 bg-red-50 rounded-lg">
//                                 <p className="text-red-700 flex items-center gap-2">
//                                     <AlertTriangle className="w-4 h-4" />
//                                     ⚠️ Student did not pass. Requires remedial support and re-examination.
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default StudentExamDetail;