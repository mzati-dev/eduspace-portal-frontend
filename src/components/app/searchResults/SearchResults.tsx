import React from 'react';
import { StudentData } from '@/types';
import { TabType } from '@/types/app';
import StudentInfo from './StudentInfo';
import AssessmentTabs from './AssessmentTabs';
import QAAssessment from './QAAssessment';
import ReportCard from './ReportCard';


interface SearchResultsProps {
    studentData: StudentData;
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    onPrint: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
    studentData,
    activeTab,
    setActiveTab,
    onPrint
}) => {
    return (
        <div className="space-y-6">
            <StudentInfo studentData={studentData} />

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <AssessmentTabs activeTab={activeTab} setActiveTab={setActiveTab} studentData={studentData} />

                <div className="p-6">
                    {(activeTab === 'qa1' || activeTab === 'qa2' || activeTab === 'endOfTerm') && (
                        <QAAssessment
                            studentData={studentData}
                            activeTab={activeTab}
                        />
                    )}

                    {activeTab === 'reportCard' && (
                        <ReportCard
                            studentData={studentData}
                            onPrint={onPrint}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;