import React from 'react';
import { Printer, Download } from 'lucide-react';
import { SubjectRecord } from '@/services/studentService';
import { GradeConfiguration } from '@/services/gradeConfigService';
import { ClassResultStudent } from '@/types/admin';

interface ClassResultsTableProps {
    classResults: ClassResultStudent[];
    subjects: SubjectRecord[];
    activeAssessmentType: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
    activeConfig: GradeConfiguration | null;
    calculateGrade: (score: number, passMark?: number) => string;
    onPrint: () => void;
    onExport: () => void;
}

const ClassResultsTable: React.FC<ClassResultsTableProps> = ({
    classResults,
    subjects,
    activeAssessmentType,
    activeConfig,
    calculateGrade,
    onPrint,
    onExport,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">
                    {activeAssessmentType === 'overall' ? 'Overall Results' :
                        activeAssessmentType === 'qa1' ? 'QA1 Results' :
                            activeAssessmentType === 'qa2' ? 'QA2 Results' : 'End Term Results'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Ranked by {activeAssessmentType === 'overall' ? 'overall average' : activeAssessmentType} score
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Rank</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam No.</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Name</th>
                            {activeAssessmentType === 'overall' ? (
                                <>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Total Score</th>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Average</th>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Overall Grade</th>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                </>
                            ) : (
                                subjects.map(subject => (
                                    <th key={subject.id} className="text-center px-4 py-3 text-sm font-semibold text-slate-600">
                                        {subject.name}
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {classResults.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        {student.rank <= 3 ? (
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${student.rank === 1 ? 'bg-amber-500' :
                                                    student.rank === 2 ? 'bg-slate-500' :
                                                        'bg-amber-700'
                                                }`}>
                                                {student.rank}
                                            </span>
                                        ) : (
                                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700">
                                                {student.rank}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>

                                {activeAssessmentType === 'overall' ? (
                                    <>
                                        <td className="px-4 py-3 text-center font-bold text-slate-800">{student.totalScore.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xl font-bold text-indigo-700">{student.average.toFixed(1)}%</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${student.overallGrade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                                    student.overallGrade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                        student.overallGrade === 'C' ? 'bg-amber-100 text-amber-700' :
                                                            student.overallGrade === 'D' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-red-100 text-red-700'
                                                }`}>
                                                {student.overallGrade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${student.overallGrade === 'F' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {student.overallGrade === 'F' ? 'Failed' : 'Passed'}
                                            </span>
                                        </td>
                                    </>
                                ) : (
                                    subjects.map(subject => {
                                        const studentSubject = student.subjects.find(s => s.name === subject.name);
                                        const score = studentSubject ?
                                            (activeAssessmentType === 'qa1' ? studentSubject.qa1 :
                                                activeAssessmentType === 'qa2' ? studentSubject.qa2 :
                                                    studentSubject.endOfTerm) : 0;

                                        return (
                                            <td key={subject.id} className="px-4 py-3 text-center">
                                                {score > 0 ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className={`font-bold ${score >= 80 ? 'text-emerald-700' :
                                                                score >= 60 ? 'text-blue-700' :
                                                                    score >= 50 ? 'text-amber-700' :
                                                                        'text-red-700'
                                                            }`}>
                                                            {score}%
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {calculateGrade(score, activeConfig?.pass_mark || 50)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                        );
                                    })
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button
                    onClick={onPrint}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2"
                >
                    <Printer className="w-4 h-4" />
                    Print Results
                </button>
                <button
                    onClick={onExport}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export as PDF
                </button>
            </div>
        </div>
    );
};

export default ClassResultsTable;