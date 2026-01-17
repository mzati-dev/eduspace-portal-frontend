import React from 'react';

interface TeacherHeaderProps {
    onBack: () => void;
}

const TeacherHeader: React.FC<TeacherHeaderProps> = ({ onBack }) => {
    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

                {/* Use grid for perfect alignment */}
                <div className="grid grid-cols-3 items-center">

                    {/* Left (empty for balance) */}
                    <div />

                    {/* Centered title */}
                    <div className="text-center">
                        <h1 className="text-xl font-semibold text-slate-900">
                            Teacher Panel
                        </h1>
                        <p className="text-sm text-slate-500">
                            Enter scores, view results
                        </p>
                    </div>

                    {/* Right-aligned logout */}
                    <div className="flex justify-end">
                        <button
                            onClick={onBack}
                            className="px-4 py-2 rounded-md border border-slate-300
           text-slate-600 font-medium
           hover:bg-slate-100 hover:text-slate-900
           transition"

                        >
                            Logout
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default TeacherHeader;


// import React from 'react';
// import { ArrowLeft, User } from 'lucide-react';

// interface TeacherHeaderProps {
//     onBack: () => void;
// }

// const TeacherHeader: React.FC<TeacherHeaderProps> = ({ onBack }) => {
//     return (
//         <header className="bg-white shadow">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">

//                         <div className="h-6 w-px bg-slate-300" />
//                         <div className="flex items-center gap-3">
//                             <div className="p-2 bg-indigo-100 rounded-lg">
//                                 <User className="w-6 h-6 text-indigo-600" />
//                             </div>
//                             <div>
//                                 <h1 className="text-xl font-semibold text-slate-900">Teacher Panel</h1>
//                                 <p className="text-sm text-slate-500">Enter scores, view results, manage subjects</p>
//                             </div>
//                         </div>
//                         <button
//                             onClick={onBack}
//                             className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-slate-600 hover:text-slate-900"
//                         >
//                             <ArrowLeft className="w-5 h-5" />
//                             Logout
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default TeacherHeader;