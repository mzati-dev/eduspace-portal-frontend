import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Calendar, Clock, FileText, CheckSquare, Bell, AlertCircle, BarChart3, GraduationCap, Megaphone } from 'lucide-react';
import { fetchClassComparisons, fetchPublicHolidays, fetchSchoolHolidays } from '@/services/attendanceService';

interface TeacherHomeOverviewProps {
    teacherName: string;
    teacherClasses: any[];
    students: any[];
    teacherSubjects: any[];
     assignments?: any[];
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
    reminders?: any[];
    currentPassRates?: any[];
    announcements?: any[];
    pendingTasks?: any[];
    overallAttendanceRate?: number;
    onNavigate?: (section: string) => void
}

const TeacherHomeOverview: React.FC<TeacherHomeOverviewProps> = ({
    teacherName,
    teacherClasses,
    students,
    teacherSubjects,
     assignments = [], 
    termInfo,
    totalDays,
    recordedDays,
    remainingDays,
    currentWeekNumber,
    totalWeeks,
    weeksRemaining,
    reminders = [],
    currentPassRates = [],
    announcements = [],
    pendingTasks = [],
    overallAttendanceRate = 0,
    onNavigate
}) => {

    const [publicHolidays, setPublicHolidays] = useState<Set<string>>(new Set());
    const [schoolHolidays, setSchoolHolidays] = useState<Set<string>>(new Set());
    const allHolidays = new Set([...publicHolidays, ...schoolHolidays]);
    const [classAttendance, setClassAttendance] = useState<any[]>([]);


    useEffect(() => {
        const loadHolidays = async () => {
            try {
                const publicHolidaysData = await fetchPublicHolidays();
                const publicSet = new Set<string>();
                publicHolidaysData.forEach((holiday: { date: string }) => {
                    publicSet.add(holiday.date);
                });
                setPublicHolidays(publicSet);

                const schoolHolidaysData = await fetchSchoolHolidays();
                const schoolSet = new Set<string>();
                schoolHolidaysData.forEach((holiday: { date: string }) => {
                    schoolSet.add(holiday.date);
                });
                setSchoolHolidays(schoolSet);
            } catch (error) {
                console.error('Failed to fetch holidays:', error);
            }
        };
        loadHolidays();
    }, []);

    useEffect(() => {
        const loadAttendance = async () => {
            try {
                const attendance = await fetchClassComparisons();
                setClassAttendance(attendance);
            } catch (error) {
                console.error('Failed to fetch attendance:', error);
            }
        };
        loadAttendance();
    }, []);


    const formatDate = (dateString: string) => {
        if (!dateString) return 'Loading...';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };


    // Week calculation functions
    const getWeekNumberOfTerm = (date: string, termStart: string): number => {
        const d = new Date(date);
        const start = new Date(termStart);
        const diffTime = Math.abs(d.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil((diffDays + 1) / 7);
    };

    const calculateTotalWeeksInTerm = (): number => {
        if (!termInfo.startDate || !termInfo.endDate) return 0;
        const start = new Date(termInfo.startDate);
        const end = new Date(termInfo.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
    };

    const calculateCorrectWeek = getWeekNumberOfTerm(new Date().toISOString().split('T')[0], termInfo.startDate);
    const correctTotalWeeks = calculateTotalWeeksInTerm();

    // Days calculation functions
    const calculateCorrectRecordedDays = (): number => {
        if (!termInfo.startDate) return 0;
        const today = new Date().toISOString().split('T')[0];
        const start = new Date(termInfo.startDate);
        let count = 0;
        let current = new Date(start);
        while (current <= new Date(today)) {
            const dayOfWeek = current.getDay();
            const dateStr = current.toISOString().split('T')[0];
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !allHolidays.has(dateStr)) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    };

    const calculateTotalDays = (): number => {
        if (!termInfo.startDate || !termInfo.endDate) return 0;
        const start = new Date(termInfo.startDate);
        const end = new Date(termInfo.endDate);
        let total = 0;
        let current = new Date(start);
        while (current <= end) {
            const dayOfWeek = current.getDay();
            const dateStr = current.toISOString().split('T')[0];
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !allHolidays.has(dateStr)) {
                total++;
            }
            current.setDate(current.getDate() + 1);
        }
        return total;
    };

    const correctTotalDays = calculateTotalDays();
    const correctRecordedDays = calculateCorrectRecordedDays();
    const correctRemainingDays = correctTotalDays - correctRecordedDays;

    // Get total students across all teacher's classes
    const totalStudents = students.length;

    // Get pending tasks (results not yet entered)
    // const pendingTasks = [
    //     { id: 1, task: 'Results to Enter', count: teacherClasses.length * teacherSubjects.length, priority: 'high' },
    //     { id: 2, task: 'Attendance to Record', count: totalStudents, priority: 'medium' },
    // ];

    // Filter pass rates for teacher's classes only
    const teacherPassRates = currentPassRates.filter(rate =>
        teacherClasses.some(cls => cls.name === rate.className)
    );

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Welcome Section */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Welcome, {teacherName}!</h2>
                <p className="text-slate-500 mt-1">Here's an overview of what's happening in your classes.</p>
            </div>

            {/* Current Term Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
                <div className="text-center mb-6">
                    <p className="text-indigo-100 text-sm">CURRENT ACADEMIC PERIOD</p>
                    <h3 className="text-2xl font-bold">{termInfo.name || 'Loading...'}</h3>
                    <p className="text-indigo-100 text-sm mt-1">
                        {formatDate(termInfo.startDate)} - {formatDate(termInfo.endDate)}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-indigo-100 text-sm">📅 School Days</span>
                            {/* <span className="text-xs text-indigo-200">{Math.round((recordedDays / totalDays) * 100)}% Complete</span> */}
                            <span className="text-xs text-indigo-200">{Math.round((correctRecordedDays / correctTotalDays) * 100)}% Complete</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                            <span className="text-3xl font-bold">{correctRecordedDays}</span>
                            <span className="text-indigo-200">/ {correctTotalDays}</span>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-2 mb-3">
                            {/* <div className="bg-white h-2 rounded-full" style={{ width: totalDays > 0 ? `${(recordedDays / totalDays) * 100}%` : '0%' }}></div> */}
                            <div className="bg-white h-2 rounded-full" style={{ width: correctTotalDays > 0 ? `${(correctRecordedDays / correctTotalDays) * 100}%` : '0%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>✅ Day Number: {correctRecordedDays} </span>
                            <span>⏳ {correctRemainingDays} days left</span>
                            {/* <span>✅ Day Number: {recordedDays + 1} </span>
                            <span>⏳ {remainingDays - 1} days left</span> */}
                        </div>
                    </div>

                    <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-indigo-100 text-sm">📆 School Weeks</span>
                            {/* <span className="text-xs text-indigo-200">{Math.round((currentWeekNumber / totalWeeks) * 100)}% Complete</span> */}
                            <span className="text-xs text-indigo-200">{Math.round((calculateCorrectWeek / correctTotalWeeks) * 100)}% Complete</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                            <span className="text-3xl font-bold">Week {calculateCorrectWeek}</span>
                            <span className="text-indigo-200">/ {correctTotalWeeks}</span>
                            {/* <span className="text-3xl font-bold">Week {currentWeekNumber}</span>
                            <span className="text-indigo-200">/ {totalWeeks}</span> */}
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-2 mb-3">
                            {/* <div className="bg-white h-2 rounded-full" style={{ width: totalWeeks > 0 ? `${(currentWeekNumber / totalWeeks) * 100}%` : '0%' }}></div> */}
                            <div className="bg-white h-2 rounded-full" style={{ width: correctTotalWeeks > 0 ? `${(calculateCorrectWeek / correctTotalWeeks) * 100}%` : '0%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>📖 Week Number: {calculateCorrectWeek}</span>
                            <span>🎯 {correctTotalWeeks - calculateCorrectWeek} weeks to go</span>
                            {/* <span>📖 Week Number: {currentWeekNumber}</span>
                            <span>🎯 {weeksRemaining} weeks to go</span> */}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20 text-center">
                    <p className="text-xs text-indigo-100">
                        🗓️ Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Quick Actions for Teacher */}
            {/* Quick Actions for Teacher */}
            <div className="mb-8">
                <h3 className="text-md font-semibold text-slate-700 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => onNavigate?.('results')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
                        onClick={() => onNavigate?.('classes')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Users className="w-4 h-4" /> View My Classes
                    </button>
                    <button
                        onClick={() => onNavigate?.('timetable')}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-4 h-4" /> My Timetable
                    </button>
                </div>
            </div>
            {/* <div className="mb-8">
                <h3 className="text-md font-semibold text-slate-700 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" /> Manage Results
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <CheckSquare className="w-4 h-4" /> Record Attendance
                    </button>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> View My Classes
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" /> My Timetable
                    </button>
                </div>
            </div> */}

            {/* Stats Cards - Teacher Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">My Classes</p>
                            <p className="text-3xl font-bold text-indigo-600 mt-1">{teacherClasses.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">My Students</p>
                            <p className="text-3xl font-bold text-indigo-600 mt-1">{totalStudents}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">My Subjects</p>
                            <p className="text-3xl font-bold text-indigo-600 mt-1">{teacherSubjects.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Attendance Rate</p>
                            <p className="text-3xl font-bold text-indigo-600 mt-1">{overallAttendanceRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <CheckSquare className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* My Classes Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-800">My Classes Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">Class</th>
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">Total Students</th>
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">Boys</th>
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">Girls</th>
                                <th className="text-left py-3 text-sm font-semibold text-slate-600">Attendance Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teacherClasses.map((cls) => {
                                const classStudents = students.filter(s => s.class?.id === cls.id);
                                const total = classStudents.length;
                                const boys = classStudents.filter(s => s.gender === 'Male').length;
                                const girls = classStudents.filter(s => s.gender === 'Female').length;
                                const attendanceData = classAttendance.find(a => a.name === cls.name);
                                const attendanceRate = attendanceData?.attendanceRate || 0;


                                return (
                                    <tr key={cls.id} className="border-b border-slate-100">
                                        <td className="py-3 text-sm font-medium text-slate-800">{cls.name}</td>
                                        <td className="py-3 text-sm text-slate-600">{total}</td>
                                        <td className="py-3 text-sm text-slate-600">{boys}</td>
                                        <td className="py-3 text-sm text-slate-600">{girls}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-slate-200 rounded-full h-2">
                                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
                                                </div>
                                                <span className="text-sm font-medium">{attendanceRate}%</span>
                                            </div>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* My Subjects Pass Rates */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-800">My Subjects Pass Rates</h3>
                </div>

                {teacherSubjects.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>No subjects assigned yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">Subject</th>
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">Class</th>
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">QA1 Pass Rate</th>
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">QA2 Pass Rate</th>
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">End Term Pass Rate</th>
                                </tr>
                            </thead>
<tbody>
    {assignments.map((assignment, idx) => {
        const subject = teacherSubjects.find(s => s.id === assignment.subjectId);
        const cls = teacherClasses.find(c => c.id === assignment.classId);
        const className = cls?.name || 'Unknown';
        const subjectPerformance = currentPassRates.find(rate => rate.className === className);

        if (!subject) return null;

        return (
            <tr key={idx} className="border-b border-slate-100">
                <td className="py-3 text-sm font-medium text-slate-800">{subject.name}</td>
                <td className="py-3 text-sm text-slate-600">{className}</td>
                <td className="py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${subjectPerformance?.qa1PassRate || 0}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{subjectPerformance?.qa1PassRate || 0}%</span>
                    </div>
                </td>
                <td className="py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${subjectPerformance?.qa2PassRate || 0}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{subjectPerformance?.qa2PassRate || 0}%</span>
                    </div>
                </td>
                <td className="py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${subjectPerformance?.endOfTermPassRate || 0}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{subjectPerformance?.endOfTermPassRate || 0}%</span>
                    </div>
                </td>
            </tr>
        );
    })}
</tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Current Term Pass Rates - Teacher View */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Current Term Pass Rates</h3>
                </div>

                {teacherPassRates.length === 0 || (teacherPassRates.every(c => c.qa1PassRate === 0 && c.qa2PassRate === 0 && c.endOfTermPassRate === 0)) ? (
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
                                    {teacherPassRates.some(c => c.qa1PassRate > 0) && (
                                        <th className="text-left py-3 text-sm font-semibold text-slate-600">QA1 Pass Rate</th>
                                    )}
                                    {teacherPassRates.some(c => c.qa2PassRate > 0) && (
                                        <th className="text-left py-3 text-sm font-semibold text-slate-600">QA2 Pass Rate</th>
                                    )}
                                    {teacherPassRates.some(c => c.endOfTermPassRate > 0) && (
                                        <th className="text-left py-3 text-sm font-semibold text-slate-600">End Term Pass Rate</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {teacherPassRates.map((cls, idx) => {
                                    const classObj = teacherClasses.find(c => c.name === cls.className);
                                    const studentCount = classObj ? students.filter(s => s.class?.id === classObj.id).length : 0;
                                    return (
                                        <tr key={idx} className="border-b border-slate-100">
                                            <td className="py-3 text-sm font-medium text-slate-800">{cls.className}</td>
                                            <td className="py-3 text-sm text-slate-600">{studentCount}</td>
                                            {teacherPassRates.some(c => c.qa1PassRate > 0) && (
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-slate-200 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cls.qa1PassRate}%` }}></div>
                                                        </div>
                                                        <span className="text-sm font-medium">{cls.qa1PassRate}%</span>
                                                    </div>
                                                </td>
                                            )}
                                            {teacherPassRates.some(c => c.qa2PassRate > 0) && (
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-slate-200 rounded-full h-2">
                                                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${cls.qa2PassRate}%` }}></div>
                                                        </div>
                                                        <span className="text-sm font-medium">{cls.qa2PassRate}%</span>
                                                    </div>
                                                </td>
                                            )}
                                            {teacherPassRates.some(c => c.endOfTermPassRate > 0) && (
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

            {/* Pending Tasks */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Pending Tasks</h3>
                </div>
                <div className="space-y-3">
                    {pendingTasks.length === 0 ? (
                        <div className="text-center py-6 text-slate-500">
                            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p>No pending tasks</p>
                            <p className="text-sm mt-1">All caught up! 🎉</p>
                        </div>
                    ) : (
                        pendingTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{task.task}</p>
                                    <p className="text-xs text-slate-500">{task.count} items pending</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {task.priority}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

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
                        {reminders.length === 0 ? (
                            <div className="text-center py-6 text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>No reminders at this time.</p>
                            </div>
                        ) : (
                            reminders.map((reminder) => (
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
        </div>
    );
};

export default TeacherHomeOverview;
