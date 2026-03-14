import React, { useState } from 'react';
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

interface Parent {
    id: string;
    name: string;
    studentName: string;
    studentClass: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

interface Message {
    id: string;
    parentId: string;
    parentName: string;
    content: string;
    timestamp: string;
    read: boolean;
    attachments?: { name: string; size: string }[];
    studentName: string;
    studentClass: string;
}

interface Props {
    classes: any[];
    students: any[];
    teachers?: any[];
    teacherId: string;
    teacherName: string;
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherMessages: React.FC<Props> = ({
    classes,
    students,
    teachers,
    teacherId,
    teacherName,
    showMessage
}) => {
    const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent'>('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [messageText, setMessageText] = useState('');
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [messageSubject, setMessageSubject] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock data - In production, fetch from API
    // const mockParents: Parent[] = students.map(s => ({
    //     id: `parent-${s.id}`,
    //     name: `Parent of ${s.name}`,
    //     studentName: s.name,
    //     studentClass: s.class?.name || 'Grade 8A',
    //     email: `parent.${s.name.toLowerCase().replace(' ', '.')}@example.com`,
    //     phone: '+1234567890'
    // }));

    // const mockMessages: Message[] = [
    //     {
    //         id: '1',
    //         parentId: mockParents[0].id,
    //         parentName: mockParents[0].name,
    //         content: 'My child will be absent tomorrow due to a doctor\'s appointment.',
    //         timestamp: '2024-03-18T10:30:00',
    //         read: false,
    //         studentName: mockParents[0].studentName,
    //         studentClass: mockParents[0].studentClass
    //     },
    //     {
    //         id: '2',
    //         parentId: mockParents[1].id,
    //         parentName: mockParents[1].name,
    //         content: 'Could you please provide more details about the upcoming science project?',
    //         timestamp: '2024-03-17T14:15:00',
    //         read: true,
    //         studentName: mockParents[1].studentName,
    //         studentClass: mockParents[1].studentClass
    //     },
    //     {
    //         id: '3',
    //         parentId: mockParents[2].id,
    //         parentName: mockParents[2].name,
    //         content: 'Thank you for the feedback on the last test. We will work on improving.',
    //         timestamp: '2024-03-16T09:45:00',
    //         read: true,
    //         studentName: mockParents[2].studentName,
    //         studentClass: mockParents[2].studentClass,
    //         attachments: [{ name: 'test_results.pdf', size: '2.4 MB' }]
    //     }
    // ];

    // Mock data - In production, fetch from API
    const mockParents: Parent[] = students && students.length > 0
        ? students.map(s => ({
            id: `parent-${s.id}`,
            name: `Parent of ${s.name}`,
            studentName: s.name,
            studentClass: s.class?.name || 'Grade 8A',
            email: `parent.${s.name.toLowerCase().replace(' ', '.')}@example.com`,
            phone: '+1234567890'
        }))
        : [
            // Fallback mock data if no students
            {
                id: 'parent-1',
                name: 'Parent of John Doe',
                studentName: 'John Doe',
                studentClass: 'Grade 8A',
                email: 'parent.john@example.com',
                phone: '+1234567890'
            },
            {
                id: 'parent-2',
                name: 'Parent of Jane Smith',
                studentName: 'Jane Smith',
                studentClass: 'Grade 8A',
                email: 'parent.jane@example.com',
                phone: '+1234567891'
            }
        ];

    const mockMessages: Message[] = mockParents.length > 0 ? [
        {
            id: '1',
            parentId: mockParents[0]?.id || 'parent-1',
            parentName: mockParents[0]?.name || 'Parent of John Doe',
            content: 'My child will be absent tomorrow due to a doctor\'s appointment.',
            timestamp: '2024-03-18T10:30:00',
            read: false,
            studentName: mockParents[0]?.studentName || 'John Doe',
            studentClass: mockParents[0]?.studentClass || 'Grade 8A'
        },
        {
            id: '2',
            parentId: mockParents[1]?.id || 'parent-2',
            parentName: mockParents[1]?.name || 'Parent of Jane Smith',
            content: 'Could you please provide more details about the upcoming science project?',
            timestamp: '2024-03-17T14:15:00',
            read: true,
            studentName: mockParents[1]?.studentName || 'Jane Smith',
            studentClass: mockParents[1]?.studentClass || 'Grade 8A'
        }
    ] : [];

    const filteredParents = mockParents.filter(parent =>
        parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.studentClass.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!messageText.trim()) {
            showMessage('Please enter a message', true);
            return;
        }

        if (!selectedParent && !selectedClass) {
            showMessage('Please select a recipient', true);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            showMessage('Message sent successfully');
            setMessageText('');
            setMessageSubject('');
            setShowComposeModal(false);
            setLoading(false);
        }, 1500);
    };

    const markAsRead = (messageId: string) => {
        // In production, call API to mark as read
        console.log('Mark as read:', messageId);
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
                            <p className="text-2xl font-bold text-blue-600">3</p>
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
                            <p className="text-2xl font-bold text-green-600">{mockParents.length}</p>
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
                            <p className="text-2xl font-bold text-purple-600">24</p>
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
                    {mockMessages
                        .filter(msg =>
                            msg.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            msg.studentName.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(message => (
                            <div
                                key={message.id}
                                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!message.read ? 'bg-indigo-50/50' : ''
                                    }`}
                                onClick={() => markAsRead(message.id)}
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
                                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                                            {message.content}
                                        </p>
                                        {message.attachments && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <FileText className="w-3 h-3 text-slate-400" />
                                                <span className="text-xs text-slate-500">
                                                    {message.attachments[0].name} ({message.attachments[0].size})
                                                </span>
                                            </div>
                                        )}
                                        {!message.read && (
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                                                New
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                    <span className="p-1 text-slate-400 hover:text-indigo-600">
                                        <Mail className="w-3 h-3" />
                                    </span>
                                )}
                                {parent.phone && (
                                    <span className="p-1 text-slate-400 hover:text-green-600">
                                        <Phone className="w-3 h-3" />
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Compose Modal */}
            {showComposeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
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
                                            const parent = mockParents.find(p => p.id === value);
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
                                        {mockParents.map(parent => (
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

                            {/* Attachments (Optional) */}
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:border-indigo-300 transition-colors">
                                <input type="file" multiple className="hidden" id="teacher-file-upload" />
                                <label htmlFor="teacher-file-upload" className="cursor-pointer">
                                    <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Click to attach files (optional)</p>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    onClick={() => setShowComposeModal(false)}
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
//     CheckCircle,
//     XCircle,
//     Download,
//     Search,
//     Plus,
//     Edit2,
//     Trash2,
//     Eye,
//     Filter,
//     Clock,
//     Paperclip,
//     Image,
//     FileText,
//     Star,
//     Archive,
//     Inbox,
//     SendHorizonal
// } from 'lucide-react';

// interface Contact {
//     id: string;
//     name: string;
//     avatar?: string;
//     role: 'parent' | 'teacher' | 'student' | 'admin';
//     class?: string;
//     lastMessage?: string;
//     lastMessageTime?: string;
//     unread?: number;
//     online?: boolean;
//     email?: string;
//     phone?: string;
// }

// interface Message {
//     id: string;
//     senderId: string;
//     receiverId: string;
//     content: string;
//     timestamp: string;
//     read: boolean;
//     attachments?: {
//         name: string;
//         size: string;
//         type: string;
//         url: string;
//     }[];
// }

// interface Conversation {
//     id: string;
//     participants: Contact[];
//     messages: Message[];
//     lastMessage?: Message;
//     subject?: string;
// }

// interface Props {
//     userRole: 'admin' | 'teacher';
//     userId: string;
//     userName: string;
//     classes?: any[];
//     students?: any[];
//     teachers?: any[];
//     parents?: any[];
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const MessagingCenter: React.FC<Props> = ({
//     userRole,
//     userId,
//     userName,
//     classes = [],
//     students = [],
//     teachers = [],
//     parents = [],
//     showMessage
// }) => {
//     const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts' | 'compose'>('inbox');
//     const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
//     const [showComposeModal, setShowComposeModal] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [messageText, setMessageText] = useState('');
//     const [selectedRecipients, setSelectedRecipients] = useState<Contact[]>([]);
//     const [recipientType, setRecipientType] = useState<'individual' | 'class' | 'all'>('individual');
//     const [selectedClass, setSelectedClass] = useState<string>('');
//     const [attachments, setAttachments] = useState<File[]>([]);
//     const [loading, setLoading] = useState(false);

//     // Mock data - In production, fetch from API
//     const mockContacts: Contact[] = [
//         ...students.slice(0, 5).map(s => ({
//             id: `s-${s.id}`,
//             name: s.name,
//             role: 'student' as const,
//             class: s.class?.name,
//             lastMessage: 'When is the next test?',
//             lastMessageTime: '10:30 AM',
//             unread: 2,
//             online: Math.random() > 0.5,
//             email: `${s.name.toLowerCase().replace(' ', '.')}@student.edu`,
//         })),
//         ...teachers.slice(0, 5).map(t => ({
//             id: `t-${t.id}`,
//             name: t.name,
//             role: 'teacher' as const,
//             lastMessage: 'Please submit your lesson plans',
//             lastMessageTime: 'Yesterday',
//             online: Math.random() > 0.7,
//             email: t.email,
//         })),
//         ...Array(5).fill(null).map((_, i) => ({
//             id: `p-${i}`,
//             name: `Parent ${i + 1}`,
//             role: 'parent' as const,
//             class: `Grade ${Math.floor(Math.random() * 4 + 7)}A`,
//             lastMessage: 'My child is absent today',
//             lastMessageTime: '2 days ago',
//             unread: Math.random() > 0.7 ? 1 : 0,
//             online: Math.random() > 0.8,
//             email: `parent${i + 1}@example.com`,
//             phone: '+1234567890',
//         }))
//     ];

//     const mockConversations: Conversation[] = [
//         {
//             id: '1',
//             participants: [mockContacts[0], mockContacts[1]],
//             subject: 'Upcoming Test Discussion',
//             messages: [
//                 {
//                     id: '1',
//                     senderId: mockContacts[0].id,
//                     receiverId: mockContacts[1].id,
//                     content: 'Hi, when is the mathematics test?',
//                     timestamp: '2024-03-18T10:30:00',
//                     read: true
//                 },
//                 {
//                     id: '2',
//                     senderId: mockContacts[1].id,
//                     receiverId: mockContacts[0].id,
//                     content: 'It\'s scheduled for next Friday, March 25th.',
//                     timestamp: '2024-03-18T10:32:00',
//                     read: true
//                 },
//                 {
//                     id: '3',
//                     senderId: mockContacts[0].id,
//                     receiverId: mockContacts[1].id,
//                     content: 'What topics will be covered?',
//                     timestamp: '2024-03-18T10:33:00',
//                     read: false
//                 }
//             ]
//         },
//         {
//             id: '2',
//             participants: [mockContacts[2], mockContacts[3]],
//             messages: [
//                 {
//                     id: '4',
//                     senderId: mockContacts[2].id,
//                     receiverId: mockContacts[3].id,
//                     content: 'Please find attached the lesson plan for next week.',
//                     timestamp: '2024-03-17T14:15:00',
//                     read: true,
//                     attachments: [
//                         { name: 'lesson_plan.pdf', size: '2.4 MB', type: 'pdf', url: '#' }
//                     ]
//                 }
//             ]
//         }
//     ];

//     const filteredContacts = mockContacts.filter(contact =>
//         contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         contact.class?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const handleSendMessage = () => {
//         if (!messageText.trim() && attachments.length === 0) {
//             showMessage('Please enter a message', true);
//             return;
//         }

//         if (selectedRecipients.length === 0 && recipientType === 'individual') {
//             showMessage('Please select at least one recipient', true);
//             return;
//         }

//         setLoading(true);
//         setTimeout(() => {
//             showMessage('Message sent successfully');
//             setMessageText('');
//             setAttachments([]);
//             setSelectedRecipients([]);
//             setShowComposeModal(false);
//             setLoading(false);
//         }, 1500);
//     };

//     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files) {
//             setAttachments([...attachments, ...Array.from(e.target.files)]);
//         }
//     };

//     const removeAttachment = (index: number) => {
//         setAttachments(attachments.filter((_, i) => i !== index));
//     };

//     const getRecipientCount = () => {
//         if (recipientType === 'all') {
//             return mockContacts.length;
//         } else if (recipientType === 'class' && selectedClass) {
//             return mockContacts.filter(c => c.class === selectedClass).length;
//         }
//         return selectedRecipients.length;
//     };

//     const getRoleBadgeColor = (role: string) => {
//         switch (role) {
//             case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
//             case 'teacher': return 'bg-blue-100 text-blue-700 border-blue-200';
//             case 'parent': return 'bg-green-100 text-green-700 border-green-200';
//             case 'student': return 'bg-amber-100 text-amber-700 border-amber-200';
//             default: return 'bg-slate-100 text-slate-700 border-slate-200';
//         }
//     };

//     const formatTime = (timestamp: string) => {
//         const date = new Date(timestamp);
//         const now = new Date();
//         const diff = now.getTime() - date.getTime();
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));

//         if (days === 0) {
//             return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//         } else if (days === 1) {
//             return 'Yesterday';
//         } else if (days < 7) {
//             return date.toLocaleDateString([], { weekday: 'short' });
//         } else {
//             return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
//         }
//     };

//     return (
//         <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="flex h-full">
//                 {/* Sidebar */}
//                 <div className="w-80 border-r border-slate-200 flex flex-col">
//                     {/* Compose Button */}
//                     <div className="p-4">
//                         <button
//                             onClick={() => setShowComposeModal(true)}
//                             className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
//                         >
//                             <MessageSquare className="w-5 h-5" />
//                             New Message
//                         </button>
//                     </div>

//                     {/* Tabs */}
//                     <div className="flex border-b border-slate-200">
//                         <button
//                             onClick={() => setActiveTab('inbox')}
//                             className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'inbox'
//                                     ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                     : 'text-slate-600 hover:text-slate-800'
//                                 }`}
//                         >
//                             <Inbox className="w-4 h-4 inline mr-2" />
//                             Inbox
//                             <span className="absolute top-2 right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                                 3
//                             </span>
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('sent')}
//                             className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'sent'
//                                     ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                     : 'text-slate-600 hover:text-slate-800'
//                                 }`}
//                         >
//                             <SendHorizonal className="w-4 h-4 inline mr-2" />
//                             Sent
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('drafts')}
//                             className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'drafts'
//                                     ? 'text-indigo-600 border-b-2 border-indigo-600'
//                                     : 'text-slate-600 hover:text-slate-800'
//                                 }`}
//                         >
//                             <FileText className="w-4 h-4 inline mr-2" />
//                             Drafts
//                         </button>
//                     </div>

//                     {/* Search */}
//                     <div className="p-4 border-b border-slate-200">
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                             <input
//                                 type="text"
//                                 placeholder="Search conversations..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                             />
//                         </div>
//                     </div>

//                     {/* Conversation List */}
//                     <div className="flex-1 overflow-y-auto">
//                         {mockConversations.map(conv => {
//                             const otherParticipant = conv.participants.find(p => p.id !== userId) || conv.participants[0];
//                             const lastMessage = conv.messages[conv.messages.length - 1];
//                             const unreadCount = conv.messages.filter(m => !m.read && m.receiverId === userId).length;

//                             return (
//                                 <div
//                                     key={conv.id}
//                                     onClick={() => setSelectedConversation(conv)}
//                                     className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-indigo-50' : ''
//                                         }`}
//                                 >
//                                     <div className="flex items-start gap-3">
//                                         <div className="relative">
//                                             <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
//                                                 {otherParticipant.name.charAt(0)}
//                                             </div>
//                                             {otherParticipant.online && (
//                                                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
//                                             )}
//                                         </div>
//                                         <div className="flex-1 min-w-0">
//                                             <div className="flex justify-between items-start">
//                                                 <h4 className="font-medium text-slate-800 truncate">
//                                                     {otherParticipant.name}
//                                                 </h4>
//                                                 <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
//                                                     {formatTime(lastMessage.timestamp)}
//                                                 </span>
//                                             </div>
//                                             <p className="text-sm text-slate-500 truncate mt-0.5">
//                                                 {lastMessage.content}
//                                             </p>
//                                             <div className="flex items-center gap-2 mt-1">
//                                                 <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(otherParticipant.role)}`}>
//                                                     {otherParticipant.role}
//                                                 </span>
//                                                 {unreadCount > 0 && (
//                                                     <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
//                                                         {unreadCount} new
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* Main Content */}
//                 <div className="flex-1 flex flex-col">
//                     {selectedConversation ? (
//                         <>
//                             {/* Conversation Header */}
//                             <div className="p-4 border-b border-slate-200 flex justify-between items-center">
//                                 <div className="flex items-center gap-3">
//                                     <div className="relative">
//                                         <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
//                                             {selectedConversation.participants.find(p => p.id !== userId)?.name.charAt(0) || 'U'}
//                                         </div>
//                                         {selectedConversation.participants.find(p => p.id !== userId)?.online && (
//                                             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
//                                         )}
//                                     </div>
//                                     <div>
//                                         <h3 className="font-semibold text-slate-800">
//                                             {selectedConversation.participants.find(p => p.id !== userId)?.name}
//                                         </h3>
//                                         <p className="text-xs text-slate-500">
//                                             {selectedConversation.participants.find(p => p.id !== userId)?.role}
//                                             {selectedConversation.participants.find(p => p.id !== userId)?.class && ` • ${selectedConversation.participants.find(p => p.id !== userId)?.class}`}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="flex gap-2">
//                                     <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
//                                         <Phone className="w-4 h-4" />
//                                     </button>
//                                     <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
//                                         <Mail className="w-4 h-4" />
//                                     </button>
//                                     <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
//                                         <Archive className="w-4 h-4" />
//                                     </button>
//                                     <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
//                                         <Trash2 className="w-4 h-4" />
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Messages */}
//                             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                                 {selectedConversation.messages.map((message, index) => {
//                                     const isSender = message.senderId === userId;
//                                     const showAvatar = index === 0 ||
//                                         selectedConversation.messages[index - 1].senderId !== message.senderId;

//                                     return (
//                                         <div key={message.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
//                                             <div className={`flex gap-3 max-w-[70%] ${isSender ? 'flex-row-reverse' : ''}`}>
//                                                 {showAvatar && !isSender && (
//                                                     <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
//                                                         {selectedConversation.participants.find(p => p.id === message.senderId)?.name.charAt(0)}
//                                                     </div>
//                                                 )}
//                                                 <div>
//                                                     <div className={`rounded-lg p-3 ${isSender
//                                                             ? 'bg-indigo-600 text-white'
//                                                             : 'bg-slate-100 text-slate-800'
//                                                         }`}>
//                                                         <p className="text-sm">{message.content}</p>
//                                                         {message.attachments && message.attachments.length > 0 && (
//                                                             <div className="mt-2 space-y-2">
//                                                                 {message.attachments.map((att, i) => (
//                                                                     <div key={i} className={`flex items-center gap-2 p-2 rounded ${isSender ? 'bg-indigo-700' : 'bg-slate-200'
//                                                                         }`}>
//                                                                         <FileText className="w-4 h-4" />
//                                                                         <span className="text-xs flex-1">{att.name}</span>
//                                                                         <span className="text-xs opacity-75">{att.size}</span>
//                                                                         <Download className="w-3 h-3 cursor-pointer" />
//                                                                     </div>
//                                                                 ))}
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                     <div className={`flex items-center gap-2 mt-1 text-xs text-slate-400 ${isSender ? 'justify-end' : 'justify-start'
//                                                         }`}>
//                                                         <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
//                                                         {message.read && isSender && (
//                                                             <CheckCircle className="w-3 h-3" />
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>

//                             {/* Message Input */}
//                             <div className="p-4 border-t border-slate-200">
//                                 <div className="flex gap-2">
//                                     <input
//                                         type="text"
//                                         value={messageText}
//                                         onChange={(e) => setMessageText(e.target.value)}
//                                         placeholder="Type your message..."
//                                         className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     />
//                                     <label className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
//                                         <Paperclip className="w-5 h-5" />
//                                         <input type="file" multiple className="hidden" onChange={handleFileUpload} />
//                                     </label>
//                                     <label className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
//                                         <Image className="w-5 h-5" />
//                                         <input type="file" accept="image/*" multiple className="hidden" />
//                                     </label>
//                                     <button
//                                         onClick={handleSendMessage}
//                                         disabled={loading}
//                                         className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
//                                     >
//                                         <Send className="w-4 h-4" />
//                                         Send
//                                     </button>
//                                 </div>
//                             </div>
//                         </>
//                     ) : (
//                         <div className="h-full flex items-center justify-center">
//                             <div className="text-center">
//                                 <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                                 <h3 className="text-lg font-semibold text-slate-700 mb-2">No Conversation Selected</h3>
//                                 <p className="text-slate-500 mb-4">Choose a conversation from the list or start a new one</p>
//                                 <button
//                                     onClick={() => setShowComposeModal(true)}
//                                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-2"
//                                 >
//                                     <MessageSquare className="w-4 h-4" />
//                                     New Message
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Compose Modal */}
//             {showComposeModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="p-6 border-b border-slate-200 flex justify-between items-center">
//                             <h3 className="text-lg font-semibold text-slate-800">New Message</h3>
//                             <button
//                                 onClick={() => setShowComposeModal(false)}
//                                 className="text-slate-400 hover:text-slate-600"
//                             >
//                                 <XCircle className="w-5 h-5" />
//                             </button>
//                         </div>

//                         <div className="p-6 space-y-4">
//                             {/* Recipient Type */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-2">Send To</label>
//                                 <div className="flex gap-4">
//                                     <label className="flex items-center gap-2">
//                                         <input
//                                             type="radio"
//                                             name="recipientType"
//                                             value="individual"
//                                             checked={recipientType === 'individual'}
//                                             onChange={(e) => setRecipientType('individual')}
//                                             className="text-indigo-600"
//                                         />
//                                         <span className="text-sm">Individual</span>
//                                     </label>
//                                     <label className="flex items-center gap-2">
//                                         <input
//                                             type="radio"
//                                             name="recipientType"
//                                             value="class"
//                                             checked={recipientType === 'class'}
//                                             onChange={(e) => setRecipientType('class')}
//                                             className="text-indigo-600"
//                                         />
//                                         <span className="text-sm">Whole Class</span>
//                                     </label>
//                                     {userRole === 'admin' && (
//                                         <label className="flex items-center gap-2">
//                                             <input
//                                                 type="radio"
//                                                 name="recipientType"
//                                                 value="all"
//                                                 checked={recipientType === 'all'}
//                                                 onChange={(e) => setRecipientType('all')}
//                                                 className="text-indigo-600"
//                                             />
//                                             <span className="text-sm">All Contacts</span>
//                                         </label>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Recipient Selection */}
//                             {recipientType === 'individual' && (
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Select Recipients</label>
//                                     <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
//                                         {filteredContacts.map(contact => (
//                                             <label
//                                                 key={contact.id}
//                                                 className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
//                                             >
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={selectedRecipients.some(r => r.id === contact.id)}
//                                                     onChange={(e) => {
//                                                         if (e.target.checked) {
//                                                             setSelectedRecipients([...selectedRecipients, contact]);
//                                                         } else {
//                                                             setSelectedRecipients(selectedRecipients.filter(r => r.id !== contact.id));
//                                                         }
//                                                     }}
//                                                     className="rounded text-indigo-600"
//                                                 />
//                                                 <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                                                     {contact.name.charAt(0)}
//                                                 </div>
//                                                 <div className="flex-1">
//                                                     <p className="font-medium text-sm text-slate-800">{contact.name}</p>
//                                                     <p className="text-xs text-slate-500">
//                                                         {contact.role}
//                                                         {contact.class && ` • ${contact.class}`}
//                                                     </p>
//                                                 </div>
//                                                 <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(contact.role)}`}>
//                                                     {contact.role}
//                                                 </span>
//                                             </label>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {recipientType === 'class' && (
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Select Class</label>
//                                     <select
//                                         value={selectedClass}
//                                         onChange={(e) => setSelectedClass(e.target.value)}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     >
//                                         <option value="">Choose a class</option>
//                                         {classes.map(cls => (
//                                             <option key={cls.id} value={cls.name}>
//                                                 {cls.name} - {cls.term} ({cls.academic_year})
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             )}

//                             {/* Subject */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-2">Subject (Optional)</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Enter message subject"
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             {/* Message */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
//                                 <textarea
//                                     rows={6}
//                                     value={messageText}
//                                     onChange={(e) => setMessageText(e.target.value)}
//                                     placeholder="Type your message here..."
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             {/* Attachments */}
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-2">Attachments</label>
//                                 <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-indigo-300 transition-colors">
//                                     <input
//                                         type="file"
//                                         multiple
//                                         onChange={handleFileUpload}
//                                         className="hidden"
//                                         id="file-upload"
//                                     />
//                                     <label htmlFor="file-upload" className="cursor-pointer">
//                                         <Paperclip className="w-8 h-8 text-slate-400 mx-auto mb-2" />
//                                         <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
//                                         <p className="text-xs text-slate-400 mt-1">PDF, Images, Documents (max 10MB)</p>
//                                     </label>
//                                 </div>

//                                 {attachments.length > 0 && (
//                                     <div className="mt-3 space-y-2">
//                                         {attachments.map((file, index) => (
//                                             <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
//                                                 <div className="flex items-center gap-2">
//                                                     <FileText className="w-4 h-4 text-slate-500" />
//                                                     <span className="text-sm text-slate-700">{file.name}</span>
//                                                     <span className="text-xs text-slate-400">
//                                                         {(file.size / 1024).toFixed(1)} KB
//                                                     </span>
//                                                 </div>
//                                                 <button
//                                                     onClick={() => removeAttachment(index)}
//                                                     className="text-red-600 hover:text-red-700"
//                                                 >
//                                                     <XCircle className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Recipient Count */}
//                             <div className="bg-slate-50 p-3 rounded-lg">
//                                 <p className="text-sm text-slate-600">
//                                     <Users className="w-4 h-4 inline mr-2" />
//                                     This message will be sent to <span className="font-semibold">{getRecipientCount()}</span> recipient(s)
//                                 </p>
//                             </div>

//                             {/* Actions */}
//                             <div className="flex justify-end gap-2 pt-4">
//                                 <button
//                                     onClick={() => setShowComposeModal(false)}
//                                     className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={() => {/* Save as draft */ }}
//                                     className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
//                                 >
//                                     <FileText className="w-4 h-4" />
//                                     Save Draft
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

// export default MessagingCenter;