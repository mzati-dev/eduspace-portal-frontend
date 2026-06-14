import React from 'react';
import { Phone, Mail, ArrowUp, MessageCircle, Building, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';

const Footer: React.FC = () => {
    const { school } = useSchoolBranding();
    const isCustomized = !!school; // True = school parent view, False = public view

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // ============================================
    // CUSTOMIZED VERSION (School Parents)
    // ============================================
    if (isCustomized) {
        return (
            <footer className="bg-slate-900 text-white pt-4 pb-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Back to Top */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={scrollToTop}
                            className="text-slate-400 hover:text-indigo-400 text-sm transition-colors"
                        >
                            ↑ Back to Top
                        </button>
                    </div>

                    {/* School Name Header */}
                    <div className="text-center mb-8">
                        <h4 className="text-xl font-bold text-white">
                            {school.name}
                        </h4>
                        <p className="text-slate-400 text-sm mt-1">
                            Student Results Portal
                        </p>
                    </div>

                    {/* Two Column Contact Section */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto border-t border-slate-800 pt-8">
                        
                        {/* School Contact - For school-related issues */}
                        <div className="text-center">
                            <div className="inline-block p-2 bg-indigo-600/20 rounded-lg mb-3">
                                <Building className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h5 className="font-semibold mb-3 text-indigo-400">School Office</h5>
                            <ul className="space-y-2 text-slate-300 text-sm">
                                <li className="flex items-center justify-center gap-2">
                                    <Phone className="w-4 h-4 text-indigo-400" />
                                    <span>{school.phone || "+265 123 456 789"}</span>
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <Mail className="w-4 h-4 text-indigo-400" />
                                    <span>{school.email || "admin@school.com"}</span>
                                </li>
                            </ul>
                            <p className="text-xs text-slate-500 mt-3">
                                For grades, student records, and school matters
                            </p>
                        </div>

                        {/* Technical Support - For portal issues */}
                        <div className="text-center">
                            <div className="inline-block p-2 bg-green-600/20 rounded-lg mb-3">
                                <MessageCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <h5 className="font-semibold mb-3 text-indigo-400">Portal Support</h5>
                            <ul className="space-y-2 text-slate-300 text-sm">
                                <li className="flex items-center justify-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-green-400" />
                                    <span>WhatsApp: +265 999 613 324</span>
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <Mail className="w-4 h-4 text-indigo-400" />
                                    <a href="mailto:support@mzatinova.com" className="hover:text-white transition-colors">
                                        support@mzatinova.com
                                    </a>
                                </li>
                            </ul>
                            <p className="text-xs text-slate-500 mt-3">
                                For password reset, login issues, and portal help
                            </p>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center text-slate-500 text-xs pt-8 mt-4 border-t border-slate-800">
                        © {new Date().getFullYear()} {school.name}. All rights reserved.
                    </div>
                </div>
            </footer>
        );
    }

    // ============================================
    // PUBLIC VERSION (Potential Buyers)
    // ============================================
    return (
        <footer id="contact" className="bg-slate-900 text-white pt-4 pb-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Back to Top */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={scrollToTop}
                        className="group flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-all duration-300 text-sm font-medium py-2"
                    >
                        <span>Back to Top</span>
                        <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>

                {/* WhatsApp Contact Card - Sales Inquiries */}
                <div className="bg-indigo-600 rounded-xl shadow-xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-500/30">
                    <div className="text-center sm:text-left">
                        <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                            <MessageCircle className="w-6 h-6" />
                            Interested in EduSpace?
                        </h3>
                        <p className="text-indigo-100 text-sm mt-1">
                            Chat with us on WhatsApp to schedule a demo.
                        </p>
                    </div>

                    <a
                        href="https://api.whatsapp.com/send?phone=265999613324"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap text-sm"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Contact Sales
                    </a>
                </div>

                {/* Main Footer Grid - Public/Buyer Focused */}
                <div className="grid md:grid-cols-4 gap-8 border-b border-slate-800 pb-8">
                    
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="mb-4">
                            <h4 className="text-2xl font-bold text-white">
                                EduSpace Portal
                            </h4>
                            <p className="text-sm text-indigo-400 mt-1">
                                by Mzatinova
                            </p>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                            A complete cloud-based school management platform that streamlines 
                            administration, communication, and academic performance tracking.
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                            <Globe className="w-4 h-4 text-indigo-400" />
                            <span className="text-slate-400 text-xs">Built in Malawi. Ready for Africa.</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 className="font-semibold mb-4 text-indigo-400">Quick Links</h5>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link to="/demo" className="hover:text-white transition-colors">Live Demo</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h5 className="font-semibold mb-4 text-indigo-400">Contact</h5>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li className="flex items-center gap-3">
                                <Building className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span>Mzatinova</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span>+265 999 613 324</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                                <a href="mailto:hello@mzatinova.com" className="hover:text-white transition-colors">
                                    hello@mzatinova.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="pt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Mzatinova. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

// import React from 'react';
// import { MapPin, Phone, Mail, ArrowUp, MessageCircle, Building } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { useSchoolBranding } from '@/hooks/useSchoolBranding';

// const Footer: React.FC = () => {
//     const { school } = useSchoolBranding();

//     const scrollToTop = () => {
//         window.scrollTo({
//             top: 0,
//             behavior: 'smooth'
//         });
//     };

//     return (
//         <footer id="contact" className="bg-slate-900 text-white pt-4 pb-8 mt-12">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 {/* --- BACK TO TOP BUTTON --- */}
//                 <div className="flex justify-end mb-4">
//                     <button
//                         onClick={scrollToTop}
//                         className="group flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-all duration-300 text-sm font-medium py-2"
//                     >
//                         <span>Back to Top</span>
//                         <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
//                     </button>
//                 </div>

//                 {/* --- WHATSAPP CONTACT CARD --- */}
//                 <div className="bg-indigo-600 rounded-xl shadow-xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-500/30">
//                     <div className="text-center sm:text-left">
//                         <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
//                             <MessageCircle className="w-6 h-6" />
//                             Need Help?
//                         </h3>
//                         <p className="text-indigo-100 text-sm mt-1">
//                             Chat with us directly on WhatsApp for quick support.
//                         </p>
//                     </div>

//                     <a
//                         href="https://api.whatsapp.com/send?phone=265999613324"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap text-sm"
//                     >
//                         <MessageCircle className="w-5 h-5" />
//                         WhatsApp Us
//                     </a>
//                 </div>

//                 {/* --- MAIN FOOTER LINKS GRID --- */}
//                 <div className="grid md:grid-cols-4 gap-8 border-b border-slate-800 pb-8">
//                     {/* Brand Section */}
//                     <div className="md:col-span-2">
//                         <div className="flex items-center gap-3 mb-4">
//                             <div>
//                                 <h4 className="text-lg font-bold text-white">
//                                     {school ? school.name : "Eduspace Portal"}
//                                 </h4>
//                                 <p className="text-xs text-slate-400">
//                                     {school?.slogan || "A window to a child's academic success"}
//                                 </p>
//                             </div>
//                         </div>
//                         <p className="text-slate-400 text-sm max-w-md leading-relaxed">
//                             Providing easy access to every child's academic progress and results.
//                         </p>
//                     </div>

//                     {/* Quick Links */}
//                     <div>
//                         <h5 className="font-semibold mb-4 text-indigo-400">Quick Links</h5>
//                         <ul className="space-y-2 text-slate-400 text-sm">
//                             <li><button onClick={scrollToTop} className="hover:text-white transition-colors text-left">Search</button></li>
//                             <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
//                             <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
//                         </ul>
//                     </div>

//                     {/* Contact Info */}
//                     <div>
//                         <h5 className="font-semibold mb-4 text-indigo-400">Contact Info</h5>
//                         <ul className="space-y-4 text-slate-400 text-sm">
//                             <li className="flex items-start gap-3">
//                                 <Building className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
//                                 <span>{school ? school.name : "Mzatinova EduSpace"}</span>
//                             </li>
//                             <li className="flex items-center gap-3">
//                                 <Phone className="w-5 h-5 text-indigo-500 shrink-0" />
//                                 <span>+265 (0) 999 61 33 24</span>
//                             </li>
//                             <li className="flex items-center gap-3">
//                                 <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
//                                 <span>eduspaceportal@mzatinova.com</span>
//                             </li>
//                         </ul>
//                     </div>
//                 </div>

//                 {/* Footer Bottom */}
//                 <div className="pt-8 text-center md:text-left">
//                     <p className="text-slate-500 text-sm">
//                         &copy; {new Date().getFullYear()} {school ? school.name : "EduSpace Portal"}. All rights reserved.
//                     </p>
//                 </div>
//             </div>
//         </footer>
//     );
// };

// export default Footer;

// // import React from 'react';
// // import { MapPin, Phone, Mail, ArrowUp, MessageCircle, Building } from 'lucide-react';
// // import { Link } from 'react-router-dom';

// // const Footer: React.FC = () => {

// //     const scrollToTop = () => {
// //         window.scrollTo({
// //             top: 0,
// //             behavior: 'smooth'
// //         });
// //     };

// //     return (
// //         <footer id="contact" className="bg-slate-900 text-white pt-4 pb-8 mt-12">

// //             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// //                 {/* --- BACK TO TOP BUTTON (Top Edge) --- */}
// //                 <div className="flex justify-end mb-4">
// //                     <button
// //                         onClick={scrollToTop}
// //                         className="group flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-all duration-300 text-sm font-medium py-2"
// //                     >
// //                         <span>Back to Top</span>
// //                         <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
// //                     </button>
// //                 </div>

// //                 {/* --- WHATSAPP CONTACT CARD (Inside Footer flow) --- */}
// //                 {/* Placed above the grid, so it's on top on desktop, and stacks first on mobile */}
// //                 <div className="bg-indigo-600 rounded-xl shadow-xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-500/30">
// //                     <div className="text-center sm:text-left">
// //                         <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
// //                             <MessageCircle className="w-6 h-6" />
// //                             Need Help?
// //                         </h3>
// //                         <p className="text-indigo-100 text-sm mt-1">
// //                             Chat with us directly on WhatsApp for quick support.
// //                         </p>
// //                     </div>

// //                     <a
// //                         href="https://api.whatsapp.com/send?phone=265999613324"

// //                         target="_blank"
// //                         rel="noopener noreferrer"
// //                         className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap text-sm"
// //                     >
// //                         <MessageCircle className="w-5 h-5" />
// //                         WhatsApp Us
// //                     </a>
// //                 </div>

// //                 {/* --- MAIN FOOTER LINKS GRID --- */}
// //                 <div className="grid md:grid-cols-4 gap-8 border-b border-slate-800 pb-8">

// //                     {/* Brand Section */}
// //                     <div className="md:col-span-2">
// //                         <div className="flex items-center gap-3 mb-4">
// //                             <div>
// //                                 <h4 className="text-lg font-bold text-white">Eduspace Portal</h4>
// //                                 <p className="text-xs text-slate-400">A window to a child's academic success</p>
// //                             </div>
// //                         </div>
// //                         <p className="text-slate-400 text-sm max-w-md leading-relaxed">
// //                             Providing easy access to every child's academic progress and results.
// //                         </p>
// //                     </div>

// //                     {/* Quick Links */}
// //                     <div>
// //                         <h5 className="font-semibold mb-4 text-indigo-400">Quick Links</h5>
// //                         <ul className="space-y-2 text-slate-400 text-sm">
// //                             <li><button onClick={scrollToTop} className="hover:text-white transition-colors text-left">Search</button></li>
// //                             <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
// //                             <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
// //                         </ul>
// //                     </div>

// //                     {/* Contact Info */}
// //                     <div>
// //                         <h5 className="font-semibold mb-4 text-indigo-400">Contact Info</h5>
// //                         <ul className="space-y-4 text-slate-400 text-sm">
// //                             <li className="flex items-start gap-3">
// //                                 <Building className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
// //                                 <span>Mzatinova EduSpace</span>
// //                             </li>
// //                             <li className="flex items-center gap-3">
// //                                 <Phone className="w-5 h-5 text-indigo-500 shrink-0" />
// //                                 <span>+265 (0) 999 61 33 24</span>
// //                             </li>
// //                             <li className="flex items-center gap-3">
// //                                 <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
// //                                 <span>support@eduspaceportal.com</span>
// //                             </li>
// //                         </ul>
// //                         {/* <ul className="space-y-4 text-slate-400 text-sm">
// //                             <li className="flex items-start gap-3">
// //                                 <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
// //                                 <span>Education</span>
// //                             </li>
// //                             <li className="flex items-center gap-3">
// //                                 <Phone className="w-5 h-5 text-indigo-500 shrink-0" />
// //                                 <span>+265 (0) 999 61 33 24</span>
// //                             </li>
// //                             <li className="flex items-center gap-3">
// //                                 <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
// //                                 <span>support@eduspacenova.edu</span>
// //                             </li>
// //                         </ul> */}
// //                     </div>
// //                 </div>

// //                 {/* Footer Bottom */}
// //                 <div className="pt-8 text-center md:text-left">
// //                     <p className="text-slate-500 text-sm">
// //                         &copy; {new Date().getFullYear()} EduSpace Portal by Mzatinova. All rights reserved.
// //                     </p>
// //                 </div>
// //             </div>
// //         </footer>
// //     );
// // };

// // export default Footer;