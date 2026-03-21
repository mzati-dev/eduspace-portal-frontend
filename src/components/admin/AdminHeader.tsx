import React from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
    onBack: () => void;

    // NEW (mobile): hamburger controls the sidebar drawer
    onMobileMenuClick?: () => void;
    isMobileMenuOpen?: boolean;

    // NEW (mobile/desktop): show school branding at top
    schoolName?: string;
    schoolInitial?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    onBack,
    onMobileMenuClick,
    isMobileMenuOpen = false,
    schoolName = 'School',
    schoolInitial = 'S'
}) => {

    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear any authentication tokens/data
        localStorage.clear(); // or localStorage.removeItem('token')
        sessionStorage.clear();

        // Redirect to login page
        navigate('/login');
    };
    return (
        <header className="bg-white shadow-sm border-b border-slate-200 relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* NEW (mobile): make space for the Logout button and keep it visible */}
                <div className="flex items-start justify-between gap-4 relative">
                    {/* NEW (mobile): hamburger + school branding at header top */}
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-3 mb-2 md:hidden">
                            <button
                                type="button"
                                onClick={onMobileMenuClick}
                                className="md:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                                aria-label={isMobileMenuOpen ? 'Close sidebar' : 'Open sidebar'}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5 text-slate-600" />
                                ) : (
                                    <Menu className="w-5 h-5 text-slate-600" />
                                )}
                            </button>

                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                    <span className="text-white font-bold text-lg">{schoolInitial}</span>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500 truncate">{schoolName}</p>
                                    {/* Keep the title below to meet "name/logo at the top of header" */}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
                            <p className="text-xs text-slate-500">Manage Classes, Students, Subjects, Results & Grade Configuration</p>
                        </div>
                    </div>

                    {/* LOGOUT BUTTON - kept */}
                    {/* <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors mt-1 text-sm whitespace-nowrap flex-shrink-0"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button> */}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;

// import React from 'react';
// import { LogOut, Menu, X } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// interface AdminHeaderProps {
//     onBack: () => void;

//     // NEW (mobile): hamburger controls the sidebar drawer
//     onMobileMenuClick?: () => void;
//     isMobileMenuOpen?: boolean;

//     // NEW (mobile/desktop): show school branding at top
//     schoolName?: string;
//     schoolInitial?: string;
// }

// const AdminHeader: React.FC<AdminHeaderProps> = ({
//     onBack,
//     onMobileMenuClick,
//     isMobileMenuOpen = false,
//     schoolName = 'School',
//     schoolInitial = 'S'
// }) => {

//     const navigate = useNavigate();

//     const handleLogout = () => {
//         // Clear any authentication tokens/data
//         localStorage.clear(); // or localStorage.removeItem('token')
//         sessionStorage.clear();

//         // Redirect to login page
//         navigate('/login');
//     };
//     return (
//         <header className="bg-white shadow-sm border-b border-slate-200 relative z-50">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//                 <div className="flex items-start justify-between gap-4">
//                     {/* NEW (mobile): hamburger + school branding at header top */}
//                     <div className="flex flex-col">
//                         <div className="flex items-center gap-3 mb-2">
//                             <button
//                                 type="button"
//                                 onClick={onMobileMenuClick}
//                                 className="md:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
//                                 aria-label={isMobileMenuOpen ? 'Close sidebar' : 'Open sidebar'}
//                             >
//                                 {isMobileMenuOpen ? (
//                                     <X className="w-5 h-5 text-slate-600" />
//                                 ) : (
//                                     <Menu className="w-5 h-5 text-slate-600" />
//                                 )}
//                             </button>

//                             <div className="flex items-center gap-3 min-w-0">
//                                 <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
//                                     <span className="text-white font-bold text-lg">{schoolInitial}</span>
//                                 </div>

//                                 <div className="min-w-0">
//                                     <p className="text-xs text-slate-500 truncate">{schoolName}</p>
//                                     {/* Keep the title below to meet "name/logo at the top of header" */}
//                                 </div>
//                             </div>
//                         </div>

//                         <div>
//                             <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
//                             <p className="text-xs text-slate-500">Manage Classes, Students, Subjects, Results & Grade Configuration</p>
//                         </div>
//                     </div>

//                     {/* LOGOUT BUTTON - kept */}
//                     <button
//                         onClick={handleLogout}
//                         className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors mt-1"
//                     >
//                         <LogOut className="w-4 h-4" />
//                         Logout
//                     </button>
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default AdminHeader;

// import React from 'react';
// import { LogOut, Menu, X } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// interface AdminHeaderProps {
//     onBack: () => void;

//     // NEW (mobile): hamburger controls the sidebar drawer
//     onMobileMenuClick?: () => void;
//     isMobileMenuOpen?: boolean;

//     // NEW (mobile/desktop): show school branding at top
//     schoolName?: string;
//     schoolInitial?: string;
// }

// const AdminHeader: React.FC<AdminHeaderProps> = ({
//     onBack,
//     onMobileMenuClick,
//     isMobileMenuOpen = false,
//     schoolName = 'School',
//     schoolInitial = 'S'
// }) => {

//     const navigate = useNavigate();

//     const handleLogout = () => {
//         // Clear any authentication tokens/data
//         localStorage.clear(); // or localStorage.removeItem('token')
//         sessionStorage.clear();

//         // Redirect to login page
//         navigate('/login');
//     };
//     return (
//         <header className="bg-white shadow-sm border-b border-slate-200 relative z-50">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//                 <div className="flex items-start justify-between gap-4">
//                     {/* NEW (mobile): hamburger + school branding at header top */}
//                     <div className="flex flex-col">
//                         <div className="flex items-center gap-3 mb-2">
//                             <button
//                                 type="button"
//                                 onClick={onMobileMenuClick}
//                                 className="md:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
//                                 aria-label={isMobileMenuOpen ? 'Close sidebar' : 'Open sidebar'}
//                             >
//                                 {isMobileMenuOpen ? (
//                                     <X className="w-5 h-5 text-slate-600" />
//                                 ) : (
//                                     <Menu className="w-5 h-5 text-slate-600" />
//                                 )}
//                             </button>

//                             <div className="flex items-center gap-3 min-w-0">
//                                 <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
//                                     <span className="text-white font-bold text-lg">{schoolInitial}</span>
//                                 </div>

//                                 <div className="min-w-0">
//                                     <p className="text-xs text-slate-500 truncate">{schoolName}</p>
//                                     {/* Keep the title below to meet "name/logo at the top of header" */}
//                                 </div>
//                             </div>
//                         </div>

//                         <div>
//                             <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
//                             <p className="text-xs text-slate-500">Manage Classes, Students, Subjects, Results & Grade Configuration</p>
//                         </div>
//                     </div>

//                     {/* LOGOUT BUTTON - kept */}
//                     <button
//                         onClick={handleLogout}
//                         className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors mt-1"
//                     >
//                         <LogOut className="w-4 h-4" />
//                         Logout
//                     </button>
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default AdminHeader;