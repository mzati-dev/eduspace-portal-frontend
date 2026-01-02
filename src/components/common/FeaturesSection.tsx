import React from 'react';
import { FileText, Award, BookOpen } from 'lucide-react';

const FeaturesSection: React.FC = () => {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">What You Can View</h3>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    Access comprehensive academic information for your child with just their exam number.
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Quarterly Assessment 1</h4>
                    <p className="text-slate-500 text-sm">
                        View scores from the first quarterly assessment with subject-wise breakdown.
                    </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Quarterly Assessment 2</h4>
                    <p className="text-slate-500 text-sm">
                        Access the second quarterly assessment results and track progress.
                    </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">End of Term Exam</h4>
                    <p className="text-slate-500 text-sm">
                        View comprehensive end of term examination results and grades.
                    </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-rose-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Full Report Card</h4>
                    <p className="text-slate-500 text-sm">
                        Complete term report with all assessments, attendance, and teacher remarks.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;