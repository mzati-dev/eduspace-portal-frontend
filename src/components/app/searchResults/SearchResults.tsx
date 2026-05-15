import React from 'react';
import { StudentData } from '@/types';
import QAAssessment from './QAAssessment';
import ReportCard from './ReportCard';

interface SearchResultsProps {
    studentData: StudentData;
    onPrint: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
    studentData,
    onPrint
}) => {
    // Check if results are locked
    if (studentData.resultsLocked) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden p-8">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-3">Results Withheld</h2>
                    <p className="text-slate-600 mb-4">{studentData.message}</p>
                    <div className="bg-slate-50 p-4 rounded-lg max-w-md mx-auto">
                        <p className="text-sm text-slate-500">Student: {studentData.name}</p>
                        <p className="text-sm text-slate-500">Exam No: {studentData.examNumber}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Get published assessment type
    const reportCard = studentData.reportCards?.[0];

    // If End Term is published, show ONLY Report Card
    if (reportCard?.endOfTerm_published) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
                    <div className="p-6">
                        <ReportCard
                            studentData={studentData}
                            onPrint={onPrint}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise, show QA1 or QA2 if published
    // let activeView: 'qa1' | 'qa2' | null = null;

    // if (reportCard?.qa2_published) {
    //     activeView = 'qa2';
    // } else if (reportCard?.qa1_published) {
    //     activeView = 'qa1';
    // }

    //TEMPORARILY SHOW QA1 OR QA2 IF END OF TERM NOT PUBLISHED (FOR TESTING PURPOSES)
    let activeView: 'qa1' | 'qa2' | null = 'qa1';

    // If nothing published, show message
    if (!activeView) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden p-8">
                <div className="text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📢</span>
                    </div>
                    <h2 className="text-2xl font-bold text-amber-600 mb-3">No Results Published Yet</h2>
                    <p className="text-slate-600">
                        Results are being processed. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    // Show QA1 or QA2 results
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
                <div className="p-6">
                    <QAAssessment
                        studentData={studentData}
                        activeTab={activeView}
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchResults;

// import React from 'react';
// import { StudentData } from '@/types';
// import QAAssessment from './QAAssessment';

// interface SearchResultsProps {
//     studentData: StudentData;
//     onPrint: () => void;
// }

// const SearchResults: React.FC<SearchResultsProps> = ({
//     studentData,
//     onPrint
// }) => {
//     // Check if results are locked
//     if (studentData.resultsLocked) {
//         return (
//             <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden p-8">
//                 <div className="text-center">
//                     <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                         <span className="text-3xl">🔒</span>
//                     </div>
//                     <h2 className="text-2xl font-bold text-red-600 mb-3">Results Withheld</h2>
//                     <p className="text-slate-600 mb-4">{studentData.message}</p>
//                     <div className="bg-slate-50 p-4 rounded-lg max-w-md mx-auto">
//                         <p className="text-sm text-slate-500">Student: {studentData.name}</p>
//                         <p className="text-sm text-slate-500">Exam No: {studentData.examNumber}</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // Get published assessment type
//     const reportCard = studentData.reportCards?.[0];
//     let activeView: 'qa1' | 'qa2' | 'endOfTerm' | null = null;

//     if (reportCard) {
//         if (reportCard.endOfTerm_published) {
//             activeView = 'endOfTerm';
//         } else if (reportCard.qa2_published) {
//             activeView = 'qa2';
//         } else if (reportCard.qa1_published) {
//             activeView = 'qa1';
//         }
//     }

//     // If nothing published, show message
//     if (!activeView) {
//         return (
//             <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden p-8">
//                 <div className="text-center">
//                     <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                         <span className="text-3xl">📢</span>
//                     </div>
//                     <h2 className="text-2xl font-bold text-amber-600 mb-3">No Results Published Yet</h2>
//                     <p className="text-slate-600">
//                         Results are being processed. Please check back later.
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     // Show only the published assessment (NO Report Card)
//     return (
//         <div className="space-y-6">
//             <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
//                 <div className="p-6">
//                     <QAAssessment
//                         studentData={studentData}
//                         activeTab={activeView}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SearchResults;

// // export default SearchResults;

// import React from 'react';
// import { StudentData } from '@/types';
// import { TabType } from '@/types/app';
// import StudentInfo from './StudentInfo';
// import AssessmentTabs from './AssessmentTabs';
// import QAAssessment from './QAAssessment';
// import ReportCard from './ReportCard';

// interface SearchResultsProps {
//     studentData: StudentData;
//     activeTab: TabType;
//     setActiveTab: (tab: TabType) => void;
//     onPrint: () => void;
// }

// const SearchResults: React.FC<SearchResultsProps> = ({
//     studentData,
//     activeTab,
//     setActiveTab,
//     onPrint
// }) => {
//     // ADD THIS BLOCK HERE - right after the function opening
//     if (studentData.resultsLocked) {
//         return (
//             <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden p-8">
//                 <div className="text-center">
//                     <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                         <span className="text-3xl">🔒</span>
//                     </div>
//                     <h2 className="text-2xl font-bold text-red-600 mb-3">Results Withheld</h2>
//                     <p className="text-slate-600 mb-4">{studentData.message}</p>
//                     <div className="bg-slate-50 p-4 rounded-lg max-w-md mx-auto">
//                         <p className="text-sm text-slate-500">Student: {studentData.name}</p>
//                         <p className="text-sm text-slate-500">Exam No: {studentData.examNumber}</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
//     return (
//         <div className="space-y-6">
//             {/* <StudentInfo studentData={studentData} /> */}

//             {/* FIXED: Removed 'overflow-hidden' from here. It was blocking the sticky effect! */}
//             <div className="bg-white rounded-2xl shadow-lg border border-slate-200">

//                 {/* FIXED: This is now tight to the header (top-[60px]).
//                   If it overlaps your header slightly, change 60 to 65 or 70.
//                   Added rounded-t-2xl so the top corners stay perfectly curved.
//                 */}
//                 <div className="sticky top-[60px] z-40 bg-white rounded-t-2xl">
//                     <AssessmentTabs activeTab={activeTab} setActiveTab={setActiveTab} studentData={studentData} />
//                 </div>

//                 <div className="p-6">
//                     {(activeTab === 'qa1' || activeTab === 'qa2' || activeTab === 'endOfTerm') && (
//                         <QAAssessment
//                             studentData={studentData}
//                             activeTab={activeTab}
//                         />
//                     )}

//                     {activeTab === 'reportCard' && (
//                         <ReportCard
//                             studentData={studentData}
//                             onPrint={onPrint}
//                         />
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SearchResults;