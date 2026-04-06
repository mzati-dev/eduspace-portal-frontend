// components/attendance/HistoryTab.tsx
import React from 'react';
import { Search, Clock } from 'lucide-react';
import { StudentAttendance } from './types';

interface HistoryTabProps {
    selectedClass: string;
    setSelectedClass: (classId: string) => void;
    classes: any[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    attendanceData: StudentAttendance[];
    loadingHistory: boolean;
    onViewHistory: (student: StudentAttendance) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
    selectedClass,
    setSelectedClass,
    classes,
    searchTerm,
    setSearchTerm,
    attendanceData,
    loadingHistory,
    onViewHistory
}) => {
    const filteredStudents = attendanceData.filter(s =>
        (selectedClass === 'all' || s.classId === selectedClass) &&
        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* History Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Attendance History</h3>

                {/* Filters - Only Class and Search */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Search Student</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or exam number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List with History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance Rate</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loadingHistory ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        Loading students...
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map(student => {
                                    const rate = ((attendanceData
                                        .filter(s => s.id === student.id)
                                        .filter(s => s.status === 'present' || s.status === 'late').length) /
                                        (attendanceData.filter(s => s.id === student.id).length || 1) * 100).toFixed(1);

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                            <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                            <td className="px-4 py-3 text-slate-600">{student.class}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(rate) >= 90 ? 'bg-green-100 text-green-700' :
                                                    Number(rate) >= 75 ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {rate}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => onViewHistory(student)}
                                                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors flex items-center gap-1"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    View History
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center text-slate-500 py-4">
                                        No students found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryTab;

// // components/attendance/HistoryTab.tsx
// import React from 'react';
// import { Search, Clock } from 'lucide-react';
// import { StudentAttendance } from './types';

// interface HistoryTabProps {
//     historyPeriod: 'month' | 'term';
//     setHistoryPeriod: (period: 'month' | 'term') => void;
//     selectedClass: string;
//     setSelectedClass: (classId: string) => void;
//     classes: any[];
//     searchTerm: string;
//     setSearchTerm: (term: string) => void;
//     attendanceData: StudentAttendance[];
//     loadingHistory: boolean;
//     onViewHistory: (student: StudentAttendance) => void;
// }

// const HistoryTab: React.FC<HistoryTabProps> = ({
//     historyPeriod,
//     setHistoryPeriod,
//     selectedClass,
//     setSelectedClass,
//     classes,
//     searchTerm,
//     setSearchTerm,
//     attendanceData,
//     loadingHistory,
//     onViewHistory
// }) => {
//     const filteredStudents = attendanceData.filter(s =>
//         (selectedClass === 'all' || s.classId === selectedClass) &&
//         (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     return (
//         <div className="space-y-6">
//             {/* History Header */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                 <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Attendance History</h3>

//                 {/* Filters */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
//                         <select
//                             value={historyPeriod}
//                             onChange={(e) => setHistoryPeriod(e.target.value as 'month' | 'term')}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                             <option value="month">Last 30 Days</option>
//                             <option value="term">Current Term</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
//                         <select
//                             value={selectedClass}
//                             onChange={(e) => setSelectedClass(e.target.value)}
//                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                             <option value="all">All Classes</option>
//                             {classes.map(cls => (
//                                 <option key={cls.id} value={cls.id}>{cls.name}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Search Student</label>
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Search by name or exam number..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Student List with History */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance Rate</th>
//                                 <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {loadingHistory ? (
//                                 <tr>
//                                     <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
//                                         Loading students...
//                                     </td>
//                                 </tr>
//                             ) : filteredStudents.length > 0 ? (
//                                 filteredStudents.map(student => {
//                                     const rate = ((attendanceData
//                                         .filter(s => s.id === student.id)
//                                         .filter(s => s.status === 'present' || s.status === 'late').length) /
//                                         (attendanceData.filter(s => s.id === student.id).length || 1) * 100).toFixed(1);

//                                     return (
//                                         <tr key={student.id} className="hover:bg-slate-50">
//                                             <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                             <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
//                                             <td className="px-4 py-3 text-slate-600">{student.class}</td>
//                                             <td className="px-4 py-3">
//                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(rate) >= 90 ? 'bg-green-100 text-green-700' :
//                                                     Number(rate) >= 75 ? 'bg-blue-100 text-blue-700' :
//                                                         'bg-amber-100 text-amber-700'
//                                                     }`}>
//                                                     {rate}%
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <button
//                                                     onClick={() => onViewHistory(student)}
//                                                     className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors flex items-center gap-1"
//                                                 >
//                                                     <Clock className="w-4 h-4" />
//                                                     View History
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })
//                             ) : (
//                                 <tr>
//                                     <td colSpan={5} className="text-center text-slate-500 py-4">
//                                         No students found
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default HistoryTab;