// // components/admin/StudentDetailsPage.tsx
// import React, { useState } from 'react';
// import { ArrowLeft, Eye, X } from 'lucide-react';
// import { Student } from '@/types/admin';

// interface StudentDetailsPageProps {
//     students: Student[];
//     classes: any[];
//     onBack: () => void;
// }

// const StudentDetailsPage: React.FC<StudentDetailsPageProps> = ({ students, classes, onBack }) => {
//     const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

//     // Group students by class
//     const classSummary = classes
//         .map(cls => ({
//             ...cls,
//             students: students.filter(s => s.class?.id === cls.id)
//         }))
//         .filter(c => c.students.length > 0);

//     const formatStudentDetails = (student: Student) => {
//         return (
//             <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                     <div>
//                         <h4 className="font-semibold text-indigo-600 mb-2">STUDENT INFORMATION</h4>
//                         <p><span className="font-medium">Name:</span> {student.name}</p>
//                         <p><span className="font-medium">Exam Number:</span> {student.examNumber}</p>
//                         <p><span className="font-medium">Class:</span> {student.class?.name || 'N/A'}</p>
//                         <p><span className="font-medium">Term:</span> {student.term || 'N/A'}</p>
//                         <p><span className="font-medium">EMIS Code:</span> {student.emis_code || 'Not provided'}</p>
//                     </div>
//                     <div>
//                         <h4 className="font-semibold text-indigo-600 mb-2">PARENT/GUARDIAN</h4>
//                         <p><span className="font-medium">Name:</span> {student.parent?.name || 'Not provided'}</p>
//                         <p><span className="font-medium">Relationship:</span> {student.parent?.relationship || 'Not provided'}</p>
//                         <p><span className="font-medium">Phone:</span> {student.parent?.phone || 'Not provided'}</p>
//                         <p><span className="font-medium">Alt Phone:</span> {student.parent?.alternate_phone || 'Not provided'}</p>
//                         <p><span className="font-medium">Email:</span> {student.parent?.email || 'Not provided'}</p>
//                         <p><span className="font-medium">National ID:</span> {student.parent?.national_id || 'Not provided'}</p>
//                         <p><span className="font-medium">Occupation:</span> {student.parent?.occupation || 'Not provided'}</p>
//                         <p><span className="font-medium">Address:</span> {student.parent?.address || 'Not provided'}</p>
//                     </div>
//                 </div>
//                 <div>
//                     <h4 className="font-semibold text-indigo-600 mb-2">EMERGENCY CONTACT</h4>
//                     <p><span className="font-medium">Name:</span> {student.emergency_contact?.name || 'Not provided'}</p>
//                     <p><span className="font-medium">Phone:</span> {student.emergency_contact?.phone || 'Not provided'}</p>
//                     <p><span className="font-medium">Relationship:</span> {student.emergency_contact?.relationship || 'Not provided'}</p>
//                 </div>
//                 <div>
//                     <h4 className="font-semibold text-indigo-600 mb-2">PREFERENCES</h4>
//                     <p><span className="font-medium">Preferred Contact:</span> {student.parent?.preferred_contact || 'Not specified'}</p>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header with back button */}
//             {/* Header with back button - IMPROVED VERSION */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 sticky top-0 z-10">
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <button
//                             onClick={onBack}
//                             className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group"
//                             title="Go back"
//                         >
//                             <ArrowLeft className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
//                         </button>
//                         <div>
//                             <h1 className="text-2xl font-bold text-slate-800">All Students Directory</h1>
//                             <p className="text-sm text-slate-500 mt-1">View and manage all student records</p>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                         <div className="px-4 py-2 bg-indigo-50 rounded-lg">
//                             <span className="text-sm font-medium text-indigo-700">
//                                 Total Students: <span className="text-lg font-bold ml-1">{students.length}</span>
//                             </span>
//                         </div>
//                         <div className="px-4 py-2 bg-emerald-50 rounded-lg">
//                             <span className="text-sm font-medium text-emerald-700">
//                                 Classes: <span className="text-lg font-bold ml-1">{classSummary.length}</span>
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Students by Class */}
//             <div className="space-y-8">
//                 {classSummary.map(cls => (
//                     <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//                         <div className="flex items-center justify-between mb-4">
//                             <h2 className="text-xl font-semibold text-slate-800">
//                                 {cls.name} - {cls.term} ({cls.academic_year})
//                             </h2>
//                             <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
//                                 {cls.students.length} students
//                             </span>
//                         </div>

//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student Name</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Parent Name</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Phone</th>
//                                         <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">EMIS</th>
//                                         <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {cls.students.map((student) => (
//                                         <tr key={student.id} className="hover:bg-slate-50">
//                                             <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
//                                             <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
//                                             <td className="px-4 py-3 text-slate-600">{student.parent?.name || '-'}</td>
//                                             <td className="px-4 py-3 text-slate-600">{student.parent?.phone || '-'}</td>
//                                             <td className="px-4 py-3 text-slate-600">{student.emis_code || '-'}</td>
//                                             <td className="px-4 py-3 text-right">
//                                                 <button
//                                                     onClick={() => setSelectedStudent(student)}
//                                                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                                     title="View full details"
//                                                 >
//                                                     <Eye className="w-4 h-4" />
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Details Modal */}
//             {selectedStudent && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
//                             <h3 className="text-xl font-bold text-slate-800">Student Full Details</h3>
//                             <button
//                                 onClick={() => setSelectedStudent(null)}
//                                 className="p-2 hover:bg-slate-100 rounded-lg"
//                             >
//                                 <X className="w-5 h-5 text-slate-500" />
//                             </button>
//                         </div>
//                         <div className="p-6">
//                             {formatStudentDetails(selectedStudent)}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default StudentDetailsPage;