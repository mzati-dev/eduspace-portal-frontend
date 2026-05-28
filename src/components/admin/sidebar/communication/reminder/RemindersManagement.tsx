import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, Users, UserCircle } from 'lucide-react';
import { fetchReminders, createReminder, deleteReminder, Reminder } from '@/services/reminderService';

const RemindersManagement: React.FC = () => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        message: '',
        type: 'info',
        audience: 'both',
        reminder_date: ''
    });

    // Load reminders from API
    const loadReminders = async () => {
        setLoading(true);
        try {
            const data = await fetchReminders();
            setReminders(data);
        } catch (error) {
            console.error('Failed to load reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReminders();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newReminder = await createReminder({
                message: formData.message,
                type: formData.type,
                audience: formData.audience,
                reminder_date: formData.reminder_date
            });
            setReminders([newReminder, ...reminders]);
            setShowForm(false);
            setFormData({ message: '', type: 'info', audience: 'both', reminder_date: '' });
        } catch (error) {
            console.error('Failed to create reminder:', error);
            alert('Failed to create reminder');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this reminder?')) {
            try {
                await deleteReminder(id);
                setReminders(reminders.filter(r => r.id !== id));
            } catch (error) {
                console.error('Failed to delete reminder:', error);
                alert('Failed to delete reminder');
            }
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'urgent': return 'bg-red-50 border-red-500 text-red-800';
            case 'warning': return 'bg-yellow-50 border-yellow-500 text-yellow-800';
            default: return 'bg-blue-50 border-blue-500 text-blue-800';
        }
    };

    const getAudienceStyles = (audience: string) => {
        switch (audience) {
            case 'teachers': return 'bg-green-100 text-green-700';
            case 'parents': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getAudienceLabel = (audience: string) => {
        switch (audience) {
            case 'teachers': return '👩‍🏫 Teachers Only';
            case 'parents': return '👨‍👩‍👧 Parents Only';
            default: return '👥 Both';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'urgent': return '🔴 URGENT';
            case 'warning': return '⚠️ WARNING';
            default: return 'ℹ️ INFO';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-slate-500 mt-2">Loading reminders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-600" />
                        Reminders
                    </h2>
                    <p className="text-slate-500 mt-1">Send reminders to teachers, parents, or both</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Reminder
                </button>
            </div>

            {/* Add Reminder Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Create New Reminder</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea
                                    required
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={3}
                                    placeholder="Enter reminder message..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Priority Type</label>
                                <select
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="info">ℹ️ Info - General information</option>
                                    <option value="warning">⚠️ Warning - Important notice</option>
                                    <option value="urgent">🔴 Urgent - Action required now</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Send To</label>
                                <select
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    value={formData.audience}
                                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                >
                                    <option value="teachers">👩‍🏫 Teachers Only</option>
                                    <option value="parents">👨‍👩‍👧 Parents Only</option>
                                    <option value="both">👥 Both Teachers & Parents</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    {formData.audience === 'teachers' && 'This reminder will only be visible to teachers'}
                                    {formData.audience === 'parents' && 'This reminder will only be visible to parents'}
                                    {formData.audience === 'both' && 'This reminder will be visible to everyone'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Reminder Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    value={formData.reminder_date}
                                    onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Create Reminder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reminders List */}
            <div className="space-y-3">
                {reminders.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No reminders yet</p>
                        <p className="text-slate-400 text-sm">Click "Add Reminder" to create one</p>
                    </div>
                ) : (
                    reminders.map((reminder) => (
                        <div
                            key={reminder.id}
                            className={`border-l-4 rounded-lg p-4 ${getTypeStyles(reminder.type)}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-start gap-2 flex-wrap mb-2">
                                        <p className="font-medium">{reminder.message}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getAudienceStyles(reminder.audience)}`}>
                                            {getAudienceLabel(reminder.audience)}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-white/50 font-medium">
                                            {getTypeLabel(reminder.type)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs opacity-70">
                                        <span>📅 {new Date(reminder.reminder_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(reminder.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                                    title="Delete reminder"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary Stats */}
            {reminders.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600">
                            Teachers: {reminders.filter(r => r.audience === 'teachers' || r.audience === 'both').length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-slate-600">
                            Parents: {reminders.filter(r => r.audience === 'parents' || r.audience === 'both').length}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemindersManagement;


// import React, { useState } from 'react';
// import { Plus, Trash2, Bell, Users, UserCheck, UserCircle } from 'lucide-react';

// interface Reminder {
//     id: string;
//     message: string;
//     type: 'info' | 'warning' | 'urgent';
//     audience: 'teachers' | 'parents' | 'both';
//     reminder_date: string;
//     createdAt: string;
// }

// const RemindersManagement: React.FC = () => {
//     // Sample data to show you the structure
//     const [reminders, setReminders] = useState<Reminder[]>([
//         {
//             id: '1',
//             message: 'Parent-teacher meeting tomorrow at 3pm in the hall',
//             type: 'urgent',
//             audience: 'parents',
//             reminder_date: '2026-05-27',
//             createdAt: '2026-05-26T10:00:00Z'
//         },
//         {
//             id: '2',
//             message: 'Submit end of term exam papers by Friday',
//             type: 'warning',
//             audience: 'teachers',
//             reminder_date: '2026-05-30',
//             createdAt: '2026-05-26T09:00:00Z'
//         },
//         {
//             id: '3',
//             message: 'School will be closed on Monday for public holiday',
//             type: 'info',
//             audience: 'both',
//             reminder_date: '2026-06-02',
//             createdAt: '2026-05-25T14:30:00Z'
//         }
//     ]);

//     const [showForm, setShowForm] = useState(false);
//     const [formData, setFormData] = useState({
//         message: '',
//         type: 'info',
//         audience: 'both',
//         reminder_date: ''
//     });

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         const newReminder: Reminder = {
//             id: Date.now().toString(),
//             message: formData.message,
//             type: formData.type as 'info' | 'warning' | 'urgent',
//             audience: formData.audience as 'teachers' | 'parents' | 'both',
//             reminder_date: formData.reminder_date,
//             createdAt: new Date().toISOString()
//         };

//         setReminders([newReminder, ...reminders]);
//         setShowForm(false);
//         setFormData({ message: '', type: 'info', audience: 'both', reminder_date: '' });
//     };

//     const handleDelete = (id: string) => {
//         if (confirm('Delete this reminder?')) {
//             setReminders(reminders.filter(r => r.id !== id));
//         }
//     };

//     const getTypeStyles = (type: string) => {
//         switch (type) {
//             case 'urgent': return 'bg-red-50 border-red-500 text-red-800';
//             case 'warning': return 'bg-yellow-50 border-yellow-500 text-yellow-800';
//             default: return 'bg-blue-50 border-blue-500 text-blue-800';
//         }
//     };

//     const getAudienceStyles = (audience: string) => {
//         switch (audience) {
//             case 'teachers': return 'bg-green-100 text-green-700';
//             case 'parents': return 'bg-purple-100 text-purple-700';
//             default: return 'bg-gray-100 text-gray-700';
//         }
//     };

//     const getAudienceLabel = (audience: string) => {
//         switch (audience) {
//             case 'teachers': return '👩‍🏫 Teachers Only';
//             case 'parents': return '👨‍👩‍👧 Parents Only';
//             default: return '👥 Both';
//         }
//     };

//     const getTypeLabel = (type: string) => {
//         switch (type) {
//             case 'urgent': return '🔴 URGENT';
//             case 'warning': return '⚠️ WARNING';
//             default: return 'ℹ️ INFO';
//         }
//     };

//     return (
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//                 <div>
//                     <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
//                         <Bell className="w-5 h-5 text-indigo-600" />
//                         Reminders
//                     </h2>
//                     <p className="text-slate-500 mt-1">Send reminders to teachers, parents, or both</p>
//                 </div>
//                 <button
//                     onClick={() => setShowForm(true)}
//                     className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
//                 >
//                     <Plus className="w-4 h-4" /> Add Reminder
//                 </button>
//             </div>

//             {/* Add Reminder Form Modal */}
//             {showForm && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl p-6 w-full max-w-md">
//                         <h3 className="text-lg font-bold mb-4">Create New Reminder</h3>
//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             {/* Message */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-1">Message</label>
//                                 <textarea
//                                     required
//                                     className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                     rows={3}
//                                     placeholder="Enter reminder message..."
//                                     value={formData.message}
//                                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//                                 />
//                             </div>

//                             {/* Type */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-1">Priority Type</label>
//                                 <select
//                                     className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
//                                     value={formData.type}
//                                     onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//                                 >
//                                     <option value="info">ℹ️ Info - General information</option>
//                                     <option value="warning">⚠️ Warning - Important notice</option>
//                                     <option value="urgent">🔴 Urgent - Action required now</option>
//                                 </select>
//                             </div>

//                             {/* Audience - THIS IS THE KEY PART */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-1">Send To</label>
//                                 <select
//                                     className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
//                                     value={formData.audience}
//                                     onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
//                                 >
//                                     <option value="teachers">👩‍🏫 Teachers Only</option>
//                                     <option value="parents">👨‍👩‍👧 Parents Only</option>
//                                     <option value="both">👥 Both Teachers & Parents</option>
//                                 </select>
//                                 <p className="text-xs text-slate-500 mt-1">
//                                     {formData.audience === 'teachers' && 'This reminder will only be visible to teachers'}
//                                     {formData.audience === 'parents' && 'This reminder will only be visible to parents'}
//                                     {formData.audience === 'both' && 'This reminder will be visible to everyone'}
//                                 </p>
//                             </div>

//                             {/* Date */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-1">Reminder Date</label>
//                                 <input
//                                     type="date"
//                                     required
//                                     className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
//                                     value={formData.reminder_date}
//                                     onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
//                                 />
//                             </div>

//                             {/* Form Buttons */}
//                             <div className="flex gap-3 justify-end pt-4">
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowForm(false)}
//                                     className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//                                 >
//                                     Create Reminder
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Reminders List */}
//             <div className="space-y-3">
//                 {reminders.length === 0 ? (
//                     <div className="text-center py-12">
//                         <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                         <p className="text-slate-500">No reminders yet</p>
//                         <p className="text-slate-400 text-sm">Click "Add Reminder" to create one</p>
//                     </div>
//                 ) : (
//                     reminders.map((reminder) => (
//                         <div
//                             key={reminder.id}
//                             className={`border-l-4 rounded-lg p-4 ${getTypeStyles(reminder.type)}`}
//                         >
//                             <div className="flex justify-between items-start">
//                                 <div className="flex-1">
//                                     {/* Message and Audience Badge */}
//                                     <div className="flex items-start gap-2 flex-wrap mb-2">
//                                         <p className="font-medium">{reminder.message}</p>
//                                         <span className={`text-xs px-2 py-1 rounded-full font-medium ${getAudienceStyles(reminder.audience)}`}>
//                                             {getAudienceLabel(reminder.audience)}
//                                         </span>
//                                         <span className="text-xs px-2 py-1 rounded-full bg-white/50 font-medium">
//                                             {getTypeLabel(reminder.type)}
//                                         </span>
//                                     </div>

//                                     {/* Date */}
//                                     <div className="flex items-center gap-4 text-xs opacity-70">
//                                         <span>📅 {new Date(reminder.reminder_date).toLocaleDateString('en-US', {
//                                             weekday: 'long',
//                                             year: 'numeric',
//                                             month: 'long',
//                                             day: 'numeric'
//                                         })}</span>
//                                     </div>
//                                 </div>

//                                 {/* Delete Button */}
//                                 <button
//                                     onClick={() => handleDelete(reminder.id)}
//                                     className="text-red-600 hover:text-red-800 transition-colors p-1"
//                                     title="Delete reminder"
//                                 >
//                                     <Trash2 className="w-4 h-4" />
//                                 </button>
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>

//             {/* Summary Stats */}
//             {reminders.length > 0 && (
//                 <div className="mt-6 pt-4 border-t border-slate-200 flex gap-4 text-sm">
//                     <div className="flex items-center gap-2">
//                         <Users className="w-4 h-4 text-green-600" />
//                         <span className="text-slate-600">
//                             Teachers: {reminders.filter(r => r.audience === 'teachers' || r.audience === 'both').length}
//                         </span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <UserCircle className="w-4 h-4 text-purple-600" />
//                         <span className="text-slate-600">
//                             Parents: {reminders.filter(r => r.audience === 'parents' || r.audience === 'both').length}
//                         </span>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default RemindersManagement;