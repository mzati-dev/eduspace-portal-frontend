import React, { useState } from 'react';
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

interface FeeStructure {
    id: string;
    term: string;
    academicYear: string;
    tuition: number;
    development: number;
    sports: number;
    library: number;
    transport: number;
    total: number;
    dueDate: string;
}

interface StudentFee {
    id: string;
    studentId: string;
    studentName: string;
    examNumber: string;
    class: string;
    parentPhone: string;
    parentEmail: string;
    feeStructure: FeeStructure;
    paid: number;
    balance: number;
    status: 'paid' | 'partial' | 'unpaid' | 'overdue';
    lastPayment?: {
        date: string;
        amount: number;
        method: string;
        reference: string;
    };
    paymentHistory: Payment[];
    reminders: Reminder[];
}

interface Payment {
    id: string;
    date: string;
    amount: number;
    method: 'cash' | 'card' | 'bank' | 'mobile';
    reference: string;
    receiptNumber: string;
    status: 'completed' | 'pending' | 'failed';
}

interface Reminder {
    id: string;
    type: 'sms' | 'email' | 'push';
    sentAt: string;
    status: 'sent' | 'failed' | 'pending';
    message: string;
}

interface FeeSummary {
    totalCollected: number;
    expectedRevenue: number;
    collectionRate: number;
    overdue: number;
    paidToday: number;
    pendingThisWeek: number;
}

interface Props {
    classes: any[];
    students: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const FeesManagement: React.FC<Props> = ({ classes, students, showMessage }) => {
    const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'overview' | 'payments' | 'reminders' | 'receipts'>('overview');
    const [selectedStudent, setSelectedStudent] = useState<StudentFee | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Mock Data - Replace with actual API calls
    const mockFeeStructure: FeeStructure = {
        id: '1',
        term: 'Term 1',
        academicYear: '2024/2025',
        tuition: 5000,
        development: 1000,
        sports: 500,
        library: 300,
        transport: 800,
        total: 7600,
        dueDate: '2024-03-15'
    };

    const mockStudentFees: StudentFee[] = [
        {
            id: '1',
            studentId: '1',
            studentName: 'John Doe',
            examNumber: 'SCH-24-001',
            class: 'Grade 8A',
            parentPhone: '+1234567890',
            parentEmail: 'parent.john@example.com',
            feeStructure: mockFeeStructure,
            paid: 7600,
            balance: 0,
            status: 'paid',
            lastPayment: {
                date: '2024-02-15',
                amount: 7600,
                method: 'card',
                reference: 'TXN123456'
            },
            paymentHistory: [
                {
                    id: 'p1',
                    date: '2024-02-15',
                    amount: 7600,
                    method: 'card',
                    reference: 'TXN123456',
                    receiptNumber: 'RCP-2024-001',
                    status: 'completed'
                }
            ],
            reminders: []
        },
        {
            id: '2',
            studentId: '2',
            studentName: 'Jane Smith',
            examNumber: 'SCH-24-002',
            class: 'Grade 8A',
            parentPhone: '+1234567891',
            parentEmail: 'parent.jane@example.com',
            feeStructure: mockFeeStructure,
            paid: 5000,
            balance: 2600,
            status: 'partial',
            lastPayment: {
                date: '2024-02-10',
                amount: 5000,
                method: 'cash',
                reference: 'CASH-001'
            },
            paymentHistory: [
                {
                    id: 'p2',
                    date: '2024-02-10',
                    amount: 5000,
                    method: 'cash',
                    reference: 'CASH-001',
                    receiptNumber: 'RCP-2024-002',
                    status: 'completed'
                }
            ],
            reminders: [
                {
                    id: 'r1',
                    type: 'sms',
                    sentAt: '2024-02-20',
                    status: 'sent',
                    message: 'Reminder: Fee balance of 2600 due by March 15'
                }
            ]
        },
        {
            id: '3',
            studentId: '3',
            studentName: 'Mike Johnson',
            examNumber: 'SCH-24-003',
            class: 'Grade 8B',
            parentPhone: '+1234567892',
            parentEmail: 'parent.mike@example.com',
            feeStructure: mockFeeStructure,
            paid: 0,
            balance: 7600,
            status: 'overdue',
            paymentHistory: [],
            reminders: [
                {
                    id: 'r2',
                    type: 'email',
                    sentAt: '2024-02-01',
                    status: 'sent',
                    message: 'First reminder: Fees due March 15'
                },
                {
                    id: 'r3',
                    type: 'sms',
                    sentAt: '2024-02-15',
                    status: 'sent',
                    message: 'Second reminder: Fees overdue'
                }
            ]
        },
        {
            id: '4',
            studentId: '4',
            studentName: 'Sarah Williams',
            examNumber: 'SCH-24-004',
            class: 'Grade 8A',
            parentPhone: '+1234567893',
            parentEmail: 'parent.sarah@example.com',
            feeStructure: mockFeeStructure,
            paid: 7600,
            balance: 0,
            status: 'paid',
            lastPayment: {
                date: '2024-02-20',
                amount: 7600,
                method: 'bank',
                reference: 'BANK-789012'
            },
            paymentHistory: [
                {
                    id: 'p3',
                    date: '2024-02-20',
                    amount: 7600,
                    method: 'bank',
                    reference: 'BANK-789012',
                    receiptNumber: 'RCP-2024-003',
                    status: 'completed'
                }
            ],
            reminders: []
        },
        {
            id: '5',
            studentId: '5',
            studentName: 'Tom Brown',
            examNumber: 'SCH-24-005',
            class: 'Grade 8C',
            parentPhone: '+1234567894',
            parentEmail: 'parent.tom@example.com',
            feeStructure: mockFeeStructure,
            paid: 3000,
            balance: 4600,
            status: 'partial',
            lastPayment: {
                date: '2024-02-05',
                amount: 3000,
                method: 'mobile',
                reference: 'MPESA-12345'
            },
            paymentHistory: [
                {
                    id: 'p4',
                    date: '2024-02-05',
                    amount: 3000,
                    method: 'mobile',
                    reference: 'MPESA-12345',
                    receiptNumber: 'RCP-2024-004',
                    status: 'completed'
                }
            ],
            reminders: []
        }
    ];

    const [feeData, setFeeData] = useState<StudentFee[]>(mockStudentFees);

    const summary: FeeSummary = {
        totalCollected: feeData.reduce((sum, s) => sum + s.paid, 0),
        expectedRevenue: feeData.reduce((sum, s) => sum + s.feeStructure.total, 0),
        collectionRate: (feeData.reduce((sum, s) => sum + s.paid, 0) / feeData.reduce((sum, s) => sum + s.feeStructure.total, 0)) * 100,
        overdue: feeData.filter(s => s.status === 'overdue').length,
        paidToday: 15200,
        pendingThisWeek: 28400
    };

    const filteredStudents = feeData.filter(s =>
        (selectedClass === 'all' || s.class === selectedClass) &&
        (s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'partial': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'unpaid': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const handleRecordPayment = (studentId: string, amount: number, method: string) => {
        setLoading(true);
        setTimeout(() => {
            setFeeData(prev => prev.map(s => {
                if (s.id === studentId) {
                    const newPaid = s.paid + amount;
                    const newStatus = newPaid >= s.feeStructure.total ? 'paid' : 'partial';
                    const newPayment: Payment = {
                        id: `p${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        amount,
                        method: method as any,
                        reference: `TXN-${Math.random().toString(36).substr(2, 9)}`,
                        receiptNumber: `RCP-${Date.now()}`,
                        status: 'completed'
                    };
                    return {
                        ...s,
                        paid: newPaid,
                        balance: s.feeStructure.total - newPaid,
                        status: newStatus,
                        lastPayment: {
                            date: newPayment.date,
                            amount: newPayment.amount,
                            method: newPayment.method,
                            reference: newPayment.reference
                        },
                        paymentHistory: [newPayment, ...s.paymentHistory]
                    };
                }
                return s;
            }));
            showMessage('Payment recorded successfully');
            setShowPaymentModal(false);
            setLoading(false);
        }, 1000);
    };

    const handleSendReminder = (studentIds: string[], type: 'sms' | 'email' | 'push') => {
        setLoading(true);
        setTimeout(() => {
            setFeeData(prev => prev.map(s => {
                if (studentIds.includes(s.id)) {
                    const newReminder: Reminder = {
                        id: `r${Date.now()}`,
                        type,
                        sentAt: new Date().toISOString().split('T')[0],
                        status: 'sent',
                        message: `Fee reminder: Balance of ${s.balance} due`
                    };
                    return {
                        ...s,
                        reminders: [newReminder, ...s.reminders]
                    };
                }
                return s;
            }));
            showMessage(`${type.toUpperCase()} reminders sent to ${studentIds.length} parent(s)`);
            setLoading(false);
        }, 1500);
    };

    const handleGenerateReceipt = (studentId: string) => {
        setSelectedStudent(feeData.find(s => s.id === studentId) || null);
        setShowReceiptModal(true);
    };

    const handleDownloadReceipt = (receiptNumber: string) => {
        setLoading(true);
        setTimeout(() => {
            showMessage(`Receipt ${receiptNumber} downloaded`);
            setLoading(false);
        }, 1000);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

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
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Bell className="w-4 h-4" />
                        Send Reminders
                    </button>
                    <button
                        onClick={() => {/* Export functionality */ }}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Wallet className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {summary.collectionRate.toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">KES {summary.totalCollected.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Total Collected</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">KES {summary.expectedRevenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Expected Revenue</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-green-600">KES {summary.paidToday.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Paid Today</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-xl font-bold text-yellow-600">KES {summary.pendingThisWeek.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Due This Week</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-xl font-bold text-red-600">{summary.overdue}</p>
                    <p className="text-xs text-slate-500">Overdue Accounts</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-green-600">{feeData.filter(s => s.status === 'paid').length}</p>
                    <p className="text-xs text-slate-500">Fully Paid</p>
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
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
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

            {/* Main Content */}
            {viewMode === 'overview' && (
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
                                        <td className="px-4 py-3 font-medium text-slate-800">KES {student.feeStructure.total.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-green-600 font-medium">KES {student.paid.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${student.balance === 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                KES {student.balance.toLocaleString()}
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

            {viewMode === 'payments' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Recent Payments</h3>
                        <button
                            onClick={() => setShowPaymentModal(true)}
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
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Receipt No.</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Amount</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Method</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Reference</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {feeData.flatMap(s =>
                                    s.paymentHistory.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">{p.date}</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-slate-800">{s.studentName}</p>
                                                    <p className="text-xs text-indigo-600">{s.examNumber}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-sm text-indigo-600">{p.receiptNumber}</td>
                                            <td className="px-4 py-3 font-medium text-green-600">KES {p.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-slate-600 capitalize">{p.method}</td>
                                            <td className="px-4 py-3 text-slate-600">{p.reference}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                    <CheckCircle className="w-3 h-3" />
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDownloadReceipt(p.receiptNumber)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewMode === 'reminders' && (
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
                                {feeData.flatMap(s =>
                                    s.reminders.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">{r.sentAt}</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-slate-800">{s.studentName}</p>
                                                    <p className="text-xs text-indigo-600">{s.examNumber}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${r.type === 'sms' ? 'bg-blue-100 text-blue-700' :
                                                        r.type === 'email' ? 'bg-green-100 text-green-700' :
                                                            'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {r.type === 'sms' ? <Phone className="w-3 h-3" /> :
                                                        r.type === 'email' ? <Mail className="w-3 h-3" /> :
                                                            <Bell className="w-3 h-3" />}
                                                    {r.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 max-w-md truncate">{r.message}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${r.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {r.status === 'sent' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewMode === 'receipts' && (
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
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Amount</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Payment Method</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {feeData.flatMap(s =>
                                    s.paymentHistory.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-sm text-indigo-600">{p.receiptNumber}</td>
                                            <td className="px-4 py-3 text-slate-600">{p.date}</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-slate-800">{s.studentName}</p>
                                                    <p className="text-xs text-indigo-600">{s.examNumber}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-green-600">KES {p.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-slate-600 capitalize">{p.method}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDownloadReceipt(p.receiptNumber)}
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
                                                        onClick={() => window.open(`/receipts/${p.receiptNumber}`, '_blank')}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Record Payment</h3>
                        {selectedStudent && (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="font-medium text-slate-800">{selectedStudent.studentName}</p>
                                    <p className="text-sm text-indigo-600">{selectedStudent.examNumber}</p>
                                    <p className="text-sm text-slate-600 mt-2">Balance: KES {selectedStudent.balance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter amount"
                                        max={selectedStudent.balance}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
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
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Transaction reference"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleRecordPayment(selectedStudent.id, 1000, 'cash')}
                                        disabled={loading}
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
            {showReceiptModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6">
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
                                    <p className="font-mono text-indigo-600">{selectedStudent.paymentHistory[0]?.receiptNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Date</p>
                                    <p>{selectedStudent.paymentHistory[0]?.date}</p>
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
                                        <th className="text-right px-4 py-2 text-sm font-semibold text-slate-600">Amount (KES)</th>
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
                                        <td className="px-4 py-2 text-right">{selectedStudent.paymentHistory[0]?.amount.toLocaleString()}</td>
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
                                <p className="capitalize">{selectedStudent.paymentHistory[0]?.method}</p>
                                <p className="text-xs text-slate-500 mt-1">Reference: {selectedStudent.paymentHistory[0]?.reference}</p>
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
                                onClick={() => handleDownloadReceipt(selectedStudent.paymentHistory[0]?.receiptNumber)}
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