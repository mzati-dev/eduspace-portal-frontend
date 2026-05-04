import React, { useState } from 'react';
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
    X,
    ChevronDown,
    Home,
    Bell
} from 'lucide-react';

interface TeacherSidebarProps {
    activeMainSection: string;
    onSectionChange: (section: string) => void;
    onBack?: () => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
    teacherName?: string;
    teacherInitial?: string;
    isMobileOpen: boolean;
    onMobileClose: () => void;
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
    const [expandedSections, setExpandedSections] = useState({
        main: true,
        teaching: true,
        communication: true,
        system: true
    });

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId as keyof typeof prev]
        }));
    };

    const renderSidebarContent = (collapsed: boolean, closeOnSelect: boolean, showBranding: boolean) => (
        <>
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

            {showBranding && (
                <div className={`p-6 border-b border-slate-200 ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? (
                        <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{schoolInitial}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-2xl">{schoolInitial}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                    {/* HOME - menu item with icon */}
                    <li>
                        <button
                            onClick={() => {
                                onSectionChange('home');
                                if (closeOnSelect) onMobileClose();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'home'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-50'
                                } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? 'Home' : ''}
                        >
                            <Home className={`w-5 h-5 ${activeMainSection === 'home' ? 'text-indigo-700' : 'text-slate-400'}`} />
                            {!collapsed && <span className="font-medium">Home</span>}
                        </button>
                    </li>

                    {/* TEACHING - category header with icon and dropdown */}
                    {/* TEACHING - category header with icon and dropdown */}
                    <li>
                        {!collapsed ? (
                            <button
                                onClick={() => toggleSection('teaching')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium text-slate-600">Teaching</span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSections.teaching ? 'rotate-0' : '-rotate-90'
                                        }`}
                                />
                            </button>
                        ) : (
                            <button
                                onClick={() => toggleSection('teaching')}
                                className="w-full flex justify-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                                title="Teaching"
                            >
                                <BookOpen className="w-5 h-5 text-slate-400" />
                            </button>
                        )}

                        {(collapsed || expandedSections.teaching) && (
                            <ul className={`space-y-1 ${!collapsed ? 'ml-6' : ''}`}>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('results');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'results'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Results' : ''}
                                    >
                                        <FileText className={`w-5 h-5 ${activeMainSection === 'results' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Results</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('my-classes');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'my-classes'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'My Classes' : ''}
                                    >
                                        <Users className={`w-5 h-5 ${activeMainSection === 'my-classes' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">My Classes</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('attendance');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'attendance'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Attendance' : ''}
                                    >
                                        <CalendarCheck className={`w-5 h-5 ${activeMainSection === 'attendance' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Attendance</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('performance-analytics');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'performance-analytics'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Performance' : ''}
                                    >
                                        <GraduationCap className={`w-5 h-5 ${activeMainSection === 'performance-analytics' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Performance</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('timetable');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'timetable'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Timetable' : ''}
                                    >
                                        <Clock className={`w-5 h-5 ${activeMainSection === 'timetable' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Timetable</span>}
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* COMMUNICATION - category header with icon and dropdown */}
                    <li>
                        {!collapsed ? (
                            <button
                                onClick={() => toggleSection('communication')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium text-slate-600">Communication</span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSections.communication ? 'rotate-0' : '-rotate-90'
                                        }`}
                                />
                            </button>
                        ) : (
                            <button
                                onClick={() => toggleSection('communication')}
                                className="w-full flex justify-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                                title="Communication"
                            >
                                <MessageSquare className="w-5 h-5 text-slate-400" />
                            </button>
                        )}

                        {(collapsed || expandedSections.communication) && (
                            <ul className={`space-y-1 ${!collapsed ? 'ml-6' : ''}`}>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('messages');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'messages'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Messages' : ''}
                                    >
                                        <MessageSquare className={`w-5 h-5 ${activeMainSection === 'messages' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Messages</span>}
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* SYSTEM - category header with icon and dropdown */}
                    <li>
                        {!collapsed ? (
                            <button
                                onClick={() => toggleSection('system')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium text-slate-600">System</span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSections.system ? 'rotate-0' : '-rotate-90'
                                        }`}
                                />
                            </button>
                        ) : (
                            <button
                                onClick={() => toggleSection('system')}
                                className="w-full flex justify-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                                title="System"
                            >
                                <Settings className="w-5 h-5 text-slate-400" />
                            </button>
                        )}

                        {(collapsed || expandedSections.system) && (
                            <ul className={`space-y-1 ${!collapsed ? 'ml-6' : ''}`}>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('reports');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'reports'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Reports' : ''}
                                    >
                                        <FileText className={`w-5 h-5 ${activeMainSection === 'reports' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Reports</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('profile');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'profile'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Profile' : ''}
                                    >
                                        <Settings className={`w-5 h-5 ${activeMainSection === 'profile' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Profile</span>}
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>

            {/* <div className="p-4 border-t border-slate-200">
                <button
                    onClick={() => {
                        onBack?.();
                        if (closeOnSelect) onMobileClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? 'Back to Portal' : ''}
                >
                    <LogOut className="w-5 h-5 text-slate-400" />
                    {!collapsed && <span className="font-medium">Logout</span>}
                </button>
            </div> */}
        </>
    );

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/30 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={`hidden md:flex bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                {renderSidebarContent(isCollapsed, false, true)}
            </aside>

            <aside
                className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 pt-36 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
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
//     FileText,
//     X
// } from 'lucide-react';

// interface TeacherSidebarProps {
//     activeMainSection: string;
//     onSectionChange: (section: string) => void;
//     onBack?: () => void;
//     isCollapsed?: boolean;
//     onToggle?: () => void;
//     teacherName?: string;
//     teacherInitial?: string;

//     // NEW (mobile drawer): controlled from TeacherPanel
//     isMobileOpen: boolean;
//     onMobileClose: () => void;

//     // NEW (header/logo parity): passed from TeacherPanel
//     schoolName: string;
//     schoolInitial: string;
// }

// const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
//     activeMainSection,
//     onSectionChange,
//     onBack,
//     isCollapsed = false,
//     onToggle,
//     teacherName = 'Teacher',
//     teacherInitial = 'T',
//     isMobileOpen,
//     onMobileClose,
//     schoolName,
//     schoolInitial
// }) => {
//     // Menu items for teacher panel
//     const menuItems = [
//         { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//         { id: 'my-classes', label: 'My Classes', icon: Users },
//         { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
//         { id: 'performance-analytics', label: 'Performance', icon: GraduationCap },
//         { id: 'timetable', label: 'Timetable', icon: Clock },
//         { id: 'messages', label: 'Messages', icon: MessageSquare },
//         { id: 'reports', label: 'Reports', icon: FileText },
//         { id: 'profile', label: 'Profile', icon: Settings },
//     ];

//     // NEW (responsive): shared sidebar content renderer for both desktop and mobile variants
//     const renderSidebarContent = (collapsed: boolean, closeOnSelect: boolean, showBranding: boolean) => (
//         <>
//             {/* Toggle Button (desktop only) */}
//             {!collapsed && (
//                 <button
//                     onClick={onToggle}
//                     className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 z-10 hidden md:flex"
//                 >
//                     <ChevronLeft className="w-4 h-4 text-slate-600" />
//                 </button>
//             )}
//             {collapsed && (
//                 <button
//                     onClick={onToggle}
//                     className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 z-10 hidden md:flex"
//                 >
//                     <ChevronRight className="w-4 h-4 text-slate-600" />
//                 </button>
//             )}

//             {/* NEW (mobile): hide sidebar branding; header already shows logo/name */}
//             {showBranding && (
//                 <div className={`p-6 border-b border-slate-200 ${collapsed ? 'text-center' : ''}`}>
//                     {collapsed ? (
//                         // Collapsed: Show circle with first letter
//                         <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
//                             <span className="text-white font-bold text-lg">{schoolInitial}</span>
//                         </div>
//                     ) : (
//                         // Expanded: Show logo on top, name below
//                         <div className="flex flex-col items-center">
//                             {/* Logo/Circle on top */}
//                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-md">
//                                 <span className="text-white font-bold text-2xl">{schoolInitial}</span>
//                             </div>

//                             {/* School name below */}
//                             <div className="text-center w-full max-w-[180px] group relative">
//                                 <h1 className="text-xl font-bold text-indigo-600 leading-tight break-words">
//                                     {schoolName}
//                                 </h1>
//                                 <p className="text-sm text-slate-500 truncate">Teacher Portal</p>

//                                 {schoolName.length > 20 && (
//                                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
//                                         {schoolName}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}

//             <nav className="flex-1 overflow-y-auto p-4">
//                 <ul className="space-y-1">
//                     {menuItems.map(item => {
//                         const Icon = item.icon;
//                         const isActive = activeMainSection === item.id;
//                         return (
//                             <li key={item.id}>
//                                 <button
//                                     onClick={() => {
//                                         onSectionChange(item.id);
//                                         // NEW (mobile): close drawer after selection
//                                         if (closeOnSelect) onMobileClose();
//                                     }}
//                                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
//                                         ? 'bg-indigo-50 text-indigo-700'
//                                         : 'text-slate-600 hover:bg-slate-50'
//                                         } ${collapsed ? 'justify-center' : ''}`}
//                                     title={collapsed ? item.label : ''}
//                                 >
//                                     <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-700' : 'text-slate-400'}`} />
//                                     {!collapsed && <span className="font-medium">{item.label}</span>}
//                                 </button>
//                             </li>
//                         );
//                     })}
//                 </ul>
//             </nav>

//             <div className="p-4 border-t border-slate-200">
//                 <button
//                     onClick={() => {
//                         onBack?.();
//                         // NEW (mobile): close drawer after logout click
//                         if (closeOnSelect) onMobileClose();
//                     }}
//                     className={`w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
//                     title={collapsed ? 'Back to Portal' : ''}
//                 >
//                     <LogOut className="w-5 h-5 text-slate-400" />
//                     {!collapsed && <span className="font-medium">Logout</span>}
//                 </button>
//             </div>
//         </>
//     );

//     // NEW (mobile drawer): backdrop + drawer + desktop sidebar
//     return (
//         <>
//             {/* NEW (mobile): backdrop */}
//             {isMobileOpen && (
//                 <div
//                     className="fixed inset-0 bg-slate-900/30 z-40 md:hidden"
//                     onClick={onMobileClose}
//                 />
//             )}

//             {/* Desktop sidebar */}
//             <aside
//                 className={`hidden md:flex bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
//             >
//                 {renderSidebarContent(isCollapsed, false, true)}
//             </aside>

//             {/* NEW (mobile): drawer sidebar */}
//             <aside
//                 className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 pt-36 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
//             >
//                 {/* Drawer close button */}
//                 <div className="absolute top-20 right-4 z-50">
//                     <button
//                         onClick={onMobileClose}
//                         className="p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
//                         aria-label="Close sidebar"
//                         type="button"
//                     >
//                         <X className="w-4 h-4 text-slate-600" />
//                     </button>
//                 </div>

//                 {/* NEW (mobile): no sidebar branding */}
//                 {renderSidebarContent(false, true, false)}
//             </aside>
//         </>
//     );
// };

// export default TeacherSidebar;