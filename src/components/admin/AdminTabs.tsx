import React from 'react';
import { Users, BookOpen, FileText, Settings, Award, Globe } from 'lucide-react';

interface AdminTabsProps {
    activeTab: 'classes' | 'students' | 'teachers' | 'subjects' | 'results' | 'gradeConfig' | 'classResults' | 'externalResults';
    onTabChange: (tab: 'classes' | 'students' | 'teachers' | 'subjects' | 'results' | 'gradeConfig' | 'classResults' | 'externalResults') => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        // { id: 'classes' as const, label: 'Manage Classes', icon: Users },
        // { id: 'students' as const, label: 'Manage Students', icon: Users },
        // { id: 'teachers' as const, label: 'Manage Teachers', icon: Users },
        // { id: 'subjects' as const, label: 'Manage Subjects', icon: BookOpen },
        { id: 'results' as const, label: 'Enter Results', icon: FileText },
        { id: 'classResults' as const, label: 'Internal Results', icon: Award },
        { id: 'externalResults' as const, label: 'External Results', icon: Globe },
        // { id: 'gradeConfig' as const, label: 'Grade Configuration', icon: Settings },
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default AdminTabs;