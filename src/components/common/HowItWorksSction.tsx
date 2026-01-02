import React from 'react';

const HowItWorksSection: React.FC = () => {
    return (
        <section className="bg-slate-100 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">How It Works</h3>
                    <p className="text-slate-600">Simple steps to access your child's academic results</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">1</div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">Enter Exam Number</h4>
                        <p className="text-slate-500">Type your child's unique exam number in the search box above.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">2</div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">View Results</h4>
                        <p className="text-slate-500">Browse through quarterly assessments and end of term results.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">3</div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">Download Report</h4>
                        <p className="text-slate-500">Print or download the complete report card for your records.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;