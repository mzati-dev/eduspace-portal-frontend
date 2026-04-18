// components/teacher/analytics/TeacherCompareTerms.tsx
import React, { useState } from 'react';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Download,
    Filter
} from 'lucide-react';
import { TeacherCompareData } from './TeacherAnalyticsTypes';

interface TeacherCompareTermsProps {
    loading: boolean;
    term1: string;
    term2: string;
    setTerm1: (term: string) => void;
    setTerm2: (term: string) => void;
    compareData: TeacherCompareData | null;
    onCompare: () => void;
    onBack: () => void;
    onExportReport: () => void;
    teacherClasses?: any[];
    onFilterByClass?: (classId: string) => void;
    availableTerms?: { value: string; label: string }[];
}

const TeacherCompareTerms: React.FC<TeacherCompareTermsProps> = ({
    loading,
    term1,
    term2,
    setTerm1,
    setTerm2,
    compareData,
    onCompare,
    onBack,
    onExportReport,
    teacherClasses = [],
    onFilterByClass,
    availableTerms = []
}) => {
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

    const handleClassFilterChange = (classId: string) => {
        setSelectedClassFilter(classId);
        if (onFilterByClass) {
            onFilterByClass(classId);
        }
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-slate-600';
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="w-4 h-4" />;
        if (change < 0) return <TrendingDown className="w-4 h-4" />;
        return null;
    };

    const getStatusBadge = (status: string) => {
        if (status.includes('Significant') || status.includes('Critical')) {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">🔴 {status}</span>;
        }
        if (status.includes('Slight') || status.includes('Needs')) {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">🟡 {status}</span>;
        }
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">🟢 {status}</span>;
    };

    const selectedClassName = teacherClasses.find(c => c.id === selectedClassFilter)?.name;

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading comparison data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Class Analytics – Compare Mode</h2>
                    <p className="text-slate-500">
                        Compare performance across two terms for your classes
                        {selectedClassFilter !== 'all' && selectedClassName && (
                            <span className="ml-2 text-indigo-600">- {selectedClassName}</span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onExportReport}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {teacherClasses.length > 0 && (
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Filter by Class:</span>
                        <select
                            value={selectedClassFilter}
                            onChange={(e) => handleClassFilterChange(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <option value="all">All My Classes</option>
                            {teacherClasses.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                        {selectedClassFilter !== 'all' && (
                            <button
                                onClick={() => handleClassFilterChange('all')}
                                className="text-xs text-red-600 hover:text-red-800"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Compare Term 1</label>
                        <select
                            value={term1}
                            onChange={(e) => setTerm1(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            {availableTerms.map(term => (
                                <option key={term.value} value={term.value}>{term.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">vs Term 2</label>
                        <select
                            value={term2}
                            onChange={(e) => setTerm2(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            {availableTerms.filter(t => t.value !== term1).map(term => (
                                <option key={term.value} value={term.value}>{term.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button
                    onClick={onCompare}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                    Compare Terms
                </button>
            </div>

            {compareData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <p className="text-sm text-slate-500 mb-2">Overall Pass %</p>
                            <div className="flex justify-between items-baseline">
                                <p className="text-2xl font-bold text-slate-800">{compareData.overallPass1}%</p>
                                <p className="text-lg text-slate-400">vs</p>
                                <p className="text-2xl font-bold text-slate-800">{compareData.overallPass2}%</p>
                            </div>
                            <p className={`text-sm mt-2 flex items-center gap-1 ${getChangeColor(compareData.overallPass1 - compareData.overallPass2)}`}>
                                {getChangeIcon(compareData.overallPass1 - compareData.overallPass2)}
                                {Math.abs(compareData.overallPass1 - compareData.overallPass2)}% change
                            </p>
                            {selectedClassFilter !== 'all' && (
                                <p className="text-xs text-indigo-600 mt-2">Filtered by class</p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <p className="text-sm text-slate-500 mb-2">Average Score</p>
                            <div className="flex justify-between items-baseline">
                                <p className="text-2xl font-bold text-slate-800">{compareData.avgScore1}%</p>
                                <p className="text-lg text-slate-400">vs</p>
                                <p className="text-2xl font-bold text-slate-800">{compareData.avgScore2}%</p>
                            </div>
                            <p className={`text-sm mt-2 flex items-center gap-1 ${getChangeColor(compareData.avgScore1 - compareData.avgScore2)}`}>
                                {getChangeIcon(compareData.avgScore1 - compareData.avgScore2)}
                                {Math.abs(compareData.avgScore1 - compareData.avgScore2)}% change
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <p className="text-sm text-slate-500 mb-2">Avg Attendance</p>
                            <div className="flex justify-between items-baseline">
                                <p className="text-2xl font-bold text-slate-800">{compareData.avgAttendance1}%</p>
                                <p className="text-lg text-slate-400">vs</p>
                                <p className="text-2xl font-bold text-slate-800">{compareData.avgAttendance2}%</p>
                            </div>
                            <p className={`text-sm mt-2 flex items-center gap-1 ${getChangeColor(compareData.avgAttendance1 - compareData.avgAttendance2)}`}>
                                {getChangeIcon(compareData.avgAttendance1 - compareData.avgAttendance2)}
                                {Math.abs(compareData.avgAttendance1 - compareData.avgAttendance2)}% change
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">
                            My Classes Comparison
                            {selectedClassFilter !== 'all' && selectedClassName && (
                                <span className="text-sm font-normal text-indigo-600 ml-2">- {selectedClassName}</span>
                            )}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 py-3">Class</th>
                                        <th className="text-left px-4 py-3">Pass % {compareData.term1}</th>
                                        <th className="text-left px-4 py-3">Pass % {compareData.term2}</th>
                                        <th className="text-left px-4 py-3">Change</th>
                                        <th className="text-left px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {compareData.classes
                                        .filter(cls => selectedClassFilter === 'all' || cls.name === selectedClassName)
                                        .map((cls, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium">{cls.name}</td>
                                                <td className="px-4 py-3">{Math.round(cls.passRate1)}%</td>
                                                <td className="px-4 py-3">{Math.round(cls.passRate2)}%</td>
                                                <td className={`px-4 py-3 font-medium ${getChangeColor(cls.change)}`}>
                                                    {getChangeIcon(cls.change)} {Math.abs(cls.change)}%
                                                </td>
                                                <td className="px-4 py-3">{getStatusBadge(cls.status)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {compareData.newRiskStudents.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                New At-Risk Students (Not at risk in {compareData.term2}, now at risk in {compareData.term1})
                                {selectedClassFilter !== 'all' && selectedClassName && (
                                    <span className="text-sm font-normal text-indigo-600 ml-2">- {selectedClassName}</span>
                                )}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left px-4 py-3">Student Name</th>
                                            <th className="text-left px-4 py-3">Class</th>
                                            <th className="text-left px-4 py-3">{compareData.term1} Att</th>
                                            <th className="text-left px-4 py-3">{compareData.term1} Marks</th>
                                            <th className="text-left px-4 py-3">{compareData.term2} Marks</th>
                                            <th className="text-left px-4 py-3">Drop</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {compareData.newRiskStudents
                                            .filter(student => selectedClassFilter === 'all' || student.className === selectedClassName)
                                            .map((student, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-indigo-600">{student.name}</td>
                                                    <td className="px-4 py-3">{student.className}</td>
                                                    <td className="px-4 py-3">{student.att2}%</td>
                                                    <td className="px-4 py-3">{student.marks2}%</td>
                                                    <td className="px-4 py-3">{student.marks1}%</td>
                                                    <td className="px-4 py-3 text-red-600 font-medium">{student.drop}% ⚠️</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!compareData && !loading && (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">Select two terms and click "Compare Terms" to see results</p>
                </div>
            )}
        </div>
    );
};

export default TeacherCompareTerms;

// // components/teacher/analytics/TeacherCompareTerms.tsx
// import React, { useState } from 'react';
// import {
//     ArrowLeft,
//     TrendingUp,
//     TrendingDown,
//     AlertTriangle,
//     Download,
//     Filter
// } from 'lucide-react';
// import { TeacherCompareData } from './TeacherAnalyticsTypes';

// interface TeacherCompareTermsProps {
//     loading: boolean;
//     term1: string;
//     term2: string;
//     setTerm1: (term: string) => void;
//     setTerm2: (term: string) => void;
//     compareData: TeacherCompareData | null;
//     onCompare: () => void;
//     onBack: () => void;
//     onExportReport: () => void;
//     // NEW: Class filtering props
//     teacherClasses?: any[];
//     onFilterByClass?: (classId: string) => void;
// }

// const TeacherCompareTerms: React.FC<TeacherCompareTermsProps> = ({
//     loading,
//     term1,
//     term2,
//     setTerm1,
//     setTerm2,
//     compareData,
//     onCompare,
//     onBack,
//     onExportReport,
//     teacherClasses = [],
//     onFilterByClass
// }) => {
//     const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
//     const availableTerms = ['Term 4, 2025', 'Term 3, 2025', 'Term 2, 2025', 'Term 1, 2025'];

//     const handleClassFilterChange = (classId: string) => {
//         setSelectedClassFilter(classId);
//         if (onFilterByClass) {
//             onFilterByClass(classId);
//         }
//     };

//     const getChangeColor = (change: number) => {
//         if (change > 0) return 'text-green-600';
//         if (change < 0) return 'text-red-600';
//         return 'text-slate-600';
//     };

//     const getChangeIcon = (change: number) => {
//         if (change > 0) return <TrendingUp className="w-4 h-4" />;
//         if (change < 0) return <TrendingDown className="w-4 h-4" />;
//         return null;
//     };

//     const getStatusBadge = (status: string) => {
//         if (status.includes('Significant') || status.includes('Critical')) {
//             return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">🔴 {status}</span>;
//         }
//         if (status.includes('Slight') || status.includes('Needs')) {
//             return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">🟡 {status}</span>;
//         }
//         return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">🟢 {status}</span>;
//     };

//     // Get selected class name
//     const selectedClassName = teacherClasses.find(c => c.id === selectedClassFilter)?.name;

//     if (loading) {
//         return (
//             <div className="bg-white rounded-xl p-12 text-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
//                 <p className="text-slate-500 mt-2">Loading comparison data...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">My Class Analytics – Compare Mode</h2>
//                     <p className="text-slate-500">
//                         Compare performance across two terms for your classes
//                         {selectedClassFilter !== 'all' && selectedClassName && (
//                             <span className="ml-2 text-indigo-600">- {selectedClassName}</span>
//                         )}
//                     </p>
//                 </div>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={onExportReport}
//                         className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
//                     >
//                         <Download className="w-4 h-4" />
//                         Export Report
//                     </button>
//                 </div>
//             </div>

//             {/* Class Filter & Term Selectors */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 {/* Class Filter - Only show if teacher has multiple classes */}
//                 {teacherClasses.length > 0 && (
//                     <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200">
//                         <Filter className="w-4 h-4 text-slate-400" />
//                         <span className="text-sm font-medium text-slate-700">Filter by Class:</span>
//                         <select
//                             value={selectedClassFilter}
//                             onChange={(e) => handleClassFilterChange(e.target.value)}
//                             className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
//                         >
//                             <option value="all">All My Classes</option>
//                             {teacherClasses.map(cls => (
//                                 <option key={cls.id} value={cls.id}>{cls.name}</option>
//                             ))}
//                         </select>
//                         {selectedClassFilter !== 'all' && (
//                             <button
//                                 onClick={() => handleClassFilterChange('all')}
//                                 className="text-xs text-red-600 hover:text-red-800"
//                             >
//                                 Clear Filter
//                             </button>
//                         )}
//                     </div>
//                 )}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">Compare Term 1</label>
//                         <select
//                             value={term1}
//                             onChange={(e) => setTerm1(e.target.value)}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                             {availableTerms.map(term => (
//                                 <option key={term} value={term}>{term}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">vs Term 2</label>
//                         <select
//                             value={term2}
//                             onChange={(e) => setTerm2(e.target.value)}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                             {availableTerms.filter(t => t !== term1).map(term => (
//                                 <option key={term} value={term}>{term}</option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//                 <button
//                     onClick={onCompare}
//                     className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
//                 >
//                     Compare Terms
//                 </button>
//             </div>

//             {compareData && (
//                 <>
//                     {/* Comparison KPIs */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                             <p className="text-sm text-slate-500 mb-2">Overall Pass %</p>
//                             <div className="flex justify-between items-baseline">
//                                 <p className="text-2xl font-bold text-slate-800">{compareData.overallPass1}%</p>
//                                 <p className="text-lg text-slate-400">vs</p>
//                                 <p className="text-2xl font-bold text-slate-800">{compareData.overallPass2}%</p>
//                             </div>
//                             <p className={`text-sm mt-2 flex items-center gap-1 ${getChangeColor(compareData.overallPass1 - compareData.overallPass2)}`}>
//                                 {getChangeIcon(compareData.overallPass1 - compareData.overallPass2)}
//                                 {Math.abs(compareData.overallPass1 - compareData.overallPass2)}% change
//                             </p>
//                             {selectedClassFilter !== 'all' && (
//                                 <p className="text-xs text-indigo-600 mt-2">Filtered by class</p>
//                             )}
//                         </div>

//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                             <p className="text-sm text-slate-500 mb-2">Average Score</p>
//                             <div className="flex justify-between items-baseline">
//                                 <p className="text-2xl font-bold text-slate-800">{compareData.avgScore1}%</p>
//                                 <p className="text-lg text-slate-400">vs</p>
//                                 <p className="text-2xl font-bold text-slate-800">{compareData.avgScore2}%</p>
//                             </div>
//                             <p className={`text-sm mt-2 flex items-center gap-1 ${getChangeColor(compareData.avgScore1 - compareData.avgScore2)}`}>
//                                 {getChangeIcon(compareData.avgScore1 - compareData.avgScore2)}
//                                 {Math.abs(compareData.avgScore1 - compareData.avgScore2)}% change
//                             </p>
//                         </div>

//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//                             <p className="text-sm text-slate-500 mb-2">Avg Attendance</p>
//                             <div className="flex justify-between items-baseline">
//                                 <p className="text-2xl font-bold text-slate-800">{compareData.avgAttendance1}%</p>
//                                 <p className="text-lg text-slate-400">vs</p>
//                                 <p className="text-2xl font-bold text-slate-800">{compareData.avgAttendance2}%</p>
//                             </div>
//                             <p className={`text-sm mt-2 flex items-center gap-1 ${getChangeColor(compareData.avgAttendance1 - compareData.avgAttendance2)}`}>
//                                 {getChangeIcon(compareData.avgAttendance1 - compareData.avgAttendance2)}
//                                 {Math.abs(compareData.avgAttendance1 - compareData.avgAttendance2)}% change
//                             </p>
//                         </div>
//                     </div>

//                     {/* Class Comparison - Filter classes based on selection */}
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                         <h3 className="font-semibold text-slate-800 mb-4">
//                             My Classes Comparison
//                             {selectedClassFilter !== 'all' && selectedClassName && (
//                                 <span className="text-sm font-normal text-indigo-600 ml-2">- {selectedClassName}</span>
//                             )}
//                         </h3>
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-sm">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="text-left px-4 py-3">Class</th>
//                                         <th className="text-left px-4 py-3">Pass % {compareData.term1}</th>
//                                         <th className="text-left px-4 py-3">Pass % {compareData.term2}</th>
//                                         <th className="text-left px-4 py-3">Change</th>
//                                         <th className="text-left px-4 py-3">Status</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {compareData.classes
//                                         .filter(cls => selectedClassFilter === 'all' || cls.name === selectedClassName)
//                                         .map((cls, idx) => (
//                                             <tr key={idx} className="hover:bg-slate-50">
//                                                 <td className="px-4 py-3 font-medium">{cls.name}</td>
//                                                 <td className="px-4 py-3">{Math.round(cls.passRate1)}%</td>
//                                                 <td className="px-4 py-3">{Math.round(cls.passRate2)}%</td>
//                                                 <td className={`px-4 py-3 font-medium ${getChangeColor(cls.change)}`}>
//                                                     {getChangeIcon(cls.change)} {Math.abs(cls.change)}%
//                                                 </td>
//                                                 <td className="px-4 py-3">{getStatusBadge(cls.status)}</td>
//                                             </tr>
//                                         ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* New At-Risk Students - Filter by class */}
//                     {compareData.newRiskStudents.length > 0 && (
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                             <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                                 <AlertTriangle className="w-5 h-5 text-amber-600" />
//                                 New At-Risk Students (Not at risk in {compareData.term2}, now at risk in {compareData.term1})
//                                 {selectedClassFilter !== 'all' && selectedClassName && (
//                                     <span className="text-sm font-normal text-indigo-600 ml-2">- {selectedClassName}</span>
//                                 )}
//                             </h3>
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-sm">
//                                     <thead className="bg-slate-50">
//                                         <tr>
//                                             <th className="text-left px-4 py-3">Student Name</th>
//                                             <th className="text-left px-4 py-3">Class</th>
//                                             <th className="text-left px-4 py-3">{compareData.term1} Att</th>
//                                             <th className="text-left px-4 py-3">{compareData.term1} Marks</th>
//                                             <th className="text-left px-4 py-3">{compareData.term2} Marks</th>
//                                             <th className="text-left px-4 py-3">Drop</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-slate-100">
//                                         {compareData.newRiskStudents
//                                             .filter(student => selectedClassFilter === 'all' || student.className === selectedClassName)
//                                             .map((student, idx) => (
//                                                 <tr key={idx} className="hover:bg-slate-50">
//                                                     <td className="px-4 py-3 font-medium text-indigo-600">{student.name}</td>
//                                                     <td className="px-4 py-3">{student.className}</td>
//                                                     <td className="px-4 py-3">{student.att2}%</td>
//                                                     <td className="px-4 py-3">{student.marks2}%</td>
//                                                     <td className="px-4 py-3">{student.marks1}%</td>
//                                                     <td className="px-4 py-3 text-red-600 font-medium">{student.drop}% ⚠️</td>
//                                                 </tr>
//                                             ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     )}
//                 </>
//             )}

//             {!compareData && !loading && (
//                 <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
//                     <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
//                     <p className="text-slate-500">Select two terms and click "Compare Terms" to see results</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TeacherCompareTerms;