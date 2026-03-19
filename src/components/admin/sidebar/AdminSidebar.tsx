import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, BookOpen, GraduationCap,
    CalendarCheck, BarChart3, Wallet, MessageSquare,
    Settings, LogOut, ChevronLeft, ChevronRight,
    Calendar
} from 'lucide-react';

interface AdminSidebarProps {
    activeMainSection: string;
    onSectionChange: (section: string) => void;
    onBack?: () => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeMainSection,
    onSectionChange,
    onBack,
    isCollapsed = false,
    onToggle
}) => {
    const [schoolName, setSchoolName] = useState<string>('School');
    const [loading, setLoading] = useState(true);

    // Fetch school name on component mount
    useEffect(() => {
        const fetchSchoolName = async () => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                if (!userStr) {
                    setSchoolName('School');
                    setLoading(false);
                    return;
                }

                const user = JSON.parse(userStr);
                const schoolId = user.schoolId;

                if (!schoolId) {
                    setSchoolName('School');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`https://eduspace-portal-backend.onrender.com/schools/${schoolId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (response.ok) {
                    const schoolData = await response.json();
                    setSchoolName(schoolData.name || 'School');
                } else {
                    // Fallback: try to get from user object
                    setSchoolName(user.schoolName || 'School');
                }
            } catch (error) {
                console.error('Failed to load school name', error);
                setSchoolName('School');
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolName();
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        // { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        // { id: 'fees', label: 'Fees', icon: Wallet },
        // { id: 'messages', label: 'Messages', icon: MessageSquare },
        // { id: 'timetable', label: 'Timetable', icon: Calendar },
        // { id: 'settings', label: 'Settings', icon: Settings },
    ];

    // Get first letter of school name for the circle
    const schoolInitial = schoolName.charAt(0).toUpperCase();

    return (
        <aside className={`bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 z-10"
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                ) : (
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                )}
            </button>

            <div className={`p-6 border-b border-slate-200 ${isCollapsed ? 'text-center' : ''}`}>
                {isCollapsed ? (
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
                        {/* <div className="text-center">
                            <h1 className="text-xl font-bold text-indigo-600 truncate max-w-full">{schoolName}</h1>
                            <p className="text-sm text-slate-500 truncate">Admin Portal</p>
                        </div> */}
                        {/* School name below */}
                        <div className="text-center w-full max-w-[180px] group relative">
                            <h1 className="text-xl font-bold text-indigo-600 leading-tight break-words">
                                {schoolName}
                            </h1>
                            <p className="text-sm text-slate-500 truncate">Admin Portal</p>

                            {/* Show full name on hover if needed */}
                            {schoolName.length > 20 && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {schoolName}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* <div className={`p-6 border-b border-slate-200 ${isCollapsed ? 'text-center' : ''}`}>
                {isCollapsed ? (
                    // Collapsed: Show circle with first letter
                    <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{schoolInitial}</span>
                    </div>
                ) : (
                    // Expanded: Show school name and circle
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-lg">{schoolInitial}</span>
                            </div>
                            <div className="overflow-hidden">
                                <h1 className="text-xl font-bold text-indigo-600 truncate">{schoolName}</h1>
                                <p className="text-sm text-slate-500 truncate">Admin Portal</p>
                            </div>
                        </div>
                    </>
                )}
            </div> */}

            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeMainSection === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onSectionChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-700' : 'text-slate-400'}`} />
                                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={onBack}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? 'Back to Portal' : ''}
                >
                    <LogOut className="w-5 h-5 text-slate-400" />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;

// import React, { useState } from 'react';
// import {
//     LayoutDashboard, Users, BookOpen, GraduationCap,
//     CalendarCheck, BarChart3, Wallet, MessageSquare,
//     Settings, LogOut, ChevronLeft, ChevronRight
// } from 'lucide-react';

// interface AdminSidebarProps {
//     activeMainSection: string;
//     onSectionChange: (section: string) => void;
//     onBack?: () => void;
//     isCollapsed?: boolean;
//     onToggle?: () => void;
// }

// const AdminSidebar: React.FC<AdminSidebarProps> = ({
//     activeMainSection,
//     onSectionChange,
//     onBack,
//     isCollapsed = false,
//     onToggle
// }) => {
//     const menuItems = [
//         { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//         { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
//         { id: 'analytics', label: 'Analytics', icon: BarChart3 },
//         { id: 'fees', label: 'Fees', icon: Wallet },
//         { id: 'messages', label: 'Messages', icon: MessageSquare },
//         { id: 'settings', label: 'Settings', icon: Settings },
//     ];

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

//             <div className={`p-6 border-b border-slate-200 ${isCollapsed ? 'text-center' : ''}`}>
//                 {isCollapsed ? (
//                     <h1 className="text-xl font-bold text-indigo-600">E</h1>
//                 ) : (
//                     <>
//                         <h1 className="text-xl font-bold text-indigo-600">EduSpace</h1>
//                         <p className="text-sm text-slate-500">Admin Portal</p>
//                     </>
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

//             <div className="p-4 border-t border-slate-200">
//                 <button
//                     onClick={onBack}
//                     className={`w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
//                     title={isCollapsed ? 'Back to Portal' : ''}
//                 >
//                     <LogOut className="w-5 h-5 text-slate-400" />
//                     {!isCollapsed && <span className="font-medium">Back to Portal</span>}
//                 </button>
//             </div>
//         </aside>
//     );
// };

// export default AdminSidebar;


// import React from 'react';
// import {
//     LayoutDashboard, Users, BookOpen, GraduationCap,
//     CalendarCheck, BarChart3, Wallet, MessageSquare,
//     Settings, LogOut
// } from 'lucide-react';

// interface AdminSidebarProps {
//     activeMainSection: string;
//     onSectionChange: (section: string) => void;
//     onBack?: () => void;
// }

// const AdminSidebar: React.FC<AdminSidebarProps> = ({
//     activeMainSection,
//     onSectionChange,
//     onBack
// }) => {
//     const menuItems = [
//         { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//         { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
//         { id: 'analytics', label: 'Analytics', icon: BarChart3 },
//         { id: 'fees', label: 'Fees', icon: Wallet },
//         { id: 'messages', label: 'Messages', icon: MessageSquare },
//         { id: 'settings', label: 'Settings', icon: Settings },
//     ];

//     return (
//         <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col">
//             <div className="p-6 border-b border-slate-200">
//                 <h1 className="text-xl font-bold text-indigo-600">EduSpace</h1>
//                 <p className="text-sm text-slate-500">Admin Portal</p>
//             </div>

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
//                                         }`}
//                                 >
//                                     <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-700' : 'text-slate-400'}`} />
//                                     <span className="font-medium">{item.label}</span>
//                                 </button>
//                             </li>
//                         );
//                     })}
//                 </ul>
//             </nav>

//             <div className="p-4 border-t border-slate-200">
//                 <button
//                     onClick={onBack}
//                     className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
//                 >
//                     <LogOut className="w-5 h-5 text-slate-400" />
//                     <span className="font-medium">Back to Portal</span>
//                 </button>
//             </div>
//         </aside>
//     );
// };

// export default AdminSidebar;