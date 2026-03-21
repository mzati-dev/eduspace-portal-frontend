// import React from 'react';
// import { MessageSquare, LogIn, Home, BookOpen, UserSearch } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// interface HeaderProps {
//     onShowAdmin: () => void;
// }

// const Header: React.FC<HeaderProps> = ({ onShowAdmin }) => {
//     const navigate = useNavigate();

//     const handleLogin = () => {
//         navigate('/login');
//     };

//     const handleHome = () => {
//         navigate('/');
//     };

//     const handleResourceLibrary = () => {
//         navigate('/resources');
//     };

//     const handleFindTutor = () => {
//         navigate('/find-tutor');
//     };

//     return (
//         <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
//                 <div className="flex items-center justify-between gap-2">

//                     {/* LEFT SIDE: Logo & Text Group */}
//                     <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
//                         <img
//                             src="/eduspace-logo.png"
//                             alt="Eduspace Portal"
//                             className="w-10 h-10 sm:w-20 sm:h-20 shrink-0 object-contain"
//                         />

//                         <div className="flex flex-col justify-center min-w-0">
//                             {/* 1. Main Title */}
//                             <div className="flex items-baseline gap-1">
//                                 <h1 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight whitespace-nowrap">
//                                     <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
//                                         EduSpace
//                                     </span>
//                                     <span className="text-orange-400"> Portal</span>
//                                 </h1>
//                             </div>

//                             {/* 3. Tagline */}
//                             <p className="block text-[10px] sm:text-sm text-gray-500 font-light mt-0.5 sm:whitespace-nowrap max-w-[180px] sm:max-w-none">
//                                 A window to a child's academic success
//                             </p>
//                         </div>
//                     </div>

//                     {/* CENTER: Navigation Links */}
//                     <div className="hidden md:flex items-center gap-6">
//                         <button
//                             onClick={handleHome}
//                             className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
//                         >
//                             <Home className="w-4 h-4" />
//                             <span>Home</span>
//                         </button>

//                         <button
//                             onClick={handleResourceLibrary}
//                             className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
//                         >
//                             <BookOpen className="w-4 h-4" />
//                             <span>Resource Library</span>
//                         </button>

//                         <button
//                             onClick={handleFindTutor}
//                             className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
//                         >
//                             <UserSearch className="w-4 h-4" />
//                             <span>Find a Tutor</span>
//                         </button>
//                     </div>

//                     {/* RIGHT SIDE: Buttons */}
//                     <div className="flex items-center gap-2 shrink-0">
//                         {/* Login Button */}
//                         <button
//                             onClick={handleLogin}
//                             className="group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/80 transition-all duration-300"
//                         >
//                             <span className="font-bold text-xs sm:text-base bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
//                                 Login
//                             </span>
//                             <LogIn className="w-4 h-4 text-indigo-500 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all duration-300" />
//                         </button>

//                         {/* Contact Button */}
//                         <a
//                             href="#contact"
//                             className="relative group flex items-center justify-center p-2 sm:px-6 sm:py-2.5 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:-translate-y-0.5"
//                         >
//                             <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient-xy" />
//                             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]" />

//                             <div className="relative flex items-center gap-2 text-white font-medium tracking-wide text-sm">
//                                 <MessageSquare className="w-4 h-4 fill-white/20" />
//                                 <span className="hidden sm:inline">Get in Touch</span>
//                             </div>
//                         </a>
//                     </div>
//                 </div>

//                 {/* Mobile Navigation Links */}
//                 <div className="flex md:hidden items-center justify-around mt-3 pt-2 border-t border-slate-100">
//                     <button
//                         onClick={handleHome}
//                         className="flex flex-col items-center gap-1 px-3 py-1 text-slate-600 hover:text-blue-600 transition-colors"
//                     >
//                         <Home className="w-5 h-5" />
//                         <span className="text-xs">Home</span>
//                     </button>

//                     <button
//                         onClick={handleResourceLibrary}
//                         className="flex flex-col items-center gap-1 px-3 py-1 text-slate-600 hover:text-blue-600 transition-colors"
//                     >
//                         <BookOpen className="w-5 h-5" />
//                         <span className="text-xs">Resources</span>
//                     </button>

//                     <button
//                         onClick={handleFindTutor}
//                         className="flex flex-col items-center gap-1 px-3 py-1 text-slate-600 hover:text-blue-600 transition-colors"
//                     >
//                         <UserSearch className="w-5 h-5" />
//                         <span className="text-xs">Tutor</span>
//                     </button>
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default Header;

import React from 'react';
import { MessageSquare, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onShowAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAdmin }) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex items-center justify-between gap-2">

                    {/* LEFT SIDE: Logo & Text Group */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <img
                            src="/eduspace-logo.png"
                            alt="Eduspace Portal"
                            className="w-10 h-10 sm:w-20 sm:h-20 shrink-0 object-contain"
                        />

                        <div className="flex flex-col justify-center min-w-0">
                            {/* 1. Main Title */}
                            <div className="flex items-baseline gap-1">
                                <h1 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight whitespace-nowrap">
                                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                        EduSpace
                                    </span>
                                    <span className="text-orange-400"> Portal</span>
                                </h1>
                            </div>



                            {/* 3. Tagline (NO TRUNCATION - SHOWS FULL TEXT) */}
                            {/* <p className="block text-[10px] sm:text-sm text-gray-500 font-light mt-0.5 whitespace-nowrap"> */}
                            <p className="block text-[10px] sm:text-sm text-gray-500 font-light mt-0.5 sm:whitespace-nowrap max-w-[180px] sm:max-w-none">
                                A window to a child's academic success
                            </p>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Login Button */}
                        <button
                            onClick={handleLogin}
                            className="group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/80 transition-all duration-300"
                        >
                            <span className="font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                Login
                            </span>
                            <LogIn className="w-4 h-4 text-indigo-500 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all duration-300" />
                        </button>

                        {/* Contact Button */}
                        <a
                            href="#contact"
                            className="relative group flex items-center justify-center p-2 sm:px-6 sm:py-2.5 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:-translate-y-0.5"
                        >
                            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient-xy" />
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]" />

                            <div className="relative flex items-center gap-2 text-white font-medium tracking-wide text-sm">
                                <MessageSquare className="w-4 h-4 fill-white/20" />
                                <span className="hidden sm:inline">Get in Touch</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

