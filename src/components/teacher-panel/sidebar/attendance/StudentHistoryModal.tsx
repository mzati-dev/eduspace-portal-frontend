import React from 'react';
import { StudentAttendance } from './TeacherAttendance';

interface Props {
    student: StudentAttendance;
    studentHistory: any[];
    selectedTerm: string;
    availableTerms: Array<{ id: string; name: string; startDate: string; endDate: string }>;
    loadingHistory: boolean;
    onClose: () => void;
    onTermChange: (termId: string) => void;
}

const StudentHistoryModal: React.FC<Props> = ({
    student,
    studentHistory,
    selectedTerm,
    availableTerms,
    loadingHistory,
    onClose,
    onTermChange
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">
                                Attendance History: {student.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Exam: {student.examNumber}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Term Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Term</label>
                        <select
                            value={selectedTerm}
                            onChange={(e) => onTermChange(e.target.value)}
                            className="w-full md:w-64 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="" disabled>Select a term</option>
                            {availableTerms.map(term => (
                                <option key={term.id} value={term.id}>
                                    {term.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* History Table */}
                    {loadingHistory ? (
                        <div className="text-center py-8 text-slate-500">Loading history...</div>
                    ) : studentHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Date</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Status</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Check-in Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {studentHistory.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                    record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                        record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-slate-600">{record.checkInTime || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            No attendance records found for this period
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentHistoryModal;

// import React from 'react';
// import { StudentAttendance } from './TeacherAttendance';

// interface Props {
//     student: StudentAttendance;
//     studentHistory: any[];
//     historyPeriod: 'month' | 'term';
//     loadingHistory: boolean;
//     onClose: () => void;
//     onPeriodChange: (period: 'month' | 'term') => void;
// }

// const StudentHistoryModal: React.FC<Props> = ({
//     student,
//     studentHistory,
//     historyPeriod,
//     loadingHistory,
//     onClose,
//     onPeriodChange
// }) => {
//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
//                 <div className="p-6">
//                     <div className="flex justify-between items-center mb-6">
//                         <div>
//                             <h3 className="text-xl font-bold text-slate-800">
//                                 Attendance History: {student.name}
//                             </h3>
//                             <p className="text-sm text-slate-500">
//                                 Exam: {student.examNumber}
//                             </p>
//                         </div>
//                         <button
//                             onClick={onClose}
//                             className="text-slate-400 hover:text-slate-600"
//                         >
//                             ✕
//                         </button>
//                     </div>

//                     {/* Period Selector */}
//                     <div className="flex gap-2 mb-6">
//                         <button
//                             onClick={() => onPeriodChange('month')}
//                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${historyPeriod === 'month'
//                                 ? 'bg-indigo-600 text-white'
//                                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                 }`}
//                         >
//                             Last 30 Days
//                         </button>
//                         <button
//                             onClick={() => onPeriodChange('term')}
//                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${historyPeriod === 'term'
//                                 ? 'bg-indigo-600 text-white'
//                                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                 }`}
//                         >
//                             Current Term
//                         </button>
//                     </div>

//                     {/* History Table */}
//                     {loadingHistory ? (
//                         <div className="text-center py-8 text-slate-500">Loading history...</div>
//                     ) : studentHistory.length > 0 ? (
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Date</th>
//                                         <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Status</th>
//                                         <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Check-in Time</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {studentHistory.map((record, idx) => (
//                                         <tr key={idx} className="hover:bg-slate-50">
//                                             <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
//                                             <td className="px-4 py-2">
//                                                 <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'present' ? 'bg-green-100 text-green-700' :
//                                                     record.status === 'absent' ? 'bg-red-100 text-red-700' :
//                                                         record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
//                                                             'bg-blue-100 text-blue-700'
//                                                     }`}>
//                                                     {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-2 text-slate-600">{record.checkInTime || '—'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     ) : (
//                         <div className="text-center py-8 text-slate-500">
//                             No attendance records found for this period
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default StudentHistoryModal;