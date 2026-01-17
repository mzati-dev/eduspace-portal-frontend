import React from 'react';

interface TeacherTabsProps {
    activeTab: 'results' | 'classResults';
    onTabChange: (tab: 'results' | 'classResults') => void;
}

const TeacherTabs: React.FC<TeacherTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'results' as const, label: 'Enter Results' },
        { id: 'classResults' as const, label: 'Class Results' },

    ];

    // return (
    //     <div className="border-b border-slate-200">
    //         <nav className="-mb-px flex space-x-6">
    //             {tabs.map(tab => (
    //                 <button
    //                     key={tab.id}
    //                     onClick={() => onTabChange(tab.id)}
    //                     className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
    //                         ? 'border-indigo-500 text-indigo-600'
    //                         : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
    //                         }`}
    //                 >
    //                     {tab.label}
    //                 </button>
    //             ))}
    //         </nav>
    //     </div>
    // );

    return (
        <div className="border-b border-slate-200">
            <nav className="-mb-px flex justify-center gap-12">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`py-4 px-4 border-b-2 text-base font-semibold tracking-wide transition-colors
                        ${activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );

};

export default TeacherTabs;