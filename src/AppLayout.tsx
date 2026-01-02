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

const AppLayout: React.FC = () => {
    const [examNumber, setExamNumber] = useState('');
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('qa1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!examNumber.trim()) return;

        setIsLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const data = await fetchStudentByExamNumber(examNumber);
            if (data) {
                setStudentData(data);
                setError('');
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
        return <AdminPanel onBack={() => setShowAdmin(false)} />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header onShowAdmin={() => setShowAdmin(true)}

            />

            <HeroSection
                examNumber={examNumber}
                setExamNumber={setExamNumber}
                isLoading={isLoading}
                handleSearch={handleSearch}
            />

            {hasSearched && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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

            {!hasSearched && (
                <>
                    <FeaturesSection />
                    <HowItWorksSection />
                </>
            )}

            <Footer />
        </div>
    );
};

export default AppLayout;