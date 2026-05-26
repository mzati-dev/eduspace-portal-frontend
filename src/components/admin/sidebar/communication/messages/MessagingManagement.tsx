import React, { useState } from 'react';
import { Send, UserCheck, Users, Search, MessageCircle, Mail, Phone } from 'lucide-react';

interface Conversation {
    id: string;
    recipientName: string;
    recipientType: 'teacher' | 'parent';
    recipientPhoto?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: Message[];
}

interface Message {
    id: string;
    sender: 'admin' | 'recipient';
    content: string;
    type: 'sms' | 'email';
    timestamp: string;
    read: boolean;
}

const MessagingManagement: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            id: '1',
            recipientName: 'Mr. John Banda',
            recipientType: 'teacher',
            lastMessage: 'I will submit the lesson plans tomorrow',
            lastMessageTime: '2026-05-26T09:30:00Z',
            unreadCount: 2,
            messages: [
                {
                    id: 'm1',
                    sender: 'admin',
                    content: 'Please submit your lesson plans for next week',
                    type: 'email',
                    timestamp: '2026-05-25T14:00:00Z',
                    read: true
                },
                {
                    id: 'm2',
                    sender: 'recipient',
                    content: 'I will submit the lesson plans tomorrow',
                    type: 'sms',
                    timestamp: '2026-05-26T09:30:00Z',
                    read: false
                }
            ]
        },
        {
            id: '2',
            recipientName: 'Mrs. Grace Phiri (Parent of Chisomo Phiri - Class 5A)',
            recipientType: 'parent',
            lastMessage: 'My child is sick today, will not come to school',
            lastMessageTime: '2026-05-26T07:15:00Z',
            unreadCount: 1,
            messages: [
                {
                    id: 'm3',
                    sender: 'recipient',
                    content: 'My child is sick today, will not come to school',
                    type: 'sms',
                    timestamp: '2026-05-26T07:15:00Z',
                    read: false
                }
            ]
        },
        {
            id: '3',
            recipientName: 'Mr. Peter Kwenda (Parent of Mary Kwenda - Class 3B)',
            recipientType: 'parent',
            lastMessage: 'I have paid the school fees. Receipt attached.',
            lastMessageTime: '2026-05-25T16:45:00Z',
            unreadCount: 0,
            messages: [
                {
                    id: 'm4',
                    sender: 'recipient',
                    content: 'I have paid the school fees. Receipt attached.',
                    type: 'email',
                    timestamp: '2026-05-25T16:45:00Z',
                    read: true
                },
                {
                    id: 'm5',
                    sender: 'admin',
                    content: 'Thank you. I have confirmed your payment.',
                    type: 'sms',
                    timestamp: '2026-05-25T17:30:00Z',
                    read: true
                }
            ]
        }
    ]);

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewMessage, setShowNewMessage] = useState(false);
    const [newRecipient, setNewRecipient] = useState({ type: 'teacher', id: '', name: '' });

    const filteredConversations = conversations.filter(conv =>
        conv.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const newMsg: Message = {
            id: Date.now().toString(),
            sender: 'admin',
            content: newMessage,
            type: messageType,
            timestamp: new Date().toISOString(),
            read: true
        };

        // Update conversation
        const updatedConversations = conversations.map(conv => {
            if (conv.id === selectedConversation.id) {
                return {
                    ...conv,
                    messages: [...conv.messages, newMsg],
                    lastMessage: newMessage,
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 0
                };
            }
            return conv;
        });

        setConversations(updatedConversations);

        // Update selected conversation
        setSelectedConversation({
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMsg],
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0
        });

        setNewMessage('');
    };

    const markAsRead = (conversationId: string) => {
        const updated = conversations.map(conv => {
            if (conv.id === conversationId) {
                return { ...conv, unreadCount: 0 };
            }
            return conv;
        });
        setConversations(updated);
    };

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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-600" />
                    Messages
                </h2>
                <p className="text-slate-500 mt-1">Private conversations with teachers and parents</p>
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
                            onClick={() => setShowNewMessage(true)}
                            className="w-full mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            New Message
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => {
                                    setSelectedConversation(conv);
                                    markAsRead(conv.id);
                                }}
                                className={`w-full p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-indigo-50' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${conv.recipientType === 'teacher'
                                                ? 'bg-green-600'
                                                : 'bg-purple-600'
                                            }`}>
                                            {conv.recipientName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">
                                                {conv.recipientName}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {conv.recipientType === 'teacher' ? '👩‍🏫 Teacher' : '👨‍👩‍👧 Parent'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {formatTime(conv.lastMessageTime)}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 truncate pl-10">
                                    {conv.lastMessage}
                                </p>
                                {conv.unreadCount > 0 && (
                                    <div className="mt-1 pl-10">
                                        <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                                            {conv.unreadCount} new
                                        </span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${selectedConversation.recipientType === 'teacher'
                                        ? 'bg-green-600'
                                        : 'bg-purple-600'
                                    }`}>
                                    {selectedConversation.recipientName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">
                                        {selectedConversation.recipientName}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {selectedConversation.recipientType === 'teacher' ? 'Teacher' : 'Parent'}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {selectedConversation.messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] rounded-lg p-3 ${msg.sender === 'admin'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <div className={`flex items-center gap-2 mt-1 text-xs ${msg.sender === 'admin' ? 'text-indigo-200' : 'text-slate-400'
                                                }`}>
                                                <span>{msg.type === 'sms' ? '📱 SMS' : '📧 Email'}</span>
                                                <span>•</span>
                                                <span>{formatTime(msg.timestamp)}</span>
                                                {msg.read && msg.sender === 'recipient' && (
                                                    <span>✓✓ Read</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-slate-200">
                                <div className="flex gap-2 mb-2">
                                    <button
                                        onClick={() => setMessageType('sms')}
                                        className={`px-3 py-1 text-sm rounded-lg ${messageType === 'sms'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        📱 SMS
                                    </button>
                                    <button
                                        onClick={() => setMessageType('email')}
                                        className={`px-3 py-1 text-sm rounded-lg ${messageType === 'email'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        📧 Email
                                    </button>
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
                                        disabled={!newMessage.trim()}
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
                                <MessageCircle className="w-12 h-12 mx-auto mb-3" />
                                <p>Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Message Modal */}
            {showNewMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">New Message</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Send To</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={newRecipient.type}
                                    onChange={(e) => setNewRecipient({ ...newRecipient, type: e.target.value, id: '', name: '' })}
                                >
                                    <option value="teacher">Teacher</option>
                                    <option value="parent">Parent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Recipient</label>
                                <select className="w-full border rounded-lg p-2">
                                    <option value="">Select {newRecipient.type}...</option>
                                    {newRecipient.type === 'teacher' ? (
                                        <>
                                            <option>Mr. John Banda</option>
                                            <option>Mrs. Sarah Chisale</option>
                                            <option>Mr. David Mwale</option>
                                        </>
                                    ) : (
                                        <>
                                            <option>Mrs. Grace Phiri (Chisomo - Class 5A)</option>
                                            <option>Mr. Peter Kwenda (Mary - Class 3B)</option>
                                            <option>Mrs. Elizabeth Banda (Tawanda - Class 2A)</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea rows={4} className="w-full border rounded-lg p-2" placeholder="Type your message..."></textarea>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setShowNewMessage(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagingManagement;