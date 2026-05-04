import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, Bell, Info } from 'lucide-react';

const RemindersManagement: React.FC = () => {
    const [reminders, setReminders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        message: '',
        type: 'info',
        reminder_date: ''
    });

    const fetchReminders = async () => {
        const response = await fetch('/api/reminders', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setReminders(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/reminders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });
        setShowForm(false);
        setFormData({ message: '', type: 'info', reminder_date: '' });
        fetchReminders();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this reminder?')) {
            await fetch(`/api/reminders/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchReminders();
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'urgent': return 'bg-red-100 border-red-500 text-red-700';
            case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            default: return 'bg-blue-100 border-blue-500 text-blue-700';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Reminders</h2>
                    <p className="text-slate-500 mt-1">Manage announcement reminders</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Reminder
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Add Reminder</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea
                                    required
                                    className="w-full border rounded-lg p-2"
                                    rows={3}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                >
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border rounded-lg p-2"
                                    value={formData.reminder_date}
                                    onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {reminders.map((reminder: any) => (
                    <div key={reminder.id} className={`p-3 rounded-lg border-l-4 flex justify-between items-start ${getTypeColor(reminder.type)}`}>
                        <div>
                            <p className="text-sm font-medium">{reminder.message}</p>
                            <p className="text-xs mt-1 opacity-75">
                                {new Date(reminder.reminder_date).toLocaleDateString()}
                            </p>
                        </div>
                        <button onClick={() => handleDelete(reminder.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {reminders.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No reminders yet. Click "Add Reminder" to create one.</p>
                )}
            </div>
        </div>
    );
};

export default RemindersManagement;