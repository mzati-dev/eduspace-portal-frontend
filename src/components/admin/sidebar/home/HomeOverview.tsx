import React from 'react';
import { Student } from '@/types/admin';
import { Users, BookOpen, GraduationCap, DollarSign, Calendar, Clock, Bell, Plus, FileText, CheckSquare, CreditCard, AlertCircle, BarChart3, Megaphone } from 'lucide-react';

interface HomeOverviewProps {
    students: Student[];
    teachers: any[];
    classes: any[];
    // Term data from your attendance service
    termInfo: {
        name: string;
        startDate: string;
        endDate: string;
    };
    totalDays: number;
    recordedDays: number;
    remainingDays: number;
    currentWeekNumber: number;
    totalWeeks: number;
    weeksRemaining: number;
    currentPassRates?: any[];
    reminders?: any[];
    announcements?: any[];
    onNavigate?: (section: string) => void
}

const HomeOverview: React.FC<HomeOverviewProps> = ({
    students,
    teachers,
    classes,
    termInfo,
    totalDays,
    recordedDays,
    remainingDays,
    currentWeekNumber,
    totalWeeks,
    weeksRemaining,
    currentPassRates = [],
    reminders = [],
    announcements = [],
    onNavigate
}) => {
    const maleStudents = Math.floor(students.length * 0.55);
    const femaleStudents = students.length - maleStudents;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Loading...';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const reminderList = reminders;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Welcome Section */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                <p className="text-slate-500 mt-1">Welcome back! Here's an overview of what's happening at your school.</p>
            </div>

            {/* Current Term Card - Using your actual variables */}
            {/* Current Term Card - Improved Display */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
                {/* Term Name at Top */}
                <div className="text-center mb-6">
                    <p className="text-indigo-100 text-sm">CURRENT ACADEMIC PERIOD</p>
                    <h3 className="text-2xl font-bold">{termInfo.name || 'Loading...'}</h3>
                    <p className="text-indigo-100 text-sm mt-1">
                        {formatDate(termInfo.startDate)} - {formatDate(termInfo.endDate)}
                    </p>
                </div>

                {/* Days and Weeks - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Days Card */}
                    <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-indigo-100 text-sm">📅 School Days</span>
                            <span className="text-xs text-indigo-200">{Math.round((recordedDays / totalDays) * 100)}% Complete</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                            <span className="text-3xl font-bold">{recordedDays + 1}</span>
                            <span className="text-indigo-200">/ {totalDays}</span>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-2 mb-3">
                            <div className="bg-white h-2 rounded-full transition-all" style={{ width: totalDays > 0 ? `${(recordedDays / totalDays) * 100}%` : '0%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>✅ Day Number: {recordedDays + 1}</span>
                            <span>⏳ {remainingDays - 1} days left</span>
                        </div>
                    </div>

                    {/* Weeks Card */}
                    <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-indigo-100 text-sm">📆 School Weeks</span>
                            <span className="text-xs text-indigo-200">{Math.round((currentWeekNumber / totalWeeks) * 100)}% Complete</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                            <span className="text-3xl font-bold">Week {currentWeekNumber}</span>
                            <span className="text-indigo-200">/ {totalWeeks}</span>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-2 mb-3">
                            <div className="bg-white h-2 rounded-full transition-all" style={{ width: totalWeeks > 0 ? `${(currentWeekNumber / totalWeeks) * 100}%` : '0%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>📖 Week Number: {currentWeekNumber}</span>
                            <span>🎯 {weeksRemaining} weeks to go</span>
                        </div>
                    </div>
                </div>

                {/* Additional Info - Today's Date */}
                <div className="mt-4 pt-3 border-t border-white/20 text-center">
                    <p className="text-xs text-indigo-100">
                        🗓️ Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>
            {/* Quick Actions */}
            <div className="mb-8">
                <h3 className="text-md font-semibold text-slate-700 mb-3">Quick Actions</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => onNavigate?.('students')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Users className="w-4 h-4" /> Manage Students
                    </button>
                    <button
                        onClick={() => onNavigate?.('classes')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <BookOpen className="w-4 h-4" /> Manage Classes
                    </button>
                    <button
                        onClick={() => onNavigate?.('teachers')}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Users className="w-4 h-4" /> Manage Teachers
                    </button>
                    <button
                        onClick={() => onNavigate?.('subjects')}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <BookOpen className="w-4 h-4" /> Manage Subjects
                    </button>
                    <button
                        onClick={() => onNavigate?.('results')}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText className="w-4 h-4" /> Manage Results
                    </button>
                    <button
                        onClick={() => onNavigate?.('attendance')}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckSquare className="w-4 h-4" /> Record Attendance
                    </button>
                    <button
                        onClick={() => onNavigate?.('fees')}
                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <DollarSign className="w-4 h-4" /> Manage Fees
                    </button>
                    <button
                        onClick={() => onNavigate?.('timetable')}
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-4 h-4" /> View Timetable
                    </button>
                </div>
                {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Student
                    </button>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> Add Class
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> Add Teacher
                    </button>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" /> Add Subject
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" /> Manage Results
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <CheckSquare className="w-4 h-4" /> Record Attendance
                    </button>
                    <button className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <CreditCard className="w-4 h-4" /> Record Payment
                    </button>
                    <button className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" /> View Timetable
                    </button>
                </div> */}
            </div>

            {/* Stats Cards */}
            <div className="mb-4">
                <h3 className="text-md font-semibold text-slate-700 mb-3">School Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Students</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-1">{students.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Teachers</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-1">{teachers.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Classes</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-1">{classes.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Fee Collection</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-1">78%</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Stats Cards - Row 2: Class Insights */}
            <div className="mb-4">
                <h3 className="text-md font-semibold text-slate-700 mb-3">Enrollment Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Highest Enrollment */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 shadow-sm border border-emerald-200">
                        <p className="text-xs text-emerald-600 font-medium">Highest Enrollment</p>
                        {(() => {
                            const highest = classes.reduce((max, cls) => {
                                const count = students.filter(s => s.class?.id === cls.id).length;
                                return count > (max.count || 0) ? { name: cls.name, count } : max;
                            }, { name: '', count: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-emerald-800 mt-1 truncate">{highest.name || '—'}</p>
                                    <p className="text-xs text-emerald-600">{highest.count} students</p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Lowest Enrollment */}
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 shadow-sm border border-rose-200">
                        <p className="text-xs text-rose-600 font-medium">Lowest Enrollment</p>
                        {(() => {
                            const lowest = classes.reduce((min, cls) => {
                                const count = students.filter(s => s.class?.id === cls.id).length;
                                return count < (min.count || Infinity) ? { name: cls.name, count } : min;
                            }, { name: '', count: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-rose-800 mt-1 truncate">{lowest.name || '—'}</p>
                                    <p className="text-xs text-rose-600">{lowest.count} students</p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Most Boys */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium">Class with Most Boys</p>
                        {(() => {
                            const highestBoys = classes.reduce((max, cls) => {
                                const boys = students.filter(s => s.class?.id === cls.id && s.gender === 'Male').length;
                                return boys > (max.count || 0) ? { name: cls.name, count: boys } : max;
                            }, { name: '', count: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-blue-800 mt-1 truncate">{highestBoys.name || '—'}</p>
                                    <p className="text-xs text-blue-600">{highestBoys.count} boys</p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Most Girls */}
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 shadow-sm border border-pink-200">
                        <p className="text-xs text-pink-600 font-medium">Class with most Girls</p>
                        {(() => {
                            const highestGirls = classes.reduce((max, cls) => {
                                const girls = students.filter(s => s.class?.id === cls.id && s.gender === 'Female').length;
                                return girls > (max.count || 0) ? { name: cls.name, count: girls } : max;
                            }, { name: '', count: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-pink-800 mt-1 truncate">{highestGirls.name || '—'}</p>
                                    <p className="text-xs text-pink-600">{highestGirls.count} girls</p>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Stats Cards - Row 3: More Insights */}
            <div className="mb-4">
                <h3 className="text-md font-semibold text-slate-700 mb-3">Class Demographics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Lowest Boys */}
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 shadow-sm border border-cyan-200">
                        <p className="text-xs text-cyan-600 font-medium">Class with Least Boys</p>
                        {(() => {
                            const lowestBoys = classes.reduce((min, cls) => {
                                const boys = students.filter(s => s.class?.id === cls.id && s.gender === 'Male').length;
                                return boys < (min.count || Infinity) ? { name: cls.name, count: boys } : min;
                            }, { name: '', count: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-cyan-800 mt-1 truncate">{lowestBoys.name || '—'}</p>
                                    <p className="text-xs text-cyan-600">{lowestBoys.count} boys</p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Lowest Girls */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm border border-purple-200">
                        <p className="text-xs text-purple-600 font-medium">Class with Least Girls</p>
                        {(() => {
                            const lowestGirls = classes.reduce((min, cls) => {
                                const girls = students.filter(s => s.class?.id === cls.id && s.gender === 'Female').length;
                                return girls < (min.count || Infinity) ? { name: cls.name, count: girls } : min;
                            }, { name: '', count: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-purple-800 mt-1 truncate">{lowestGirls.name || '—'}</p>
                                    <p className="text-xs text-purple-600">{lowestGirls.count} girls</p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Student-Teacher Ratio */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 shadow-sm border border-indigo-200">
                        <p className="text-xs text-indigo-600 font-medium">Student-Teacher Ratio</p>
                        <p className="text-lg font-bold text-indigo-800 mt-1">
                            {teachers.length > 0 ? (students.length / teachers.length).toFixed(1) : 0}:1
                        </p>
                        <p className="text-xs text-indigo-600">{students.length} : {teachers.length}</p>
                    </div>

                    {/* Average Class Size */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 shadow-sm border border-amber-200">
                        <p className="text-xs text-amber-600 font-medium">Average Class Size</p>
                        <p className="text-lg font-bold text-amber-800 mt-1">
                            {classes.length > 0 ? (students.length / classes.length).toFixed(1) : 0}
                        </p>
                        <p className="text-xs text-amber-600">students per class</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Row 4: Academic Performance Insights */}
            <div className="mb-4">
                <h3 className="text-md font-semibold text-slate-700 mb-3">Academic Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Class with Highest Pass Rate */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm border border-green-200">
                        <p className="text-xs text-green-600 font-medium">Highest Pass Rate</p>
                        {(() => {
                            // Calculate pass rate per class from your results data
                            const highestPass = classes.reduce((max, cls) => {
                                // Replace with actual pass rate calculation from your results API
                                // For now using mock - replace with real data
                                const passRate = 85;
                                return passRate > (max.rate || 0) ? { name: cls.name, rate: passRate } : max;
                            }, { name: '', rate: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-green-800 mt-1 break-words">{highestPass.name || '—'}</p>
                                    <p className="text-xs text-green-600">{highestPass.rate}% pass rate</p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Class with Lowest Pass Rate */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 shadow-sm border border-red-200">
                        <p className="text-xs text-red-600 font-medium">Lowest Pass Rate</p>
                        {(() => {
                            const lowestPass = classes.reduce((min, cls) => {
                                const passRate = 65; // Replace with actual calculation
                                return passRate < (min.rate || 100) ? { name: cls.name, rate: passRate } : min;
                            }, { name: '', rate: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-red-800 mt-1 break-words">{lowestPass.name || '—'}</p>
                                    <p className="text-xs text-red-600">{lowestPass.rate}% pass rate</p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Most Passed Subject */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium">Most Passed Subject</p>
                        {(() => {
                            // Replace with actual subject pass rate calculation from your results API
                            const subjects = ['Mathematics', 'English', 'Science'];
                            const highestSubject = { name: 'Mathematics', count: 85 };
                            return (
                                <>
                                    <p className="text-lg font-bold text-blue-800 mt-1 break-words">{highestSubject.name || '—'}</p>
                                    <p className="text-xs text-blue-600">{highestSubject.count}% pass rate</p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Least Passed Subject */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 shadow-sm border border-amber-200">
                        <p className="text-xs text-amber-600 font-medium">Least Passed Subject</p>
                        {(() => {
                            const lowestSubject = { name: 'Physics', count: 45 };
                            return (
                                <>
                                    <p className="text-lg font-bold text-amber-800 mt-1 break-words">{lowestSubject.name || '—'}</p>
                                    <p className="text-xs text-amber-600">{lowestSubject.count}% pass rate</p>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Stats Cards - Row 5: Attendance Insights */}
            <div className="mb-4">
                <h3 className="text-md font-semibold text-slate-700 mb-3">Attendance Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                    {/* Class with Highest Attendance */}
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 shadow-sm border border-teal-200">
                        <p className="text-xs text-teal-600 font-medium">Highest Attendance</p>
                        {(() => {
                            // Replace with actual attendance calculation from your attendance API
                            const highestAttendance = classes.reduce((max, cls) => {
                                const rate = 92; // Replace with actual attendance rate
                                return rate > (max.rate || 0) ? { name: cls.name, rate } : max;
                            }, { name: '', rate: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-teal-800 mt-1 break-words">{highestAttendance.name || '—'}</p>
                                    <p className="text-xs text-teal-600">{highestAttendance.rate}% attendance</p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Class with Lowest Attendance */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-sm border border-orange-200">
                        <p className="text-xs text-orange-600 font-medium">Lowest Attendance</p>
                        {(() => {
                            const lowestAttendance = classes.reduce((min, cls) => {
                                const rate = 78; // Replace with actual attendance rate
                                return rate < (min.rate || 100) ? { name: cls.name, rate } : min;
                            }, { name: '', rate: 0 });
                            return (
                                <>
                                    <p className="text-lg font-bold text-orange-800 mt-1 break-words">{lowestAttendance.name || '—'}</p>
                                    <p className="text-xs text-orange-600">{lowestAttendance.rate}% attendance</p>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Current Term Pass Rates */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Current Term Pass Rates</h3>
                </div>

                {currentPassRates.length === 0 || (currentPassRates.every(c => c.qa1PassRate === 0 && c.qa2PassRate === 0 && c.endOfTermPassRate === 0)) ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>No pass rate data available yet.</p>
                        <p className="text-sm mt-1">Enter student results to see pass rates.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">Class</th>
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">Students</th>
                                    {currentPassRates.some(c => c.qa1PassRate > 0) && (
                                        <th className="text-left py-3 text-sm font-semibold text-slate-600">QA1 Pass Rate</th>
                                    )}
                                    {currentPassRates.some(c => c.qa2PassRate > 0) && (
                                        <th className="text-left py-3 text-sm font-semibold text-slate-600">QA2 Pass Rate</th>
                                    )}
                                    {currentPassRates.some(c => c.endOfTermPassRate > 0) && (
                                        <th className="text-left py-3 text-sm font-semibold text-slate-600">End Term Pass Rate</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {currentPassRates.map((cls, idx) => {
                                    const classObj = classes.find(c => c.name === cls.className);
                                    const studentCount = classObj ? students.filter(s => s.class?.id === classObj.id).length : 0;
                                    return (
                                        <tr key={idx} className="border-b border-slate-100">
                                            <td className="py-3 text-sm font-medium text-slate-800">{cls.className}</td>
                                            <td className="py-3 text-sm text-slate-600">{studentCount}</td>
                                            {currentPassRates.some(c => c.qa1PassRate > 0) && (
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-slate-200 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cls.qa1PassRate}%` }}></div>
                                                        </div>
                                                        <span className="text-sm font-medium">{cls.qa1PassRate}%</span>
                                                    </div>
                                                </td>
                                            )}
                                            {currentPassRates.some(c => c.qa2PassRate > 0) && (
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-slate-200 rounded-full h-2">
                                                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${cls.qa2PassRate}%` }}></div>
                                                        </div>
                                                        <span className="text-sm font-medium">{cls.qa2PassRate}%</span>
                                                    </div>
                                                </td>
                                            )}
                                            {currentPassRates.some(c => c.endOfTermPassRate > 0) && (
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-slate-200 rounded-full h-2">
                                                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${cls.endOfTermPassRate}%` }}></div>
                                                        </div>
                                                        <span className="text-sm font-medium">{cls.endOfTermPassRate}%</span>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Current Term Pass Rates</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">Class</th>
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">Students</th>
                                {currentPassRates.some(c => c.qa1PassRate > 0) && (
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">QA1 Pass Rate</th>
                                )}
                                {currentPassRates.some(c => c.qa2PassRate > 0) && (
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">QA2 Pass Rate</th>
                                )}
                                {currentPassRates.some(c => c.endOfTermPassRate > 0) && (
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">End Term Pass Rate</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {currentPassRates.map((cls, idx) => {
                                const classObj = classes.find(c => c.name === cls.className);
                                const studentCount = classObj ? students.filter(s => s.class?.id === classObj.id).length : 0;
                                return (
                                    <tr key={idx} className="border-b border-slate-100">
                                        <td className="py-3 text-sm font-medium text-slate-800">{cls.className}</td>
                                        <td className="py-3 text-sm text-slate-600">{studentCount}</td>
                                        {currentPassRates.some(c => c.qa1PassRate > 0) && (
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-slate-200 rounded-full h-2">
                                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cls.qa1PassRate}%` }}></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{cls.qa1PassRate}%</span>
                                                </div>
                                            </td>
                                        )}
                                        {currentPassRates.some(c => c.qa2PassRate > 0) && (
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-slate-200 rounded-full h-2">
                                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${cls.qa2PassRate}%` }}></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{cls.qa2PassRate}%</span>
                                                </div>
                                            </td>
                                        )}
                                        {currentPassRates.some(c => c.endOfTermPassRate > 0) && (
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-slate-200 rounded-full h-2">
                                                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${cls.endOfTermPassRate}%` }}></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{cls.endOfTermPassRate}%</span>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div> */}
            {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Current Term Pass Rates</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">Class</th>
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">Students</th>
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">QA1 Pass Rate</th>
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">QA2 Pass Rate</th>
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">End Term Pass Rate</th>
                            </tr>
                        </thead>


                        <tbody>
                            {currentPassRates.map((cls, idx) => {
                                // Get actual student count from the classes array
                                const classObj = classes.find(c => c.name === cls.className);
                                const studentCount = classObj ? students.filter(s => s.class?.id === classObj.id).length : 0;
                                return (
                                    <tr key={idx} className="border-b border-slate-100">
                                        <td className="py-3 text-sm font-medium text-slate-800">{cls.className}</td>
                                        <td className="py-3 text-sm text-slate-600">{studentCount}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-slate-200 rounded-full h-2">
                                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cls.qa1PassRate}%` }}></div>
                                                </div>
                                                <span className="text-sm font-medium">{cls.qa1PassRate}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-slate-200 rounded-full h-2">
                                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${cls.qa2PassRate}%` }}></div>
                                                </div>
                                                <span className="text-sm font-medium">{cls.qa2PassRate}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-slate-200 rounded-full h-2">
                                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${cls.endOfTermPassRate}%` }}></div>
                                                </div>
                                                <span className="text-sm font-medium">{cls.endOfTermPassRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div> */}



            {/* Reminders */}
            {/* Reminders & Announcements Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Reminders */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Reminders</h3>
                    </div>
                    <div className="space-y-3">
                        {reminderList.length === 0 ? (
                            <div className="text-center py-6 text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>No reminders at this time.</p>
                                <p className="text-xs mt-1">Check back later for updates.</p>
                            </div>
                        ) : (
                            reminderList.map((reminder) => (
                                <div key={reminder.id} className={`p-3 rounded-lg flex items-center justify-between ${reminder.type === 'urgent' ? 'bg-red-50 border-l-4 border-red-500' :
                                    reminder.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                                        'bg-blue-50 border-l-4 border-blue-500'
                                    }`}>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{reminder.message}</p>
                                        <p className="text-xs text-slate-500">{formatDate(reminder.date)}</p>
                                    </div>
                                    {reminder.type === 'urgent' && (
                                        <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded-full">Urgent</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Announcements */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Megaphone className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Announcements</h3>
                    </div>
                    <div className="space-y-3">
                        {announcements.length === 0 ? (
                            <div className="text-center py-6 text-slate-500">
                                <Megaphone className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>No announcements at this time.</p>
                                <p className="text-xs mt-1">Check back later for updates.</p>
                            </div>
                        ) : (
                            announcements.map((announcement) => (
                                <div key={announcement.id} className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{announcement.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">{announcement.message}</p>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                            {formatDate(announcement.date)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Distribution Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Gender Distribution</h3>
                    <div className="space-y-3">
                        {(() => {
                            const maleCount = students.filter(s => s.gender === 'Male').length;
                            const femaleCount = students.filter(s => s.gender === 'Female').length;
                            const malePercentage = students.length > 0 ? (maleCount / students.length) * 100 : 0;
                            const femalePercentage = students.length > 0 ? (femaleCount / students.length) * 100 : 0;
                            return (
                                <>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Male Students</span>
                                            <span>{maleCount} ({malePercentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${malePercentage}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Female Students</span>
                                            <span>{femaleCount} ({femalePercentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="bg-pink-600 h-2 rounded-full" style={{ width: `${femalePercentage}%` }}></div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Class Distribution</h3>
                    <div className="space-y-3">
                        {classes.map((cls) => {
                            const studentCount = students.filter(s => s.class?.id === cls.id).length;
                            const percentage = students.length > 0 ? (studentCount / students.length) * 100 : 0;
                            return (
                                <div key={cls.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-slate-700">{cls.name}</span>
                                        <div className="flex gap-3 text-xs">
                                            <span className="text-slate-500">{studentCount} students</span>
                                            <span className="text-indigo-600 font-semibold">{percentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeOverview;