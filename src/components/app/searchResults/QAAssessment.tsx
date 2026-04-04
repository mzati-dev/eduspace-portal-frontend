import React, { useState, useEffect } from 'react';
import { StudentData } from '@/types';
import { TabType } from '@/types/app';
import { FileText, Download, Loader2, Target, Users, Award, UserCircle, ChevronUp, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StudentAcademicInfo from './StudentAcademicInfo';

interface QAAssessmentProps {
    studentData: StudentData;
    activeTab: TabType;
    showPDFOnly?: boolean;
}

// Define the shape of the data coming from your API
interface SchoolFromDB {
    id: string;
    name: string;
}

const QAAssessment: React.FC<QAAssessmentProps> = ({ studentData, activeTab, showPDFOnly = false }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [schoolName, setSchoolName] = useState<string>('Loading School...');
    const assessmentType = activeTab as 'qa1' | 'qa2' | 'endOfTerm';
    const [showInfo, setShowInfo] = useState(false);


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setShowInfo(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch school name (same as ReportCard)
    useEffect(() => {
        const fetchSchoolName = async () => {
            if (!studentData.examNumber) {
                setSchoolName('Unknown School');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://eduspace-portal-backend.onrender.com/schools', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (response.ok) {
                    const schools: SchoolFromDB[] = await response.json();
                    let examPrefix = '';

                    if (studentData.examNumber.includes('-')) {
                        examPrefix = studentData.examNumber.split('-')[0];
                    } else {
                        examPrefix = studentData.examNumber.substring(0, 3);
                    }

                    const matchedSchool = schools.find(school =>
                        school.id.toString().toLowerCase().startsWith(examPrefix.toLowerCase())
                    );

                    if (matchedSchool) {
                        setSchoolName(matchedSchool.name);
                    } else {
                        setSchoolName('School Not Found');
                    }
                }
            } catch (error) {
                console.error('Failed to load school name', error);
                setSchoolName('Error Loading School');
            }
        };

        fetchSchoolName();
    }, [studentData.examNumber]);

    // Helper functions
    const getAssessmentTitle = (type: 'qa1' | 'qa2' | 'endOfTerm') => {
        switch (type) {
            case 'qa1': return 'Quarterly Assessment 1';
            case 'qa2': return 'Quarterly Assessment 2';
            case 'endOfTerm': return 'End of Term Examination';
            default: return 'Assessment';
        }
    };

    const getGradeColor = (grade: string) => {
        if (grade === 'N/A') return 'text-slate-600 bg-slate-100';

        // Handle points (1-9) for Form 3/4
        if (grade >= '1' && grade <= '9') {
            if (grade === '1' || grade === '2') return 'text-emerald-600 bg-emerald-50';
            if (grade === '3' || grade === '4') return 'text-blue-600 bg-blue-50';
            if (grade === '5' || grade === '6') return 'text-amber-600 bg-amber-50';
            if (grade === '7' || grade === '8') return 'text-orange-600 bg-orange-50';
            return 'text-red-600 bg-red-50'; // Grade 9
        }

        if (grade.includes('A')) return 'text-emerald-600 bg-emerald-50';
        if (grade === 'B') return 'text-blue-600 bg-blue-50';
        if (grade === 'C') return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    const calculateGrade = (score: number, passMark?: number, className?: string): string => {
        const effectivePassMark = passMark || 50;

        const isForm3Or4 = className && (
            className.includes('Form 3') ||
            className.includes('Form 4') ||
            className.includes('Form3') ||
            className.includes('Form4')
        );
        if (isForm3Or4) {
            if (score >= 80) return '1';
            if (score >= 75) return '2';
            if (score >= 70) return '3';
            if (score >= 65) return '4';
            if (score >= 60) return '5';
            if (score >= 55) return '6';
            if (score >= 51) return '7';
            if (score >= effectivePassMark) return '8';
            return '9';
        }
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= effectivePassMark) return 'D';
        return 'F';
    };

    const getGradeRemark = (grade: string): string => {
        // For points system (Form 3/4)
        if (grade >= '1' && grade <= '9') {
            if (grade === '1' || grade === '2') return 'Distinction';
            if (grade === '3' || grade === '4' || grade === '5' || grade === '6') return 'Credit';
            if (grade === '7' || grade === '8') return 'Pass';
            return 'Fail';
        }

        // For letter grades (Primary & Form 1/2)
        switch (grade) {
            case 'A': return 'Excellent';
            case 'B': return 'Very Good';
            case 'C': return 'Good';
            case 'D': return 'Satisfactory';
            case 'F': return 'Fail';
            default: return 'N/A';
        }
    };

    // Calculate total points for best 6 subjects - English always included
    // const calculateBestSixPoints = (): number => {
    //     // Get all subjects with valid points (1-9), ignore AB
    //     const allSubjects = studentData.subjects.filter(subject => {
    //         const grade = getSubjectGradeForAssessment(subject);
    //         return grade !== 'AB' && grade >= '1' && grade <= '9';
    //     });

    //     if (allSubjects.length === 0) return 0;

    //     // Find English subject
    //     let englishPoints = null;
    //     const otherPoints = [];

    //     for (const subject of allSubjects) {
    //         const points = parseInt(getSubjectGradeForAssessment(subject), 10);
    //         if (subject.name.toLowerCase() === 'english' || subject.name.toLowerCase() === 'eng') {
    //             englishPoints = points;
    //         } else {
    //             otherPoints.push(points);
    //         }
    //     }

    //     // If no English found, just take best 6 from all subjects
    //     if (englishPoints === null) {
    //         const allPoints = allSubjects.map(s => parseInt(getSubjectGradeForAssessment(s), 10));
    //         allPoints.sort((a, b) => a - b);
    //         const bestSix = allPoints.slice(0, 6);
    //         return bestSix.reduce((sum, p) => sum + p, 0);
    //     }

    //     // Sort other subjects points ascending
    //     otherPoints.sort((a, b) => a - b);

    //     // Take best 5 from other subjects
    //     const bestFive = otherPoints.slice(0, 5);

    //     // Return English + best 5 others
    //     return englishPoints + bestFive.reduce((sum, p) => sum + p, 0);
    // };

    // Calculate total points for best 6 subjects - English always included
    // Calculate total points for best 6 subjects - English always included
    const calculateBestSixPoints = (): number => {
        // Get all subjects with valid points (1-9) AND have valid numeric scores (not null)
        const allSubjects = studentData.subjects.filter(subject => {
            const score = subject[assessmentType];
            const isAbsent = assessmentType === 'qa1' ? subject.qa1_absent :
                assessmentType === 'qa2' ? subject.qa2_absent :
                    subject.endOfTerm_absent;

            // Must have a valid numeric score AND not absent AND grade must be points
            if (isAbsent) return false;
            if (score === null || score === undefined) return false;
            if (typeof score !== 'number') return false;

            const grade = getSubjectGradeForAssessment(subject);
            return grade !== 'AB' && grade >= '1' && grade <= '9';
        });

        if (allSubjects.length === 0) return 0;

        // Find English subject
        let englishPoints = null;
        const otherPoints = [];

        for (const subject of allSubjects) {
            const points = parseInt(getSubjectGradeForAssessment(subject), 10);
            if (subject.name.toLowerCase() === 'english' || subject.name.toLowerCase() === 'eng') {
                englishPoints = points;
            } else {
                otherPoints.push(points);
            }
        }

        // If no English found, just take best 6 from all subjects (or all if less than 6)
        if (englishPoints === null) {
            const allPoints = allSubjects.map(s => parseInt(getSubjectGradeForAssessment(s), 10));
            allPoints.sort((a, b) => a - b);
            const bestSubjects = allPoints.slice(0, Math.min(allPoints.length, 6));
            return bestSubjects.reduce((sum, p) => sum + p, 0);
        }

        // Sort other points ascending (lower is better: 1 is best, 9 is worst)
        otherPoints.sort((a, b) => a - b);

        // If total subjects (including English) is 6 or less, take ALL other subjects
        const totalSubjectsCount = 1 + otherPoints.length;

        if (totalSubjectsCount <= 6) {
            // Take all other subjects (no selection needed)
            const total = englishPoints + otherPoints.reduce((sum, p) => sum + p, 0);
            return total;
        } else {
            // Take best 5 from other subjects (lowest points)
            const bestFive = otherPoints.slice(0, 5);
            const total = englishPoints + bestFive.reduce((sum, p) => sum + p, 0);
            return total;
        }
    };


    // Calculate average score based on best 5 subjects + English
    // const calculateBestSixAverage = (): string => {
    //     // Get all subjects with valid numeric scores (not AB, not null)
    //     const subjectsWithScores = studentData.subjects.filter(subject => {
    //         const score = subject[assessmentType];
    //         const isAbsent = assessmentType === 'qa1' ? subject.qa1_absent :
    //             assessmentType === 'qa2' ? subject.qa2_absent :
    //                 subject.endOfTerm_absent;
    //         return !isAbsent && score !== null && score !== undefined && typeof score === 'number';
    //     });

    //     if (subjectsWithScores.length === 0) return 'N/A';

    //     // Find English subject
    //     let englishScore = null;
    //     const otherScores = [];

    //     for (const subject of subjectsWithScores) {
    //         const score = subject[assessmentType] as number;
    //         if (subject.name.toLowerCase() === 'english' || subject.name.toLowerCase() === 'eng') {
    //             englishScore = score;
    //         } else {
    //             otherScores.push(score);
    //         }
    //     }

    //     // If no English found, return average of all subjects
    //     if (englishScore === null) {
    //         const total = subjectsWithScores.reduce((sum, s) => sum + (s[assessmentType] as number), 0);
    //         return (total / subjectsWithScores.length).toFixed(1);
    //     }

    //     // Sort other scores descending (highest first)
    //     otherScores.sort((a, b) => b - a);

    //     // Take best 5 from other subjects
    //     const bestFive = otherScores.slice(0, 5);

    //     // Calculate total: English + best 5 others
    //     const total = englishScore + bestFive.reduce((sum, s) => sum + s, 0);
    //     const count = 1 + bestFive.length;

    //     return (total / count).toFixed(1);
    // };


    // Calculate average score based on best 5 subjects + English (or all if <=6 subjects)
    const calculateBestSixAverage = (): string => {
        // Get all subjects with valid numeric scores (not AB, not null)
        const subjectsWithScores = studentData.subjects.filter(subject => {
            const score = subject[assessmentType];
            const isAbsent = assessmentType === 'qa1' ? subject.qa1_absent :
                assessmentType === 'qa2' ? subject.qa2_absent :
                    subject.endOfTerm_absent;
            return !isAbsent && score !== null && score !== undefined && typeof score === 'number';
        });

        if (subjectsWithScores.length === 0) return 'N/A';

        // Find English subject
        let englishScore = null;
        const otherScores = [];

        for (const subject of subjectsWithScores) {
            const score = subject[assessmentType] as number;
            if (subject.name.toLowerCase() === 'english' || subject.name.toLowerCase() === 'eng') {
                englishScore = score;
            } else {
                otherScores.push(score);
            }
        }

        // If no English found, return average of all subjects
        if (englishScore === null) {
            const total = subjectsWithScores.reduce((sum, s) => sum + (s[assessmentType] as number), 0);
            return (total / subjectsWithScores.length).toFixed(1);
        }

        // Sort other scores descending (highest first)
        otherScores.sort((a, b) => b - a);

        // If total subjects (including English) is 6 or less, take ALL other subjects
        const totalSubjectsCount = 1 + otherScores.length;
        let bestOthers;

        if (totalSubjectsCount <= 6) {
            // Take all other subjects
            bestOthers = otherScores;
        } else {
            // Take best 5 from other subjects
            bestOthers = otherScores.slice(0, 5);
        }

        // Calculate total: English + best others
        const total = englishScore + bestOthers.reduce((sum, s) => sum + s, 0);
        const count = 1 + bestOthers.length;

        return (total / count).toFixed(1);
    };

    // Helper to get subject grade for assessment
    const getSubjectGradeForAssessment = (subject: any): string => {
        const score = subject[assessmentType];
        const isAbsent = assessmentType === 'qa1' ? subject.qa1_absent :
            assessmentType === 'qa2' ? subject.qa2_absent :
                subject.endOfTerm_absent;

        if (isAbsent) return 'AB';
        if (score === null || score === undefined) return 'N/A';
        return calculateGrade(score, studentData.gradeConfiguration?.pass_mark || 50, studentData.class);
    };

    const calculateAverage = (
        subjects: StudentData['subjects'],
        type: 'qa1' | 'qa2' | 'endOfTerm'
    ): string => {

        const validSubjects = subjects.filter(s => {
            const score = s[type];
            const isAbsent =
                type === 'qa1' ? s.qa1_absent :
                    type === 'qa2' ? s.qa2_absent :
                        s.endOfTerm_absent;

            return !isAbsent && score !== null && score !== undefined;
        });

        if (validSubjects.length === 0) return 'N/A';

        const total = validSubjects.reduce((acc, s) => acc + s[type], 0);

        return (total / validSubjects.length).toFixed(1);
    };


    const calculateTotalScored = (): number => {
        const subjectsWithScores = studentData.subjects.filter(s =>
            hasValidScore(s, assessmentType)
        );

        if (subjectsWithScores.length === 0) return 0;

        const total = subjectsWithScores.reduce((sum, subject) => {
            const score = subject[assessmentType];

            // Do not add AB to total
            if (typeof score !== 'number') return sum;

            return sum + score;
        }, 0);

        return Math.round(total);
    };

    // CORRECTED: Calculate average grade for the assessment
    const calculateAssessmentAverage = (): string => {
        // const subjectsWithScores = studentData.subjects.filter(subject =>
        //     hasValidScore(subject[assessmentType])
        // );

        const subjectsWithScores = studentData.subjects.filter(s => hasValidScore(s, assessmentType))


        if (subjectsWithScores.length === 0) return 'N/A';

        const total = subjectsWithScores.reduce((sum, subject) => {
            return sum + subject[assessmentType]!;
        }, 0);

        return (total / subjectsWithScores.length).toFixed(1);
    };

    const hasValidScore = (
        subject: any,
        type: 'qa1' | 'qa2' | 'endOfTerm'
    ): boolean => {

        const score = subject[type];

        const isAbsent =
            type === 'qa1' ? subject.qa1_absent :
                type === 'qa2' ? subject.qa2_absent :
                    subject.endOfTerm_absent;

        // Absent counts as an entry
        if (isAbsent) return true;

        // Null means no score entered
        if (score === null || score === undefined) return false;

        // Must be a number (0 allowed)
        return typeof score === 'number' && !isNaN(score);
    };


    const hasAssessmentScores = (assessmentType: 'qa1' | 'qa2' | 'endOfTerm'): boolean => {
        if (!studentData || !studentData.subjects || studentData.subjects.length === 0) return false;

        return studentData.subjects.some(subject => {
            const score = subject[assessmentType];
            const absentFlag = assessmentType === 'qa1' ? subject.qa1_absent
                : assessmentType === 'qa2' ? subject.qa2_absent
                    : subject.endOfTerm_absent;

            if (absentFlag) return true;

            if (typeof score === 'string' && score === 'AB') return true;

            return typeof score === 'number';
        });
    };

    // PDF Generation function for assessments
    const handleDownloadAssessmentPDF = () => {
        setIsDownloading(true);

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            let y = 20;

            // ===== HEADER ===== (Same as ReportCard)
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(schoolName || 'School Name', pageWidth / 2, y, { align: 'center' });

            y += 6;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`${getAssessmentTitle(assessmentType)} Results`, pageWidth / 2, y, { align: 'center' });

            y += 8;

            // ===== STUDENT & ACADEMIC INFO ===== (Same as ReportCard)
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('STUDENT & ACADEMIC INFORMATION', 14, y);
            y += 4;
            doc.setFont('helvetica', 'normal');

            doc.text(`Student Name: ${studentData.name || 'N/A'}`, 14, y);
            doc.text(`Exam Number: ${studentData.examNumber || 'N/A'}`, 14, y + 6);
            doc.text(`Class: ${studentData.class || 'N/A'}`, 14, y + 12);

            doc.text(`Academic Year: ${studentData.academicYear || 'N/A'}`, 120, y);
            doc.text(`Term: ${studentData.term || 'N/A'}`, 120, y + 6);
            doc.text(`Total Enrollment: ${studentData.totalStudents || 'N/A'}`, 120, y + 12);

            y += 22;

            // ===== ASSESSMENT SUMMARY =====
            doc.setFont('helvetica', 'bold');
            doc.text('ASSESSMENT SUMMARY', 14, y);
            y += 7;

            doc.setFont('helvetica', 'normal');

            // Check if using points system (Form 3/4) and add Total Points
            const firstSubject = studentData.subjects[0];
            const isPointsSystem = firstSubject && getSubjectGradeForAssessment(firstSubject) >= '1' && getSubjectGradeForAssessment(firstSubject) <= '9';


            // 1. Data Calculations
            // const avgScore = calculateAssessmentAverage();
            const avgScore = isPointsSystem ? calculateBestSixAverage() : calculateAssessmentAverage();
            const numericAvg = avgScore === 'N/A' ? null : parseFloat(avgScore);
            // const subjectsWithScores = studentData.subjects.filter(s => hasValidScore(s[assessmentType]));
            const subjectsWithScores = studentData.subjects.filter(s => hasValidScore(s, assessmentType))
            const passMark = studentData.gradeConfiguration?.pass_mark || 50;

            // RESOLVED RANK: Fetching from assessmentStats based on the active tab
            const displayRank = studentData.assessmentStats?.[assessmentType]?.classRank || 'N/A';

            // Determine Status and Grade
            // const assessmentStatus = numericAvg !== null ? (numericAvg >= passMark ? 'PASSED' : 'FAILED') : 'N/A';
            // For points system, check if English grade is 9 (Fail)
            let assessmentStatus = 'N/A';
            if (numericAvg !== null) {
                if (isPointsSystem) {
                    // Find English subject grade
                    const englishSubject = studentData.subjects.find(s =>
                        s.name.toLowerCase() === 'english' || s.name.toLowerCase() === 'eng'
                    );
                    if (englishSubject) {
                        const englishGrade = getSubjectGradeForAssessment(englishSubject);
                        if (englishGrade === '9') {
                            assessmentStatus = 'FAILED';
                        } else {
                            assessmentStatus = numericAvg >= passMark ? 'PASSED' : 'FAILED';
                        }
                    } else {
                        assessmentStatus = numericAvg >= passMark ? 'PASSED' : 'FAILED';
                    }
                } else {
                    assessmentStatus = numericAvg >= passMark ? 'PASSED' : 'FAILED';
                }
            }
            const assessmentGrade = numericAvg !== null ? calculateGrade(numericAvg, passMark, studentData.class) : 'N/A';
            const avgText = numericAvg !== null ? `${avgScore}%` : 'N/A';

            // 2. Row 1: Assessment Type & Subjects Count
            doc.text(`Assessment Type: ${getAssessmentTitle(assessmentType)}`, 14, y);
            doc.text(`Subjects Assessed: ${subjectsWithScores.length}/${studentData.subjects.length}`, 120, y);
            y += 7;

            // 3. Row 2: Average Score & Class Position
            doc.text(`Average Score: ${avgText}`, 14, y);
            doc.text(`Class Position: ${displayRank}`, 120, y);
            y += 7;

            // 4. Row 3: Overall Grade & Overall Status
            // doc.text(`Overall Grade: ${assessmentGrade}`, 14, y);
            // doc.text(`Overall Status: ${assessmentStatus}`, 120, y);

            // y += 7;


            // if (isPointsSystem) {
            //     const totalPoints = calculateBestSixPoints();
            //     doc.text(`Total Points (Best 6): ${totalPoints}`, 14, y);
            //     doc.text(`Remark: ${getGradeRemark(assessmentGrade)}`, 120, y);
            //     y += 7;
            // }

            // 4. Row 3: This handles Grade/Points and Status on the SAME line
            if (isPointsSystem) {
                const totalPoints = calculateBestSixPoints();
                doc.text(`Total Points (Best 6): ${totalPoints}`, 14, y);
            } else {
                doc.text(`Overall Grade: ${assessmentGrade}`, 14, y);
            }

            // Position Status on the right side of the SAME row
            doc.text(`Overall Status: ${assessmentStatus}`, 120, y);

            // Only increment Y ONCE after both pieces of info are placed
            y += 10;

            // Final spacing before Results table
            y += 3;

            // Final spacing before Results table
            // y += 10;
            // ===== RESULTS TABLE =====
            doc.setFont('helvetica', 'bold');
            doc.text('RESULTS', 14, y);
            y += 3;
            doc.setFont('helvetica', 'normal');

            // Filter subjects with valid scores
            // const subjectsWithValidScores = studentData.subjects.filter(subject =>
            //     hasValidScore(subject[assessmentType])
            // );

            // const subjectsWithValidScores = studentData.subjects.filter(s => hasValidScore(s, assessmentType));
            const subjectsWithValidScores = studentData.subjects.filter(subject =>
                hasValidScore(subject, assessmentType)
            );

            if (subjectsWithValidScores.length > 0) {

                const tableBody = subjectsWithValidScores.map(subject => {
                    const score = subject[assessmentType];

                    const isAbsent =
                        assessmentType === 'qa1' ? subject.qa1_absent :
                            assessmentType === 'qa2' ? subject.qa2_absent :
                                subject.endOfTerm_absent;

                    // If Absent → show AB clearly
                    if (isAbsent) {
                        return [
                            subject.name,
                            '100',
                            'AB',
                            'AB',
                            'Absent'
                        ];
                    }

                    // Otherwise must be numeric
                    const numericScore = score as number;
                    const grade = calculateGrade(numericScore, passMark, studentData.class);
                    const remark = getGradeRemark(grade);
                    const status = (grade === 'F' || grade === '9') ? 'Failed' : 'Passed';

                    return [
                        subject.name,
                        '100',
                        numericScore.toFixed(1),
                        grade,
                        remark,
                        status
                    ];
                });

                // CORRECTED: Add GRAND TOTAL row (Same as ReportCard)
                // const totalScored = calculateTotalScored();
                // const totalSubjects = subjectsWithValidScores.length;
                // const averageScore = parseFloat(avgScore);
                // const overallGrade = calculateGrade(averageScore, passMark, studentData.class);
                // const overallRemark = getGradeRemark(overallGrade);
                // const overallStatus = (overallGrade === 'F' || overallGrade === '9') ? 'Failed' : 'Passed';

                // tableBody.push([
                //     'GRAND TOTAL',
                //     String(totalSubjects * 100), // Total possible marks
                //     // totalScored, // Total scored marks
                //     String(totalScored), // Total scored marks
                //     overallGrade,
                //     overallRemark,
                //     overallStatus
                // ]);

                // Add GRAND TOTAL row ONLY for letter grades (NOT for points system)
                if (!isPointsSystem) {
                    const totalScored = calculateTotalScored();
                    const totalSubjects = subjectsWithValidScores.length;
                    const averageScore = parseFloat(avgScore);
                    const overallGrade = calculateGrade(averageScore, passMark, studentData.class);
                    const overallRemark = getGradeRemark(overallGrade);
                    const overallStatus = (overallGrade === 'F' || overallGrade === '9') ? 'Failed' : 'Passed';

                    tableBody.push([
                        'GRAND TOTAL',
                        String(totalSubjects * 100),
                        String(totalScored),
                        overallGrade,
                        overallRemark,
                        overallStatus
                    ]);
                }

                // autoTable(doc, {
                //     startY: y,
                //     head: [['Subject', 'Total Marks', 'Marks Scored', 'Grade', 'Remark', 'Status']],
                //     body: tableBody,
                //     theme: 'striped',
                //     didParseCell: (data) => {
                //         if (data.row.index === tableBody.length - 1) {
                //             data.cell.styles.fontStyle = 'bold';
                //         }
                //     },
                // });

                autoTable(doc, {
                    startY: y,
                    head: [['Subject', 'Total Marks', 'Marks Scored', 'Grade', 'Remark', 'Status']],
                    body: tableBody,
                    theme: 'striped',
                    didParseCell: (data) => {
                        // Only make the last row bold if it's the GRAND TOTAL row AND we're NOT in points system
                        if (!isPointsSystem && data.row.index === tableBody.length - 1) {
                            data.cell.styles.fontStyle = 'bold';
                        }
                    },
                });

                y = (doc as any).lastAutoTable.finalY + 8;
            } else {
                doc.text('No assessment scores available for this period.', 14, y);
                y += 10;
            }

            // ===== PERFORMANCE ANALYSIS =====
            if (subjectsWithValidScores.length > 0) {
                doc.setFont('helvetica', 'bold');
                doc.text('PERFORMANCE ANALYSIS', 14, y);
                y += 4;
                doc.setFont('helvetica', 'normal');

                // 1. Find Highest Score and ALL subjects that have it
                const scores = subjectsWithValidScores.map(s => s[assessmentType]);
                const highestScore = Math.max(...scores);
                const strongestSubjects = subjectsWithValidScores.filter(s => s[assessmentType] === highestScore);
                const strongestNames = strongestSubjects.map(s => s.name).join(', ');

                // 2. Find ALL subjects with D or F grades
                // const needsImprovement = subjectsWithValidScores.filter(s => {
                //     const grade = calculateGrade(s[assessmentType], passMark, studentData.class);
                //     return ['D', 'F'].includes(grade);
                // });

                // 2. Find ALL subjects that need improvement (D, F for letters; 7,8,9 for points)
                const needsImprovement = subjectsWithValidScores.filter(s => {
                    const grade = calculateGrade(s[assessmentType], passMark, studentData.class);
                    // For points system: 7,8,9 are weak (Pass and Fail)
                    if (grade >= '1' && grade <= '9') {
                        return grade === '7' || grade === '8' || grade === '9';
                    }
                    // For letter grades: D and F
                    return ['D', 'F'].includes(grade);
                });

                // Create a string like "Maths (D), Science (F)"
                const improvementNames = needsImprovement.length > 0
                    ? needsImprovement.map(s => `${s.name} (${calculateGrade(s[assessmentType], passMark, studentData.class)})`).join(', ')
                    : 'None';

                // --- Render Best Subjects (Left) ---
                const strongLabel = `Best Subject${strongestSubjects.length > 1 ? 's' : ''}: `;
                const strongLines = doc.splitTextToSize(`${strongLabel}${strongestNames}`, 95);
                doc.text(strongLines, 14, y);
                doc.text(`Score: ${Math.round(highestScore)}%`, 14, y + (strongLines.length * 5));

                // --- Render Needs Improvement (Right) ---
                const improvementLabel = `Needs Improvement: `;
                const improvementLines = doc.splitTextToSize(`${improvementLabel}${improvementNames}`, 75);
                doc.text(improvementLines, 120, y);

                // If there are failures, show a sub-message, otherwise show a success message
                if (needsImprovement.length > 0) {
                    doc.setFontSize(8);
                    doc.text(`Total flagged: ${needsImprovement.length}`, 120, y + (improvementLines.length * 5) + 1);
                    doc.setFontSize(10);
                } else {
                    doc.text(`All subjects are currently satisfactory`, 120, y + 5);
                }

                // Move Y down based on whichever column was longer
                y += Math.max(strongLines.length * 5 + 10, improvementLines.length * 5 + 10);

                // --- Performance Stats ---
                // const stats = subjectsWithValidScores.map(s => ({
                //     score: s[assessmentType],
                //     grade: calculateGrade(s[assessmentType], passMark, studentData.class)
                // }));



                //     const subjectsPassed = stats.filter(s => s.grade !== 'F').length;
                //     const abGrades = stats.filter(s => ['A', 'B'].includes(s.grade)).length;
                //     const cdGrades = stats.filter(s => ['C', 'D'].includes(s.grade)).length;
                //     const belowPass = stats.filter(s => s.score < passMark).length;

                //     doc.text(`Subjects Passed: ${subjectsPassed}/${subjectsWithValidScores.length}`, 14, y);
                //     doc.text(`A & B Grades: ${abGrades}`, 14, y + 6);
                //     doc.text(`C & D Grades: ${cdGrades}`, 14, y + 12);
                //     doc.text(`Subjects Below ${passMark}% Pass Mark: ${belowPass}`, 14, y + 18);

                //     y += 28;
                // }

                // --- Performance Stats ---
                const stats = subjectsWithValidScores.map(s => ({
                    score: s[assessmentType],
                    grade: calculateGrade(s[assessmentType], passMark, studentData.class)
                }));

                const subjectsPassed = stats.filter(s => s.grade !== 'F' && s.grade !== '9').length;
                const belowPass = stats.filter(s => s.score < passMark).length;

                doc.text(`Subjects Passed: ${subjectsPassed}/${subjectsWithValidScores.length}`, 14, y);
                y += 6;

                // Dynamically show grade ranges based on whether using points or letters
                const sampleGrade = stats[0]?.grade || '';
                const isPointsSystem = sampleGrade >= '1' && sampleGrade <= '9';

                if (isPointsSystem) {
                    const distinctionCount = stats.filter(s => s.grade === '1' || s.grade === '2').length;
                    const creditCount = stats.filter(s => ['3', '4', '5', '6'].includes(s.grade)).length;
                    const passCount = stats.filter(s => s.grade === '7' || s.grade === '8').length;
                    const failCount = stats.filter(s => s.grade === '9').length;

                    doc.text(`Distinction: ${distinctionCount}`, 14, y);
                    doc.text(`Credit: ${creditCount}`, 14, y + 6);
                    doc.text(`Pass: ${passCount}`, 14, y + 12);
                    doc.text(`Fail: ${failCount}`, 14, y + 18);
                    doc.text(`Subjects Below Pass Mark: ${belowPass}`, 14, y + 24);
                    y += 30;
                } else {
                    const aCount = stats.filter(s => s.grade === 'A').length;
                    const bCount = stats.filter(s => s.grade === 'B').length;
                    const cCount = stats.filter(s => s.grade === 'C').length;
                    const dCount = stats.filter(s => s.grade === 'D').length;
                    const fCount = stats.filter(s => s.grade === 'F').length;

                    doc.text(`A Grades (Excellent): ${aCount}`, 14, y);
                    doc.text(`B Grades (Very Good): ${bCount}`, 14, y + 6);
                    doc.text(`C Grades (Good): ${cCount}`, 14, y + 12);
                    doc.text(`D Grades (Satisfactory): ${dCount}`, 14, y + 18);
                    doc.text(`F Grades (Fail): ${fCount}`, 14, y + 24);
                    doc.text(`Subjects Below ${passMark}% Pass Mark: ${belowPass}`, 14, y + 30);
                    y += 36;
                }
            }
            // ===== TEACHER REMARK =====
            doc.setFont('helvetica', 'bold');
            doc.text("TEACHER'S REMARK", 14, y);
            y += 4;
            doc.setFont('helvetica', 'normal');

            // let teacherRemark = '';
            // if (avgScore === 'N/A') {
            //     teacherRemark = 'No assessment scores available for evaluation.';
            // } else {
            //     const numericAvg = parseFloat(avgScore);
            //     if (numericAvg >= 80) {
            //         teacherRemark = 'Outstanding performance! Excellent understanding of concepts.';
            //     } else if (numericAvg >= 70) {
            //         teacherRemark = 'Good performance. Shows strong understanding with room for growth.';
            //     } else if (numericAvg >= passMark) {
            //         teacherRemark = 'Satisfactory performance. Focus on improving in weaker areas.';
            //     } else {
            //         teacherRemark = 'Additional effort required. Please seek help and dedicate more time to studies.';
            //     }
            // }

            let teacherRemark = '';
            if (avgScore === 'N/A') {
                teacherRemark = 'No assessment scores available for evaluation.';
            } else {
                // For points system, check if English grade is 9 (Fail)
                if (isPointsSystem) {
                    const englishSubject = studentData.subjects.find(s =>
                        s.name.toLowerCase() === 'english' || s.name.toLowerCase() === 'eng'
                    );
                    if (englishSubject) {
                        const englishGrade = getSubjectGradeForAssessment(englishSubject);
                        if (englishGrade === '9') {
                            teacherRemark = 'Failed due to English grade 9. Please retake English examination.';
                        } else {
                            const numericAvg = parseFloat(avgScore);
                            if (numericAvg >= 80) {
                                teacherRemark = 'Outstanding performance! Excellent understanding of concepts.';
                            } else if (numericAvg >= 70) {
                                teacherRemark = 'Good performance. Shows strong understanding with room for growth.';
                            } else if (numericAvg >= passMark) {
                                teacherRemark = 'Satisfactory performance. Focus on improving in weaker areas.';
                            } else {
                                teacherRemark = 'Additional effort required. Please seek help and dedicate more time to studies.';
                            }
                        }
                    } else {
                        const numericAvg = parseFloat(avgScore);
                        if (numericAvg >= 80) {
                            teacherRemark = 'Outstanding performance! Excellent understanding of concepts.';
                        } else if (numericAvg >= 70) {
                            teacherRemark = 'Good performance. Shows strong understanding with room for growth.';
                        } else if (numericAvg >= passMark) {
                            teacherRemark = 'Satisfactory performance. Focus on improving in weaker areas.';
                        } else {
                            teacherRemark = 'Additional effort required. Please seek help and dedicate more time to studies.';
                        }
                    }
                } else {
                    const numericAvg = parseFloat(avgScore);
                    if (numericAvg >= 80) {
                        teacherRemark = 'Outstanding performance! Excellent understanding of concepts.';
                    } else if (numericAvg >= 70) {
                        teacherRemark = 'Good performance. Shows strong understanding with room for growth.';
                    } else if (numericAvg >= passMark) {
                        teacherRemark = 'Satisfactory performance. Focus on improving in weaker areas.';
                    } else {
                        teacherRemark = 'Additional effort required. Please seek help and dedicate more time to studies.';
                    }
                }
            }

            doc.text(`"${teacherRemark}"`, 14, y);

            y += 14;

            // ===== FOOTER ===== (Same as ReportCard)
            const footerTitle = `${getAssessmentTitle(assessmentType)} Results Generated`;
            const footerDesc = "This assessment report was generated based on the school's active grade calculation configuration.\nFor any questions or clarifications, please contact the school administration.";;
            const generatedOn = `Generated on: ${new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}`;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(footerTitle, pageWidth / 2, y, { align: 'center' });
            y += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(footerDesc, pageWidth - 28);
            lines.forEach((line) => {
                doc.text(line, pageWidth / 2, y, { align: 'center' });
                y += 5;
            });

            doc.text(generatedOn, pageWidth / 2, y, { align: 'center' });

            // ===== SAVE =====
            const studentName = studentData.name || 'Student';
            const filename = `${getAssessmentTitle(assessmentType).replace(/\s+/g, '_')}_${studentName.replace(/\s+/g, '_')}.pdf`;

            doc.save(filename);

        } catch (error) {
            console.error('PDF Error:', error);
            alert('Could not generate PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    // Rest of your existing component code...
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

    const avgScore = calculateAssessmentAverage();
    // const subjectsWithScores = studentData.subjects.filter(s => hasValidScore(s[assessmentType]));
    const subjectsWithScores = studentData.subjects.filter(s => hasValidScore(s, assessmentType));
    const passMark = studentData.gradeConfiguration?.pass_mark || 50;
    const totalScored = calculateTotalScored();



    // Add this function to render the PDF content
    // Replace your entire renderPDFContent function with this:

    const renderPDFContent = () => {
        const assessmentType = activeTab as 'qa1' | 'qa2' | 'endOfTerm';

        // Check if using points system
        const firstSubject = studentData.subjects[0];
        const sampleGrade = firstSubject ? getSubjectGradeForAssessment(firstSubject) : '';
        const isPointsSystem = sampleGrade >= '1' && sampleGrade <= '9';

        // Calculate average based on points system
        const avgScore = isPointsSystem ? calculateBestSixAverage() : calculateAssessmentAverage();
        const numericAvg = avgScore === 'N/A' ? null : parseFloat(avgScore);
        const subjectsWithScores = studentData.subjects.filter(s => hasValidScore(s, assessmentType));
        const passMark = studentData.gradeConfiguration?.pass_mark || 50;
        const displayRank = studentData.assessmentStats?.[assessmentType]?.classRank || 'N/A';
        // const assessmentStatus = numericAvg !== null ? (numericAvg >= passMark ? 'PASSED' : 'FAILED') : 'N/A';

        // For points system, check if English grade is 9 (Fail)
        let assessmentStatus = 'N/A';
        if (numericAvg !== null) {
            if (isPointsSystem) {
                // Find English subject grade
                const englishSubject = studentData.subjects.find(s =>
                    s.name.toLowerCase() === 'english' || s.name.toLowerCase() === 'eng'
                );
                if (englishSubject) {
                    const englishGrade = getSubjectGradeForAssessment(englishSubject);
                    if (englishGrade === '9') {
                        assessmentStatus = 'FAILED';
                    } else {
                        assessmentStatus = numericAvg >= passMark ? 'PASSED' : 'FAILED';
                    }
                } else {
                    assessmentStatus = numericAvg >= passMark ? 'PASSED' : 'FAILED';
                }
            } else {
                assessmentStatus = numericAvg >= passMark ? 'PASSED' : 'FAILED';
            }
        }
        const assessmentGrade = numericAvg !== null ? calculateGrade(numericAvg, passMark, studentData.class) : 'N/A';
        const totalScored = calculateTotalScored();

        // Calculate performance stats
        const subjectsPassed = subjectsWithScores.filter(s => {
            const grade = calculateGrade(s[assessmentType], passMark, studentData.class);
            return grade !== 'F';
        }).length;

        const abGrades = subjectsWithScores.filter(s => {
            const grade = calculateGrade(s[assessmentType], passMark, studentData.class);
            return ['A', 'B'].includes(grade);
        }).length;

        const cdGrades = subjectsWithScores.filter(s => {
            const grade = calculateGrade(s[assessmentType], passMark, studentData.class);
            return ['C', 'D'].includes(grade);
        }).length;

        const belowPass = subjectsWithScores.filter(s => {
            const score = s[assessmentType];
            return score < passMark;
        }).length;

        // Get strongest subjects
        const scores = subjectsWithScores.map(s => s[assessmentType]);
        const highestScore = Math.max(...scores);
        const strongestSubjects = subjectsWithScores.filter(s => s[assessmentType] === highestScore);
        const strongestNames = strongestSubjects.map(s => s.name).join(', ');

        // Get needs improvement subjects
        // const needsImprovement = subjectsWithScores.filter(s => {
        //     const grade = calculateGrade(s[assessmentType], passMark, studentData.class);
        //     return ['D', 'F'].includes(grade);
        // });

        // Get needs improvement subjects
        const needsImprovement = subjectsWithScores.filter(s => {
            const grade = calculateGrade(s[assessmentType], passMark, studentData.class);
            // For points system: 7,8,9 are weak (Pass and Fail)
            if (grade >= '1' && grade <= '9') {
                return grade === '7' || grade === '8' || grade === '9';
            }
            // For letter grades: D and F
            return ['D', 'F'].includes(grade);
        });
        const improvementNames = needsImprovement.length > 0
            ? needsImprovement.map(s => `${s.name} (${calculateGrade(s[assessmentType], passMark, studentData.class)})`).join(', ')
            : 'None';

        // Teacher remark - EXACT same as PDF
        // let teacherRemark = '';
        // if (avgScore === 'N/A') {
        //     teacherRemark = 'No assessment scores available for evaluation.';
        // } else {
        //     if (numericAvg >= 80) {
        //         teacherRemark = 'Outstanding performance! Excellent understanding of concepts.';
        //     } else if (numericAvg >= 70) {
        //         teacherRemark = 'Good performance. Shows strong understanding with room for growth.';
        //     } else if (numericAvg >= passMark) {
        //         teacherRemark = 'Satisfactory performance. Focus on improving in weaker areas.';
        //     } else {
        //         teacherRemark = 'Additional effort required. Please seek help and dedicate more time to studies.';
        //     }
        // }

        // Teacher remark - EXACT same as PDF
        let teacherRemark = '';
        if (avgScore === 'N/A') {
            teacherRemark = 'No assessment scores available for evaluation.';
        } else {
            // For points system, check if English grade is 9 (Fail)
            if (isPointsSystem) {
                const englishSubject = studentData.subjects.find(s =>
                    s.name.toLowerCase() === 'english' || s.name.toLowerCase() === 'eng'
                );
                if (englishSubject) {
                    const englishGrade = getSubjectGradeForAssessment(englishSubject);
                    if (englishGrade === '9') {
                        teacherRemark = 'Failed due to English grade 9. Please retake English examination.';
                    } else {
                        if (numericAvg >= 80) {
                            teacherRemark = 'Outstanding performance! Excellent understanding of concepts.';
                        } else if (numericAvg >= 70) {
                            teacherRemark = 'Good performance. Shows strong understanding with room for growth.';
                        } else if (numericAvg >= passMark) {
                            teacherRemark = 'Satisfactory performance. Focus on improving in weaker areas.';
                        } else {
                            teacherRemark = 'Additional effort required. Please seek help and dedicate more time to studies.';
                        }
                    }
                } else {
                    if (numericAvg >= 80) {
                        teacherRemark = 'Outstanding performance! Excellent understanding of concepts.';
                    } else if (numericAvg >= 70) {
                        teacherRemark = 'Good performance. Shows strong understanding with room for growth.';
                    } else if (numericAvg >= passMark) {
                        teacherRemark = 'Satisfactory performance. Focus on improving in weaker areas.';
                    } else {
                        teacherRemark = 'Additional effort required. Please seek help and dedicate more time to studies.';
                    }
                }
            } else {
                if (numericAvg >= 80) {
                    teacherRemark = 'Outstanding performance! Excellent understanding of concepts.';
                } else if (numericAvg >= 70) {
                    teacherRemark = 'Good performance. Shows strong understanding with room for growth.';
                } else if (numericAvg >= passMark) {
                    teacherRemark = 'Satisfactory performance. Focus on improving in weaker areas.';
                } else {
                    teacherRemark = 'Additional effort required. Please seek help and dedicate more time to studies.';
                }
            }
        }

        // Function to get grade color
        const getGradeBadgeColor = (grade: string) => {

            if (grade >= '1' && grade <= '9') {
                if (grade === '1') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                if (grade === '2') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                if (grade === '3') return 'bg-blue-100 text-blue-800 border-blue-300';
                if (grade === '4') return 'bg-blue-100 text-blue-800 border-blue-300';
                if (grade === '5') return 'bg-amber-100 text-amber-800 border-amber-300';
                if (grade === '6') return 'bg-amber-100 text-amber-800 border-amber-300';
                if (grade === '7') return 'bg-orange-100 text-orange-800 border-orange-300';
                if (grade === '8') return 'bg-orange-100 text-orange-800 border-orange-300';
                return 'bg-red-100 text-red-800 border-red-300'; // Grade 9
            }
            switch (grade) {
                case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
                case 'C': return 'bg-amber-100 text-amber-800 border-amber-300';
                case 'D': return 'bg-orange-100 text-orange-800 border-orange-300';
                case 'F': return 'bg-red-100 text-red-800 border-red-300';
                case 'AB': return 'bg-slate-100 text-slate-800 border-slate-300';
                default: return 'bg-slate-100 text-slate-800 border-slate-300';
            }
        };

        return (
            <div className="font-['helvetica'] max-w-4xl mx-auto p-8 bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-2xl">
                {/* Header with gradient */}
                <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl -mt-8 -mx-8 mb-6">
                    <h1 className="text-3xl font-bold tracking-wide">{schoolName}</h1>
                    <h2 className="text-xl font-semibold mt-2 opacity-90">{getAssessmentTitle(assessmentType)} Results</h2>
                    <div className="flex justify-center gap-4 mt-3 text-sm">
                        <span className="px-3 py-1 bg-white/20 rounded-full">Year: {studentData.academicYear}</span>
                        <span className="px-3 py-1 bg-white/20 rounded-full">Term: {studentData.term}</span>
                    </div>
                </div>

                {/* STUDENT & ACADEMIC INFORMATION - with colored card */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                    <p className="font-bold text-lg text-indigo-800 mb-3 flex items-center">
                        <span className="w-1 h-6 bg-indigo-600 rounded-full mr-2"></span>
                        STUDENT & ACADEMIC INFORMATION
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-indigo-700">Student Name:</span> {studentData.name || 'N/A'}</div>
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-indigo-700">Exam Number:</span> {studentData.examNumber || 'N/A'}</div>
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-indigo-700">Class:</span> {studentData.class || 'N/A'}</div>
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-indigo-700">Term:</span> {studentData.term || 'N/A'}</div>
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-indigo-700">Academic Year:</span> {studentData.academicYear || 'N/A'}</div>
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-indigo-700">Total Enrollment:</span> {studentData.totalStudents || 'N/A'}</div>
                    </div>
                </div>

                {/* ASSESSMENT SUMMARY - with colored grid */}
                {/* ASSESSMENT SUMMARY - with colored grid */}
                <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
                    <p className="font-bold text-lg text-purple-800 mb-3 flex items-center">
                        <span className="w-1 h-6 bg-purple-600 rounded-full mr-2"></span>
                        ASSESSMENT SUMMARY
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-purple-700">Assessment Type:</span> {getAssessmentTitle(assessmentType)}</div>
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-purple-700">Subjects Assessed:</span> {subjectsWithScores.length}/{studentData.subjects.length}</div>
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-purple-700">Average Score:</span> {avgScore}%</div>
                        <div className="bg-white p-2 rounded shadow-sm"><span className="font-medium text-purple-700">Class Position:</span> {displayRank}</div>

                        {isPointsSystem && (
                            <div className="bg-white p-2 rounded shadow-sm">
                                <span className="font-medium text-purple-700">Total Points (Best 6):</span>
                                <span className="ml-2 font-bold text-purple-800">{calculateBestSixPoints()}</span>
                            </div>
                        )}

                        <div className="bg-white p-2 rounded shadow-sm">
                            <span className="font-medium text-purple-700">Overall Status:</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${assessmentStatus === 'PASSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {assessmentStatus}
                            </span>
                        </div>

                        {!isPointsSystem && (
                            <div className="bg-white p-2 rounded shadow-sm">
                                <span className="font-medium text-purple-700">Overall Grade:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${getGradeBadgeColor(assessmentGrade)}`}>
                                    {assessmentGrade}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RESULTS - with styled table */}
                <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border-l-4 border-emerald-500 shadow-sm">
                    <p className="font-bold text-lg text-emerald-800 mb-3 flex items-center">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full mr-2"></span>
                        RESULTS
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-emerald-200">
                        <table className="w-full text-sm">
                            <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Subject</th>
                                    <th className="px-4 py-3 text-center">Total Marks</th>
                                    <th className="px-4 py-3 text-center">Marks Scored</th>
                                    <th className="px-4 py-3 text-center">Grade</th>
                                    <th className="px-4 py-3 text-center">Remark</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-200">
                                {subjectsWithScores.map((subject, idx) => {
                                    const score = subject[assessmentType];
                                    const isAbsent = assessmentType === 'qa1' ? subject.qa1_absent :
                                        assessmentType === 'qa2' ? subject.qa2_absent :
                                            subject.endOfTerm_absent;
                                    const grade = calculateGrade(score, passMark, studentData.class);
                                    const remark = getGradeRemark(grade);
                                    const status = (grade === 'F' || grade === '9') ? 'Failed' : 'Passed';

                                    return (
                                        <tr key={idx} className="hover:bg-emerald-50/50 transition-colors">
                                            <td className="px-4 py-2 font-medium">{subject.name}</td>
                                            <td className="px-4 py-2 text-center">100</td>
                                            <td className="px-4 py-2 text-center font-semibold">{isAbsent ? 'AB' : score}</td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getGradeBadgeColor(grade)}`}>
                                                    {grade}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${remark === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {remark}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gradient-to-r from-emerald-100 to-teal-100 font-bold">
                                <tr>
                                    <td className="px-4 py-3">GRAND TOTAL</td>
                                    <td className="px-4 py-3 text-center">{subjectsWithScores.length * 100}</td>
                                    <td className="px-4 py-3 text-center text-emerald-700">{totalScored}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getGradeBadgeColor(assessmentGrade)}`}>
                                            {assessmentGrade}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${assessmentStatus === 'PASSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {assessmentStatus}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* PERFORMANCE ANALYSIS - with colored cards */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border-l-4 border-amber-500 shadow-sm">
                        <p className="font-bold text-amber-800 mb-2 flex items-center">
                            <span className="w-1 h-6 bg-amber-600 rounded-full mr-2"></span>
                            STRONGEST SUBJECTS
                        </p>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-lg font-bold text-amber-700">{strongestNames}</p>
                            <p className="text-sm text-slate-600 mt-1">Score: <span className="font-bold text-amber-600">{Math.round(highestScore)}%</span></p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-lg border-l-4 border-rose-500 shadow-sm">
                        <p className="font-bold text-rose-800 mb-2 flex items-center">
                            <span className="w-1 h-6 bg-rose-600 rounded-full mr-2"></span>
                            NEEDS IMPROVEMENT
                        </p>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-sm font-medium text-rose-700">{improvementNames}</p>
                            {needsImprovement.length > 0 && (
                                <p className="text-xs text-slate-500 mt-1">Total flagged: {needsImprovement.length}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Stats Grid */}
                <div className="mt-4 grid grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-lg text-center border border-emerald-200">
                        <p className="text-xs text-emerald-700">Subjects Passed</p>
                        <p className="text-xl font-bold text-emerald-800">{subjectsPassed}/{subjectsWithScores.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg text-center border border-blue-200">
                        <p className="text-xs text-blue-700">A & B Grades</p>
                        <p className="text-xl font-bold text-blue-800">{abGrades}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-lg text-center border border-amber-200">
                        <p className="text-xs text-amber-700">C & D Grades</p>
                        <p className="text-xl font-bold text-amber-800">{cdGrades}</p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-red-50 p-3 rounded-lg text-center border border-rose-200">
                        <p className="text-xs text-rose-700">Below {passMark}%</p>
                        <p className="text-xl font-bold text-rose-800">{belowPass}</p>
                    </div>
                </div>

                {/* TEACHER'S REMARK - with styled card */}
                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                    <p className="font-bold text-lg text-indigo-800 mb-2 flex items-center">
                        <span className="w-1 h-6 bg-indigo-600 rounded-full mr-2"></span>
                        TEACHER'S REMARK
                    </p>
                    <div className="bg-white p-4 rounded-lg italic text-slate-700 border border-indigo-200">
                        "{teacherRemark}"
                    </div>
                </div>

                {/* Footer - with gradient */}
                <div className="mt-8 text-center bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-b-xl -mb-8 -mx-8">
                    <p className="text-lg font-bold tracking-wide">{getAssessmentTitle(assessmentType)} Results Generated</p>
                    <p className="text-sm mt-2 text-slate-300">This assessment report was generated based on the school's active grade calculation configuration.</p>
                    <p className="text-sm text-slate-300">For any questions or clarifications, please contact the school administration.</p>
                    <p className="text-sm mt-3 text-slate-400 border-t border-slate-700 pt-3">
                        Generated on: {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>
        );
    };

    if (showPDFOnly) {
        return renderPDFContent();
    }

    return (
        <div className="space-y-6">
            {/* Download Button Header */}
            {/* Download Button Header - Mobile Responsive */}
            <div className="mb-4">
                <h3 className="text-sm sm:text-xl font-bold text-slate-800 mb-2">
                    {getAssessmentTitle(assessmentType)} Results
                </h3>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Target className="w-3 h-3 text-slate-400" />
                        <p className="text-xs sm:text-sm text-slate-500">
                            Total Marks: <span className="font-semibold text-emerald-600">
                                {totalScored}/{subjectsWithScores.length * 100}
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={handleDownloadAssessmentPDF}
                        disabled={isDownloading}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center gap-1 text-xs text-white transition-colors ${isDownloading
                            ? 'bg-indigo-400 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Wait</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="md:hidden mb-4">
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full flex items-center justify-between bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-200"
                >
                    <div className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-indigo-800">{studentData.name}</span>
                    </div>
                    {showInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
            </div>

            {/* ADD STUDENT & ACADEMIC INFORMATION HERE */}
            {/* <StudentAcademicInfo studentData={studentData} schoolName={schoolName} /> */}

            {(showInfo || window.innerWidth >= 768) && (
                <StudentAcademicInfo studentData={studentData} schoolName={schoolName} />
            )}

            {/* SUMMARY BOXES */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6">
                {(() => {
                    const firstSubject = studentData.subjects[0];
                    const isPointsSystem = firstSubject && getSubjectGradeForAssessment(firstSubject) >= '1' && getSubjectGradeForAssessment(firstSubject) <= '9';

                    // Get the assessment status and grade
                    const numericAvg = parseFloat(calculateAssessmentAverage());
                    const passMark = studentData.gradeConfiguration?.pass_mark || 50;
                    let assessmentStatus = 'N/A';
                    if (!isNaN(numericAvg)) {
                        if (isPointsSystem) {
                            const englishSubject = studentData.subjects.find(s =>
                                s.name.toLowerCase() === 'english' || s.name.toLowerCase() === 'eng'
                            );
                            if (englishSubject) {
                                const englishGrade = getSubjectGradeForAssessment(englishSubject);
                                if (englishGrade === '9') {
                                    assessmentStatus = 'FAILED';
                                } else {
                                    assessmentStatus = numericAvg >= passMark ? 'PASSED' : 'FAILED';
                                }
                            } else {
                                assessmentStatus = numericAvg >= passMark ? 'PASSED' : 'FAILED';
                            }
                        } else {
                            assessmentStatus = numericAvg >= passMark ? 'PASSED' : 'FAILED';
                        }
                    }

                    const assessmentGrade = !isNaN(numericAvg) ? calculateGrade(numericAvg, passMark, studentData.class) : 'N/A';

                    if (isPointsSystem) {
                        // POINTS SYSTEM: Class Position, Overall Status, Final Average, Total Points
                        return (
                            <>
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-2 sm:p-4 text-white">
                                    <p className="text-[10px] sm:text-sm text-emerald-100">Class Position</p>
                                    <p className="text-base sm:text-3xl font-bold">{studentData.classRank}</p>
                                </div>
                                <div className={`${assessmentStatus === 'FAILED' ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'} rounded-xl p-2 sm:p-4 text-white`}>
                                    <p className="text-[10px] sm:text-sm text-white/90">Overall Status</p>
                                    <p className="text-base sm:text-3xl font-bold">{assessmentStatus}</p>
                                </div>
                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-2 sm:p-4 text-white">
                                    <p className="text-[10px] sm:text-sm text-indigo-100">Final Average</p>
                                    <p className="text-base sm:text-3xl font-bold">{calculateBestSixAverage()}%</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-2 sm:p-4 text-white">
                                    <p className="text-[10px] sm:text-sm text-amber-100">Total Points</p>
                                    <p className="text-base sm:text-3xl font-bold">{calculateBestSixPoints()}</p>
                                </div>
                            </>
                        );
                    } else {
                        // LETTER GRADES: Final Average, Class Position, Overall Status, Overall Grade
                        return (
                            <>
                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-2 sm:p-4 text-white">
                                    <p className="text-[10px] sm:text-sm text-indigo-100">Final Average</p>
                                    <p className="text-base sm:text-3xl font-bold">{calculateAssessmentAverage()}%</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-2 sm:p-4 text-white">
                                    <p className="text-[10px] sm:text-sm text-emerald-100">Class Position</p>
                                    <p className="text-base sm:text-3xl font-bold">{studentData.classRank}</p>
                                </div>
                                <div className={`${assessmentStatus === 'FAILED' ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'} rounded-xl p-2 sm:p-4 text-white`}>
                                    <p className="text-[10px] sm:text-sm text-white/90">Overall Status</p>
                                    <p className="text-base sm:text-3xl font-bold">{assessmentStatus}</p>
                                </div>
                                <div className={`${assessmentGrade === 'F' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                    assessmentGrade === 'A' || assessmentGrade === 'B' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                                        assessmentGrade === 'C' || assessmentGrade === 'D' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                                            'bg-gradient-to-br from-red-500 to-red-600'
                                    } rounded-xl p-2 sm:p-4 text-white`}>
                                    <p className="text-[10px] sm:text-sm text-white/90">Overall Grade</p>
                                    <p className="text-base sm:text-3xl font-bold">{assessmentGrade}</p>
                                    <p className="text-[8px] sm:text-xs opacity-90 mt-0.5 sm:mt-1">
                                        {assessmentGrade === 'AB' ? 'Absent' :
                                            assessmentGrade === 'A' ? 'Excellent' :
                                                assessmentGrade === 'B' ? 'Good' :
                                                    assessmentGrade === 'C' ? 'Satisfactory' :
                                                        assessmentGrade === 'D' ? 'Passing' : 'Needs Improvement'}
                                    </p>
                                </div>
                            </>
                        );
                    }
                })()}
            </div>

            {/* Existing assessment results display */}
            <div className="grid gap-4">


                {studentData.subjects.map((subject, index) => {
                    const score = subject[assessmentType];
                    const isAbsent = assessmentType === 'qa1' ? subject.qa1_absent :
                        assessmentType === 'qa2' ? subject.qa2_absent :
                            subject.endOfTerm_absent;

                    // const hasScore = hasValidScore(score, isAbsent);
                    const hasScore = hasValidScore(subject, assessmentType);

                    // const gradeForThisTab = (() => {
                    //     if (isAbsent) return 'AB';
                    //     if (!hasScore) return 'N/A';
                    //     if (score >= 80) return 'A';
                    //     if (score >= 70) return 'B';
                    //     if (score >= 60) return 'C';
                    //     if (score >= passMark) return 'D';
                    //     return 'F';
                    // })();

                    const gradeForThisTab = (() => {
                        if (isAbsent) return 'AB';
                        if (!hasScore) return 'N/A';
                        return calculateGrade(score, passMark, studentData.class);
                    })();
                    const isFailed = gradeForThisTab === 'F' || gradeForThisTab === '9';

                    return (
                        <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-200 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1">
                                    <h5 className="font-semibold text-slate-800">{subject.name}</h5>
                                    {hasScore ? (
                                        <>
                                            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                {!isAbsent && (
                                                    <div
                                                        className={`h-full ${score >= 80 ? 'bg-emerald-500' :
                                                            score >= 60 ? 'bg-blue-500' :
                                                                score >= passMark ? 'bg-amber-500' :
                                                                    'bg-red-500'
                                                            } transition-all duration-500`}
                                                        style={{ width: `${Math.min(score, 100)}%` }}
                                                    ></div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-2 text-sm text-amber-600 italic">
                                            {isAbsent ? 'Student was absent' : `No test conducted for ${getAssessmentTitle(assessmentType)}`}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        {!isAbsent && hasScore ? (
                                            <>
                                                <p className="text-2xl font-bold text-slate-800">{score}%</p>
                                                <p className="text-xs text-slate-500">Score</p>
                                            </>
                                        ) : isAbsent ? (
                                            <>
                                                <p className="text-2xl font-bold text-slate-800">AB</p>
                                                <p className="text-xs text-slate-500">Absent</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold text-slate-400">N/A</p>
                                                <p className="text-xs text-slate-400">No Score</p>
                                            </>
                                        )}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isAbsent ? 'text-slate-600 bg-slate-100' : getGradeColor(gradeForThisTab)}`}>
                                        {isAbsent ? 'AB' : gradeForThisTab}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasAssessmentScores(assessmentType) && (
                <div className="mt-8 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        Teacher's Remark
                    </h5>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-lg text-slate-700 italic">
                            "{(() => {
                                const avg = parseFloat(calculateAssessmentAverage());
                                const pass = studentData.gradeConfiguration?.pass_mark || 50;
                                const firstSubject = studentData.subjects[0];
                                const isPointsSystem = firstSubject && getSubjectGradeForAssessment(firstSubject) >= '1' && getSubjectGradeForAssessment(firstSubject) <= '9';

                                if (isNaN(avg)) return 'No assessment scores available for evaluation.';

                                // For points system, check if English grade is 9 (Fail)
                                if (isPointsSystem) {
                                    const englishSubject = studentData.subjects.find(s =>
                                        s.name.toLowerCase() === 'english' || s.name.toLowerCase() === 'eng'
                                    );
                                    if (englishSubject) {
                                        const englishGrade = getSubjectGradeForAssessment(englishSubject);
                                        if (englishGrade === '9') {
                                            return 'Failed due to English grade 9. Please retake English examination.';
                                        }
                                    }
                                }

                                if (avg >= 80) return 'Outstanding performance! Excellent understanding of concepts.';
                                if (avg >= 70) return 'Good performance. Shows strong understanding with room for growth.';
                                if (avg >= pass) return 'Satisfactory performance. Focus on improving in weaker areas.';
                                return 'Additional effort required. Please seek help and dedicate more time to studies.';
                            })()}"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QAAssessment;

