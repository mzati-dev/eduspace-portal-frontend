// components/sidebar/ParentSidebar.tsx
import React from 'react';
import {
    LayoutDashboard, FileText, Clock, CreditCard, MessageCircle,
    Calendar, User, LogOut, ChevronLeft, ChevronRight, Bell
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
}

const ParentSidebar: React.FC<ParentSidebarProps> = ({
    activeMainSection,
    onSectionChange,
    onBack,
    isCollapsed,
    onToggle,
    parentName,
    parentInitial,
    unreadCount
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

    return (
        <div className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'
            }`}>
            {/* School Logo/Name */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
                {!isCollapsed ? (
                    <>
                        <span className="font-bold text-xl text-emerald-600">EduTrack</span>
                        <button
                            onClick={onToggle}
                            className="p-1.5 rounded-lg hover:bg-slate-100"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onToggle}
                        className="w-full flex justify-center p-1.5 rounded-lg hover:bg-slate-100"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                )}
            </div>

            {/* Parent Info */}
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold text-lg">
                            {parentInitial}
                        </span>
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="font-medium text-slate-800 truncate">{parentName}</p>
                            <p className="text-xs text-slate-500">Parent</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="py-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMainSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSectionChange(item.id)}
                            className={`w-full flex items-center px-4 py-3 transition-colors relative ${isActive
                                    ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600'
                                    : 'text-slate-600 hover:bg-slate-50'
                                } ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
                        >
                            <div className="relative">
                                <Icon className="w-5 h-5" />
                                {item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            {!isCollapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Back to Role Selection */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
                <button
                    onClick={onBack}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''
                        }`}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span>Switch Role</span>}
                </button>
            </div>
        </div>
    );
};

export default ParentSidebar;