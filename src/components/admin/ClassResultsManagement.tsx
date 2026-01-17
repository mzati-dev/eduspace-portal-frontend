import React, { useMemo } from 'react';
import { TrendingUp, Award, CheckCircle, Users, Printer, Download } from 'lucide-react';
import { SubjectRecord } from '@/services/studentService';
import { GradeConfiguration } from '@/services/gradeConfigService';
import { ClassResultStudent, Student } from '@/types/admin';
import ClassResultsTable from './tables/ClassResultsTable';

interface ClassResultsManagementProps {
    classes: any[];
    subjects: SubjectRecord[];
    classResults: ClassResultStudent[];
    students: Student[];
    selectedClassForResults: string;
    activeAssessmentType: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
    resultsLoading: boolean;
    activeConfig: GradeConfiguration | null;
    setSelectedClassForResults: (classId: string) => void;
    setActiveAssessmentType: (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => void;
    loadClassResults: (classId: string) => Promise<void>;
    calculateGrade: (score: number, passMark?: number) => string;
    isTeacherView?: boolean;
}

const ClassResultsManagement: React.FC<ClassResultsManagementProps> = ({
    classes,
    subjects,
    classResults,
    students,
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
        console.log('Exporting PDF...');
    };

    // Calculate average from subjects for each assessment type - MATCHES BACKEND LOGIC
    const calculateSubjectAverage = (student: any, type: 'qa1' | 'qa2' | 'endOfTerm') => {
        if (!student.subjects || !Array.isArray(student.subjects) || student.subjects.length === 0) {
            return 0;
        }

        // Filter subjects with scores > 0 for the specific assessment type
        const validSubjects = student.subjects.filter((subject: any) =>
            subject[type] !== undefined && subject[type] !== null && subject[type] > 0
        );

        if (validSubjects.length === 0) return 0;

        // Sum all scores for this assessment type and divide by number of subjects with scores
        const total = validSubjects.reduce((sum: number, subject: any) => sum + subject[type], 0);
        return total / validSubjects.length;
    };

    // Check if student has scores for the active assessment type
    const hasScoresForAssessment = (student: any): boolean => {
        if (!student.subjects || !Array.isArray(student.subjects)) {
            return false;
        }

        switch (activeAssessmentType) {
            case 'overall':
                // For overall, check if student has any scores in any subject
                return student.subjects.some((subject: any) =>
                    subject.qa1 > 0 || subject.qa2 > 0 || subject.endOfTerm > 0
                );
            case 'qa1':
                // For QA1, check if student has QA1 scores
                return student.subjects.some((subject: any) => subject.qa1 > 0);
            case 'qa2':
                // For QA2, check if student has QA2 scores
                return student.subjects.some((subject: any) => subject.qa2 > 0);
            case 'endOfTerm':
                // For End Term, check if student has End Term scores
                return student.subjects.some((subject: any) => subject.endOfTerm > 0);
            default:
                return false;
        }
    };

    // Count students with scores for the active assessment type
    const countStudentsWithScores = () => {
        if (!classResults.length) return 0;

        return classResults.filter(student => hasScoresForAssessment(student)).length;
    };

    // Get total students in the selected class from ALL students array
    const getTotalStudentsInClass = () => {
        if (!selectedClassForResults) return 0;

        // Filter all students to find those in this class (same as ClassesManagement component)
        return students.filter(student => student.class?.id === selectedClassForResults).length;
    };

    // Enhance classResults with calculated metrics for each assessment type
    const enhancedClassResults = useMemo(() => {
        return classResults.map(student => {
            let average = 0;
            let grade = 'F';
            let status = 'Failed';

            switch (activeAssessmentType) {
                case 'overall':
                    average = student.average || 0;
                    grade = student.overallGrade || 'F';
                    status = grade === 'F' ? 'Failed' : 'Passed';
                    break;
                case 'qa1':
                    average = calculateSubjectAverage(student, 'qa1');
                    grade = calculateGrade(average, activeConfig?.pass_mark);
                    status = grade === 'F' ? 'Failed' : 'Passed';
                    break;
                case 'qa2':
                    average = calculateSubjectAverage(student, 'qa2');
                    grade = calculateGrade(average, activeConfig?.pass_mark);
                    status = grade === 'F' ? 'Failed' : 'Passed';
                    break;
                case 'endOfTerm':
                    average = calculateSubjectAverage(student, 'endOfTerm');
                    grade = calculateGrade(average, activeConfig?.pass_mark);
                    status = grade === 'F' ? 'Failed' : 'Passed';
                    break;
            }

            return {
                ...student,
                calculatedAverage: average,
                calculatedGrade: grade,
                calculatedStatus: status
            };
        });
    }, [classResults, activeAssessmentType, calculateGrade, activeConfig]);

    // // Calculate dynamic metrics based on activeAssessmentType
    // const metrics = useMemo(() => {
    //     const totalStudentsInClass = getTotalStudentsInClass();
    //     const studentsWithScoresCount = countStudentsWithScores();

    //     if (!classResults.length) {
    //         return {
    //             classAverage: 0,
    //             topPerformerName: 'N/A',
    //             topPerformerScore: 0,
    //             passRate: 0,
    //             totalStudents: totalStudentsInClass,
    //             studentsWithScores: 0,
    //             studentsWithScoresRatio: `0/${totalStudentsInClass}`,
    //             passedCount: 0,
    //             failedCount: 0
    //         };
    //     }

    //     let totalScore = 0;
    //     let topScore = -1;
    //     let topPerformerName = 'N/A';
    //     let topPerformerScore = 0;
    //     let passedCount = 0;
    //     let failedCount = 0;

    //     classResults.forEach(student => {
    //         let studentScore = 0;
    //         let studentGrade = 'F';
    //         let hasScores = false;

    //         // Get score and grade based on activeAssessmentType - MATCHES BACKEND
    //         switch (activeAssessmentType) {
    //             case 'overall':
    //                 // Use the average already calculated by backend
    //                 studentScore = student.average || 0;
    //                 studentGrade = student.overallGrade || 'F';
    //                 hasScores = student.subjects?.some((subject: any) =>
    //                     subject.qa1 > 0 || subject.qa2 > 0 || subject.endOfTerm > 0
    //                 ) || false;
    //                 break;
    //             case 'qa1':
    //                 // Calculate QA1 average from subjects
    //                 studentScore = calculateSubjectAverage(student, 'qa1');
    //                 studentGrade = calculateGrade(studentScore, activeConfig?.pass_mark);
    //                 hasScores = student.subjects?.some((subject: any) => subject.qa1 > 0) || false;
    //                 break;
    //             case 'qa2':
    //                 // Calculate QA2 average from subjects
    //                 studentScore = calculateSubjectAverage(student, 'qa2');
    //                 studentGrade = calculateGrade(studentScore, activeConfig?.pass_mark);
    //                 hasScores = student.subjects?.some((subject: any) => subject.qa2 > 0) || false;
    //                 break;
    //             case 'endOfTerm':
    //                 // Calculate End Term average from subjects
    //                 studentScore = calculateSubjectAverage(student, 'endOfTerm');
    //                 studentGrade = calculateGrade(studentScore, activeConfig?.pass_mark);
    //                 hasScores = student.subjects?.some((subject: any) => subject.endOfTerm > 0) || false;
    //                 break;
    //         }

    //         if (hasScores) {
    //             totalScore += studentScore;
    //         }

    //         if (studentScore > topScore && hasScores) {
    //             topScore = studentScore;
    //             topPerformerName = student.name || 'N/A';
    //             topPerformerScore = studentScore;
    //         }

    //         if (hasScores) {
    //             if (studentGrade !== 'F') {
    //                 passedCount++;
    //             } else {
    //                 failedCount++;
    //             }
    //         }
    //     });

    //     const classAverage = studentsWithScoresCount > 0 ? totalScore / studentsWithScoresCount : 0;
    //     const passRate = studentsWithScoresCount > 0 ? (passedCount / studentsWithScoresCount) * 100 : 0;
    //     const studentsWithScoresRatio = `${studentsWithScoresCount}/${totalStudentsInClass}`;

    //     return {
    //         classAverage,
    //         topPerformerName,
    //         topPerformerScore,
    //         passRate,
    //         totalStudents: totalStudentsInClass,
    //         studentsWithScores: studentsWithScoresCount,
    //         studentsWithScoresRatio,
    //         passedCount,
    //         failedCount
    //     };
    // }, [classResults, activeAssessmentType, calculateGrade, activeConfig, students, selectedClassForResults]);

    // Calculate dynamic metrics based on activeAssessmentType
    const metrics = useMemo(() => {
        const totalStudentsInClass = getTotalStudentsInClass();

        if (!selectedClassForResults || totalStudentsInClass === 0) {
            return {
                classAverage: 0,
                topPerformerName: 'N/A',
                topPerformerScore: 0,
                passRate: 0,
                totalStudents: totalStudentsInClass,
                studentsWithScores: 0,
                studentsWithScoresRatio: `0/${totalStudentsInClass}`,
                passedCount: 0,
                failedCount: 0
            };
        }

        let totalScore = 0;
        let topScore = -1;
        let topPerformerName = 'N/A';
        let topPerformerScore = 0;
        let passedCount = 0;
        let failedCount = 0;
        let studentsWithScoresCount = 0;

        // Process ALL students in the class
        enhancedClassResults.forEach(student => {
            const studentScore = student.calculatedAverage;
            const studentGrade = student.calculatedGrade;
            const hasScores = studentScore > 0;

            // Only include in average calculation if they have scores
            if (hasScores) {
                totalScore += studentScore;
                studentsWithScoresCount++;

                // Track top performer (only among those with scores)
                if (studentScore > topScore) {
                    topScore = studentScore;
                    topPerformerName = student.name || 'N/A';
                    topPerformerScore = studentScore;
                }
            }

            // Count ALL students for pass/fail (including those without scores)
            // Students without scores get 'F' grade from calculateGrade(0)
            if (studentGrade !== 'F') {
                passedCount++;
            } else {
                failedCount++;
            }
        });

        const classAverage = studentsWithScoresCount > 0 ? totalScore / studentsWithScoresCount : 0;
        const passRate = totalStudentsInClass > 0 ? (passedCount / totalStudentsInClass) * 100 : 0;
        const studentsWithScoresRatio = `${studentsWithScoresCount}/${totalStudentsInClass}`;

        return {
            classAverage,
            topPerformerName,
            topPerformerScore,
            passRate,
            totalStudents: totalStudentsInClass,
            studentsWithScores: studentsWithScoresCount,
            studentsWithScoresRatio,
            passedCount,
            failedCount
        };
    }, [enhancedClassResults, activeAssessmentType, students, selectedClassForResults]);

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
                                            {metrics.classAverage.toFixed(1)}%
                                        </p>
                                        <p className="text-xs text-indigo-600 mt-1">
                                            {activeAssessmentType.toUpperCase()}
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
                                            {metrics.topPerformerName}
                                        </p>
                                        <p className="text-xs text-emerald-600 mt-1">
                                            Score: {metrics.topPerformerScore.toFixed(1)}%
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
                                            {Math.round(metrics.passRate)}%
                                        </p>
                                        <p className="text-xs text-amber-600 mt-1">
                                            {metrics.passedCount} passed / {metrics.failedCount} failed
                                        </p>
                                        <p className="text-xs text-amber-600 mt-1">
                                            {activeAssessmentType.toUpperCase()}
                                        </p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-amber-600 opacity-50" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-700 font-medium">Students with Scores</p>
                                        <p className="text-2xl font-bold text-slate-800 mt-1">
                                            {metrics.studentsWithScoresRatio}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {activeAssessmentType.toUpperCase()} scores entered
                                        </p>
                                    </div>
                                    <Users className="w-8 h-8 text-slate-600 opacity-50" />
                                </div>
                            </div>
                        </div>

                        <ClassResultsTable
                            classResults={enhancedClassResults}
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

// import React, { useMemo } from 'react';
// import { TrendingUp, Award, CheckCircle, Users, Printer, Download } from 'lucide-react';
// import { SubjectRecord } from '@/services/studentService';
// import { GradeConfiguration } from '@/services/gradeConfigService';
// import { ClassResultStudent, Student } from '@/types/admin'; // Import Student type
// import ClassResultsTable from './tables/ClassResultsTable';

// interface ClassResultsManagementProps {
//     classes: any[];
//     subjects: SubjectRecord[];
//     classResults: ClassResultStudent[];
//     students: Student[]; // ADD THIS - full list of all students
//     selectedClassForResults: string;
//     activeAssessmentType: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
//     resultsLoading: boolean;
//     activeConfig: GradeConfiguration | null;
//     setSelectedClassForResults: (classId: string) => void;
//     setActiveAssessmentType: (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => void;
//     loadClassResults: (classId: string) => Promise<void>;
//     calculateGrade: (score: number, passMark?: number) => string;
// }

// const ClassResultsManagement: React.FC<ClassResultsManagementProps> = ({
//     classes,
//     subjects,
//     classResults,
//     students, // ADD THIS
//     selectedClassForResults,
//     activeAssessmentType,
//     resultsLoading,
//     activeConfig,
//     setSelectedClassForResults,
//     setActiveAssessmentType,
//     loadClassResults,
//     calculateGrade,
// }) => {
//     const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const classId = e.target.value;
//         setSelectedClassForResults(classId);
//         if (classId) {
//             loadClassResults(classId);
//         }
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     const handleExport = () => {
//         console.log('Exporting PDF...');
//     };

//     // Calculate average from subjects for each assessment type - MATCHES BACKEND LOGIC
//     const calculateSubjectAverage = (student: any, type: 'qa1' | 'qa2' | 'endOfTerm') => {
//         if (!student.subjects || !Array.isArray(student.subjects) || student.subjects.length === 0) {
//             return 0;
//         }

//         // Filter subjects with scores > 0 for the specific assessment type
//         const validSubjects = student.subjects.filter((subject: any) =>
//             subject[type] !== undefined && subject[type] !== null && subject[type] > 0
//         );

//         if (validSubjects.length === 0) return 0;

//         // Sum all scores for this assessment type and divide by number of subjects with scores
//         const total = validSubjects.reduce((sum: number, subject: any) => sum + subject[type], 0);
//         return total / validSubjects.length;
//     };

//     // Check if student has scores for the active assessment type
//     const hasScoresForAssessment = (student: any): boolean => {
//         if (!student.subjects || !Array.isArray(student.subjects)) {
//             return false;
//         }

//         switch (activeAssessmentType) {
//             case 'overall':
//                 // For overall, check if student has any scores in any subject
//                 return student.subjects.some((subject: any) =>
//                     subject.qa1 > 0 || subject.qa2 > 0 || subject.endOfTerm > 0
//                 );
//             case 'qa1':
//                 // For QA1, check if student has QA1 scores
//                 return student.subjects.some((subject: any) => subject.qa1 > 0);
//             case 'qa2':
//                 // For QA2, check if student has QA2 scores
//                 return student.subjects.some((subject: any) => subject.qa2 > 0);
//             case 'endOfTerm':
//                 // For End Term, check if student has End Term scores
//                 return student.subjects.some((subject: any) => subject.endOfTerm > 0);
//             default:
//                 return false;
//         }
//     };

//     // Count students with scores for the active assessment type
//     const countStudentsWithScores = () => {
//         if (!classResults.length) return 0;

//         return classResults.filter(student => hasScoresForAssessment(student)).length;
//     };

//     // Get total students in the selected class from ALL students array
//     const getTotalStudentsInClass = () => {
//         if (!selectedClassForResults) return 0;

//         // Filter all students to find those in this class (same as ClassesManagement component)
//         return students.filter(student => student.class?.id === selectedClassForResults).length;
//     };

//     // Enhance classResults with calculated metrics for each assessment type
//     const enhancedClassResults = useMemo(() => {
//         return classResults.map(student => {
//             let average = 0;
//             let grade = 'F';
//             let status = 'Failed';

//             switch (activeAssessmentType) {
//                 case 'overall':
//                     average = student.average || 0;
//                     grade = student.overallGrade || 'F';
//                     status = grade === 'F' ? 'Failed' : 'Passed';
//                     break;
//                 case 'qa1':
//                     average = calculateSubjectAverage(student, 'qa1');
//                     grade = calculateGrade(average, activeConfig?.pass_mark);
//                     status = grade === 'F' ? 'Failed' : 'Passed';
//                     break;
//                 case 'qa2':
//                     average = calculateSubjectAverage(student, 'qa2');
//                     grade = calculateGrade(average, activeConfig?.pass_mark);
//                     status = grade === 'F' ? 'Failed' : 'Passed';
//                     break;
//                 case 'endOfTerm':
//                     average = calculateSubjectAverage(student, 'endOfTerm');
//                     grade = calculateGrade(average, activeConfig?.pass_mark);
//                     status = grade === 'F' ? 'Failed' : 'Passed';
//                     break;
//             }

//             return {
//                 ...student,
//                 calculatedAverage: average,
//                 calculatedGrade: grade,
//                 calculatedStatus: status
//             };
//         });
//     }, [classResults, activeAssessmentType, calculateGrade, activeConfig]);

//     // Calculate dynamic metrics based on activeAssessmentType
//     const metrics = useMemo(() => {
//         const totalStudentsInClass = getTotalStudentsInClass();
//         const studentsWithScoresCount = countStudentsWithScores();

//         if (!classResults.length) {
//             return {
//                 classAverage: 0,
//                 topPerformerName: 'N/A',
//                 topPerformerScore: 0,
//                 passRate: 0,
//                 totalStudents: totalStudentsInClass,
//                 studentsWithScores: 0,
//                 studentsWithScoresRatio: `0/${totalStudentsInClass}`
//             };
//         }

//         let totalScore = 0;
//         let topScore = -1;
//         let topPerformerName = 'N/A';
//         let topPerformerScore = 0;
//         let passedCount = 0;

//         classResults.forEach(student => {
//             let studentScore = 0;
//             let studentGrade = 'F';
//             let hasScores = false;

//             // Get score and grade based on activeAssessmentType - MATCHES BACKEND
//             switch (activeAssessmentType) {
//                 case 'overall':
//                     // Use the average already calculated by backend
//                     studentScore = student.average || 0;
//                     studentGrade = student.overallGrade || 'F';
//                     hasScores = student.subjects?.some((subject: any) =>
//                         subject.qa1 > 0 || subject.qa2 > 0 || subject.endOfTerm > 0
//                     ) || false;
//                     break;
//                 case 'qa1':
//                     // Calculate QA1 average from subjects
//                     studentScore = calculateSubjectAverage(student, 'qa1');
//                     studentGrade = calculateGrade(studentScore, activeConfig?.pass_mark);
//                     hasScores = student.subjects?.some((subject: any) => subject.qa1 > 0) || false;
//                     break;
//                 case 'qa2':
//                     // Calculate QA2 average from subjects
//                     studentScore = calculateSubjectAverage(student, 'qa2');
//                     studentGrade = calculateGrade(studentScore, activeConfig?.pass_mark);
//                     hasScores = student.subjects?.some((subject: any) => subject.qa2 > 0) || false;
//                     break;
//                 case 'endOfTerm':
//                     // Calculate End Term average from subjects
//                     studentScore = calculateSubjectAverage(student, 'endOfTerm');
//                     studentGrade = calculateGrade(studentScore, activeConfig?.pass_mark);
//                     hasScores = student.subjects?.some((subject: any) => subject.endOfTerm > 0) || false;
//                     break;
//             }

//             if (hasScores) {
//                 totalScore += studentScore;
//             }

//             if (studentScore > topScore && hasScores) {
//                 topScore = studentScore;
//                 topPerformerName = student.name || 'N/A';
//                 topPerformerScore = studentScore;
//             }

//             if (studentGrade !== 'F' && hasScores) {
//                 passedCount++;
//             }
//         });

//         const classAverage = studentsWithScoresCount > 0 ? totalScore / studentsWithScoresCount : 0;
//         const passRate = studentsWithScoresCount > 0 ? (passedCount / studentsWithScoresCount) * 100 : 0;
//         const studentsWithScoresRatio = `${studentsWithScoresCount}/${totalStudentsInClass}`;

//         return {
//             classAverage,
//             topPerformerName,
//             topPerformerScore,
//             passRate,
//             totalStudents: totalStudentsInClass,
//             studentsWithScores: studentsWithScoresCount,
//             studentsWithScoresRatio
//         };
//     }, [classResults, activeAssessmentType, calculateGrade, activeConfig, students, selectedClassForResults]);

//     return (
//         <div className="space-y-6">
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//                     <div>
//                         <h2 className="text-lg font-semibold text-slate-800">Class Results & Rankings</h2>
//                         <p className="text-sm text-slate-500 mt-1">
//                             View all students' results in each class, ranked by performance
//                         </p>
//                     </div>

//                     <div className="flex flex-wrap gap-4">
//                         <div className="min-w-[200px]">
//                             <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
//                             <select
//                                 value={selectedClassForResults}
//                                 onChange={handleClassChange}
//                                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                             >
//                                 <option value="">Select a class</option>
//                                 {classes.map(cls => (
//                                     <option key={cls.id} value={cls.id}>
//                                         {cls.name} - {cls.term} ({cls.academic_year})
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-1">View Results For</label>
//                             <div className="flex gap-2">
//                                 {[
//                                     { id: 'overall', label: 'Overall' },
//                                     { id: 'qa1', label: 'QA1' },
//                                     { id: 'qa2', label: 'QA2' },
//                                     { id: 'endOfTerm', label: 'End Term' }
//                                 ].map(type => (
//                                     <button
//                                         key={type.id}
//                                         onClick={() => setActiveAssessmentType(type.id as any)}
//                                         className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeAssessmentType === type.id
//                                             ? 'bg-indigo-600 text-white'
//                                             : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                             }`}
//                                     >
//                                         {type.label}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {resultsLoading ? (
//                     <div className="text-center py-12">
//                         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
//                         <p className="text-slate-600">Loading results...</p>
//                     </div>
//                 ) : selectedClassForResults && classResults.length > 0 ? (
//                     <div className="space-y-8">
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                             <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-indigo-700 font-medium">Class Average</p>
//                                         <p className="text-2xl font-bold text-indigo-800 mt-1">
//                                             {metrics.classAverage.toFixed(1)}%
//                                         </p>
//                                         <p className="text-xs text-indigo-600 mt-1">
//                                             {activeAssessmentType.toUpperCase()}
//                                         </p>
//                                     </div>
//                                     <TrendingUp className="w-8 h-8 text-indigo-600 opacity-50" />
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-emerald-700 font-medium">Top Performer</p>
//                                         <p className="text-lg font-bold text-emerald-800 mt-1">
//                                             {metrics.topPerformerName}
//                                         </p>
//                                         <p className="text-xs text-emerald-600 mt-1">
//                                             Score: {metrics.topPerformerScore.toFixed(1)}%
//                                         </p>
//                                     </div>
//                                     <Award className="w-8 h-8 text-emerald-600 opacity-50" />
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-amber-700 font-medium">Pass Rate</p>
//                                         <p className="text-2xl font-bold text-amber-800 mt-1">
//                                             {Math.round(metrics.passRate)}%
//                                         </p>
//                                         <p className="text-xs text-amber-600 mt-1">
//                                             {activeAssessmentType.toUpperCase()}
//                                         </p>
//                                     </div>
//                                     <CheckCircle className="w-8 h-8 text-amber-600 opacity-50" />
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-slate-700 font-medium">Students with Scores</p>
//                                         <p className="text-2xl font-bold text-slate-800 mt-1">
//                                             {metrics.studentsWithScoresRatio}
//                                         </p>
//                                         <p className="text-xs text-slate-600 mt-1">
//                                             {activeAssessmentType.toUpperCase()} scores entered
//                                         </p>
//                                     </div>
//                                     <Users className="w-8 h-8 text-slate-600 opacity-50" />
//                                 </div>
//                             </div>
//                         </div>

//                         <ClassResultsTable
//                             classResults={enhancedClassResults}
//                             subjects={subjects}
//                             activeAssessmentType={activeAssessmentType}
//                             activeConfig={activeConfig}
//                             calculateGrade={calculateGrade}
//                             onPrint={handlePrint}
//                             onExport={handleExport}
//                         />
//                     </div>
//                 ) : selectedClassForResults ? (
//                     <div className="text-center py-12 bg-slate-50 rounded-xl">
//                         <p className="text-slate-500">No results found for this class. Enter student results first.</p>
//                     </div>
//                 ) : (
//                     <div className="text-center py-12 bg-slate-50 rounded-xl">
//                         <p className="text-slate-500">Select a class to view results</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ClassResultsManagement;

// import React, { useMemo } from 'react';
// import { TrendingUp, Award, CheckCircle, Users, Printer, Download } from 'lucide-react';
// import { SubjectRecord } from '@/services/studentService';
// import { GradeConfiguration } from '@/services/gradeConfigService';
// import { ClassResultStudent } from '@/types/admin';
// import ClassResultsTable from './tables/ClassResultsTable';

// interface ClassResultsManagementProps {
//     classes: any[];
//     subjects: SubjectRecord[];
//     classResults: ClassResultStudent[];
//     selectedClassForResults: string;
//     activeAssessmentType: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
//     resultsLoading: boolean;
//     activeConfig: GradeConfiguration | null;
//     setSelectedClassForResults: (classId: string) => void;
//     setActiveAssessmentType: (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => void;
//     loadClassResults: (classId: string) => Promise<void>;
//     calculateGrade: (score: number, passMark?: number) => string;
// }

// const ClassResultsManagement: React.FC<ClassResultsManagementProps> = ({
//     classes,
//     subjects,
//     classResults,
//     selectedClassForResults,
//     activeAssessmentType,
//     resultsLoading,
//     activeConfig,
//     setSelectedClassForResults,
//     setActiveAssessmentType,
//     loadClassResults,
//     calculateGrade,
// }) => {
//     const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const classId = e.target.value;
//         setSelectedClassForResults(classId);
//         if (classId) {
//             loadClassResults(classId);
//         }
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     const handleExport = () => {
//         console.log('Exporting PDF...');
//     };

//     // Calculate average from subjects for each assessment type - MATCHES BACKEND LOGIC
//     const calculateSubjectAverage = (student: any, type: 'qa1' | 'qa2' | 'endOfTerm') => {
//         if (!student.subjects || !Array.isArray(student.subjects) || student.subjects.length === 0) {
//             return 0;
//         }

//         // Filter subjects with scores > 0 for the specific assessment type
//         const validSubjects = student.subjects.filter((subject: any) =>
//             subject[type] !== undefined && subject[type] !== null && subject[type] > 0
//         );

//         if (validSubjects.length === 0) return 0;

//         // Sum all scores for this assessment type and divide by number of subjects with scores
//         const total = validSubjects.reduce((sum: number, subject: any) => sum + subject[type], 0);
//         return total / validSubjects.length;
//     };

//     // Enhance classResults with calculated metrics for each assessment type
//     const enhancedClassResults = useMemo(() => {
//         return classResults.map(student => {
//             let average = 0;
//             let grade = 'F';
//             let status = 'Failed';

//             switch (activeAssessmentType) {
//                 case 'overall':
//                     average = student.average || 0;
//                     grade = student.overallGrade || 'F';
//                     status = grade === 'F' ? 'Failed' : 'Passed';
//                     break;
//                 case 'qa1':
//                     average = calculateSubjectAverage(student, 'qa1');
//                     grade = calculateGrade(average, activeConfig?.pass_mark);
//                     status = grade === 'F' ? 'Failed' : 'Passed';
//                     break;
//                 case 'qa2':
//                     average = calculateSubjectAverage(student, 'qa2');
//                     grade = calculateGrade(average, activeConfig?.pass_mark);
//                     status = grade === 'F' ? 'Failed' : 'Passed';
//                     break;
//                 case 'endOfTerm':
//                     average = calculateSubjectAverage(student, 'endOfTerm');
//                     grade = calculateGrade(average, activeConfig?.pass_mark);
//                     status = grade === 'F' ? 'Failed' : 'Passed';
//                     break;
//             }

//             return {
//                 ...student,
//                 calculatedAverage: average,
//                 calculatedGrade: grade,
//                 calculatedStatus: status
//             };
//         });
//     }, [classResults, activeAssessmentType, calculateGrade, activeConfig]);

//     // Calculate dynamic metrics based on activeAssessmentType
//     const metrics = useMemo(() => {
//         if (!classResults.length) {
//             return {
//                 classAverage: 0,
//                 topPerformerName: 'N/A',
//                 topPerformerScore: 0,
//                 passRate: 0,
//                 totalStudents: 0
//             };
//         }

//         let totalScore = 0;
//         let topScore = -1;
//         let topPerformerName = 'N/A';
//         let topPerformerScore = 0;
//         let passedCount = 0;

//         classResults.forEach(student => {
//             let studentScore = 0;
//             let studentGrade = 'F';

//             // Get score and grade based on activeAssessmentType - MATCHES BACKEND
//             switch (activeAssessmentType) {
//                 case 'overall':
//                     // Use the average already calculated by backend
//                     studentScore = student.average || 0;
//                     studentGrade = student.overallGrade || 'F';
//                     break;
//                 case 'qa1':
//                     // Calculate QA1 average from subjects
//                     studentScore = calculateSubjectAverage(student, 'qa1');
//                     studentGrade = calculateGrade(studentScore, activeConfig?.pass_mark);
//                     break;
//                 case 'qa2':
//                     // Calculate QA2 average from subjects
//                     studentScore = calculateSubjectAverage(student, 'qa2');
//                     studentGrade = calculateGrade(studentScore, activeConfig?.pass_mark);
//                     break;
//                 case 'endOfTerm':
//                     // Calculate End Term average from subjects
//                     studentScore = calculateSubjectAverage(student, 'endOfTerm');
//                     studentGrade = calculateGrade(studentScore, activeConfig?.pass_mark);
//                     break;
//             }

//             totalScore += studentScore;

//             if (studentScore > topScore) {
//                 topScore = studentScore;
//                 topPerformerName = student.name || 'N/A';
//                 topPerformerScore = studentScore;
//             }

//             if (studentGrade !== 'F') {
//                 passedCount++;
//             }
//         });

//         const classAverage = classResults.length > 0 ? totalScore / classResults.length : 0;
//         const passRate = classResults.length > 0 ? (passedCount / classResults.length) * 100 : 0;

//         return {
//             classAverage,
//             topPerformerName,
//             topPerformerScore,
//             passRate,
//             totalStudents: classResults.length
//         };
//     }, [classResults, activeAssessmentType, calculateGrade, activeConfig]);

//     return (
//         <div className="space-y-6">
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//                     <div>
//                         <h2 className="text-lg font-semibold text-slate-800">Class Results & Rankings</h2>
//                         <p className="text-sm text-slate-500 mt-1">
//                             View all students' results in each class, ranked by performance
//                         </p>
//                     </div>

//                     <div className="flex flex-wrap gap-4">
//                         <div className="min-w-[200px]">
//                             <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
//                             <select
//                                 value={selectedClassForResults}
//                                 onChange={handleClassChange}
//                                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                             >
//                                 <option value="">Select a class</option>
//                                 {classes.map(cls => (
//                                     <option key={cls.id} value={cls.id}>
//                                         {cls.name} - {cls.term} ({cls.academic_year})
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-1">View Results For</label>
//                             <div className="flex gap-2">
//                                 {[
//                                     { id: 'overall', label: 'Overall' },
//                                     { id: 'qa1', label: 'QA1' },
//                                     { id: 'qa2', label: 'QA2' },
//                                     { id: 'endOfTerm', label: 'End Term' }
//                                 ].map(type => (
//                                     <button
//                                         key={type.id}
//                                         onClick={() => setActiveAssessmentType(type.id as any)}
//                                         className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeAssessmentType === type.id
//                                             ? 'bg-indigo-600 text-white'
//                                             : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                             }`}
//                                     >
//                                         {type.label}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {resultsLoading ? (
//                     <div className="text-center py-12">
//                         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
//                         <p className="text-slate-600">Loading results...</p>
//                     </div>
//                 ) : selectedClassForResults && classResults.length > 0 ? (
//                     <div className="space-y-8">
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                             <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-indigo-700 font-medium">Class Average</p>
//                                         <p className="text-2xl font-bold text-indigo-800 mt-1">
//                                             {metrics.classAverage.toFixed(1)}%
//                                         </p>
//                                         <p className="text-xs text-indigo-600 mt-1">
//                                             {activeAssessmentType.toUpperCase()}
//                                         </p>
//                                     </div>
//                                     <TrendingUp className="w-8 h-8 text-indigo-600 opacity-50" />
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-emerald-700 font-medium">Top Performer</p>
//                                         <p className="text-lg font-bold text-emerald-800 mt-1">
//                                             {metrics.topPerformerName}
//                                         </p>
//                                         <p className="text-xs text-emerald-600 mt-1">
//                                             Score: {metrics.topPerformerScore.toFixed(1)}%
//                                         </p>
//                                     </div>
//                                     <Award className="w-8 h-8 text-emerald-600 opacity-50" />
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-amber-700 font-medium">Pass Rate</p>
//                                         <p className="text-2xl font-bold text-amber-800 mt-1">
//                                             {Math.round(metrics.passRate)}%
//                                         </p>
//                                         <p className="text-xs text-amber-600 mt-1">
//                                             {activeAssessmentType.toUpperCase()}
//                                         </p>
//                                     </div>
//                                     <CheckCircle className="w-8 h-8 text-amber-600 opacity-50" />
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-slate-700 font-medium">Total Students</p>
//                                         <p className="text-2xl font-bold text-slate-800 mt-1">
//                                             {metrics.totalStudents}
//                                         </p>
//                                     </div>
//                                     <Users className="w-8 h-8 text-slate-600 opacity-50" />
//                                 </div>
//                             </div>
//                         </div>

//                         <ClassResultsTable
//                             classResults={enhancedClassResults} // Pass enhanced data with calculated metrics
//                             subjects={subjects}
//                             activeAssessmentType={activeAssessmentType}
//                             activeConfig={activeConfig}
//                             calculateGrade={calculateGrade}
//                             onPrint={handlePrint}
//                             onExport={handleExport}
//                         />
//                     </div>
//                 ) : selectedClassForResults ? (
//                     <div className="text-center py-12 bg-slate-50 rounded-xl">
//                         <p className="text-slate-500">No results found for this class. Enter student results first.</p>
//                     </div>
//                 ) : (
//                     <div className="text-center py-12 bg-slate-50 rounded-xl">
//                         <p className="text-slate-500">Select a class to view results</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ClassResultsManagement;

// // import React from 'react';
// // import { TrendingUp, Award, CheckCircle, Users, Printer, Download } from 'lucide-react';
// // import { SubjectRecord } from '@/services/studentService';
// // import { GradeConfiguration } from '@/services/gradeConfigService';
// // import { ClassResultStudent } from '@/types/admin';
// // import ClassResultsTable from './tables/ClassResultsTable';

// // interface ClassResultsManagementProps {
// //     classes: any[];
// //     subjects: SubjectRecord[];
// //     classResults: ClassResultStudent[];
// //     selectedClassForResults: string;
// //     activeAssessmentType: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
// //     resultsLoading: boolean;
// //     activeConfig: GradeConfiguration | null;
// //     setSelectedClassForResults: (classId: string) => void;
// //     setActiveAssessmentType: (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => void;
// //     loadClassResults: (classId: string) => Promise<void>;
// //     calculateGrade: (score: number, passMark?: number) => string;
// // }

// // const ClassResultsManagement: React.FC<ClassResultsManagementProps> = ({
// //     classes,
// //     subjects,
// //     classResults,
// //     selectedClassForResults,
// //     activeAssessmentType,
// //     resultsLoading,
// //     activeConfig,
// //     setSelectedClassForResults,
// //     setActiveAssessmentType,
// //     loadClassResults,
// //     calculateGrade,
// // }) => {
// //     const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //         const classId = e.target.value;
// //         setSelectedClassForResults(classId);
// //         if (classId) {
// //             loadClassResults(classId);
// //         }
// //     };

// //     const handlePrint = () => {
// //         window.print();
// //     };

// //     const handleExport = () => {
// //         // Implement PDF export logic here
// //         console.log('Exporting PDF...');
// //     };

// //     return (
// //         <div className="space-y-6">
// //             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
// //                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
// //                     <div>
// //                         <h2 className="text-lg font-semibold text-slate-800">Class Results & Rankings</h2>
// //                         <p className="text-sm text-slate-500 mt-1">
// //                             View all students' results in each class, ranked by performance
// //                         </p>
// //                     </div>

// //                     <div className="flex flex-wrap gap-4">
// //                         <div className="min-w-[200px]">
// //                             <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
// //                             <select
// //                                 value={selectedClassForResults}
// //                                 onChange={handleClassChange}
// //                                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
// //                             >
// //                                 <option value="">Select a class</option>
// //                                 {classes.map(cls => (
// //                                     <option key={cls.id} value={cls.id}>
// //                                         {cls.name} - {cls.term} ({cls.academic_year})
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>

// //                         <div>
// //                             <label className="block text-sm font-medium text-slate-700 mb-1">View Results For</label>
// //                             <div className="flex gap-2">
// //                                 {[
// //                                     { id: 'overall', label: 'Overall' },
// //                                     { id: 'qa1', label: 'QA1' },
// //                                     { id: 'qa2', label: 'QA2' },
// //                                     { id: 'endOfTerm', label: 'End Term' }
// //                                 ].map(type => (
// //                                     <button
// //                                         key={type.id}
// //                                         onClick={() => setActiveAssessmentType(type.id as any)}
// //                                         className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeAssessmentType === type.id
// //                                             ? 'bg-indigo-600 text-white'
// //                                             : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
// //                                             }`}
// //                                     >
// //                                         {type.label}
// //                                     </button>
// //                                 ))}
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {resultsLoading ? (
// //                     <div className="text-center py-12">
// //                         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
// //                         <p className="text-slate-600">Loading results...</p>
// //                     </div>
// //                 ) : selectedClassForResults && classResults.length > 0 ? (
// //                     <div className="space-y-8">
// //                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //                             <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
// //                                 <div className="flex items-center justify-between">
// //                                     <div>
// //                                         <p className="text-sm text-indigo-700 font-medium">Class Average</p>
// //                                         <p className="text-2xl font-bold text-indigo-800 mt-1">
// //                                             {(
// //                                                 classResults.reduce((sum, student) => sum + student.average, 0) /
// //                                                 classResults.length
// //                                             ).toFixed(1)}%
// //                                         </p>
// //                                     </div>
// //                                     <TrendingUp className="w-8 h-8 text-indigo-600 opacity-50" />
// //                                 </div>
// //                             </div>

// //                             <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
// //                                 <div className="flex items-center justify-between">
// //                                     <div>
// //                                         <p className="text-sm text-emerald-700 font-medium">Top Performer</p>
// //                                         <p className="text-lg font-bold text-emerald-800 mt-1">
// //                                             {classResults[0]?.name || 'N/A'}
// //                                         </p>
// //                                     </div>
// //                                     <Award className="w-8 h-8 text-emerald-600 opacity-50" />
// //                                 </div>
// //                             </div>

// //                             <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
// //                                 <div className="flex items-center justify-between">
// //                                     <div>
// //                                         <p className="text-sm text-amber-700 font-medium">Pass Rate</p>
// //                                         <p className="text-2xl font-bold text-amber-800 mt-1">
// //                                             {Math.round(
// //                                                 (classResults.filter(s => s.overallGrade !== 'F').length /
// //                                                     classResults.length) * 100
// //                                             )}%
// //                                         </p>
// //                                     </div>
// //                                     <CheckCircle className="w-8 h-8 text-amber-600 opacity-50" />
// //                                 </div>
// //                             </div>

// //                             <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
// //                                 <div className="flex items-center justify-between">
// //                                     <div>
// //                                         <p className="text-sm text-slate-700 font-medium">Total Students</p>
// //                                         <p className="text-2xl font-bold text-slate-800 mt-1">
// //                                             {classResults.length}
// //                                         </p>
// //                                     </div>
// //                                     <Users className="w-8 h-8 text-slate-600 opacity-50" />
// //                                 </div>
// //                             </div>
// //                         </div>

// //                         <ClassResultsTable
// //                             classResults={classResults}
// //                             subjects={subjects}
// //                             activeAssessmentType={activeAssessmentType}
// //                             activeConfig={activeConfig}
// //                             calculateGrade={calculateGrade}
// //                             onPrint={handlePrint}
// //                             onExport={handleExport}
// //                         />
// //                     </div>
// //                 ) : selectedClassForResults ? (
// //                     <div className="text-center py-12 bg-slate-50 rounded-xl">
// //                         <p className="text-slate-500">No results found for this class. Enter student results first.</p>
// //                     </div>
// //                 ) : (
// //                     <div className="text-center py-12 bg-slate-50 rounded-xl">
// //                         <p className="text-slate-500">Select a class to view results</p>
// //                     </div>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // };

// // export default ClassResultsManagement;