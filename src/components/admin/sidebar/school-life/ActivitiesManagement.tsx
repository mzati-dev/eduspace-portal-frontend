import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, MapPin, User, Clock } from 'lucide-react';

interface Activity {
    id: string;
    title: string;
    description: string;
    activity_date: string;
    start_time: string;
    end_time: string;
    location: string;
    coordinator: string;
    is_active: boolean;
}

const ActivitiesManagement: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        activity_date: '',
        start_time: '',
        end_time: '',
        location: '',
        coordinator: ''
    });

    const fetchActivities = async () => {
        const response = await fetch('/api/activities', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setActivities(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingActivity
            ? `/api/activities/${editingActivity.id}`
            : '/api/activities';
        const method = editingActivity ? 'PATCH' : 'POST';

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        setShowForm(false);
        setEditingActivity(null);
        setFormData({ title: '', description: '', activity_date: '', start_time: '', end_time: '', location: '', coordinator: '' });
        fetchActivities();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this activity?')) {
            await fetch(`/api/activities/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchActivities();
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">School Activities</h2>
                    <p className="text-slate-500 mt-1">Manage upcoming events and activities</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Activity
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">{editingActivity ? 'Edit Activity' : 'Add Activity'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg p-2"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full border rounded-lg p-2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded-lg p-2"
                                        value={formData.activity_date}
                                        onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full border rounded-lg p-2"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full border rounded-lg p-2"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Location</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Coordinator</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        value={formData.coordinator}
                                        onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => {
                                    setShowForm(false);
                                    setEditingActivity(null);
                                }} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg text-slate-800">{activity.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{activity.description}</p>
                        <div className="mt-3 space-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(activity.activity_date).toLocaleDateString()}
                            </div>
                            {activity.start_time && activity.end_time && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {activity.start_time} - {activity.end_time}
                                </div>
                            )}
                            {activity.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {activity.location}
                                </div>
                            )}
                            {activity.coordinator && (
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {activity.coordinator}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                            <button onClick={() => {
                                setEditingActivity(activity);
                                setFormData({
                                    title: activity.title,
                                    description: activity.description,
                                    activity_date: activity.activity_date.split('T')[0],
                                    start_time: activity.start_time || '',
                                    end_time: activity.end_time || '',
                                    location: activity.location || '',
                                    coordinator: activity.coordinator || ''
                                });
                                setShowForm(true);
                            }} className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1">
                                <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => handleDelete(activity.id)} className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 ml-auto">
                                <Trash2 className="w-3 h-3" /> Delete
                            </button>
                        </div>
                    </div>
                ))}
                {activities.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No activities added yet. Click "Add Activity" to create one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivitiesManagement;