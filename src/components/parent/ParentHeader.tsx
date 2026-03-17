// components/ParentHeader.tsx
import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';

interface ParentHeaderProps {
    onBack: () => void;
    childName?: string;
    notificationCount: number;
}

const ParentHeader: React.FC<ParentHeaderProps> = ({
    onBack,
    childName,
    notificationCount
}) => {
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

                {/* Profile Dropdown */}
                <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold">P</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                </button>
            </div>
        </header>
    );
};

export default ParentHeader;