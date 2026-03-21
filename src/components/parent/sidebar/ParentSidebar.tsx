// components/sidebar/ParentSidebar.tsx
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, FileText, Clock, CreditCard, MessageCircle,
    Calendar, User, LogOut, ChevronLeft, ChevronRight, Bell, X
} from 'lucide-react';

interface ParentSidebarProps {
    activeMainSection: string;
    onSectionChange: (section: string) => void;
    onBack: () => void;
    isCollapsed: boolean;
    onToggle: () => void;
    parentName: string;
    parentInitial: string;
    unreadCount: number;

    // NEW (mobile drawer): controlled from ParentPanel
    isMobileOpen: boolean;
    onMobileClose: () => void;

    // NEW (header/logo parity): passed from ParentPanel
    schoolName: string;
    schoolInitial: string;
}

const ParentSidebar: React.FC<ParentSidebarProps> = ({
    activeMainSection,
    onSectionChange,
    onBack,
    isCollapsed,
    onToggle,
    parentName,
    parentInitial,
    unreadCount,
    isMobileOpen,
    onMobileClose,
    schoolName,
    schoolInitial
}) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'reports', label: 'Report Cards', icon: FileText },
        { id: 'attendance', label: 'Attendance', icon: Clock },
        { id: 'fees', label: 'Fees', icon: CreditCard },
        { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadCount },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    // NEW (responsive): shared sidebar content renderer for both desktop and mobile variants
    const renderSidebarContent = (collapsed: boolean, closeOnSelect: boolean, showBranding: boolean) => (
        <>
            {/* Toggle Button (desktop only) */}
            {!collapsed && (
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 z-10 hidden md:flex"
                >
                    <ChevronLeft className="w-4 h-4 text-blue-600" />
                </button>
            )}
            {collapsed && (
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 z-10 hidden md:flex"
                >
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                </button>
            )}

            {/* NEW (mobile): hide sidebar branding; header already shows logo/name */}
            {showBranding && (
                <div className={`p-6 border-b border-slate-200 ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? (
                        // Collapsed: Show circle with first letter
                        <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{schoolInitial}</span>
                        </div>
                    ) : (
                        // Expanded: Show logo on top, name below
                        <div className="flex flex-col items-center">
                            {/* Logo/Circle on top */}
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-md">
                                <span className="text-white font-bold text-2xl">{schoolInitial}</span>
                            </div>

                            {/* School name below */}
                            <div className="text-center w-full max-w-[180px] group relative">
                                <h1 className="text-xl font-bold text-blue-600 leading-tight break-words">
                                    {schoolName}
                                </h1>
                                <p className="text-sm text-slate-500 truncate">Parent Portal</p>

                                {schoolName.length > 20 && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        {schoolName}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto py-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMainSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onSectionChange(item.id);
                                // NEW (mobile): close drawer after selection
                                if (closeOnSelect) onMobileClose();
                            }}
                            className={`w-full flex items-center px-4 py-3 transition-colors relative ${isActive
                                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                                : 'text-slate-600 hover:bg-slate-50'
                                } ${collapsed ? 'justify-center' : 'justify-start gap-3'}`}
                            title={collapsed ? item.label : ''}
                        >
                            <div className="relative">
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Back to Role Selection */}
            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={() => {
                        onBack();
                        // NEW (mobile): close drawer after logout click
                        if (closeOnSelect) onMobileClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? 'Logout' : ''}
                >
                    <LogOut className="w-5 h-5 text-slate-400" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </>
    );

    // NEW (mobile drawer): backdrop + drawer + desktop sidebar
    return (
        <>
            {/* NEW (mobile): backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/30 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Desktop sidebar */}
            <aside
                className={`hidden md:flex bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                {renderSidebarContent(isCollapsed, false, true)}
            </aside>

            {/* NEW (mobile): drawer sidebar */}
            <aside
                className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 pt-36 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Drawer close button */}
                <div className="absolute top-20 right-4 z-50">
                    <button
                        onClick={onMobileClose}
                        className="p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
                        aria-label="Close sidebar"
                        type="button"
                    >
                        <X className="w-4 h-4 text-slate-600" />
                    </button>
                </div>

                {/* NEW (mobile): no sidebar branding */}
                {renderSidebarContent(false, true, false)}
            </aside>
        </>
    );
};

export default ParentSidebar;

// // components/sidebar/ParentSidebar.tsx
// import React, { useState, useEffect } from 'react';
// import {
//     LayoutDashboard, FileText, Clock, CreditCard, MessageCircle,
//     Calendar, User, LogOut, ChevronLeft, ChevronRight, Bell
// } from 'lucide-react';

// interface ParentSidebarProps {
//     activeMainSection: string;
//     onSectionChange: (section: string) => void;
//     onBack: () => void;
//     isCollapsed: boolean;
//     onToggle: () => void;
//     parentName: string;
//     parentInitial: string;
//     unreadCount: number;
// }

// const ParentSidebar: React.FC<ParentSidebarProps> = ({
//     activeMainSection,
//     onSectionChange,
//     onBack,
//     isCollapsed,
//     onToggle,
//     parentName,
//     parentInitial,
//     unreadCount
// }) => {
//     const [schoolName, setSchoolName] = useState<string>('School');
//     const [loading, setLoading] = useState(true);

//     // Fetch school name from backend
//     useEffect(() => {
//         const fetchSchoolName = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const userStr = localStorage.getItem('user');

//                 if (!userStr) {
//                     setSchoolName('School');
//                     setLoading(false);
//                     return;
//                 }

//                 const user = JSON.parse(userStr);
//                 const schoolId = user.schoolId;

//                 if (!schoolId) {
//                     setSchoolName('School');
//                     setLoading(false);
//                     return;
//                 }

//                 const response = await fetch(`https://eduspace-portal-backend.onrender.com/schools/${schoolId}`, {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     },
//                 });

//                 if (response.ok) {
//                     const schoolData = await response.json();
//                     setSchoolName(schoolData.name || 'School');
//                 } else {
//                     setSchoolName(user.schoolName || 'School');
//                 }
//             } catch (error) {
//                 console.error('Failed to load school name', error);
//                 setSchoolName('School');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchSchoolName();
//     }, []);

//     // Get first letter of school name for the circle
//     const schoolInitial = schoolName.charAt(0).toUpperCase();

//     const menuItems = [
//         { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//         { id: 'reports', label: 'Report Cards', icon: FileText },
//         { id: 'attendance', label: 'Attendance', icon: Clock },
//         { id: 'fees', label: 'Fees', icon: CreditCard },
//         { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadCount },
//         { id: 'timetable', label: 'Timetable', icon: Calendar },
//         { id: 'profile', label: 'Profile', icon: User },
//     ];

//     return (
//         <div className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'
//             }`}>
//             {/* Toggle Button - AT THE EDGE like AdminSidebar */}
//             <button
//                 onClick={onToggle}
//                 className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 z-10"
//             >
//                 {isCollapsed ? (
//                     <ChevronRight className="w-4 h-4 text-blue-600" />
//                 ) : (
//                     <ChevronLeft className="w-4 h-4 text-blue-600" />
//                 )}
//             </button>

//             {/* School Logo/Name */}
//             <div className={`p-6 border-b border-slate-200 ${isCollapsed ? 'text-center' : ''}`}>
//                 {isCollapsed ? (
//                     // Collapsed: Show circle with first letter
//                     <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
//                         <span className="text-white font-bold text-lg">
//                             {loading ? 'S' : schoolInitial}
//                         </span>
//                     </div>
//                 ) : (
//                     // Expanded: Show logo on top, name below
//                     <div className="flex flex-col items-center">
//                         {/* Logo/Circle on top */}
//                         <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-md">
//                             <span className="text-white font-bold text-2xl">
//                                 {loading ? 'S' : schoolInitial}
//                             </span>
//                         </div>

//                         {/* School name below */}
//                         <div className="text-center w-full max-w-[180px] group relative">
//                             <h1 className="text-xl font-bold text-blue-600 leading-tight break-words">
//                                 {loading ? 'Loading...' : schoolName}
//                             </h1>
//                             <p className="text-sm text-slate-500 truncate">Parent Portal</p>

//                             {/* Show full name on hover if needed */}
//                             {schoolName.length > 20 && (
//                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
//                                     {schoolName}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Parent Info */}
//             {/* <div className="p-4 border-b border-slate-200">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                         <span className="text-blue-600 font-semibold text-lg">
//                             {parentInitial}
//                         </span>
//                     </div>
//                     {!isCollapsed && (
//                         <div className="overflow-hidden">
//                             <p className="font-medium text-slate-800 truncate">{parentName}</p>
//                             <p className="text-xs text-slate-500">Parent</p>
//                         </div>
//                     )}
//                 </div>
//             </div> */}

//             {/* Navigation Menu */}
//             <div className="py-4">
//                 {menuItems.map((item) => {
//                     const Icon = item.icon;
//                     const isActive = activeMainSection === item.id;

//                     return (
//                         <button
//                             key={item.id}
//                             onClick={() => onSectionChange(item.id)}
//                             className={`w-full flex items-center px-4 py-3 transition-colors relative ${isActive
//                                 ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
//                                 : 'text-slate-600 hover:bg-slate-50'
//                                 } ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
//                         >
//                             <div className="relative">
//                                 <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
//                                 {item.badge > 0 && (
//                                     <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                                         {item.badge}
//                                     </span>
//                                 )}
//                             </div>
//                             {!isCollapsed && <span>{item.label}</span>}
//                         </button>
//                     );
//                 })}
//             </div>

//             {/* Back to Role Selection */}
//             <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
//                 <button
//                     onClick={onBack}
//                     className={`w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''
//                         }`}
//                 >
//                     <LogOut className="w-5 h-5 text-slate-400" />
//                     {!isCollapsed && <span>Logout</span>}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default ParentSidebar;