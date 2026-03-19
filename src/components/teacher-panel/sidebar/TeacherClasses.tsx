import React, { useState } from 'react';
import { Users, BookOpen, Calendar, ChevronRight, Search } from 'lucide-react';

interface TeacherClassesProps {
    classes: any[]; // Classes teacher is assigned to
    students?: any[]; // Optional: students data
    subjects?: any[]; // Optional: subjects data
    showMessage: (msg: string, isError?: boolean) => void;
    onViewResults: (classId: string) => void;
    onViewAttendance: (classId: string) => void;
}

const TeacherClasses: React.FC<TeacherClassesProps> = ({
    classes,
    students = [],
    subjects = [],
    showMessage,
    onViewResults,        // ADD THIS
    onViewAttendance      // ADD THIS
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState<any | null>(null);

    // Filter classes based on search
    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.term?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.academic_year?.includes(searchTerm)
    );

    // Get student count for a class
    const getStudentCount = (classId: string) => {
        return students.filter(s => s.class?.id === classId).length;
    };

    // Get subjects for a class (from assignments)
    const getClassSubjects = (classId: string) => {
        // This would need to be passed from parent or fetched
        return subjects.filter(s => s.classId === classId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
                    <p className="text-slate-500">View and manage your assigned classes</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search classes by name, term, or academic year..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Classes Grid */}
            {filteredClasses.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Classes Found</h3>
                    <p className="text-slate-500">
                        {searchTerm ? 'No classes match your search criteria.' : 'You are not assigned to any classes yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map(cls => (
                        <div
                            key={cls.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedClass(cls)}
                        >
                            <div className="p-6">
                                {/* Class Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                                        {cls.class_code?.slice(0, 8) || 'NEW'}
                                    </span>
                                </div>

                                {/* Class Details */}
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{cls.name}</h3>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-slate-600">
                                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                        <span className="text-sm">{cls.term} • {cls.academic_year}</span>
                                    </div>
                                    <div className="flex items-center text-slate-600">
                                        <Users className="w-4 h-4 mr-2 text-slate-400" />
                                        <span className="text-sm">{getStudentCount(cls.id)} Students</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-xs text-slate-400">Click to view details</span>
                                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Class Details Modal */}
            {selectedClass && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">{selectedClass.name}</h3>
                            <button
                                onClick={() => setSelectedClass(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Class Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="text-sm text-slate-500">Term</p>
                                    <p className="font-medium text-slate-800">{selectedClass.term}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="text-sm text-slate-500">Academic Year</p>
                                    <p className="font-medium text-slate-800">{selectedClass.academic_year}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="text-sm text-slate-500">Class Code</p>
                                    <p className="font-medium text-indigo-600">{selectedClass.class_code || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="text-sm text-slate-500">Total Students</p>
                                    <p className="font-medium text-slate-800">{getStudentCount(selectedClass.id)}</p>
                                </div>
                            </div>

                            {/* Students List */}
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-3">Students in this class</h4>
                                {students.filter(s => s.class?.id === selectedClass.id).length > 0 ? (
                                    <div className="space-y-2">
                                        {students
                                            .filter(s => s.class?.id === selectedClass.id)
                                            .map(student => (
                                                <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-slate-800">{student.name}</p>
                                                        <p className="text-sm text-indigo-600">{student.examNumber}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">No students in this class</p>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-4 border-t border-slate-200">
                                <button
                                    // onClick={() => {
                                    //     setSelectedClass(null);
                                    //     // Navigate to results for this class
                                    //     // This would need to be implemented
                                    // }}
                                    onClick={() => {
                                        onViewResults(selectedClass.id);  // Call the function passed from parent
                                        setSelectedClass(null);
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                                >
                                    Enter Results
                                </button>
                                <button
                                    // onClick={() => {
                                    //     setSelectedClass(null);
                                    //     // Navigate to attendance for this class
                                    // }}
                                    onClick={() => {
                                        onViewAttendance(selectedClass.id);  // Call the function passed from parent
                                        setSelectedClass(null);
                                    }}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm"
                                >
                                    View Attendance
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherClasses;