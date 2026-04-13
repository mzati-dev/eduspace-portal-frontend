// components/teacher/analytics/TeacherGradeDrillDown.tsx
import React, { useState, useEffect } from 'react';

interface TeacherGradeDrillDownProps {
    className: string;
    students: any[];
    onViewStudent: (studentId: string) => void;
    onBack: () => void;
}

// DUMMY STUDENTS DATA - Shows sample students per class
const DUMMY_STUDENTS: Record<string, any[]> = {
    'Grade 7A': [
        { id: '1', name: 'John Mwangi', examNumber: '7A001', attendance: 92, catScore: 88, fails: 0, currentMarks: 85, riskLevel: 'low' },
        { id: '2', name: 'Mary Wanjiku', examNumber: '7A002', attendance: 78, catScore: 72, fails: 1, currentMarks: 68, riskLevel: 'medium' },
        { id: '3', name: 'James Otieno', examNumber: '7A003', attendance: 45, catScore: 38, fails: 3, currentMarks: 35, riskLevel: 'critical' },
        { id: '4', name: 'Sarah Akinyi', examNumber: '7A004', attendance: 88, catScore: 85, fails: 0, currentMarks: 82, riskLevel: 'low' },
        { id: '5', name: 'Peter Kamau', examNumber: '7A005', attendance: 65, catScore: 58, fails: 2, currentMarks: 55, riskLevel: 'high' },
        { id: '6', name: 'Lucy Njeri', examNumber: '7A006', attendance: 95, catScore: 92, fails: 0, currentMarks: 90, riskLevel: 'low' },
        { id: '7', name: 'Daniel Kipchoge', examNumber: '7A007', attendance: 55, catScore: 48, fails: 2, currentMarks: 45, riskLevel: 'high' },
        { id: '8', name: 'Grace Muthoni', examNumber: '7A008', attendance: 82, catScore: 78, fails: 0, currentMarks: 75, riskLevel: 'low' },
        { id: '9', name: 'Brian Odhiambo', examNumber: '7A009', attendance: 48, catScore: 42, fails: 2, currentMarks: 40, riskLevel: 'critical' },
        { id: '10', name: 'Faith Chepngetich', examNumber: '7A010', attendance: 72, catScore: 68, fails: 1, currentMarks: 65, riskLevel: 'medium' },
    ],
    'Grade 7B': [
        { id: '11', name: 'Michael Omondi', examNumber: '7B001', attendance: 85, catScore: 80, fails: 0, currentMarks: 78, riskLevel: 'low' },
        { id: '12', name: 'Esther Wambui', examNumber: '7B002', attendance: 58, catScore: 52, fails: 2, currentMarks: 48, riskLevel: 'high' },
        { id: '13', name: 'David Kimani', examNumber: '7B003', attendance: 42, catScore: 35, fails: 3, currentMarks: 32, riskLevel: 'critical' },
        { id: '14', name: 'Ruth Chebet', examNumber: '7B004', attendance: 90, catScore: 86, fails: 0, currentMarks: 84, riskLevel: 'low' },
        { id: '15', name: 'Samuel Kariuki', examNumber: '7B005', attendance: 68, catScore: 62, fails: 1, currentMarks: 60, riskLevel: 'medium' },
    ],
    'Grade 6A': [
        { id: '16', name: 'Alice Wangui', examNumber: '6A001', attendance: 88, catScore: 84, fails: 0, currentMarks: 82, riskLevel: 'low' },
        { id: '17', name: 'Bernard Mwangi', examNumber: '6A002', attendance: 52, catScore: 45, fails: 2, currentMarks: 42, riskLevel: 'high' },
        { id: '18', name: 'Catherine Nyokabi', examNumber: '6A003', attendance: 75, catScore: 70, fails: 1, currentMarks: 68, riskLevel: 'medium' },
        { id: '19', name: 'Dennis Ochieng', examNumber: '6A004', attendance: 40, catScore: 32, fails: 3, currentMarks: 30, riskLevel: 'critical' },
        { id: '20', name: 'Eunice Atieno', examNumber: '6A005', attendance: 92, catScore: 88, fails: 0, currentMarks: 86, riskLevel: 'low' },
    ],
    'Grade 8A': [
        { id: '21', name: 'Franklin Odhiambo', examNumber: '8A001', attendance: 70, catScore: 65, fails: 1, currentMarks: 62, riskLevel: 'medium' },
        { id: '22', name: 'Gladys Wairimu', examNumber: '8A002', attendance: 48, catScore: 42, fails: 2, currentMarks: 40, riskLevel: 'high' },
        { id: '23', name: 'Henry Njoroge', examNumber: '8A003', attendance: 85, catScore: 80, fails: 0, currentMarks: 78, riskLevel: 'low' },
    ],
    'Grade 8B': [
        { id: '24', name: 'Irene Muthoni', examNumber: '8B001', attendance: 78, catScore: 72, fails: 1, currentMarks: 70, riskLevel: 'medium' },
        { id: '25', name: 'Joseph Maina', examNumber: '8B002', attendance: 55, catScore: 48, fails: 2, currentMarks: 45, riskLevel: 'high' },
        { id: '26', name: 'Katherine Njoki', examNumber: '8B003', attendance: 88, catScore: 85, fails: 0, currentMarks: 82, riskLevel: 'low' },
    ],
};

const TeacherGradeDrillDown: React.FC<TeacherGradeDrillDownProps> = ({ className, students, onViewStudent, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [classStudents, setClassStudents] = useState<any[]>([]);

    useEffect(() => {
        setTimeout(() => {
            // First try to get real students from props
            let filtered: any[] = [];

            if (students && students.length > 0) {
                filtered = students
                    .filter(s => s.className === className || s.class?.name === className)
                    .map((s, idx) => ({
                        id: s.id || String(idx + 1),
                        name: s.name,
                        examNumber: s.examNumber || `STU${String(idx + 1).padStart(4, '0')}`,
                        className: className,
                        attendance: Math.round(50 + Math.random() * 45),
                        catScore: Math.round(45 + Math.random() * 45),
                        fails: Math.floor(Math.random() * 3),
                        currentMarks: Math.round(40 + Math.random() * 50),
                        riskLevel: Math.random() > 0.8 ? 'critical' : Math.random() > 0.5 ? 'high' : 'medium'
                    }));
            }

            // If no real students, use dummy data
            if (filtered.length === 0 && DUMMY_STUDENTS[className]) {
                filtered = DUMMY_STUDENTS[className];
            }

            setClassStudents(filtered);
            setLoading(false);
        }, 500);
    }, [className, students]);

    const getRiskBadge = (level: string) => {
        switch (level) {
            case 'critical': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">🔴 CRITICAL</span>;
            case 'high': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">🟠 HIGH</span>;
            case 'medium': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">🟡 MEDIUM</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">🟢 LOW</span>;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading students...</p>
            </div>
        );
    }

    if (classStudents.length === 0) {
        return (
            <div className="space-y-6">
                <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4">
                    ← Back to Dashboard
                </button>
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <p className="text-slate-500">No students found in {className}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4">
                ← Back to Dashboard
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-800">{className} - All Students</h2>
                <p className="text-slate-500 mt-1">{classStudents.length} students in this class</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam No</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">CAT Score</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Current Marks</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Failed Subjects</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Level</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {classStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                    <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${getScoreColor(student.attendance)}`}>
                                            {Math.round(student.attendance)}%
                                        </span>
                                        <div className="w-16 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${student.attendance >= 75 ? 'bg-green-500' : student.attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(100, student.attendance)}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${getScoreColor(student.catScore)}`}>
                                            {Math.round(student.catScore)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${getScoreColor(student.currentMarks)}`}>
                                            {Math.round(student.currentMarks)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${student.fails > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {student.fails}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{getRiskBadge(student.riskLevel)}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onViewStudent(student.id)}
                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherGradeDrillDown;