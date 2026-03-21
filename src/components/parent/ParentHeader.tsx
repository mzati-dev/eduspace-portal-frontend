// components/ParentHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ParentHeaderProps {
    onBack: () => void;
    childName?: string;
    notificationCount: number;
    parentName: string;
    parentInitial: string;
    
    // NEW (mobile): hamburger controls the sidebar drawer
    onMobileMenuClick?: () => void;
    isMobileMenuOpen?: boolean;
    
    // NEW (mobile/desktop): show school branding at top
    schoolName?: string;
    schoolInitial?: string;
}

const ParentHeader: React.FC<ParentHeaderProps> = ({
    onBack,
    childName,
    notificationCount,
    parentName,
    parentInitial,
    onMobileMenuClick,
    isMobileMenuOpen = false,
    schoolName = 'School',
    schoolInitial = 'S'
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
    };

    const goToProfile = () => {
        setIsDropdownOpen(false);
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
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                    <span className="text-white font-bold text-lg">{schoolInitial}</span>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500 truncate">{schoolName}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                {childName ? `${childName}'s Progress` : 'Parent Dashboard'}
                            </h1>
                            <p className="text-xs text-slate-500">Track your child's academic progress</p>
                        </div>
                    </div>

                    {/* Right-aligned profile and notifications */}
                    <div className="flex items-center gap-4 mt-1">
                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-slate-100 rounded-lg">
                            <Bell className="w-5 h-5 text-slate-600" />
                            {notificationCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Parent Profile with Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 hover:opacity-80"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-base">
                                        {parentInitial}
                                    </span>
                                </div>
                                <span className="text-base font-medium text-slate-700 hidden sm:block">
                                    {parentName}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm text-slate-500">Parent</p>
                                    </div>
                                    
                                    <button
                                        onClick={goToProfile}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ParentHeader;



// // components/ParentHeader.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { Bell, ChevronDown, User, LogOut } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// interface ParentHeaderProps {
//     onBack: () => void;
//     childName?: string;
//     notificationCount: number;
//     parentName: string;
//     parentInitial: string;
// }

// const ParentHeader: React.FC<ParentHeaderProps> = ({
//     onBack,
//     childName,
//     notificationCount,
//     parentName,
//     parentInitial
// }) => {
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const dropdownRef = useRef<HTMLDivElement>(null);
//         const navigate = useNavigate();

//     // Close dropdown when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setIsDropdownOpen(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     // const handleLogout = () => {
//     //     // Clear localStorage
//     //     localStorage.removeItem('token');
//     //     localStorage.removeItem('user');
//     //     localStorage.removeItem('userRole');
        
//     //     // Redirect to login
//     //     window.location.href = '/login';
//     // };

//         const handleLogout = () => {
//         // Clear any authentication tokens/data
//         localStorage.clear(); // or localStorage.removeItem('token')
//         sessionStorage.clear();

//         // Redirect to login page
//         navigate('/login');
//     };

//     const goToProfile = () => {
//         // Navigate to profile section
//         // You can emit an event or use a callback prop
//         setIsDropdownOpen(false);
//         // You might want to add a prop like onNavigateToProfile
//     };

//     return (
//         <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
//             <div className="flex items-center gap-4">
//                 <h1 className="text-xl font-semibold text-slate-800">
//                     {childName ? `${childName}'s Progress` : 'Parent Dashboard'}
//                 </h1>
//             </div>

//             <div className="flex items-center gap-4">
//                 {/* Notifications */}
//                 <button className="relative p-2 hover:bg-slate-100 rounded-lg">
//                     <Bell className="w-5 h-5 text-slate-600" />
//                     {notificationCount > 0 && (
//                         <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                             {notificationCount}
//                         </span>
//                     )}
//                 </button>

//                 {/* Parent Profile with Dropdown */}
//                 <div className="relative" ref={dropdownRef}>
//                 <button
//     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//     className="flex items-center gap-3 border-l border-slate-200 pl-4 hover:opacity-80"
// >
//     {/* TO INCREASE LOGO SIZE - change w-8 h-8 to w-10 h-10 or w-12 h-12 */}
//     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//         {/* TO INCREASE INITIAL TEXT SIZE - change text-sm to text-base or text-lg */}
//         <span className="text-blue-600 font-semibold text-base">
//             {parentInitial}
//         </span>
//     </div>
    
//     {/* TO INCREASE PARENT NAME SIZE - uncomment and change text-sm to text-base */}
//     <span className="text-base font-medium text-slate-700 hidden sm:block">
//         {parentName}
//     </span>
    
//     {/* TO INCREASE CHEVRON SIZE - change w-4 h-4 to w-5 h-5 */}
//     <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
// </button>

//                     {/* Dropdown Menu */}
//                     {isDropdownOpen && (
//                         <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
//                             {/* <div className="px-4 py-2 border-b border-slate-100">
//                                 <p className="text-sm font-medium text-slate-800">{parentName}</p>
//                                 <p className="text-xs text-slate-500">Parent</p>
//                             </div> */}
//                                     <div className="px-4 py-3 border-b border-slate-100">
//             {/* TO INCREASE PARENT NAME IN DROPDOWN - change text-sm to text-base */}
//             {/* <p className="text-base font-medium text-slate-800">{parentName}</p> */}
//             {/* TO INCREASE ROLE TEXT - change text-xs to text-sm */}
//             <p className="text-sm text-slate-500">Parent</p>
//         </div>
                            
//                             <button
//                                 onClick={goToProfile}
//                                 className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                             >
//                                 <User className="w-4 h-4" />
//                                 Profile
//                             </button>
                            
//                             <button
//                                 onClick={handleLogout}
//                                 className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                             >
//                                 <LogOut className="w-4 h-4" />
//                                 Logout
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default ParentHeader;