import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, FileText, Calendar, Download } from 'lucide-react';
import { StudentData } from '@/types';
import { Child } from '@/types/parent';
import {
    fetchChildReportCards,
    fetchChildAssessments,
} from '@/services/parentService';
import ReportCard from '../app/searchResults/ReportCard';
import QAAssessment from '../app/searchResults/QAAssessment';

interface ParentReportCardsProps {
    onBack: () => void;
    selectedChild: Child | null;
    children: Child[];
    onChildChange: (childId: string) => void;
    showMessage: (msg: string, isError?: boolean) => void;
}

const ParentReportCards: React.FC<ParentReportCardsProps> = ({
    onBack,
    selectedChild,
    children,
    onChildChange,
    showMessage
}) => {
    const [reportCards, setReportCards] = useState<any[]>([]);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedReportType, setSelectedReportType] = useState<'overall' | 'qa1' | 'qa2' | 'endOfTerm'>('overall');
    const [selectedTerm, setSelectedTerm] = useState<string>('');
    const [terms, setTerms] = useState<string[]>([]);
    const [selectedReportData, setSelectedReportData] = useState<any>(null);
    const [loadingReport, setLoadingReport] = useState(false);

    useEffect(() => {
        setSubjects([
            { id: '1', name: 'Mathematics' },
            { id: '2', name: 'English' },
            { id: '3', name: 'Science' },
            { id: '4', name: 'Social Studies' },
            { id: '5', name: 'Chichewa' }
        ]);
    }, []);

    useEffect(() => {
        if (selectedChild) {
            loadChildReports(selectedChild.id);
        }
    }, [selectedChild]);

    const loadChildReports = async (childId: string) => {
        try {
            const [reportsData, assessmentsData] = await Promise.all([
                fetchChildReportCards(childId),
                fetchChildAssessments(childId)
            ]);

            setReportCards(reportsData);
            setAssessments(assessmentsData);

            const uniqueTerms = [...new Set(reportsData.map((r: any) => r.term))];
            setTerms(uniqueTerms);
            if (uniqueTerms.length > 0 && !selectedTerm) {
                setSelectedTerm(uniqueTerms[0]);
            }

        } catch (error) {
            console.error('Error loading child reports:', error);
            showMessage('Failed to load reports', true);
        }
    };

    useEffect(() => {
        const loadReportData = async () => {
            if (!selectedChild || !selectedTerm) return;

            setLoadingReport(true);
            try {
                if (selectedReportType === 'overall') {
                    const report = reportCards.find(r => r.term === selectedTerm);
                    if (report) {
                        const studentData: StudentData = {
                            name: selectedChild.name,
                            examNumber: selectedChild.exam_number,
                            class: selectedChild.class,
                            term: report.term,
                            academicYear: report.academicYear,
                            photo: selectedChild.photo_url || '',
                            subjects: report.subjects.map((s: any) => ({
                                name: s.subject_name,
                                qa1: s.qa1 || null,
                                qa1_absent: s.qa1_absent || false,
                                qa2: s.qa2 || null,
                                qa2_absent: s.qa2_absent || false,
                                endOfTerm: s.end_of_term || null,
                                endOfTerm_absent: s.end_of_term_absent || false,
                                grade: s.final_grade,
                                finalScore: s.final_score
                            })),
                            attendance: {
                                present: 0,
                                absent: 0,
                                late: 0
                            },
                            classRank: report.rank,
                            totalStudents: report.totalStudents,
                            teacherRemarks: report.teacherRemarks,
                            assessmentStats: {
                                qa1: { classRank: 0, termAverage: 0, overallGrade: '' },
                                qa2: { classRank: 0, termAverage: 0, overallGrade: '' },
                                endOfTerm: {
                                    classRank: report.rank,
                                    termAverage: report.average,
                                    overallGrade: report.subjects[0]?.final_grade || '',
                                    attendance: { present: 0, absent: 0 }
                                },
                                overall: {
                                    termAverage: report.average
                                }
                            }
                        };
                        setSelectedReportData(studentData);
                    }
                } else {
                    const filteredAssessments = assessments.filter(a => a.type === selectedReportType);

                    const studentData: StudentData = {
                        name: selectedChild.name,
                        examNumber: selectedChild.exam_number,
                        class: selectedChild.class,
                        term: selectedTerm,
                        academicYear: selectedChild.academic_year || '',
                        photo: selectedChild.photo_url || '',
                        subjects: subjects.map(sub => {
                            const assessment = filteredAssessments.find((a: any) => a.subject === sub.name);
                            return {
                                name: sub.name,
                                qa1: selectedReportType === 'qa1' ? assessment?.score || null : null,
                                qa1_absent: selectedReportType === 'qa1' ? assessment?.is_absent || false : false,
                                qa2: selectedReportType === 'qa2' ? assessment?.score || null : null,
                                qa2_absent: selectedReportType === 'qa2' ? assessment?.is_absent || false : false,
                                endOfTerm: selectedReportType === 'endOfTerm' ? assessment?.score || null : null,
                                endOfTerm_absent: selectedReportType === 'endOfTerm' ? assessment?.is_absent || false : false,
                                grade: assessment?.grade || 'N/A',
                                finalScore: assessment?.score || 0
                            };
                        }),
                        attendance: { present: 0, absent: 0, late: 0 },
                        classRank: 0,
                        totalStudents: 0,
                        teacherRemarks: '',
                        assessmentStats: {
                            qa1: { classRank: 0, termAverage: 0, overallGrade: '' },
                            qa2: { classRank: 0, termAverage: 0, overallGrade: '' },
                            endOfTerm: {
                                classRank: 0,
                                termAverage: 0,
                                overallGrade: '',
                                attendance: { present: 0, absent: 0 }
                            },
                            overall: {
                                termAverage: 0
                            }
                        }
                    };
                    setSelectedReportData(studentData);
                }
            } catch (error) {
                console.error('Error loading report data:', error);
            } finally {
                setLoadingReport(false);
            }
        };

        loadReportData();
    }, [selectedTerm, selectedReportType, selectedChild, reportCards, assessments, subjects]);

    if (reportCards.length === 0 && assessments.length === 0) {
        return (
            <div className="min-h-screen bg-slate-100 p-6">
                <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Reports Available</h3>
                    <p className="text-slate-500">Report cards will appear here once they are published.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">


                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">Student:</span>
                        <select
                            value={selectedChild?.id || ''}
                            onChange={(e) => onChildChange(e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            {children.map(child => (
                                <option key={child.id} value={child.id}>
                                    {child.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Academic Reports</h1>
                            <p className="text-sm text-slate-500 mt-1">View your child's performance reports</p>
                        </div>

                        {terms.length > 0 && (
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-indigo-500" />
                                <select
                                    value={selectedTerm}
                                    onChange={(e) => setSelectedTerm(e.target.value)}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                >
                                    {terms.map(term => (
                                        <option key={term} value={term}>{term}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 mt-6 border-b border-slate-200">
                        <button
                            onClick={() => setSelectedReportType('overall')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'overall'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Overall Report
                        </button>
                        <button
                            onClick={() => setSelectedReportType('qa1')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'qa1'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Quarterly Assessment 1
                        </button>
                        <button
                            onClick={() => setSelectedReportType('qa2')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'qa2'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Quarterly Assessment 2
                        </button>
                        <button
                            onClick={() => setSelectedReportType('endOfTerm')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'endOfTerm'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            End of Term
                        </button>
                    </div>
                </div>

                {loadingReport ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600">Loading report data...</p>
                    </div>
                ) : selectedReportData ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {selectedReportType === 'overall' ? (
                            <ReportCard
                                studentData={selectedReportData}
                                showActions={true}
                            />
                        ) : (
                            <QAAssessment
                                studentData={selectedReportData}
                                activeTab={selectedReportType}
                                showPDFOnly={false}
                            />
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Data Available</h3>
                        <p className="text-slate-500">No report data found for the selected term and type.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentReportCards;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Loader2, FileText, Calendar, Download } from 'lucide-react';
// import { StudentData } from '@/types';
// import { Child } from '@/types/parent';
// import {
//     fetchChildReportCards,
//     fetchChildAssessments,
// } from '@/services/parentService';
// import ReportCard from '../app/searchResults/ReportCard';
// import QAAssessment from '../app/searchResults/QAAssessment';

// interface ParentReportCardsProps {
//     onBack: () => void;
//     selectedChild: Child | null;
//     children: Child[];
//     onChildChange: (childId: string) => void;
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const ParentReportCards: React.FC<ParentReportCardsProps> = ({
//     onBack,
//     selectedChild,
//     children,
//     onChildChange,
//     showMessage
// }) => {
//     // Remove these lines - they come from props now
//     // const [children, setChildren] = useState<Child[]>([]);
//     // const [selectedChild, setSelectedChild] = useState<Child | null>(null);

//     // Remove loadParentData function and its useEffect

//     // const [loading, setLoading] = useState(true);
//     const [reportCards, setReportCards] = useState<any[]>([]);
//     const [assessments, setAssessments] = useState<any[]>([]);
//     const [subjects, setSubjects] = useState<any[]>([]);
//     const [selectedReportType, setSelectedReportType] = useState<'overall' | 'qa1' | 'qa2' | 'endOfTerm'>('overall');
//     const [selectedTerm, setSelectedTerm] = useState<string>('');
//     const [terms, setTerms] = useState<string[]>([]);
//     const [selectedReportData, setSelectedReportData] = useState<any>(null);
//     const [loadingReport, setLoadingReport] = useState(false);

//     // Mock subjects for now - replace with actual API call
//     useEffect(() => {
//         setSubjects([
//             { id: '1', name: 'Mathematics' },
//             { id: '2', name: 'English' },
//             { id: '3', name: 'Science' },
//             { id: '4', name: 'Social Studies' },
//             { id: '5', name: 'Chichewa' }
//         ]);
//     }, []);

//     // Load reports when selected child changes
//     useEffect(() => {
//         if (selectedChild) {
//             loadChildReports(selectedChild.id);
//         }
//     }, [selectedChild]);

//     const loadChildReports = async (childId: string) => {
//         // setLoading(true);
//         try {
//             const [reportsData, assessmentsData] = await Promise.all([
//                 fetchChildReportCards(childId),
//                 fetchChildAssessments(childId)
//             ]);

//             setReportCards(reportsData);
//             setAssessments(assessmentsData);

//             const uniqueTerms = [...new Set(reportsData.map((r: any) => r.term))];
//             setTerms(uniqueTerms);
//             if (uniqueTerms.length > 0 && !selectedTerm) {
//                 setSelectedTerm(uniqueTerms[0]);
//             }

//         } catch (error) {
//             console.error('Error loading child reports:', error);
//             showMessage('Failed to load reports', true);
//         } finally {
//             // setLoading(false);
//         }
//     };

//     // Remove handleChildChange - use onChildChange from props instead
//     // const handleChildChange = async (childId: string) => {
//     //     const child = children.find(c => c.id === childId);
//     //     if (child) {
//     //         setSelectedChild(child);
//     //         await loadChildReports(childId);
//     //     }
//     // };

//     useEffect(() => {
//         const loadReportData = async () => {
//             if (!selectedChild || !selectedTerm) return;

//             setLoadingReport(true);
//             try {
//                 if (selectedReportType === 'overall') {
//                     const report = reportCards.find(r => r.term === selectedTerm);
//                     if (report) {
//                         const studentData: StudentData = {
//                             name: selectedChild.name,
//                             examNumber: selectedChild.exam_number,
//                             class: selectedChild.class,
//                             term: report.term,
//                             academicYear: report.academicYear,
//                             photo: selectedChild.photo_url || '',
//                             subjects: report.subjects.map((s: any) => ({
//                                 name: s.subject_name,
//                                 qa1: s.qa1 || null,
//                                 qa1_absent: s.qa1_absent || false,
//                                 qa2: s.qa2 || null,
//                                 qa2_absent: s.qa2_absent || false,
//                                 endOfTerm: s.end_of_term || null,
//                                 endOfTerm_absent: s.end_of_term_absent || false,
//                                 grade: s.final_grade,
//                                 finalScore: s.final_score
//                             })),
//                             attendance: {
//                                 present: 0,
//                                 absent: 0,
//                                 late: 0
//                             },
//                             classRank: report.rank,
//                             totalStudents: report.totalStudents,
//                             teacherRemarks: report.teacherRemarks,
//                             assessmentStats: {
//                                 qa1: { classRank: 0, termAverage: 0, overallGrade: '' },
//                                 qa2: { classRank: 0, termAverage: 0, overallGrade: '' },
//                                 endOfTerm: {
//                                     classRank: report.rank,
//                                     termAverage: report.average,
//                                     overallGrade: report.subjects[0]?.final_grade || '',
//                                     attendance: { present: 0, absent: 0 }
//                                 },
//                                 overall: {
//                                     termAverage: report.average
//                                 }
//                             }
//                         };
//                         setSelectedReportData(studentData);
//                     }
//                 } else {
//                     const filteredAssessments = assessments.filter(a => a.type === selectedReportType);

//                     const studentData: StudentData = {
//                         name: selectedChild.name,
//                         examNumber: selectedChild.exam_number,
//                         class: selectedChild.class,
//                         term: selectedTerm,
//                         academicYear: selectedChild.academic_year || '',
//                         photo: selectedChild.photo_url || '',
//                         subjects: subjects.map(sub => {
//                             const assessment = filteredAssessments.find((a: any) => a.subject === sub.name);
//                             return {
//                                 name: sub.name,
//                                 qa1: selectedReportType === 'qa1' ? assessment?.score || null : null,
//                                 qa1_absent: selectedReportType === 'qa1' ? assessment?.is_absent || false : false,
//                                 qa2: selectedReportType === 'qa2' ? assessment?.score || null : null,
//                                 qa2_absent: selectedReportType === 'qa2' ? assessment?.is_absent || false : false,
//                                 endOfTerm: selectedReportType === 'endOfTerm' ? assessment?.score || null : null,
//                                 endOfTerm_absent: selectedReportType === 'endOfTerm' ? assessment?.is_absent || false : false,
//                                 grade: assessment?.grade || 'N/A',
//                                 finalScore: assessment?.score || 0
//                             };
//                         }),
//                         attendance: { present: 0, absent: 0, late: 0 },
//                         classRank: 0,
//                         totalStudents: 0,
//                         teacherRemarks: '',
//                         assessmentStats: {
//                             qa1: { classRank: 0, termAverage: 0, overallGrade: '' },
//                             qa2: { classRank: 0, termAverage: 0, overallGrade: '' },
//                             endOfTerm: {
//                                 classRank: 0,
//                                 termAverage: 0,
//                                 overallGrade: '',
//                                 attendance: { present: 0, absent: 0 }
//                             },
//                             overall: {
//                                 termAverage: 0
//                             }
//                         }
//                     };
//                     setSelectedReportData(studentData);
//                 }
//             } catch (error) {
//                 console.error('Error loading report data:', error);
//             } finally {
//                 setLoadingReport(false);
//             }
//         };

//         loadReportData();
//     }, [selectedTerm, selectedReportType, selectedChild, reportCards, assessments, subjects]);

//     // if (loading) {
//     //     return (
//     //         <div className="min-h-screen bg-slate-100 flex items-center justify-center">
//     //             <div className="text-center">
//     //                 <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
//     //                 <p className="text-slate-600">Loading reports...</p>
//     //             </div>
//     //         </div>
//     //     );
//     // }

//     if (reportCards.length === 0 && assessments.length === 0) {
//         return (
//             <div className="min-h-screen bg-slate-100 p-6">
//                 <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto">
//                     <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                     <h3 className="text-xl font-semibold text-slate-700 mb-2">No Reports Available</h3>
//                     <p className="text-slate-500">Report cards will appear here once they are published.</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-slate-100 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header with back button */}
//                 <div className="flex items-center justify-between mb-6">
//                     <button
//                         onClick={onBack}
//                         className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
//                     >
//                         <ArrowLeft className="w-5 h-5" />
//                         Back to Dashboard
//                     </button>

//                     <div className="flex items-center gap-3">
//                         <span className="text-sm font-medium text-slate-600">Student:</span>
//                         <select
//                             value={selectedChild?.id || ''}
//                             onChange={(e) => onChildChange(e.target.value)}  // Use prop function
//                             className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                         >
//                             {children.map(child => (
//                                 <option key={child.id} value={child.id}>
//                                     {child.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>

//                 {/* Rest of your component remains exactly the same... */}
//                 {/* Report Selection Header */}
//                 <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6">
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                         <div>
//                             <h1 className="text-2xl font-bold text-slate-800">Academic Reports</h1>
//                             <p className="text-sm text-slate-500 mt-1">View your child's performance reports</p>
//                         </div>

//                         {/* Term Selector */}
//                         {terms.length > 0 && (
//                             <div className="flex items-center gap-3">
//                                 <Calendar className="w-5 h-5 text-indigo-500" />
//                                 <select
//                                     value={selectedTerm}
//                                     onChange={(e) => setSelectedTerm(e.target.value)}
//                                     className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                                 >
//                                     {terms.map(term => (
//                                         <option key={term} value={term}>{term}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}
//                     </div>

//                     {/* Report Type Tabs */}
//                     <div className="flex gap-2 mt-6 border-b border-slate-200">
//                         <button
//                             onClick={() => setSelectedReportType('overall')}
//                             className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'overall'
//                                 ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                 : 'text-slate-500 hover:text-slate-700'
//                                 }`}
//                         >
//                             Overall Report
//                         </button>
//                         <button
//                             onClick={() => setSelectedReportType('qa1')}
//                             className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'qa1'
//                                 ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                 : 'text-slate-500 hover:text-slate-700'
//                                 }`}
//                         >
//                             Quarterly Assessment 1
//                         </button>
//                         <button
//                             onClick={() => setSelectedReportType('qa2')}
//                             className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'qa2'
//                                 ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                 : 'text-slate-500 hover:text-slate-700'
//                                 }`}
//                         >
//                             Quarterly Assessment 2
//                         </button>
//                         <button
//                             onClick={() => setSelectedReportType('endOfTerm')}
//                             className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'endOfTerm'
//                                 ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                 : 'text-slate-500 hover:text-slate-700'
//                                 }`}
//                         >
//                             End of Term
//                         </button>
//                     </div>
//                 </div>

//                 {/* Report Display Area */}
//                 {loadingReport ? (
//                     <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//                         <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
//                         <p className="text-slate-600">Loading report data...</p>
//                     </div>
//                 ) : selectedReportData ? (
//                     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//                         {selectedReportType === 'overall' ? (
//                             <ReportCard
//                                 studentData={selectedReportData}
//                                 showActions={true}
//                             />
//                         ) : (
//                             <QAAssessment
//                                 studentData={selectedReportData}
//                                 activeTab={selectedReportType}
//                                 showPDFOnly={false}
//                             />
//                         )}
//                     </div>
//                 ) : (
//                     <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
//                         <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                         <h3 className="text-lg font-semibold text-slate-700 mb-2">No Data Available</h3>
//                         <p className="text-slate-500">No report data found for the selected term and type.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ParentReportCards;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Loader2, FileText, Calendar, Download } from 'lucide-react';
// // import ReportCard from './ReportCard';
// // import QAAssessment from './QAAssessment';
// import { StudentData } from '@/types';
// import { Child } from '@/types/parent';
// import {
//     fetchChildReportCards,
//     fetchChildAssessments,
//     fetchParentChildren
// } from '@/services/parentService';
// import { ParentDataTransformer } from '@/services/parentDataTransformer';
// import ReportCard from '../app/searchResults/ReportCard';
// import QAAssessment from '../app/searchResults/QAAssessment';

// // interface ParentReportCardsProps {
// //     onBack: () => void;

// // }

// interface ParentReportCardsProps {
//     onBack: () => void;
//     selectedChild: Child | null;
//     children: Child[];
//     onChildChange: (childId: string) => void;
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const ParentReportCards: React.FC<ParentReportCardsProps> = ({ onBack }) => {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [children, setChildren] = useState<Child[]>([]);
//     const [selectedChild, setSelectedChild] = useState<Child | null>(null);
//     const [reportCards, setReportCards] = useState<any[]>([]);
//     const [assessments, setAssessments] = useState<any[]>([]);
//     const [subjects, setSubjects] = useState<any[]>([]);
//     const [selectedReportType, setSelectedReportType] = useState<'overall' | 'qa1' | 'qa2' | 'endOfTerm'>('overall');
//     const [selectedTerm, setSelectedTerm] = useState<string>('');
//     const [terms, setTerms] = useState<string[]>([]);
//     const [selectedReportData, setSelectedReportData] = useState<any>(null);
//     const [loadingReport, setLoadingReport] = useState(false);

//     useEffect(() => {
//         loadParentData();
//     }, []);

//     const loadParentData = async () => {
//         setLoading(true);
//         try {
//             const userStr = localStorage.getItem('user');
//             const user = userStr ? JSON.parse(userStr) : null;

//             if (!user) {
//                 navigate('/login');
//                 return;
//             }

//             const childrenData = await fetchParentChildren(user.id);
//             const transformedChildren = childrenData.map(ParentDataTransformer.transformChild);
//             setChildren(transformedChildren);

//             if (transformedChildren.length > 0) {
//                 setSelectedChild(transformedChildren[0]);
//                 await loadChildReports(transformedChildren[0].id);
//             }

//             // Mock subjects for now - replace with actual API call
//             setSubjects([
//                 { id: '1', name: 'Mathematics' },
//                 { id: '2', name: 'English' },
//                 { id: '3', name: 'Science' },
//                 { id: '4', name: 'Social Studies' },
//                 { id: '5', name: 'Chichewa' }
//             ]);

//         } catch (error) {
//             console.error('Error loading parent data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadChildReports = async (childId: string) => {
//         try {
//             const [reportsData, assessmentsData] = await Promise.all([
//                 fetchChildReportCards(childId),
//                 fetchChildAssessments(childId)
//             ]);

//             setReportCards(reportsData);
//             setAssessments(assessmentsData);

//             // Extract unique terms
//             const uniqueTerms = [...new Set(reportsData.map((r: any) => r.term))];
//             setTerms(uniqueTerms);
//             if (uniqueTerms.length > 0 && !selectedTerm) {
//                 setSelectedTerm(uniqueTerms[0]);
//             }

//         } catch (error) {
//             console.error('Error loading child reports:', error);
//         }
//     };

//     const handleChildChange = async (childId: string) => {
//         const child = children.find(c => c.id === childId);
//         if (child) {
//             setSelectedChild(child);
//             await loadChildReports(childId);
//         }
//     };

//     useEffect(() => {
//         const loadReportData = async () => {
//             if (!selectedChild || !selectedTerm) return;

//             setLoadingReport(true);
//             try {
//                 if (selectedReportType === 'overall') {
//                     const report = reportCards.find(r => r.term === selectedTerm);
//                     if (report) {
//                         const studentData: StudentData = {
//                             name: selectedChild.name,
//                             examNumber: selectedChild.exam_number,
//                             class: selectedChild.class,  // Use 'class' not 'class_name'
//                             term: report.term,
//                             academicYear: report.academicYear,
//                             photo: selectedChild.photo_url || '',
//                             subjects: report.subjects.map((s: any) => ({
//                                 name: s.subject_name,
//                                 qa1: s.qa1 || null,
//                                 qa1_absent: s.qa1_absent || false,
//                                 qa2: s.qa2 || null,
//                                 qa2_absent: s.qa2_absent || false,
//                                 endOfTerm: s.end_of_term || null,
//                                 endOfTerm_absent: s.end_of_term_absent || false,
//                                 grade: s.final_grade,
//                                 finalScore: s.final_score
//                             })),
//                             attendance: {
//                                 present: 0,
//                                 absent: 0,
//                                 late: 0
//                             },
//                             classRank: report.rank,
//                             totalStudents: report.totalStudents,
//                             teacherRemarks: report.teacherRemarks,
//                             assessmentStats: {
//                                 qa1: { classRank: 0, termAverage: 0, overallGrade: '' },
//                                 qa2: { classRank: 0, termAverage: 0, overallGrade: '' },
//                                 // endOfTerm: {
//                                 //     classRank: report.rank,
//                                 //     termAverage: report.average,
//                                 //     overallGrade: report.subjects[0]?.final_grade || '',
//                                 //     attendance: { present: 0, absent: 0, late: 0 }
//                                 // },
//                                 endOfTerm: {
//                                     classRank: report.rank,
//                                     termAverage: report.average,
//                                     overallGrade: report.subjects[0]?.final_grade || '',
//                                     attendance: { present: 0, absent: 0 }  // ✅ only present and absent
//                                 },
//                                 overall: {
//                                     termAverage: report.average
//                                     // Remove calculationMethod
//                                 }
//                             }
//                         };
//                         setSelectedReportData(studentData);
//                     }
//                 } else {
//                     const filteredAssessments = assessments.filter(a => a.type === selectedReportType);

//                     const studentData: StudentData = {
//                         name: selectedChild.name,
//                         examNumber: selectedChild.exam_number,
//                         class: selectedChild.class,  // Use 'class' not 'class_name'
//                         term: selectedTerm,
//                         academicYear: selectedChild.academic_year || '',
//                         photo: selectedChild.photo_url || '',
//                         subjects: subjects.map(sub => {
//                             const assessment = filteredAssessments.find((a: any) => a.subject === sub.name);
//                             return {
//                                 name: sub.name,
//                                 qa1: selectedReportType === 'qa1' ? assessment?.score || null : null,
//                                 qa1_absent: selectedReportType === 'qa1' ? assessment?.is_absent || false : false,
//                                 qa2: selectedReportType === 'qa2' ? assessment?.score || null : null,
//                                 qa2_absent: selectedReportType === 'qa2' ? assessment?.is_absent || false : false,
//                                 endOfTerm: selectedReportType === 'endOfTerm' ? assessment?.score || null : null,
//                                 endOfTerm_absent: selectedReportType === 'endOfTerm' ? assessment?.is_absent || false : false,
//                                 grade: assessment?.grade || 'N/A',
//                                 finalScore: assessment?.score || 0
//                             };
//                         }),
//                         attendance: { present: 0, absent: 0, late: 0 },
//                         classRank: 0,
//                         totalStudents: 0,
//                         teacherRemarks: '',
//                         assessmentStats: {
//                             qa1: { classRank: 0, termAverage: 0, overallGrade: '' },
//                             qa2: { classRank: 0, termAverage: 0, overallGrade: '' },
//                             // endOfTerm: {
//                             //     classRank: 0,
//                             //     termAverage: 0,
//                             //     overallGrade: '',
//                             //     attendance: { present: 0, absent: 0, late: 0 }
//                             // },
//                             endOfTerm: {
//                                 classRank: 0,
//                                 termAverage: 0,
//                                 overallGrade: '',
//                                 attendance: { present: 0, absent: 0 }  // ✅ correct
//                             },
//                             overall: {
//                                 termAverage: 0
//                             }
//                         }
//                     };
//                     setSelectedReportData(studentData);
//                 }
//             } catch (error) {
//                 console.error('Error loading report data:', error);
//             } finally {
//                 setLoadingReport(false);
//             }
//         };

//         loadReportData();
//     }, [selectedTerm, selectedReportType, selectedChild, reportCards, assessments, subjects]);
//     if (loading) {
//         return (
//             <div className="min-h-screen bg-slate-100 flex items-center justify-center">
//                 <div className="text-center">
//                     <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
//                     <p className="text-slate-600">Loading reports...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (reportCards.length === 0 && assessments.length === 0) {
//         return (
//             <div className="min-h-screen bg-slate-100 p-6">
//                 {/* <button
//                     onClick={onBack}
//                     className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
//                 >
//                     <ArrowLeft className="w-5 h-5" />
//                     Back
//                 </button> */}
//                 <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto">
//                     <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                     <h3 className="text-xl font-semibold text-slate-700 mb-2">No Reports Available</h3>
//                     <p className="text-slate-500">Report cards will appear here once they are published.</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-slate-100 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header with back button */}
//                 <div className="flex items-center justify-between mb-6">
//                     <button
//                         onClick={onBack}
//                         className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
//                     >
//                         <ArrowLeft className="w-5 h-5" />
//                         Back to Dashboard
//                     </button>

//                     <div className="flex items-center gap-3">
//                         <span className="text-sm font-medium text-slate-600">Student:</span>
//                         <select
//                             value={selectedChild?.id || ''}
//                             onChange={(e) => handleChildChange(e.target.value)}
//                             className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                         >
//                             {children.map(child => (
//                                 <option key={child.id} value={child.id}>
//                                     {child.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>

//                 {/* Report Selection Header */}
//                 <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6">
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                         <div>
//                             <h1 className="text-2xl font-bold text-slate-800">Academic Reports</h1>
//                             <p className="text-sm text-slate-500 mt-1">View your child's performance reports</p>
//                         </div>

//                         {/* Term Selector */}
//                         {terms.length > 0 && (
//                             <div className="flex items-center gap-3">
//                                 <Calendar className="w-5 h-5 text-indigo-500" />
//                                 <select
//                                     value={selectedTerm}
//                                     onChange={(e) => setSelectedTerm(e.target.value)}
//                                     className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                                 >
//                                     {terms.map(term => (
//                                         <option key={term} value={term}>{term}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}
//                     </div>

//                     {/* Report Type Tabs */}
//                     <div className="flex gap-2 mt-6 border-b border-slate-200">
//                         <button
//                             onClick={() => setSelectedReportType('overall')}
//                             className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'overall'
//                                 ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                 : 'text-slate-500 hover:text-slate-700'
//                                 }`}
//                         >
//                             Overall Report
//                         </button>
//                         <button
//                             onClick={() => setSelectedReportType('qa1')}
//                             className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'qa1'
//                                 ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                 : 'text-slate-500 hover:text-slate-700'
//                                 }`}
//                         >
//                             Quarterly Assessment 1
//                         </button>
//                         <button
//                             onClick={() => setSelectedReportType('qa2')}
//                             className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'qa2'
//                                 ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                 : 'text-slate-500 hover:text-slate-700'
//                                 }`}
//                         >
//                             Quarterly Assessment 2
//                         </button>
//                         <button
//                             onClick={() => setSelectedReportType('endOfTerm')}
//                             className={`px-6 py-3 font-medium text-sm transition-colors relative ${selectedReportType === 'endOfTerm'
//                                 ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                 : 'text-slate-500 hover:text-slate-700'
//                                 }`}
//                         >
//                             End of Term
//                         </button>
//                     </div>
//                 </div>

//                 {/* Report Display Area */}
//                 {loadingReport ? (
//                     <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//                         <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
//                         <p className="text-slate-600">Loading report data...</p>
//                     </div>
//                 ) : selectedReportData ? (
//                     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//                         {selectedReportType === 'overall' ? (
//                             <ReportCard
//                                 studentData={selectedReportData}
//                                 showActions={true}
//                             />
//                         ) : (
//                             <QAAssessment
//                                 studentData={selectedReportData}
//                                 activeTab={selectedReportType}
//                                 showPDFOnly={false}
//                             />
//                         )}
//                     </div>
//                 ) : (
//                     <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
//                         <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                         <h3 className="text-lg font-semibold text-slate-700 mb-2">No Data Available</h3>
//                         <p className="text-slate-500">No report data found for the selected term and type.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ParentReportCards;