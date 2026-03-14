import React, { useState } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Download,
    Bell,
    AlertCircle,
    CheckCircle,
    Clock,
    Users,
    BarChart3,
    TrendingUp,
    TrendingDown,
    XCircle,
    UserCheck,
    UserX,
    Clock3
} from 'lucide-react';

interface StudentAttendance {
    id: string;
    name: string;
    examNumber: string;
    class: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    checkInTime?: string;
    parentContact?: string;
    parentEmail?: string;
}

interface AttendanceStats {
    date: string;
    totalStudents: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
}

interface Props {
    classes: any[];
    students: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const AttendanceManagement: React.FC<Props> = ({ classes, students, showMessage }) => {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'daily' | 'patterns' | 'alerts'>('daily');

    const [loading, setLoading] = useState(false);

    // Mock data - replace with actual API calls
    const mockAttendanceData: StudentAttendance[] = [
        {
            id: '1',
            name: 'John Doe',
            examNumber: 'SCH-24-001',
            class: 'Grade 8A',
            status: 'present',
            checkInTime: '08:15 AM',
            parentContact: '+1234567890',
            parentEmail: 'parent@example.com'
        },
        {
            id: '2',
            name: 'Jane Smith',
            examNumber: 'SCH-24-002',
            class: 'Grade 8A',
            status: 'absent',
            parentContact: '+1234567891'
        },
        {
            id: '3',
            name: 'Mike Johnson',
            examNumber: 'SCH-24-003',
            class: 'Grade 8A',
            status: 'late',
            checkInTime: '08:45 AM'
        },
        {
            id: '4',
            name: 'Sarah Williams',
            examNumber: 'SCH-24-004',
            class: 'Grade 8A',
            status: 'present',
            checkInTime: '08:10 AM'
        },
        {
            id: '5',
            name: 'Tom Brown',
            examNumber: 'SCH-24-005',
            class: 'Grade 8A',
            status: 'excused'
        }
    ];

    const mockStats: AttendanceStats[] = [
        {
            date: '2024-03-01',
            totalStudents: 30,
            present: 25,
            absent: 3,
            late: 2,
            excused: 0,
            attendanceRate: 83.3
        },
        {
            date: '2024-03-02',
            totalStudents: 30,
            present: 26,
            absent: 2,
            late: 1,
            excused: 1,
            attendanceRate: 86.7
        },
        {
            date: '2024-03-03',
            totalStudents: 30,
            present: 24,
            absent: 4,
            late: 2,
            excused: 0,
            attendanceRate: 80.0
        },
        {
            date: '2024-03-04',
            totalStudents: 30,
            present: 27,
            absent: 1,
            late: 1,
            excused: 1,
            attendanceRate: 90.0
        },
        {
            date: '2024-03-05',
            totalStudents: 30,
            present: 23,
            absent: 5,
            late: 2,
            excused: 0,
            attendanceRate: 76.7
        }
    ];

    const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>(mockAttendanceData);

    const filteredStudents = attendanceData.filter(s =>
        (selectedClass === 'all' || s.class === selectedClass) &&
        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: filteredStudents.length,
        present: filteredStudents.filter(s => s.status === 'present').length,
        absent: filteredStudents.filter(s => s.status === 'absent').length,
        late: filteredStudents.filter(s => s.status === 'late').length,
        excused: filteredStudents.filter(s => s.status === 'excused').length,
        rate: filteredStudents.length > 0
            ? ((filteredStudents.filter(s => s.status === 'present' || s.status === 'late').length / filteredStudents.length) * 100).toFixed(1)
            : 0
    };

    const handleStatusChange = (studentId: string, newStatus: StudentAttendance['status']) => {
        setAttendanceData(prev =>
            prev.map(s =>
                s.id === studentId
                    ? { ...s, status: newStatus, checkInTime: newStatus === 'present' || newStatus === 'late' ? new Date().toLocaleTimeString() : undefined }
                    : s
            )
        );
        showMessage(`Status updated for student`);
    };

    const handleSendAlert = (type: 'sms' | 'email' | 'push', studentIds: string[]) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            showMessage(`${type.toUpperCase()} alerts sent to ${studentIds.length} parent(s)`);
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
            default: return <Clock className="w-4 h-4" />;
        }
    };

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
                        onClick={() => handleSendAlert('sms', attendanceData.filter(s => s.status === 'absent' || s.status === 'late').map(s => s.id))}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Bell className="w-4 h-4" />
                        Alert Absent/Late
                    </button>
                    <button
                        onClick={() => {/* Export functionality */ }}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
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
                    Daily Tracking
                </button>
                <button
                    onClick={() => setViewMode('patterns')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'patterns'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Patterns & Analytics
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    <option value="all">All Classes</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.name}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
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

                    {/* Attendance Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Exam Number</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Check-in Time</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                                            <td className="px-4 py-3 font-mono text-sm text-indigo-600">{student.examNumber}</td>
                                            <td className="px-4 py-3 text-slate-600">{student.class}</td>
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {viewMode === 'patterns' && (
                <div className="space-y-6">
                    {/* Patterns Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <TrendingDown className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Highest Absence Day</h3>
                                    <p className="text-sm text-slate-500">Friday</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">23%</p>
                            <p className="text-sm text-slate-500 mt-1">Average absence rate on Fridays</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Best Attendance Day</h3>
                                    <p className="text-sm text-slate-500">Tuesday</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">94%</p>
                            <p className="text-sm text-slate-500 mt-1">Average attendance rate on Tuesdays</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Peak Late Arrivals</h3>
                                    <p className="text-sm text-slate-500">Monday Morning</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">8:45 AM</p>
                            <p className="text-sm text-slate-500 mt-1">Average late check-in time</p>
                        </div>
                    </div>

                    {/* Weekly Pattern Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Weekly Attendance Pattern</h3>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
                                const height = [85, 94, 88, 90, 77][index];
                                return (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700"
                                            style={{ height: `${height * 2}px` }}
                                        />
                                        <span className="text-sm font-medium text-slate-600">{day}</span>
                                        <span className="text-xs text-slate-500">{height}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Class-wise Comparison */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Class Attendance Comparison</h3>
                        <div className="space-y-3">
                            {classes.slice(0, 5).map(cls => (
                                <div key={cls.id} className="flex items-center gap-4">
                                    <span className="w-24 text-sm font-medium text-slate-600">{cls.name}</span>
                                    <div className="flex-1">
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full"
                                                style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-800">{Math.floor(Math.random() * 10 + 85)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'alerts' && (
                <div className="space-y-6">
                    {/* Alert Controls */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Send Attendance Alerts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    onClick={() => handleSendAlert('sms', attendanceData.filter(s => s.status === 'absent' || s.status === 'late').map(s => s.id))}
                                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                                >
                                    Send SMS ({attendanceData.filter(s => s.status === 'absent' || s.status === 'late').length})
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
                                    onClick={() => handleSendAlert('email', attendanceData.filter(s => s.status === 'absent' || s.status === 'late').map(s => s.id))}
                                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                                >
                                    Send Emails
                                </button>
                            </div>

                            <div className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Bell className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800">Push Notifications</h4>
                                        <p className="text-xs text-slate-500">Real-time app alerts</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSendAlert('push', attendanceData.filter(s => s.status === 'absent' || s.status === 'late').map(s => s.id))}
                                    className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                                >
                                    Send Push
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

export default AttendanceManagement;