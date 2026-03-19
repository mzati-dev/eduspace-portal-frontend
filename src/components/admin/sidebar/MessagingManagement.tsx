import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Users,
    UserCheck,
    GraduationCap,
    Calendar,
    Bell,
    AlertTriangle,
    Phone,
    Mail,
    Smartphone,
    Facebook,
    Twitter,
    Globe,
    Clock,
    CheckCircle,
    XCircle,
    Download,
    Filter,
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    Megaphone,
    Calendar as CalendarIcon,
    MapPin,
    Users as UsersIcon,
    MessageCircle,
    BookOpen
} from 'lucide-react';
import {
    fetchContacts,
    fetchMessages,
    fetchEvents,
    fetchBroadcasts,
    fetchMessagingStats,
    sendMessage,
    sendBroadcast,
    createEvent,
    updateEvent,
    deleteEvent,
    sendEventReminders,
    deleteMessage,
    resendMessage,
    getAudienceCount,
    Contact,
    Message,
    Event,
    Broadcast,
    MessagingStats
} from '@/services/adminmessagingService';

interface Props {
    classes: any[];
    students: any[];
    teachers: any[];
    parents?: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const MessagingManagement: React.FC<Props> = ({ classes, students, teachers, parents = [], showMessage }) => {
    const [activeTab, setActiveTab] = useState<'compose' | 'broadcast' | 'events' | 'history'>('compose');
    const [selectedAudience, setSelectedAudience] = useState<string>('all');
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [messageType, setMessageType] = useState<'sms' | 'email' | 'whatsapp' | 'push'>('sms');
    const [showEventModal, setShowEventModal] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [messageSubject, setMessageSubject] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [scheduleOption, setScheduleOption] = useState<'now' | 'later' | 'draft'>('now');
    const [scheduledDateTime, setScheduledDateTime] = useState('');

    // Real data states
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [stats, setStats] = useState<MessagingStats>({
        totalContacts: 0,
        messagesSent: 0,
        upcomingEvents: 0,
        activeBroadcasts: 0,
        pendingAlerts: 0,
        deliveryRate: 0,
        openRate: 0
    });
    const [audienceCount, setAudienceCount] = useState(0);

    // Load data on mount
    useEffect(() => {
        loadMessagingData();
    }, []);

    // Load data when tab changes
    useEffect(() => {
        if (activeTab === 'history') {
            loadMessages();
        } else if (activeTab === 'broadcast') {
            loadBroadcasts();
        } else if (activeTab === 'events') {
            loadEvents();
        }
    }, [activeTab]);

    // Update audience count when selections change
    useEffect(() => {
        updateAudienceCount();
    }, [selectedAudience, selectedClass]);

    const loadMessagingData = async () => {
        setLoadingData(true);
        try {
            const [contactsData, statsData] = await Promise.all([
                fetchContacts(),
                fetchMessagingStats()
            ]);

            setContacts(contactsData);
            setStats(statsData);
        } catch (error) {
            showMessage('Failed to load messaging data', true);
        } finally {
            setLoadingData(false);
        }
    };

    const loadMessages = async () => {
        try {
            const messagesData = await fetchMessages();
            setMessages(messagesData);
        } catch (error) {
            showMessage('Failed to load messages', true);
        }
    };

    const loadEvents = async () => {
        try {
            const eventsData = await fetchEvents('upcoming');
            setEvents(eventsData);
        } catch (error) {
            showMessage('Failed to load events', true);
        }
    };

    const loadBroadcasts = async () => {
        try {
            const broadcastsData = await fetchBroadcasts('active');
            setBroadcasts(broadcastsData);
        } catch (error) {
            showMessage('Failed to load broadcasts', true);
        }
    };

    const updateAudienceCount = async () => {
        try {
            let audience: string[] = [];
            if (selectedAudience === 'all') audience = ['parents', 'teachers', 'students'];
            else if (selectedAudience === 'parents') audience = ['parents'];
            else if (selectedAudience === 'teachers') audience = ['teachers'];
            else if (selectedAudience === 'students') audience = ['students'];
            else if (selectedAudience === 'class') audience = ['parents', 'students'];

            const classId = selectedAudience === 'class' && selectedClass !== 'all' ? selectedClass : undefined;
            const count = await getAudienceCount(audience, classId);
            setAudienceCount(count);
        } catch (error) {
            console.error('Failed to get audience count:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageSubject.trim() || !messageContent.trim()) {
            showMessage('Please enter both subject and message', true);
            return;
        }

        setLoading(true);
        try {
            let audience: string[] = [];
            if (selectedAudience === 'all') audience = ['parents', 'teachers', 'students'];
            else if (selectedAudience === 'parents') audience = ['parents'];
            else if (selectedAudience === 'teachers') audience = ['teachers'];
            else if (selectedAudience === 'students') audience = ['students'];
            else if (selectedAudience === 'class') audience = ['parents', 'students'];

            const messageData = {
                type: messageType,
                subject: messageSubject,
                content: messageContent,
                audience,
                classId: selectedAudience === 'class' && selectedClass !== 'all' ? selectedClass : undefined,
                saveAsDraft: scheduleOption === 'draft',
                ...(scheduleOption === 'later' && scheduledDateTime ? { scheduleFor: scheduledDateTime } : {})
            };

            const result = await sendMessage(messageData);

            showMessage(`Message ${scheduleOption === 'draft' ? 'saved as draft' : 'sent successfully'} to ${audienceCount} recipients`);

            // Reset form
            setMessageSubject('');
            setMessageContent('');
            setScheduleOption('now');

            // Refresh messages if in history tab
            if (activeTab === 'history') {
                loadMessages();
            }
        } catch (error: any) {
            showMessage(error.message || 'Failed to send message', true);
        } finally {
            setLoading(false);
        }
    };

    const handleEmergencyBroadcast = async (broadcastData: any) => {
        setLoading(true);
        try {
            const result = await sendBroadcast({
                title: broadcastData.title,
                message: broadcastData.message,
                priority: broadcastData.priority,
                channels: broadcastData.channels,
                audience: ['parents', 'teachers', 'students']
            });

            showMessage('Emergency broadcast sent successfully to all recipients');
            setShowBroadcastModal(false);

            // Refresh broadcasts
            loadBroadcasts();
        } catch (error: any) {
            showMessage(error.message || 'Failed to send broadcast', true);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (eventData: Partial<Event>) => {
        setLoading(true);
        try {
            const result = await createEvent(eventData);
            showMessage('Event created successfully');
            setShowEventModal(false);

            // Refresh events
            loadEvents();
        } catch (error: any) {
            showMessage(error.message || 'Failed to create event', true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await deleteEvent(eventId);
            showMessage('Event deleted successfully');

            // Refresh events
            loadEvents();
        } catch (error: any) {
            showMessage(error.message || 'Failed to delete event', true);
        }
    };

    const handleSendReminders = async (eventId: string) => {
        try {
            await sendEventReminders(eventId);
            showMessage('Reminders sent successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to send reminders', true);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Delete this message?')) return;

        try {
            await deleteMessage(messageId);
            showMessage('Message deleted');

            // Refresh messages
            loadMessages();
        } catch (error: any) {
            showMessage(error.message || 'Failed to delete message', true);
        }
    };

    const handleResendMessage = async (messageId: string) => {
        try {
            await resendMessage(messageId);
            showMessage('Message resent successfully');

            // Refresh messages
            loadMessages();
        } catch (error: any) {
            showMessage(error.message || 'Failed to resend message', true);
        }
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'parent_teacher': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'sports': return 'bg-green-100 text-green-700 border-green-200';
            case 'academic': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'holiday': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'emergency': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-700';
            case 'ongoing': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-slate-100 text-slate-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Messaging & Notifications</h2>
                    <p className="text-slate-500">Send messages, manage events, and broadcast alerts</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowBroadcastModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Megaphone className="w-4 h-4" />
                        Emergency Broadcast
                    </button>
                    <button
                        onClick={() => setShowEventModal(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        Create Event
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Contacts</p>
                            <p className="text-xl font-bold text-slate-800">{stats.totalContacts}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Messages Sent</p>
                            <p className="text-xl font-bold text-green-600">{stats.messagesSent.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Upcoming Events</p>
                            <p className="text-xl font-bold text-purple-600">{stats.upcomingEvents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Bell className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Active Broadcasts</p>
                            <p className="text-xl font-bold text-yellow-600">{stats.activeBroadcasts}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Pending Alerts</p>
                            <p className="text-xl font-bold text-red-600">{stats.pendingAlerts}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-200">
                    <div className="flex gap-2 p-2">
                        <button
                            onClick={() => setActiveTab('compose')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'compose'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            Compose Message
                        </button>
                        <button
                            onClick={() => setActiveTab('broadcast')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'broadcast'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Megaphone className="w-4 h-4 inline mr-2" />
                            Broadcasts
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'events'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Events
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'history'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Clock className="w-4 h-4 inline mr-2" />
                            Message History
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Loading State */}
                    {loadingData && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="text-slate-500 mt-2">Loading...</p>
                        </div>
                    )}

                    {/* Compose Message Tab */}
                    {!loadingData && activeTab === 'compose' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Message Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Message Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setMessageType('sms')}
                                            className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${messageType === 'sms'
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            <Phone className="w-5 h-5" />
                                            <span className="font-medium">SMS</span>
                                        </button>
                                        <button
                                            onClick={() => setMessageType('whatsapp')}
                                            className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${messageType === 'whatsapp'
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="font-medium">WhatsApp</span>
                                        </button>
                                        <button
                                            onClick={() => setMessageType('email')}
                                            className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${messageType === 'email'
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            <Mail className="w-5 h-5" />
                                            <span className="font-medium">Email</span>
                                        </button>
                                        <button
                                            onClick={() => setMessageType('push')}
                                            className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${messageType === 'push'
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            <Smartphone className="w-5 h-5" />
                                            <span className="font-medium">Push</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Audience Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Audience</label>
                                    <div className="space-y-2">
                                        <select
                                            value={selectedAudience}
                                            onChange={(e) => setSelectedAudience(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All Contacts ({stats.totalContacts})</option>
                                            <option value="parents">All Parents</option>
                                            <option value="teachers">All Teachers</option>
                                            <option value="students">All Students</option>
                                            <option value="class">Specific Class</option>
                                        </select>

                                        {selectedAudience === 'class' && (
                                            <select
                                                value={selectedClass}
                                                onChange={(e) => setSelectedClass(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="all">Select Class</option>
                                                {classes.map(cls => (
                                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                                ))}
                                            </select>
                                        )}

                                        {audienceCount > 0 && (
                                            <p className="text-sm text-indigo-600">
                                                Will be sent to {audienceCount} recipients
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Message Form */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={messageSubject}
                                    onChange={(e) => setMessageSubject(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter message subject"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                <textarea
                                    rows={6}
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Type your message here..."
                                />
                            </div>

                            {/* Schedule Options */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="schedule"
                                            value="now"
                                            checked={scheduleOption === 'now'}
                                            onChange={() => setScheduleOption('now')}
                                            className="text-indigo-600"
                                        />
                                        <span className="text-sm text-slate-700">Send Now</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="schedule"
                                            value="later"
                                            checked={scheduleOption === 'later'}
                                            onChange={() => setScheduleOption('later')}
                                            className="text-indigo-600"
                                        />
                                        <span className="text-sm text-slate-700">Schedule</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="schedule"
                                            value="draft"
                                            checked={scheduleOption === 'draft'}
                                            onChange={() => setScheduleOption('draft')}
                                            className="text-indigo-600"
                                        />
                                        <span className="text-sm text-slate-700">Save as Draft</span>
                                    </label>
                                </div>

                                {scheduleOption === 'later' && (
                                    <div>
                                        <input
                                            type="datetime-local"
                                            value={scheduledDateTime}
                                            onChange={(e) => setScheduledDateTime(e.target.value)}
                                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setMessageSubject('');
                                        setMessageContent('');
                                        setScheduleOption('now');
                                    }}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {loading ? 'Sending...' : scheduleOption === 'draft' ? 'Save Draft' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Broadcasts Tab */}
                    {!loadingData && activeTab === 'broadcast' && (
                        <div className="space-y-4">
                            {broadcasts.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No broadcasts found</div>
                            ) : (
                                broadcasts.map(broadcast => (
                                    <div key={broadcast.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${broadcast.priority === 'high' ? 'bg-red-100' :
                                                    broadcast.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                                                    }`}>
                                                    <Megaphone className={`w-5 h-5 ${broadcast.priority === 'high' ? 'text-red-600' :
                                                        broadcast.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                                        }`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-800">{broadcast.title}</h4>
                                                    <p className="text-sm text-slate-500">{broadcast.message}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(broadcast.priority)}`}>
                                                {broadcast.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <span className="text-slate-600">
                                                <Users className="w-4 h-4 inline mr-1" />
                                                {broadcast.audience.join(', ')}
                                            </span>
                                            <span className="text-slate-600">
                                                <Clock className="w-4 h-4 inline mr-1" />
                                                {new Date(broadcast.sentAt).toLocaleString()}
                                            </span>
                                            <span className="text-slate-600">
                                                <Globe className="w-4 h-4 inline mr-1" />
                                                {broadcast.channels.join(', ')}
                                            </span>
                                            {broadcast.stats && (
                                                <>
                                                    <span className="text-green-600">{broadcast.stats.delivered} delivered</span>
                                                    <span className="text-blue-600">{broadcast.stats.opened} opened</span>
                                                </>
                                            )}
                                            <span className={`text-xs font-medium ${broadcast.status === 'active' ? 'text-green-600' : 'text-slate-500'}`}>
                                                {broadcast.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Events Tab */}
                    {!loadingData && activeTab === 'events' && (
                        <div className="space-y-4">
                            {events.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No events found</div>
                            ) : (
                                events.map(event => (
                                    <div key={event.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                                                    {event.type === 'parent_teacher' && <UsersIcon className="w-5 h-5" />}
                                                    {event.type === 'sports' && <CalendarIcon className="w-5 h-5" />}
                                                    {event.type === 'academic' && <BookOpen className="w-5 h-5" />}
                                                    {event.type === 'emergency' && <AlertTriangle className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-800">{event.title}</h4>
                                                    <p className="text-sm text-slate-500">{event.description}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <span className="text-slate-600">
                                                <CalendarIcon className="w-4 h-4 inline mr-1" />
                                                {new Date(event.date).toLocaleDateString()} at {event.time}
                                            </span>
                                            <span className="text-slate-600">
                                                <MapPin className="w-4 h-4 inline mr-1" />
                                                {event.location}
                                            </span>
                                            <span className="text-slate-600">
                                                <Users className="w-4 h-4 inline mr-1" />
                                                {event.audience.join(', ')}
                                            </span>
                                            <span className="text-slate-600">
                                                <Bell className="w-4 h-4 inline mr-1" />
                                                {event.reminders.daysBefore.map(d => `${d}d`).join(', ')}
                                            </span>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button
                                                onClick={() => handleSendReminders(event.id)}
                                                className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                            >
                                                Send Reminders
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Message History Tab */}
                    {!loadingData && activeTab === 'history' && (
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No messages found</div>
                            ) : (
                                messages.map(message => (
                                    <div key={message.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-medium text-slate-800">{message.subject}</h4>
                                                <p className="text-sm text-slate-500 mt-1">{message.content}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${message.status === 'sent' ? 'bg-green-100 text-green-700' :
                                                message.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                    message.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {message.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <span className="text-slate-600">
                                                <Users className="w-4 h-4 inline mr-1" />
                                                {message.recipients.total} recipients
                                            </span>
                                            <span className="text-slate-600">
                                                <Clock className="w-4 h-4 inline mr-1" />
                                                {message.sentAt ? new Date(message.sentAt).toLocaleString() :
                                                    message.scheduledFor ? `Scheduled: ${new Date(message.scheduledFor).toLocaleString()}` : 'Draft'}
                                            </span>
                                            <span className="text-slate-600">
                                                <Globe className="w-4 h-4 inline mr-1" />
                                                {message.type}
                                            </span>
                                            {message.stats && (
                                                <>
                                                    <span className="text-green-600">{message.stats.delivered} delivered</span>
                                                    <span className="text-red-600">{message.stats.failed} failed</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button
                                                onClick={() => handleResendMessage(message.id)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                title="Resend"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMessage(message.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Emergency Broadcast Modal */}
            {showBroadcastModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">Emergency Broadcast</h3>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleEmergencyBroadcast({
                                title: formData.get('title'),
                                message: formData.get('message'),
                                priority: formData.get('priority'),
                                channels: Array.from(formData.getAll('channels'))
                            });
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Broadcast title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                <select name="priority" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500">
                                    <option value="high">High - Immediate Attention</option>
                                    <option value="medium">Medium - Important</option>
                                    <option value="low">Low - Informational</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Channels</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="channels" value="sms" defaultChecked className="rounded text-indigo-600" />
                                        <span>SMS</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="channels" value="whatsapp" defaultChecked className="rounded text-indigo-600" />
                                        <span>WhatsApp</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="channels" value="email" defaultChecked className="rounded text-indigo-600" />
                                        <span>Email</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="channels" value="push" defaultChecked className="rounded text-indigo-600" />
                                        <span>Push Notification</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea
                                    name="message"
                                    rows={4}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Type your emergency broadcast message..."
                                />
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-700">
                                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                                    This will be sent to ALL parents, teachers, and students immediately.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBroadcastModal(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Event</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const audience = Array.from(formData.getAll('audience'));
                            const reminderDays = Array.from(formData.getAll('reminderDays')).map(Number);

                            handleCreateEvent({
                                title: formData.get('title') as string,
                                description: formData.get('description') as string,
                                type: formData.get('type') as any,
                                date: formData.get('date') as string,
                                time: formData.get('time') as string,
                                location: formData.get('location') as string,
                                audience: audience as any,
                                status: 'upcoming',
                                reminders: {
                                    enabled: formData.get('sendReminders') === 'on',
                                    daysBefore: reminderDays
                                }
                            });
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter event title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter event description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                                    <select name="type" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                        <option value="parent_teacher">Parent-Teacher Meeting</option>
                                        <option value="sports">Sports Event</option>
                                        <option value="academic">Academic Event</option>
                                        <option value="holiday">Holiday</option>
                                        <option value="emergency">Emergency</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                    <input
                                        name="location"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter location"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        name="date"
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <input
                                        name="time"
                                        type="time"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="audience" value="parents" className="rounded text-indigo-600" />
                                        <span>Parents</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="audience" value="teachers" className="rounded text-indigo-600" />
                                        <span>Teachers</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="audience" value="students" className="rounded text-indigo-600" />
                                        <span>Students</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reminders</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="sendReminders" defaultChecked className="rounded text-indigo-600" />
                                        <span>Send reminders</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select name="reminderDays" className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                            <option value="7">7 days before</option>
                                            <option value="3">3 days before</option>
                                            <option value="1">1 day before</option>
                                            <option value="0">Same day</option>
                                        </select>
                                        <button type="button" className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm">
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEventModal(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagingManagement;


// import React, { useState } from 'react';
// import {
//     MessageSquare,
//     Send,
//     Users,
//     UserCheck,
//     GraduationCap,
//     Calendar,
//     Bell,
//     AlertTriangle,
//     Phone,
//     Mail,
//     Smartphone,
//     Facebook,
//     Twitter,
//     Globe,
//     Clock,
//     CheckCircle,
//     XCircle,
//     Download,
//     Filter,
//     Search,
//     Plus,
//     Edit2,
//     Trash2,
//     Eye,
//     Megaphone,
//     Calendar as CalendarIcon,
//     MapPin,
//     Users as UsersIcon,
//     MessageCircle,
//     BookOpen
// } from 'lucide-react';

// interface Contact {
//     id: string;
//     name: string;
//     phone?: string;
//     email?: string;
//     whatsapp?: string;
//     role: 'parent' | 'teacher' | 'student' | 'admin';
//     class?: string;
//     studentId?: string;
//     parentOf?: string;
// }

// interface Message {
//     id: string;
//     subject: string;
//     content: string;
//     recipients: {
//         groups: string[];
//         total: number;
//     };
//     status: 'sent' | 'scheduled' | 'draft' | 'failed';
//     sentAt?: string;
//     scheduledFor?: string;
//     type: 'sms' | 'email' | 'whatsapp' | 'push' | 'broadcast';
//     stats?: {
//         delivered: number;
//         failed: number;
//         pending: number;
//     };
// }

// interface Event {
//     id: string;
//     title: string;
//     description: string;
//     type: 'parent_teacher' | 'sports' | 'academic' | 'holiday' | 'emergency' | 'general';
//     date: string;
//     time: string;
//     endDate?: string;
//     location: string;
//     audience: ('parents' | 'teachers' | 'students' | 'all')[];
//     status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
//     reminders: {
//         enabled: boolean;
//         daysBefore: number[];
//     };
//     attachments?: string[];
// }

// interface Broadcast {
//     id: string;
//     title: string;
//     message: string;
//     priority: 'high' | 'medium' | 'low';
//     channels: ('sms' | 'email' | 'whatsapp' | 'push')[];
//     audience: ('parents' | 'teachers' | 'students' | 'all')[];
//     sentAt: string;
//     status: 'active' | 'ended' | 'cancelled';
// }

// interface Props {
//     classes: any[];
//     students: any[];
//     teachers: any[];
//     parents?: any[];
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const MessagingManagement: React.FC<Props> = ({ classes, students, teachers, parents = [], showMessage }) => {
//     const [activeTab, setActiveTab] = useState<'compose' | 'broadcast' | 'events' | 'history'>('compose');
//     const [selectedAudience, setSelectedAudience] = useState<string>('all');
//     const [selectedClass, setSelectedClass] = useState<string>('all');
//     const [messageType, setMessageType] = useState<'sms' | 'email' | 'whatsapp' | 'push'>('sms');
//     const [showEventModal, setShowEventModal] = useState(false);
//     const [showBroadcastModal, setShowBroadcastModal] = useState(false);
//     const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');

//     // Mock Data - Replace with actual API calls
//     const mockContacts: Contact[] = [
//         ...students.map(s => ({
//             id: `s-${s.id}`,
//             name: s.name,
//             phone: '+1234567890',
//             email: `parent.${s.name.toLowerCase()}@example.com`,
//             whatsapp: '+1234567890',
//             role: 'parent' as const,
//             class: s.class?.name,
//             studentId: s.id,
//             parentOf: s.name
//         })),
//         ...teachers.map(t => ({
//             id: `t-${t.id}`,
//             name: t.name,
//             phone: '+1234567891',
//             email: t.email,
//             whatsapp: '+1234567891',
//             role: 'teacher' as const
//         })),
//         ...students.map(s => ({
//             id: `st-${s.id}`,
//             name: s.name,
//             phone: s.phone,
//             email: s.email,
//             role: 'student' as const,
//             class: s.class?.name
//         }))
//     ];

//     const mockMessages: Message[] = [
//         {
//             id: '1',
//             subject: 'Parent-Teacher Meeting Reminder',
//             content: 'Dear parents, this is a reminder of the upcoming Parent-Teacher meeting on March 20th, 2024 at 4:00 PM. Please confirm your attendance.',
//             recipients: {
//                 groups: ['parents'],
//                 total: 245
//             },
//             status: 'sent',
//             sentAt: '2024-03-15 10:30 AM',
//             type: 'sms',
//             stats: {
//                 delivered: 238,
//                 failed: 7,
//                 pending: 0
//             }
//         },
//         {
//             id: '2',
//             subject: 'Emergency School Closure',
//             content: 'IMPORTANT: School will be closed tomorrow due to severe weather conditions. All students will receive online assignments.',
//             recipients: {
//                 groups: ['parents', 'teachers', 'students'],
//                 total: 520
//             },
//             status: 'sent',
//             sentAt: '2024-03-14 08:15 PM',
//             type: 'broadcast',
//             stats: {
//                 delivered: 518,
//                 failed: 2,
//                 pending: 0
//             }
//         },
//         {
//             id: '3',
//             subject: 'Term 2 Results Available',
//             content: 'Term 2 results are now available on the portal. Please log in to view your child\'s performance.',
//             recipients: {
//                 groups: ['parents'],
//                 total: 245
//             },
//             status: 'scheduled',
//             scheduledFor: '2024-03-25 09:00 AM',
//             type: 'email'
//         },
//         {
//             id: '4',
//             subject: 'Sports Day Announcement',
//             content: 'Annual Sports Day will be held on April 5th. Parents are cordially invited to attend.',
//             recipients: {
//                 groups: ['parents', 'teachers'],
//                 total: 320
//             },
//             status: 'draft',
//             type: 'whatsapp'
//         }
//     ];

//     const mockEvents: Event[] = [
//         {
//             id: '1',
//             title: 'Parent-Teacher Meeting - Grade 8',
//             description: 'Annual parent-teacher meeting to discuss student progress and upcoming examinations.',
//             type: 'parent_teacher',
//             date: '2024-03-20',
//             time: '16:00',
//             endDate: '2024-03-20',
//             location: 'School Hall',
//             audience: ['parents', 'teachers'],
//             status: 'upcoming',
//             reminders: {
//                 enabled: true,
//                 daysBefore: [7, 3, 1]
//             }
//         },
//         {
//             id: '2',
//             title: 'Emergency Staff Meeting',
//             description: 'Urgent staff meeting to discuss safety protocols and emergency procedures.',
//             type: 'emergency',
//             date: '2024-03-18',
//             time: '14:00',
//             location: 'Staff Room',
//             audience: ['teachers'],
//             status: 'upcoming',
//             reminders: {
//                 enabled: true,
//                 daysBefore: [1]
//             }
//         },
//         {
//             id: '3',
//             title: 'School Sports Day',
//             description: 'Annual sports competition featuring various athletic events.',
//             type: 'sports',
//             date: '2024-04-05',
//             time: '09:00',
//             endDate: '2024-04-06',
//             location: 'Sports Ground',
//             audience: ['parents', 'teachers', 'students'],
//             status: 'upcoming',
//             reminders: {
//                 enabled: true,
//                 daysBefore: [7, 3, 1]
//             }
//         },
//         {
//             id: '4',
//             title: 'End of Term Ceremony',
//             description: 'Closing ceremony and awards presentation for Term 2.',
//             type: 'academic',
//             date: '2024-03-28',
//             time: '10:00',
//             location: 'School Hall',
//             audience: ['parents', 'teachers', 'students'],
//             status: 'upcoming',
//             reminders: {
//                 enabled: true,
//                 daysBefore: [5, 2, 1]
//             }
//         }
//     ];

//     const mockBroadcasts: Broadcast[] = [
//         {
//             id: '1',
//             title: 'Weather Alert',
//             message: 'School will close early today due to heavy rainfall prediction. Please arrange pickup by 1:00 PM.',
//             priority: 'high',
//             channels: ['sms', 'whatsapp', 'push'],
//             audience: ['parents', 'teachers', 'students'],
//             sentAt: '2024-03-15 08:30 AM',
//             status: 'active'
//         },
//         {
//             id: '2',
//             title: 'Fee Payment Reminder',
//             message: 'Term 2 fees are due by March 30th. Please make payments to avoid late fees.',
//             priority: 'medium',
//             channels: ['sms', 'email'],
//             audience: ['parents'],
//             sentAt: '2024-03-14 09:00 AM',
//             status: 'active'
//         },
//         {
//             id: '3',
//             title: 'Transport Delay',
//             message: 'School buses are delayed by 30 minutes due to traffic. Please adjust pickup times.',
//             priority: 'high',
//             channels: ['sms', 'whatsapp'],
//             audience: ['parents'],
//             sentAt: '2024-03-13 03:15 PM',
//             status: 'ended'
//         }
//     ];

//     const getAudienceCount = (audience: string[]) => {
//         let count = 0;
//         if (audience.includes('all') || audience.includes('parents')) count += mockContacts.filter(c => c.role === 'parent').length;
//         if (audience.includes('all') || audience.includes('teachers')) count += mockContacts.filter(c => c.role === 'teacher').length;
//         if (audience.includes('all') || audience.includes('students')) count += mockContacts.filter(c => c.role === 'student').length;
//         return count;
//     };

//     const getEventTypeColor = (type: string) => {
//         switch (type) {
//             case 'parent_teacher': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
//             case 'sports': return 'bg-green-100 text-green-700 border-green-200';
//             case 'academic': return 'bg-blue-100 text-blue-700 border-blue-200';
//             case 'holiday': return 'bg-purple-100 text-purple-700 border-purple-200';
//             case 'emergency': return 'bg-red-100 text-red-700 border-red-200';
//             default: return 'bg-slate-100 text-slate-700 border-slate-200';
//         }
//     };

//     const getStatusColor = (status: string) => {
//         switch (status) {
//             case 'upcoming': return 'bg-blue-100 text-blue-700';
//             case 'ongoing': return 'bg-green-100 text-green-700';
//             case 'completed': return 'bg-slate-100 text-slate-700';
//             case 'cancelled': return 'bg-red-100 text-red-700';
//             default: return 'bg-slate-100 text-slate-700';
//         }
//     };

//     const getPriorityColor = (priority: string) => {
//         switch (priority) {
//             case 'high': return 'bg-red-100 text-red-700';
//             case 'medium': return 'bg-yellow-100 text-yellow-700';
//             case 'low': return 'bg-green-100 text-green-700';
//             default: return 'bg-slate-100 text-slate-700';
//         }
//     };

//     const handleSendMessage = async (type: string, audience: string[], message: any) => {
//         setLoading(true);
//         setTimeout(() => {
//             showMessage(`${type.toUpperCase()} message sent successfully to ${getAudienceCount(audience)} recipients`);
//             setLoading(false);
//         }, 2000);
//     };

//     const handleCreateEvent = async (event: Partial<Event>) => {
//         setLoading(true);
//         setTimeout(() => {
//             showMessage('Event created successfully');
//             setShowEventModal(false);
//             setLoading(false);
//         }, 1500);
//     };

//     const handleEmergencyBroadcast = async (message: string) => {
//         setLoading(true);
//         setTimeout(() => {
//             showMessage('Emergency broadcast sent to all parents, teachers, and students');
//             setLoading(false);
//             setShowBroadcastModal(false);
//         }, 2000);
//     };

//     const handleScheduleReminder = async (eventId: string) => {
//         setLoading(true);
//         setTimeout(() => {
//             showMessage('Reminders scheduled successfully');
//             setLoading(false);
//         }, 1000);
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">Messaging & Notifications</h2>
//                     <p className="text-slate-500">Send messages, manage events, and broadcast alerts</p>
//                 </div>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => setShowBroadcastModal(true)}
//                         className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
//                     >
//                         <Megaphone className="w-4 h-4" />
//                         Emergency Broadcast
//                     </button>
//                     <button
//                         onClick={() => setShowEventModal(true)}
//                         className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
//                     >
//                         <Calendar className="w-4 h-4" />
//                         Create Event
//                     </button>
//                 </div>
//             </div>

//             {/* Quick Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-indigo-100 rounded-lg">
//                             <Users className="w-5 h-5 text-indigo-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Total Contacts</p>
//                             <p className="text-xl font-bold text-slate-800">{mockContacts.length}</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-green-100 rounded-lg">
//                             <MessageSquare className="w-5 h-5 text-green-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Messages Sent</p>
//                             <p className="text-xl font-bold text-green-600">1,247</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-purple-100 rounded-lg">
//                             <Calendar className="w-5 h-5 text-purple-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Upcoming Events</p>
//                             <p className="text-xl font-bold text-purple-600">8</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-yellow-100 rounded-lg">
//                             <Bell className="w-5 h-5 text-yellow-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Active Broadcasts</p>
//                             <p className="text-xl font-bold text-yellow-600">2</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-red-100 rounded-lg">
//                             <AlertTriangle className="w-5 h-5 text-red-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Pending Alerts</p>
//                             <p className="text-xl font-bold text-red-600">3</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Tabs */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200">
//                 <div className="border-b border-slate-200">
//                     <div className="flex gap-2 p-2">
//                         <button
//                             onClick={() => setActiveTab('compose')}
//                             className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'compose'
//                                     ? 'bg-indigo-600 text-white'
//                                     : 'text-slate-600 hover:bg-slate-100'
//                                 }`}
//                         >
//                             <MessageSquare className="w-4 h-4 inline mr-2" />
//                             Compose Message
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('broadcast')}
//                             className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'broadcast'
//                                     ? 'bg-indigo-600 text-white'
//                                     : 'text-slate-600 hover:bg-slate-100'
//                                 }`}
//                         >
//                             <Megaphone className="w-4 h-4 inline mr-2" />
//                             Broadcasts
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('events')}
//                             className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'events'
//                                     ? 'bg-indigo-600 text-white'
//                                     : 'text-slate-600 hover:bg-slate-100'
//                                 }`}
//                         >
//                             <Calendar className="w-4 h-4 inline mr-2" />
//                             Events
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('history')}
//                             className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'history'
//                                     ? 'bg-indigo-600 text-white'
//                                     : 'text-slate-600 hover:bg-slate-100'
//                                 }`}
//                         >
//                             <Clock className="w-4 h-4 inline mr-2" />
//                             Message History
//                         </button>
//                     </div>
//                 </div>

//                 <div className="p-6">
//                     {/* Compose Message Tab */}
//                     {activeTab === 'compose' && (
//                         <div className="space-y-6">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 {/* Message Type Selection */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Message Type</label>
//                                     <div className="grid grid-cols-2 gap-2">
//                                         <button
//                                             onClick={() => setMessageType('sms')}
//                                             className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${messageType === 'sms'
//                                                     ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
//                                                     : 'border-slate-200 hover:border-indigo-300'
//                                                 }`}
//                                         >
//                                             <Phone className="w-5 h-5" />
//                                             <span className="font-medium">SMS</span>
//                                         </button>
//                                         <button
//                                             onClick={() => setMessageType('whatsapp')}
//                                             className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${messageType === 'whatsapp'
//                                                     ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
//                                                     : 'border-slate-200 hover:border-indigo-300'
//                                                 }`}
//                                         >
//                                             <MessageCircle className="w-5 h-5" />
//                                             <span className="font-medium">WhatsApp</span>
//                                         </button>
//                                         <button
//                                             onClick={() => setMessageType('email')}
//                                             className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${messageType === 'email'
//                                                     ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
//                                                     : 'border-slate-200 hover:border-indigo-300'
//                                                 }`}
//                                         >
//                                             <Mail className="w-5 h-5" />
//                                             <span className="font-medium">Email</span>
//                                         </button>
//                                         <button
//                                             onClick={() => setMessageType('push')}
//                                             className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${messageType === 'push'
//                                                     ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
//                                                     : 'border-slate-200 hover:border-indigo-300'
//                                                 }`}
//                                         >
//                                             <Smartphone className="w-5 h-5" />
//                                             <span className="font-medium">Push</span>
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {/* Audience Selection */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Audience</label>
//                                     <div className="space-y-2">
//                                         <select
//                                             value={selectedAudience}
//                                             onChange={(e) => setSelectedAudience(e.target.value)}
//                                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                         >
//                                             <option value="all">All Contacts</option>
//                                             <option value="parents">All Parents</option>
//                                             <option value="teachers">All Teachers</option>
//                                             <option value="students">All Students</option>
//                                             <option value="class">Specific Class</option>
//                                             <option value="custom">Custom Selection</option>
//                                         </select>

//                                         {selectedAudience === 'class' && (
//                                             <select
//                                                 value={selectedClass}
//                                                 onChange={(e) => setSelectedClass(e.target.value)}
//                                                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                             >
//                                                 <option value="all">Select Class</option>
//                                                 {classes.map(cls => (
//                                                     <option key={cls.id} value={cls.id}>{cls.name}</option>
//                                                 ))}
//                                             </select>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Message Form */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
//                                 <input
//                                     type="text"
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     placeholder="Enter message subject"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
//                                 <textarea
//                                     rows={6}
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     placeholder="Type your message here..."
//                                 />
//                             </div>

//                             {/* Schedule Options */}
//                             <div className="flex items-center gap-4">
//                                 <label className="flex items-center gap-2">
//                                     <input type="radio" name="schedule" value="now" defaultChecked className="text-indigo-600" />
//                                     <span className="text-sm text-slate-700">Send Now</span>
//                                 </label>
//                                 <label className="flex items-center gap-2">
//                                     <input type="radio" name="schedule" value="later" className="text-indigo-600" />
//                                     <span className="text-sm text-slate-700">Schedule</span>
//                                 </label>
//                                 <label className="flex items-center gap-2">
//                                     <input type="radio" name="schedule" value="draft" className="text-indigo-600" />
//                                     <span className="text-sm text-slate-700">Save as Draft</span>
//                                 </label>
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="flex justify-end gap-2">
//                                 <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
//                                     Preview
//                                 </button>
//                                 <button
//                                     onClick={() => handleSendMessage(messageType, [selectedAudience], {})}
//                                     disabled={loading}
//                                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
//                                 >
//                                     <Send className="w-4 h-4" />
//                                     {loading ? 'Sending...' : 'Send Message'}
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Broadcasts Tab */}
//                     {activeTab === 'broadcast' && (
//                         <div className="space-y-4">
//                             {mockBroadcasts.map(broadcast => (
//                                 <div key={broadcast.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
//                                     <div className="flex justify-between items-start mb-3">
//                                         <div className="flex items-center gap-3">
//                                             <div className={`p-2 rounded-lg ${broadcast.priority === 'high' ? 'bg-red-100' :
//                                                     broadcast.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
//                                                 }`}>
//                                                 <Megaphone className={`w-5 h-5 ${broadcast.priority === 'high' ? 'text-red-600' :
//                                                         broadcast.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
//                                                     }`} />
//                                             </div>
//                                             <div>
//                                                 <h4 className="font-medium text-slate-800">{broadcast.title}</h4>
//                                                 <p className="text-sm text-slate-500">{broadcast.message}</p>
//                                             </div>
//                                         </div>
//                                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(broadcast.priority)}`}>
//                                             {broadcast.priority.toUpperCase()}
//                                         </span>
//                                     </div>
//                                     <div className="flex flex-wrap gap-4 text-sm">
//                                         <span className="text-slate-600">
//                                             <Users className="w-4 h-4 inline mr-1" />
//                                             {getAudienceCount(broadcast.audience)} recipients
//                                         </span>
//                                         <span className="text-slate-600">
//                                             <Clock className="w-4 h-4 inline mr-1" />
//                                             {broadcast.sentAt}
//                                         </span>
//                                         <span className="text-slate-600">
//                                             <Globe className="w-4 h-4 inline mr-1" />
//                                             {broadcast.channels.join(', ')}
//                                         </span>
//                                         <span className={`text-xs font-medium ${broadcast.status === 'active' ? 'text-green-600' : 'text-slate-500'}`}>
//                                             {broadcast.status}
//                                         </span>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* Events Tab */}
//                     {activeTab === 'events' && (
//                         <div className="space-y-4">
//                             {mockEvents.map(event => (
//                                 <div key={event.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
//                                     <div className="flex justify-between items-start mb-3">
//                                         <div className="flex items-center gap-3">
//                                             <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
//                                                 {event.type === 'parent_teacher' && <UsersIcon className="w-5 h-5" />}
//                                                 {event.type === 'sports' && <CalendarIcon className="w-5 h-5" />}
//                                                 {event.type === 'academic' && <BookOpen className="w-5 h-5" />}
//                                                 {event.type === 'emergency' && <AlertTriangle className="w-5 h-5" />}
//                                             </div>
//                                             <div>
//                                                 <h4 className="font-medium text-slate-800">{event.title}</h4>
//                                                 <p className="text-sm text-slate-500">{event.description}</p>
//                                             </div>
//                                         </div>
//                                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
//                                             {event.status}
//                                         </span>
//                                     </div>
//                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                                         <span className="text-slate-600">
//                                             <CalendarIcon className="w-4 h-4 inline mr-1" />
//                                             {event.date} at {event.time}
//                                         </span>
//                                         <span className="text-slate-600">
//                                             <MapPin className="w-4 h-4 inline mr-1" />
//                                             {event.location}
//                                         </span>
//                                         <span className="text-slate-600">
//                                             <Users className="w-4 h-4 inline mr-1" />
//                                             {event.audience.join(', ')}
//                                         </span>
//                                         <span className="text-slate-600">
//                                             <Bell className="w-4 h-4 inline mr-1" />
//                                             {event.reminders.daysBefore.map(d => `${d}d`).join(', ')}
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-end gap-2 mt-3">
//                                         <button
//                                             onClick={() => handleScheduleReminder(event.id)}
//                                             className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
//                                         >
//                                             Send Reminders
//                                         </button>
//                                         <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
//                                             Edit
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* Message History Tab */}
//                     {activeTab === 'history' && (
//                         <div className="space-y-4">
//                             {mockMessages.map(message => (
//                                 <div key={message.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
//                                     <div className="flex justify-between items-start mb-3">
//                                         <div>
//                                             <h4 className="font-medium text-slate-800">{message.subject}</h4>
//                                             <p className="text-sm text-slate-500 mt-1">{message.content}</p>
//                                         </div>
//                                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${message.status === 'sent' ? 'bg-green-100 text-green-700' :
//                                                 message.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
//                                                     message.status === 'draft' ? 'bg-slate-100 text-slate-700' :
//                                                         'bg-red-100 text-red-700'
//                                             }`}>
//                                             {message.status}
//                                         </span>
//                                     </div>
//                                     <div className="flex flex-wrap gap-4 text-sm">
//                                         <span className="text-slate-600">
//                                             <Users className="w-4 h-4 inline mr-1" />
//                                             {message.recipients.total} recipients
//                                         </span>
//                                         <span className="text-slate-600">
//                                             <Clock className="w-4 h-4 inline mr-1" />
//                                             {message.sentAt || message.scheduledFor}
//                                         </span>
//                                         <span className="text-slate-600">
//                                             <Globe className="w-4 h-4 inline mr-1" />
//                                             {message.type}
//                                         </span>
//                                         {message.stats && (
//                                             <>
//                                                 <span className="text-green-600">{message.stats.delivered} delivered</span>
//                                                 <span className="text-red-600">{message.stats.failed} failed</span>
//                                             </>
//                                         )}
//                                     </div>
//                                     <div className="flex justify-end gap-2 mt-3">
//                                         <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
//                                             <Eye className="w-4 h-4" />
//                                         </button>
//                                         <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
//                                             <Send className="w-4 h-4" />
//                                         </button>
//                                         <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
//                                             <Trash2 className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Emergency Broadcast Modal */}
//             {showBroadcastModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl max-w-lg w-full p-6">
//                         <div className="flex items-center gap-3 mb-4">
//                             <div className="p-3 bg-red-100 rounded-full">
//                                 <AlertTriangle className="w-6 h-6 text-red-600" />
//                             </div>
//                             <h3 className="text-lg font-semibold text-slate-800">Emergency Broadcast</h3>
//                         </div>

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
//                                 <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500">
//                                     <option value="high">High - Immediate Attention</option>
//                                     <option value="medium">Medium - Important</option>
//                                     <option value="low">Low - Informational</option>
//                                 </select>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Channels</label>
//                                 <div className="space-y-2">
//                                     <label className="flex items-center gap-2">
//                                         <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
//                                         <span>SMS</span>
//                                     </label>
//                                     <label className="flex items-center gap-2">
//                                         <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
//                                         <span>WhatsApp</span>
//                                     </label>
//                                     <label className="flex items-center gap-2">
//                                         <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
//                                         <span>Email</span>
//                                     </label>
//                                     <label className="flex items-center gap-2">
//                                         <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
//                                         <span>Push Notification</span>
//                                     </label>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
//                                 <textarea
//                                     rows={4}
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                                     placeholder="Type your emergency broadcast message..."
//                                 />
//                             </div>

//                             <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//                                 <p className="text-sm text-red-700">
//                                     <AlertTriangle className="w-4 h-4 inline mr-1" />
//                                     This will be sent to ALL parents, teachers, and students immediately.
//                                 </p>
//                             </div>

//                             <div className="flex justify-end gap-2 mt-4">
//                                 <button
//                                     onClick={() => setShowBroadcastModal(false)}
//                                     className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={() => handleEmergencyBroadcast('Test emergency message')}
//                                     disabled={loading}
//                                     className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
//                                 >
//                                     {loading ? 'Sending...' : 'Send Broadcast'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Create Event Modal */}
//             {showEventModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
//                         <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Event</h3>

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
//                                 <input
//                                     type="text"
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     placeholder="Enter event title"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
//                                 <textarea
//                                     rows={3}
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     placeholder="Enter event description"
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
//                                     <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
//                                         <option value="parent_teacher">Parent-Teacher Meeting</option>
//                                         <option value="sports">Sports Event</option>
//                                         <option value="academic">Academic Event</option>
//                                         <option value="holiday">Holiday</option>
//                                         <option value="emergency">Emergency</option>
//                                         <option value="general">General</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
//                                     <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
//                                         <option value="upcoming">Upcoming</option>
//                                         <option value="ongoing">Ongoing</option>
//                                         <option value="completed">Completed</option>
//                                         <option value="cancelled">Cancelled</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
//                                     <input
//                                         type="date"
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
//                                     <input
//                                         type="time"
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
//                                 <input
//                                     type="text"
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     placeholder="Enter location"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
//                                 <div className="space-y-2">
//                                     <label className="flex items-center gap-2">
//                                         <input type="checkbox" className="rounded text-indigo-600" />
//                                         <span>Parents</span>
//                                     </label>
//                                     <label className="flex items-center gap-2">
//                                         <input type="checkbox" className="rounded text-indigo-600" />
//                                         <span>Teachers</span>
//                                     </label>
//                                     <label className="flex items-center gap-2">
//                                         <input type="checkbox" className="rounded text-indigo-600" />
//                                         <span>Students</span>
//                                     </label>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Reminders</label>
//                                 <div className="space-y-2">
//                                     <label className="flex items-center gap-2">
//                                         <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
//                                         <span>Send reminders</span>
//                                     </label>
//                                     <div className="flex gap-2">
//                                         <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
//                                             <option value="7">7 days before</option>
//                                             <option value="3">3 days before</option>
//                                             <option value="1">1 day before</option>
//                                             <option value="0">Same day</option>
//                                         </select>
//                                         <button className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm">
//                                             Add
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-2 mt-4">
//                                 <button
//                                     onClick={() => setShowEventModal(false)}
//                                     className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={() => handleCreateEvent({})}
//                                     disabled={loading}
//                                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
//                                 >
//                                     {loading ? 'Creating...' : 'Create Event'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default MessagingManagement;