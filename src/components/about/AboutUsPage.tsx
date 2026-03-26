import React from 'react';
import { Target, Users, BookOpen, Award, Globe, Heart, ChevronRight } from 'lucide-react';
import Header from '../common/Header';
import Footer from '../common/Footer';

const AboutUsPage: React.FC = () => {
    const values = [
        { icon: Target, title: 'Mission', description: 'To provide seamless access to academic results and empower parents, teachers, and schools with real-time educational data.' },
        { icon: Users, title: 'Who We Are', description: 'Mzatinova EduSpace is dedicated to bridging the gap between schools and families through technology.' },
        { icon: BookOpen, title: 'What We Do', description: 'We offer a centralized platform where parents can view results, teachers can manage scores, and schools can track performance.' },
        { icon: Award, title: 'Our Vision', description: 'To become the leading educational portal in Africa, making every child\'s academic journey transparent and accessible.' },
        { icon: Globe, title: 'Our Reach', description: 'Serving schools across Malawi and expanding to provide quality education tools to institutions everywhere.' },
        { icon: Heart, title: 'Our Commitment', description: 'We are committed to data security, reliability, and supporting educators in shaping future leaders.' }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Header onShowAdmin={() => { }} />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About EduSpace Portal</h1>
                    <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
                        Empowering education through technology
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Introduction */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">A Window to Academic Success</h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        EduSpace Portal is more than just a results checker. It's a complete ecosystem connecting
                        parents, teachers, and schools to ensure every child's academic journey is supported and celebrated.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {values.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-slate-600">{item.description}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Stats Section */}
                <div className="bg-indigo-50 rounded-2xl p-8 mb-12">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-bold text-indigo-600 mb-2">1</p>
                            <p className="text-slate-600">School</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-indigo-600 mb-2">187+</p>
                            <p className="text-slate-600">Students</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-indigo-600 mb-2">12+</p>
                            <p className="text-slate-600">Teachers</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to get started?</h3>
                    <p className="text-indigo-100 mb-6">Join the growing community of schools using EduSpace Portal</p>
                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                        Contact Us
                        <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutUsPage;