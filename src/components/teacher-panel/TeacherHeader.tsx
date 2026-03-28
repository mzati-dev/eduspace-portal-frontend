import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TeacherHeaderProps {
    onBack: () => void;
    teacherName: string;
    teacherInitial: string;
    notificationCount?: number;
    onProfileClick?: () => void;

    // NEW (mobile): hamburger controls the sidebar drawer
    onMobileMenuClick?: () => void;
    isMobileMenuOpen?: boolean;

    // NEW (mobile/desktop): show school branding at top
    schoolName?: string;
    schoolInitial?: string;
}

const TeacherHeader: React.FC<TeacherHeaderProps> = ({
    onBack,
    teacherName,
    teacherInitial,
    notificationCount = 0,
    onMobileMenuClick,
    isMobileMenuOpen = false,
    schoolName = 'School',
    schoolInitial = 'S',
    onProfileClick
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
        if (onProfileClick) {
            onProfileClick();
        }
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
                                </div>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Teacher Panel</h1>
                            <p className="text-xs text-slate-500">Enter scores, view results</p>
                        </div>
                    </div>

                    {/* Right-aligned profile and logout */}
                    <div className="flex items-center gap-4 mt-1">
                        {/* Notification Bell */}
                        <button className="relative p-2 hover:bg-slate-100 rounded-lg">
                            <Bell className="w-5 h-5 text-slate-600" />
                            {notificationCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Teacher Profile with Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 hover:opacity-80"
                            >
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-700 font-semibold text-sm">
                                        {teacherInitial}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                                    {teacherName}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-xs text-slate-500">Teacher</p>
                                        <p className="text-sm font-semibold text-slate-800 sm:hidden">{teacherName}</p>

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

export default TeacherHeader;

// import React, { useState, useRef, useEffect } from 'react';
// import { Bell, ChevronDown, User, LogOut } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// interface TeacherHeaderProps {
//     onBack: () => void;
//     teacherName: string;
//     teacherInitial: string;
//     notificationCount?: number;
// }

// const TeacherHeader: React.FC<TeacherHeaderProps> = ({
//     onBack,
//     teacherName,
//     teacherInitial,
//     notificationCount = 0
// }) => {
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const dropdownRef = useRef<HTMLDivElement>(null);
//     const navigate = useNavigate();

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
//     //     localStorage.removeItem('token');
//     //     localStorage.removeItem('user');
//     //     localStorage.removeItem('userRole');
//     //     window.location.href = '/login';
//     // };
//     const handleLogout = () => {
//         // Clear any authentication tokens/data
//         localStorage.clear(); // or localStorage.removeItem('token')
//         sessionStorage.clear();

//         // Redirect to login page
//         navigate('/login');
//     };


//     const goToProfile = () => {
//         setIsDropdownOpen(false);
//         // You can add navigation to profile section here
//     };

//     return (
//         <header className="bg-white shadow">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//                 <div className="grid grid-cols-3 items-center">
//                     {/* Left (empty for balance) */}
//                     <div />

//                     {/* Centered title */}
//                     <div className="text-center">
//                         <h1 className="text-xl font-semibold text-slate-900">
//                             Teacher Panel
//                         </h1>
//                         <p className="text-sm text-slate-500">
//                             Enter scores, view results
//                         </p>
//                     </div>

//                     {/* Right-aligned profile and logout */}
//                     <div className="flex justify-end items-center gap-4">
//                         {/* Notification Bell */}
//                         <button className="relative p-2 hover:bg-slate-100 rounded-lg">
//                             <Bell className="w-5 h-5 text-slate-600" />
//                             {notificationCount > 0 && (
//                                 <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                                     {notificationCount}
//                                 </span>
//                             )}
//                         </button>

//                         {/* Teacher Profile with Dropdown */}
//                         <div className="relative" ref={dropdownRef}>
//                             <button
//                                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                                 className="flex items-center gap-2 border-l border-slate-200 pl-4 hover:opacity-80"
//                             >
//                                 <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
//                                     <span className="text-indigo-700 font-semibold text-sm">
//                                         {teacherInitial}
//                                     </span>
//                                 </div>
//                                 <span className="text-sm font-medium text-slate-700 hidden sm:block">
//                                     {teacherName}
//                                 </span>
//                                 <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
//                             </button>

//                             {/* Dropdown Menu */}
//                             {isDropdownOpen && (
//                                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
//                                     <div className="px-4 py-2 border-b border-slate-100">
//                                         {/* <p className="text-sm font-medium text-slate-800">{teacherName}</p> */}
//                                         <p className="text-xs text-slate-500">Teacher</p>
//                                     </div>

//                                     <button
//                                         onClick={goToProfile}
//                                         className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                                     >
//                                         <User className="w-4 h-4" />
//                                         Profile
//                                     </button>

//                                     <button
//                                         onClick={handleLogout}
//                                         className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                                     >
//                                         <LogOut className="w-4 h-4" />
//                                         Logout
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default TeacherHeader;