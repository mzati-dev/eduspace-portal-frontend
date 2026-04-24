import React, { useState, useEffect } from 'react';
import {
    Wallet,
    CreditCard,
    Download,
    Bell,
    Search,
    Filter,
    Plus,
    Printer,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    FileText,
    Receipt,
    Send,
    RefreshCw,
    Eye
} from 'lucide-react';
import {
    fetchStudentFees,
    fetchFeeSummary,
    fetchFeeStructures,
    recordPayment,
    sendReminders,
    generateReceipt,
    downloadReceipt,
    fetchPaymentHistory,
    fetchReminderHistory,
    exportFeesReport,
    StudentFee,
    FeeSummary,
    Payment,
    Reminder,
    FeeStructure,
    PaymentFilters,
    fetchUniqueTerms
} from '@/services/feesService';
import FeeStructureManagement from './FeeStructureManagement';

interface Props {
    classes: any[];
    students: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const FeesManagement: React.FC<Props> = ({ classes, students, showMessage }) => {
    const [selectedTerm, setSelectedTerm] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [availableTerms, setAvailableTerms] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'overview' | 'payments' | 'reminders' | 'receipts' | 'structures'>('overview');
    const [selectedStudent, setSelectedStudent] = useState<StudentFee | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Real data states
    const [feeData, setFeeData] = useState<StudentFee[]>([]);
    const [summary, setSummary] = useState<FeeSummary>({
        totalCollected: 0,
        expectedRevenue: 0,
        collectionRate: 0,
        overdue: 0,
        paidToday: 0,
        pendingThisWeek: 0,
        paidThisMonth: 0,
        paidThisTerm: 0
    });
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
    const [reminderHistory, setReminderHistory] = useState<Reminder[]>([]);

    // Payment form state
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [paymentReference, setPaymentReference] = useState<string>('');
    const [paymentNotes, setPaymentNotes] = useState<string>('');


    // Load data on mount and when filters change
    // useEffect(() => {
    //     loadFeesData();
    // }, [selectedTerm, selectedClass]);



    // Fetch available terms from API
    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const terms = await fetchUniqueTerms();
                setAvailableTerms(terms);
                if (terms.length > 0) setSelectedTerm(terms[0]);
            } catch (error) {
                showMessage('Failed to load terms', true);
            }
        };
        fetchTerms();
    }, []);

    // Load data on mount and when filters change
    useEffect(() => {
        loadFeesData();
    }, [selectedTerm, selectedClass]);

    const loadFeesData = async () => {
        setLoadingData(true);
        try {
            const filters: PaymentFilters = {
                term: selectedTerm,
                classId: selectedClass !== 'all' ? selectedClass : undefined
            };

            const [feesData, summaryData, structuresData] = await Promise.all([
                fetchStudentFees(filters),
                fetchFeeSummary(selectedTerm, selectedClass !== 'all' ? selectedClass : undefined),
                fetchFeeStructures(selectedTerm)
            ]);

            setFeeData(feesData);
            setSummary(summaryData);
            setFeeStructures(structuresData);
        } catch (error) {
            showMessage('Failed to load fees data', true);
        } finally {
            setLoadingData(false);
        }
    };


    const loadPaymentHistory = async () => {
        try {
            const filters: PaymentFilters = {
                term: selectedTerm,
                classId: selectedClass !== 'all' ? selectedClass : undefined
            };
            const history = await fetchPaymentHistory(filters);
            setPaymentHistory(history);
        } catch (error) {
            showMessage('Failed to load payment history', true);
        }
    };

    const loadReminderHistory = async () => {
        try {
            const history = await fetchReminderHistory();
            setReminderHistory(history);
        } catch (error) {
            showMessage('Failed to load reminder history', true);
        }
    };

    // Switch view mode and load appropriate data
    useEffect(() => {
        if (viewMode === 'payments') {
            loadPaymentHistory();
        } else if (viewMode === 'reminders') {
            loadReminderHistory();
        }
    }, [viewMode, selectedTerm, selectedClass]);

    const handleRecordPayment = async () => {
        if (!selectedStudent) return;
        if (paymentAmount <= 0) {
            showMessage('Please enter a valid amount', true);
            return;
        }
        if (paymentAmount > selectedStudent.balance) {
            showMessage('Amount cannot exceed balance', true);
            return;
        }

        setLoading(true);
        try {
            const newPayment = await recordPayment({
                studentId: selectedStudent.studentId,
                amount: paymentAmount,
                method: paymentMethod,
                reference: paymentReference || undefined,
                notes: paymentNotes || undefined
            });

            // Refresh data
            await loadFeesData();
            if (viewMode === 'payments') await loadPaymentHistory();

            showMessage('Payment recorded successfully');
            setShowPaymentModal(false);

            // Reset form
            setPaymentAmount(0);
            setPaymentMethod('cash');
            setPaymentReference('');
            setPaymentNotes('');
        } catch (error: any) {
            showMessage(error.message || 'Failed to record payment', true);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReminder = async (studentIds: string[], type: 'sms' | 'email' | 'push') => {
        setLoading(true);
        try {
            const result = await sendReminders({
                studentIds,
                type
            });

            showMessage(`${type.toUpperCase()} reminders sent to ${result.sent} parent(s)`);

            // Refresh data
            await loadFeesData();
            if (viewMode === 'reminders') await loadReminderHistory();
        } catch (error: any) {
            showMessage(error.message || 'Failed to send reminders', true);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (receiptNumber: string) => {
        try {
            const blob = await downloadReceipt(receiptNumber);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receipt-${receiptNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showMessage(`Receipt ${receiptNumber} downloaded`);
        } catch (error: any) {
            showMessage(error.message || 'Failed to download receipt', true);
        }
    };

    const handleGenerateReceipt = async (studentId: string) => {
        const student = feeData.find(s => s.id === studentId);
        if (!student || !student.paymentHistory.length) {
            showMessage('No payment found for this student', true);
            return;
        }

        setSelectedStudent(student);
        setShowReceiptModal(true);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleExportReport = async () => {
        setLoading(true);
        try {
            const filters: PaymentFilters = {
                term: selectedTerm,
                classId: selectedClass !== 'all' ? selectedClass : undefined
            };

            const blob = await exportFeesReport('pdf', filters);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `fees-report-${selectedTerm}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showMessage('Fees report exported successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to export report', true);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'partial': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'unpaid': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const filteredStudents = feeData.filter(s =>
    (s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Fees Management</h2>
                    <p className="text-slate-500">Track payments, manage reminders, and generate receipts</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSendReminder(
                            feeData.filter(s => s.status === 'unpaid' || s.status === 'overdue').map(s => s.id),
                            'sms'
                        )}
                        disabled={loading || loadingData}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Bell className="w-4 h-4" />
                        Send Reminders
                    </button>
                    <button
                        onClick={handleExportReport}
                        disabled={loading || loadingData}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Wallet className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {summary.collectionRate.toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">MK {summary.totalCollected.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Total Collected</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">MK {summary.expectedRevenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Expected Revenue</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-green-600">MK {summary.paidToday.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Paid Today</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-xl font-bold text-indigo-600">MK {summary.paidThisMonth.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">This Month</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-xl font-bold text-purple-600">MK {summary.paidThisTerm.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">This Term</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-xl font-bold text-yellow-600">MK {summary.pendingThisWeek.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Due This Week</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-xl font-bold text-red-600">{summary.overdue}</p>
                    <p className="text-xs text-slate-500">Overdue Accounts</p>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setViewMode('overview')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'overview'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Wallet className="w-4 h-4 inline mr-2" />
                    Overview
                </button>
                <button
                    onClick={() => setViewMode('payments')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'payments'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Payments
                </button>
                <button
                    onClick={() => setViewMode('reminders')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'reminders'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Bell className="w-4 h-4 inline mr-2" />
                    Reminders
                </button>
                <button
                    onClick={() => setViewMode('receipts')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'receipts'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Receipts
                </button>

                <button
                    onClick={() => setViewMode('structures')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${viewMode === 'structures'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Fee Structures
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
                        <select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            {availableTerms.map(term => (
                                <option key={term} value={term}>{term}</option>
                            ))}
                        </select>
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
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
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

            {/* Loading State */}
            {loadingData && (
                <div className="bg-white rounded-xl p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-slate-500 mt-2">Loading fees data...</p>
                </div>
            )}

            {/* Main Content */}
            {!loadingData && viewMode === 'overview' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Total Fees</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Paid</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Balance</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Due Date</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-slate-800">{student.studentName}</p>
                                                <p className="text-xs text-indigo-600">{student.examNumber}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{student.class}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">MK {student.feeStructure.total.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-green-600 font-medium">MK {student.paid.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${student.balance === 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                MK {student.balance.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{student.feeStructure.dueDate}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Record Payment"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleGenerateReceipt(student.id)}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Generate Receipt"
                                                >
                                                    <Receipt className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleSendReminder([student.id], 'sms')}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Send Reminder"
                                                >
                                                    <Bell className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loadingData && viewMode === 'payments' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Recent Payments</h3>
                        <button
                            onClick={() => {
                                setSelectedStudent(null);
                                setShowPaymentModal(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Record Payment
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Date</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>  {/* ADD THIS */}
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Receipt No.</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Amount</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Method</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Reference</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paymentHistory.map(payment => {
                                    return (
                                        <tr key={payment.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">{payment.date}</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-slate-800">{payment.studentName || 'Unknown'}</p>
                                                    <p className="text-xs text-indigo-600">{payment.examNumber || ''}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{payment.className || 'N/A'}</td>  {/* ADD THIS LINE */}
                                            <td className="px-4 py-3 font-mono text-sm text-indigo-600">{payment.receiptNumber}</td>
                                            <td className="px-4 py-3 font-medium text-green-600">MK {payment.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-slate-600 capitalize">{payment.method}</td>
                                            <td className="px-4 py-3 text-slate-600">{payment.reference}</td>
                                            {/* <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                    <CheckCircle className="w-3 h-3" />
                                                    {payment.status}
                                                </span>
                                            </td> */}
                                            <td className="px-4 py-3">
                                                {(() => {
                                                    // Find the student in feeData to get their balance
                                                    const student = feeData.find(s => s.studentId === payment.studentId);
                                                    if (student && student.balance === 0) {
                                                        return (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Fully Paid
                                                            </span>
                                                        );
                                                    } else if (student && student.balance > 0) {
                                                        return (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                                                <Clock className="w-3 h-3" />
                                                                Balance: MK {student.balance.toLocaleString()}
                                                            </span>
                                                        );
                                                    } else {
                                                        return (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                                <CheckCircle className="w-3 h-3" />
                                                                {payment.status}
                                                            </span>
                                                        );
                                                    }
                                                })()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDownloadReceipt(payment.receiptNumber)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loadingData && viewMode === 'reminders' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Reminder History</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSendReminder(
                                    feeData.filter(s => s.status === 'unpaid' || s.status === 'overdue').map(s => s.id),
                                    'sms'
                                )}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send Bulk SMS
                            </button>
                            <button
                                onClick={() => handleSendReminder(
                                    feeData.filter(s => s.status === 'unpaid' || s.status === 'overdue').map(s => s.id),
                                    'email'
                                )}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                Send Bulk Email
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Date</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Type</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Message</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reminderHistory.map(reminder => {
                                    const student = feeData.find(s =>
                                        s.reminders.some(r => r.id === reminder.id)
                                    );
                                    return (
                                        <tr key={reminder.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">{reminder.sentAt}</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-slate-800">{student?.studentName || 'Unknown'}</p>
                                                    <p className="text-xs text-indigo-600">{student?.examNumber || ''}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${reminder.type === 'sms' ? 'bg-blue-100 text-blue-700' :
                                                    reminder.type === 'email' ? 'bg-green-100 text-green-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {reminder.type === 'sms' ? <Phone className="w-3 h-3" /> :
                                                        reminder.type === 'email' ? <Mail className="w-3 h-3" /> :
                                                            <Bell className="w-3 h-3" />}
                                                    {reminder.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 max-w-md truncate">{reminder.message}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${reminder.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {reminder.status === 'sent' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {reminder.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loadingData && viewMode === 'receipts' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">Receipts</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Receipt No.</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Date</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Student</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Class</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Amount</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Payment Method</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paymentHistory.map(payment => {
                                    return (
                                        <tr key={payment.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-sm text-indigo-600">{payment.receiptNumber}</td>
                                            <td className="px-4 py-3 text-slate-600">{payment.date}</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-slate-800">{payment.studentName || 'Unknown'}</p>
                                                    <p className="text-xs text-indigo-600">{payment.examNumber || ''}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{payment.className || 'N/A'}</td>  {/* ADD THIS LINE */}
                                            <td className="px-4 py-3 font-medium text-green-600">MK {payment.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-slate-600 capitalize">{payment.method}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDownloadReceipt(payment.receiptNumber)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handlePrintReceipt}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Print"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`/receipts/${payment.receiptNumber}`, '_blank')}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Fee Structures Tab */}
            {!loadingData && viewMode === 'structures' && (
                <div className="space-y-4">
                    <FeeStructureManagement
                        classes={classes}
                        showMessage={showMessage}
                        selectedTerm={selectedTerm}
                    />
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => {
                                setShowPaymentModal(false);
                                setSelectedStudent(null);
                                setPaymentAmount(0);
                                setPaymentMethod('cash');
                                setPaymentReference('');
                                setPaymentNotes('');
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Record Payment</h3>

                        {/* Student Selection if no student selected */}
                        {!selectedStudent && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                                <select
                                    onChange={(e) => {
                                        const student = feeData.find(s => s.id === e.target.value);
                                        setSelectedStudent(student || null);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Choose a student</option>
                                    {filteredStudents.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.studentName} - {s.examNumber} (Balance: MK {s.balance})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedStudent && (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="font-medium text-slate-800">{selectedStudent.studentName}</p>
                                    <p className="text-sm text-indigo-600">{selectedStudent.examNumber}</p>
                                    <p className="text-sm text-slate-600 mt-2">Balance: MK {selectedStudent.balance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter amount"
                                        max={selectedStudent.balance}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="bank">Bank Transfer</option>
                                        <option value="mobile">Mobile Money</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reference (Optional)</label>
                                    <input
                                        type="text"
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Transaction reference"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                                    <textarea
                                        value={paymentNotes}
                                        onChange={(e) => setPaymentNotes(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Any additional notes"
                                        rows={2}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setSelectedStudent(null);
                                            setPaymentAmount(0);
                                            setPaymentMethod('cash');
                                            setPaymentReference('');
                                            setPaymentNotes('');
                                        }}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRecordPayment}
                                        disabled={loading || !paymentAmount}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Record Payment'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && selectedStudent && selectedStudent.paymentHistory[0] && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-slate-800">Fee Receipt</h3>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="border border-slate-200 rounded-lg p-6">
                            {/* Receipt Header */}
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-indigo-600">EduSpace</h2>
                                <p className="text-slate-500">Fee Payment Receipt</p>
                            </div>

                            {/* Receipt Details */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-slate-500">Receipt No.</p>
                                    <p className="font-mono text-indigo-600">{selectedStudent.paymentHistory[0].receiptNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Date</p>
                                    <p>{selectedStudent.paymentHistory[0].date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Student Name</p>
                                    <p className="font-medium">{selectedStudent.studentName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Exam Number</p>
                                    <p>{selectedStudent.examNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Class</p>
                                    <p>{selectedStudent.class}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Term</p>
                                    <p>{selectedStudent.feeStructure.term} {selectedStudent.feeStructure.academicYear}</p>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <table className="w-full mb-6">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 py-2 text-sm font-semibold text-slate-600">Description</th>
                                        <th className="text-right px-4 py-2 text-sm font-semibold text-slate-600">Amount (MK)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="px-4 py-2">Tuition Fee</td>
                                        <td className="px-4 py-2 text-right">{selectedStudent.feeStructure.tuition.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2">Development Fee</td>
                                        <td className="px-4 py-2 text-right">{selectedStudent.feeStructure.development.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2">Sports Fee</td>
                                        <td className="px-4 py-2 text-right">{selectedStudent.feeStructure.sports.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2">Library Fee</td>
                                        <td className="px-4 py-2 text-right">{selectedStudent.feeStructure.library.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2">Transport Fee</td>
                                        <td className="px-4 py-2 text-right">{selectedStudent.feeStructure.transport.toLocaleString()}</td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td className="px-4 py-2">Total</td>
                                        <td className="px-4 py-2 text-right">{selectedStudent.feeStructure.total.toLocaleString()}</td>
                                    </tr>
                                    <tr className="text-green-600">
                                        <td className="px-4 py-2">Amount Paid</td>
                                        <td className="px-4 py-2 text-right">{selectedStudent.paymentHistory[0].amount.toLocaleString()}</td>
                                    </tr>
                                    <tr className="text-red-600">
                                        <td className="px-4 py-2">Balance</td>
                                        <td className="px-4 py-2 text-right">{selectedStudent.balance.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Payment Method */}
                            <div className="mb-6">
                                <p className="text-xs text-slate-500">Payment Method</p>
                                <p className="capitalize">{selectedStudent.paymentHistory[0].method}</p>
                                <p className="text-xs text-slate-500 mt-1">Reference: {selectedStudent.paymentHistory[0].reference}</p>
                                {selectedStudent.paymentHistory[0].notes && (
                                    <p className="text-xs text-slate-500 mt-1">Notes: {selectedStudent.paymentHistory[0].notes}</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-4">
                                <p>This is a computer-generated receipt. No signature required.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={handlePrintReceipt}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                            <button
                                onClick={() => handleDownloadReceipt(selectedStudent.paymentHistory[0].receiptNumber)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeesManagement;