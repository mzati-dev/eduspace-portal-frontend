import React from 'react';
import {
    LayoutDashboard, Users, BookOpen, GraduationCap,
    CalendarCheck, BarChart3, Wallet, MessageSquare,
    Settings, LogOut, ChevronLeft, ChevronRight,
    Calendar, X
} from 'lucide-react';

interface AdminSidebarProps {
    activeMainSection: string;
    onSectionChange: (section: string) => void;
    onBack?: () => void;
    isCollapsed?: boolean;
    onToggle?: () => void;

    // NEW (mobile drawer): controlled from `AdminPanel`
    isMobileOpen: boolean;
    onMobileClose: () => void;

    // NEW (header/logo parity): passed from `AdminPanel`
    schoolName: string;
    schoolInitial: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeMainSection,
    onSectionChange,
    onBack,
    isCollapsed = false,
    onToggle,
    isMobileOpen,
    onMobileClose,
    schoolName,
    schoolInitial
}) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        // { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        // { id: 'fees', label: 'Fees', icon: Wallet },
        // { id: 'messages', label: 'Messages', icon: MessageSquare },
        // { id: 'timetable', label: 'Timetable', icon: Calendar },
        // { id: 'settings', label: 'Settings', icon: Settings },
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
                                <p className="text-sm text-slate-500 truncate">Admin Portal</p>

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
                // className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 pt-28 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 pt-36 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Drawer close button */}
                {/* NEW: place close button below header so it doesn't get covered */}
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

            {/* END NEW (mobile drawer) */}
        </>
    );
};

export default AdminSidebar;



// import React from 'react';
// import {
//     LayoutDashboard, Users, BookOpen, GraduationCap,
//     CalendarCheck, BarChart3, Wallet, MessageSquare,
//     Settings, LogOut, ChevronLeft, ChevronRight,
//     Calendar, X
// } from 'lucide-react';

// interface AdminSidebarProps {
//     activeMainSection: string;
//     onSectionChange: (section: string) => void;
//     onBack?: () => void;
//     isCollapsed?: boolean;
//     onToggle?: () => void;

//     // NEW (mobile drawer): controlled from `AdminPanel`
//     isMobileOpen: boolean;
//     onMobileClose: () => void;

//     // NEW (header/logo parity): passed from `AdminPanel`
//     schoolName: string;
//     schoolInitial: string;
// }

// const AdminSidebar: React.FC<AdminSidebarProps> = ({
//     activeMainSection,
//     onSectionChange,
//     onBack,
//     isCollapsed = false,
//     onToggle,
//     isMobileOpen,
//     onMobileClose,
//     schoolName,
//     schoolInitial
// }) => {
//     const menuItems = [
//         { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//         { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
//         // { id: 'analytics', label: 'Analytics', icon: BarChart3 },
//         // { id: 'fees', label: 'Fees', icon: Wallet },
//         // { id: 'messages', label: 'Messages', icon: MessageSquare },
//         // { id: 'timetable', label: 'Timetable', icon: Calendar },
//         // { id: 'settings', label: 'Settings', icon: Settings },
//     ];

//     // NEW (responsive): shared sidebar content renderer for both desktop and mobile variants
//     const renderSidebarContent = (collapsed: boolean, closeOnSelect: boolean) => (
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

//             <div className={`p-6 border-b border-slate-200 ${collapsed ? 'text-center' : ''}`}>
//                 {collapsed ? (
//                     // Collapsed: Show circle with first letter
//                     <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
//                         <span className="text-white font-bold text-lg">{schoolInitial}</span>
//                     </div>
//                 ) : (
//                     // Expanded: Show logo on top, name below
//                     <div className="flex flex-col items-center">
//                         {/* Logo/Circle on top */}
//                         <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-md">
//                             <span className="text-white font-bold text-2xl">{schoolInitial}</span>
//                         </div>

//                         {/* School name below */}
//                         <div className="text-center w-full max-w-[180px] group relative">
//                             <h1 className="text-xl font-bold text-indigo-600 leading-tight break-words">
//                                 {schoolName}
//                             </h1>
//                             <p className="text-sm text-slate-500 truncate">Admin Portal</p>

//                             {schoolName.length > 20 && (
//                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
//                                     {schoolName}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>

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
//                 {renderSidebarContent(isCollapsed, false)}
//             </aside>

//             {/* NEW (mobile): drawer sidebar */}
//             <aside
//                 className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
//             >
//                 {/* Drawer close button */}
//                 {/* NEW: place close button below header so it doesn't get covered */}
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

//                 {renderSidebarContent(false, true)}
//             </aside>

//             {/* END NEW (mobile drawer) */}
//         </>
//     );
// };

// export default AdminSidebar;



// import React from 'react';
// import {
//     LayoutDashboard, Users, BookOpen, GraduationCap,
//     CalendarCheck, BarChart3, Wallet, MessageSquare,
//     Settings, LogOut, ChevronLeft, ChevronRight,
//     Calendar, X
// } from 'lucide-react';

// interface AdminSidebarProps {
//     activeMainSection: string;
//     onSectionChange: (section: string) => void;
//     onBack?: () => void;
//     isCollapsed?: boolean;
//     onToggle?: () => void;

//     // NEW (mobile drawer): controlled from `AdminPanel`
//     isMobileOpen: boolean;
//     onMobileClose: () => void;

//     // NEW (header/logo parity): passed from `AdminPanel`
//     schoolName: string;
//     schoolInitial: string;
// }

// const AdminSidebar: React.FC<AdminSidebarProps> = ({
//     activeMainSection,
//     onSectionChange,
//     onBack,
//     isCollapsed = false,
//     onToggle,
//     isMobileOpen,
//     onMobileClose,
//     schoolName,
//     schoolInitial
// }) => {
//     const menuItems = [
//         { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//         { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
//         // { id: 'analytics', label: 'Analytics', icon: BarChart3 },
//         // { id: 'fees', label: 'Fees', icon: Wallet },
//         // { id: 'messages', label: 'Messages', icon: MessageSquare },
//         // { id: 'timetable', label: 'Timetable', icon: Calendar },
//         // { id: 'settings', label: 'Settings', icon: Settings },
//     ];

//     // NEW (responsive): shared sidebar content renderer for both desktop and mobile variants
//     const renderSidebarContent = (collapsed: boolean, closeOnSelect: boolean) => (
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

//             <div className={`p-6 border-b border-slate-200 ${collapsed ? 'text-center' : ''}`}>
//                 {collapsed ? (
//                     // Collapsed: Show circle with first letter
//                     <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
//                         <span className="text-white font-bold text-lg">{schoolInitial}</span>
//                     </div>
//                 ) : (
//                     // Expanded: Show logo on top, name below
//                     <div className="flex flex-col items-center">
//                         {/* Logo/Circle on top */}
//                         <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-md">
//                             <span className="text-white font-bold text-2xl">{schoolInitial}</span>
//                         </div>

//                         {/* School name below */}
//                         <div className="text-center w-full max-w-[180px] group relative">
//                             <h1 className="text-xl font-bold text-indigo-600 leading-tight break-words">
//                                 {schoolName}
//                             </h1>
//                             <p className="text-sm text-slate-500 truncate">Admin Portal</p>

//                             {schoolName.length > 20 && (
//                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
//                                     {schoolName}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>

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
//                 {renderSidebarContent(isCollapsed, false)}
//             </aside>

//             {/* NEW (mobile): drawer sidebar */}
//             <aside
//                 className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
//             >
//                 {/* Drawer close button */}
//                 {/* NEW: place close button below header so it doesn't get covered */}
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

//                 {renderSidebarContent(false, true)}
//             </aside>

//             {/* END NEW (mobile drawer) */}
//         </>
//     );
// };

// export default AdminSidebar;
