import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Users,
    Phone,
    Mail,
    Search,
    Paperclip,
    Inbox,
    SendHorizonal,
    Star,
    Trash2,
    Clock,
    GraduationCap,
    Megaphone,
    Building2,
    Eye,
    Calendar,
    AlertCircle
} from 'lucide-react';
import {
    fetchParents,
    fetchInbox,
    fetchSentMessages,
    sendMessage,
    markMessageAsRead,
    getMessageStats,
    deleteMessage,
    fetchAdmins,
    fetchAnnouncements,
    createAnnouncement,
    markAnnouncementAsRead,
    Parent,
    Message,
    MessageStats,
    Admin,
    Announcement
} from '@/services/teacherMessageService';

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

type RecipientType = 'parent' | 'admin' | 'class';

interface Props {
    classes: Class[];
    students: Student[];
    subjects: Subject[];
    teacherId: string;
    teacherName: string;
    teacherRole?: string;
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherMessages: React.FC<Props> = ({
    classes,
    students,
    subjects,
    teacherId,
    teacherName,
    teacherRole = 'Teacher',
    showMessage
}) => {
    const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');
    const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent'>('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [messageText, setMessageText] = useState('');
    const [messageSubject, setMessageSubject] = useState('');
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [composeType, setComposeType] = useState<RecipientType>('parent');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Announcement states
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [announcementType, setAnnouncementType] = useState<'general' | 'academic' | 'event' | 'emergency'>('general');
    const [announcementAudience, setAnnouncementAudience] = useState<'all' | 'parents' | 'staff' | 'admin'>('all');
    const [scheduleAnnouncement, setScheduleAnnouncement] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [pinAnnouncement, setPinAnnouncement] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');

    // Real data states
    const [parents, setParents] = useState<Parent[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
    const [sentMessages, setSentMessages] = useState<Message[]>([]);
    const [stats, setStats] = useState<MessageStats>({ unread: 0, totalParents: 0, messagesSent: 0 });
    const [attachments, setAttachments] = useState<File[]>([]);

    // Load data on mount
    useEffect(() => {
        loadMessageData();
        loadAnnouncements();
        loadAdmins();
    }, [teacherId]);

    const loadMessageData = async () => {
        setLoadingData(true);
        try {
            const [parentsData, inboxData, sentData, statsData] = await Promise.all([
                fetchParents(teacherId),
                fetchInbox(teacherId),
                fetchSentMessages(teacherId),
                getMessageStats(teacherId)
            ]);

            setParents(parentsData);
            setInboxMessages(inboxData);
            setSentMessages(sentData);
            setStats(statsData);
        } catch (error) {
            showMessage('Failed to load messages', true);
        } finally {
            setLoadingData(false);
        }
    };

    const loadAnnouncements = async () => {
        try {
            const announcementsData = await fetchAnnouncements(teacherId, teacherRole);
            setAnnouncements(announcementsData);
        } catch (error) {
            showMessage('Failed to load announcements', true);
        }
    };

    const loadAdmins = async () => {
        try {
            const adminsData = await fetchAdmins();
            setAdmins(adminsData);
        } catch (error) {
            showMessage('Failed to load admins', true);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) {
            showMessage('Please enter a message', true);
            return;
        }

        if (!selectedParent && !selectedAdmin && !selectedClass) {
            showMessage('Please select a recipient', true);
            return;
        }

        setLoading(true);
        try {
            const messageData: any = {
                teacherId,
                content: messageText,
                subject: messageSubject || undefined
            };

            if (selectedClass) {
                messageData.classId = selectedClass;
                messageData.recipientType = 'class';
            } else if (selectedParent) {
                messageData.recipientIds = [selectedParent.id];
                messageData.recipientType = 'parent';
            } else if (selectedAdmin) {
                messageData.recipientIds = [selectedAdmin.id];
                messageData.recipientType = 'admin';
            }

            if (attachments.length > 0) {
                messageData.attachments = attachments;
            }

            await sendMessage(messageData);

            showMessage('Message sent successfully');
            resetComposeForm();
            loadMessageData();
        } catch (error: any) {
            showMessage(error.message || 'Failed to send message', true);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnnouncement = async () => {
        if (!announcementTitle.trim()) {
            showMessage('Please enter an announcement title', true);
            return;
        }
        if (!announcementContent.trim()) {
            showMessage('Please enter announcement content', true);
            return;
        }

        setLoading(true);
        try {
            await createAnnouncement({
                userId: teacherId,
                userRole: teacherRole,
                title: announcementTitle,
                content: announcementContent,
                type: announcementType,
                audience: announcementAudience,
                isPinned: pinAnnouncement,
                scheduledDate: scheduleAnnouncement ? scheduledDate : undefined,
                expiresAt: expiryDate || undefined
            });

            showMessage('Announcement created successfully');
            resetAnnouncementForm();
            loadAnnouncements();
        } catch (error: any) {
            showMessage(error.message || 'Failed to create announcement', true);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (messageId: string) => {
        try {
            await markMessageAsRead(messageId);
            setInboxMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? { ...msg, read: true } : msg
                )
            );
            setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAnnouncementAsRead = async (announcementId: string) => {
        try {
            await markAnnouncementAsRead(announcementId, teacherId);
            setAnnouncements(prev =>
                prev.map(ann =>
                    ann.id === announcementId
                        ? { ...ann, readBy: [...ann.readBy, teacherId] }
                        : ann
                )
            );
        } catch (error) {
            console.error('Failed to mark announcement as read:', error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Delete this message?')) return;

        try {
            await deleteMessage(messageId);
            if (activeFolder === 'inbox') {
                setInboxMessages(prev => prev.filter(msg => msg.id !== messageId));
            } else {
                setSentMessages(prev => prev.filter(msg => msg.id !== messageId));
            }
            showMessage('Message deleted');
        } catch (error: any) {
            showMessage(error.message || 'Failed to delete message', true);
        }
    };

    const resetComposeForm = () => {
        setMessageText('');
        setMessageSubject('');
        setSelectedParent(null);
        setSelectedAdmin(null);
        setSelectedClass('');
        setAttachments([]);
        setShowComposeModal(false);
    };

    const resetAnnouncementForm = () => {
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setAnnouncementType('general');
        setAnnouncementAudience('all');
        setScheduleAnnouncement(false);
        setScheduledDate('');
        setPinAnnouncement(false);
        setExpiryDate('');
        setShowAnnouncementModal(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    const getAnnouncementTypeColor = (type: string) => {
        switch (type) {
            case 'emergency': return 'bg-red-100 text-red-800';
            case 'event': return 'bg-green-100 text-green-800';
            case 'academic': return 'bg-blue-100 text-blue-800';
            default: return 'bg-purple-100 text-purple-800';
        }
    };

    const getAnnouncementIcon = (type: string) => {
        switch (type) {
            case 'emergency': return <AlertCircle className="w-4 h-4" />;
            case 'event': return <Calendar className="w-4 h-4" />;
            case 'academic': return <GraduationCap className="w-4 h-4" />;
            default: return <Megaphone className="w-4 h-4" />;
        }
    };

    const filteredParents = parents.filter(parent =>
        parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentMessages = activeFolder === 'inbox' ? inboxMessages : sentMessages;

    const filteredMessages = currentMessages.filter(msg =>
    (msg.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredAnnouncements = announcements.filter(ann =>
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if user has read an announcement
    const hasReadAnnouncement = (announcement: Announcement) => {
        return announcement.readBy.includes(teacherId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Communication Center</h2>
                    <p className="text-slate-500">Communicate with parents, staff, and make announcements</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setComposeType('parent');
                            setShowComposeModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4" />
                        New Message
                    </button>
                    <button
                        onClick={() => setShowAnnouncementModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <Megaphone className="w-4 h-4" />
                        Make Announcement
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors ${activeTab === 'messages'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-slate-600 hover:text-slate-800'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Messages
                        {stats.unread > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {stats.unread}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors ${activeTab === 'announcements'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-slate-600 hover:text-slate-800'
                            }`}
                    >
                        <Megaphone className="w-4 h-4 inline mr-2" />
                        Announcements
                        {announcements.filter(a => !hasReadAnnouncement(a)).length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {announcements.filter(a => !hasReadAnnouncement(a)).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {activeTab === 'messages' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Inbox className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Unread Messages</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Parents</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.totalParents}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Admins</p>
                                    <p className="text-2xl font-bold text-purple-600">{admins.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <SendHorizonal className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Messages Sent</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.messagesSent}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setActiveFolder('inbox')}
                                className={`px-6 py-3 text-sm font-medium transition-colors ${activeFolder === 'inbox'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                <Inbox className="w-4 h-4 inline mr-2" />
                                Inbox
                            </button>
                            <button
                                onClick={() => setActiveFolder('sent')}
                                className={`px-6 py-3 text-sm font-medium transition-colors ${activeFolder === 'sent'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                <SendHorizonal className="w-4 h-4 inline mr-2" />
                                Sent
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Message List */}
                        <div className="divide-y divide-slate-100">
                            {loadingData ? (
                                <div className="p-8 text-center text-slate-500">Loading messages...</div>
                            ) : filteredMessages.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No messages found</div>
                            ) : (
                                filteredMessages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!message.read && activeFolder === 'inbox' ? 'bg-indigo-50/50' : ''
                                            }`}
                                        onClick={() => activeFolder === 'inbox' && !message.read && markAsRead(message.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {message.parentName?.charAt(0) || message.adminName?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-slate-800">
                                                            {message.parentName || message.adminName || 'Unknown'}
                                                        </h4>
                                                        {message.studentName && (
                                                            <p className="text-xs text-indigo-600 mt-0.5">
                                                                Student: {message.studentName}
                                                            </p>
                                                        )}
                                                        {message.adminRole && (
                                                            <p className="text-xs text-purple-600 mt-0.5">
                                                                {message.adminRole}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                        {getTimeAgo(message.timestamp)}
                                                    </span>
                                                </div>
                                                {message.subject && (
                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        Subject: {message.subject}
                                                    </p>
                                                )}
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                    {message.content}
                                                </p>
                                                {!message.read && activeFolder === 'inbox' && (
                                                    <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteMessage(message.id);
                                                }}
                                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            ) : (
                // Announcements Section
                <div className="space-y-4">
                    {/* Pinned Announcements */}
                    {filteredAnnouncements.filter(a => a.isPinned).length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4 fill-yellow-500" />
                                Pinned Announcements
                            </h3>
                            <div className="space-y-3">
                                {filteredAnnouncements.filter(a => a.isPinned).map(announcement => (
                                    <div key={announcement.id} className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAnnouncementTypeColor(announcement.type)}`}>
                                                    {getAnnouncementIcon(announcement.type)}
                                                    {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    By {announcement.createdBy.name} • {getTimeAgo(announcement.createdAt)}
                                                </span>
                                            </div>
                                            {!hasReadAnnouncement(announcement) && (
                                                <button
                                                    onClick={() => handleMarkAnnouncementAsRead(announcement.id)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-slate-800 mb-2">{announcement.title}</h4>
                                        <p className="text-sm text-slate-600">{announcement.content}</p>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                Read by {announcement.readBy.length} people
                                            </span>
                                            {announcement.expiresAt && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Announcements */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search announcements..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {filteredAnnouncements.filter(a => !a.isPinned).length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No announcements found</div>
                            ) : (
                                filteredAnnouncements.filter(a => !a.isPinned).map(announcement => (
                                    <div key={announcement.id} className="p-4 hover:bg-slate-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAnnouncementTypeColor(announcement.type)}`}>
                                                    {getAnnouncementIcon(announcement.type)}
                                                    {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    By {announcement.createdBy.name} • {getTimeAgo(announcement.createdAt)}
                                                </span>
                                            </div>
                                            {!hasReadAnnouncement(announcement) && (
                                                <button
                                                    onClick={() => handleMarkAnnouncementAsRead(announcement.id)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-slate-800 mb-2">{announcement.title}</h4>
                                        <p className="text-sm text-slate-600">{announcement.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Contact Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Parent List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        Quick Message to Parents
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {filteredParents.slice(0, 5).map(parent => (
                            <button
                                key={parent.id}
                                onClick={() => {
                                    setComposeType('parent');
                                    setSelectedParent(parent);
                                    setShowComposeModal(true);
                                }}
                                className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {parent.name.charAt(0)}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-slate-800">{parent.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {parent.studentName} • {parent.studentClass}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {parent.email && (
                                        <a href={`mailto:${parent.email}`} className="p-1 text-slate-400 hover:text-indigo-600">
                                            <Mail className="w-3 h-3" />
                                        </a>
                                    )}
                                    {parent.phone && (
                                        <a href={`tel:${parent.phone}`} className="p-1 text-slate-400 hover:text-green-600">
                                            <Phone className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Admin List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        Quick Message to Admin
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {filteredAdmins.map(admin => (
                            <button
                                key={admin.id}
                                onClick={() => {
                                    setComposeType('admin');
                                    setSelectedAdmin(admin);
                                    setShowComposeModal(true);
                                }}
                                className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {admin.name.charAt(0)}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-slate-800">{admin.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {admin.role} • {admin.department || 'Admin'}
                                    </p>
                                </div>
                                <a href={`mailto:${admin.email}`} className="p-1 text-slate-400 hover:text-indigo-600">
                                    <Mail className="w-3 h-3" />
                                </a>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Compose Modal */}
            {showComposeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            New Message
                        </h3>

                        <div className="space-y-4">
                            {/* Recipient Type Selection */}
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => setComposeType('parent')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${composeType === 'parent'
                                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Parent
                                </button>
                                <button
                                    onClick={() => setComposeType('admin')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${composeType === 'admin'
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <Building2 className="w-4 h-4 inline mr-1" />
                                    Admin
                                </button>
                                <button
                                    onClick={() => setComposeType('class')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${composeType === 'class'
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <GraduationCap className="w-4 h-4 inline mr-1" />
                                    Whole Class
                                </button>
                            </div>

                            {/* Recipient Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Select Recipient
                                </label>
                                {composeType === 'parent' && (
                                    <select
                                        value={selectedParent?.id || ''}
                                        onChange={(e) => {
                                            const parent = parents.find(p => p.id === e.target.value);
                                            setSelectedParent(parent || null);
                                            setSelectedAdmin(null);
                                            setSelectedClass('');
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select a parent</option>
                                        {parents.map(parent => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name} ({parent.studentName})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {composeType === 'admin' && (
                                    <select
                                        value={selectedAdmin?.id || ''}
                                        onChange={(e) => {
                                            const admin = admins.find(a => a.id === e.target.value);
                                            setSelectedAdmin(admin || null);
                                            setSelectedParent(null);
                                            setSelectedClass('');
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select an admin</option>
                                        {admins.map(admin => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.name} ({admin.role})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {composeType === 'class' && (
                                    <select
                                        value={selectedClass}
                                        onChange={(e) => {
                                            setSelectedClass(e.target.value);
                                            setSelectedParent(null);
                                            setSelectedAdmin(null);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select a class</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name} - {cls.term} {cls.academic_year}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Subject (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={messageSubject}
                                    onChange={(e) => setMessageSubject(e.target.value)}
                                    placeholder="e.g., Upcoming Test, Absence Notice, etc."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Message
                                </label>
                                <textarea
                                    rows={5}
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Attachments */}
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:border-indigo-300 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    id="teacher-file-upload"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="teacher-file-upload" className="cursor-pointer">
                                    <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Click to attach files (optional)</p>
                                </label>
                                {attachments.length > 0 && (
                                    <div className="mt-2 text-left">
                                        <p className="text-xs font-medium text-slate-700">Selected files:</p>
                                        {attachments.map((file, index) => (
                                            <p key={index} className="text-xs text-slate-500">
                                                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    onClick={resetComposeForm}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>Sending...</>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            Create Announcement
                        </h3>

                        <div className="space-y-4">
                            {/* Announcement Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Announcement Type
                                </label>
                                <select
                                    value={announcementType}
                                    onChange={(e) => setAnnouncementType(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="general">General</option>
                                    <option value="academic">Academic</option>
                                    <option value="event">Event</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>

                            {/* Audience */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Audience
                                </label>
                                <select
                                    value={announcementAudience}
                                    onChange={(e) => setAnnouncementAudience(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">Everyone</option>
                                    <option value="parents">Parents Only</option>
                                    <option value="staff">Staff Only</option>
                                    <option value="admin">Admin Only</option>
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={announcementTitle}
                                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                                    placeholder="Announcement title"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Content
                                </label>
                                <textarea
                                    rows={5}
                                    value={announcementContent}
                                    onChange={(e) => setAnnouncementContent(e.target.value)}
                                    placeholder="Announcement details..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={pinAnnouncement}
                                        onChange={(e) => setPinAnnouncement(e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-700">Pin this announcement</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={scheduleAnnouncement}
                                        onChange={(e) => setScheduleAnnouncement(e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-700">Schedule for later</span>
                                </label>

                                {scheduleAnnouncement && (
                                    <input
                                        type="datetime-local"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Expiry Date (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    onClick={resetAnnouncementForm}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateAnnouncement}
                                    disabled={loading}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>Creating...</>
                                    ) : (
                                        <>
                                            <Megaphone className="w-4 h-4" />
                                            Create Announcement
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherMessages;



// import React, { useState, useEffect } from 'react';
// import {
//     MessageSquare,
//     Send,
//     Users,
//     Phone,
//     Mail,
//     Search,
//     Paperclip,
//     Inbox,
//     SendHorizonal,
//     Star,
//     Trash2,
//     Clock,
//     GraduationCap,
//     Megaphone,
//     Building2,
//     Eye,
//     Calendar,
//     AlertCircle
// } from 'lucide-react';
// import {
//     fetchParents,
//     fetchInbox,
//     fetchSentMessages,
//     sendMessage,
//     markMessageAsRead,
//     getMessageStats,
//     deleteMessage,
//     fetchAdmins,
//     fetchAnnouncements,
//     createAnnouncement,
//     markAnnouncementAsRead,
//     Parent,
//     Message,
//     MessageStats,
//     Admin,
//     Announcement
// } from '@/services/teacherMessageService';

// interface Student {
//     id: string;
//     name: string;
//     examNumber: string;
//     class?: {
//         id: string;
//         name: string;
//     };
// }

// interface Class {
//     id: string;
//     name: string;
//     term: string;
//     academic_year: string;
// }

// interface Subject {
//     id: string;
//     name: string;
// }

// type RecipientType = 'parent' | 'admin' | 'class';

// interface Props {
//     classes: Class[];
//     students: Student[];
//     subjects: Subject[];
//     teacherId: string;
//     teacherName: string;
//     teacherRole?: string;
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const TeacherMessages: React.FC<Props> = ({
//     classes,
//     students,
//     subjects,
//     teacherId,
//     teacherName,
//     teacherRole = 'Teacher',
//     showMessage
// }) => {
//     const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');
//     const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent'>('inbox');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
//     const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
//     const [messageText, setMessageText] = useState('');
//     const [messageSubject, setMessageSubject] = useState('');
//     const [showComposeModal, setShowComposeModal] = useState(false);
//     const [composeType, setComposeType] = useState<RecipientType>('parent');
//     const [selectedClass, setSelectedClass] = useState<string>('');
//     const [loading, setLoading] = useState(false);
//     const [loadingData, setLoadingData] = useState(false);

//     // Announcement states
//     const [announcements, setAnnouncements] = useState<Announcement[]>([]);
//     const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
//     const [announcementTitle, setAnnouncementTitle] = useState('');
//     const [announcementContent, setAnnouncementContent] = useState('');
//     const [announcementType, setAnnouncementType] = useState<'general' | 'academic' | 'event' | 'emergency'>('general');
//     const [announcementAudience, setAnnouncementAudience] = useState<'all' | 'parents' | 'staff' | 'admin'>('all');
//     const [scheduleAnnouncement, setScheduleAnnouncement] = useState(false);
//     const [scheduledDate, setScheduledDate] = useState('');
//     const [pinAnnouncement, setPinAnnouncement] = useState(false);
//     const [expiryDate, setExpiryDate] = useState('');

//     // Real data states
//     const [parents, setParents] = useState<Parent[]>([]);
//     const [admins, setAdmins] = useState<Admin[]>([]);
//     const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
//     const [sentMessages, setSentMessages] = useState<Message[]>([]);
//     const [stats, setStats] = useState<MessageStats>({ unread: 0, totalParents: 0, messagesSent: 0 });
//     const [attachments, setAttachments] = useState<File[]>([]);

//     // Load data on mount
//     useEffect(() => {
//         loadMessageData();
//         loadAnnouncements();
//         loadAdmins();
//     }, [teacherId]);

//     const loadMessageData = async () => {
//         setLoadingData(true);
//         try {
//             const [parentsData, inboxData, sentData, statsData] = await Promise.all([
//                 fetchParents(teacherId),
//                 fetchInbox(teacherId),
//                 fetchSentMessages(teacherId),
//                 getMessageStats(teacherId)
//             ]);

//             setParents(parentsData);
//             setInboxMessages(inboxData);
//             setSentMessages(sentData);
//             setStats(statsData);
//         } catch (error) {
//             showMessage('Failed to load messages', true);
//         } finally {
//             setLoadingData(false);
//         }
//     };

//     const loadAnnouncements = async () => {
//         try {
//             const announcementsData = await fetchAnnouncements(teacherId, teacherRole);
//             setAnnouncements(announcementsData);
//         } catch (error) {
//             console.error('Failed to load announcements:', error);
//             showMessage('Failed to load announcements', true);
//         }
//     };

//     const loadAdmins = async () => {
//         try {
//             const adminsData = await fetchAdmins();
//             setAdmins(adminsData);
//         } catch (error) {
//             console.error('Failed to load admins:', error);
//             showMessage('Failed to load admins', true);
//         }
//     };

//     const handleSendMessage = async () => {
//         if (!messageText.trim()) {
//             showMessage('Please enter a message', true);
//             return;
//         }

//         if (!selectedParent && !selectedAdmin && !selectedClass) {
//             showMessage('Please select a recipient', true);
//             return;
//         }

//         setLoading(true);
//         try {
//             const messageData: any = {
//                 teacherId,
//                 content: messageText,
//                 subject: messageSubject || undefined
//             };

//             if (selectedClass) {
//                 messageData.classId = selectedClass;
//                 messageData.recipientType = 'class';
//             } else if (selectedParent) {
//                 messageData.recipientIds = [selectedParent.id];
//                 messageData.recipientType = 'parent';
//             } else if (selectedAdmin) {
//                 messageData.recipientIds = [selectedAdmin.id];
//                 messageData.recipientType = 'admin';
//             }

//             if (attachments.length > 0) {
//                 messageData.attachments = attachments;
//             }

//             await sendMessage(messageData);

//             showMessage('Message sent successfully');
//             resetComposeForm();
//             loadMessageData();
//         } catch (error: any) {
//             showMessage(error.message || 'Failed to send message', true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleCreateAnnouncement = async () => {
//         if (!announcementTitle.trim()) {
//             showMessage('Please enter an announcement title', true);
//             return;
//         }
//         if (!announcementContent.trim()) {
//             showMessage('Please enter announcement content', true);
//             return;
//         }

//         setLoading(true);
//         try {
//             await createAnnouncement({
//                 userId: teacherId,
//                 userRole: teacherRole,
//                 title: announcementTitle,
//                 content: announcementContent,
//                 type: announcementType,
//                 audience: announcementAudience,
//                 isPinned: pinAnnouncement,
//                 scheduledDate: scheduleAnnouncement ? scheduledDate : undefined,
//                 expiresAt: expiryDate || undefined
//             });

//             showMessage('Announcement created successfully');
//             resetAnnouncementForm();
//             loadAnnouncements();
//         } catch (error: any) {
//             showMessage(error.message || 'Failed to create announcement', true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const markAsRead = async (messageId: string) => {
//         try {
//             await markMessageAsRead(messageId);
//             setInboxMessages(prev =>
//                 prev.map(msg =>
//                     msg.id === messageId ? { ...msg, read: true } : msg
//                 )
//             );
//             setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
//         } catch (error) {
//             console.error('Failed to mark as read:', error);
//         }
//     };

//     const handleMarkAnnouncementAsRead = async (announcementId: string) => {
//         try {
//             await markAnnouncementAsRead(announcementId, teacherId);
//             setAnnouncements(prev =>
//                 prev.map(ann =>
//                     ann.id === announcementId
//                         ? { ...ann, readBy: [...ann.readBy, teacherId] }
//                         : ann
//                 )
//             );
//         } catch (error) {
//             console.error('Failed to mark announcement as read:', error);
//         }
//     };

//     const handleDeleteMessage = async (messageId: string) => {
//         if (!confirm('Delete this message?')) return;

//         try {
//             await deleteMessage(messageId);
//             if (activeFolder === 'inbox') {
//                 setInboxMessages(prev => prev.filter(msg => msg.id !== messageId));
//             } else {
//                 setSentMessages(prev => prev.filter(msg => msg.id !== messageId));
//             }
//             showMessage('Message deleted');
//         } catch (error: any) {
//             showMessage(error.message || 'Failed to delete message', true);
//         }
//     };

//     const resetComposeForm = () => {
//         setMessageText('');
//         setMessageSubject('');
//         setSelectedParent(null);
//         setSelectedAdmin(null);
//         setSelectedClass('');
//         setAttachments([]);
//         setShowComposeModal(false);
//     };

//     const resetAnnouncementForm = () => {
//         setAnnouncementTitle('');
//         setAnnouncementContent('');
//         setAnnouncementType('general');
//         setAnnouncementAudience('all');
//         setScheduleAnnouncement(false);
//         setScheduledDate('');
//         setPinAnnouncement(false);
//         setExpiryDate('');
//         setShowAnnouncementModal(false);
//     };

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files) {
//             setAttachments(Array.from(e.target.files));
//         }
//     };

//     const getTimeAgo = (timestamp: string) => {
//         const date = new Date(timestamp);
//         const now = new Date();
//         const diff = now.getTime() - date.getTime();
//         const hours = Math.floor(diff / (1000 * 60 * 60));

//         if (hours < 1) return 'Just now';
//         if (hours < 24) return `${hours}h ago`;
//         return date.toLocaleDateString();
//     };

//     const getAnnouncementTypeColor = (type: string) => {
//         switch (type) {
//             case 'emergency': return 'bg-red-100 text-red-800';
//             case 'event': return 'bg-green-100 text-green-800';
//             case 'academic': return 'bg-blue-100 text-blue-800';
//             default: return 'bg-purple-100 text-purple-800';
//         }
//     };

//     const getAnnouncementIcon = (type: string) => {
//         switch (type) {
//             case 'emergency': return <AlertCircle className="w-4 h-4" />;
//             case 'event': return <Calendar className="w-4 h-4" />;
//             case 'academic': return <GraduationCap className="w-4 h-4" />;
//             default: return <Megaphone className="w-4 h-4" />;
//         }
//     };

//     const filteredParents = parents.filter(parent =>
//         parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         parent.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         parent.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const filteredAdmins = admins.filter(admin =>
//         admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         admin.role.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const currentMessages = activeFolder === 'inbox' ? inboxMessages : sentMessages;

//     const filteredMessages = currentMessages.filter(msg =>
//     (msg.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         msg.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     const filteredAnnouncements = announcements.filter(ann =>
//         ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         ann.content.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     // Check if user has read an announcement
//     const hasReadAnnouncement = (announcement: Announcement) => {
//         return announcement.readBy.includes(teacherId);
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">Communication Center</h2>
//                     <p className="text-slate-500">Communicate with parents, staff, and make announcements</p>
//                 </div>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => {
//                             setComposeType('parent');
//                             setShowComposeModal(true);
//                         }}
//                         className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
//                     >
//                         <MessageSquare className="w-4 h-4" />
//                         New Message
//                     </button>
//                     <button
//                         onClick={() => setShowAnnouncementModal(true)}
//                         className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
//                     >
//                         <Megaphone className="w-4 h-4" />
//                         Make Announcement
//                     </button>
//                 </div>
//             </div>

//             {/* Main Tabs */}
//             <div className="border-b border-slate-200">
//                 <div className="flex gap-6">
//                     <button
//                         onClick={() => setActiveTab('messages')}
//                         className={`pb-3 px-2 text-sm font-medium transition-colors ${activeTab === 'messages'
//                             ? 'text-indigo-600 border-b-2 border-indigo-600'
//                             : 'text-slate-600 hover:text-slate-800'
//                             }`}
//                     >
//                         <MessageSquare className="w-4 h-4 inline mr-2" />
//                         Messages
//                         {stats.unread > 0 && (
//                             <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
//                                 {stats.unread}
//                             </span>
//                         )}
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('announcements')}
//                         className={`pb-3 px-2 text-sm font-medium transition-colors ${activeTab === 'announcements'
//                             ? 'text-indigo-600 border-b-2 border-indigo-600'
//                             : 'text-slate-600 hover:text-slate-800'
//                             }`}
//                     >
//                         <Megaphone className="w-4 h-4 inline mr-2" />
//                         Announcements
//                         {announcements.filter(a => !hasReadAnnouncement(a)).length > 0 && (
//                             <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
//                                 {announcements.filter(a => !hasReadAnnouncement(a)).length}
//                             </span>
//                         )}
//                     </button>
//                 </div>
//             </div>

//             {activeTab === 'messages' ? (
//                 <>
//                     {/* Stats Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-blue-100 rounded-lg">
//                                     <Inbox className="w-5 h-5 text-blue-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-slate-500">Unread Messages</p>
//                                     <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-green-100 rounded-lg">
//                                     <Users className="w-5 h-5 text-green-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-slate-500">Parents</p>
//                                     <p className="text-2xl font-bold text-green-600">{stats.totalParents}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-purple-100 rounded-lg">
//                                     <Building2 className="w-5 h-5 text-purple-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-slate-500">Admins</p>
//                                     <p className="text-2xl font-bold text-purple-600">{admins.length}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-orange-100 rounded-lg">
//                                     <SendHorizonal className="w-5 h-5 text-orange-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-slate-500">Messages Sent</p>
//                                     <p className="text-2xl font-bold text-orange-600">{stats.messagesSent}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Messages Content */}
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                         {/* Tabs */}
//                         <div className="flex border-b border-slate-200">
//                             <button
//                                 onClick={() => setActiveFolder('inbox')}
//                                 className={`px-6 py-3 text-sm font-medium transition-colors ${activeFolder === 'inbox'
//                                     ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                     : 'text-slate-600 hover:text-slate-800'
//                                     }`}
//                             >
//                                 <Inbox className="w-4 h-4 inline mr-2" />
//                                 Inbox
//                             </button>
//                             <button
//                                 onClick={() => setActiveFolder('sent')}
//                                 className={`px-6 py-3 text-sm font-medium transition-colors ${activeFolder === 'sent'
//                                     ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                     : 'text-slate-600 hover:text-slate-800'
//                                     }`}
//                             >
//                                 <SendHorizonal className="w-4 h-4 inline mr-2" />
//                                 Sent
//                             </button>
//                         </div>

//                         {/* Search */}
//                         <div className="p-4 border-b border-slate-200">
//                             <div className="relative">
//                                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search messages..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>
//                         </div>

//                         {/* Message List */}
//                         <div className="divide-y divide-slate-100">
//                             {loadingData ? (
//                                 <div className="p-8 text-center text-slate-500">Loading messages...</div>
//                             ) : filteredMessages.length === 0 ? (
//                                 <div className="p-8 text-center text-slate-500">No messages found</div>
//                             ) : (
//                                 filteredMessages.map(message => (
//                                     <div
//                                         key={message.id}
//                                         className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!message.read && activeFolder === 'inbox' ? 'bg-indigo-50/50' : ''
//                                             }`}
//                                         onClick={() => activeFolder === 'inbox' && !message.read && markAsRead(message.id)}
//                                     >
//                                         <div className="flex items-start gap-3">
//                                             <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
//                                                 {message.parentName?.charAt(0) || message.adminName?.charAt(0) || 'U'}
//                                             </div>
//                                             <div className="flex-1 min-w-0">
//                                                 <div className="flex justify-between items-start">
//                                                     <div>
//                                                         <h4 className="font-medium text-slate-800">
//                                                             {message.parentName || message.adminName || 'Unknown'}
//                                                         </h4>
//                                                         {message.studentName && (
//                                                             <p className="text-xs text-indigo-600 mt-0.5">
//                                                                 Student: {message.studentName}
//                                                             </p>
//                                                         )}
//                                                         {message.adminRole && (
//                                                             <p className="text-xs text-purple-600 mt-0.5">
//                                                                 {message.adminRole}
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                     <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
//                                                         {getTimeAgo(message.timestamp)}
//                                                     </span>
//                                                 </div>
//                                                 {message.subject && (
//                                                     <p className="text-sm font-medium text-slate-700 mt-1">
//                                                         Subject: {message.subject}
//                                                     </p>
//                                                 )}
//                                                 <p className="text-sm text-slate-600 mt-1 line-clamp-2">
//                                                     {message.content}
//                                                 </p>
//                                                 {!message.read && activeFolder === 'inbox' && (
//                                                     <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
//                                                         New
//                                                     </span>
//                                                 )}
//                                             </div>
//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleDeleteMessage(message.id);
//                                                 }}
//                                                 className="p-1 text-slate-400 hover:text-red-600 rounded"
//                                             >
//                                                 <Trash2 className="w-4 h-4" />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     </div>
//                 </>
//             ) : (
//                 // Announcements Section
//                 <div className="space-y-4">
//                     {/* Pinned Announcements */}
//                     {filteredAnnouncements.filter(a => a.isPinned).length > 0 && (
//                         <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
//                             <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
//                                 <Star className="w-4 h-4 fill-yellow-500" />
//                                 Pinned Announcements
//                             </h3>
//                             <div className="space-y-3">
//                                 {filteredAnnouncements.filter(a => a.isPinned).map(announcement => (
//                                     <div key={announcement.id} className="bg-white rounded-lg p-4 shadow-sm">
//                                         <div className="flex justify-between items-start mb-2">
//                                             <div className="flex items-center gap-2">
//                                                 <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAnnouncementTypeColor(announcement.type)}`}>
//                                                     {getAnnouncementIcon(announcement.type)}
//                                                     {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
//                                                 </div>
//                                                 <span className="text-xs text-slate-500">
//                                                     By {announcement.createdBy.name} • {getTimeAgo(announcement.createdAt)}
//                                                 </span>
//                                             </div>
//                                             {!hasReadAnnouncement(announcement) && (
//                                                 <button
//                                                     onClick={() => handleMarkAnnouncementAsRead(announcement.id)}
//                                                     className="text-xs text-indigo-600 hover:text-indigo-800"
//                                                 >
//                                                     Mark as Read
//                                                 </button>
//                                             )}
//                                         </div>
//                                         <h4 className="font-semibold text-slate-800 mb-2">{announcement.title}</h4>
//                                         <p className="text-sm text-slate-600">{announcement.content}</p>
//                                         <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
//                                             <span className="flex items-center gap-1">
//                                                 <Eye className="w-3 h-3" />
//                                                 Read by {announcement.readBy.length} people
//                                             </span>
//                                             {announcement.expiresAt && (
//                                                 <span className="flex items-center gap-1">
//                                                     <Clock className="w-3 h-3" />
//                                                     Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}

//                     {/* All Announcements */}
//                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                         <div className="p-4 border-b border-slate-200">
//                             <div className="relative">
//                                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search announcements..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>
//                         </div>
//                         <div className="divide-y divide-slate-100">
//                             {filteredAnnouncements.filter(a => !a.isPinned).length === 0 ? (
//                                 <div className="p-8 text-center text-slate-500">No announcements found</div>
//                             ) : (
//                                 filteredAnnouncements.filter(a => !a.isPinned).map(announcement => (
//                                     <div key={announcement.id} className="p-4 hover:bg-slate-50">
//                                         <div className="flex justify-between items-start mb-2">
//                                             <div className="flex items-center gap-2">
//                                                 <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAnnouncementTypeColor(announcement.type)}`}>
//                                                     {getAnnouncementIcon(announcement.type)}
//                                                     {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
//                                                 </div>
//                                                 <span className="text-xs text-slate-500">
//                                                     By {announcement.createdBy.name} • {getTimeAgo(announcement.createdAt)}
//                                                 </span>
//                                             </div>
//                                             {!hasReadAnnouncement(announcement) && (
//                                                 <button
//                                                     onClick={() => handleMarkAnnouncementAsRead(announcement.id)}
//                                                     className="text-xs text-indigo-600 hover:text-indigo-800"
//                                                 >
//                                                     Mark as Read
//                                                 </button>
//                                             )}
//                                         </div>
//                                         <h4 className="font-semibold text-slate-800 mb-2">{announcement.title}</h4>
//                                         <p className="text-sm text-slate-600">{announcement.content}</p>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Quick Contact Sections */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Quick Parent List */}
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                         <Users className="w-4 h-4 text-indigo-600" />
//                         Quick Message to Parents
//                     </h3>
//                     <div className="space-y-2 max-h-60 overflow-y-auto">
//                         {filteredParents.slice(0, 5).map(parent => (
//                             <button
//                                 key={parent.id}
//                                 onClick={() => {
//                                     setComposeType('parent');
//                                     setSelectedParent(parent);
//                                     setShowComposeModal(true);
//                                 }}
//                                 className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
//                             >
//                                 <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                                     {parent.name.charAt(0)}
//                                 </div>
//                                 <div className="flex-1 text-left">
//                                     <p className="text-sm font-medium text-slate-800">{parent.name}</p>
//                                     <p className="text-xs text-slate-500">
//                                         {parent.studentName} • {parent.studentClass}
//                                     </p>
//                                 </div>
//                                 <div className="flex gap-1">
//                                     {parent.email && (
//                                         <a href={`mailto:${parent.email}`} className="p-1 text-slate-400 hover:text-indigo-600">
//                                             <Mail className="w-3 h-3" />
//                                         </a>
//                                     )}
//                                     {parent.phone && (
//                                         <a href={`tel:${parent.phone}`} className="p-1 text-slate-400 hover:text-green-600">
//                                             <Phone className="w-3 h-3" />
//                                         </a>
//                                     )}
//                                 </div>
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Quick Admin List */}
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                         <Building2 className="w-4 h-4 text-purple-600" />
//                         Quick Message to Admin
//                     </h3>
//                     <div className="space-y-2 max-h-60 overflow-y-auto">
//                         {filteredAdmins.map(admin => (
//                             <button
//                                 key={admin.id}
//                                 onClick={() => {
//                                     setComposeType('admin');
//                                     setSelectedAdmin(admin);
//                                     setShowComposeModal(true);
//                                 }}
//                                 className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
//                             >
//                                 <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                                     {admin.name.charAt(0)}
//                                 </div>
//                                 <div className="flex-1 text-left">
//                                     <p className="text-sm font-medium text-slate-800">{admin.name}</p>
//                                     <p className="text-xs text-slate-500">
//                                         {admin.role} • {admin.department || 'Admin'}
//                                     </p>
//                                 </div>
//                                 <a href={`mailto:${admin.email}`} className="p-1 text-slate-400 hover:text-indigo-600">
//                                     <Mail className="w-3 h-3" />
//                                 </a>
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             {/* Compose Modal */}
//             {showComposeModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
//                         <h3 className="text-lg font-semibold text-slate-800 mb-4">
//                             New Message
//                         </h3>

//                         <div className="space-y-4">
//                             {/* Recipient Type Selection */}
//                             <div className="flex gap-2 mb-2">
//                                 <button
//                                     onClick={() => setComposeType('parent')}
//                                     className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${composeType === 'parent'
//                                         ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
//                                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                         }`}
//                                 >
//                                     <Users className="w-4 h-4 inline mr-1" />
//                                     Parent
//                                 </button>
//                                 <button
//                                     onClick={() => setComposeType('admin')}
//                                     className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${composeType === 'admin'
//                                         ? 'bg-purple-100 text-purple-700 border border-purple-200'
//                                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                         }`}
//                                 >
//                                     <Building2 className="w-4 h-4 inline mr-1" />
//                                     Admin
//                                 </button>
//                                 <button
//                                     onClick={() => setComposeType('class')}
//                                     className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${composeType === 'class'
//                                         ? 'bg-green-100 text-green-700 border border-green-200'
//                                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                         }`}
//                                 >
//                                     <GraduationCap className="w-4 h-4 inline mr-1" />
//                                     Whole Class
//                                 </button>
//                             </div>

//                             {/* Recipient Selection */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Select Recipient
//                                 </label>
//                                 {composeType === 'parent' && (
//                                     <select
//                                         value={selectedParent?.id || ''}
//                                         onChange={(e) => {
//                                             const parent = parents.find(p => p.id === e.target.value);
//                                             setSelectedParent(parent || null);
//                                             setSelectedAdmin(null);
//                                             setSelectedClass('');
//                                         }}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     >
//                                         <option value="">Select a parent</option>
//                                         {parents.map(parent => (
//                                             <option key={parent.id} value={parent.id}>
//                                                 {parent.name} ({parent.studentName})
//                                             </option>
//                                         ))}
//                                     </select>
//                                 )}
//                                 {composeType === 'admin' && (
//                                     <select
//                                         value={selectedAdmin?.id || ''}
//                                         onChange={(e) => {
//                                             const admin = admins.find(a => a.id === e.target.value);
//                                             setSelectedAdmin(admin || null);
//                                             setSelectedParent(null);
//                                             setSelectedClass('');
//                                         }}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     >
//                                         <option value="">Select an admin</option>
//                                         {admins.map(admin => (
//                                             <option key={admin.id} value={admin.id}>
//                                                 {admin.name} ({admin.role})
//                                             </option>
//                                         ))}
//                                     </select>
//                                 )}
//                                 {composeType === 'class' && (
//                                     <select
//                                         value={selectedClass}
//                                         onChange={(e) => {
//                                             setSelectedClass(e.target.value);
//                                             setSelectedParent(null);
//                                             setSelectedAdmin(null);
//                                         }}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     >
//                                         <option value="">Select a class</option>
//                                         {classes.map(cls => (
//                                             <option key={cls.id} value={cls.id}>
//                                                 {cls.name} - {cls.term} {cls.academic_year}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 )}
//                             </div>

//                             {/* Subject */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Subject (Optional)
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={messageSubject}
//                                     onChange={(e) => setMessageSubject(e.target.value)}
//                                     placeholder="e.g., Upcoming Test, Absence Notice, etc."
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             {/* Message */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Message
//                                 </label>
//                                 <textarea
//                                     rows={5}
//                                     value={messageText}
//                                     onChange={(e) => setMessageText(e.target.value)}
//                                     placeholder="Type your message here..."
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             {/* Attachments */}
//                             <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:border-indigo-300 transition-colors">
//                                 <input
//                                     type="file"
//                                     multiple
//                                     className="hidden"
//                                     id="teacher-file-upload"
//                                     onChange={handleFileChange}
//                                 />
//                                 <label htmlFor="teacher-file-upload" className="cursor-pointer">
//                                     <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-1" />
//                                     <p className="text-xs text-slate-500">Click to attach files (optional)</p>
//                                 </label>
//                                 {attachments.length > 0 && (
//                                     <div className="mt-2 text-left">
//                                         <p className="text-xs font-medium text-slate-700">Selected files:</p>
//                                         {attachments.map((file, index) => (
//                                             <p key={index} className="text-xs text-slate-500">
//                                                 {file.name} ({(file.size / 1024).toFixed(1)} KB)
//                                             </p>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Actions */}
//                             <div className="flex justify-end gap-2 pt-4">
//                                 <button
//                                     onClick={resetComposeForm}
//                                     className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleSendMessage}
//                                     disabled={loading}
//                                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
//                                 >
//                                     {loading ? (
//                                         <>Sending...</>
//                                     ) : (
//                                         <>
//                                             <Send className="w-4 h-4" />
//                                             Send Message
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Announcement Modal */}
//             {showAnnouncementModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
//                         <h3 className="text-lg font-semibold text-slate-800 mb-4">
//                             Create Announcement
//                         </h3>

//                         <div className="space-y-4">
//                             {/* Announcement Type */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Announcement Type
//                                 </label>
//                                 <select
//                                     value={announcementType}
//                                     onChange={(e) => setAnnouncementType(e.target.value as any)}
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 >
//                                     <option value="general">General</option>
//                                     <option value="academic">Academic</option>
//                                     <option value="event">Event</option>
//                                     <option value="emergency">Emergency</option>
//                                 </select>
//                             </div>

//                             {/* Audience */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Audience
//                                 </label>
//                                 <select
//                                     value={announcementAudience}
//                                     onChange={(e) => setAnnouncementAudience(e.target.value as any)}
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 >
//                                     <option value="all">Everyone</option>
//                                     <option value="parents">Parents Only</option>
//                                     <option value="staff">Staff Only</option>
//                                     <option value="admin">Admin Only</option>
//                                 </select>
//                             </div>

//                             {/* Title */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Title
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={announcementTitle}
//                                     onChange={(e) => setAnnouncementTitle(e.target.value)}
//                                     placeholder="Announcement title"
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             {/* Content */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Content
//                                 </label>
//                                 <textarea
//                                     rows={5}
//                                     value={announcementContent}
//                                     onChange={(e) => setAnnouncementContent(e.target.value)}
//                                     placeholder="Announcement details..."
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             {/* Options */}
//                             <div className="space-y-2">
//                                 <label className="flex items-center gap-2">
//                                     <input
//                                         type="checkbox"
//                                         checked={pinAnnouncement}
//                                         onChange={(e) => setPinAnnouncement(e.target.checked)}
//                                         className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                                     />
//                                     <span className="text-sm text-slate-700">Pin this announcement</span>
//                                 </label>

//                                 <label className="flex items-center gap-2">
//                                     <input
//                                         type="checkbox"
//                                         checked={scheduleAnnouncement}
//                                         onChange={(e) => setScheduleAnnouncement(e.target.checked)}
//                                         className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                                     />
//                                     <span className="text-sm text-slate-700">Schedule for later</span>
//                                 </label>

//                                 {scheduleAnnouncement && (
//                                     <input
//                                         type="datetime-local"
//                                         value={scheduledDate}
//                                         onChange={(e) => setScheduledDate(e.target.value)}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     />
//                                 )}

//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">
//                                         Expiry Date (Optional)
//                                     </label>
//                                     <input
//                                         type="datetime-local"
//                                         value={expiryDate}
//                                         onChange={(e) => setExpiryDate(e.target.value)}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Actions */}
//                             <div className="flex justify-end gap-2 pt-4">
//                                 <button
//                                     onClick={resetAnnouncementForm}
//                                     className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleCreateAnnouncement}
//                                     disabled={loading}
//                                     className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
//                                 >
//                                     {loading ? (
//                                         <>Creating...</>
//                                     ) : (
//                                         <>
//                                             <Megaphone className="w-4 h-4" />
//                                             Create Announcement
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TeacherMessages;


// import React, { useState, useEffect } from 'react';
// import {
//     MessageSquare,
//     Send,
//     Users,
//     Phone,
//     Mail,
//     Search,
//     Paperclip,
//     Image,
//     FileText,
//     CheckCircle,
//     XCircle,
//     Inbox,
//     SendHorizonal,
//     Star,
//     Trash2,
//     Clock,
//     User,
//     GraduationCap
// } from 'lucide-react';
// import {
//     fetchParents,
//     fetchInbox,
//     fetchSentMessages,
//     sendMessage,
//     markMessageAsRead,
//     getMessageStats,
//     deleteMessage,
//     Parent,
//     Message
// } from '@/services/teacherMessageService';

// interface Student {
//     id: string;
//     name: string;
//     examNumber: string;
//     class?: {
//         id: string;
//         name: string;
//     };
// }

// interface Class {
//     id: string;
//     name: string;
//     term: string;
//     academic_year: string;
// }

// interface Subject {
//     id: string;
//     name: string;
// }

// interface Props {
//     classes: Class[];
//     students: Student[];
//     subjects: Subject[];
//     teacherId: string;
//     teacherName: string;
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const TeacherMessages: React.FC<Props> = ({
//     classes,
//     students,
//     subjects,
//     teacherId,
//     teacherName,
//     showMessage
// }) => {
//     const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent'>('inbox');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
//     const [messageText, setMessageText] = useState('');
//     const [messageSubject, setMessageSubject] = useState('');
//     const [showComposeModal, setShowComposeModal] = useState(false);
//     const [selectedClass, setSelectedClass] = useState<string>('');
//     const [loading, setLoading] = useState(false);
//     const [loadingData, setLoadingData] = useState(false);

//     // Real data states
//     const [parents, setParents] = useState<Parent[]>([]);
//     const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
//     const [sentMessages, setSentMessages] = useState<Message[]>([]);
//     const [stats, setStats] = useState({ unread: 0, totalParents: 0, messagesSent: 0 });
//     const [attachments, setAttachments] = useState<File[]>([]);

//     // Load data on mount
//     useEffect(() => {
//         loadMessageData();
//     }, [teacherId]);

//     const loadMessageData = async () => {
//         setLoadingData(true);
//         try {
//             const [parentsData, inboxData, sentData, statsData] = await Promise.all([
//                 fetchParents(teacherId),
//                 fetchInbox(teacherId),
//                 fetchSentMessages(teacherId),
//                 getMessageStats(teacherId)
//             ]);

//             setParents(parentsData);
//             setInboxMessages(inboxData);
//             setSentMessages(sentData);
//             setStats(statsData);
//         } catch (error) {
//             showMessage('Failed to load messages', true);
//         } finally {
//             setLoadingData(false);
//         }
//     };

//     const handleSendMessage = async () => {
//         if (!messageText.trim()) {
//             showMessage('Please enter a message', true);
//             return;
//         }

//         if (!selectedParent && !selectedClass) {
//             showMessage('Please select a recipient', true);
//             return;
//         }

//         setLoading(true);
//         try {
//             const messageData: any = {
//                 teacherId,
//                 content: messageText,
//                 subject: messageSubject || undefined
//             };

//             if (selectedClass) {
//                 messageData.classId = selectedClass;
//             } else if (selectedParent) {
//                 messageData.recipientIds = [selectedParent.id];
//             }

//             if (attachments.length > 0) {
//                 messageData.attachments = attachments;
//             }

//             await sendMessage(messageData);

//             showMessage('Message sent successfully');
//             setMessageText('');
//             setMessageSubject('');
//             setSelectedParent(null);
//             setSelectedClass('');
//             setAttachments([]);
//             setShowComposeModal(false);

//             // Refresh data
//             loadMessageData();
//         } catch (error: any) {
//             showMessage(error.message || 'Failed to send message', true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const markAsRead = async (messageId: string) => {
//         try {
//             await markMessageAsRead(messageId);
//             // Update local state
//             setInboxMessages(prev =>
//                 prev.map(msg =>
//                     msg.id === messageId ? { ...msg, read: true } : msg
//                 )
//             );
//             // Update stats
//             setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
//         } catch (error) {
//             console.error('Failed to mark as read:', error);
//         }
//     };

//     const handleDeleteMessage = async (messageId: string) => {
//         if (!confirm('Delete this message?')) return;

//         try {
//             await deleteMessage(messageId);
//             // Remove from current folder
//             if (activeFolder === 'inbox') {
//                 setInboxMessages(prev => prev.filter(msg => msg.id !== messageId));
//             } else {
//                 setSentMessages(prev => prev.filter(msg => msg.id !== messageId));
//             }
//             showMessage('Message deleted');
//         } catch (error: any) {
//             showMessage(error.message || 'Failed to delete message', true);
//         }
//     };

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files) {
//             setAttachments(Array.from(e.target.files));
//         }
//     };

//     const getTimeAgo = (timestamp: string) => {
//         const date = new Date(timestamp);
//         const now = new Date();
//         const diff = now.getTime() - date.getTime();
//         const hours = Math.floor(diff / (1000 * 60 * 60));

//         if (hours < 1) return 'Just now';
//         if (hours < 24) return `${hours}h ago`;
//         return date.toLocaleDateString();
//     };

//     const filteredParents = parents.filter(parent =>
//         parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         parent.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         parent.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const currentMessages = activeFolder === 'inbox' ? inboxMessages : sentMessages;

//     const filteredMessages = currentMessages.filter(msg =>
//         msg.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         msg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         msg.content.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">Parent Messages</h2>
//                     <p className="text-slate-500">Communicate with parents about their children</p>
//                 </div>
//                 <button
//                     onClick={() => setShowComposeModal(true)}
//                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
//                 >
//                     <MessageSquare className="w-4 h-4" />
//                     New Message
//                 </button>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-blue-100 rounded-lg">
//                             <Inbox className="w-5 h-5 text-blue-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Unread Messages</p>
//                             <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-green-100 rounded-lg">
//                             <Users className="w-5 h-5 text-green-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Active Parents</p>
//                             <p className="text-2xl font-bold text-green-600">{stats.totalParents}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-purple-100 rounded-lg">
//                             <SendHorizonal className="w-5 h-5 text-purple-600" />
//                         </div>
//                         <div>
//                             <p className="text-sm text-slate-500">Messages Sent</p>
//                             <p className="text-2xl font-bold text-purple-600">{stats.messagesSent}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                 {/* Tabs */}
//                 <div className="flex border-b border-slate-200">
//                     <button
//                         onClick={() => setActiveFolder('inbox')}
//                         className={`px-6 py-3 text-sm font-medium transition-colors ${activeFolder === 'inbox'
//                             ? 'text-indigo-600 border-b-2 border-indigo-600'
//                             : 'text-slate-600 hover:text-slate-800'
//                             }`}
//                     >
//                         <Inbox className="w-4 h-4 inline mr-2" />
//                         Inbox
//                     </button>
//                     <button
//                         onClick={() => setActiveFolder('sent')}
//                         className={`px-6 py-3 text-sm font-medium transition-colors ${activeFolder === 'sent'
//                             ? 'text-indigo-600 border-b-2 border-indigo-600'
//                             : 'text-slate-600 hover:text-slate-800'
//                             }`}
//                     >
//                         <SendHorizonal className="w-4 h-4 inline mr-2" />
//                         Sent
//                     </button>
//                 </div>

//                 {/* Search */}
//                 <div className="p-4 border-b border-slate-200">
//                     <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                         <input
//                             type="text"
//                             placeholder="Search messages by parent or student name..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                         />
//                     </div>
//                 </div>

//                 {/* Message List */}
//                 <div className="divide-y divide-slate-100">
//                     {loadingData ? (
//                         <div className="p-8 text-center text-slate-500">Loading messages...</div>
//                     ) : filteredMessages.length === 0 ? (
//                         <div className="p-8 text-center text-slate-500">No messages found</div>
//                     ) : (
//                         filteredMessages.map(message => (
//                             <div
//                                 key={message.id}
//                                 className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!message.read && activeFolder === 'inbox' ? 'bg-indigo-50/50' : ''
//                                     }`}
//                                 onClick={() => activeFolder === 'inbox' && !message.read && markAsRead(message.id)}
//                             >
//                                 <div className="flex items-start gap-3">
//                                     <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
//                                         {message.parentName.charAt(0)}
//                                     </div>
//                                     <div className="flex-1 min-w-0">
//                                         <div className="flex justify-between items-start">
//                                             <div>
//                                                 <h4 className="font-medium text-slate-800">
//                                                     {message.parentName}
//                                                 </h4>
//                                                 <p className="text-xs text-indigo-600 mt-0.5">
//                                                     Student: {message.studentName} • {message.studentClass}
//                                                 </p>
//                                             </div>
//                                             <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
//                                                 {getTimeAgo(message.timestamp)}
//                                             </span>
//                                         </div>
//                                         {message.subject && (
//                                             <p className="text-sm font-medium text-slate-700 mt-1">
//                                                 Subject: {message.subject}
//                                             </p>
//                                         )}
//                                         <p className="text-sm text-slate-600 mt-1 line-clamp-2">
//                                             {message.content}
//                                         </p>
//                                         {message.attachments && message.attachments.length > 0 && (
//                                             <div className="flex items-center gap-2 mt-2">
//                                                 <FileText className="w-3 h-3 text-slate-400" />
//                                                 <span className="text-xs text-slate-500">
//                                                     {message.attachments[0].name} ({message.attachments[0].size})
//                                                     {message.attachments.length > 1 && ` +${message.attachments.length - 1} more`}
//                                                 </span>
//                                             </div>
//                                         )}
//                                         {!message.read && activeFolder === 'inbox' && (
//                                             <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
//                                                 New
//                                             </span>
//                                         )}
//                                     </div>
//                                     <button
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             handleDeleteMessage(message.id);
//                                         }}
//                                         className="p-1 text-slate-400 hover:text-red-600 rounded"
//                                     >
//                                         <Trash2 className="w-4 h-4" />
//                                     </button>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>

//             {/* Quick Parent List */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//                 <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                     <Users className="w-4 h-4 text-indigo-600" />
//                     Quick Message to Parents
//                 </h3>
//                 <div className="space-y-2 max-h-60 overflow-y-auto">
//                     {filteredParents.map(parent => (
//                         <button
//                             key={parent.id}
//                             onClick={() => {
//                                 setSelectedParent(parent);
//                                 setShowComposeModal(true);
//                             }}
//                             className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
//                         >
//                             <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                                 {parent.name.charAt(0)}
//                             </div>
//                             <div className="flex-1 text-left">
//                                 <p className="text-sm font-medium text-slate-800">{parent.name}</p>
//                                 <p className="text-xs text-slate-500">
//                                     {parent.studentName} • {parent.studentClass}
//                                 </p>
//                             </div>
//                             <div className="flex gap-1">
//                                 {parent.email && (
//                                     <a href={`mailto:${parent.email}`} className="p-1 text-slate-400 hover:text-indigo-600">
//                                         <Mail className="w-3 h-3" />
//                                     </a>
//                                 )}
//                                 {parent.phone && (
//                                     <a href={`tel:${parent.phone}`} className="p-1 text-slate-400 hover:text-green-600">
//                                         <Phone className="w-3 h-3" />
//                                     </a>
//                                 )}
//                             </div>
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Compose Modal */}
//             {showComposeModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
//                         <h3 className="text-lg font-semibold text-slate-800 mb-4">
//                             New Message
//                         </h3>

//                         <div className="space-y-4">
//                             {/* Recipient Selection */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Send To
//                                 </label>
//                                 <select
//                                     value={selectedClass || selectedParent?.id || ''}
//                                     onChange={(e) => {
//                                         const value = e.target.value;
//                                         if (value.startsWith('class-')) {
//                                             setSelectedClass(value.replace('class-', ''));
//                                             setSelectedParent(null);
//                                         } else {
//                                             const parent = parents.find(p => p.id === value);
//                                             setSelectedParent(parent || null);
//                                             setSelectedClass('');
//                                         }
//                                     }}
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 >
//                                     <option value="">Select recipient</option>
//                                     <optgroup label="Whole Classes">
//                                         {classes.map(cls => (
//                                             <option key={cls.id} value={`class-${cls.id}`}>
//                                                 All Parents - {cls.name}
//                                             </option>
//                                         ))}
//                                     </optgroup>
//                                     <optgroup label="Individual Parents">
//                                         {parents.map(parent => (
//                                             <option key={parent.id} value={parent.id}>
//                                                 {parent.name} ({parent.studentName})
//                                             </option>
//                                         ))}
//                                     </optgroup>
//                                 </select>
//                             </div>

//                             {/* Subject */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Subject (Optional)
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={messageSubject}
//                                     onChange={(e) => setMessageSubject(e.target.value)}
//                                     placeholder="e.g., Upcoming Test, Absence Notice, etc."
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             {/* Message */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                                     Message
//                                 </label>
//                                 <textarea
//                                     rows={5}
//                                     value={messageText}
//                                     onChange={(e) => setMessageText(e.target.value)}
//                                     placeholder="Type your message here..."
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             {/* Attachments */}
//                             <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:border-indigo-300 transition-colors">
//                                 <input
//                                     type="file"
//                                     multiple
//                                     className="hidden"
//                                     id="teacher-file-upload"
//                                     onChange={handleFileChange}
//                                 />
//                                 <label htmlFor="teacher-file-upload" className="cursor-pointer">
//                                     <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-1" />
//                                     <p className="text-xs text-slate-500">Click to attach files (optional)</p>
//                                 </label>
//                                 {attachments.length > 0 && (
//                                     <div className="mt-2 text-left">
//                                         <p className="text-xs font-medium text-slate-700">Selected files:</p>
//                                         {attachments.map((file, index) => (
//                                             <p key={index} className="text-xs text-slate-500">
//                                                 {file.name} ({(file.size / 1024).toFixed(1)} KB)
//                                             </p>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Actions */}
//                             <div className="flex justify-end gap-2 pt-4">
//                                 <button
//                                     onClick={() => {
//                                         setShowComposeModal(false);
//                                         setSelectedParent(null);
//                                         setSelectedClass('');
//                                         setMessageText('');
//                                         setMessageSubject('');
//                                         setAttachments([]);
//                                     }}
//                                     className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleSendMessage}
//                                     disabled={loading}
//                                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
//                                 >
//                                     {loading ? (
//                                         <>Sending...</>
//                                     ) : (
//                                         <>
//                                             <Send className="w-4 h-4" />
//                                             Send Message
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TeacherMessages;