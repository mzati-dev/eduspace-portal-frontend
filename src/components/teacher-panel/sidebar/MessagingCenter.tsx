import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Users,
    Phone,
    Mail,
    Search,
    Paperclip,
    Image,
    FileText,
    CheckCircle,
    XCircle,
    Inbox,
    SendHorizonal,
    Star,
    Trash2,
    Clock,
    User,
    GraduationCap
} from 'lucide-react';
import {
    fetchParents,
    fetchInbox,
    fetchSentMessages,
    sendMessage,
    markMessageAsRead,
    getMessageStats,
    deleteMessage,
    Parent,
    Message
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

interface Props {
    classes: Class[];
    students: Student[];
    subjects: Subject[];
    teacherId: string;
    teacherName: string;
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherMessages: React.FC<Props> = ({
    classes,
    students,
    subjects,
    teacherId,
    teacherName,
    showMessage
}) => {
    const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent'>('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [messageText, setMessageText] = useState('');
    const [messageSubject, setMessageSubject] = useState('');
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Real data states
    const [parents, setParents] = useState<Parent[]>([]);
    const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
    const [sentMessages, setSentMessages] = useState<Message[]>([]);
    const [stats, setStats] = useState({ unread: 0, totalParents: 0, messagesSent: 0 });
    const [attachments, setAttachments] = useState<File[]>([]);

    // Load data on mount
    useEffect(() => {
        loadMessageData();
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

    const handleSendMessage = async () => {
        if (!messageText.trim()) {
            showMessage('Please enter a message', true);
            return;
        }

        if (!selectedParent && !selectedClass) {
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
            } else if (selectedParent) {
                messageData.recipientIds = [selectedParent.id];
            }

            if (attachments.length > 0) {
                messageData.attachments = attachments;
            }

            await sendMessage(messageData);

            showMessage('Message sent successfully');
            setMessageText('');
            setMessageSubject('');
            setSelectedParent(null);
            setSelectedClass('');
            setAttachments([]);
            setShowComposeModal(false);

            // Refresh data
            loadMessageData();
        } catch (error: any) {
            showMessage(error.message || 'Failed to send message', true);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (messageId: string) => {
        try {
            await markMessageAsRead(messageId);
            // Update local state
            setInboxMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? { ...msg, read: true } : msg
                )
            );
            // Update stats
            setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Delete this message?')) return;

        try {
            await deleteMessage(messageId);
            // Remove from current folder
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

    const filteredParents = parents.filter(parent =>
        parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentMessages = activeFolder === 'inbox' ? inboxMessages : sentMessages;

    const filteredMessages = currentMessages.filter(msg =>
        msg.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Parent Messages</h2>
                    <p className="text-slate-500">Communicate with parents about their children</p>
                </div>
                <button
                    onClick={() => setShowComposeModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                >
                    <MessageSquare className="w-4 h-4" />
                    New Message
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <p className="text-sm text-slate-500">Active Parents</p>
                            <p className="text-2xl font-bold text-green-600">{stats.totalParents}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <SendHorizonal className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Messages Sent</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.messagesSent}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
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
                            placeholder="Search messages by parent or student name..."
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
                                        {message.parentName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-slate-800">
                                                    {message.parentName}
                                                </h4>
                                                <p className="text-xs text-indigo-600 mt-0.5">
                                                    Student: {message.studentName} • {message.studentClass}
                                                </p>
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
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <FileText className="w-3 h-3 text-slate-400" />
                                                <span className="text-xs text-slate-500">
                                                    {message.attachments[0].name} ({message.attachments[0].size})
                                                    {message.attachments.length > 1 && ` +${message.attachments.length - 1} more`}
                                                </span>
                                            </div>
                                        )}
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

            {/* Quick Parent List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Quick Message to Parents
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredParents.map(parent => (
                        <button
                            key={parent.id}
                            onClick={() => {
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

            {/* Compose Modal */}
            {showComposeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            New Message
                        </h3>

                        <div className="space-y-4">
                            {/* Recipient Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Send To
                                </label>
                                <select
                                    value={selectedClass || selectedParent?.id || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.startsWith('class-')) {
                                            setSelectedClass(value.replace('class-', ''));
                                            setSelectedParent(null);
                                        } else {
                                            const parent = parents.find(p => p.id === value);
                                            setSelectedParent(parent || null);
                                            setSelectedClass('');
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select recipient</option>
                                    <optgroup label="Whole Classes">
                                        {classes.map(cls => (
                                            <option key={cls.id} value={`class-${cls.id}`}>
                                                All Parents - {cls.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Individual Parents">
                                        {parents.map(parent => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name} ({parent.studentName})
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
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
                                    onClick={() => {
                                        setShowComposeModal(false);
                                        setSelectedParent(null);
                                        setSelectedClass('');
                                        setMessageText('');
                                        setMessageSubject('');
                                        setAttachments([]);
                                    }}
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
        </div>
    );
};

export default TeacherMessages;