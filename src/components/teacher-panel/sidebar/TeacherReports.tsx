import React, { useState } from 'react';
import {
    FileText,
    Download,
    Printer,
    Calendar,
    Users,
    BookOpen,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Award,
    AlertCircle,
    CheckCircle,
    Clock,
    Filter,
    Search,
    Eye,
    ChevronDown,
    ChevronUp,
    Star,
    Target,
    XCircle
} from 'lucide-react';

interface Student {
    id: string;
    name: string;
    examNumber: string;
    class?: {
        id: string;
        name: string;
    };
}

interface Class {
    id: string;
    name: string;
    term: string;
    academic_year: string;
}

interface Subject {
    id: string;
    name: string;
}

interface Report {
    id: string;
    title: string;
    type: 'academic' | 'attendance' | 'behavior' | 'summary';
    format: 'pdf' | 'excel' | 'csv';
    generatedAt: string;
    size: string;
    class?: string;
    term?: string;
}

interface Props {
    classes: Class[];
    students: Student[];
    subjects: Subject[];
    teacherId: string;
    teacherName: string;
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherReports: React.FC<Props> = ({
    classes,
    students,
    subjects,
    teacherId,
    teacherName,
    showMessage
}) => {
    const [selectedReportType, setSelectedReportType] = useState<string>('academic');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
    const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [expandedSections, setExpandedSections] = useState<string[]>(['summary']);

    // Mock data - In production, fetch from API
    const mockReports: Report[] = [
        {
            id: '1',
            title: 'Class Performance Summary - Grade 8A',
            type: 'summary',
            format: 'pdf',
            generatedAt: '2024-03-15',
            size: '2.4 MB',
            class: 'Grade 8A',
            term: 'Term 1'
        },
        {
            id: '2',
            title: 'Student Results - Grade 8A',
            type: 'academic',
            format: 'excel',
            generatedAt: '2024-03-14',
            size: '1.8 MB',
            class: 'Grade 8A',
            term: 'Term 1'
        },
        {
            id: '3',
            title: 'Attendance Report - March 2024',
            type: 'attendance',
            format: 'pdf',
            generatedAt: '2024-03-13',
            size: '1.2 MB',
            class: 'Grade 8A',
            term: 'Term 1'
        },
        {
            id: '4',
            title: 'Subject Performance Analysis - Mathematics',
            type: 'academic',
            format: 'pdf',
            generatedAt: '2024-03-12',
            size: '3.1 MB',
            class: 'Grade 8A',
            term: 'Term 1'
        }
    ];

    const mockPerformanceData = {
        classAverage: 74.5,
        passRate: 82,
        distinctionRate: 18,
        totalStudents: students.length,
        topPerformers: students.slice(0, 3).map(s => ({
            name: s.name,
            examNumber: s.examNumber,
            average: Math.floor(Math.random() * 10 + 85)
        })),
        needsImprovement: students.slice(3, 6).map(s => ({
            name: s.name,
            examNumber: s.examNumber,
            average: Math.floor(Math.random() * 15 + 50)
        })),
        subjectAverages: subjects.map(s => ({
            subject: s.name,
            average: Math.floor(Math.random() * 20 + 65),
            passRate: Math.floor(Math.random() * 20 + 70)
        }))
    };

    const mockAttendanceData = {
        overall: 92,
        present: 245,
        absent: 18,
        late: 7,
        excused: 5,
        totalDays: 275,
        monthlyTrend: [
            { month: 'Jan', rate: 94 },
            { month: 'Feb', rate: 91 },
            { month: 'Mar', rate: 89 },
            { month: 'Apr', rate: 93 },
            { month: 'May', rate: 92 },
            { month: 'Jun', rate: 90 }
        ]
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const handleGenerateReport = () => {
        if (!selectedClass) {
            showMessage('Please select a class', true);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showMessage('Report generated successfully');
            // Show preview or download
        }, 2000);
    };

    const handleDownloadReport = (reportId: string) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showMessage('Report downloaded successfully');
        }, 1500);
    };

    const handlePreviewReport = (report: any) => {
        setPreviewData(report);
        setShowPreviewModal(true);
    };

    const handlePrintReport = () => {
        window.print();
    };

    const handleExportData = (format: 'pdf' | 'excel' | 'csv') => {
        if (!selectedClass) {
            showMessage('Please select a class', true);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showMessage(`Data exported as ${format.toUpperCase()}`);
        }, 1500);
    };

    const filteredReports = mockReports.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.class?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Reports</h2>
                    <p className="text-slate-500">Generate and view reports for your classes</p>
                </div>
                <button
                    onClick={() => handleExportData(selectedFormat)}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export Data
                </button>
            </div>

            {/* Report Generation Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Generate New Report</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                        <select
                            value={selectedReportType}
                            onChange={(e) => setSelectedReportType(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="academic">Academic Performance</option>
                            <option value="attendance">Attendance Report</option>
                            <option value="behavior">Behavior Report</option>
                            <option value="summary">Class Summary</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} - {cls.term}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
                        <select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="pdf">PDF Document</option>
                            <option value="excel">Excel Spreadsheet</option>
                            <option value="csv">CSV File</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Quick Stats Preview */}
            {selectedClass && (
                <div className="space-y-4">
                    {/* Performance Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div
                            className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                            onClick={() => toggleSection('summary')}
                        >
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-indigo-600" />
                                Class Performance Summary
                            </h3>
                            {expandedSections.includes('summary') ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                        </div>

                        {expandedSections.includes('summary') && (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-indigo-50 rounded-lg p-4">
                                        <p className="text-sm text-indigo-600">Class Average</p>
                                        <p className="text-2xl font-bold text-indigo-800">{mockPerformanceData.classAverage}%</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-sm text-green-600">Pass Rate</p>
                                        <p className="text-2xl font-bold text-green-800">{mockPerformanceData.passRate}%</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <p className="text-sm text-purple-600">Distinctions</p>
                                        <p className="text-2xl font-bold text-purple-800">{mockPerformanceData.distinctionRate}%</p>
                                    </div>
                                    <div className="bg-amber-50 rounded-lg p-4">
                                        <p className="text-sm text-amber-600">Total Students</p>
                                        <p className="text-2xl font-bold text-amber-800">{mockPerformanceData.totalStudents}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Top Performers */}
                                    <div>
                                        <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-amber-600" />
                                            Top Performers
                                        </h4>
                                        <div className="space-y-2">
                                            {mockPerformanceData.topPerformers.map((student, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-green-800">{student.name}</p>
                                                        <p className="text-xs text-green-600">{student.examNumber}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-green-700">{student.average}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Needs Improvement */}
                                    <div>
                                        <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-red-600" />
                                            Needs Improvement
                                        </h4>
                                        <div className="space-y-2">
                                            {mockPerformanceData.needsImprovement.map((student, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-red-800">{student.name}</p>
                                                        <p className="text-xs text-red-600">{student.examNumber}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-red-700">{student.average}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Subject Averages */}
                                <div className="mt-6">
                                    <h4 className="font-medium text-slate-700 mb-3">Subject Performance</h4>
                                    <div className="space-y-3">
                                        {mockPerformanceData.subjectAverages.map((subject, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <span className="w-24 text-sm font-medium text-slate-600">{subject.subject}</span>
                                                <div className="flex-1">
                                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-600 rounded-full"
                                                            style={{ width: `${subject.average}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 text-sm">
                                                    <span className="font-medium text-slate-800">{subject.average}%</span>
                                                    <span className="text-green-600">{subject.passRate}% pass</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Attendance Overview */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div
                            className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                            onClick={() => toggleSection('attendance')}
                        >
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-600" />
                                Attendance Overview
                            </h3>
                            {expandedSections.includes('attendance') ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                        </div>

                        {expandedSections.includes('attendance') && (
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{mockAttendanceData.present}</p>
                                        <p className="text-xs text-slate-500">Present</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-red-600">{mockAttendanceData.absent}</p>
                                        <p className="text-xs text-slate-500">Absent</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-yellow-600">{mockAttendanceData.late}</p>
                                        <p className="text-xs text-slate-500">Late</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{mockAttendanceData.excused}</p>
                                        <p className="text-xs text-slate-500">Excused</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-indigo-600">{mockAttendanceData.overall}%</p>
                                        <p className="text-xs text-slate-500">Rate</p>
                                    </div>
                                </div>

                                {/* Monthly Trend */}
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-3">Monthly Attendance Trend</h4>
                                    <div className="grid grid-cols-6 gap-2">
                                        {mockAttendanceData.monthlyTrend.map((month, index) => (
                                            <div key={index} className="text-center">
                                                <div className="relative h-24 bg-slate-100 rounded-lg overflow-hidden">
                                                    <div
                                                        className="absolute bottom-0 w-full bg-green-600 transition-all"
                                                        style={{ height: `${month.rate}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs mt-2 font-medium text-slate-600">{month.month}</p>
                                                <p className="text-xs text-green-600">{month.rate}%</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Recent Reports</h3>
                </div>

                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredReports.map(report => (
                        <div key={report.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800">{report.title}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            <span className="capitalize">{report.type}</span>
                                            <span>•</span>
                                            <span>{report.format.toUpperCase()}</span>
                                            <span>•</span>
                                            <span>{report.generatedAt}</span>
                                            <span>•</span>
                                            <span>{report.size}</span>
                                        </div>
                                        {report.class && (
                                            <p className="text-xs text-indigo-600 mt-1">
                                                {report.class} • {report.term}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePreviewReport(report)}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDownloadReport(report.id)}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handlePrintReport}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                        title="Print"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview Modal */}
            {showPreviewModal && previewData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-800">{previewData.title}</h3>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Preview content - this would be dynamic based on report type */}
                            <div className="bg-slate-50 rounded-lg p-8 text-center">
                                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">Preview for {previewData.title}</p>
                                <p className="text-sm text-slate-400 mt-2">
                                    Format: {previewData.format.toUpperCase()} • Size: {previewData.size}
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleDownloadReport(previewData.id)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    onClick={handlePrintReport}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherReports;