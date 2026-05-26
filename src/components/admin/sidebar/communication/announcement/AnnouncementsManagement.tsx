import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Pin, Target, Calendar, Eye, Send } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'general' | 'academic' | 'emergency' | 'event';
    audience: 'teachers' | 'parents' | 'both';  // NO students
    priority: 'low' | 'medium' | 'high';
    pinned: boolean;
    publish_date: string;
    expiry_date?: string;
    createdAt: string;
}

const AnnouncementsManagement: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([
        {
            id: '1',
            title: 'School Holiday Announcement',
            message: 'School will remain closed on Monday, June 3rd due to national holiday.',
            type: 'general',
            audience: 'both',
            priority: 'high',
            pinned: true,
            publish_date: '2026-05-26',
            expiry_date: '2026-06-03',
            createdAt: '2026-05-26T08:00:00Z'
        },
        {
            id: '2',
            title: 'Exam Schedule Released',
            message: 'Final term examinations will begin on June 10th. Parents please ensure your children are prepared.',
            type: 'academic',
            audience: 'parents',
            priority: 'high',
            pinned: false,
            publish_date: '2026-05-25',
            expiry_date: '2026-06-20',
            createdAt: '2026-05-25T10:30:00Z'
        },
        {
            id: '3',
            title: 'Parent-Teacher Conference',
            message: 'Annual parent-teacher conference scheduled for June 5th, 2:00 PM - 6:00 PM.',
            type: 'event',
            audience: 'parents',
            priority: 'medium',
            pinned: true,
            publish_date: '2026-05-24',
            expiry_date: '2026-06-05',
            createdAt: '2026-05-24T14:15:00Z'
        },
        {
            id: '4',
            title: 'Staff Meeting',
            message: 'All teachers must attend mandatory staff meeting on Friday at 2:30 PM.',
            type: 'academic',
            audience: 'teachers',
            priority: 'medium',
            pinned: false,
            publish_date: '2026-05-26',
            createdAt: '2026-05-26T09:00:00Z'
        }
    ]);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'general',
        audience: 'both',
        priority: 'medium',
        pinned: false,
        publish_date: '',
        expiry_date: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newAnnouncement: Announcement = {
            id: Date.now().toString(),
            title: formData.title,
            message: formData.message,
            type: formData.type as 'general' | 'academic' | 'emergency' | 'event',
            audience: formData.audience as 'teachers' | 'parents' | 'both',
            priority: formData.priority as 'low' | 'medium' | 'high',
            pinned: formData.pinned,
            publish_date: formData.publish_date,
            expiry_date: formData.expiry_date || undefined,
            createdAt: new Date().toISOString()
        };

        setAnnouncements([newAnnouncement, ...announcements]);
        setShowForm(false);
        setFormData({
            title: '',
            message: '',
            type: 'general',
            audience: 'both',
            priority: 'medium',
            pinned: false,
            publish_date: '',
            expiry_date: ''
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this announcement?')) {
            setAnnouncements(announcements.filter(a => a.id !== id));
        }
    };

    const togglePin = (id: string) => {
        setAnnouncements(announcements.map(a =>
            a.id === id ? { ...a, pinned: !a.pinned } : a
        ));
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'emergency': return 'border-l-red-500 bg-red-50';
            case 'academic': return 'border-l-blue-500 bg-blue-50';
            case 'event': return 'border-l-purple-500 bg-purple-50';
            default: return 'border-l-gray-500 bg-gray-50';
        }
    };

    const getAudienceBadge = (audience: string) => {
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
            case 'emergency': return '🚨 Emergency';
            case 'academic': return '📚 Academic';
            case 'event': return '🎉 Event';
            default: return '📢 General';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return '🔴 High Priority';
            case 'medium': return '🟡 Medium Priority';
            default: return '🟢 Low Priority';
        }
    };

    const pinnedAnnouncements = announcements.filter(a => a.pinned);
    const regularAnnouncements = announcements.filter(a => !a.pinned);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-indigo-600" />
                        Announcements
                    </h2>
                    <p className="text-slate-500 mt-1">Broadcast news to teachers and parents</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Make Announcement
                </button>
            </div>

            {/* Add Announcement Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8">
                        <h3 className="text-lg font-bold mb-4">Create New Announcement</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Announcement title..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea
                                    required
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    rows={4}
                                    placeholder="Announcement details..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="general">📢 General</option>
                                        <option value="academic">📚 Academic</option>
                                        <option value="event">🎉 Event</option>
                                        <option value="emergency">🚨 Emergency</option>
                                    </select>
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Priority</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">🟢 Low</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="high">🔴 High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Audience - ONLY teachers and parents */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Target Audience</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={formData.audience}
                                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                    >
                                        <option value="both">👥 Both Teachers & Parents</option>
                                        <option value="teachers">👩‍🏫 Teachers Only</option>
                                        <option value="parents">👨‍👩‍👧 Parents Only</option>
                                    </select>
                                </div>

                                {/* Pin to Top */}
                                <div className="flex items-center mt-7">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-indigo-600"
                                            checked={formData.pinned}
                                            onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium">Pin to top</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Publish Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Publish Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded-lg p-2"
                                        value={formData.publish_date}
                                        onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                                    />
                                </div>

                                {/* Expiry Date (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2"
                                        value={formData.expiry_date}
                                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Form Buttons */}
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Publish Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pinned Announcements Section */}
            {pinnedAnnouncements.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Pin className="w-4 h-4 text-red-500" />
                        <h3 className="font-semibold text-slate-700">Pinned Announcements</h3>
                    </div>
                    <div className="space-y-3">
                        {pinnedAnnouncements.map((announcement) => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onDelete={handleDelete}
                                onPin={togglePin}
                                getPriorityStyles={getPriorityStyles}
                                getTypeStyles={getTypeStyles}
                                getAudienceBadge={getAudienceBadge}
                                getAudienceLabel={getAudienceLabel}
                                getTypeLabel={getTypeLabel}
                                getPriorityLabel={getPriorityLabel}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Regular Announcements Section */}
            {regularAnnouncements.length > 0 && (
                <div>
                    <h3 className="font-semibold text-slate-700 mb-3">All Announcements</h3>
                    <div className="space-y-3">
                        {regularAnnouncements.map((announcement) => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onDelete={handleDelete}
                                onPin={togglePin}
                                getPriorityStyles={getPriorityStyles}
                                getTypeStyles={getTypeStyles}
                                getAudienceBadge={getAudienceBadge}
                                getAudienceLabel={getAudienceLabel}
                                getTypeLabel={getTypeLabel}
                                getPriorityLabel={getPriorityLabel}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {announcements.length === 0 && (
                <div className="text-center py-12">
                    <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No announcements yet</p>
                    <p className="text-slate-400 text-sm">Click "Make Announcement" to create one</p>
                </div>
            )}

            {/* Stats Summary - Only Teachers and Parents */}
            {announcements.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600">
                            👩‍🏫 Teachers: {announcements.filter(a => a.audience === 'teachers' || a.audience === 'both').length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span className="text-slate-600">
                            👨‍👩‍👧 Parents: {announcements.filter(a => a.audience === 'parents' || a.audience === 'both').length}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Separate component for each announcement card
const AnnouncementCard: React.FC<{
    announcement: Announcement;
    onDelete: (id: string) => void;
    onPin: (id: string) => void;
    getPriorityStyles: (priority: string) => string;
    getTypeStyles: (type: string) => string;
    getAudienceBadge: (audience: string) => string;
    getAudienceLabel: (audience: string) => string;
    getTypeLabel: (type: string) => string;
    getPriorityLabel: (priority: string) => string;
}> = ({ announcement, onDelete, onPin, getPriorityStyles, getTypeStyles, getAudienceBadge, getAudienceLabel, getTypeLabel, getPriorityLabel }) => {
    return (
        <div className={`rounded-lg border p-4 ${getTypeStyles(announcement.type)}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    {/* Title and Badges */}
                    <div className="flex items-start gap-2 flex-wrap mb-2">
                        <h4 className="font-bold text-slate-800">{announcement.title}</h4>
                        {announcement.pinned && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Pin className="w-3 h-3" /> Pinned
                            </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getAudienceBadge(announcement.audience)}`}>
                            {getAudienceLabel(announcement.audience)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityStyles(announcement.priority)}`}>
                            {getPriorityLabel(announcement.priority)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                            {getTypeLabel(announcement.type)}
                        </span>
                    </div>

                    {/* Message */}
                    <p className="text-slate-600 text-sm mb-2">{announcement.message}</p>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Published: {new Date(announcement.publish_date).toLocaleDateString()}
                        </span>
                        {announcement.expiry_date && (
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                Expires: {new Date(announcement.expiry_date).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onPin(announcement.id)}
                        className={`p-1 transition-colors ${announcement.pinned ? 'text-red-600 hover:text-red-800' : 'text-gray-400 hover:text-gray-600'}`}
                        title={announcement.pinned ? 'Unpin' : 'Pin to top'}
                    >
                        <Pin className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(announcement.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete announcement"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementsManagement;