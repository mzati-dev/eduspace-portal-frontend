

import { X, FileText, Download, Eye, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SubjectRecord } from '@/services/studentService';
import { GradeConfiguration } from '@/services/gradeConfigService';
import ClassResultsTable from '../tables/ClassResultsTable';
import { useState, useEffect } from 'react';

interface ArchivedResultsViewProps {
    isOpen: boolean;
    onClose: () => void;
    archivedResults: any[];
    className?: string;
    schoolName?: string;
    subjects?: SubjectRecord[];
    activeConfig?: GradeConfiguration | null;
    calculateGrade?: (score: number, passMark?: number, isAbsent?: boolean, className?: string) => string;
}

const ArchivedResultsView: React.FC<ArchivedResultsViewProps> = ({
    isOpen,
    onClose,
    archivedResults,
    className,
    schoolName: propSchoolName = 'School Name',
    subjects = [],
    activeConfig = null,
    calculateGrade = (score, passMark, isAbsent = false, className) => {
        if (isAbsent) return 'AB';

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
    }
}) => {
    const [selectedArchive, setSelectedArchive] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [activeView, setActiveView] = useState<'overall' | 'qa1' | 'qa2' | 'endOfTerm'>('overall');
    const [schoolName, setSchoolName] = useState<string>(propSchoolName);
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const [selectedArchiveFilter, setSelectedArchiveFilter] = useState<string>('all');
    const [selectedTermFilter, setSelectedTermFilter] = useState<string>('all');
    const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
    const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
    const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
    const [expandedArchive, setExpandedArchive] = useState<string | null>(null);



    const toggleYear = (academicYear: string) => {
        const newSet = new Set(expandedYears);
        if (newSet.has(academicYear)) {
            newSet.delete(academicYear);
        } else {
            newSet.add(academicYear);
        }
        setExpandedYears(newSet);
    };

    const toggleTerm = (termKey: string) => {
        const newSet = new Set(expandedTerms);
        if (newSet.has(termKey)) {
            newSet.delete(termKey);
        } else {
            newSet.add(termKey);
        }
        setExpandedTerms(newSet);
    };

    const getCurrentResults = (archive: any) => {
        if (!archive || !archive.results) return [];

        // Handle new structure with all assessment types
        if (archive.results.overall) {
            return archive.results[activeView] || [];
        }

        // Handle old structure (backward compatibility)
        return archive.results || [];
    };

    // Extract unique classes from results
    useEffect(() => {
        if (selectedArchive) {
            const results = getCurrentResults(selectedArchive);
            console.log('📊 Results for class extraction:', results);

            const classes = new Set<string>();

            // Add the class name from the archive itself (if available)
            if (selectedArchive.className) {
                classes.add(selectedArchive.className);
            }

            // Also try to get from first student if available
            results.forEach((student: any) => {
                const studentClass = student.class?.name || student.className || student.class;
                if (studentClass && studentClass.trim()) {
                    classes.add(studentClass);
                }
            });

            const classList = Array.from(classes).sort();
            console.log('🏫 Available classes found:', classList);
            console.log('📝 Number of students:', results.length);

            setAvailableClasses(classList);
            setSelectedClassFilter('all');
        }
    }, [selectedArchive, activeView]);

    // Fetch school name based on the first student's exam number
    useEffect(() => {
        const fetchSchoolName = async () => {
            if (!selectedArchive || !selectedArchive.results) return;

            const results = getCurrentResults(selectedArchive);
            const firstStudent = results[0];

            if (!firstStudent || !firstStudent.examNumber) {
                setSchoolName(propSchoolName);
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
                    const schools: any[] = await response.json();

                    // Extract prefix from exam number
                    let examPrefix = '';
                    if (firstStudent.examNumber.includes('-')) {
                        examPrefix = firstStudent.examNumber.split('-')[0];
                    } else {
                        examPrefix = firstStudent.examNumber.substring(0, 3);
                    }

                    // Find matching school
                    const matchedSchool = schools.find(school =>
                        school.id.toString().toLowerCase().startsWith(examPrefix.toLowerCase())
                    );

                    if (matchedSchool) {
                        setSchoolName(matchedSchool.name);
                    } else {
                        setSchoolName(propSchoolName);
                    }
                }
            } catch (error) {
                console.error('Failed to load school name', error);
                setSchoolName(propSchoolName);
            }
        };

        fetchSchoolName();
    }, [selectedArchive, activeView, propSchoolName]);

    if (!isOpen) return null;

    // Group archives by Academic Year → Term → Class
    const groupedArchives = archivedResults.reduce((acc, archive) => {
        const academicYear = archive.academicYear || 'Unknown Year';
        const term = archive.term || 'Unknown Term';
        const className = archive.className || 'Unknown Class';
        const archiveKey = `${className}-${term}`;

        if (!acc[academicYear]) {
            acc[academicYear] = { academicYear, terms: {} };
        }
        if (!acc[academicYear].terms[term]) {
            acc[academicYear].terms[term] = { term, classes: {} };
        }
        if (!acc[academicYear].terms[term].classes[archiveKey]) {
            acc[academicYear].terms[term].classes[archiveKey] = {
                className: className,
                term: term,
                academicYear: academicYear,
                archives: []
            };
        }
        acc[academicYear].terms[term].classes[archiveKey].archives.push(archive);
        return acc;
    }, {});

    const groupedList = Object.values(groupedArchives).map((year: any) => ({
        academicYear: year.academicYear,
        terms: Object.values(year.terms)
    }));

    // Filter results by selected class
    const getFilteredResults = () => {
        const results = getCurrentResults(selectedArchive);
        if (selectedClassFilter === 'all') {
            return results;
        }
        return results.filter((student: any) => {
            const studentClass = student.class?.name || student.className || student.class;
            return studentClass === selectedClassFilter;
        });
    };

    const handleDownloadPDF = async (archive: any) => {
        setDownloading(true);
        try {
            const results = getFilteredResults();
            const doc = new jsPDF('l', 'mm', 'a4');

            // doc.setFontSize(16);
            // doc.text(`${schoolName} - Archived Results`, 14, 15);
            // doc.setFontSize(12);

            // let titleText = `${archive.term} - ${archive.academicYear} (${activeView.toUpperCase()})`;
            // if (selectedClassFilter !== 'all') {
            //     titleText += ` - Class: ${selectedClassFilter}`;
            // }
            // doc.text(titleText, 14, 25);
            // doc.text(`Archived: ${new Date(archive.archivedAt).toLocaleDateString()}`, 14, 32);

            const pageWidth = doc.internal.pageSize.getWidth();
            const centerX = pageWidth / 2;


            doc.setFontSize(16);
            // doc.text(`${schoolName} - Archived Results`, 14, 15);
            doc.text(`${schoolName} - Archived Results`, centerX, 15, { align: 'center' });
            doc.setFontSize(12);

            let titleText = `${archive.term} - ${archive.academicYear} (${activeView.toUpperCase()})`;

            // Add class name from archive
            if (archive.className) {
                titleText = `${archive.className} - ${titleText}`;
            }

            // Add filter class if different from archive class
            if (selectedClassFilter !== 'all' && selectedClassFilter !== archive.className) {
                titleText += ` - Filtered: ${selectedClassFilter}`;
            }

            // doc.text(titleText, 14, 25);
            doc.text(titleText, centerX, 25, { align: 'center' });
            // doc.text(`Archived: ${new Date(archive.archivedAt).toLocaleDateString()}`, 14, 32);
            doc.text(`Archived: ${new Date(archive.archivedAt).toLocaleDateString()}`, centerX, 32, { align: 'center' });

            // Get all unique subject names from the results
            const subjectNames = new Set<string>();
            results.forEach((student: any) => {
                if (student.subjects) {
                    student.subjects.forEach((subject: any) => {
                        subjectNames.add(subject.name);
                    });
                }
            });
            const sortedSubjects = Array.from(subjectNames).sort();

            // Build table headers
            const tableHead = [
                'Rank',
                'Student Name',
                ...sortedSubjects,
                'Total',
                'Avg',
                'Grade',
                'Status'
            ];

            // Build table body with the same logic as ClassResultsTable
            const tableBody = results.map((student: any) => {
                // Calculate total marks and average based on active view
                let totalMarks = 0;
                let average = 0;
                let grade = 'F';
                let status = 'Failed';

                if (activeView === 'overall') {
                    // Calculate overall scores using subject final scores
                    const subjectsWithScores = student.subjects?.filter((s: any) => {
                        const hasScores = s.qa1 > 0 || s.qa2 > 0 || s.endOfTerm > 0;
                        const hasAbsent = s.qa1_absent || s.qa2_absent || s.endOfTerm_absent;
                        return hasScores || hasAbsent;
                    }) || [];

                    if (subjectsWithScores.length > 0) {
                        let totalFinalScore = 0;
                        subjectsWithScores.forEach((subject: any) => {
                            // Calculate final score based on grade config
                            let finalScore = 0;
                            if (subject.finalScore) {
                                finalScore = subject.finalScore;
                            } else {
                                // Calculate if not pre-calculated
                                const qa1 = subject.qa1 || 0;
                                const qa2 = subject.qa2 || 0;
                                const endTerm = subject.endOfTerm || 0;

                                if (activeConfig?.calculation_method === 'weighted_average') {
                                    const w1 = activeConfig.weight_qa1 || 0;
                                    const w2 = activeConfig.weight_qa2 || 0;
                                    const w3 = activeConfig.weight_end_of_term || 0;
                                    finalScore = (qa1 * w1 + qa2 * w2 + endTerm * w3) / 100;
                                } else if (activeConfig?.calculation_method === 'end_of_term_only') {
                                    finalScore = endTerm;
                                } else {
                                    finalScore = (qa1 + qa2 + endTerm) / 3;
                                }
                            }
                            totalFinalScore += finalScore;
                        });

                        average = totalFinalScore / subjectsWithScores.length;
                        totalMarks = totalFinalScore;
                        const studentClass = student.class?.name || student.className || student.class;
                        grade = calculateGrade(average, activeConfig?.pass_mark, false, studentClass);
                        status = grade === 'F' ? 'Failed' : 'Passed';
                    }
                } else {
                    // Calculate for specific assessment type (QA1, QA2, End Term)
                    student.subjects?.forEach((subject: any) => {
                        let score = 0;
                        let isAbsent = false;

                        if (activeView === 'qa1') {
                            score = subject.qa1;
                            isAbsent = subject.qa1_absent;
                        } else if (activeView === 'qa2') {
                            score = subject.qa2;
                            isAbsent = subject.qa2_absent;
                        } else { // endOfTerm
                            score = subject.endOfTerm;
                            isAbsent = subject.endOfTerm_absent;
                        }

                        if (!isAbsent && score !== null && score >= 0) {
                            totalMarks += score;
                        }
                    });

                    const subjectCount = student.subjects?.length || 1;
                    average = totalMarks / subjectCount;
                    const studentClass = student.class?.name || student.className || student.class;
                    grade = calculateGrade(average, activeConfig?.pass_mark, false, studentClass);
                    status = grade === 'F' ? 'Failed' : 'Passed';
                }

                // Build subject columns
                const subjectCols = sortedSubjects.map(subjName => {
                    const subject = student.subjects?.find((s: any) => s.name === subjName);
                    if (!subject) return '-';

                    if (activeView === 'overall') {
                        const hasScores = (subject.qa1 !== null && subject.qa1 >= 0) ||
                            (subject.qa2 !== null && subject.qa2 >= 0) ||
                            (subject.endOfTerm !== null && subject.endOfTerm >= 0);
                        const hasAbsent = subject.qa1_absent || subject.qa2_absent || subject.endOfTerm_absent;

                        if (!hasScores && !hasAbsent) return '-';

                        let finalScore = subject.finalScore;
                        if (!finalScore) {
                            const qa1 = subject.qa1 || 0;
                            const qa2 = subject.qa2 || 0;
                            const endTerm = subject.endOfTerm || 0;

                            if (activeConfig?.calculation_method === 'weighted_average') {
                                const w1 = activeConfig.weight_qa1 || 0;
                                const w2 = activeConfig.weight_qa2 || 0;
                                const w3 = activeConfig.weight_end_of_term || 0;
                                finalScore = (qa1 * w1 + qa2 * w2 + endTerm * w3) / 100;
                            } else if (activeConfig?.calculation_method === 'end_of_term_only') {
                                finalScore = endTerm;
                            } else {
                                finalScore = (qa1 + qa2 + endTerm) / 3;
                            }
                        }

                        const studentClass = student.class?.name || student.className || student.class;
                        const subjectGrade = calculateGrade(finalScore, activeConfig?.pass_mark, false, studentClass);

                        if (subject.endOfTerm_absent) {
                            return `AB (${subjectGrade})`;
                        }

                        return `${finalScore.toFixed(1)} (${subjectGrade})`;
                    } else {
                        let score = 0;
                        let isAbsent = false;

                        if (activeView === 'qa1') {
                            score = subject.qa1;
                            isAbsent = subject.qa1_absent;
                        } else if (activeView === 'qa2') {
                            score = subject.qa2;
                            isAbsent = subject.qa2_absent;
                        } else {
                            score = subject.endOfTerm;
                            isAbsent = subject.endOfTerm_absent;
                        }

                        if (isAbsent) return 'AB';
                        if (score !== null && score >= 0) {
                            const studentClass = student.class?.name || student.className || student.class;
                            const subjectGrade = calculateGrade(score, activeConfig?.pass_mark, false, studentClass);
                            return `${score} (${subjectGrade})`;
                        }
                        return '-';
                    }
                });

                return [
                    student.rank || '-',
                    student.name,
                    ...subjectCols,
                    totalMarks.toFixed(1),
                    average.toFixed(1) + '%',
                    grade,
                    status
                ];
            });

            autoTable(doc, {
                head: [tableHead],
                body: tableBody,
                startY: 40,
                styles: { fontSize: 7, cellPadding: 1 },
                headStyles: { fillColor: [63, 81, 181] }
            });

            const fileName = `${archive.term}_${archive.academicYear}_${activeView}_Archived_Results${selectedClassFilter !== 'all' ? `_${selectedClassFilter}` : ''}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setDownloading(false);
        }
    };

    const renderAssessmentTypeTabs = (archive: any) => {
        if (!archive.results?.overall) return null;

        return (
            <div className="flex gap-2 mb-4 border-b border-slate-200 pb-2">
                {[
                    { id: 'overall', label: 'Overall' },
                    { id: 'qa1', label: 'QA1' },
                    { id: 'qa2', label: 'QA2' },
                    { id: 'endOfTerm', label: 'End Term' }
                ].map(type => (
                    <button
                        key={type.id}
                        onClick={() => setActiveView(type.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeView === type.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>
        );
    };

    const renderClassFilter = () => {
        // Don't show filter if there's only one class or no classes
        if (availableClasses.length <= 1) {
            if (availableClasses.length === 1) {
                console.log('Only one class found, hiding filter');
            } else {
                console.log('No classes found in data');
            }
            return null;
        }

        console.log('Rendering filter with classes:', availableClasses);

        return (
            <div className="mb-4 flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-slate-700">Filter by Class:</span>
                </div>
                <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                    <option value="all">All Classes ({getCurrentResults(selectedArchive).length} students)</option>
                    {availableClasses.map(cls => {
                        const count = getCurrentResults(selectedArchive).filter((s: any) => {
                            const studentClass = s.class?.name || s.className || s.class;
                            return studentClass === cls;
                        }).length;
                        return (
                            <option key={cls} value={cls}>
                                {cls} ({count} students)
                            </option>
                        );
                    })}
                </select>
                {selectedClassFilter !== 'all' && (
                    <button
                        onClick={() => setSelectedClassFilter('all')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                    >
                        Clear filter
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">📚 Archived Results</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {!showDetail ? (
                        archivedResults.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No archived results found</p>
                            </div>
                        ) : (
                            <>
                                {/* Add filter for list view */}
                                {/* Add filter for list view */}
                                {archivedResults.length > 1 && (
                                    <div className="mb-4 flex flex-wrap gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-medium text-slate-700">Filters:</span>
                                        </div>

                                        {/* Class Filter */}
                                        {/* <select
                                            value={selectedArchiveFilter}
                                            onChange={(e) => setSelectedArchiveFilter(e.target.value)}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All Classes</option>
                                            {Array.from(new Set(archivedResults.map(a => a.className).filter(Boolean))).sort().map(cls => (
                                                <option key={cls} value={cls}>{cls}</option>
                                            ))}
                                        </select> */}

                                        {/* Term Filter */}
                                        <select
                                            value={selectedTermFilter}
                                            onChange={(e) => setSelectedTermFilter(e.target.value)}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All Terms</option>
                                            {Array.from(new Set(archivedResults.map(a => a.term).filter(Boolean))).sort().map(term => (
                                                <option key={term} value={term}>{term}</option>
                                            ))}
                                        </select>

                                        {/* Academic Year Filter */}
                                        <select
                                            value={selectedYearFilter}
                                            onChange={(e) => setSelectedYearFilter(e.target.value)}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All Years</option>
                                            {Array.from(new Set(archivedResults.map(a => a.academicYear).filter(Boolean))).sort().reverse().map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>

                                        {/* Clear all filters button */}
                                        {/* {(selectedArchiveFilter !== 'all' || selectedTermFilter !== 'all' || selectedYearFilter !== 'all') && (
                                            <button
                                                onClick={() => {
                                                    setSelectedArchiveFilter('all');
                                                    setSelectedTermFilter('all');
                                                    setSelectedYearFilter('all');
                                                }}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                            >
                                                Clear all filters
                                            </button>
                                        )} */}
                                        {(selectedTermFilter !== 'all' || selectedYearFilter !== 'all') && (
                                            <button
                                                onClick={() => {
                                                    setSelectedTermFilter('all');
                                                    setSelectedYearFilter('all');
                                                }}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                            >
                                                Clear all filters
                                            </button>
                                        )}
                                    </div>
                                )}

                                {groupedList.map((yearGroup: any, yearIdx: number) => {
                                    const isYearExpanded = expandedYears.has(yearGroup.academicYear);
                                    return (
                                        <div key={yearIdx} className="mb-4 border border-slate-200 rounded-lg overflow-hidden">
                                            {/* Academic Year Header */}
                                            <button
                                                onClick={() => toggleYear(yearGroup.academicYear)}
                                                className="w-full bg-gradient-to-r from-indigo-700 to-indigo-800 px-4 py-3 hover:from-indigo-800 hover:to-indigo-900 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{isYearExpanded ? '📂' : '📁'}</span>
                                                        <h2 className="text-xl font-bold text-white">{yearGroup.academicYear}</h2>
                                                        <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">{yearGroup.terms.length} terms</span>
                                                    </div>
                                                    <div className="text-white text-xl">{isYearExpanded ? '▼' : '▶'}</div>
                                                </div>
                                            </button>

                                            {isYearExpanded && (
                                                <div className="p-4 bg-slate-100">
                                                    {yearGroup.terms.map((termGroup: any, termIdx: number) => {
                                                        const termKey = `${yearGroup.academicYear}-${termGroup.term}`;
                                                        const isTermExpanded = expandedTerms.has(termKey);
                                                        return (
                                                            <div key={termIdx} className="mb-3 border border-slate-200 rounded-lg overflow-hidden">
                                                                {/* Term Header */}
                                                                <button
                                                                    onClick={() => toggleTerm(termKey)}
                                                                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 hover:from-indigo-600 hover:to-indigo-700 transition-colors"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xl">{isTermExpanded ? '📂' : '📁'}</span>
                                                                            <h3 className="text-lg font-semibold text-white">📖 {termGroup.term}</h3>
                                                                            <span className="text-xs bg-indigo-400 text-white px-2 py-0.5 rounded-full">{Object.keys(termGroup.classes).length} classes</span>
                                                                        </div>
                                                                        <div className="text-white">{isTermExpanded ? '▲' : '▼'}</div>
                                                                    </div>
                                                                </button>

                                                                {isTermExpanded && (
                                                                    <div className="p-3 bg-white">
                                                                        {Object.values(termGroup.classes).map((classGroup: any, classIdx: number) => {
                                                                            const isExpanded = expandedArchive === `${classGroup.className}-${classGroup.term}-${classGroup.academicYear}`;
                                                                            return (
                                                                                <div key={classIdx} className="mb-3 border border-slate-200 rounded-lg overflow-hidden">
                                                                                    {/* Class Header */}
                                                                                    <button
                                                                                        onClick={() => setExpandedArchive(isExpanded ? null : `${classGroup.className}-${classGroup.term}-${classGroup.academicYear}`)}
                                                                                        className="w-full bg-gradient-to-r from-indigo-400 to-indigo-500 px-4 py-2 hover:from-indigo-500 hover:to-indigo-600 transition-colors"
                                                                                    >
                                                                                        <div className="flex items-center justify-between">
                                                                                            <div className="text-left">
                                                                                                <h4 className="font-bold text-white">📚 {classGroup.className}</h4>
                                                                                                <span className="text-xs text-indigo-100">📊 {classGroup.archives.length} archive(s)</span>
                                                                                            </div>
                                                                                            <div className="text-white">{isExpanded ? '▲' : '▼'}</div>
                                                                                        </div>
                                                                                    </button>

                                                                                    {/* Archive Cards */}
                                                                                    {isExpanded && (
                                                                                        <div className="p-3 bg-slate-50">
                                                                                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                                                                {classGroup.archives.map((archive: any, archIdx: number) => {
                                                                                                    const hasMultipleTypes = archive.results?.overall ? true : false;
                                                                                                    const displayResults = hasMultipleTypes ? archive.results.overall : archive.results;
                                                                                                    return (
                                                                                                        <div key={archIdx} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                                                                                            <div className="mb-2">
                                                                                                                <h5 className="font-semibold text-slate-800">{archive.term}</h5>
                                                                                                                <p className="text-xs text-slate-500">{archive.academicYear}</p>
                                                                                                                <p className="text-xs text-slate-400 mt-1">Archived: {new Date(archive.archivedAt).toLocaleDateString()}</p>
                                                                                                            </div>
                                                                                                            <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                                                                                                                <div className="bg-slate-50 p-1 rounded text-center">
                                                                                                                    <p className="text-slate-500">Students</p>
                                                                                                                    <p className="font-semibold">{displayResults?.length || 0}</p>
                                                                                                                </div>
                                                                                                                <div className="bg-slate-50 p-1 rounded text-center">
                                                                                                                    <p className="text-slate-500">Pass Rate</p>
                                                                                                                    <p className="font-semibold">
                                                                                                                        {archive.results?.overall ?
                                                                                                                            Math.round((archive.results.overall.filter((r: any) => r.overallGrade !== 'F').length / archive.results.overall.length) * 100) : 0}%
                                                                                                                    </p>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div className="flex gap-2">
                                                                                                                <button
                                                                                                                    onClick={() => {
                                                                                                                        setSelectedArchive(archive);
                                                                                                                        setShowDetail(true);
                                                                                                                    }}
                                                                                                                    className="flex-1 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg flex items-center justify-center gap-1"
                                                                                                                >
                                                                                                                    <Eye className="w-3 h-3" /> View
                                                                                                                </button>
                                                                                                                <button
                                                                                                                    onClick={() => handleDownloadPDF(archive)}
                                                                                                                    disabled={downloading}
                                                                                                                    className="flex-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg flex items-center justify-center gap-1"
                                                                                                                >
                                                                                                                    <Download className="w-3 h-3" /> PDF
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}




                            </>
                        )
                    ) : (
                        // Detail view for single archive
                        <div>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                                ← Back to Archives
                            </button>

                            {selectedArchive && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {selectedArchive.term} - {selectedArchive.academicYear}
                                            </h3>
                                            <p className="text-sm text-slate-500">{schoolName}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDownloadPDF(selectedArchive)}
                                            disabled={downloading}
                                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1"
                                        >
                                            {downloading ? (
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

                                    {/* Assessment Type Tabs */}
                                    {renderAssessmentTypeTabs(selectedArchive)}

                                    {/* Class Filter - Only shows if multiple classes exist */}
                                    {renderClassFilter()}

                                    {/* Display filtered results summary */}
                                    {selectedClassFilter !== 'all' && (
                                        <div className="mb-3 text-sm text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                                            Showing {getFilteredResults().length} student(s) from {selectedClassFilter}
                                        </div>
                                    )}

                                    {/* Debug info - remove in production */}
                                    {availableClasses.length === 0 && (
                                        <div className="mb-3 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                                            ⚠️ No class information found in the archived data. Filter disabled.
                                        </div>
                                    )}

                                    {/* Use ClassResultsTable to display the filtered results */}
                                    <div className="border rounded-lg overflow-hidden">
                                        <ClassResultsTable
                                            classResults={getFilteredResults()}
                                            subjects={subjects}
                                            activeAssessmentType={activeView}
                                            activeConfig={activeConfig}
                                            calculateGrade={calculateGrade}
                                            onPrint={() => { }}
                                            onExport={() => handleDownloadPDF(selectedArchive)}
                                            isDownloading={downloading}
                                            hideDownload={true}
                                        />
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

export default ArchivedResultsView;

