import React from 'react';
import { StudentData } from '@/types';

interface StudentAcademicInfoProps {
    studentData: StudentData;
    schoolName: string;
}

const StudentAcademicInfo: React.FC<StudentAcademicInfoProps> = ({ studentData, schoolName }) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-32">
                {/* Student Information */}
                <div>
                    <h5 className="text-base md:text-lg font-bold text-blue-900 mb-3">Student Information</h5>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-blue-100 pb-2">
                            <span className="text-blue-700 font-medium text-xs md:text-sm">Student Name:</span>
                            <span className="text-blue-900 font-semibold text-xs md:text-sm">{studentData.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-blue-100 pb-2">
                            <span className="text-blue-700 font-medium text-xs md:text-sm">Exam Number:</span>
                            <span className="text-blue-900 font-semibold text-xs md:text-sm">{studentData.examNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-blue-100 pb-2">
                            <span className="text-blue-700 font-medium text-xs md:text-sm">Class:</span>
                            <span className="text-blue-900 font-semibold text-xs md:text-sm">{studentData.class || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div>
                    <h5 className="text-base md:text-lg font-bold text-indigo-900 mb-3">Academic Information</h5>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-indigo-100 pb-2">
                            <span className="text-indigo-700 font-medium text-xs md:text-sm">School Name:</span>
                            <span className="text-indigo-900 font-semibold text-xs md:text-sm">{schoolName}</span>
                        </div>
                        <div className="flex justify-between border-b border-indigo-100 pb-2">
                            <span className="text-indigo-700 font-medium text-xs md:text-sm">Academic Year:</span>
                            <span className="text-indigo-900 font-semibold text-xs md:text-sm">{studentData.academicYear || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-indigo-100 pb-2">
                            <span className="text-indigo-700 font-medium text-xs md:text-sm">Term:</span>
                            <span className="text-indigo-900 font-semibold text-xs md:text-sm">{studentData.term || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-indigo-100 pb-2">
                            <span className="text-indigo-700 font-medium text-xs md:text-sm">Total Enrollment:</span>
                            <span className="text-indigo-900 font-semibold text-xs md:text-sm">{studentData.totalStudents || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAcademicInfo;

// import React from 'react';
// import { StudentData } from '@/types';

// interface StudentAcademicInfoProps {
//     studentData: StudentData;
//     schoolName: string;
// }

// const StudentAcademicInfo: React.FC<StudentAcademicInfoProps> = ({ studentData, schoolName }) => {
//     return (
//         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-32">
//                 {/* Student Information */}
//                 <div>
//                     <h5 className="text-lg font-bold text-blue-900 mb-3">Student Information</h5>
//                     <div className="space-y-2">
//                         <div className="flex justify-between border-b border-blue-100 pb-2">
//                             <span className="text-blue-700 font-medium">Student Name:</span>
//                             <span className="text-blue-900 font-semibold">{studentData.name || 'N/A'}</span>
//                         </div>
//                         <div className="flex justify-between border-b border-blue-100 pb-2">
//                             <span className="text-blue-700 font-medium">Exam Number:</span>
//                             <span className="text-blue-900 font-semibold">{studentData.examNumber || 'N/A'}</span>
//                         </div>
//                         <div className="flex justify-between border-b border-blue-100 pb-2">
//                             <span className="text-blue-700 font-medium">Class:</span>
//                             <span className="text-blue-900 font-semibold">{studentData.class || 'N/A'}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Academic Information */}
//                 <div>
//                     <h5 className="text-lg font-bold text-indigo-900 mb-3">Academic Information</h5>
//                     <div className="space-y-2">
//                         <div className="flex justify-between border-b border-indigo-100 pb-2">
//                             <span className="text-indigo-700 font-medium">School Name:</span>
//                             <span className="text-indigo-900 font-semibold">{schoolName}</span>
//                         </div>
//                         <div className="flex justify-between border-b border-indigo-100 pb-2">
//                             <span className="text-indigo-700 font-medium">Academic Year:</span>
//                             <span className="text-indigo-900 font-semibold">{studentData.academicYear || 'N/A'}</span>
//                         </div>
//                         <div className="flex justify-between border-b border-indigo-100 pb-2">
//                             <span className="text-indigo-700 font-medium">Term:</span>
//                             <span className="text-indigo-900 font-semibold">{studentData.term || 'N/A'}</span>
//                         </div>
//                         <div className="flex justify-between border-b border-indigo-100 pb-2">
//                             <span className="text-indigo-700 font-medium">Total Enrollment:</span>
//                             <span className="text-indigo-900 font-semibold">{studentData.totalStudents || 'N/A'}</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default StudentAcademicInfo;