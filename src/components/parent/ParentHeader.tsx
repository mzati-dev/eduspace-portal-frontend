// components/ParentHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut } from 'lucide-react';

interface ParentHeaderProps {
    onBack: () => void;
    childName?: string;
    notificationCount: number;
    parentName: string;
    parentInitial: string;
}

const ParentHeader: React.FC<ParentHeaderProps> = ({
    onBack,
    childName,
    notificationCount,
    parentName,
    parentInitial
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        
        // Redirect to login
        window.location.href = '/login';
    };

    const goToProfile = () => {
        // Navigate to profile section
        // You can emit an event or use a callback prop
        setIsDropdownOpen(false);
        // You might want to add a prop like onNavigateToProfile
    };

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-slate-800">
                    {childName ? `${childName}'s Progress` : 'Parent Dashboard'}
                </h1>
            </div>

            <div className="flex items-center gap-4">
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
    className="flex items-center gap-3 border-l border-slate-200 pl-4 hover:opacity-80"
>
    {/* TO INCREASE LOGO SIZE - change w-8 h-8 to w-10 h-10 or w-12 h-12 */}
    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        {/* TO INCREASE INITIAL TEXT SIZE - change text-sm to text-base or text-lg */}
        <span className="text-blue-600 font-semibold text-base">
            {parentInitial}
        </span>
    </div>
    
    {/* TO INCREASE PARENT NAME SIZE - uncomment and change text-sm to text-base */}
    <span className="text-base font-medium text-slate-700 hidden sm:block">
        {parentName}
    </span>
    
    {/* TO INCREASE CHEVRON SIZE - change w-4 h-4 to w-5 h-5 */}
    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
</button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                            {/* <div className="px-4 py-2 border-b border-slate-100">
                                <p className="text-sm font-medium text-slate-800">{parentName}</p>
                                <p className="text-xs text-slate-500">Parent</p>
                            </div> */}
                                    <div className="px-4 py-3 border-b border-slate-100">
            {/* TO INCREASE PARENT NAME IN DROPDOWN - change text-sm to text-base */}
            {/* <p className="text-base font-medium text-slate-800">{parentName}</p> */}
            {/* TO INCREASE ROLE TEXT - change text-xs to text-sm */}
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
        </header>
    );
};

export default ParentHeader;

// // components/ParentHeader.tsx
// import React from 'react';
// import { Bell, ChevronDown } from 'lucide-react';

// interface ParentHeaderProps {
//     onBack: () => void;
//     childName?: string;
//     notificationCount: number;
//     parentName: string;        // ADD THIS
//     parentInitial: string;     // ADD THIS
// }

// const ParentHeader: React.FC<ParentHeaderProps> = ({
//     onBack,
//     childName,
//     notificationCount,
//     parentName,                // ADD THIS
//     parentInitial              // ADD THIS
// }) => {
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

//                 {/* Parent Profile - ADD THIS */}
//                 <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
//                     <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                         <span className="text-blue-600 font-semibold text-sm">
//                             {parentInitial}
//                         </span>
//                     </div>
//                     <span className="text-sm font-medium text-slate-700 hidden sm:block">
//                         {parentName}
//                     </span>
//                     <ChevronDown className="w-4 h-4 text-slate-400" />
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default ParentHeader;

// // components/ParentHeader.tsx
// import React from 'react';
// import { Bell, ChevronDown } from 'lucide-react';

// interface ParentHeaderProps {
//     onBack: () => void;
//     childName?: string;
//     notificationCount: number;
// }

// const ParentHeader: React.FC<ParentHeaderProps> = ({
//     onBack,
//     childName,
//     notificationCount
// }) => {
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

                

//                 {/* Profile Dropdown
//                 <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg">
//                     <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
//                         <span className="text-emerald-600 font-semibold">P</span>
//                     </div>
//                     <ChevronDown className="w-4 h-4 text-slate-600" />
//                 </button> */}
//             </div>
//         </header>
//     );
// };

// export default ParentHeader;