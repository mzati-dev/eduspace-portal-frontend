// src/components/common/ContactPage.tsx
import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Building, Clock } from 'lucide-react';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import Header from './Header';
import Footer from './Footer';

const ContactPage: React.FC = () => {
    const { school, loading } = useSchoolBranding();
    const isCustomized = !!school;

    // Dummy props for Header (since Contact page doesn't need search/results logic)
    const dummyProps = {
        onShowAdmin: () => {},
        hasSuccessfulSearch: false,
        currentView: 'contact' as const,
        onNavigate: () => {}
    };

    if (loading) {
        return (
            <>
                <Header {...dummyProps} />
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="h-64 bg-gray-200 rounded"></div>
                                <div className="h-64 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // CUSTOMIZED VERSION (School Contact Page)
    if (isCustomized) {
        return (
            <>
                <Header {...dummyProps} />
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-slate-800 mb-4">
                                Contact {school.name}
                            </h1>
                            <p className="text-slate-500 max-w-2xl mx-auto">
                                Get in touch with the school administration for any questions about grades, 
                                student records, or school matters.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-indigo-100 rounded-xl">
                                        <Building className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800">School Office</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone className="w-5 h-5 text-indigo-500" />
                                        <span>{school.phone || "+265 123 456 789"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Mail className="w-5 h-5 text-indigo-500" />
                                        <a href={`mailto:${school.email || "admin@school.com"}`} className="hover:text-indigo-600">
                                            {school.email || "admin@school.com"}
                                        </a>
                                    </div>
                                    {school.address && (
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <MapPin className="w-5 h-5 text-indigo-500" />
                                            <span>{school.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="w-5 h-5 text-indigo-500" />
                                        <h3 className="font-semibold text-slate-700">Office Hours</h3>
                                    </div>
                                    <p className="text-slate-500 text-sm">
                                        Monday - Friday: 8:00 AM - 4:00 PM<br />
                                        Saturday: 9:00 AM - 12:00 PM<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <MessageCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800">Portal Support</h2>
                                </div>
                                
                                <p className="text-slate-500 mb-4">
                                    For technical issues like password reset, login problems, or portal errors:
                                </p>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <MessageCircle className="w-5 h-5 text-green-500" />
                                        <span>WhatsApp: +265 999 613 324</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Mail className="w-5 h-5 text-indigo-500" />
                                        <a href="mailto:support@mzatinova.com" className="hover:text-indigo-600">
                                            support@mzatinova.com
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-500">
                                        <strong>Response time:</strong> Within 24 hours on business days
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <a
                                href="https://api.whatsapp.com/send?phone=265999613324"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Message Us on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // PUBLIC VERSION (Potential Buyers)
    return (
        <>
            <Header {...dummyProps} />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-800 mb-4">
                            Contact EduSpace
                        </h1>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            Have questions about EduSpace? Want to schedule a demo? We're here to help.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <Building className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">General Inquiries</h2>
                            </div>
                            
                            <p className="text-slate-500 mb-4">
                                For questions about EduSpace, pricing, or partnerships:
                            </p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone className="w-5 h-5 text-indigo-500" />
                                    <span>+265 999 613 324</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="w-5 h-5 text-indigo-500" />
                                    <a href="mailto:hello@mzatinova.com" className="hover:text-indigo-600">
                                        hello@mzatinova.com
                                    </a>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin className="w-5 h-5 text-indigo-500" />
                                    <span>Lilongwe, Malawi</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <MessageCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Request Demo</h2>
                            </div>
                            
                            <p className="text-slate-500 mb-4">
                                Ready to see EduSpace in action? Schedule a free demo:
                            </p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MessageCircle className="w-5 h-5 text-green-500" />
                                    <span>WhatsApp: +265 999 613 324</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="w-5 h-5 text-indigo-500" />
                                    <a href="mailto:sales@mzatinova.com" className="hover:text-indigo-600">
                                        sales@mzatinova.com
                                    </a>
                                </div>
                            </div>

                            <a
                                href="https://api.whatsapp.com/send?phone=265999613324"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 max-w-2xl mx-auto">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Technical Support</h3>
                            <p className="text-slate-500 mb-4">
                                For schools already using EduSpace:
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a href="mailto:support@mzatinova.com" className="text-indigo-600 hover:text-indigo-700">
                                    support@mzatinova.com
                                </a>
                                <span className="text-slate-300 hidden sm:inline">|</span>
                                <a href="https://api.whatsapp.com/send?phone=265999613324" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                                    WhatsApp: +265 999 613 324
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ContactPage;

// // src/components/common/ContactPage.tsx
// import React from 'react';
// import { Phone, Mail, MapPin, MessageCircle, Building, Globe, Clock } from 'lucide-react';
// import { useSchoolBranding } from '@/hooks/useSchoolBranding';

// const ContactPage: React.FC = () => {
//     const { school, loading } = useSchoolBranding();
//     const isCustomized = !!school;

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="animate-pulse">
//                         <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
//                         <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
//                         <div className="grid md:grid-cols-2 gap-8">
//                             <div className="h-64 bg-gray-200 rounded"></div>
//                             <div className="h-64 bg-gray-200 rounded"></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // ============================================
//     // CUSTOMIZED VERSION (School Contact Page)
//     // ============================================
//     if (isCustomized) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
//                     {/* Header */}
//                     <div className="text-center mb-12">
//                         <h1 className="text-4xl font-bold text-slate-800 mb-4">
//                             Contact {school.name}
//                         </h1>
//                         <p className="text-slate-500 max-w-2xl mx-auto">
//                             Get in touch with the school administration for any questions about grades, 
//                             student records, or school matters.
//                         </p>
//                     </div>

//                     {/* Two Column Layout */}
//                     <div className="grid md:grid-cols-2 gap-8 mb-12">
                        
//                         {/* School Contact Info */}
//                         <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
//                             <div className="flex items-center gap-3 mb-6">
//                                 <div className="p-3 bg-indigo-100 rounded-xl">
//                                     <Building className="w-6 h-6 text-indigo-600" />
//                                 </div>
//                                 <h2 className="text-2xl font-bold text-slate-800">School Office</h2>
//                             </div>
                            
//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-3 text-slate-600">
//                                     <Phone className="w-5 h-5 text-indigo-500" />
//                                     <span>{school.phone || "+265 123 456 789"}</span>
//                                 </div>
//                                 <div className="flex items-center gap-3 text-slate-600">
//                                     <Mail className="w-5 h-5 text-indigo-500" />
//                                     <a href={`mailto:${school.email || "admin@school.com"}`} className="hover:text-indigo-600">
//                                         {school.email || "admin@school.com"}
//                                     </a>
//                                 </div>
//                                 {school.address && (
//                                     <div className="flex items-center gap-3 text-slate-600">
//                                         <MapPin className="w-5 h-5 text-indigo-500" />
//                                         <span>{school.address}</span>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="mt-6 pt-6 border-t border-slate-100">
//                                 <div className="flex items-center gap-3 mb-2">
//                                     <Clock className="w-5 h-5 text-indigo-500" />
//                                     <h3 className="font-semibold text-slate-700">Office Hours</h3>
//                                 </div>
//                                 <p className="text-slate-500 text-sm">
//                                     Monday - Friday: 8:00 AM - 4:00 PM<br />
//                                     Saturday: 9:00 AM - 12:00 PM<br />
//                                     Sunday: Closed
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Technical Support */}
//                         <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
//                             <div className="flex items-center gap-3 mb-6">
//                                 <div className="p-3 bg-green-100 rounded-xl">
//                                     <MessageCircle className="w-6 h-6 text-green-600" />
//                                 </div>
//                                 <h2 className="text-2xl font-bold text-slate-800">Portal Support</h2>
//                             </div>
                            
//                             <p className="text-slate-500 mb-4">
//                                 For technical issues like password reset, login problems, or portal errors:
//                             </p>
                            
//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-3 text-slate-600">
//                                     <MessageCircle className="w-5 h-5 text-green-500" />
//                                     <span>WhatsApp: +265 999 613 324</span>
//                                 </div>
//                                 <div className="flex items-center gap-3 text-slate-600">
//                                     <Mail className="w-5 h-5 text-indigo-500" />
//                                     <a href="mailto:support@mzatinova.com" className="hover:text-indigo-600">
//                                         support@mzatinova.com
//                                     </a>
//                                 </div>
//                             </div>

//                             <div className="mt-6 p-4 bg-slate-50 rounded-lg">
//                                 <p className="text-sm text-slate-500">
//                                     <strong>Response time:</strong> Within 24 hours on business days
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* WhatsApp Button */}
//                     <div className="text-center">
//                         <a
//                             href="https://api.whatsapp.com/send?phone=265999613324"
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
//                         >
//                             <MessageCircle className="w-5 h-5" />
//                             Message Us on WhatsApp
//                         </a>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // ============================================
//     // PUBLIC VERSION (Potential Buyers)
//     // ============================================
//     return (
//         <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
//                 {/* Header */}
//                 <div className="text-center mb-12">
//                     <h1 className="text-4xl font-bold text-slate-800 mb-4">
//                         Contact EduSpace
//                     </h1>
//                     <p className="text-slate-500 max-w-2xl mx-auto">
//                         Have questions about EduSpace? Want to schedule a demo? We're here to help.
//                     </p>
//                 </div>

//                 {/* Two Column Layout */}
//                 <div className="grid md:grid-cols-2 gap-8 mb-12">
                    
//                     {/* Sales & General Inquiries */}
//                     <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
//                         <div className="flex items-center gap-3 mb-6">
//                             <div className="p-3 bg-indigo-100 rounded-xl">
//                                 <Building className="w-6 h-6 text-indigo-600" />
//                             </div>
//                             <h2 className="text-2xl font-bold text-slate-800">General Inquiries</h2>
//                         </div>
                        
//                         <p className="text-slate-500 mb-4">
//                             For questions about EduSpace, pricing, or partnerships:
//                         </p>
                        
//                         <div className="space-y-4">
//                             <div className="flex items-center gap-3 text-slate-600">
//                                 <Phone className="w-5 h-5 text-indigo-500" />
//                                 <span>+265 999 613 324</span>
//                             </div>
//                             <div className="flex items-center gap-3 text-slate-600">
//                                 <Mail className="w-5 h-5 text-indigo-500" />
//                                 <a href="mailto:hello@mzatinova.com" className="hover:text-indigo-600">
//                                     hello@mzatinova.com
//                                 </a>
//                             </div>
//                             <div className="flex items-center gap-3 text-slate-600">
//                                 <MapPin className="w-5 h-5 text-indigo-500" />
//                                 <span>Lilongwe, Malawi</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Sales/Demo */}
//                     <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
//                         <div className="flex items-center gap-3 mb-6">
//                             <div className="p-3 bg-green-100 rounded-xl">
//                                 <MessageCircle className="w-6 h-6 text-green-600" />
//                             </div>
//                             <h2 className="text-2xl font-bold text-slate-800">Request Demo</h2>
//                         </div>
                        
//                         <p className="text-slate-500 mb-4">
//                             Ready to see EduSpace in action? Schedule a free demo:
//                         </p>
                        
//                         <div className="space-y-4">
//                             <div className="flex items-center gap-3 text-slate-600">
//                                 <MessageCircle className="w-5 h-5 text-green-500" />
//                                 <span>WhatsApp: +265 999 613 324</span>
//                             </div>
//                             <div className="flex items-center gap-3 text-slate-600">
//                                 <Mail className="w-5 h-5 text-indigo-500" />
//                                 <a href="mailto:sales@mzatinova.com" className="hover:text-indigo-600">
//                                     sales@mzatinova.com
//                                 </a>
//                             </div>
//                         </div>

//                         <a
//                             href="https://api.whatsapp.com/send?phone=265999613324"
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-flex items-center gap-2 mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
//                         >
//                             <MessageCircle className="w-4 h-4" />
//                             Chat on WhatsApp
//                         </a>
//                     </div>
//                 </div>

//                 {/* Technical Support Section for Public */}
//                 <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 max-w-2xl mx-auto">
//                     <div className="text-center">
//                         <h3 className="text-xl font-bold text-slate-800 mb-2">Technical Support</h3>
//                         <p className="text-slate-500 mb-4">
//                             For schools already using EduSpace:
//                         </p>
//                         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//                             <a
//                                 href="mailto:support@mzatinova.com"
//                                 className="text-indigo-600 hover:text-indigo-700"
//                             >
//                                 support@mzatinova.com
//                             </a>
//                             <span className="text-slate-300 hidden sm:inline">|</span>
//                             <a
//                                 href="https://api.whatsapp.com/send?phone=265999613324"
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-green-600 hover:text-green-700"
//                             >
//                                 WhatsApp: +265 999 613 324
//                             </a>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ContactPage;