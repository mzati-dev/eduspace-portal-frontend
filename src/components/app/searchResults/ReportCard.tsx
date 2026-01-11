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

    // Calculate final score based on grade configuration
    const calculateFinalScore = (
        qa1: number,
        qa2: number,
        endOfTerm: number,
        gradeConfig: StudentData['gradeConfiguration']
    ): number => {
        if (!gradeConfig) {
            // Default to average of all
            return (qa1 + qa2 + endOfTerm) / 3;
        }

        const method = gradeConfig.calculation_method;

        switch (method) {
            case 'end_of_term_only':
                return endOfTerm;

            case 'average_all':
                return (qa1 + qa2 + endOfTerm) / 3;

            case 'weighted_average':
                const totalWeight = gradeConfig.weight_qa1 + gradeConfig.weight_qa2 + gradeConfig.weight_end_of_term;
                const weightedSum =
                    (qa1 * gradeConfig.weight_qa1) +
                    (qa2 * gradeConfig.weight_qa2) +
                    (endOfTerm * gradeConfig.weight_end_of_term);
                return weightedSum / totalWeight;

            default:
                return (qa1 + qa2 + endOfTerm) / 3;
        }
    };

    // Calculate grade based on score and pass mark
    const calculateGrade = (score: number, passMark?: number): string => {
        const effectivePassMark = passMark || 50;

        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= effectivePassMark) return 'D';
        return 'F';
    };

    // Calculate subject average with grade configuration
    const calculateSubjectAverage = (subject: StudentData['subjects'][0]): number => {
        if (subject.finalScore) {
            return subject.finalScore;
        }

        return calculateFinalScore(
            subject.qa1,
            subject.qa2,
            subject.endOfTerm,
            studentData.gradeConfiguration
        );
    };

    const calculateAverage = (subjects: StudentData['subjects'], type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => {
        if (subjects.length === 0) return 'N/A';

        if (type === 'overall') {
            const validSubjects = subjects.filter(s => {
                const finalScore = calculateSubjectAverage(s);
                return finalScore > 0;
            });

            if (validSubjects.length === 0) return 'N/A';

            const total = validSubjects.reduce((acc, s) => {
                const finalScore = calculateSubjectAverage(s);
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

    const calculateSubjectAverageFormatted = (subject: StudentData['subjects'][0]): string => {
        const average = calculateSubjectAverage(subject);
        return average.toFixed(1);
    };

    const calculateOverallAverage = (): string => {
        if (studentData.assessmentStats?.overall?.termAverage) {
            return studentData.assessmentStats.overall.termAverage.toFixed(1);
        }
        return calculateAverage(studentData.subjects, 'overall');
    };

    const calculateGrandTotal = (): string => {
        const totalScored = studentData.subjects.reduce((sum, subject) => {
            const subjectAverage = calculateSubjectAverage(subject);
            return sum + subjectAverage;
        }, 0);
        return totalScored.toFixed(1);
    };

    const getOverallGrade = (): string => {
        const overallAverage = parseFloat(calculateOverallAverage());
        const passMark = studentData.gradeConfiguration?.pass_mark || 50;
        return calculateGrade(overallAverage, passMark);
    };

    const getSubjectGrade = (subject: StudentData['subjects'][0]): string => {
        const subjectAverage = calculateSubjectAverage(subject);
        const passMark = studentData.gradeConfiguration?.pass_mark || 50;
        return calculateGrade(subjectAverage, passMark);
    };

    const getSubjectRemark = (subject: StudentData['subjects'][0]): string => {
        const grade = getSubjectGrade(subject);
        return grade === 'F' ? 'Failed' : 'Passed';
    };

    const getOverallRemark = (): string => {
        const overallGrade = getOverallGrade();
        return overallGrade === 'F' ? 'FAILED' : 'PASSED';
    };

    const getOverallRemarkColor = (): string => {
        const overallGrade = getOverallGrade();
        return overallGrade === 'F' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
    };

    const getSubjectRemarkColor = (remark: string): string => {
        return remark === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';
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

            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            </div> */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Final Average */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
                    <p className="text-indigo-100 text-sm">Final Average</p>
                    <p className="text-3xl font-bold">{calculateOverallAverage()}%</p>
                </div>

                {/* Class Position */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                    <p className="text-emerald-100 text-sm">Class Position</p>
                    <p className="text-3xl font-bold">{studentData.classRank}<span className="text-lg">/{studentData.totalStudents}</span></p>
                </div>

                {/* Pass/Fail Status */}
                <div className={`${getOverallGrade() === 'F' ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'} rounded-xl p-4 text-white`}>
                    <p className="text-white/90 text-sm">Overall Status</p>
                    <p className="text-3xl font-bold">{getOverallRemark()}</p>
                    {/* <p className="text-xs opacity-90 mt-1">{getOverallGrade()} Grade</p> */}
                </div>

                {/* Overall Grade */}
                <div className={`${getOverallGrade() === 'A' || getOverallGrade() === 'B' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : getOverallGrade() === 'C' || getOverallGrade() === 'D' ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-slate-500 to-slate-600'} rounded-xl p-4 text-white`}>
                    <p className="text-white/90 text-sm">Overall Grade</p>
                    <p className="text-3xl font-bold">{getOverallGrade()}</p>
                    <p className="text-xs opacity-90 mt-1">
                        {getOverallGrade() === 'A' ? 'Excellent' :
                            getOverallGrade() === 'B' ? 'Good' :
                                getOverallGrade() === 'C' ? 'Satisfactory' :
                                    getOverallGrade() === 'D' ? 'Passing' : 'Needs Improvement'}
                    </p>
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

                                const subjectAverage = calculateSubjectAverage(subject);
                                const subjectAverageFormatted = subjectAverage.toFixed(1);
                                const grade = getSubjectGrade(subject);
                                const remark = getSubjectRemark(subject);

                                return (
                                    <tr key={index} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-800">{subject.name}</td>
                                        <td className="px-6 py-4 text-center text-slate-600">100</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-800">
                                            {subjectAverageFormatted}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(grade)}`}>
                                                {grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSubjectRemarkColor(remark)}`}>
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

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                {studentData.subjects.filter(subject => {
                                    const grade = getSubjectGrade(subject);
                                    return grade && grade !== 'F' && grade !== 'N/A';
                                }).length}
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
            </div> */}

            {/* <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Performance Analysis
                </h5>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-slate-500">Strongest Subject</p>
                            <p className="font-bold text-emerald-700">
                                {(() => {
                                    const bestSubject = studentData.subjects.reduce((best, current) => {
                                        const currentAvg = calculateSubjectAverage(current);
                                        const bestAvg = calculateSubjectAverage(best);
                                        return currentAvg > bestAvg ? current : best;
                                    });
                                    return bestSubject.name;
                                })()}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Score: {Math.round(calculateSubjectAverage(studentData.subjects.reduce((best, current) => {
                                    const currentAvg = calculateSubjectAverage(current);
                                    const bestAvg = calculateSubjectAverage(best);
                                    return currentAvg > bestAvg ? current : best;
                                })))}%
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-slate-500">Needs Improvement</p>
                            <p className="font-bold text-amber-700">
                                {(() => {
                                    const weakSubject = studentData.subjects.reduce((weak, current) => {
                                        const currentAvg = calculateSubjectAverage(current);
                                        const weakAvg = calculateSubjectAverage(weak);
                                        return currentAvg < weakAvg ? current : weak;
                                    });
                                    return weakSubject.name;
                                })()}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Score: {Math.round(calculateSubjectAverage(studentData.subjects.reduce((weak, current) => {
                                    const currentAvg = calculateSubjectAverage(current);
                                    const weakAvg = calculateSubjectAverage(weak);
                                    return currentAvg < weakAvg ? current : weak;
                                })))}%
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Subjects Passed:</span>
                            <span className="font-bold text-emerald-800">
                                {Math.round((studentData.subjects.filter(subject => {
                                    const grade = getSubjectGrade(subject);
                                    return grade && grade !== 'F';
                                }).length / studentData.subjects.length) * 100)}%
                                <span className="text-slate-500 text-xs ml-1">
                                    ({studentData.subjects.filter(subject => {
                                        const grade = getSubjectGrade(subject);
                                        return grade && grade !== 'F';
                                    }).length}/{studentData.subjects.length})
                                </span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">A/B Grades:</span>
                            <span className="font-bold text-blue-800">
                                {studentData.subjects.filter(subject => {
                                    const grade = getSubjectGrade(subject);
                                    return grade === 'A' || grade === 'B';
                                }).length}
                                <span className="text-slate-500 text-xs ml-1">subjects</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Subjects Below 60%:</span>
                            <span className="font-bold text-rose-800">
                                {studentData.subjects.filter(subject => {
                                    const score = calculateSubjectAverage(subject);
                                    return score < 60;
                                }).length}
                                <span className="text-slate-500 text-xs ml-1">subjects</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div> */}

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Performance Analysis
                </h5>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-slate-500">Strongest Subject</p>
                            <p className="font-bold text-emerald-700">
                                {(() => {
                                    const bestSubject = studentData.subjects.reduce((best, current) => {
                                        const currentAvg = calculateSubjectAverage(current);
                                        const bestAvg = calculateSubjectAverage(best);
                                        return currentAvg > bestAvg ? current : best;
                                    });
                                    return bestSubject.name;
                                })()}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Score: {Math.round(calculateSubjectAverage(studentData.subjects.reduce((best, current) => {
                                    const currentAvg = calculateSubjectAverage(current);
                                    const bestAvg = calculateSubjectAverage(best);
                                    return currentAvg > bestAvg ? current : best;
                                })))}%
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-slate-500">Needs Improvement</p>
                            <p className="font-bold text-amber-700">
                                {(() => {
                                    const weakSubject = studentData.subjects.reduce((weak, current) => {
                                        const currentAvg = calculateSubjectAverage(current);
                                        const weakAvg = calculateSubjectAverage(weak);
                                        return currentAvg < weakAvg ? current : weak;
                                    });
                                    return weakSubject.name;
                                })()}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Score: {Math.round(calculateSubjectAverage(studentData.subjects.reduce((weak, current) => {
                                    const currentAvg = calculateSubjectAverage(current);
                                    const weakAvg = calculateSubjectAverage(weak);
                                    return currentAvg < weakAvg ? current : weak;
                                })))}%
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Subjects Passed:</span>
                            <span className="font-bold text-emerald-800">
                                {studentData.subjects.filter(subject => {
                                    const grade = getSubjectGrade(subject);
                                    return grade && grade !== 'F';
                                }).length}/{studentData.subjects.length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">A & B Grades:</span>
                            <span className="font-bold text-blue-800">
                                {studentData.subjects.filter(subject => {
                                    const grade = getSubjectGrade(subject);
                                    return grade === 'A' || grade === 'B';
                                }).length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">C & D Grades:</span>
                            <span className="font-bold text-amber-800">
                                {studentData.subjects.filter(subject => {
                                    const grade = getSubjectGrade(subject);
                                    return grade === 'C' || grade === 'D';
                                }).length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Subjects Below Pass Mark {studentData.gradeConfiguration?.pass_mark || 50}%:</span>
                            <span className="font-bold text-rose-800">
                                {studentData.subjects.filter(subject => {
                                    const score = calculateSubjectAverage(subject);
                                    const passMark = studentData.gradeConfiguration?.pass_mark || 50;
                                    return score < passMark;
                                }).length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="bg-white rounded-xl p-6 border border-slate-200">
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
            </div> */}

            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Attendance Details
                </h5>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">
                            <p className="text-sm text-blue-600">Total School Days</p>
                            {studentData.attendance.present + studentData.attendance.absent}
                        </p>

                    </div>

                    {/* <div className={`${Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100) >= 75 ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-orange-50 to-orange-100'} rounded-xl p-4`}>
                        <p className="text-slate-800 text-sm">Attendance</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100)}%
                        </p>
                        <p className="text-xs text-slate-600 mt-1">{studentData.attendance.present}/{studentData.attendance.present + studentData.attendance.absent}</p>
                    </div> */}

                    <div className={`${Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100) >= 75 ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-orange-50 to-orange-100'} rounded-xl p-4`}>
                        <p className={`text-sm font-medium ${Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100) >= 75 ? 'text-green-800' : 'text-orange-800'}`}>
                            Attendance Rate
                        </p>
                        <p className={`text-2xl font-bold ${Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100) >= 75 ? 'text-green-900' : 'text-orange-900'}`}>
                            {Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100)}%
                        </p>
                        <p className={`text-xs mt-1 ${Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100) >= 75 ? 'text-green-700' : 'text-orange-700'}`}>
                            {studentData.attendance.present}/{studentData.attendance.present + studentData.attendance.absent}
                        </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-rose-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-emerald-600">Days Present</p>
                                <p className="text-2xl font-bold text-emerald-700">{studentData.attendance.present}</p>

                            </div>
                            <div>
                                <p className="text-sm text-rose-600"> Days Absent</p>
                                <p className="text-2xl font-bold text-rose-700">{studentData.attendance.absent}</p>

                            </div>
                        </div>
                    </div>

                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-600">Days Late</p>
                        <p className="text-2xl font-bold text-amber-700">
                            {studentData.attendance.late}
                        </p>

                    </div>


                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Attendance Trend:</p>
                    <div className="flex items-center justify-between">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100)}%` }}
                            ></div>
                        </div>
                        <span className="ml-4 text-sm font-semibold text-slate-700">
                            {Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100)}%
                        </span>
                    </div>

                    <div className="mt-3 text-sm text-slate-500">
                        {Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100) >= 95
                            ? '✓ Excellent attendance! Keep it up.'
                            : Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100) >= 80
                                ? '✓ Good attendance record.'
                                : '⚠ Needs improvement in attendance.'}
                    </div>
                </div>


            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Teacher's Remarks
                </h5>
                <p className="text-slate-600 italic">"{studentData.teacherRemarks}"</p>
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


// import React from 'react';
// import { StudentData } from '@/types';
// import { Download, Printer, CheckCircle, AlertCircle, TrendingUp, Calendar, User } from 'lucide-react';

// interface ReportCardProps {
//     studentData: StudentData;
//     onPrint: () => void;
// }

// const ReportCard: React.FC<ReportCardProps> = ({ studentData, onPrint }) => {
//     const getGradeColor = (grade: string) => {
//         if (grade === 'N/A') return 'text-slate-600 bg-slate-100';
//         if (grade.includes('A')) return 'text-emerald-600 bg-emerald-50';
//         if (grade === 'B') return 'text-blue-600 bg-blue-50';
//         if (grade === 'C') return 'text-amber-600 bg-amber-50';
//         return 'text-red-600 bg-red-50';
//     };

//     const calculateAverage = (subjects: StudentData['subjects'], type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => {
//         if (subjects.length === 0) return 'N/A';

//         if (type === 'overall') {
//             const validSubjects = subjects.filter(s => {
//                 const finalScore = s.finalScore || ((s.qa1 + s.qa2 + s.endOfTerm) / 3);
//                 return finalScore > 0;
//             });

//             if (validSubjects.length === 0) return 'N/A';

//             const total = validSubjects.reduce((acc, s) => {
//                 const finalScore = s.finalScore || ((s.qa1 + s.qa2 + s.endOfTerm) / 3);
//                 return acc + finalScore;
//             }, 0);
//             return (total / validSubjects.length).toFixed(1);
//         }

//         const validSubjects = subjects.filter(s => s[type] !== null && s[type] !== undefined && s[type] > 0);
//         if (validSubjects.length === 0) return 'N/A';

//         const total = validSubjects.reduce((acc, s) => acc + s[type], 0);
//         return (total / validSubjects.length).toFixed(1);
//     };

//     const hasAssessmentScores = (assessmentType: 'qa1' | 'qa2' | 'endOfTerm'): boolean => {
//         if (!studentData || !studentData.subjects || studentData.subjects.length === 0) {
//             return false;
//         }

//         return studentData.subjects.some(subject => {
//             const score = subject[assessmentType];
//             return score !== null && score !== undefined && score > 0;
//         });
//     };

//     const canGenerateReportCard = (): boolean => {
//         if (!studentData || !studentData.gradeConfiguration) return true;

//         const config = studentData.gradeConfiguration;

//         if (config.calculation_method === 'end_of_term_only' && !hasAssessmentScores('endOfTerm')) {
//             return false;
//         }

//         const hasAnyScores = hasAssessmentScores('qa1') ||
//             hasAssessmentScores('qa2') ||
//             hasAssessmentScores('endOfTerm');

//         return hasAnyScores;
//     };

//     const calculateSubjectAverage = (subject: StudentData['subjects'][0]) => {
//         const finalScore = subject.finalScore || ((subject.qa1 + subject.qa2 + subject.endOfTerm) / 3);
//         return finalScore.toFixed(1);
//     };

//     const calculateOverallAverage = () => {
//         if (studentData.assessmentStats?.overall?.termAverage) {
//             return studentData.assessmentStats.overall.termAverage.toFixed(1);
//         }
//         return calculateAverage(studentData.subjects, 'overall');
//     };

//     const calculateGrandTotal = () => {
//         const totalScored = studentData.subjects.reduce((sum, subject) => {
//             const subjectAverage = parseFloat(calculateSubjectAverage(subject));
//             return sum + subjectAverage;
//         }, 0);
//         return totalScored.toFixed(1);
//     };

//     const getOverallGrade = () => {
//         const overallAverage = parseFloat(calculateOverallAverage());
//         const passMark = studentData.gradeConfiguration?.pass_mark || 50;

//         if (overallAverage >= 80) return 'A';
//         if (overallAverage >= 70) return 'B';
//         if (overallAverage >= 60) return 'C';
//         if (overallAverage >= passMark) return 'D';
//         return 'F';
//     };

//     const getOverallRemark = () => {
//         const overallGrade = getOverallGrade();
//         return overallGrade === 'F' ? 'FAILED' : 'PASSED';
//     };

//     const getOverallRemarkColor = () => {
//         const overallGrade = getOverallGrade();
//         return overallGrade === 'F' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
//     };

//     if (!canGenerateReportCard()) {
//         return (
//             <div className="text-center py-12 bg-slate-50 rounded-xl">
//                 <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
//                 <h4 className="text-lg font-semibold text-slate-700 mb-2">
//                     Report Card Not Available
//                 </h4>
//                 <p className="text-slate-500 max-w-md mx-auto">
//                     {studentData.gradeConfiguration?.calculation_method === 'end_of_term_only'
//                         ? 'This report card uses "End of Term Only" calculation, but no end of term scores have been submitted yet. Please check back after end of term exams are graded.'
//                         : 'No assessment scores have been recorded for this student yet. Report card will be available once scores are entered.'
//                     }
//                 </p>
//                 <div className="mt-4 text-sm text-slate-400">
//                     Current grade calculation method: <span className="font-semibold">{studentData.gradeConfiguration?.configuration_name}</span>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//                 <div>
//                     <h4 className="text-xl font-bold text-slate-800">Complete Report Card</h4>
//                     <p className="text-slate-500">{studentData.term}</p>
//                     {studentData.gradeConfiguration && (
//                         <p className="text-sm text-indigo-600 mt-1">
//                             Grade Calculation: {studentData.gradeConfiguration.configuration_name}
//                             {studentData.gradeConfiguration.calculation_method === 'weighted_average' &&
//                                 ` (QA1: ${studentData.gradeConfiguration.weight_qa1}%, QA2: ${studentData.gradeConfiguration.weight_qa2}%, End Term: ${studentData.gradeConfiguration.weight_end_of_term}%)`}
//                         </p>
//                     )}
//                 </div>

//                 <div className="flex gap-2">
//                     <button
//                         onClick={onPrint}
//                         className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2"
//                     >
//                         <Printer className="w-4 h-4" />
//                         Print
//                     </button>
//                     <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2">
//                         <Download className="w-4 h-4" />
//                         Download PDF
//                     </button>
//                 </div>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                 <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
//                     <p className="text-indigo-100 text-sm">Final Average</p>
//                     <p className="text-3xl font-bold">{calculateOverallAverage()}%</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
//                     <p className="text-emerald-100 text-sm">Class Position</p>
//                     <p className="text-3xl font-bold">{studentData.classRank}<span className="text-lg">/{studentData.totalStudents}</span></p>
//                 </div>
//                 <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
//                     <p className="text-amber-100 text-sm">Days Present</p>
//                     <p className="text-3xl font-bold">{studentData.attendance.present}</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-4 text-white">
//                     <p className="text-rose-100 text-sm">Days Absent</p>
//                     <p className="text-3xl font-bold">{studentData.attendance.absent}</p>
//                 </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
//                 <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
//                     <h5 className="font-semibold text-slate-800">Final Results</h5>
//                     <p className="text-sm text-slate-500 mt-1">
//                         Based on {studentData.gradeConfiguration?.configuration_name || 'active grade configuration'}
//                     </p>
//                 </div>
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead>
//                             <tr className="bg-slate-100">
//                                 <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Subject</th>
//                                 <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Total Marks</th>
//                                 <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Marks Scored</th>
//                                 <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Grade</th>
//                                 <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Remark</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {studentData.subjects.map((subject, index) => {
//                                 const hasScores = subject.qa1 > 0 || subject.qa2 > 0 || subject.endOfTerm > 0;
//                                 if (!hasScores) return null;

//                                 const subjectAverage = parseFloat(calculateSubjectAverage(subject));
//                                 const remark = subject.grade === 'F' ? 'Failed' : 'Passed';

//                                 return (
//                                     <tr key={index} className="hover:bg-slate-50">
//                                         <td className="px-6 py-4 font-medium text-slate-800">{subject.name}</td>
//                                         <td className="px-6 py-4 text-center text-slate-600">100</td>
//                                         <td className="px-6 py-4 text-center font-semibold text-slate-800">
//                                             {subjectAverage}
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(subject.grade)}`}>
//                                                 {subject.grade}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className={`px-3 py-1 rounded-full text-sm font-semibold ${remark === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
//                                                 {remark}
//                                             </span>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                         <tfoot>
//                             <tr className="bg-indigo-50 font-bold">
//                                 <td className="px-6 py-4 text-slate-800">GRAND TOTAL</td>
//                                 <td className="px-6 py-4 text-center text-slate-800">
//                                     {studentData.subjects.length * 100}
//                                 </td>
//                                 <td className="px-6 py-4 text-center text-indigo-700">
//                                     {calculateGrandTotal()}
//                                 </td>
//                                 <td className="px-6 py-4 text-center">
//                                     <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getOverallGrade())}`}>
//                                         {getOverallGrade()}
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4 text-center">
//                                     <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getOverallRemarkColor()}`}>
//                                         {getOverallRemark()}
//                                     </span>
//                                 </td>
//                             </tr>
//                         </tfoot>
//                     </table>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
//                     <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                         <User className="w-5 h-5 text-indigo-600" />
//                         Teacher's Remarks
//                     </h5>
//                     <p className="text-slate-600 italic">"{studentData.teacherRemarks}"</p>
//                 </div>

//                 <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
//                     <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                         <TrendingUp className="w-5 h-5 text-emerald-600" />
//                         Performance Summary
//                     </h5>
//                     <div className="space-y-3">
//                         <div className="flex justify-between items-center">
//                             <span className="text-sm text-slate-600">Total Subjects:</span>
//                             <span className="font-semibold text-emerald-700">{studentData.subjects.length}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                             <span className="text-sm text-slate-600">Subjects Passed:</span>
//                             <span className="font-semibold text-emerald-700">
//                                 {studentData.subjects.filter(subject =>
//                                     subject.grade && subject.grade !== 'F' && subject.grade !== 'N/A'
//                                 ).length}
//                             </span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                             <span className="text-sm text-slate-600">Overall Average:</span>
//                             <span className="font-bold text-emerald-800">
//                                 {calculateOverallAverage()}%
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="bg-white rounded-xl p-6 border border-slate-200">
//                 <h5 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                     <Calendar className="w-5 h-5 text-indigo-600" />
//                     Attendance Summary
//                 </h5>
//                 <div className="grid grid-cols-3 gap-4">
//                     <div className="text-center p-4 bg-emerald-50 rounded-lg">
//                         <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
//                         <p className="text-2xl font-bold text-emerald-700">{studentData.attendance.present}</p>
//                         <p className="text-sm text-emerald-600">Days Present</p>
//                     </div>
//                     <div className="text-center p-4 bg-red-50 rounded-lg">
//                         <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
//                         <p className="text-2xl font-bold text-red-700">{studentData.attendance.absent}</p>
//                         <p className="text-sm text-red-600">Days Absent</p>
//                     </div>
//                     <div className="text-center p-4 bg-amber-50 rounded-lg">
//                         <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
//                         <p className="text-2xl font-bold text-amber-700">{studentData.attendance.late}</p>
//                         <p className="text-sm text-amber-600">Days Late</p>
//                     </div>
//                 </div>
//                 <div className="mt-4 pt-4 border-t border-slate-200">
//                     <p className="text-sm text-slate-500 text-center">
//                         Attendance Rate: {Math.round((studentData.attendance.present / (studentData.attendance.present + studentData.attendance.absent)) * 100)}%
//                     </p>
//                 </div>
//             </div>

//             <div className="bg-slate-900 text-white rounded-xl p-6">
//                 <div className="text-center">
//                     <h6 className="text-lg font-bold mb-2">Report Card Generated</h6>
//                     <p className="text-slate-300 mb-4">
//                         This report card was generated based on the school's active grade calculation configuration.
//                         For any questions or clarifications, please contact the school administration.
//                     </p>
//                     <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-slate-400">
//                         <div>Generated on: {new Date().toLocaleDateString('en-US', {
//                             weekday: 'long',
//                             year: 'numeric',
//                             month: 'long',
//                             day: 'numeric'
//                         })}</div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ReportCard;