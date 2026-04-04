import React, { useState } from 'react';
import { fetchStudentByExamNumber, StudentData } from '@/services/studentService';
import AdminPanel from './AdminPanel';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HeroSection from './components/common/HeroSection';
import FeaturesSection from './components/common/FeaturesSection';

import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';

import { TabType } from './types/app';
import HowItWorksSection from './components/common/HowItWorksSction';
import SearchResults from './components/app/searchResults/SearchResults';

export type ViewState = 'search' | 'results' | 'contact';

const AppLayout: React.FC = () => {
    const [examNumber, setExamNumber] = useState('');
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('qa1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);

    // ADDED: Minimal states for the Header tabs
    const [hasSuccessfulSearch, setHasSuccessfulSearch] = useState(false);
    const [currentView, setCurrentView] = useState<ViewState>('search');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!examNumber.trim()) return;

        setIsLoading(true);
        setError('');
        setHasSearched(true);

        // ADDED: Switch to results tab automatically when searching
        setCurrentView('results');

        try {
            const data = await fetchStudentByExamNumber(examNumber);
            if (data) {
                setStudentData(data);
                setError('');
                // ADDED: Unlock the Results tab in the header
                setHasSuccessfulSearch(true);
            } else {
                setStudentData(null);
                setError('No student found with this exam number. Please check and try again.');
            }
        } catch (err) {
            console.error('Error fetching student:', err);
            setStudentData(null);
            setError('An error occurred while fetching results. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (showAdmin) {
        return <AdminPanel onBack={() => {
            setShowAdmin(false);
            // ADDED: Resetting header state if they return from Admin/Login
            setHasSuccessfulSearch(false);
            setCurrentView('search');
        }} />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ADDED: Props passed to Header for routing */}
            <Header
                onShowAdmin={() => setShowAdmin(true)}
                hasSuccessfulSearch={hasSuccessfulSearch}
                currentView={currentView}
                onNavigate={(view: ViewState) => setCurrentView(view)}
            />

            {/* YOUR EXACT CODE: Wrapped for Search view */}
            {currentView === 'search' && (
                <>
                    <HeroSection
                        examNumber={examNumber}
                        setExamNumber={setExamNumber}
                        isLoading={isLoading}
                        handleSearch={handleSearch}
                    />

                    {!hasSearched && (
                        <>
                            <FeaturesSection />
                            <HowItWorksSection />
                        </>
                    )}
                </>
            )}

            {/* YOUR EXACT CODE: Wrapped for Results view */}
            {currentView === 'results' && hasSearched && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
                    {isLoading ? (
                        <LoadingSpinner message="Loading results..." />
                    ) : error ? (
                        <ErrorMessage error={error} />
                    ) : studentData ? (
                        <SearchResults
                            studentData={studentData}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            onPrint={handlePrint}
                        />
                    ) : null}
                </section>
            )}

            {/* ADDED: Simple placeholder for Contact view */}
            {currentView === 'contact' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-center">
                    <h2 className="text-3xl font-bold text-slate-800">Contact Information</h2>
                    <p className="mt-4 text-slate-600">Please reach out to administration.</p>
                </section>
            )}

            <Footer />
        </div>
    );
};

export default AppLayout;

// import React, { useState } from 'react';
// import { fetchStudentByExamNumber, StudentData } from '@/services/studentService';
// import AdminPanel from './AdminPanel';
// import Header from './components/common/Header';
// import Footer from './components/common/Footer';
// import HeroSection from './components/common/HeroSection';
// import FeaturesSection from './components/common/FeaturesSection';

// import LoadingSpinner from './components/common/LoadingSpinner';
// import ErrorMessage from './components/common/ErrorMessage';

// import { TabType } from './types/app';
// import HowItWorksSection from './components/common/HowItWorksSction';
// import SearchResults from './components/app/searchResults/SearchResults';

// const AppLayout: React.FC = () => {
//     const [examNumber, setExamNumber] = useState('');
//     const [studentData, setStudentData] = useState<StudentData | null>(null);
//     const [activeTab, setActiveTab] = useState<TabType>('qa1');
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [hasSearched, setHasSearched] = useState(false);
//     const [showAdmin, setShowAdmin] = useState(false);


//     const handleSearch = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!examNumber.trim()) return;

//         setIsLoading(true);
//         setError('');
//         setHasSearched(true);

//         try {
//             const data = await fetchStudentByExamNumber(examNumber);
//             if (data) {
//                 setStudentData(data);
//                 setError('');
//             } else {
//                 setStudentData(null);
//                 setError('No student found with this exam number. Please check and try again.');
//             }
//         } catch (err) {
//             console.error('Error fetching student:', err);
//             setStudentData(null);
//             setError('An error occurred while fetching results. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     if (showAdmin) {
//         return <AdminPanel onBack={() => setShowAdmin(false)} />;
//     }

//     return (
//         <div className="min-h-screen bg-slate-50">
//             <Header onShowAdmin={() => setShowAdmin(true)}

//             />

//             <HeroSection
//                 examNumber={examNumber}
//                 setExamNumber={setExamNumber}
//                 isLoading={isLoading}
//                 handleSearch={handleSearch}
//             />

//             {hasSearched && (
//                 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
//                     {isLoading ? (
//                         <LoadingSpinner message="Loading results..." />
//                     ) : error ? (
//                         <ErrorMessage error={error} />
//                     ) : studentData ? (
//                         <SearchResults
//                             studentData={studentData}
//                             activeTab={activeTab}
//                             setActiveTab={setActiveTab}
//                             onPrint={handlePrint}
//                         />
//                     ) : null}
//                 </section>
//             )}

//             {!hasSearched && (
//                 <>
//                     <FeaturesSection />
//                     <HowItWorksSection />
//                 </>
//             )}

//             <Footer />
//         </div>
//     );
// };

// export default AppLayout;