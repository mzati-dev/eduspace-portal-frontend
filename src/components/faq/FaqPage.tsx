import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search, HelpCircle } from 'lucide-react';
import Header from '../common/Header';
import Footer from '../common/Footer';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const FaqPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const faqs: FAQItem[] = [
        // Parents
        { question: 'How do I search for my child\'s results?', answer: 'Enter your child\'s exam number in the search box on the homepage and click "View Results". Make sure to use dashes (-) not underscores (_).', category: 'parents' },
        { question: 'What is the correct format for exam numbers?', answer: 'Exam numbers should be in this format: 6cf-26-0101. Use dashes (-) between sections, not underscores (_).', category: 'parents' },
        { question: 'I can\'t find my child\'s results - what should I do?', answer: 'First verify the exam number is correct. If it still doesn\'t work, contact your child\'s school to confirm the number and that results have been uploaded.', category: 'parents' },
        { question: 'How often are results updated?', answer: 'Results are updated as teachers enter them. Check with your school for specific timelines.', category: 'parents' },
        { question: 'Can I download report cards?', answer: 'Yes! After searching, click the print button to download or print your child\'s report card.', category: 'parents' },
        { question: 'Do I need to create an account to view results?', answer: 'No, you can search results without an account. However, creating an account allows you to view all your children in one place and receive notifications.', category: 'parents' },
        { question: 'How do I login to see all my children?', answer: 'Click "Login" on the homepage, enter your email and password. Once logged in, you can view all children linked to your account.', category: 'parents' },

        // Schools/Teachers
        { question: 'How does my school get added to the portal?', answer: 'Schools are added when they subscribe to EduSpace Portal. Contact us to get your school onboarded.', category: 'schools' },
        { question: 'How do teachers enter results?', answer: 'After logging in, teachers can enter results through their dashboard by selecting the class and subject.', category: 'schools' },
        { question: 'How are grades calculated?', answer: 'Grades are calculated based on the school\'s configured grading system. Schools can customize their grade boundaries.', category: 'schools' },
        { question: 'What is the ranking system?', answer: 'Ranks are automatically calculated based on student performance across all subjects for each assessment period.', category: 'schools' },
        { question: 'Who can access the school portal?', answer: 'School admins and teachers have access based on their assigned roles and permissions.', category: 'schools' },
        { question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page and follow the instructions to reset your password.', category: 'schools' },

        // General
        { question: 'Is the portal free for parents?', answer: 'Yes! Parents can search results and view report cards for free. Schools pay a subscription fee.', category: 'general' },
        { question: 'How do I contact support?', answer: 'You can reach us via WhatsApp at +265 999 613 324 or email support@eduspaceportal.com', category: 'general' },
        { question: 'What browsers work best?', answer: 'EduSpace Portal works best on modern browsers like Chrome, Firefox, Safari, and Edge.', category: 'general' },
        { question: 'Is my data secure?', answer: 'Yes, we take data security seriously. All data is encrypted and access is strictly controlled.', category: 'general' }
    ];

    const categories = [
        { id: 'all', name: 'All Questions' },
        { id: 'parents', name: 'For Parents' },
        { id: 'schools', name: 'For Schools & Teachers' },
        { id: 'general', name: 'General' }
    ];

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header onShowAdmin={() => { }} />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <HelpCircle className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                        Find answers to common questions about EduSpace Portal
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No questions found matching your search.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredFaqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-medium text-slate-800">{faq.question}</span>
                                    {openIndex === index ? (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    )}
                                </button>
                                {openIndex === index && (
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                                        <p className="text-slate-600">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Still Need Help */}
                <div className="mt-12 bg-indigo-50 rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Still have questions?</h3>
                    <p className="text-slate-600 mb-6">We're here to help you</p>
                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Contact Support
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default FaqPage;