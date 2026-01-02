import React from 'react';
import { TrendingUp, Award, CheckCircle, Users, Printer, Download } from 'lucide-react';
import { SubjectRecord } from '@/services/studentService';
import { GradeConfiguration } from '@/services/gradeConfigService';
import { ClassResultStudent } from '@/types/admin';
import ClassResultsTable from './tables/ClassResultsTable';

interface ClassResultsManagementProps {
    classes: any[];
    subjects: SubjectRecord[];
    classResults: ClassResultStudent[];
    selectedClassForResults: string;
    activeAssessmentType: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
    resultsLoading: boolean;
    activeConfig: GradeConfiguration | null;
    setSelectedClassForResults: (classId: string) => void;
    setActiveAssessmentType: (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => void;
    loadClassResults: (classId: string) => Promise<void>;
    calculateGrade: (score: number, passMark?: number) => string;
}

const ClassResultsManagement: React.FC<ClassResultsManagementProps> = ({
    classes,
    subjects,
    classResults,
    selectedClassForResults,
    activeAssessmentType,
    resultsLoading,
    activeConfig,
    setSelectedClassForResults,
    setActiveAssessmentType,
    loadClassResults,
    calculateGrade,
}) => {
    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const classId = e.target.value;
        setSelectedClassForResults(classId);
        if (classId) {
            loadClassResults(classId);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Implement PDF export logic here
        console.log('Exporting PDF...');
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Class Results & Rankings</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            View all students' results in each class, ranked by performance
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="min-w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                            <select
                                value={selectedClassForResults}
                                onChange={handleClassChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select a class</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} - {cls.term} ({cls.academic_year})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">View Results For</label>
                            <div className="flex gap-2">
                                {[
                                    { id: 'overall', label: 'Overall' },
                                    { id: 'qa1', label: 'QA1' },
                                    { id: 'qa2', label: 'QA2' },
                                    { id: 'endOfTerm', label: 'End Term' }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setActiveAssessmentType(type.id as any)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeAssessmentType === type.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {resultsLoading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading results...</p>
                    </div>
                ) : selectedClassForResults && classResults.length > 0 ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-indigo-700 font-medium">Class Average</p>
                                        <p className="text-2xl font-bold text-indigo-800 mt-1">
                                            {(
                                                classResults.reduce((sum, student) => sum + student.average, 0) /
                                                classResults.length
                                            ).toFixed(1)}%
                                        </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-indigo-600 opacity-50" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-emerald-700 font-medium">Top Performer</p>
                                        <p className="text-lg font-bold text-emerald-800 mt-1">
                                            {classResults[0]?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <Award className="w-8 h-8 text-emerald-600 opacity-50" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-700 font-medium">Pass Rate</p>
                                        <p className="text-2xl font-bold text-amber-800 mt-1">
                                            {Math.round(
                                                (classResults.filter(s => s.overallGrade !== 'F').length /
                                                    classResults.length) * 100
                                            )}%
                                        </p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-amber-600 opacity-50" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-700 font-medium">Total Students</p>
                                        <p className="text-2xl font-bold text-slate-800 mt-1">
                                            {classResults.length}
                                        </p>
                                    </div>
                                    <Users className="w-8 h-8 text-slate-600 opacity-50" />
                                </div>
                            </div>
                        </div>

                        <ClassResultsTable
                            classResults={classResults}
                            subjects={subjects}
                            activeAssessmentType={activeAssessmentType}
                            activeConfig={activeConfig}
                            calculateGrade={calculateGrade}
                            onPrint={handlePrint}
                            onExport={handleExport}
                        />
                    </div>
                ) : selectedClassForResults ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                        <p className="text-slate-500">No results found for this class. Enter student results first.</p>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                        <p className="text-slate-500">Select a class to view results</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassResultsManagement;