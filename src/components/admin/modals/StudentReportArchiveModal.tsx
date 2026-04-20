import React, { useState, useRef } from 'react';
import { X, Download, Mail, MessageSquare, Eye, ChevronLeft, ChevronRight, Share2, Filter } from 'lucide-react';
import ReportCard from '@/components/app/searchResults/ReportCard';
import QAAssessment from '@/components/app/searchResults/QAAssessment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentReportArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    archives: any[];
    schoolName?: string;
    onSendEmail: (archiveId: string) => Promise<void>;
    onSendWhatsApp: (archiveId: string) => Promise<void>;
    onSendSMS?: (archiveId: string) => Promise<void>;
}

const StudentReportArchiveModal: React.FC<StudentReportArchiveModalProps> = ({
    isOpen,
    onClose,
    archives,
    schoolName = 'School Name',
    onSendEmail,
    onSendWhatsApp,
    onSendSMS
}) => {
    const [selectedArchive, setSelectedArchive] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [selectedReportType, setSelectedReportType] = useState<'qa1' | 'qa2' | 'endOfTerm' | 'overall'>('overall');
    const reportCardRef = useRef<HTMLDivElement>(null);
    const qaAssessmentRef = useRef<HTMLDivElement>(null);
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
    const [selectedTermFilter, setSelectedTermFilter] = useState<string>('all');
    const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
    const [searchStudent, setSearchStudent] = useState<string>('');
    const [expandedClass, setExpandedClass] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSendEmail = async (archiveId: string) => {
        setSendingId(archiveId);
        try {
            await onSendEmail(archiveId);
        } finally {
            setSendingId(null);
        }
    };

    const handleSendWhatsApp = async (archiveId: string) => {
        setSendingId(archiveId);
        try {
            await onSendWhatsApp(archiveId);
        } finally {
            setSendingId(null);
        }
    };

    const handleSendSMS = async (archiveId: string) => {
        setSendingId(archiveId);
        try {
            if (onSendSMS) {
                await onSendSMS(archiveId);
            } else {
                const archive = archives.find(a => a.id === archiveId);
                if (archive?.whatsappNumber) {
                    window.location.href = `sms:${archive.whatsappNumber}`;
                }
            }
        } finally {
            setSendingId(null);
        }
    };

    const handleDownloadPDF = (archive: any, type: string) => {
        setDownloadingId(archive.id);
        try {
            generatePDF(archive, type);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloadingId(null);
        }
    };

    const calculateSubjectAverage = (subject: any, type: string, studentData: any): number | string => {
        if (type === 'overall') {
            return subject.finalScore ||
                ((subject.qa1 || 0) + (subject.qa2 || 0) + (subject.endOfTerm || 0)) / 3;
        } else {
            const isAbsent = type === 'qa1' ? subject.qa1_absent :
                type === 'qa2' ? subject.qa2_absent :
                    subject.endOfTerm_absent;
            if (isAbsent) return 'AB';
            return subject[type] || 0;
        }
    };

    // const getGrade = (score: number): string => {
    //     if (score >= 80) return 'A';
    //     if (score >= 70) return 'B';
    //     if (score >= 60) return 'C';
    //     if (score >= 50) return 'D';
    //     return 'F';
    // };
    const hasValidScore = (subject: any, type: string): boolean => {
        // For overall report, check if student has ANY valid score (qa1, qa2, or endOfTerm)
        if (type === 'overall') {
            const hasQa1 = subject.qa1 !== null && subject.qa1 !== undefined && typeof subject.qa1 === 'number';
            const hasQa2 = subject.qa2 !== null && subject.qa2 !== undefined && typeof subject.qa2 === 'number';
            const hasEndOfTerm = subject.endOfTerm !== null && subject.endOfTerm !== undefined && typeof subject.endOfTerm === 'number';
            return hasQa1 || hasQa2 || hasEndOfTerm;
        }

        // For QA reports
        const score = subject[type];
        const isAbsent = type === 'qa1' ? subject.qa1_absent :
            type === 'qa2' ? subject.qa2_absent :
                subject.endOfTerm_absent;

        if (isAbsent) return true;
        if (score === null || score === undefined) return false;
        return typeof score === 'number' && !isNaN(score);
    };
    const getGrade = (score: number, passMark: number = 50, className?: string): string => {
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
            if (score >= passMark) return '8';
            return '9';
        }

        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= passMark) return 'D';
        return 'F';
    };

    const generatePDF = (archive: any, type: string) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;
        const studentData = archive.reportCardData;

        // ===== HEADER with gradient effect (simulated with colors) =====
        doc.setFillColor(79, 70, 229); // Indigo-600
        doc.rect(0, 0, pageWidth, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(schoolName, pageWidth / 2, 18, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        const title = type === 'overall' ? 'Complete Report Card' :
            type === 'qa1' ? 'Quarterly Assessment 1 Results' :
                type === 'qa2' ? 'Quarterly Assessment 2 Results' :
                    'End of Term Examination Results';
        doc.text(title, pageWidth / 2, 26, { align: 'center' });

        y = 40;

        // ===== STUDENT & ACADEMIC INFORMATION with colored card =====
        doc.setFillColor(238, 242, 255); // Indigo-50
        doc.rect(10, y - 4, pageWidth - 20, 38, 'F');

        doc.setDrawColor(99, 102, 241); // Indigo-500
        doc.setLineWidth(0.5);
        doc.line(10, y - 4, 10, y + 34);

        doc.setTextColor(67, 56, 202); // Indigo-800
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('STUDENT & ACADEMIC INFORMATION', 14, y);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Student info in grid
        doc.text(`Student Name: ${studentData?.name || archive.studentName}`, 14, y + 8);
        doc.text(`Exam Number: ${studentData?.examNumber || archive.examNumber}`, 14, y + 14);
        doc.text(`Class: ${studentData?.class || 'N/A'}`, 14, y + 20);
        doc.text(`Term: ${studentData?.term || archive.term}`, 120, y + 8);
        doc.text(`Academic Year: ${studentData?.academicYear || 'N/A'}`, 120, y + 14);
        doc.text(`Total Enrollment: ${studentData?.totalStudents || 'N/A'}`, 120, y + 20);

        y += 28;

        // ===== SUMMARY with colored card =====
        doc.setFillColor(245, 243, 255); // Purple-50
        doc.rect(10, y - 4, pageWidth - 20, 36, 'F');

        doc.setDrawColor(139, 92, 246); // Purple-500
        doc.setLineWidth(0.5);
        doc.line(10, y - 4, 10, y + 32);

        doc.setTextColor(107, 33, 168); // Purple-800
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SUMMARY', 14, y);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        if (type === 'overall') {
            doc.text(`Class Position: ${studentData?.classRank || 'N/A'}`, 14, y + 8);

            const overallStatus = studentData ? (studentData.classRank > 0 ? 'PASSED' : 'N/A') : 'N/A';
            doc.text(`Overall Status: `, 120, y + 8);
            if (overallStatus === 'PASSED') {
                doc.setTextColor(16, 185, 129); // Green
                doc.text(overallStatus, 150, y + 8);
                doc.setTextColor(0, 0, 0);
            } else {
                doc.text(overallStatus, 150, y + 8);
            }

            const finalAvg = studentData?.assessmentStats?.overall?.termAverage?.toFixed(1) || 'N/A';
            doc.text(`Final Average: ${finalAvg}%`, 14, y + 14);

            let overallGrade = 'N/A';
            if (studentData?.assessmentStats?.overall?.termAverage) {
                const avg = studentData.assessmentStats.overall.termAverage;
                overallGrade = avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';
            }

            doc.text(`Overall Grade: `, 120, y + 14);
            // Color code the grade
            if (overallGrade === 'A') doc.setTextColor(5, 150, 105); // Emerald
            else if (overallGrade === 'B') doc.setTextColor(37, 99, 235); // Blue
            else if (overallGrade === 'C') doc.setTextColor(217, 119, 6); // Amber
            else if (overallGrade === 'D') doc.setTextColor(234, 88, 12); // Orange
            else if (overallGrade === 'F') doc.setTextColor(220, 38, 38); // Red
            else doc.setTextColor(0, 0, 0);

            doc.text(overallGrade, 150, y + 14);
            doc.setTextColor(0, 0, 0);
        } else {
            const subjectsWithScores = studentData?.subjects?.filter((s: any) =>
                s[type] !== null ||
                (type === 'qa1' ? s.qa1_absent : type === 'qa2' ? s.qa2_absent : s.endOfTerm_absent)
            ) || [];

            doc.text(`Assessment Type: ${title}`, 14, y + 8);
            doc.text(`Subjects Assessed: ${subjectsWithScores.length}`, 120, y + 8);


            const scores = subjectsWithScores.map((s: any) => s[type]).filter((s: any) => typeof s === 'number');
            const avgScore = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1) : 'N/A';

            doc.text(`Average Score: ${avgScore}%`, 14, y + 14);
            doc.text(`Class Position: ${studentData?.assessmentStats?.[type]?.classRank || 'N/A'}`, 120, y + 14);

            const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
            const status = avgScore !== 'N/A' ? (parseFloat(avgScore) >= passMark ? 'PASSED' : 'FAILED') : 'N/A';
            const grade = avgScore !== 'N/A' ?
                (parseFloat(avgScore) >= 80 ? 'A' :
                    parseFloat(avgScore) >= 70 ? 'B' :
                        parseFloat(avgScore) >= 60 ? 'C' :
                            parseFloat(avgScore) >= 50 ? 'D' : 'F') : 'N/A';

            doc.text(`Overall Grade: `, 14, y + 20);
            // Color code the grade
            if (grade === 'A') doc.setTextColor(5, 150, 105);
            else if (grade === 'B') doc.setTextColor(37, 99, 235);
            else if (grade === 'C') doc.setTextColor(217, 119, 6);
            else if (grade === 'D') doc.setTextColor(234, 88, 12);
            else if (grade === 'F') doc.setTextColor(220, 38, 38);
            doc.text(grade, 40, y + 20);

            doc.setTextColor(0, 0, 0);
            doc.text(`Overall Status: `, 120, y + 20);

            if (status === 'PASSED') {
                doc.setTextColor(16, 185, 129);
                doc.text(status, 160, y + 20);
                doc.setTextColor(0, 0, 0);
            } else if (status === 'FAILED') {
                doc.setTextColor(220, 38, 38);
                doc.text(status, 160, y + 20);
                doc.setTextColor(0, 0, 0);
            } else {
                doc.text(status, 160, y + 20);
            }
        }

        y += 28;

        // ===== RESULTS with colored table =====
        doc.setFillColor(236, 253, 245); // Emerald-50
        doc.rect(10, y - 4, pageWidth - 20, 8, 'F');

        doc.setDrawColor(16, 185, 129); // Emerald-500
        doc.setLineWidth(0.5);
        doc.line(10, y - 4, 10, y + 4);

        doc.setTextColor(6, 95, 70); // Emerald-800
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RESULTS', 14, y);

        y += 4;

        const tableBody = studentData?.subjects
            ?.filter((sub: any) => sub.qa1 !== null || sub.qa2 !== null || sub.endOfTerm !== null ||
                sub.qa1_absent || sub.qa2_absent || sub.endOfTerm_absent)
            .map((sub: any, index: number) => {
                if (type === 'overall') {
                    const avg = sub.finalScore ||
                        ((sub.qa1 || 0) + (sub.qa2 || 0) + (sub.endOfTerm || 0)) / 3;
                    const avgDisplay = avg.toFixed(1);
                    // const grade = avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';
                    const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
                    const grade = getGrade(avg, passMark, studentData?.class);
                    const remark = grade === 'F' ? 'Failed' : 'Passed';
                    const status = remark;
                    return [sub.name, '100', avgDisplay, grade, remark, status];
                } else {
                    const score = sub[type];
                    const isAbsent = type === 'qa1' ? sub.qa1_absent :
                        type === 'qa2' ? sub.qa2_absent :
                            sub.endOfTerm_absent;
                    if (isAbsent) return [sub.name, '100', 'AB', 'AB', 'Absent', 'Absent'];
                    // const grade = score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
                    const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
                    const grade = getGrade(score, passMark, studentData?.class);
                    const remark = grade === 'F' ? 'Failed' : 'Passed';
                    const status = remark;
                    return [sub.name, '100', score.toFixed(1), grade, remark, remark];
                }
            }) || [];

        // Calculate totals
        const totalPossible = (studentData?.subjects?.length || 0) * 100;
        let totalScored = 0;

        if (type === 'overall') {
            totalScored = studentData?.subjects?.reduce((sum: number, sub: any) => {
                const avg = sub.finalScore || ((sub.qa1 || 0) + (sub.qa2 || 0) + (sub.endOfTerm || 0)) / 3;
                return sum + avg;
            }, 0) || 0;
        } else {
            totalScored = studentData?.subjects?.reduce((sum: number, sub: any) => {
                if (type === 'qa1' && sub.qa1_absent) return sum;
                if (type === 'qa2' && sub.qa2_absent) return sum;
                if (type === 'endOfTerm' && sub.endOfTerm_absent) return sum;
                return sum + (sub[type] || 0);
            }, 0) || 0;
        }

        let overallGrade = 'N/A';
        if (type === 'overall') {
            if (studentData?.assessmentStats?.overall?.termAverage) {
                const avg = studentData.assessmentStats.overall.termAverage;
                // overallGrade = avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';
                const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
                overallGrade = getGrade(avg, passMark, studentData?.class);
            }
        } else {
            const scores = studentData?.subjects
                ?.filter((s: any) => !(type === 'qa1' ? s.qa1_absent : type === 'qa2' ? s.qa2_absent : s.endOfTerm_absent))
                .map((s: any) => s[type])
                .filter((s: any) => typeof s === 'number') || [];
            const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
            overallGrade = avgScore >= 80 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 60 ? 'C' : avgScore >= 50 ? 'D' : 'F';
        }

        const overallRemark = overallGrade === 'F' ? 'Failed' : 'Passed';
        const overallStatus = overallRemark;

        tableBody.push(['GRAND TOTAL', String(totalPossible), totalScored.toFixed(1), overallGrade, overallRemark, overallStatus]);

        autoTable(doc, {
            startY: y,
            head: [['Subject', 'Total Marks', 'Marks Scored', 'Grade', 'Remark', 'Status']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: [16, 185, 129], // Emerald-600
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [240, 253, 244] }, // Emerald-50
            didParseCell: (data) => {
                if (data.row.index === tableBody.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [209, 250, 229]; // Emerald-100
                }
                // Color code grades in table
                if (data.column.index === 3) { // Grade column
                    const grade = data.cell.raw as string;
                    if (grade === 'A') data.cell.styles.textColor = [5, 150, 105];
                    else if (grade === 'B') data.cell.styles.textColor = [37, 99, 235];
                    else if (grade === 'C') data.cell.styles.textColor = [217, 119, 6];
                    else if (grade === 'D') data.cell.styles.textColor = [234, 88, 12];
                    else if (grade === 'F') data.cell.styles.textColor = [220, 38, 38];
                    else if (grade === 'AB') data.cell.styles.textColor = [100, 116, 139];
                }
                // Color code remarks
                if (data.column.index === 4) { // Remark column
                    const remark = data.cell.raw as string;
                    if (remark === 'Passed') data.cell.styles.textColor = [5, 150, 105];
                    else if (remark === 'Failed') data.cell.styles.textColor = [220, 38, 38];
                    else if (remark === 'Absent') data.cell.styles.textColor = [100, 116, 139];
                }
            },
        });

        y = (doc as any).lastAutoTable.finalY + 10;

        // ===== PERFORMANCE ANALYSIS with colored cards =====
        // Strongest Subjects Card
        doc.setFillColor(255, 237, 213); // Orange-50
        doc.rect(10, y - 2, (pageWidth - 25) / 2, 30, 'F');
        doc.setDrawColor(245, 158, 11); // Amber-500
        doc.setLineWidth(0.5);
        doc.line(10, y - 2, 10, y + 28);

        doc.setTextColor(180, 83, 9); // Amber-800
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('STRONGEST SUBJECTS', 14, y + 4);

        // Calculate strongest subjects
        const subjectsWithScores = studentData?.subjects
            ?.filter((s: any) => {
                const avg = calculateSubjectAverage(s, type, studentData);
                return avg !== 'AB';
            })
            .map((s: any) => ({
                name: s.name,
                score: type === 'overall' ?
                    (s.finalScore || ((s.qa1 || 0) + (s.qa2 || 0) + (s.endOfTerm || 0)) / 3) :
                    s[type]
            }))
            .filter((s: any) => typeof s.score === 'number') || [];

        const highestScore = subjectsWithScores.length > 0 ?
            Math.max(...subjectsWithScores.map((s: any) => s.score)) : 0;
        const strongestSubjects = subjectsWithScores.filter((s: any) => s.score === highestScore);
        const strongestNames = strongestSubjects.map((s: any) => s.name).join(', ');

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(strongestNames || 'N/A', 14, y + 12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 83, 9);
        doc.text(`Score: ${Math.round(highestScore)}%`, 14, y + 20);

        // Needs Improvement Card
        doc.setFillColor(255, 241, 242); // Rose-50
        doc.rect(pageWidth / 2 + 5, y - 2, (pageWidth - 25) / 2, 30, 'F');
        doc.setDrawColor(244, 63, 94); // Rose-500
        doc.setLineWidth(0.5);
        doc.line(pageWidth / 2 + 5, y - 2, pageWidth / 2 + 5, y + 28);

        doc.setTextColor(190, 18, 60); // Rose-800
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('NEEDS IMPROVEMENT', pageWidth / 2 + 9, y + 4);

        const weakSubjects = studentData?.subjects
            ?.filter((s: any) => {
                const score = type === 'overall' ?
                    (s.finalScore || ((s.qa1 || 0) + (s.qa2 || 0) + (s.endOfTerm || 0)) / 3) :
                    s[type];

                // For overall report, ONLY include subjects that have a valid score (not 0 or null)
                if (type === 'overall') {
                    // Check if the student actually has a valid score for this subject
                    const hasValidScore = s.finalScore !== null && s.finalScore !== undefined && s.finalScore !== 0;
                    if (!hasValidScore) return false;
                }

                const isAbsent = type !== 'overall' && (
                    (type === 'qa1' && s.qa1_absent) ||
                    (type === 'qa2' && s.qa2_absent) ||
                    (type === 'endOfTerm' && s.endOfTerm_absent)
                );
                if (isAbsent) return false;

                if (typeof score !== 'number') return false;
                const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
                const grade = getGrade(score, passMark, studentData?.class);

                // For points system (Form 3/4)
                if (grade >= '1' && grade <= '9') {
                    return grade === '7' || grade === '8' || grade === '9';
                }
                return ['D', 'F'].includes(grade);
            }) || [];

        const improvementNames = weakSubjects.length > 0
            ? weakSubjects.map((s: any) => {
                const score = type === 'overall' ?
                    (s.finalScore || ((s.qa1 || 0) + (s.qa2 || 0) + (s.endOfTerm || 0)) / 3) :
                    s[type];
                // const grade = getGrade(score, studentData?.class);
                const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
                const grade = getGrade(score, passMark, studentData?.class);
                return `${s.name} (${grade})`;
            }).join(', ')
            : 'None';

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const improvementLines = doc.splitTextToSize(improvementNames, (pageWidth - 50) / 2);
        doc.text(improvementLines, pageWidth / 2 + 9, y + 12);

        if (weakSubjects.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(`Total flagged: ${weakSubjects.length}`, pageWidth / 2 + 9, y + 12 + (improvementLines.length * 4) + 2);
        }

        y += 38;

        // ===== Performance Stats Grid =====
        // const subjectsPassed = studentData?.subjects
        //     ?.filter((s: any) => {
        //         const isAbsent = type !== 'overall' && (
        //             (type === 'qa1' && s.qa1_absent) ||
        //             (type === 'qa2' && s.qa2_absent) ||
        //             (type === 'endOfTerm' && s.endOfTerm_absent)
        //         );
        //         if (isAbsent) return false;

        //         const score = type === 'overall' ?
        //             (s.finalScore || ((s.qa1 || 0) + (s.qa2 || 0) + (s.endOfTerm || 0)) / 3) :
        //             s[type];
        //         if (typeof score !== 'number') return false;

        //         // const grade = getGrade(score, studentData?.class);
        //         const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
        //         const grade = getGrade(score, passMark, studentData?.class);
        //         return grade !== 'F';
        //     }).length || 0;



        // ===== Performance Stats Grid =====
        // Define subjects with valid scores for the current assessment type
        const subjectsWithValidScores = studentData?.subjects?.filter((s: any) =>
            hasValidScore(s, type)
        ) || [];

        const subjectsPassed = subjectsWithValidScores
            ?.filter((s: any) => {
                const score = type === 'overall' ?
                    (s.finalScore || ((s.qa1 || 0) + (s.qa2 || 0) + (s.endOfTerm || 0)) / 3) :
                    s[type];
                if (typeof score !== 'number') return false;
                const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
                const grade = getGrade(score, passMark, studentData?.class);
                return grade !== 'F' && grade !== '9';
            }).length || 0;

        const abGrades = studentData?.subjects
            ?.filter((s: any) => {
                const isAbsent = type !== 'overall' && (
                    (type === 'qa1' && s.qa1_absent) ||
                    (type === 'qa2' && s.qa2_absent) ||
                    (type === 'endOfTerm' && s.endOfTerm_absent)
                );
                if (isAbsent) return false;

                const score = type === 'overall' ?
                    (s.finalScore || ((s.qa1 || 0) + (s.qa2 || 0) + (s.endOfTerm || 0)) / 3) :
                    s[type];
                if (typeof score !== 'number') return false;

                // const grade = getGrade(score, studentData?.class);
                const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
                const grade = getGrade(score, passMark, studentData?.class);
                return grade === 'A' || grade === 'B';
            }).length || 0;

        const cdGrades = studentData?.subjects
            ?.filter((s: any) => {
                const isAbsent = type !== 'overall' && (
                    (type === 'qa1' && s.qa1_absent) ||
                    (type === 'qa2' && s.qa2_absent) ||
                    (type === 'endOfTerm' && s.endOfTerm_absent)
                );
                if (isAbsent) return false;

                const score = type === 'overall' ?
                    (s.finalScore || ((s.qa1 || 0) + (s.qa2 || 0) + (s.endOfTerm || 0)) / 3) :
                    s[type];
                if (typeof score !== 'number') return false;

                // const grade = getGrade(score, studentData?.class);
                const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
                const grade = getGrade(score, passMark, studentData?.class);
                return grade === 'C' || grade === 'D';
            }).length || 0;


        const passMark = studentData?.gradeConfiguration?.pass_mark || 50;
        const belowPass = studentData?.subjects
            ?.filter((s: any) => {
                // For overall report, ONLY include subjects that have a valid final score
                if (type === 'overall') {
                    const hasValidScore = s.finalScore !== null && s.finalScore !== undefined && s.finalScore !== 0;
                    if (!hasValidScore) return false;

                    const score = s.finalScore || ((s.qa1 || 0) + (s.qa2 || 0) + (s.endOfTerm || 0)) / 3;
                    return typeof score === 'number' && score < passMark;
                }

                // For QA reports
                const isAbsent = (type === 'qa1' && s.qa1_absent) ||
                    (type === 'qa2' && s.qa2_absent) ||
                    (type === 'endOfTerm' && s.endOfTerm_absent);
                if (isAbsent) return false;

                const score = s[type];
                return typeof score === 'number' && score < passMark;
            }).length || 0;

        // Stat 1: Subjects Passed
        doc.setFillColor(236, 253, 245);
        doc.rect(10, y - 2, (pageWidth - 30) / 4, 20, 'F');
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.3);
        doc.rect(10, y - 2, (pageWidth - 30) / 4, 20, 'S');

        doc.setFontSize(8);
        doc.setTextColor(4, 120, 87);
        doc.text('Subjects Passed', 10 + ((pageWidth - 30) / 8), y + 2, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        // doc.text(`${subjectsPassed}/${subjectsWithScores.length}`, 10 + ((pageWidth - 30) / 8), y + 12, { align: 'center' });
        doc.text(`${subjectsPassed}/${subjectsWithValidScores.length}`, 10 + ((pageWidth - 30) / 8), y + 12, { align: 'center' });
        // Stat 2: A & B Grades
        doc.setFillColor(239, 246, 255);
        doc.rect(10 + ((pageWidth - 30) / 4) + 2, y - 2, (pageWidth - 30) / 4, 20, 'F');
        doc.setDrawColor(37, 99, 235);
        doc.rect(10 + ((pageWidth - 30) / 4) + 2, y - 2, (pageWidth - 30) / 4, 20, 'S');

        doc.setTextColor(30, 64, 175);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('A & B Grades', 10 + ((pageWidth - 30) / 4) + 2 + ((pageWidth - 30) / 8), y + 2, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(abGrades.toString(), 10 + ((pageWidth - 30) / 4) + 2 + ((pageWidth - 30) / 8), y + 12, { align: 'center' });

        // Stat 3: C & D Grades
        doc.setFillColor(254, 243, 199);
        doc.rect(10 + 2 * ((pageWidth - 30) / 4) + 4, y - 2, (pageWidth - 30) / 4, 20, 'F');
        doc.setDrawColor(217, 119, 6);
        doc.rect(10 + 2 * ((pageWidth - 30) / 4) + 4, y - 2, (pageWidth - 30) / 4, 20, 'S');

        doc.setTextColor(146, 64, 14);
        doc.text('C & D Grades', 10 + 2 * ((pageWidth - 30) / 4) + 4 + ((pageWidth - 30) / 8), y + 2, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(cdGrades.toString(), 10 + 2 * ((pageWidth - 30) / 4) + 4 + ((pageWidth - 30) / 8), y + 12, { align: 'center' });

        // Stat 4: Below Pass Mark
        doc.setFillColor(255, 241, 242);
        doc.rect(10 + 3 * ((pageWidth - 30) / 4) + 6, y - 2, (pageWidth - 30) / 4, 20, 'F');
        doc.setDrawColor(244, 63, 94);
        doc.rect(10 + 3 * ((pageWidth - 30) / 4) + 6, y - 2, (pageWidth - 30) / 4, 20, 'S');

        doc.setTextColor(190, 18, 60);
        doc.text(`Below ${passMark}%`, 10 + 3 * ((pageWidth - 30) / 4) + 6 + ((pageWidth - 30) / 8), y + 2, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(belowPass.toString(), 10 + 3 * ((pageWidth - 30) / 4) + 6 + ((pageWidth - 30) / 8), y + 12, { align: 'center' });

        y += 25;

        // ===== TEACHER'S REMARK with colored card =====
        doc.setFillColor(238, 242, 255); // Indigo-50
        doc.rect(10, y - 2, pageWidth - 20, 24, 'F');
        doc.setDrawColor(79, 70, 229); // Indigo-600
        doc.setLineWidth(0.5);
        doc.line(10, y - 2, 10, y + 22);

        doc.setTextColor(67, 56, 202); // Indigo-800
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("TEACHER'S REMARK", 14, y + 4);

        let teacherRemark = '';
        const avgScore = type === 'overall' ?
            parseFloat(studentData?.assessmentStats?.overall?.termAverage || '0') :
            (() => {
                const scores = studentData?.subjects
                    ?.filter((s: any) => !(type === 'qa1' ? s.qa1_absent : type === 'qa2' ? s.qa2_absent : s.endOfTerm_absent))
                    .map((s: any) => s[type])
                    .filter((s: any) => typeof s === 'number') || [];
                return scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
            })();

        if (avgScore >= 80) teacherRemark = 'An outstanding performance! Keep maintaining this high standard.';
        else if (avgScore >= 70) teacherRemark = 'A very good result. With a little more push, you can reach excellence.';
        else if (avgScore >= 60) teacherRemark = 'A satisfactory performance, but there is room for improvement.';
        else if (avgScore >= 50) teacherRemark = 'You have passed, but more effort is needed to improve grades.';
        else teacherRemark = 'Please focus more on your studies and seek help in weak subjects.';

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const remarkLines = doc.splitTextToSize(`"${teacherRemark}"`, pageWidth - 40);
        doc.text(remarkLines, 14, y + 12);

        y += remarkLines.length * 5 + 12;

        // ===== ATTENDANCE with colored card =====
        // if (studentData?.attendance) {
        //     doc.setFillColor(254, 243, 199); // Amber-50
        //     doc.rect(10, y - 2, pageWidth - 20, 36, 'F');
        //     doc.setDrawColor(245, 158, 11); // Amber-500
        //     doc.setLineWidth(0.5);
        //     doc.line(10, y - 2, 10, y + 34);

        //     doc.setTextColor(180, 83, 9); // Amber-800
        //     doc.setFontSize(12);
        //     doc.setFont('helvetica', 'bold');
        //     doc.text('ATTENDANCE', 14, y + 4);

        //     doc.setTextColor(0, 0, 0);
        //     doc.setFontSize(10);
        //     doc.setFont('helvetica', 'normal');

        //     const totalDays = studentData.attendance.present + studentData.attendance.absent;
        //     const attendanceRate = totalDays > 0 ? Math.round((studentData.attendance.present / totalDays) * 100) : 0;

        //     doc.text(`Total School Days: ${totalDays}`, 14, y + 12);
        //     doc.text(`Attendance Rate: ${attendanceRate}%`, 120, y + 12);
        //     doc.text(`Days Present: ${studentData.attendance.present}`, 14, y + 18);
        //     doc.text(`Days Absent: ${studentData.attendance.absent}`, 120, y + 18);
        //     doc.text(`Days Late: ${studentData.attendance.late}`, 14, y + 24);

        //     let attendanceComment = '';
        //     if (attendanceRate >= 95) attendanceComment = '✓ Excellent attendance! Keep it up.';
        //     else if (attendanceRate >= 80) attendanceComment = '✓ Good attendance record.';
        //     else attendanceComment = '⚠ Needs improvement in attendance.';

        //     doc.setFontSize(9);
        //     if (attendanceRate >= 95) doc.setTextColor(5, 150, 105);
        //     else if (attendanceRate >= 80) doc.setTextColor(37, 99, 235);
        //     else doc.setTextColor(245, 158, 11);

        //     doc.text(attendanceComment, 14, y + 30);

        //     y += 40;
        // }

        // ===== FOOTER with gradient =====
        // y += 15;
        // doc.setFillColor(31, 41, 55); // Slate-800
        // doc.rect(0, y, pageWidth, 40, 'F');
        // ===== FOOTER with gradient =====
        y += 15;
        doc.setFillColor(31, 41, 55); // Slate-800
        doc.rect(10, y, pageWidth - 20, 40, 'F');  // Changed from (0, y, pageWidth, 40) to match other boxes

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Report Card Generated', pageWidth / 2, y + 8, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225); // Slate-300
        doc.text('This report card was generated based on the school\'s active grade calculation configuration.', pageWidth / 2, y + 16, { align: 'center' });
        doc.text('For any questions or clarifications, please contact the school administration.', pageWidth / 2, y + 22, { align: 'center' });

        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`, pageWidth / 2, y + 30, { align: 'center' });

        // ===== SAVE =====
        const studentName = studentData?.name || archive.studentName || 'Student';
        const reportType = type === 'overall' ? 'Complete_Report' :
            type === 'qa1' ? 'QA1' :
                type === 'qa2' ? 'QA2' : 'End_Term';
        doc.save(`${studentName}_${reportType}_Report.pdf`);
    };

    // Group archives by student
    const studentArchives = archives.filter(a => a.studentId === selectedArchive?.studentId);
    const availableTypes = studentArchives.map(a => a.assessmentType);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">📄 Student Report Archives</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {!showDetail ? (
                        (() => {
                            // Group archives by CLASS first
                            const groupedByClass = archives.reduce((acc, archive) => {
                                const className = archive.reportCardData?.class || archive.className || 'Unknown Class';
                                const term = archive.term;
                                const academicYear = archive.academicYear;
                                const classKey = `${className}-${term}-${academicYear}`;

                                if (!acc[classKey]) {
                                    acc[classKey] = {
                                        className: className,
                                        term: term,
                                        academicYear: academicYear,
                                        students: []
                                    };
                                }

                                // Add student to this class group
                                const studentId = archive.studentId;
                                const existingStudent = acc[classKey].students.find((s: any) => s.studentId === studentId);

                                if (existingStudent) {
                                    existingStudent.archives.push(archive);
                                } else {
                                    acc[classKey].students.push({
                                        studentId: studentId,
                                        studentName: archive.reportCardData?.name || archive.studentName,
                                        examNumber: archive.reportCardData?.examNumber || archive.examNumber,
                                        parentEmail: archive.parentEmail,
                                        whatsappNumber: archive.whatsappNumber,
                                        archives: [archive]
                                    });
                                }

                                return acc;
                            }, {});

                            const groupedList = Object.values(groupedByClass);

                            if (groupedList.length === 0) {
                                return <div className="text-center py-12"><p className="text-slate-500">No student report archives found</p></div>;
                            }

                            return (
                                <>
                                    {/* Filters */}
                                    <div className="mb-4 flex flex-wrap gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-medium text-slate-700">Filters:</span>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Search student..."
                                            value={searchStudent}
                                            onChange={(e) => setSearchStudent(e.target.value)}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                                        />

                                        <select
                                            value={selectedClassFilter}
                                            onChange={(e) => setSelectedClassFilter(e.target.value)}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All Classes</option>
                                            {Array.from(new Set(archives.map(a => a.reportCardData?.class || a.className).filter(Boolean))).sort().map(cls => (
                                                <option key={cls} value={cls}>{cls}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedTermFilter}
                                            onChange={(e) => setSelectedTermFilter(e.target.value)}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All Terms</option>
                                            {Array.from(new Set(archives.map(a => a.term).filter(Boolean))).sort().map(term => (
                                                <option key={term} value={term}>{term}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedYearFilter}
                                            onChange={(e) => setSelectedYearFilter(e.target.value)}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All Years</option>
                                            {Array.from(new Set(archives.map(a => a.academicYear).filter(Boolean))).sort().reverse().map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>

                                        {(selectedClassFilter !== 'all' || selectedTermFilter !== 'all' || selectedYearFilter !== 'all' || searchStudent) && (
                                            <button
                                                onClick={() => {
                                                    setSelectedClassFilter('all');
                                                    setSelectedTermFilter('all');
                                                    setSelectedYearFilter('all');
                                                    setSearchStudent('');
                                                }}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                            >
                                                Clear all filters
                                            </button>
                                        )}
                                    </div>

                                    {/* Class Groups */}
                                    {/* Class Groups - Collapsible */}
                                    {groupedList
                                        .filter((group: any) => {
                                            if (selectedClassFilter !== 'all' && group.className !== selectedClassFilter) return false;
                                            if (selectedTermFilter !== 'all' && group.term !== selectedTermFilter) return false;
                                            if (selectedYearFilter !== 'all' && group.academicYear !== selectedYearFilter) return false;

                                            if (searchStudent) {
                                                group.students = group.students.filter((s: any) =>
                                                    s.studentName.toLowerCase().includes(searchStudent.toLowerCase())
                                                );
                                            }

                                            return group.students.length > 0;
                                        })
                                        .map((group: any, groupIdx: number) => {
                                            const isExpanded = expandedClass === `${group.className}-${group.term}-${group.academicYear}`;

                                            return (
                                                <div key={groupIdx} className="mb-4 border border-slate-200 rounded-lg overflow-hidden">
                                                    {/* Class Header - Clickable to expand/collapse */}
                                                    <button
                                                        onClick={() => setExpandedClass(isExpanded ? null : `${group.className}-${group.term}-${group.academicYear}`)}
                                                        className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 hover:from-indigo-600 hover:to-indigo-700 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-left">
                                                                <h3 className="text-lg font-bold text-white">
                                                                    📚 {group.className}
                                                                </h3>
                                                                <div className="flex gap-4 mt-1">
                                                                    <span className="text-xs text-indigo-100">📅 Term: {group.term}</span>
                                                                    <span className="text-xs text-indigo-100">🎓 Academic Year: {group.academicYear}</span>
                                                                    <span className="text-xs text-indigo-100">👨‍🎓 Students: {group.students.length}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-white">
                                                                {isExpanded ? '▲' : '▼'}
                                                            </div>
                                                        </div>
                                                    </button>

                                                    {/* Students Grid - Only show when expanded */}
                                                    {isExpanded && (
                                                        <div className="p-4 bg-slate-50">
                                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                                {group.students.map((student: any) => (
                                                                    <div key={student.studentId} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                                        <div className="mb-3">
                                                                            <h4 className="font-semibold text-slate-800">{student.studentName}</h4>
                                                                            <p className="text-xs text-slate-500">{student.examNumber}</p>
                                                                        </div>

                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedArchive(student.archives[0]);
                                                                                    setShowDetail(true);
                                                                                }}
                                                                                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                                                                            >
                                                                                <Eye className="w-4 h-4" /> View
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDownloadPDF(student.archives[0], 'overall')}
                                                                                className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                                                                            >
                                                                                <Download className="w-4 h-4" /> PDF
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </>
                            );
                        })()
                    ) : (
                        // DETAIL VIEW - Show full report with PDF-only view
                        <div>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                                ← Back to Archives
                            </button>

                            {selectedArchive && (
                                <div>
                                    {/* Report Type Selector - if multiple archives for same student */}
                                    {studentArchives.length > 1 && (
                                        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <label className="text-sm font-medium text-slate-700">View Report:</label>
                                                <select
                                                    value={selectedReportType}
                                                    onChange={(e) => setSelectedReportType(e.target.value as any)}
                                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                                                >
                                                    {availableTypes.includes('qa1') && (
                                                        <option value="qa1">Quarterly Assessment 1 (QA1)</option>
                                                    )}
                                                    {availableTypes.includes('qa2') && (
                                                        <option value="qa2">Quarterly Assessment 2 (QA2)</option>
                                                    )}
                                                    {availableTypes.includes('endOfTerm') && (
                                                        <option value="endOfTerm">End of Term</option>
                                                    )}
                                                    <option value="overall">Complete Report Card (Overall)</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Download Button for Detail View */}
                                    <div className="flex justify-end mb-4">
                                        <button
                                            onClick={() => handleDownloadPDF(selectedArchive, selectedReportType)}
                                            disabled={downloadingId === selectedArchive.id}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg flex items-center gap-2"
                                        >
                                            {downloadingId === selectedArchive.id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Downloading...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4" />
                                                    Download PDF
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Render the appropriate component with PDF-only view */}
                                    <div className="bg-white rounded-lg shadow-lg overflow-auto max-h-[60vh] p-4">
                                        {selectedReportType === 'overall' ? (
                                            <ReportCard
                                                studentData={selectedArchive.reportCardData}
                                                showActions={false}
                                                showPDFOnly={true}
                                            />
                                        ) : (
                                            <QAAssessment
                                                studentData={selectedArchive.reportCardData}
                                                activeTab={selectedReportType}
                                                showPDFOnly={true}
                                            />
                                        )}
                                    </div>

                                    {/* Email/WhatsApp/SMS buttons in detail view */}
                                    <div className="mt-6 flex gap-2 justify-end border-t pt-4">
                                        {selectedArchive.parentEmail && (
                                            <button
                                                onClick={() => handleSendEmail(selectedArchive.id)}
                                                disabled={sendingId === selectedArchive.id}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg flex items-center gap-2"
                                            >
                                                <Mail className="w-4 h-4" />
                                                {sendingId === selectedArchive.id ? 'Sending...' : 'Send Email'}
                                            </button>
                                        )}
                                        {selectedArchive.whatsappNumber && (
                                            <button
                                                onClick={() => handleSendWhatsApp(selectedArchive.id)}
                                                disabled={sendingId === selectedArchive.id}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg flex items-center gap-2"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                {sendingId === selectedArchive.id ? 'Sending...' : 'Send WhatsApp'}
                                            </button>
                                        )}
                                        {selectedArchive.whatsappNumber && (
                                            <button
                                                onClick={() => handleSendSMS(selectedArchive.id)}
                                                disabled={sendingId === selectedArchive.id}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg flex items-center gap-2"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                {sendingId === selectedArchive.id ? 'Sending...' : 'Send SMS'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-200 p-4 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentReportArchiveModal;

