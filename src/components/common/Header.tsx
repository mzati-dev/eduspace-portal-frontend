import React, { useState } from 'react';
import { MessageSquare, LogIn, Search, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';

interface HeaderProps {
    onShowAdmin: () => void;
    hasSuccessfulSearch: boolean;
    currentView: 'search' | 'results' | 'contact';
    onNavigate: (view: 'search' | 'results' | 'contact') => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAdmin, hasSuccessfulSearch, currentView, onNavigate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [tabStyle, setTabStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const { school, loading } = useSchoolBranding();
    const isLoginPage = location.pathname === '/login';
    const isActive = (view: string) => {
    if (isLoginPage) return false;
    return currentView === view;
};
    // const isActive = (view: string) => {
    //     return currentView === view;
    // };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        const target = e.currentTarget;
        setTabStyle({
            left: target.offsetLeft,
            width: target.offsetWidth,
            opacity: 1,
        });
    };

    const handleLogin = () => {
        onShowAdmin();
        navigate('/login');

        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleNavClick = (view: 'search' | 'results' | 'contact') => {
        // FIXED: Route back to home if user is on the login page
        if (location.pathname !== '/') {
            navigate('/');
        }
        onNavigate(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex items-center justify-between gap-2">

                    {/* LEFT SIDE: Logo & Text Group */}
                    {loading ? (
                        // Show empty space while loading (prevents flicker)
                        <div className="flex items-center gap-2 sm:gap-3 flex-1">
                            <div className="w-10 h-10 sm:w-20 sm:h-20"></div>
                            <div className="flex flex-col justify-center min-w-0">
                                <div className="h-6 sm:h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 sm:h-4 w-48 bg-gray-200 rounded animate-pulse mt-1"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3 flex-1">
                            {school ? (
                                // School mode
                                school.logo ? (
                                    <img src={school.logo} alt={school.name} className="w-10 h-10 sm:w-20 sm:h-20 shrink-0 object-contain" />
                                ) : (
                                    <div className="w-10 h-10 sm:w-20 sm:h-20 shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xl sm:text-4xl font-bold">{school.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                )
                            ) : (
                                // Portal mode - show EduSpace logo image
                                <img src="/eduspace-logo.png" alt="EduSpace Portal" className="w-10 h-10 sm:w-20 sm:h-20 shrink-0 object-contain" />
                            )}
                            <div className="flex flex-col justify-center min-w-0">
                                <div className="flex items-baseline gap-1">
                                    <h1 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight">
                                        {school ? (
                                            <>
                                                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                                    {school.name}
                                                </span>
                                                <span className="text-orange-400"> Portal</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                                    EduSpace
                                                </span>
                                                <span className="text-orange-400"> Portal</span>
                                            </>
                                        )}
                                    </h1>
                                </div>
                                <p className="block text-[10px] sm:text-sm text-gray-500 font-light mt-0.5 sm:whitespace-nowrap max-w-[180px] sm:max-w-none">
                                    {school?.slogan || "A window to a child's academic success"}
                                </p>
                            </div>
                        </div>
                    )}
                    {/* <div className="flex items-center gap-2 sm:gap-3 flex-1">
                        <img
                            src="/eduspace-logo.png"
                            alt="Eduspace Portal"
                            className="w-10 h-10 sm:w-20 sm:h-20 shrink-0 object-contain"
                        />
                        <div className="flex flex-col justify-center min-w-0">
                            <div className="flex items-baseline gap-1">
                                <h1 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight whitespace-nowrap">
                                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                        EduSpace
                                    </span>
                                    <span className="text-orange-400"> Portal</span>
                                </h1>
                            </div>
                            <p className="block text-[10px] sm:text-sm text-gray-500 font-light mt-0.5 sm:whitespace-nowrap max-w-[180px] sm:max-w-none">
                                A window to a child's academic success
                            </p>
                        </div>
                    </div> */}

                    {/* CENTER: Navigation Links */}
                    
                    <div
                        className="hidden md:flex items-center justify-center gap-6 relative shrink-0"
                        onMouseLeave={() => setTabStyle(prev => ({ ...prev, opacity: 0 }))}
                    >
                        {/* Sliding Background */}
                        <div
                            className="absolute h-10 bg-blue-600/10 border border-blue-400/30 rounded-lg transition-all duration-300 ease-out pointer-events-none"
                            style={{
                                left: `${tabStyle.left}px`,
                                width: `${tabStyle.width}px`,
                                opacity: tabStyle.opacity,
                            }}
                        />

                        {/* Search Link */}
                        <button
                            onMouseEnter={handleMouseEnter}
                            onClick={() => handleNavClick('search')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${isActive('search')
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-600 hover:text-blue-600'
                                }`}
                        >
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </button>

                        {/* Results Link */}
                        {hasSuccessfulSearch && (
                            <button
                                onMouseEnter={handleMouseEnter}
                                onClick={() => handleNavClick('results')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${isActive('results')
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:text-blue-600'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                <span>Results</span>
                            </button>
                        )}

                        {/* Contact Link */}
                        <button
                            onMouseEnter={handleMouseEnter}
                            onClick={() => handleNavClick('contact')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${isActive('contact')
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-600 hover:text-blue-600'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Contact</span>
                        </button>
                    </div>

                    {/* RIGHT SIDE: Login Button */}
                    <div className="flex items-center justify-end gap-2 flex-1">
                        <button
                            onClick={handleLogin}
                            className="group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/80 transition-all duration-300"
                        >
                            <span className="font-bold text-xs sm:text-base bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                Login
                            </span>
                            <LogIn className="w-4 h-4 text-indigo-500 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all duration-300" />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex md:hidden items-center justify-center gap-12 mt-3 pt-2 border-t border-slate-100">
                    <button
                        onClick={() => handleNavClick('search')}
                        className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${isActive('search')
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-blue-600'
                            }`}
                    >
                        <Search className="w-5 h-5" />
                        <span className="text-xs font-medium">Search</span>
                    </button>

                    {/* Mobile Results Link */}
                    {hasSuccessfulSearch && (
                        <button
                            onClick={() => handleNavClick('results')}
                            className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${isActive('results')
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-600 hover:text-blue-600'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="text-xs font-medium">Results</span>
                        </button>
                    )}

                    <button
                        onClick={() => handleNavClick('contact')}
                        className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${isActive('contact')
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-blue-600'
                            }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-xs font-medium">Contact</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

// import React, { useState } from 'react';
// import { MessageSquare, LogIn, Home, Search } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';

// interface HeaderProps {
//     onShowAdmin: () => void;
// }

// const Header: React.FC<HeaderProps> = ({ onShowAdmin }) => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [tabStyle, setTabStyle] = useState({ left: 0, width: 0, opacity: 0 });

//     const isActive = (path: string) => {
//         // Handle both standard paths and hash links for the active state
//         if (path.startsWith('#')) {
//             return location.hash === path;
//         }
//         return location.pathname === path && !location.hash;
//     };

//     const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
//         const target = e.currentTarget;
//         setTabStyle({
//             left: target.offsetLeft,
//             width: target.offsetWidth,
//             opacity: 1,
//         });
//     };

//     // const handleLogin = () => {
//     //     navigate('/login');
//     // };

//     const handleLogin = () => {
//         navigate('/login');

//         // Give React a tiny fraction of a second to load the new page before scrolling
//         setTimeout(() => {
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//         }, 100);
//     };

//     const handleHome = () => {
//         navigate('/');
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };

//     return (
//         <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
//                 <div className="flex items-center justify-between gap-2">

//                     {/* LEFT SIDE: Logo & Text Group */}
//                     <div className="flex items-center gap-2 sm:gap-3 flex-1">
//                         <img
//                             src="/eduspace-logo.png"
//                             alt="Eduspace Portal"
//                             className="w-10 h-10 sm:w-20 sm:h-20 shrink-0 object-contain"
//                         />
//                         <div className="flex flex-col justify-center min-w-0">
//                             <div className="flex items-baseline gap-1">
//                                 <h1 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight whitespace-nowrap">
//                                     <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
//                                         EduSpace
//                                     </span>
//                                     <span className="text-orange-400"> Portal</span>
//                                 </h1>
//                             </div>
//                             <p className="block text-[10px] sm:text-sm text-gray-500 font-light mt-0.5 sm:whitespace-nowrap max-w-[180px] sm:max-w-none">
//                                 A window to a child's academic success
//                             </p>
//                         </div>
//                     </div>

//                     {/* CENTER: Navigation Links (Home & Contact) */}
//                     <div
//                         className="hidden md:flex items-center justify-center gap-6 relative shrink-0"
//                         onMouseLeave={() => setTabStyle(prev => ({ ...prev, opacity: 0 }))}
//                     >
//                         {/* Sliding Background */}
//                         <div
//                             className="absolute h-10 bg-blue-600/10 border border-blue-400/30 rounded-lg transition-all duration-300 ease-out pointer-events-none"
//                             style={{
//                                 left: `${tabStyle.left}px`,
//                                 width: `${tabStyle.width}px`,
//                                 opacity: tabStyle.opacity,
//                             }}
//                         />

//                         {/* Home Link */}
//                         <button
//                             onMouseEnter={handleMouseEnter}
//                             onClick={handleHome}
//                             className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${isActive('/')
//                                 ? 'text-blue-600 border-b-2 border-blue-600'
//                                 : 'text-slate-600 hover:text-blue-600'
//                                 }`}
//                         >
//                             <Search className="w-4 h-4" />
//                             <span>Search</span>
//                         </button>

//                         {/* Contact Link */}
//                         <a
//                             href="#contact"
//                             onMouseEnter={handleMouseEnter}
//                             className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${isActive('#contact')
//                                 ? 'text-blue-600 border-b-2 border-blue-600'
//                                 : 'text-slate-600 hover:text-blue-600'
//                                 }`}
//                         >
//                             <MessageSquare className="w-4 h-4" />
//                             <span>Contact</span>
//                         </a>
//                     </div>

//                     {/* RIGHT SIDE: Login Button */}
//                     <div className="flex items-center justify-end gap-2 flex-1">
//                         <button
//                             onClick={handleLogin}
//                             className="group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/80 transition-all duration-300"
//                         >
//                             <span className="font-bold text-xs sm:text-base bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
//                                 Login
//                             </span>
//                             <LogIn className="w-4 h-4 text-indigo-500 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all duration-300" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Mobile Navigation Links */}
//                 <div className="flex md:hidden items-center justify-center gap-12 mt-3 pt-2 border-t border-slate-100">
//                     <button
//                         onClick={handleHome}
//                         className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${isActive('/')
//                             ? 'text-blue-600 border-b-2 border-blue-600'
//                             : 'text-slate-600 hover:text-blue-600'
//                             }`}
//                     >
//                         <Search className="w-5 h-5" />
//                         <span className="text-xs font-medium">Search</span>
//                     </button>

//                     <a
//                         href="#contact"
//                         className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${isActive('#contact')
//                             ? 'text-blue-600 border-b-2 border-blue-600'
//                             : 'text-slate-600 hover:text-blue-600'
//                             }`}
//                     >
//                         <MessageSquare className="w-5 h-5" />
//                         <span className="text-xs font-medium">Contact</span>
//                     </a>
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default Header;

