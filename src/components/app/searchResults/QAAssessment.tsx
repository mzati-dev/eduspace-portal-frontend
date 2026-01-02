import React from 'react';
import { StudentData } from '@/types';
import { TabType } from '@/types/app';
import { FileText } from 'lucide-react';

interface QAAssessmentProps {
    studentData: StudentData;
    activeTab: TabType;
}

const QAAssessment: React.FC<QAAssessmentProps> = ({ studentData, activeTab }) => {
    // Ensure activeTab is only qa1, qa2, or endOfTerm (reportCard shouldn't be passed here)
    const assessmentType = activeTab as 'qa1' | 'qa2' | 'endOfTerm';

    const getGradeColor = (grade: string) => {
        if (grade === 'N/A') return 'text-slate-600 bg-slate-100';
        if (grade.includes('A')) return 'text-emerald-600 bg-emerald-50';
        if (grade === 'B') return 'text-blue-600 bg-blue-50';
        if (grade === 'C') return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    const getScoreColor = (score: number) => {
        if (score === null || score === undefined || score <= 0) return 'bg-slate-300';
        const passMark = studentData.gradeConfiguration?.pass_mark || 50;
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-blue-500';
        if (score >= passMark) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const calculateAverage = (subjects: StudentData['subjects'], type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => {
        if (subjects.length === 0) return 'N/A';

        if (type === 'overall') {
            const validSubjects = subjects.filter(s => {
                const finalScore = s.finalScore || ((s.qa1 + s.qa2 + s.endOfTerm) / 3);
                return finalScore > 0;
            });

            if (validSubjects.length === 0) return 'N/A';

            const total = validSubjects.reduce((acc, s) => {
                const finalScore = s.finalScore || ((s.qa1 + s.qa2 + s.endOfTerm) / 3);
                return acc + finalScore;
            }, 0);
            return (total / validSubjects.length).toFixed(1);
        }

        const validSubjects = subjects.filter(s => s[type] !== null && s[type] !== undefined && s[type] > 0);
        if (validSubjects.length === 0) return 'N/A';

        const total = validSubjects.reduce((acc, s) => acc + s[type], 0);
        return (total / validSubjects.length).toFixed(1);
    };

    const hasValidScore = (score: number | null | undefined): boolean => {
        return score !== null && score !== undefined && score > 0;
    };

    const hasAssessmentScores = (type: 'qa1' | 'qa2' | 'endOfTerm'): boolean => {
        if (!studentData || !studentData.subjects || studentData.subjects.length === 0) {
            return false;
        }

        return studentData.subjects.some(subject => {
            const score = subject[type];
            return score !== null && score !== undefined && score > 0;
        });
    };

    if (!hasAssessmentScores(assessmentType)) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-700 mb-2">
                    No {assessmentType === 'qa1' ? 'Quarterly Assessment 1' :
                        assessmentType === 'qa2' ? 'Quarterly Assessment 2' :
                            'End of Term'} Scores
                </h4>
                <p className="text-slate-500 max-w-md mx-auto">
                    This student did not write the {assessmentType === 'qa1' ? 'first quarterly assessment' :
                        assessmentType === 'qa2' ? 'second quarterly assessment' :
                            'end of term examination'}.
                    Scores will appear here once entered by the teacher.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="text-slate-500">
                    Average Score: <span className="font-semibold text-indigo-600">
                        {calculateAverage(studentData.subjects, assessmentType) === 'N/A' ? 'No tests conducted' : `${calculateAverage(studentData.subjects, assessmentType)}%`}
                    </span>
                </p>
            </div>

            <div className="grid gap-4">
                {studentData.subjects.map((subject, index) => {
                    const score = subject[assessmentType];
                    const hasScore = hasValidScore(score);

                    const gradeForThisTab = (() => {
                        if (!hasScore) return 'N/A';
                        const passMark = studentData.gradeConfiguration?.pass_mark || 50;
                        if (score >= 80) return 'A';
                        if (score >= 70) return 'B';
                        if (score >= 60) return 'C';
                        if (score >= passMark) return 'D';
                        return 'F';
                    })();

                    return (
                        <div key={index} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1">
                                    <h5 className="font-semibold text-slate-800">{subject.name}</h5>
                                    {hasScore ? (
                                        <>
                                            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getScoreColor(score)} transition-all duration-500`}
                                                    style={{ width: `${Math.min(score, 100)}%` }}
                                                ></div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-2 text-sm text-amber-600 italic">
                                            No test conducted for {assessmentType === 'qa1' ? 'Quarterly Assessment 1' :
                                                assessmentType === 'qa2' ? 'Quarterly Assessment 2' :
                                                    'End of Term Examination'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        {hasScore ? (
                                            <>
                                                <p className="text-2xl font-bold text-slate-800">{score}%</p>
                                                <p className="text-xs text-slate-500">Score</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold text-slate-400">N/A</p>
                                                <p className="text-xs text-slate-400">No Score</p>
                                            </>
                                        )}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(gradeForThisTab)}`}>
                                        {gradeForThisTab}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QAAssessment;