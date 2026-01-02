import React from 'react';
import { StudentData } from '@/types';
import { Download, Printer, CheckCircle, AlertCircle, TrendingUp, Calendar, User } from 'lucide-react';

interface ReportCardProps {
    studentData: StudentData;
    onPrint: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ studentData, onPrint }) => {
    const getGradeColor = (grade: string) => {
        if (grade === 'N/A') return 'text-slate-600 bg-slate-100';
        if (grade.includes('A')) return 'text-emerald-600 bg-emerald-50';
        if (grade === 'B') return 'text-blue-600 bg-blue-50';
        if (grade === 'C') return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
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

    const hasAssessmentScores = (assessmentType: 'qa1' | 'qa2' | 'endOfTerm'): boolean => {
        if (!studentData || !studentData.subjects || studentData.subjects.length === 0) {
            return false;
        }

        return studentData.subjects.some(subject => {
            const score = subject[assessmentType];
            return score !== null && score !== undefined && score > 0;
        });
    };

    const canGenerateReportCard = (): boolean => {
        if (!studentData || !studentData.gradeConfiguration) return true;

        const config = studentData.gradeConfiguration;

        if (config.calculation_method === 'end_of_term_only' && !hasAssessmentScores('endOfTerm')) {
            return false;
        }

        const hasAnyScores = hasAssessmentScores('qa1') ||
            hasAssessmentScores('qa2') ||
            hasAssessmentScores('endOfTerm');

        return hasAnyScores;
    };

    const calculateSubjectAverage = (subject: StudentData['subjects'][0]) => {
        const finalScore = subject.finalScore || ((subject.qa1 + subject.qa2 + subject.endOfTerm) / 3);
        return finalScore.toFixed(1);
    };

    const calculateOverallAverage = () => {
        if (studentData.assessmentStats?.overall?.termAverage) {
            return studentData.assessmentStats.overall.termAverage.toFixed(1);
        }
        return calculateAverage(studentData.subjects, 'overall');
    };

    const calculateGrandTotal = () => {
        const totalScored = studentData.subjects.reduce((sum, subject) => {
            const subjectAverage = parseFloat(calculateSubjectAverage(subject));
            return sum + subjectAverage;
        }, 0);
        return totalScored.toFixed(1);
    };

    const getOverallGrade = () => {
        const overallAverage = parseFloat(calculateOverallAverage());
        const passMark = studentData.gradeConfiguration?.pass_mark || 50;

        if (overallAverage >= 80) return 'A';
        if (overallAverage >= 70) return 'B';
        if (overallAverage >= 60) return 'C';
        if (overallAverage >= passMark) return 'D';
        return 'F';
    };

    const getOverallRemark = () => {
        const overallGrade = getOverallGrade();
        return overallGrade === 'F' ? 'FAILED' : 'PASSED';
    };

    const getOverallRemarkColor = () => {
        const overallGrade = getOverallGrade();
        return overallGrade === 'F' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
    };

    if (!canGenerateReportCard()) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-700 mb-2">
                    Report Card Not Available
                </h4>
                <p className="text-slate-500 max-w-md mx-auto">
                    {studentData.gradeConfiguration?.calculation_method === 'end_of_term_only'
                        ? 'This report card uses "End of Term Only" calculation, but no end of term scores have been submitted yet. Please check back after end of term exams are graded.'
                        : 'No assessment scores have been recorded for this student yet. Report card will be available once scores are entered.'
                    }
                </p>
                <div className="mt-4 text-sm text-slate-400">
                    Current grade calculation method: <span className="font-semibold">{studentData.gradeConfiguration?.configuration_name}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h4 className="text-xl font-bold text-slate-800">Complete Report Card</h4>
                    <p className="text-slate-500">{studentData.term}</p>
                    {studentData.gradeConfiguration && (
                        <p className="text-sm text-indigo-600 mt-1">
                            Grade Calculation: {studentData.gradeConfiguration.configuration_name}
                            {studentData.gradeConfiguration.calculation_method === 'weighted_average' &&
                                ` (QA1: ${studentData.gradeConfiguration.weight_qa1}%, QA2: ${studentData.gradeConfiguration.weight_qa2}%, End Term: ${studentData.gradeConfiguration.weight_end_of_term}%)`}
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onPrint}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
                    <p className="text-indigo-100 text-sm">Final Average</p>
                    <p className="text-3xl font-bold">{calculateOverallAverage()}%</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                    <p className="text-emerald-100 text-sm">Class Position</p>
                    <p className="text-3xl font-bold">{studentData.classRank}<span className="text-lg">/{studentData.totalStudents}</span></p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
                    <p className="text-amber-100 text-sm">Days Present</p>
                    <p className="text-3xl font-bold">{studentData.attendance.present}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-4 text-white">
                    <p className="text-rose-100 text-sm">Days Absent</p>
                    <p className="text-3xl font-bold">{studentData.attendance.absent}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h5 className="font-semibold text-slate-800">Final Results</h5>
                    <p className="text-sm text-slate-500 mt-1">
                        Based on {studentData.gradeConfiguration?.configuration_name || 'active grade configuration'}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Subject</th>
                                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Total Marks</th>
                                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Marks Scored</th>
                                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Grade</th>
                                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Remark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {studentData.subjects.map((subject, index) => {
                                const hasScores = subject.qa1 > 0 || subject.qa2 > 0 || subject.endOfTerm > 0;
                                if (!hasScores) return null;

                                const subjectAverage = parseFloat(calculateSubjectAverage(subject));
                                const remark = subject.grade === 'F' ? 'Failed' : 'Passed';

                                return (
                                    <tr key={index} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-800">{subject.name}</td>
                                        <td className="px-6 py-4 text-center text-slate-600">100</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-800">
                                            {subjectAverage}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(subject.grade)}`}>
                                                {subject.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${remark === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {remark}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-indigo-50 font-bold">
                                <td className="px-6 py-4 text-slate-800">GRAND TOTAL</td>
                                <td className="px-6 py-4 text-center text-slate-800">
                                    {studentData.subjects.length * 100}
                                </td>
                                <td className="px-6 py-4 text-center text-indigo-700">
                                    {calculateGrandTotal()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getOverallGrade())}`}>
                                        {getOverallGrade()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getOverallRemarkColor()}`}>
                                        {getOverallRemark()}
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                    <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        Teacher's Remarks
                    </h5>
                    <p className="text-slate-600 italic">"{studentData.teacherRemarks}"</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Performance Summary
                    </h5>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Total Subjects:</span>
                            <span className="font-semibold text-emerald-700">{studentData.subjects.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Subjects Passed:</span>
                            <span className="font-semibold text-emerald-700">
                                {studentData.subjects.filter(subject =>
                                    subject.grade && subject.grade !== 'F' && subject.grade !== 'N/A'
                                ).length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Overall Average:</span>
                            <span className="font-bold text-emerald-800">
                                {calculateOverallAverage()}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Attendance Summary
                </h5>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-emerald-700">{studentData.attendance.present}</p>
                        <p className="text-sm text-emerald-600">Days Present</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-700">{studentData.attendance.absent}</p>
                        <p className="text-sm text-red-600">Days Absent</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-amber-700">{studentData.attendance.late}</p>
                        <p className="text-sm text-amber-600">Days Late</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500 text-center">
                        Attendance Rate: {Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100)}%
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-6">
                <div className="text-center">
                    <h6 className="text-lg font-bold mb-2">Report Card Generated</h6>
                    <p className="text-slate-300 mb-4">
                        This report card was generated based on the school's active grade calculation configuration.
                        For any questions or clarifications, please contact the school administration.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-slate-400">
                        <div>Generated on: {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;