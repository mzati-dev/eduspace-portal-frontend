import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Phone, Mail, Search, Trash2, Clock, Building2 } from 'lucide-react';
import {
    getConversations,
    getConversationMessages,
    sendMessage,
    getWhatsAppLink,
    Conversation as ApiConversation,
    Message as ApiMessage
} from '@/services/messageService';

interface TeacherMessagesProps {
    teachers?: any[];
    parents: any[];
    currentTeacherId: string;
    currentTeacherName: string;
}

const TeacherMessages: React.FC<TeacherMessagesProps> = ({ parents, currentTeacherId, currentTeacherName }) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');
    const [messageSubject, setMessageSubject] = useState('');
    const [messageType, setMessageType] = useState<'email' | 'whatsapp'>('email');
    const [searchTerm, setSearchTerm] = useState('');
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [composeType, setComposeType] = useState<'parent' | 'admin'>('parent');
    const [selectedParent, setSelectedParent] = useState<any>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const getRecipientName = (recipientId: string, recipientRole: string): string => {
        if (recipientRole === 'parent') {
            const parent = parents.find(p => p.id === recipientId);
            return parent ? parent.name : 'Unknown Parent';
        } else if (recipientRole === 'admin') {
            return 'School Admin';
        }
        return 'Unknown';
    };

    const getStudentName = (parentId: string): string => {
        const parent = parents.find(p => p.id === parentId);
        return parent?.studentName || '';
    };

    const getStudentClass = (parentId: string): string => {
        const parent = parents.find(p => p.id === parentId);
        return parent?.studentClass || '';
    };

    const loadConversations = async () => {
        setLoading(true);
        try {
            const apiConversations = await getConversations();

            const localConvs = apiConversations.map((conv: ApiConversation) => {
                const isParticipantOne = conv.participantOneId === currentTeacherId;
                const recipientId = isParticipantOne ? conv.participantTwoId : conv.participantOneId;
                const recipientRole = isParticipantOne ? conv.participantTwoRole : conv.participantOneRole;
                const unreadCount = isParticipantOne ? conv.unreadCountP1 : conv.unreadCountP2;

                return {
                    id: conv.id,
                    recipientId: recipientId,
                    recipientRole: recipientRole,
                    recipientName: getRecipientName(recipientId, recipientRole),
                    recipientType: recipientRole === 'parent' ? 'parent' : 'admin',
                    studentName: recipientRole === 'parent' ? getStudentName(recipientId) : undefined,
                    studentClass: recipientRole === 'parent' ? getStudentClass(recipientId) : undefined,
                    recipientRoleName: recipientRole === 'admin' ? 'School Admin' : undefined,
                    lastMessage: conv.lastMessage || '',
                    lastMessageTime: conv.lastMessageAt || new Date().toISOString(),
                    unreadCount: unreadCount,
                    messages: []
                };
            });

            setConversations(localConvs);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            const apiMessages = await getConversationMessages(conversationId);
            const localMessages = apiMessages.map((msg: ApiMessage) => {
                const isTeacherSender = msg.senderId === currentTeacherId;
                return {
                    id: msg.id,
                    sender: isTeacherSender ? 'teacher' : 'recipient',
                    content: msg.content,
                    subject: msg.subject || undefined,
                    timestamp: msg.createdAt,
                    read: msg.read
                };
            });

            setConversations(prev => prev.map(conv =>
                conv.id === conversationId
                    ? { ...conv, messages: localMessages, unreadCount: 0 }
                    : conv
            ));

            if (selectedConversation && selectedConversation.id === conversationId) {
                setSelectedConversation(prev => ({ ...prev, messages: localMessages, unreadCount: 0 }));
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSelectConversation = async (conversation: any) => {
        setSelectedConversation(conversation);
        if (conversation.messages.length === 0) {
            await loadMessages(conversation.id);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        // If sending via WhatsApp, open external link
        if (messageType === 'whatsapp') {
            try {
                const result = await getWhatsAppLink(
                    selectedConversation.recipientId,
                    selectedConversation.recipientRole,
                    newMessage
                );
                if (result.link) {
                    window.open(result.link, '_blank');
                    setNewMessage('');
                    setMessageSubject('');
                } else {
                    alert('No phone number available for WhatsApp');
                }
            } catch (error) {
                console.error('Failed to get WhatsApp link:', error);
                alert('Failed to open WhatsApp');
            }
            return;
        }

        // Send via email
        setSending(true);
        try {
            const sentMessage = await sendMessage({
                recipientId: selectedConversation.recipientId,
                recipientRole: selectedConversation.recipientRole,
                content: newMessage,
                subject: messageSubject || undefined,
                type: messageType
            });

            const newLocalMsg = {
                id: sentMessage.id,
                sender: 'teacher',
                content: sentMessage.content,
                subject: sentMessage.subject || undefined,
                timestamp: sentMessage.createdAt,
                read: true
            };

            setConversations(prev => prev.map(conv =>
                conv.id === selectedConversation.id
                    ? {
                        ...conv,
                        lastMessage: newMessage,
                        lastMessageTime: new Date().toISOString(),
                        messages: [...conv.messages, newLocalMsg]
                    }
                    : conv
            ));

            setSelectedConversation(prev => prev ? {
                ...prev,
                lastMessage: newMessage,
                lastMessageTime: new Date().toISOString(),
                messages: [...prev.messages, newLocalMsg]
            } : null);

            setNewMessage('');
            setMessageSubject('');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleStartNewConversation = async () => {
        const recipient = selectedParent || selectedAdmin;
        const recipientRole = selectedParent ? 'parent' : 'admin';

        if (!recipient) {
            alert('Please select a recipient');
            return;
        }
        if (!newMessage.trim()) {
            alert('Please enter a message');
            return;
        }

        // If WhatsApp, open link
        if (messageType === 'whatsapp') {
            try {
                const result = await getWhatsAppLink(
                    recipient.id,
                    recipientRole,
                    newMessage
                );
                if (result.link) {
                    window.open(result.link, '_blank');
                    setShowComposeModal(false);
                    setNewMessage('');
                    setMessageSubject('');
                    setSelectedParent(null);
                    setSelectedAdmin(null);
                } else {
                    alert('No phone number available for WhatsApp');
                }
            } catch (error) {
                console.error('Failed to get WhatsApp link:', error);
                alert('Failed to open WhatsApp');
            }
            return;
        }

        // Send via email
        try {
            await sendMessage({
                recipientId: recipient.id,
                recipientRole: recipientRole,
                content: newMessage,
                subject: messageSubject || undefined,
                type: messageType
            });

            setShowComposeModal(false);
            setNewMessage('');
            setMessageSubject('');
            setSelectedParent(null);
            setSelectedAdmin(null);
            await loadConversations();
        } catch (error) {
            console.error('Failed to start conversation:', error);
            alert('Failed to send message');
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (msgDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
    };

    const filteredConversations = conversations.filter(conv =>
        conv.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.studentName && conv.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-slate-500 mt-2">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    Messages
                </h2>
                <p className="text-slate-500 mt-1">Chat with parents and school administrators</p>
            </div>

            <div className="flex h-[600px]">
                {/* Conversations List */}
                <div className="w-1/3 border-r border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-200">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowComposeModal(true)}
                            className="w-full mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            New Message
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No conversations</div>
                        ) : (
                            filteredConversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-indigo-50' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${conv.recipientType === 'parent' ? 'bg-green-600' : 'bg-purple-600'
                                                }`}>
                                                {conv.recipientName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">
                                                    {conv.recipientName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {conv.recipientType === 'parent'
                                                        ? `👨‍👩‍👧 Parent of ${conv.studentName}`
                                                        : `👔 ${conv.recipientRoleName}`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {formatTime(conv.lastMessageTime)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 truncate pl-10">
                                        {conv.lastMessage || 'No messages yet'}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <div className="mt-1 pl-10">
                                            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                {conv.unreadCount} new
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${selectedConversation.recipientType === 'parent' ? 'bg-green-600' : 'bg-purple-600'
                                        }`}>
                                        {selectedConversation.recipientName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">
                                            {selectedConversation.recipientName}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {selectedConversation.recipientType === 'parent'
                                                ? `Parent of ${selectedConversation.studentName} • ${selectedConversation.studentClass}`
                                                : `${selectedConversation.recipientRoleName}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {selectedConversation.messages.length === 0 ? (
                                    <div className="text-center text-slate-400 py-8">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    selectedConversation.messages.map((msg: any) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender === 'teacher' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] rounded-lg p-3 ${msg.sender === 'teacher'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {msg.subject && (
                                                    <p className={`text-xs font-medium mb-1 ${msg.sender === 'teacher' ? 'text-indigo-200' : 'text-indigo-600'
                                                        }`}>
                                                        Subject: {msg.subject}
                                                    </p>
                                                )}
                                                <p className="text-sm">{msg.content}</p>
                                                <div className={`flex items-center gap-2 mt-1 text-xs ${msg.sender === 'teacher' ? 'text-indigo-200' : 'text-slate-400'
                                                    }`}>
                                                    <span>{formatTime(msg.timestamp)}</span>
                                                    {msg.read && msg.sender === 'recipient' && (
                                                        <span>✓ Read</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-200">
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    <button
                                        onClick={() => setMessageType('email')}
                                        className={`px-3 py-1 text-sm rounded-lg ${messageType === 'email' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        📧 Email
                                    </button>
                                    <button
                                        onClick={() => setMessageType('whatsapp')}
                                        className={`px-3 py-1 text-sm rounded-lg ${messageType === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        💬 WhatsApp
                                    </button>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Subject (optional)"
                                        value={messageSubject}
                                        onChange={(e) => setMessageSubject(e.target.value)}
                                        className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                        placeholder="Type your message..."
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                        rows={2}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() || sending}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            <div className="text-center">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                                <p>Select a conversation or start a new message</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Modal - Updated with message content and delivery method */}
            {showComposeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">New Message</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Send To</label>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setComposeType('parent');
                                            setSelectedParent(null);
                                            setSelectedAdmin(null);
                                        }}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${composeType === 'parent'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        <Users className="w-4 h-4 inline mr-1" />
                                        Parent
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setComposeType('admin');
                                            setSelectedParent(null);
                                            setSelectedAdmin(null);
                                        }}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${composeType === 'admin'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        <Building2 className="w-4 h-4 inline mr-1" />
                                        Admin
                                    </button>
                                </div>
                            </div>

                            {composeType === 'parent' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Parent</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        onChange={(e) => {
                                            const parent = parents.find(p => p.id === e.target.value);
                                            setSelectedParent(parent);
                                        }}
                                    >
                                        <option value="">Select a parent...</option>
                                        {parents.map((parent: any) => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name} ({parent.studentName} - {parent.studentClass})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {composeType === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Admin</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        onChange={(e) => {
                                            const admin = { id: e.target.value, name: e.target.options[e.target.selectedIndex].text, role: 'Admin' };
                                            setSelectedAdmin(admin);
                                        }}
                                    >
                                        <option value="">Select an admin...</option>
                                        <option value="admin1">School Admin</option>
                                    </select>
                                </div>
                            )}

                            {/* Message Content */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    rows={3}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Type your message..."
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Subject (Optional)</label>
                                <input
                                    type="text"
                                    value={messageSubject}
                                    onChange={(e) => setMessageSubject(e.target.value)}
                                    placeholder="e.g., Homework, Meeting, etc."
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Delivery Method */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Send Via</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMessageType('email')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${messageType === 'email'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        📧 Email
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMessageType('whatsapp')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${messageType === 'whatsapp'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        💬 WhatsApp
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowComposeModal(false);
                                        setSelectedParent(null);
                                        setSelectedAdmin(null);
                                        setNewMessage('');
                                        setMessageSubject('');
                                    }}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartNewConversation}
                                    disabled={(!selectedParent && !selectedAdmin) || !newMessage.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    Send Message
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