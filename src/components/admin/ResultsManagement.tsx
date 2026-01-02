import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { SubjectRecord } from '@/services/studentService';
import { GradeConfiguration } from '@/services/gradeConfigService';
import { Student, Assessment, ReportCardData } from '@/types/admin';

interface ResultsManagementProps {
    students: Student[];
    classes: any[];
    subjects: SubjectRecord[];
    selectedStudent: Student | null;
    assessments: Assessment[];
    reportCard: ReportCardData;
    savingResults: boolean;
    activeConfig: GradeConfiguration | null;
    setSelectedStudent: (student: Student | null) => void;
    setAssessments: (assessments: Assessment[]) => void;
    setReportCard: (reportCard: ReportCardData) => void;
    loadStudentResults: (student: Student) => Promise<void>;
    saveAllResults: () => Promise<void>;
    updateAssessmentScore: (subjectId: string, field: 'qa1' | 'qa2' | 'end_of_term', value: number) => void;
    calculateGrade: (score: number, passMark?: number) => string;
    calculateFinalScore: (qa1: number, qa2: number, endOfTerm: number, config: GradeConfiguration) => number;
}

const ResultsManagement: React.FC<ResultsManagementProps> = ({
    students,
    classes,
    subjects,
    selectedStudent,
    assessments,
    reportCard,
    savingResults,
    activeConfig,
    setSelectedStudent,
    setAssessments,
    setReportCard,
    loadStudentResults,
    saveAllResults,
    updateAssessmentScore,
    calculateGrade,
    calculateFinalScore,
}) => {
    return (
        <div className="space-y-6">
            {!selectedStudent ? (
                <>
                    <h2 className="text-lg font-semibold text-slate-800">Select a Student to Enter Results</h2>

                    <div className="space-y-8">
                        {classes.map(cls => {
                            const classStudents = students.filter(s => s.class?.id === cls.id);
                            if (classStudents.length === 0) return null;

                            return (
                                <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            {cls.name} - {cls.term} ({cls.academic_year})
                                        </h3>
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                                            {classStudents.length} students
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {classStudents.map((student) => (
                                            <button
                                                key={student.id}
                                                onClick={() => loadStudentResults(student)}
                                                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left hover:bg-indigo-50"
                                            >
                                                <p className="font-mono text-sm text-indigo-600 mb-1">{student.examNumber}</p>
                                                <p className="font-semibold text-slate-800">{student.name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {student.class?.name || 'No Class'}
                                                    {student.class?.term || 'Term 1, 2024/2025'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {students.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                                <p className="text-slate-500">No students found. Add your first student to get started.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">{selectedStudent.name}</h2>
                                <p className="text-sm text-slate-500">{selectedStudent.examNumber} {selectedStudent.class?.name || 'No Class'}</p>
                            </div>
                        </div>
                        <button
                            onClick={saveAllResults}
                            disabled={savingResults}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            {savingResults ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save All Results
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800">Assessment Scores</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Subjects loaded from database. Add subjects in "Manage Subjects" tab.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Subject</th>
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">QA1 (0-100)</th>
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">QA2 (0-100)</th>
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">End of Term (0-100)</th>
                                        <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Final Score*</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {assessments.map((assessment) => {
                                        let finalScore = (assessment.qa1 + assessment.qa2 + assessment.end_of_term) / 3;
                                        if (activeConfig) {
                                            finalScore = calculateFinalScore(
                                                assessment.qa1,
                                                assessment.qa2,
                                                assessment.end_of_term,
                                                activeConfig
                                            );
                                        }
                                        return (
                                            <tr key={assessment.subject_id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-800">{assessment.subject_name}</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={assessment.qa1 || ''}
                                                        onChange={(e) => updateAssessmentScore(assessment.subject_id, 'qa1', parseInt(e.target.value) || 0)}
                                                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={assessment.qa2 || ''}
                                                        onChange={(e) => updateAssessmentScore(assessment.subject_id, 'qa2', parseInt(e.target.value) || 0)}
                                                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={assessment.end_of_term || ''}
                                                        onChange={(e) => updateAssessmentScore(assessment.subject_id, 'end_of_term', parseInt(e.target.value) || 0)}
                                                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-auto block"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center font-semibold text-indigo-700">
                                                    {finalScore.toFixed(1)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-500">
                                * Final score calculated using active configuration: {activeConfig?.configuration_name || 'Default (Average of All)'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800">Report Card Details</h3>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Days Present</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={reportCard.days_present || ''}
                                    onChange={(e) => setReportCard({ ...reportCard, days_present: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"

                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Days Absent</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={reportCard.days_absent || ''}
                                    onChange={(e) => setReportCard({ ...reportCard, days_absent: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Days Late</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={reportCard.days_late || ''}
                                    onChange={(e) => setReportCard({ ...reportCard, days_late: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teacher's Remarks</label>
                                <textarea
                                    value={reportCard.teacher_remarks}
                                    onChange={(e) => setReportCard({ ...reportCard, teacher_remarks: e.target.value })}
                                    rows={3}
                                    placeholder="Enter teacher's remarks for this student..."
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResultsManagement;