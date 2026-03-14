import React, { useState } from 'react';
import {
    Calendar,
    Search,
    UserCheck,
    UserX,
    Clock3,
    CheckCircle,
    AlertCircle,
    Bell,
    Download,
    Filter,
    TrendingUp,
    TrendingDown,
    Users,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface StudentAttendance {
    id: string;
    name: string;
    examNumber: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    checkInTime?: string;
    parentContact?: string;
}

interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
}

interface Props {
    classes: any[];           // Classes teacher is assigned to
    students: any[];           // Students teacher can access
    teacherId?: string;
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherAttendance: React.FC<Props> = ({
    classes,
    students,
    teacherId,
    showMessage
}) => {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'daily' | 'overview' | 'alerts'>('daily');
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);

    // Mock data - In production, fetch from API
    React.useEffect(() => {
        if (selectedClass) {
            loadAttendanceData();
        }
    }, [selectedClass, selectedDate]);

    const loadAttendanceData = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            // Filter students by selected class
            const classStudents = students.filter(s => s.class?.id === selectedClass);

            // Generate mock attendance data
            const mockData: StudentAttendance[] = classStudents.map((student, index) => ({
                id: student.id,
                name: student.name,
                examNumber: student.examNumber,
                status: getRandomStatus(),
                checkInTime: getRandomCheckInTime(),
                parentContact: student.parentPhone || '+1234567890'
            }));

            setAttendanceData(mockData);
            setLoading(false);
        }, 500);
    };

    // Helper functions for mock data
    const getRandomStatus = (): StudentAttendance['status'] => {
        const rand = Math.random();
        if (rand < 0.7) return 'present';
        if (rand < 0.85) return 'absent';
        if (rand < 0.95) return 'late';
        return 'excused';
    };

    const getRandomCheckInTime = () => {
        const rand = Math.random();
        if (rand < 0.7) {
            const hour = 7 + Math.floor(Math.random() * 2);
            const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0');
            return `${hour}:${minute} AM`;
        }
        return undefined;
    };

    // Calculate stats for current view
    const calculateStats = (): AttendanceStats => {
        const filtered = attendanceData.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.examNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return {
            total: filtered.length,
            present: filtered.filter(s => s.status === 'present').length,
            absent: filtered.filter(s => s.status === 'absent').length,
            late: filtered.filter(s => s.status === 'late').length,
            excused: filtered.filter(s => s.status === 'excused').length,
            rate: filtered.length > 0
                ? Number(((filtered.filter(s => s.status === 'present' || s.status === 'late').length / filtered.length) * 100).toFixed(1))
                : 0
        };
    };

    const stats = calculateStats();

    const handleStatusChange = (studentId: string, newStatus: StudentAttendance['status']) => {
        setAttendanceData(prev =>
            prev.map(s =>
                s.id === studentId
                    ? {
                        ...s,
                        status: newStatus,
                        checkInTime: newStatus === 'present' || newStatus === 'late'
                            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : undefined
                    }
                    : s
            )
        );
        showMessage(`Attendance updated for student`);
    };

    const handleMarkAllPresent = () => {
        setAttendanceData(prev =>
            prev.map(s => ({
                ...s,
                status: 'present',
                checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
        );
        showMessage('All students marked as present');
    };

    const handleSendAlerts = () => {
        setLoading(true);
        const absentLateCount = attendanceData.filter(s => s.status === 'absent' || s.status === 'late').length;
        setTimeout(() => {
            showMessage(`Attendance alerts sent to ${absentLateCount} parents`);
            setLoading(false);
        }, 1000);
    };

    const handleSaveAttendance = () => {
        setLoading(true);
        setTimeout(() => {
            showMessage('Attendance saved successfully');
            setLoading(false);
        }, 1000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-700 border-green-200';
            case 'absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'excused': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <UserCheck className="w-4 h-4" />;
            case 'absent': return <UserX className="w-4 h-4" />;
            case 'late': return <Clock3 className="w-4 h-4" />;
            case 'excused': return <CheckCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const filteredStudents = attendanceData.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.examNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Attendance Management</h2>
                    <p className="text-slate-500">Track and manage student attendance</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSendAlerts}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Bell className="w-4 h-4" />
                        Alert Parents
                    </button>
                    <button
                        onClick={handleSaveAttendance}
                        disabled={loading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Save Attendance
                    </button>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setViewMode('daily')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'daily'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Daily Attendance
                </button>
                <button
                    onClick={() => setViewMode('overview')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'overview'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Overview
                </button>
                <button
                    onClick={() => setViewMode('alerts')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'alerts'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Bell className="w-4 h-4 inline mr-2" />
                    Alerts
                </button>
            </div>

            {viewMode === 'daily' && (
                <>
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} - {cls.term} ({cls.academic_year})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedClass ? (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Total Students</p>
                                            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Present</p>
                                            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                                        </div>
                                        <UserCheck className="w-8 h-8 text-green-600" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Absent</p>
                                            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                                        </div>
                                        <UserX className="w-8 h-8 text-red-600" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Late</p>
                                            <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                                        </div>
                                        <Clock3 className="w-8 h-8 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Attendance Rate</p>
                                            <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-indigo-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleMarkAllPresent}
                                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                                >
                                    Mark All Present
                                </button>
                            </div>

                            {/* Attendance Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Check-in Time</th>
                                                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                        Loading attendance data...
                                                    </td>
                                                </tr>
                                            ) : filteredStudents.length > 0 ? (
                                                filteredStudents.map(student => (
                                                    <tr key={student.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                                        <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                                                                {getStatusIcon(student.status)}
                                                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">{student.checkInTime || '—'}</td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={student.status}
                                                                onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
                                                                className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                            >
                                                                <option value="present">Present</option>
                                                                <option value="absent">Absent</option>
                                                                <option value="late">Late</option>
                                                                <option value="excused">Excused</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                        No students found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Class</h3>
                            <p className="text-slate-500">Choose a class from the dropdown above to start taking attendance</p>
                        </div>
                    )}
                </>
            )}

            {viewMode === 'overview' && (
                <div className="space-y-6">
                    {/* Weekly Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">This Week's Attendance</h3>
                        <div className="grid grid-cols-7 gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                                const rate = [92, 88, 95, 87, 91, 0, 0][index];
                                return (
                                    <div key={day} className="text-center">
                                        <div className="text-sm font-medium text-slate-600 mb-2">{day}</div>
                                        <div className="relative h-24 bg-slate-100 rounded-lg overflow-hidden">
                                            <div
                                                className="absolute bottom-0 w-full bg-indigo-600 transition-all"
                                                style={{ height: `${rate}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 text-sm font-semibold text-slate-700">{rate}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Class Averages */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Class Attendance Averages</h3>
                        <div className="space-y-3">
                            {classes.map(cls => (
                                <div key={cls.id} className="flex items-center gap-4">
                                    <span className="w-32 text-sm font-medium text-slate-600">{cls.name}</span>
                                    <div className="flex-1">
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full"
                                                style={{ width: `${Math.floor(Math.random() * 20 + 75)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-800">
                                        {Math.floor(Math.random() * 20 + 75)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top/Bottom Performers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Best Attendance
                            </h3>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-green-800">Student Name {i}</p>
                                            <p className="text-xs text-green-600">SCH-24-00{i}</p>
                                        </div>
                                        <span className="text-sm font-bold text-green-700">98%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                                Needs Improvement
                            </h3>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-red-800">Student Name {i}</p>
                                            <p className="text-xs text-red-600">SCH-24-00{i}</p>
                                        </div>
                                        <span className="text-sm font-bold text-red-700">65%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'alerts' && (
                <div className="space-y-6">
                    {/* Send Alerts */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Send Attendance Alerts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Bell className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800">SMS Alerts</h4>
                                        <p className="text-xs text-slate-500">Send to absent/late students</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendAlerts}
                                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                                >
                                    Send SMS Alerts
                                </button>
                            </div>

                            <div className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800">Email Alerts</h4>
                                        <p className="text-xs text-slate-500">Detailed attendance reports</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendAlerts}
                                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                                >
                                    Send Email Reports
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Alert History */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Recent Alerts</h3>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-4 h-4 text-indigo-600" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Attendance Alert - March {i}, 2024</p>
                                            <p className="text-xs text-slate-500">Sent to 5 parents • SMS</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-green-600">Delivered</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;