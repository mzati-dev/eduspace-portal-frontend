import React, { useState } from 'react';
import {
    Users, BookOpen, GraduationCap,
    CalendarCheck, BarChart3, Wallet, MessageSquare,
    Settings, LogOut, ChevronLeft, ChevronRight,
    Calendar, X, ChevronDown,
    FileText, Home,
    Bell,
    Megaphone,
    CalendarDays,
    Trophy
} from 'lucide-react';

interface AdminSidebarProps {
    activeMainSection: string;
    onSectionChange: (section: string) => void;
    onBack?: () => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
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
    const [expandedSections, setExpandedSections] = useState({
        academic: false,
        studentsParents: false,
        communication: false,
        schoolLife: false,
        system: false
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

                    {/* ACADEMIC - category header with icon and dropdown */}
                    <li>
                        {!collapsed ? (
                            <button
                                onClick={() => toggleSection('academic')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium text-slate-600">Academic</span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSections.academic ? 'rotate-0' : '-rotate-90'
                                        }`}
                                />
                            </button>
                        ) : (
                            <button
                                onClick={() => toggleSection('academic')}
                                className="w-full flex justify-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                                title="Academic"
                            >
                                <BookOpen className="w-5 h-5 text-slate-400" />
                            </button>
                        )}

                        {(collapsed || expandedSections.academic) && (
                            <ul className={`space-y-1 ${!collapsed ? 'ml-6' : ''}`}>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('classes');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'classes'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Classes' : ''}
                                    >
                                        <Users className={`w-5 h-5 ${activeMainSection === 'classes' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Classes</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('students');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'students'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Students' : ''}
                                    >
                                        <Users className={`w-5 h-5 ${activeMainSection === 'students' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Students</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('teachers');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'teachers'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Teachers' : ''}
                                    >
                                        <Users className={`w-5 h-5 ${activeMainSection === 'teachers' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Teachers</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('subjects');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'subjects'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Subjects' : ''}
                                    >
                                        <BookOpen className={`w-5 h-5 ${activeMainSection === 'subjects' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Subjects</span>}
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
                                            onSectionChange('analytics');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'analytics'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Performance' : ''}
                                    >
                                        <BarChart3 className={`w-5 h-5 ${activeMainSection === 'analytics' ? 'text-indigo-700' : 'text-slate-400'}`} />
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
                                        <Calendar className={`w-5 h-5 ${activeMainSection === 'timetable' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Timetable</span>}
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* STUDENTS & PARENTS - category header with icon and dropdown */}
                    <li>
                        {!collapsed ? (
                            <button
                                onClick={() => toggleSection('studentsParents')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium text-slate-600">Parents</span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSections.studentsParents ? 'rotate-0' : '-rotate-90'
                                        }`}
                                />
                            </button>
                        ) : (
                            <button
                                onClick={() => toggleSection('studentsParents')}
                                className="w-full flex justify-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                                title="Students & Parents"
                            >
                                <Users className="w-5 h-5 text-slate-400" />
                            </button>
                        )}

                        {(collapsed || expandedSections.studentsParents) && (
                            <ul className={`space-y-1 ${!collapsed ? 'ml-6' : ''}`}>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('transfers');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'transfers'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Transfers' : ''}
                                    >
                                        <GraduationCap className={`w-5 h-5 ${activeMainSection === 'transfers' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Transfers</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('fees');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'fees'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Fees' : ''}
                                    >
                                        <Wallet className={`w-5 h-5 ${activeMainSection === 'fees' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Fees</span>}
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

                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('announcements');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'announcements'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Announcements' : ''}
                                    >
                                        <Megaphone className={`w-5 h-5 ${activeMainSection === 'announcements' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Announcements</span>}
                                    </button>
                                </li>
                                {/* ADD REMINDERS MENU ITEM HERE */}
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('reminders');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'reminders'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Reminders' : ''}
                                    >
                                        <Bell className={`w-5 h-5 ${activeMainSection === 'reminders' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Reminders</span>}
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>


                    {/* SCHOOL LIFE - category header with icon and dropdown */}
                    <li>
                        {!collapsed ? (
                            <button
                                onClick={() => toggleSection('schoolLife')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium text-slate-600">School Life</span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSections.schoolLife ? 'rotate-0' : '-rotate-90'
                                        }`}
                                />
                            </button>
                        ) : (
                            <button
                                onClick={() => toggleSection('schoolLife')}
                                className="w-full flex justify-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                                title="School Life"
                            >
                                <CalendarDays className="w-5 h-5 text-slate-400" />
                            </button>
                        )}

                        {(collapsed || expandedSections.schoolLife) && (
                            <ul className={`space-y-1 ${!collapsed ? 'ml-6' : ''}`}>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('programs');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'programs'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Programs' : ''}
                                    >
                                        <Trophy className={`w-5 h-5 ${activeMainSection === 'programs' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Programs</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('activities');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'activities'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Activities' : ''}
                                    >
                                        <Calendar className={`w-5 h-5 ${activeMainSection === 'activities' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Activities</span>}
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
                                            onSectionChange('gradeConfig');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'gradeConfig'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Grade Config' : ''}
                                    >
                                        <Settings className={`w-5 h-5 ${activeMainSection === 'gradeConfig' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Grade Config</span>}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            onSectionChange('settings');
                                            if (closeOnSelect) onMobileClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMainSection === 'settings'
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            } ${collapsed ? 'justify-center' : ''}`}
                                        title={collapsed ? 'Settings' : ''}
                                    >
                                        <Settings className={`w-5 h-5 ${activeMainSection === 'settings' ? 'text-indigo-700' : 'text-slate-400'}`} />
                                        {!collapsed && <span className="font-medium">Settings</span>}
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

export default AdminSidebar;


// import React, { useState } from 'react';
// import {
//     LayoutDashboard, Users, BookOpen, GraduationCap,
//     CalendarCheck, BarChart3, Wallet, MessageSquare,
//     Settings, LogOut, ChevronLeft, ChevronRight,
//     Calendar, X, ChevronDown,
//     FileText
// } from 'lucide-react';

// interface AdminSidebarProps {
//     activeMainSection: string;
//     onSectionChange: (section: string) => void;
//     onBack?: () => void;
//     isCollapsed?: boolean;
//     onToggle?: () => void;
//     isMobileOpen: boolean;
//     onMobileClose: () => void;
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
//     // Track which sections are expanded
//     const [expandedSections, setExpandedSections] = useState({
//         main: true,
//         academic: true,
//         studentsParents: true,
//         communication: true,
//         system: true
//     });

//     const menuSections = [
//         {
//             id: 'main',
//             title: "Main",
//             items: [
//                 { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//             ]
//         },
//         {
//             id: 'academic',
//             title: "Academic",
//             items: [
//                 { id: 'classes', label: 'Classes', icon: Users },
//                 { id: 'students', label: 'Students', icon: Users },
//                 { id: 'teachers', label: 'Teachers', icon: Users },
//                 { id: 'subjects', label: 'Subjects', icon: BookOpen },
//                 { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
//                 { id: 'results', label: 'Results', icon: FileText },
//                 { id: 'analytics', label: 'Performance', icon: BarChart3 },
//                 { id: 'timetable', label: 'Timetable', icon: Calendar },
//             ]
//         },
//         {
//             id: 'studentsParents',
//             title: "Students & Parents",
//             items: [
//                 { id: 'transfers', label: 'Transfers', icon: GraduationCap },
//                 { id: 'fees', label: 'Fees', icon: Wallet },
//             ]
//         },
//         {
//             id: 'communication',  // NEW SECTION
//             title: "Communication",
//             items: [
//                 { id: 'messages', label: 'Messages', icon: MessageSquare },
//             ]
//         },
//         {
//             id: 'system',
//             title: "System",
//             items: [
//                 { id: 'gradeConfig', label: 'Grade Config', icon: Settings },
//                 { id: 'settings', label: 'Settings', icon: Settings },
//             ]
//         }
//     ];

//     const toggleSection = (sectionId: string) => {
//         setExpandedSections(prev => ({
//             ...prev,
//             [sectionId]: !prev[sectionId as keyof typeof prev]
//         }));
//     };

//     const renderSidebarContent = (collapsed: boolean, closeOnSelect: boolean, showBranding: boolean) => (
//         <>
//             {/* Toggle buttons */}
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

//             {/* Branding */}
//             {showBranding && (
//                 <div className={`p-6 border-b border-slate-200 ${collapsed ? 'text-center' : ''}`}>
//                     {collapsed ? (
//                         <div className="w-10 h-10 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
//                             <span className="text-white font-bold text-lg">{schoolInitial}</span>
//                         </div>
//                     ) : (
//                         <div className="flex flex-col items-center">
//                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-md">
//                                 <span className="text-white font-bold text-2xl">{schoolInitial}</span>
//                             </div>
//                             <div className="text-center w-full max-w-[180px] group relative">
//                                 <h1 className="text-xl font-bold text-indigo-600 leading-tight break-words">
//                                     {schoolName}
//                                 </h1>
//                                 <p className="text-sm text-slate-500 truncate">Admin Portal</p>
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
//                 {menuSections.map((section) => {
//                     const isExpanded = expandedSections[section.id as keyof typeof expandedSections];

//                     return (
//                         <div key={section.id} className="mb-2">
//                             {/* Section Header - only show when not collapsed */}
//                             {!collapsed && (
//                                 <button
//                                     onClick={() => toggleSection(section.id)}
//                                     className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
//                                 >
//                                     <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
//                                         {section.title}
//                                     </p>
//                                     <ChevronDown
//                                         className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'
//                                             }`}
//                                     />
//                                 </button>
//                             )}

//                             {/* Section Items - only show when expanded OR sidebar is collapsed */}
//                             {(collapsed || isExpanded) && (
//                                 <ul className={`space-y-1 ${!collapsed && !isExpanded ? 'hidden' : ''} ${!collapsed && isExpanded ? 'mt-1' : ''}`}>
//                                     {section.items.map(item => {
//                                         const Icon = item.icon;
//                                         const isActive = activeMainSection === item.id;
//                                         return (
//                                             <li key={item.id}>
//                                                 <button
//                                                     onClick={() => {
//                                                         onSectionChange(item.id);
//                                                         if (closeOnSelect) onMobileClose();
//                                                     }}
//                                                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
//                                                         ? 'bg-indigo-50 text-indigo-700'
//                                                         : 'text-slate-600 hover:bg-slate-50'
//                                                         } ${collapsed ? 'justify-center' : ''}`}
//                                                     title={collapsed ? item.label : ''}
//                                                 >
//                                                     <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-700' : 'text-slate-400'}`} />
//                                                     {!collapsed && <span className="font-medium">{item.label}</span>}
//                                                 </button>
//                                             </li>
//                                         );
//                                     })}
//                                 </ul>
//                             )}
//                         </div>
//                     );
//                 })}
//             </nav>

//             <div className="p-4 border-t border-slate-200">
//                 <button
//                     onClick={() => {
//                         onBack?.();
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

//     return (
//         <>
//             {isMobileOpen && (
//                 <div
//                     className="fixed inset-0 bg-slate-900/30 z-40 md:hidden"
//                     onClick={onMobileClose}
//                 />
//             )}

//             <aside
//                 className={`hidden md:flex bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
//             >
//                 {renderSidebarContent(isCollapsed, false, true)}
//             </aside>

//             <aside
//                 className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 pt-36 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
//             >
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
//                 {renderSidebarContent(false, true, false)}
//             </aside>
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
//         { id: 'analytics', label: 'Performance', icon: BarChart3 },
//         { id: 'fees', label: 'Fees', icon: Wallet },
//         { id: 'messages', label: 'Messages', icon: MessageSquare },
//         { id: 'timetable', label: 'Timetable', icon: Calendar },
//         { id: 'settings', label: 'Settings', icon: Settings },
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
//                                 <p className="text-sm text-slate-500 truncate">Admin Portal</p>

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
//                 // className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 pt-28 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
//                 className={`md:hidden bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 w-64 transform transition-transform duration-300 pt-36 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
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

//                 {/* NEW (mobile): no sidebar branding */}
//                 {renderSidebarContent(false, true, false)}
//             </aside>

//             {/* END NEW (mobile drawer) */}
//         </>
//     );
// };

// export default AdminSidebar;