// components/attendance/AlertsTab.tsx
import React from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { StudentAttendance } from './types';

interface AlertsTabProps {
    loading: boolean;
    alertHistory: any[];
    filteredStudents: StudentAttendance[];
    onSendAlert: (type: 'sms' | 'email', studentIds: string[]) => void;
}

const AlertsTab: React.FC<AlertsTabProps> = ({
    loading,
    alertHistory,
    filteredStudents,
    onSendAlert
}) => {
    const absentLateStudents = filteredStudents.filter(s => s.status === 'absent' || s.status === 'late');

    return (
        <div className="space-y-6">
            {/* Alert Controls */}
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
                            onClick={() => onSendAlert('sms', absentLateStudents.map(s => s.id))}
                            disabled={loading}
                            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                        >
                            Send SMS ({absentLateStudents.length})
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
                            onClick={() => onSendAlert('email', absentLateStudents.map(s => s.id))}
                            disabled={loading}
                            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
                        >
                            Send Emails
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                    {alertHistory.length > 0 ? (
                        alertHistory.map((alert, index) => (
                            <div key={alert.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-4 h-4 text-indigo-600" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {alert.subject} - {new Date(alert.sentAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Sent to {alert.recipientCount} parents • {alert.method?.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-green-600">{alert.status}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-slate-500">
                            No alert history available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertsTab;