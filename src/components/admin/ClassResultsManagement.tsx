import React, { useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TrendingUp, Award, CheckCircle, Users, Download } from 'lucide-react';
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

    const tableRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

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
        setIsDownloading(true);

        try {
            const doc = new jsPDF('l', 'mm', 'a4');

            // ===== FIXED: calculateSubjectFinalScore in PDF generation =====
            const calculateSubjectFinalScore = (subject: any): number => {
                // If absent in endOfTerm, return 0
                if (subject.endOfTerm_absent) {
                    return 0;
                }

                if (!activeConfig) {
                    // Default to average of all tests if no config
                    // Only include tests that have valid scores (including 0)
                    let sum = 0;
                    let count = 0;

                    if (!subject.qa1_absent && subject.qa1 !== null && subject.qa1 >= 0) {
                        sum += subject.qa1;
                        count++;
                    }
                    if (!subject.qa2_absent && subject.qa2 !== null && subject.qa2 >= 0) {
                        sum += subject.qa2;
                        count++;
                    }
                    if (!subject.endOfTerm_absent && subject.endOfTerm !== null && subject.endOfTerm >= 0) {
                        sum += subject.endOfTerm;
                        count++;
                    }

                    return count > 0 ? sum / count : 0;
                }

                switch (activeConfig.calculation_method) {
                    case 'end_of_term_only':
                        return subject.endOfTerm_absent ? 0 : subject.endOfTerm;

                    case 'weighted_average':
                        const w1 = activeConfig.weight_qa1 || 0;
                        const w2 = activeConfig.weight_qa2 || 0;
                        const w3 = activeConfig.weight_end_of_term || 0;

                        let weightedSum = 0;
                        let totalWeight = 0;

                        // Only include QA1 if it's valid and not absent
                        if (!subject.qa1_absent && subject.qa1 !== null && subject.qa1 >= 0) {
                            weightedSum += subject.qa1 * w1 / 100;
                            totalWeight += w1;
                        }

                        // Only include QA2 if it's valid and not absent
                        if (!subject.qa2_absent && subject.qa2 !== null && subject.qa2 >= 0) {
                            weightedSum += subject.qa2 * w2 / 100;
                            totalWeight += w2;
                        }

                        // End term is always included (with 0 if absent)
                        weightedSum += (subject.endOfTerm_absent ? 0 : subject.endOfTerm) * w3 / 100;
                        totalWeight += w3;

                        return totalWeight > 0 ? (weightedSum * 100) / totalWeight : 0;

                    case 'average_all':
                    default:
                        let sum = 0;
                        let count = 0;

                        if (!subject.qa1_absent && subject.qa1 !== null && subject.qa1 >= 0) {
                            sum += subject.qa1;
                            count++;
                        }
                        if (!subject.qa2_absent && subject.qa2 !== null && subject.qa2 >= 0) {
                            sum += subject.qa2;
                            count++;
                        }
                        // Always include endOfTerm (with 0 if absent)
                        sum += subject.endOfTerm_absent ? 0 : subject.endOfTerm;
                        count++;

                        return count > 0 ? sum / count : 0;
                }
            };

            // ===== FIXED: calculateStudentOverallAverage in PDF generation =====
            const calculateStudentOverallAverage = (student: ClassResultStudent): number => {
                // Include ALL subjects - don't filter them out
                if (student.subjects.length === 0) return 0;

                const totalScore = student.subjects.reduce((sum, subject) => {
                    const finalScore = calculateSubjectFinalScore(subject);
                    return sum + finalScore;
                }, 0);

                return totalScore / student.subjects.length; // Divide by total subjects, not just valid ones
            };

            // ===== FIXED: calculateStudentAssessmentAverage in PDF generation =====
            const calculateStudentAssessmentAverage = (student: ClassResultStudent): number => {
                let totalScore = 0;
                let subjectCount = 0;

                student.subjects.forEach(subject => {
                    let score = 0;
                    let isAbsent = false;

                    if (activeAssessmentType === 'qa1') {
                        score = subject.qa1;
                        isAbsent = subject.qa1_absent || false;
                    } else if (activeAssessmentType === 'qa2') {
                        score = subject.qa2;
                        isAbsent = subject.qa2_absent || false;
                    } else { // endOfTerm
                        score = subject.endOfTerm;
                        isAbsent = subject.endOfTerm_absent || false;
                    }

                    // Include if:
                    // 1. Not absent AND score is a valid number (including 0)
                    if (!isAbsent && !isNaN(score) && score !== null && score >= 0) {
                        totalScore += score;
                        subjectCount++;
                    }
                    // 2. If absent, count it as 0 (so subjectCount increments but score is 0)
                    else if (isAbsent) {
                        totalScore += 0;
                        subjectCount++;
                    }
                });

                return subjectCount > 0 ? totalScore / subjectCount : 0;
            };

            // ===== FIXED: getStudentSubjectsWithScores in PDF generation =====
            const getStudentSubjectsWithScores = (student: ClassResultStudent) => {
                return student.subjects.filter(subject => {
                    // Include subjects that have ANY valid data (including 0 or absent)
                    const hasValidQA1 = subject.qa1 !== null && subject.qa1 >= 0;
                    const hasValidQA2 = subject.qa2 !== null && subject.qa2 >= 0;
                    const hasValidEndTerm = subject.endOfTerm !== null && subject.endOfTerm >= 0;
                    const hasAbsent = subject.qa1_absent || subject.qa2_absent || subject.endOfTerm_absent;

                    return hasValidQA1 || hasValidQA2 || hasValidEndTerm || hasAbsent;
                });
            };

            // ===== FIXED: calculateTotalMarks in PDF generation =====
            const calculateTotalMarks = (student: ClassResultStudent): number => {
                if (activeAssessmentType === 'overall') {
                    const average = calculateStudentOverallAverage(student);
                    return average * student.subjects.length; // Multiply by total subjects
                }

                let total = 0;
                student.subjects.forEach(subject => {
                    let score = 0;
                    let isAbsent = false;

                    if (activeAssessmentType === 'qa1') {
                        score = subject.qa1;
                        isAbsent = subject.qa1_absent || false;
                    } else if (activeAssessmentType === 'qa2') {
                        score = subject.qa2;
                        isAbsent = subject.qa2_absent || false;
                    } else { // endOfTerm
                        score = subject.endOfTerm;
                        isAbsent = subject.endOfTerm_absent || false;
                    }

                    // Include if:
                    // 1. Not absent AND score is a valid number (including 0)
                    if (!isAbsent && !isNaN(score) && score !== null && score >= 0) {
                        total += score;
                    }
                    // 2. If absent, add 0 (count it)
                    else if (isAbsent) {
                        total += 0;
                    }
                });

                return total;
            };

            // Filter subjects - include those with ANY data (scores including 0 OR absent)
            const subjectsWithData = new Set<string>();
            classResults.forEach(student => {
                student.subjects.forEach(subject => {
                    let hasData = false;

                    if (activeAssessmentType === 'overall') {
                        hasData = (subject.qa1 !== null && subject.qa1 >= 0) ||
                            (subject.qa2 !== null && subject.qa2 >= 0) ||
                            (subject.endOfTerm !== null && subject.endOfTerm >= 0) ||
                            subject.qa1_absent || subject.qa2_absent || subject.endOfTerm_absent;
                    } else if (activeAssessmentType === 'qa1') {
                        hasData = (subject.qa1 !== null && subject.qa1 >= 0) || subject.qa1_absent;
                    } else if (activeAssessmentType === 'qa2') {
                        hasData = (subject.qa2 !== null && subject.qa2 >= 0) || subject.qa2_absent;
                    } else { // endOfTerm
                        hasData = (subject.endOfTerm !== null && subject.endOfTerm >= 0) || subject.endOfTerm_absent;
                    }

                    if (hasData) {
                        subjectsWithData.add(subject.name);
                    }
                });
            });
            const filteredSubjects = subjects.filter(subject => subjectsWithData.has(subject.name));

            // Calculate Metrics per Student
            const studentsWithCalculations = classResults.map(student => {
                const totalMarks = calculateTotalMarks(student);
                const average = activeAssessmentType === 'overall'
                    ? calculateStudentOverallAverage(student)
                    : calculateStudentAssessmentAverage(student);

                return {
                    ...student,
                    calculatedTotalMarks: totalMarks,
                    calculatedAverage: average,
                    calculatedGrade: calculateGrade(average, activeConfig?.pass_mark),
                    calculatedStatus: calculateGrade(average, activeConfig?.pass_mark) === 'F' ? 'Failed' : 'Passed'
                };
            });

            // Sort by Total Marks (as per your table logic)
            const sortedStudents = [...studentsWithCalculations].sort((a, b) => b.calculatedTotalMarks - a.calculatedTotalMarks);

            // --- 3. GENERATE HEADER STATS ---
            const totalStudents = sortedStudents.length;
            const passedCount = sortedStudents.filter(s => s.calculatedStatus === 'Passed').length;
            const failedCount = sortedStudents.filter(s => s.calculatedStatus === 'Failed').length;
            const passRate = totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0;
            const classAverage = totalStudents > 0
                ? sortedStudents.reduce((acc, s) => acc + s.calculatedAverage, 0) / totalStudents
                : 0;

            const selectedClass = classes.find(c => c.id === selectedClassForResults);
            const className = selectedClass?.name || 'Class';
            const termName = selectedClass?.term || '';
            const academicYear = selectedClass?.academic_year || '';

            // Text Strings
            const mainTitle = `${className} - ${termName}, ${academicYear} - Results (${activeAssessmentType.toUpperCase()})`;
            const statsLine1 = `Total Students: ${totalStudents}    |    Class Average: ${classAverage.toFixed(1)}%`;
            const statsLine2 = `Passed: ${passedCount}    |    Failed: ${failedCount}    |    Pass Rate: ${passRate.toFixed(1)}%`;

            // --- 4. BUILD TABLE BODY ---
            const tableHead = [
                'Rank',
                'Student Name',
                ...filteredSubjects.map(s => s.name),
                'Total',
                'Avg',
                'Grade',
                'Status'
            ];

            // === UPDATED RANKING LOGIC (DENSE RANKING: 1, 1, 2) ===
            let currentRank = 1;
            let previousMarks: number | null = null;

            const tableBody = sortedStudents.map((student, index) => {
                let displayRank = currentRank;

                if (index === 0) {
                    // First student is always rank 1
                    displayRank = 1;
                    currentRank = 1;
                } else if (previousMarks !== null && student.calculatedTotalMarks === previousMarks) {
                    // Tie: Keep same rank as previous (1, 1)
                    displayRank = currentRank;
                } else {
                    // New score: Just increment rank by 1 (1, 1, 2)
                    currentRank++;
                    displayRank = currentRank;
                }

                previousMarks = student.calculatedTotalMarks;

                // Subject Columns
                const subjectCols = filteredSubjects.map((subj) => {
                    const studentSubject = student.subjects?.find((s: any) => s.name === subj.name);
                    if (!studentSubject) return '-';

                    if (activeAssessmentType === 'overall') {
                        const hasScores = (studentSubject.qa1 !== null && studentSubject.qa1 >= 0) ||
                            (studentSubject.qa2 !== null && studentSubject.qa2 >= 0) ||
                            (studentSubject.endOfTerm !== null && studentSubject.endOfTerm >= 0);
                        const hasAbsent = studentSubject.qa1_absent || studentSubject.qa2_absent || studentSubject.endOfTerm_absent;

                        if (!hasScores && !hasAbsent) return '-';

                        const finalScore = calculateSubjectFinalScore(studentSubject);
                        const grade = calculateGrade(finalScore, activeConfig?.pass_mark);

                        // Check if endOfTerm is absent for display
                        if (studentSubject.endOfTerm_absent) {
                            return `AB (${grade})`;
                        }

                        return `${finalScore.toFixed(1)} (${grade})`;
                    } else {
                        let score = 0;
                        let isAbsent = false;

                        if (activeAssessmentType === 'qa1') {
                            score = studentSubject.qa1;
                            isAbsent = studentSubject.qa1_absent;
                        } else if (activeAssessmentType === 'qa2') {
                            score = studentSubject.qa2;
                            isAbsent = studentSubject.qa2_absent;
                        } else { // endOfTerm
                            score = studentSubject.endOfTerm;
                            isAbsent = studentSubject.endOfTerm_absent;
                        }

                        if (isAbsent) {
                            return 'AB';
                        } else if (score !== null && score >= 0) {
                            const grade = calculateGrade(score, activeConfig?.pass_mark);
                            return `${score} (${grade})`;
                        }
                        return '-';
                    }
                });

                return [
                    displayRank,
                    student.name,
                    ...subjectCols,
                    student.calculatedTotalMarks.toFixed(1),
                    (student.calculatedAverage || 0).toFixed(1) + '%',
                    student.calculatedGrade,
                    student.calculatedStatus
                ];
            });

            // --- 5. RENDER PDF ---
            autoTable(doc, {
                head: [tableHead],
                body: tableBody,
                startY: 35,
                styles: { fontSize: 7, cellPadding: 1 },
                headStyles: { fillColor: [63, 81, 181] },
                didDrawPage: (data) => {
                    if (data.pageNumber === 1) {
                        doc.setFontSize(16);
                        doc.setTextColor(40);
                        doc.text(mainTitle, 14, 15);

                        doc.setFontSize(10);
                        doc.setTextColor(80);
                        doc.text(statsLine1, 14, 22);
                        doc.text(statsLine2, 14, 27);
                    }
                }
            });

            doc.save(`${className}_Results_${activeAssessmentType}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to download PDF');
        } finally {
            setIsDownloading(false);
        }
    };


    const metrics = useMemo(() => {
        const totalStudentsInClass = students.filter(student => student.class?.id === selectedClassForResults).length;

        if (!selectedClassForResults || totalStudentsInClass === 0) {
            return {
                classAverage: 0,
                topPerformerName: 'N/A',
                topPerformerScore: 0,
                passRate: 0,
                totalStudents: totalStudentsInClass,
                studentsWithScoresRatio: `0/${totalStudentsInClass}`,
                passedCount: 0,
                failedCount: 0,
                topPerformers: [] // Add this for potential future use
            };
        }

        let totalAvg = 0;
        let topScore = -1;
        let topPerformers: { name: string; score: number }[] = []; // Array to store all top performers
        let passedCount = 0;
        let failedCount = 0;
        let studentsWithScoresCount = 0;

        classResults.forEach(student => {
            let avg = 0;
            let hasValidScore = false;

            if (activeAssessmentType === 'overall') {
                const validSubjects = student.subjects.filter(s => s.qa1 > 0 || s.qa2 > 0 || s.endOfTerm > 0);
                if (validSubjects.length > 0) {
                    const total = validSubjects.reduce((sum, s) => sum + ((s.qa1 + s.qa2 + s.endOfTerm) / 3), 0);
                    avg = total / validSubjects.length;
                    hasValidScore = true;
                }
            } else {
                let total = 0;
                let count = 0;
                student.subjects.forEach(s => {
                    let score = 0;
                    let isAbsent = false;

                    if (activeAssessmentType === 'qa1') {
                        score = s.qa1;
                        isAbsent = s.qa1_absent || false;
                    } else if (activeAssessmentType === 'qa2') {
                        score = s.qa2;
                        isAbsent = s.qa2_absent || false;
                    } else { // endOfTerm
                        score = s.endOfTerm;
                        isAbsent = s.endOfTerm_absent || false;
                    }

                    // Include if not absent AND has valid score (including 0)
                    if (!isAbsent && !isNaN(score) && score !== null && score >= 0) {
                        total += score;
                        count++;
                        hasValidScore = true;
                    }
                    // If absent, count it as 0 for the average
                    else if (isAbsent) {
                        total += 0;
                        count++;
                        hasValidScore = true; // Still consider this student for pass/fail
                    }
                });
                if (count > 0) {
                    avg = total / count;
                }
            }

            // Only consider students with at least one valid score or absent mark for pass/fail calculation
            if (hasValidScore) {
                totalAvg += avg;
                studentsWithScoresCount++;

                // Track top performers
                if (avg > topScore) {
                    topScore = avg;
                    topPerformers = [{ name: student.name, score: avg }];
                } else if (avg === topScore && topScore !== -1) {
                    topPerformers.push({ name: student.name, score: avg });
                }

                // Determine pass/fail based on average and pass mark
                const grade = calculateGrade(avg, activeConfig?.pass_mark);
                if (grade !== 'F') {
                    passedCount++;
                } else {
                    failedCount++;
                }
            }
            // Students with no scores at all should not be counted in pass/fail
        });

        const classAverage = studentsWithScoresCount > 0 ? totalAvg / studentsWithScoresCount : 0;
        // Calculate pass rate based on students with scores, not total students
        const passRate = studentsWithScoresCount > 0 ? (passedCount / studentsWithScoresCount) * 100 : 0;

        // Format top performer names for display
        let topPerformerDisplay = 'N/A';
        if (topPerformers.length > 0) {
            if (topPerformers.length === 1) {
                topPerformerDisplay = topPerformers[0].name;
            } else {
                // If multiple top performers, show first few names with "& X more"
                const maxNamesToShow = 2;
                const names = topPerformers.map(p => p.name);
                if (names.length <= maxNamesToShow) {
                    topPerformerDisplay = names.join(' & ');
                } else {
                    topPerformerDisplay = `${names.slice(0, maxNamesToShow).join(', ')} & ${names.length - maxNamesToShow} more`;
                }
            }
        }

        return {
            classAverage,
            topPerformerName: topPerformerDisplay,
            topPerformerScore: topScore > -1 ? topScore : 0,
            passRate,
            totalStudents: totalStudentsInClass,
            studentsWithScores: studentsWithScoresCount,
            studentsWithScoresRatio: `${studentsWithScoresCount}/${totalStudentsInClass}`,
            passedCount,
            failedCount,
            topPerformers // Include the full array for potential future use
        };
    }, [classResults, activeAssessmentType, students, selectedClassForResults, activeConfig, calculateGrade]);

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
                            {/* NEW (mobile): keep tabs from overflowing by wrapping */}
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'overall', label: 'Overall' },
                                    { id: 'qa1', label: 'QA1' },
                                    { id: 'qa2', label: 'QA2' },
                                    { id: 'endOfTerm', label: 'End Term' }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setActiveAssessmentType(type.id as any)}
                                        className={`px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors md:px-3 md:py-2 ${activeAssessmentType === type.id
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
                        {/* Top Cards */}
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

                        <div ref={tableRef} className="bg-white p-1">
                            <ClassResultsTable
                                classResults={classResults}
                                subjects={subjects}
                                activeAssessmentType={activeAssessmentType}
                                activeConfig={activeConfig}
                                calculateGrade={calculateGrade}
                                onPrint={handlePrint}
                                onExport={handleExport}
                                isDownloading={isDownloading}
                            />
                        </div>
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


// import React, { useMemo, useRef, useState } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { TrendingUp, Award, CheckCircle, Users, Download } from 'lucide-react';
// import { SubjectRecord } from '@/services/studentService';
// import { GradeConfiguration } from '@/services/gradeConfigService';
// import { ClassResultStudent, Student } from '@/types/admin';
// import ClassResultsTable from './tables/ClassResultsTable';

// interface ClassResultsManagementProps {
//     classes: any[];
//     subjects: SubjectRecord[];
//     classResults: ClassResultStudent[];
//     students: Student[];
//     selectedClassForResults: string;
//     activeAssessmentType: 'qa1' | 'qa2' | 'endOfTerm' | 'overall';
//     resultsLoading: boolean;
//     activeConfig: GradeConfiguration | null;
//     setSelectedClassForResults: (classId: string) => void;
//     setActiveAssessmentType: (type: 'qa1' | 'qa2' | 'endOfTerm' | 'overall') => void;
//     loadClassResults: (classId: string) => Promise<void>;
//     calculateGrade: (score: number, passMark?: number) => string;
//     isTeacherView?: boolean;
// }

// const ClassResultsManagement: React.FC<ClassResultsManagementProps> = ({
//     classes,
//     subjects,
//     classResults,
//     students,
//     selectedClassForResults,
//     activeAssessmentType,
//     resultsLoading,
//     activeConfig,
//     setSelectedClassForResults,
//     setActiveAssessmentType,
//     loadClassResults,
//     calculateGrade,
// }) => {

//     const tableRef = useRef<HTMLDivElement>(null);
//     const [isDownloading, setIsDownloading] = useState(false);

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
//         setIsDownloading(true);

//         try {
//             const doc = new jsPDF('l', 'mm', 'a4');

//             // ===== FIXED: calculateSubjectFinalScore in PDF generation =====
//             const calculateSubjectFinalScore = (subject: any): number => {
//                 // If absent in endOfTerm, return 0
//                 if (subject.endOfTerm_absent) {
//                     return 0;
//                 }

//                 if (!activeConfig) {
//                     // Default to average of all tests if no config
//                     // Only include tests that have valid scores (including 0)
//                     let sum = 0;
//                     let count = 0;

//                     if (!subject.qa1_absent && subject.qa1 !== null && subject.qa1 >= 0) {
//                         sum += subject.qa1;
//                         count++;
//                     }
//                     if (!subject.qa2_absent && subject.qa2 !== null && subject.qa2 >= 0) {
//                         sum += subject.qa2;
//                         count++;
//                     }
//                     if (!subject.endOfTerm_absent && subject.endOfTerm !== null && subject.endOfTerm >= 0) {
//                         sum += subject.endOfTerm;
//                         count++;
//                     }

//                     return count > 0 ? sum / count : 0;
//                 }

//                 switch (activeConfig.calculation_method) {
//                     case 'end_of_term_only':
//                         return subject.endOfTerm_absent ? 0 : subject.endOfTerm;

//                     case 'weighted_average':
//                         const w1 = activeConfig.weight_qa1 || 0;
//                         const w2 = activeConfig.weight_qa2 || 0;
//                         const w3 = activeConfig.weight_end_of_term || 0;

//                         let weightedSum = 0;
//                         let totalWeight = 0;

//                         // Only include QA1 if it's valid and not absent
//                         if (!subject.qa1_absent && subject.qa1 !== null && subject.qa1 >= 0) {
//                             weightedSum += subject.qa1 * w1 / 100;
//                             totalWeight += w1;
//                         }

//                         // Only include QA2 if it's valid and not absent
//                         if (!subject.qa2_absent && subject.qa2 !== null && subject.qa2 >= 0) {
//                             weightedSum += subject.qa2 * w2 / 100;
//                             totalWeight += w2;
//                         }

//                         // End term is always included (with 0 if absent)
//                         weightedSum += (subject.endOfTerm_absent ? 0 : subject.endOfTerm) * w3 / 100;
//                         totalWeight += w3;

//                         return totalWeight > 0 ? (weightedSum * 100) / totalWeight : 0;

//                     case 'average_all':
//                     default:
//                         let sum = 0;
//                         let count = 0;

//                         if (!subject.qa1_absent && subject.qa1 !== null && subject.qa1 >= 0) {
//                             sum += subject.qa1;
//                             count++;
//                         }
//                         if (!subject.qa2_absent && subject.qa2 !== null && subject.qa2 >= 0) {
//                             sum += subject.qa2;
//                             count++;
//                         }
//                         // Always include endOfTerm (with 0 if absent)
//                         sum += subject.endOfTerm_absent ? 0 : subject.endOfTerm;
//                         count++;

//                         return count > 0 ? sum / count : 0;
//                 }
//             };

//             // ===== FIXED: calculateStudentOverallAverage in PDF generation =====
//             const calculateStudentOverallAverage = (student: ClassResultStudent): number => {
//                 // Include ALL subjects - don't filter them out
//                 if (student.subjects.length === 0) return 0;

//                 const totalScore = student.subjects.reduce((sum, subject) => {
//                     const finalScore = calculateSubjectFinalScore(subject);
//                     return sum + finalScore;
//                 }, 0);

//                 return totalScore / student.subjects.length; // Divide by total subjects, not just valid ones
//             };

//             // ===== FIXED: calculateStudentAssessmentAverage in PDF generation =====
//             const calculateStudentAssessmentAverage = (student: ClassResultStudent): number => {
//                 let totalScore = 0;
//                 let subjectCount = 0;

//                 student.subjects.forEach(subject => {
//                     let score = 0;
//                     let isAbsent = false;

//                     if (activeAssessmentType === 'qa1') {
//                         score = subject.qa1;
//                         isAbsent = subject.qa1_absent || false;
//                     } else if (activeAssessmentType === 'qa2') {
//                         score = subject.qa2;
//                         isAbsent = subject.qa2_absent || false;
//                     } else { // endOfTerm
//                         score = subject.endOfTerm;
//                         isAbsent = subject.endOfTerm_absent || false;
//                     }

//                     // Include if:
//                     // 1. Not absent AND score is a valid number (including 0)
//                     if (!isAbsent && !isNaN(score) && score !== null && score >= 0) {
//                         totalScore += score;
//                         subjectCount++;
//                     }
//                     // 2. If absent, count it as 0 (so subjectCount increments but score is 0)
//                     else if (isAbsent) {
//                         totalScore += 0;
//                         subjectCount++;
//                     }
//                 });

//                 return subjectCount > 0 ? totalScore / subjectCount : 0;
//             };

//             // ===== FIXED: getStudentSubjectsWithScores in PDF generation =====
//             const getStudentSubjectsWithScores = (student: ClassResultStudent) => {
//                 return student.subjects.filter(subject => {
//                     // Include subjects that have ANY valid data (including 0 or absent)
//                     const hasValidQA1 = subject.qa1 !== null && subject.qa1 >= 0;
//                     const hasValidQA2 = subject.qa2 !== null && subject.qa2 >= 0;
//                     const hasValidEndTerm = subject.endOfTerm !== null && subject.endOfTerm >= 0;
//                     const hasAbsent = subject.qa1_absent || subject.qa2_absent || subject.endOfTerm_absent;

//                     return hasValidQA1 || hasValidQA2 || hasValidEndTerm || hasAbsent;
//                 });
//             };

//             // ===== FIXED: calculateTotalMarks in PDF generation =====
//             const calculateTotalMarks = (student: ClassResultStudent): number => {
//                 if (activeAssessmentType === 'overall') {
//                     const average = calculateStudentOverallAverage(student);
//                     return average * student.subjects.length; // Multiply by total subjects
//                 }

//                 let total = 0;
//                 student.subjects.forEach(subject => {
//                     let score = 0;
//                     let isAbsent = false;

//                     if (activeAssessmentType === 'qa1') {
//                         score = subject.qa1;
//                         isAbsent = subject.qa1_absent || false;
//                     } else if (activeAssessmentType === 'qa2') {
//                         score = subject.qa2;
//                         isAbsent = subject.qa2_absent || false;
//                     } else { // endOfTerm
//                         score = subject.endOfTerm;
//                         isAbsent = subject.endOfTerm_absent || false;
//                     }

//                     // Include if:
//                     // 1. Not absent AND score is a valid number (including 0)
//                     if (!isAbsent && !isNaN(score) && score !== null && score >= 0) {
//                         total += score;
//                     }
//                     // 2. If absent, add 0 (count it)
//                     else if (isAbsent) {
//                         total += 0;
//                     }
//                 });

//                 return total;
//             };

//             // Filter subjects - include those with ANY data (scores including 0 OR absent)
//             const subjectsWithData = new Set<string>();
//             classResults.forEach(student => {
//                 student.subjects.forEach(subject => {
//                     let hasData = false;

//                     if (activeAssessmentType === 'overall') {
//                         hasData = (subject.qa1 !== null && subject.qa1 >= 0) ||
//                             (subject.qa2 !== null && subject.qa2 >= 0) ||
//                             (subject.endOfTerm !== null && subject.endOfTerm >= 0) ||
//                             subject.qa1_absent || subject.qa2_absent || subject.endOfTerm_absent;
//                     } else if (activeAssessmentType === 'qa1') {
//                         hasData = (subject.qa1 !== null && subject.qa1 >= 0) || subject.qa1_absent;
//                     } else if (activeAssessmentType === 'qa2') {
//                         hasData = (subject.qa2 !== null && subject.qa2 >= 0) || subject.qa2_absent;
//                     } else { // endOfTerm
//                         hasData = (subject.endOfTerm !== null && subject.endOfTerm >= 0) || subject.endOfTerm_absent;
//                     }

//                     if (hasData) {
//                         subjectsWithData.add(subject.name);
//                     }
//                 });
//             });
//             const filteredSubjects = subjects.filter(subject => subjectsWithData.has(subject.name));

//             // Calculate Metrics per Student
//             const studentsWithCalculations = classResults.map(student => {
//                 const totalMarks = calculateTotalMarks(student);
//                 const average = activeAssessmentType === 'overall'
//                     ? calculateStudentOverallAverage(student)
//                     : calculateStudentAssessmentAverage(student);

//                 return {
//                     ...student,
//                     calculatedTotalMarks: totalMarks,
//                     calculatedAverage: average,
//                     calculatedGrade: calculateGrade(average, activeConfig?.pass_mark),
//                     calculatedStatus: calculateGrade(average, activeConfig?.pass_mark) === 'F' ? 'Failed' : 'Passed'
//                 };
//             });

//             // Sort by Total Marks (as per your table logic)
//             const sortedStudents = [...studentsWithCalculations].sort((a, b) => b.calculatedTotalMarks - a.calculatedTotalMarks);

//             // --- 3. GENERATE HEADER STATS ---
//             const totalStudents = sortedStudents.length;
//             const passedCount = sortedStudents.filter(s => s.calculatedStatus === 'Passed').length;
//             const failedCount = sortedStudents.filter(s => s.calculatedStatus === 'Failed').length;
//             const passRate = totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0;
//             const classAverage = totalStudents > 0
//                 ? sortedStudents.reduce((acc, s) => acc + s.calculatedAverage, 0) / totalStudents
//                 : 0;

//             const selectedClass = classes.find(c => c.id === selectedClassForResults);
//             const className = selectedClass?.name || 'Class';
//             const termName = selectedClass?.term || '';
//             const academicYear = selectedClass?.academic_year || '';

//             // Text Strings
//             const mainTitle = `${className} - ${termName}, ${academicYear} - Results (${activeAssessmentType.toUpperCase()})`;
//             const statsLine1 = `Total Students: ${totalStudents}    |    Class Average: ${classAverage.toFixed(1)}%`;
//             const statsLine2 = `Passed: ${passedCount}    |    Failed: ${failedCount}    |    Pass Rate: ${passRate.toFixed(1)}%`;

//             // --- 4. BUILD TABLE BODY ---
//             const tableHead = [
//                 'Rank',
//                 'Student Name',
//                 ...filteredSubjects.map(s => s.name),
//                 'Total',
//                 'Avg',
//                 'Grade',
//                 'Status'
//             ];

//             // === UPDATED RANKING LOGIC (DENSE RANKING: 1, 1, 2) ===
//             let currentRank = 1;
//             let previousMarks: number | null = null;

//             const tableBody = sortedStudents.map((student, index) => {
//                 let displayRank = currentRank;

//                 if (index === 0) {
//                     // First student is always rank 1
//                     displayRank = 1;
//                     currentRank = 1;
//                 } else if (previousMarks !== null && student.calculatedTotalMarks === previousMarks) {
//                     // Tie: Keep same rank as previous (1, 1)
//                     displayRank = currentRank;
//                 } else {
//                     // New score: Just increment rank by 1 (1, 1, 2)
//                     currentRank++;
//                     displayRank = currentRank;
//                 }

//                 previousMarks = student.calculatedTotalMarks;

//                 // Subject Columns
//                 const subjectCols = filteredSubjects.map((subj) => {
//                     const studentSubject = student.subjects?.find((s: any) => s.name === subj.name);
//                     if (!studentSubject) return '-';

//                     if (activeAssessmentType === 'overall') {
//                         const hasScores = (studentSubject.qa1 !== null && studentSubject.qa1 >= 0) ||
//                             (studentSubject.qa2 !== null && studentSubject.qa2 >= 0) ||
//                             (studentSubject.endOfTerm !== null && studentSubject.endOfTerm >= 0);
//                         const hasAbsent = studentSubject.qa1_absent || studentSubject.qa2_absent || studentSubject.endOfTerm_absent;

//                         if (!hasScores && !hasAbsent) return '-';

//                         const finalScore = calculateSubjectFinalScore(studentSubject);
//                         const grade = calculateGrade(finalScore, activeConfig?.pass_mark);

//                         // Check if endOfTerm is absent for display
//                         if (studentSubject.endOfTerm_absent) {
//                             return `AB (${grade})`;
//                         }

//                         return `${finalScore.toFixed(1)} (${grade})`;
//                     } else {
//                         let score = 0;
//                         let isAbsent = false;

//                         if (activeAssessmentType === 'qa1') {
//                             score = studentSubject.qa1;
//                             isAbsent = studentSubject.qa1_absent;
//                         } else if (activeAssessmentType === 'qa2') {
//                             score = studentSubject.qa2;
//                             isAbsent = studentSubject.qa2_absent;
//                         } else { // endOfTerm
//                             score = studentSubject.endOfTerm;
//                             isAbsent = studentSubject.endOfTerm_absent;
//                         }

//                         if (isAbsent) {
//                             return 'AB';
//                         } else if (score !== null && score >= 0) {
//                             const grade = calculateGrade(score, activeConfig?.pass_mark);
//                             return `${score} (${grade})`;
//                         }
//                         return '-';
//                     }
//                 });

//                 return [
//                     displayRank,
//                     student.name,
//                     ...subjectCols,
//                     student.calculatedTotalMarks.toFixed(1),
//                     (student.calculatedAverage || 0).toFixed(1) + '%',
//                     student.calculatedGrade,
//                     student.calculatedStatus
//                 ];
//             });

//             // --- 5. RENDER PDF ---
//             autoTable(doc, {
//                 head: [tableHead],
//                 body: tableBody,
//                 startY: 35,
//                 styles: { fontSize: 7, cellPadding: 1 },
//                 headStyles: { fillColor: [63, 81, 181] },
//                 didDrawPage: (data) => {
//                     if (data.pageNumber === 1) {
//                         doc.setFontSize(16);
//                         doc.setTextColor(40);
//                         doc.text(mainTitle, 14, 15);

//                         doc.setFontSize(10);
//                         doc.setTextColor(80);
//                         doc.text(statsLine1, 14, 22);
//                         doc.text(statsLine2, 14, 27);
//                     }
//                 }
//             });

//             doc.save(`${className}_Results_${activeAssessmentType}.pdf`);

//         } catch (error) {
//             console.error('Error generating PDF:', error);
//             alert('Failed to download PDF');
//         } finally {
//             setIsDownloading(false);
//         }
//     };


//     const metrics = useMemo(() => {
//         const totalStudentsInClass = students.filter(student => student.class?.id === selectedClassForResults).length;

//         if (!selectedClassForResults || totalStudentsInClass === 0) {
//             return {
//                 classAverage: 0,
//                 topPerformerName: 'N/A',
//                 topPerformerScore: 0,
//                 passRate: 0,
//                 totalStudents: totalStudentsInClass,
//                 studentsWithScoresRatio: `0/${totalStudentsInClass}`,
//                 passedCount: 0,
//                 failedCount: 0,
//                 topPerformers: [] // Add this for potential future use
//             };
//         }

//         let totalAvg = 0;
//         let topScore = -1;
//         let topPerformers: { name: string; score: number }[] = []; // Array to store all top performers
//         let passedCount = 0;
//         let failedCount = 0;
//         let studentsWithScoresCount = 0;

//         classResults.forEach(student => {
//             let avg = 0;
//             let hasValidScore = false;

//             if (activeAssessmentType === 'overall') {
//                 const validSubjects = student.subjects.filter(s => s.qa1 > 0 || s.qa2 > 0 || s.endOfTerm > 0);
//                 if (validSubjects.length > 0) {
//                     const total = validSubjects.reduce((sum, s) => sum + ((s.qa1 + s.qa2 + s.endOfTerm) / 3), 0);
//                     avg = total / validSubjects.length;
//                     hasValidScore = true;
//                 }
//             } else {
//                 let total = 0;
//                 let count = 0;
//                 student.subjects.forEach(s => {
//                     let score = 0;
//                     let isAbsent = false;

//                     if (activeAssessmentType === 'qa1') {
//                         score = s.qa1;
//                         isAbsent = s.qa1_absent || false;
//                     } else if (activeAssessmentType === 'qa2') {
//                         score = s.qa2;
//                         isAbsent = s.qa2_absent || false;
//                     } else { // endOfTerm
//                         score = s.endOfTerm;
//                         isAbsent = s.endOfTerm_absent || false;
//                     }

//                     // Include if not absent AND has valid score (including 0)
//                     if (!isAbsent && !isNaN(score) && score !== null && score >= 0) {
//                         total += score;
//                         count++;
//                         hasValidScore = true;
//                     }
//                     // If absent, count it as 0 for the average
//                     else if (isAbsent) {
//                         total += 0;
//                         count++;
//                         hasValidScore = true; // Still consider this student for pass/fail
//                     }
//                 });
//                 if (count > 0) {
//                     avg = total / count;
//                 }
//             }

//             // Only consider students with at least one valid score or absent mark for pass/fail calculation
//             if (hasValidScore) {
//                 totalAvg += avg;
//                 studentsWithScoresCount++;

//                 // Track top performers
//                 if (avg > topScore) {
//                     topScore = avg;
//                     topPerformers = [{ name: student.name, score: avg }];
//                 } else if (avg === topScore && topScore !== -1) {
//                     topPerformers.push({ name: student.name, score: avg });
//                 }

//                 // Determine pass/fail based on average and pass mark
//                 const grade = calculateGrade(avg, activeConfig?.pass_mark);
//                 if (grade !== 'F') {
//                     passedCount++;
//                 } else {
//                     failedCount++;
//                 }
//             }
//             // Students with no scores at all should not be counted in pass/fail
//         });

//         const classAverage = studentsWithScoresCount > 0 ? totalAvg / studentsWithScoresCount : 0;
//         // Calculate pass rate based on students with scores, not total students
//         const passRate = studentsWithScoresCount > 0 ? (passedCount / studentsWithScoresCount) * 100 : 0;

//         // Format top performer names for display
//         let topPerformerDisplay = 'N/A';
//         if (topPerformers.length > 0) {
//             if (topPerformers.length === 1) {
//                 topPerformerDisplay = topPerformers[0].name;
//             } else {
//                 // If multiple top performers, show first few names with "& X more"
//                 const maxNamesToShow = 2;
//                 const names = topPerformers.map(p => p.name);
//                 if (names.length <= maxNamesToShow) {
//                     topPerformerDisplay = names.join(' & ');
//                 } else {
//                     topPerformerDisplay = `${names.slice(0, maxNamesToShow).join(', ')} & ${names.length - maxNamesToShow} more`;
//                 }
//             }
//         }

//         return {
//             classAverage,
//             topPerformerName: topPerformerDisplay,
//             topPerformerScore: topScore > -1 ? topScore : 0,
//             passRate,
//             totalStudents: totalStudentsInClass,
//             studentsWithScores: studentsWithScoresCount,
//             studentsWithScoresRatio: `${studentsWithScoresCount}/${totalStudentsInClass}`,
//             passedCount,
//             failedCount,
//             topPerformers // Include the full array for potential future use
//         };
//     }, [classResults, activeAssessmentType, students, selectedClassForResults, activeConfig, calculateGrade]);

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
//                             {/* NEW (mobile): keep tabs from overflowing by wrapping */}
//                             <div className="flex flex-wrap gap-2">
//                                 {[
//                                     { id: 'overall', label: 'Overall' },
//                                     { id: 'qa1', label: 'QA1' },
//                                     { id: 'qa2', label: 'QA2' },
//                                     { id: 'endOfTerm', label: 'End Term' }
//                                 ].map(type => (
//                                     <button
//                                         key={type.id}
//                                         onClick={() => setActiveAssessmentType(type.id as any)}
//                                         className={`px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors md:px-3 md:py-2 ${activeAssessmentType === type.id
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
//                         {/* Top Cards */}
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
//                                             {metrics.passedCount} passed / {metrics.failedCount} failed
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

//                         <div ref={tableRef} className="bg-white p-1">
//                             <ClassResultsTable
//                                 classResults={classResults}
//                                 subjects={subjects}
//                                 activeAssessmentType={activeAssessmentType}
//                                 activeConfig={activeConfig}
//                                 calculateGrade={calculateGrade}
//                                 onPrint={handlePrint}
//                                 onExport={handleExport}
//                                 isDownloading={isDownloading}
//                             />
//                         </div>
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