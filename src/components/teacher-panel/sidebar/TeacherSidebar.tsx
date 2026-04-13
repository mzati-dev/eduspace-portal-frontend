import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    GraduationCap,
    CalendarCheck,
    MessageSquare,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    X
} from 'lucide-react';

interface TeacherSidebarProps {
    activeMainSection: string;
    onSectionChange: (section: string) => void;
    onBack?: () => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
    teacherName?: string;
    teacherInitial?: string;

    // NEW (mobile drawer): controlled from TeacherPanel
    isMobileOpen: boolean;
    onMobileClose: () => void;

    // NEW (header/logo parity): passed from TeacherPanel
    schoolName: string;
    schoolInitial: string;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
    activeMainSection,
    onSectionChange,
    onBack,
    isCollapsed = false,
    onToggle,
    teacherName = 'Teacher',
    teacherInitial = 'T',
    isMobileOpen,
    onMobileClose,
    schoolName,
    schoolInitial
}) => {
    // Menu items for teacher panel
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'my-classes', label: 'My Classes', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        { id: 'performance-analytics', label: 'Analytics', icon: GraduationCap },
        { id: 'timetable', label: 'Timetable', icon: Clock },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'profile', label: 'Profile', icon: Settings },
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
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
            )}
            {collapsed && (
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 z-10 hidden md:flex"
                >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
            )}

            {/* NEW (mobile): hide sidebar branding; header already shows logo/name */}
            {showBranding && (
                <div className={`p-6 border-b border-slate-200 ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? (
                        // Collapsed: Show circle with first letter
                        <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{schoolInitial}</span>
                        </div>
                    ) : (
                        // Expanded: Show logo on top, name below
                        <div className="flex flex-col items-center">
                            {/* Logo/Circle on top */}
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-md">
                                <span className="text-white font-bold text-2xl">{schoolInitial}</span>
                            </div>

                            {/* School name below */}
                            <div className="text-center w-full max-w-[180px] group relative">
                                <h1 className="text-xl font-bold text-indigo-600 leading-tight break-words">
                                    {schoolName}
                                </h1>
                                <p className="text-sm text-slate-500 truncate">Teacher Portal</p>

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

            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeMainSection === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        onSectionChange(item.id);
                                        // NEW (mobile): close drawer after selection
                                        if (closeOnSelect) onMobileClose();
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        } ${collapsed ? 'justify-center' : ''}`}
                                    title={collapsed ? item.label : ''}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-700' : 'text-slate-400'}`} />
                                    {!collapsed && <span className="font-medium">{item.label}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={() => {
                        onBack?.();
                        // NEW (mobile): close drawer after logout click
                        if (closeOnSelect) onMobileClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? 'Back to Portal' : ''}
                >
                    <LogOut className="w-5 h-5 text-slate-400" />
                    {!collapsed && <span className="font-medium">Logout</span>}
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

export default TeacherSidebar;

// import React, { useState, useEffect } from 'react';
// import {
//     LayoutDashboard,
//     Users,
//     BookOpen,
//     GraduationCap,
//     CalendarCheck,
//     MessageSquare,
//     Settings,
//     LogOut,
//     ChevronLeft,
//     ChevronRight,
//     Clock,
//     FileText
// } from 'lucide-react';

// interface TeacherSidebarProps {
//     activeMainSection: string;
//     onSectionChange: (section: string) => void;
//     onBack?: () => void;
//     isCollapsed?: boolean;
//     onToggle?: () => void;
//     teacherName?: string;
//     teacherInitial?: string;
// }

// const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
//     activeMainSection,
//     onSectionChange,
//     onBack,
//     isCollapsed = false,
//     onToggle,
//     teacherName = 'Teacher',
//     teacherInitial = 'T'
// }) => {
//     const [schoolName, setSchoolName] = useState<string>('School');
//     const [loading, setLoading] = useState(true);

//     // Fetch school name on component mount
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

//     // Menu items for teacher panel
//     const menuItems = [
//         { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//         { id: 'my-classes', label: 'My Classes', icon: Users },
//         { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
//         // { id: 'timetable', label: 'Timetable', icon: Clock },
//         // { id: 'messages', label: 'Messages', icon: MessageSquare },
//         // { id: 'reports', label: 'Reports', icon: FileText },
//         { id: 'profile', label: 'Profile', icon: Settings },
//     ];

//     // Get first letter of school name for the circle
//     const schoolInitial = schoolName.charAt(0).toUpperCase();

//     return (
//         <aside className={`bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
//             {/* Toggle Button */}
//             <button
//                 onClick={onToggle}
//                 className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 z-10"
//             >
//                 {isCollapsed ? (
//                     <ChevronRight className="w-4 h-4 text-slate-600" />
//                 ) : (
//                     <ChevronLeft className="w-4 h-4 text-slate-600" />
//                 )}
//             </button>

//             {/* School Logo and Name */}
//             <div className={`p-6 border-b border-slate-200 ${isCollapsed ? 'text-center' : ''}`}>
//                 {isCollapsed ? (
//                     // Collapsed: Show school initial circle
//                     <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
//                         <span className="text-white font-bold text-lg">{schoolInitial}</span>
//                     </div>
//                 ) : (
//                     // Expanded: Show logo on top, school name below
//                     <div className="flex flex-col items-center">
//                         {/* School Logo/Circle on top */}
//                         <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-md">
//                             <span className="text-white font-bold text-2xl">{schoolInitial}</span>
//                         </div>

//                         {/* School name below */}
//                         {/* <div className="text-center">
//                             <h1 className="text-xl font-bold text-indigo-600 truncate max-w-full">{schoolName}</h1>
//                             <p className="text-sm text-slate-500 truncate">Teacher Portal</p>
//                         </div> */}
//                         {/* School name below */}
//                         <div className="text-center w-full max-w-[180px] group relative">
//                             <h1 className="text-xl font-bold text-indigo-600 leading-tight break-words">
//                                 {schoolName}
//                             </h1>
//                             <p className="text-sm text-slate-500 truncate">Teacher Portal</p>

//                             {/* Tooltip on hover showing full name */}
//                             <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
//                                 {schoolName}
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Teacher Info - Small section to show who's logged in */}
//             {/* {!isCollapsed && (
//                 <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
//                     <div className="flex items-center gap-2">
//                         <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
//                             <span className="text-indigo-700 font-bold text-sm">{teacherInitial}</span>
//                         </div>
//                         <div className="overflow-hidden">
//                             <p className="text-sm font-medium text-slate-800 truncate">{teacherName}</p>
//                             <p className="text-xs text-slate-500 truncate">Teacher</p>
//                         </div>
//                     </div>
//                 </div>
//             )} */}

//             {/* Navigation Menu */}
//             <nav className="flex-1 overflow-y-auto p-4">
//                 <ul className="space-y-1">
//                     {menuItems.map(item => {
//                         const Icon = item.icon;
//                         const isActive = activeMainSection === item.id;
//                         return (
//                             <li key={item.id}>
//                                 <button
//                                     onClick={() => onSectionChange(item.id)}
//                                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
//                                         ? 'bg-indigo-50 text-indigo-700'
//                                         : 'text-slate-600 hover:bg-slate-50'
//                                         } ${isCollapsed ? 'justify-center' : ''}`}
//                                     title={isCollapsed ? item.label : ''}
//                                 >
//                                     <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-700' : 'text-slate-400'}`} />
//                                     {!isCollapsed && <span className="font-medium">{item.label}</span>}
//                                 </button>
//                             </li>
//                         );
//                     })}
//                 </ul>
//             </nav>

//             {/* Back to Portal Button */}
//             <div className="p-4 border-t border-slate-200">
//                 <button
//                     onClick={onBack}
//                     className={`w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
//                     title={isCollapsed ? 'Back to Portal' : ''}
//                 >
//                     <LogOut className="w-5 h-5 text-slate-400" />
//                     {!isCollapsed && <span className="font-medium">Logout</span>}
//                 </button>
//             </div>
//         </aside>
//     );
// };

// export default TeacherSidebar;