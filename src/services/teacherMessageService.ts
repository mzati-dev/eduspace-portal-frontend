const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
});

export interface Message {
    id: string;
    parentId?: string;
    parentName?: string;
    adminId?: string;
    adminName?: string;
    adminRole?: string;
    content: string;
    subject?: string;
    timestamp: string;
    read: boolean;
    attachments?: { name: string; size: string; url?: string }[];
    studentName?: string;
    studentClass?: string;
    studentId?: string;
    recipientType: 'parent' | 'admin' | 'class';
}

export interface Parent {
    id: string;
    name: string;
    studentName: string;
    studentClass: string;
    studentId: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

export interface Admin {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    phone?: string;
    avatar?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'general' | 'academic' | 'event' | 'emergency';
    audience: 'all' | 'parents' | 'staff' | 'admin';
    scheduledDate?: string;
    expiresAt?: string;
    isPinned: boolean;
    readBy: string[];
    createdAt: string;
    createdBy: {
        id: string;
        name: string;
        role: string;
    };
}

export interface MessageStats {
    unread: number;
    totalParents: number;
    messagesSent: number;
    unreadAnnouncements?: number;
}

// Get all parents for teacher's classes
export const fetchParents = async (teacherId: string): Promise<Parent[]> => {
    const url = `${API_BASE_URL}/messages/parents?teacherId=${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch parents');
    }

    const response = await res.json();
    return response.data;
};

// Get all admins
export const fetchAdmins = async (): Promise<Admin[]> => {
    const url = `${API_BASE_URL}/messages/admins`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch admins');
    }

    const response = await res.json();
    return response.data;
};

// Get inbox messages
export const fetchInbox = async (teacherId: string): Promise<Message[]> => {
    const url = `${API_BASE_URL}/messages/inbox/${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch inbox');
    }

    const response = await res.json();
    return response.data;
};

// Get sent messages
export const fetchSentMessages = async (teacherId: string): Promise<Message[]> => {
    const url = `${API_BASE_URL}/messages/sent/${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch sent messages');
    }

    const response = await res.json();
    return response.data;
};

// Send message to parent(s) or admin(s)
export const sendMessage = async (data: {
    teacherId: string;
    recipientIds?: string[];
    classId?: string;
    recipientType?: 'parent' | 'admin' | 'class';
    subject?: string;
    content: string;
    attachments?: File[];
}): Promise<any> => {
    const formData = new FormData();
    formData.append('teacherId', data.teacherId);
    formData.append('content', data.content);
    if (data.subject) formData.append('subject', data.subject);
    if (data.classId) formData.append('classId', data.classId);
    if (data.recipientType) formData.append('recipientType', data.recipientType);

    if (data.recipientIds) {
        data.recipientIds.forEach(id => formData.append('recipientIds[]', id));
    }

    if (data.attachments) {
        data.attachments.forEach(file => {
            formData.append('attachments', file);
        });
    }

    const url = `${API_BASE_URL}/messages/send`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send message');
    }

    const response = await res.json();
    return response.data;
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messages/${messageId}/read`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to mark message as read');
    }
};

// Get message stats
export const getMessageStats = async (teacherId: string): Promise<MessageStats> => {
    const url = `${API_BASE_URL}/messages/stats/${teacherId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch stats');
    }

    const response = await res.json();
    return response.data;
};

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messages/${messageId}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete message');
    }
};

// ============= ANNOUNCEMENTS API =============

// Get all announcements
export const fetchAnnouncements = async (userId: string, userRole: string): Promise<Announcement[]> => {
    const url = `${API_BASE_URL}/messages/announcements?userId=${userId}&role=${userRole}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch announcements');
    }

    const response = await res.json();
    return response.data;
};

// Create announcement
export const createAnnouncement = async (data: {
    userId: string;
    userRole: string;
    title: string;
    content: string;
    type: 'general' | 'academic' | 'event' | 'emergency';
    audience: 'all' | 'parents' | 'staff' | 'admin';
    scheduledDate?: string;
    expiresAt?: string;
    isPinned: boolean;
    attachments?: File[];
}): Promise<any> => {
    const formData = new FormData();
    formData.append('userId', data.userId);
    formData.append('userRole', data.userRole);
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('type', data.type);
    formData.append('audience', data.audience);
    formData.append('isPinned', String(data.isPinned));

    if (data.scheduledDate) formData.append('scheduledDate', data.scheduledDate);
    if (data.expiresAt) formData.append('expiresAt', data.expiresAt);

    if (data.attachments) {
        data.attachments.forEach(file => {
            formData.append('attachments', file);
        });
    }

    const url = `${API_BASE_URL}/messages/announcements`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create announcement');
    }

    const response = await res.json();
    return response.data;
};

// Update announcement
export const updateAnnouncement = async (announcementId: string, data: {
    title?: string;
    content?: string;
    type?: 'general' | 'academic' | 'event' | 'emergency';
    audience?: 'all' | 'parents' | 'staff' | 'admin';
    scheduledDate?: string;
    expiresAt?: string;
    isPinned?: boolean;
}): Promise<any> => {
    const url = `${API_BASE_URL}/messages/announcements/${announcementId}`;

    const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update announcement');
    }

    const response = await res.json();
    return response.data;
};

// Delete announcement
export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messages/announcements/${announcementId}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete announcement');
    }
};

// Mark announcement as read
export const markAnnouncementAsRead = async (announcementId: string, userId: string): Promise<void> => {
    const url = `${API_BASE_URL}/messages/announcements/${announcementId}/read`;

    const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to mark announcement as read');
    }
};

// Get announcement stats
export const getAnnouncementStats = async (userId: string): Promise<{
    total: number;
    unread: number;
    pinned: number;
}> => {
    const url = `${API_BASE_URL}/messages/announcements/stats/${userId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch announcement stats');
    }

    const response = await res.json();
    return response.data;
};

// ============= ADMIN SPECIFIC ENDPOINTS =============

// Get messages from teachers (for admin view)
export const fetchTeacherMessages = async (adminId: string): Promise<Message[]> => {
    const url = `${API_BASE_URL}/messages/from-teachers/${adminId}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch teacher messages');
    }

    const response = await res.json();
    return response.data;
};

// Get all teachers (for admin to communicate with)
export const fetchTeachers = async (): Promise<Array<{
    id: string;
    name: string;
    email: string;
    department?: string;
    subjects?: string[];
}>> => {
    const url = `${API_BASE_URL}/users/teachers`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch teachers');
    }

    const response = await res.json();
    return response.data;
};

// Send bulk announcements to multiple classes
export const sendBulkAnnouncement = async (data: {
    userId: string;
    userRole: string;
    title: string;
    content: string;
    type: 'general' | 'academic' | 'event' | 'emergency';
    classIds: string[];
    attachments?: File[];
}): Promise<any> => {
    const formData = new FormData();
    formData.append('userId', data.userId);
    formData.append('userRole', data.userRole);
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('type', data.type);
    data.classIds.forEach(id => formData.append('classIds[]', id));

    if (data.attachments) {
        data.attachments.forEach(file => {
            formData.append('attachments', file);
        });
    }

    const url = `${API_BASE_URL}/messages/announcements/bulk`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send bulk announcement');
    }

    const response = await res.json();
    return response.data;
};

// Get communication history between teacher and admin
export const getCommunicationHistory = async (userId: string, otherUserId: string, type: 'teacher-admin' | 'admin-teacher'): Promise<Message[]> => {
    const url = `${API_BASE_URL}/messages/history/${userId}/${otherUserId}?type=${type}`;

    const res = await fetch(url, {
        headers: authHeaders()
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch communication history');
    }

    const response = await res.json();
    return response.data;
};


// const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

// const getAuthToken = () => {
//     return localStorage.getItem('token');
// };

// const authHeaders = () => ({
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${getAuthToken()}`
// });

// export interface Message {
//     id: string;
//     parentId: string;
//     parentName: string;
//     content: string;
//     subject?: string;
//     timestamp: string;
//     read: boolean;
//     attachments?: { name: string; size: string; url?: string }[];
//     studentName: string;
//     studentClass: string;
//     studentId?: string;
// }

// export interface Parent {
//     id: string;
//     name: string;
//     studentName: string;
//     studentClass: string;
//     studentId: string;
//     email?: string;
//     phone?: string;
//     avatar?: string;
// }

// export interface MessageStats {
//     unread: number;
//     totalParents: number;
//     messagesSent: number;
// }

// // Get all parents for teacher's classes
// export const fetchParents = async (teacherId: string): Promise<Parent[]> => {
//     const url = `${API_BASE_URL}/messages/parents?teacherId=${teacherId}`;

//     const res = await fetch(url, {
//         headers: authHeaders()
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to fetch parents');
//     }

//     const response = await res.json();
//     return response.data;
// };

// // Get inbox messages
// export const fetchInbox = async (teacherId: string): Promise<Message[]> => {
//     const url = `${API_BASE_URL}/messages/inbox/${teacherId}`;

//     const res = await fetch(url, {
//         headers: authHeaders()
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to fetch inbox');
//     }

//     const response = await res.json();
//     return response.data;
// };

// // Get sent messages
// export const fetchSentMessages = async (teacherId: string): Promise<Message[]> => {
//     const url = `${API_BASE_URL}/messages/sent/${teacherId}`;

//     const res = await fetch(url, {
//         headers: authHeaders()
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to fetch sent messages');
//     }

//     const response = await res.json();
//     return response.data;
// };

// // Send message to parent(s)
// export const sendMessage = async (data: {
//     teacherId: string;
//     recipientIds?: string[];  // For multiple parents
//     classId?: string;         // For whole class
//     subject?: string;
//     content: string;
//     attachments?: File[];
// }): Promise<any> => {
//     const formData = new FormData();
//     formData.append('teacherId', data.teacherId);
//     formData.append('content', data.content);
//     if (data.subject) formData.append('subject', data.subject);
//     if (data.classId) formData.append('classId', data.classId);
//     if (data.recipientIds) {
//         data.recipientIds.forEach(id => formData.append('recipientIds[]', id));
//     }

//     if (data.attachments) {
//         data.attachments.forEach(file => {
//             formData.append('attachments', file);
//         });
//     }

//     const url = `${API_BASE_URL}/messages/send`;

//     const res = await fetch(url, {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${getAuthToken()}`
//             // Don't set Content-Type with FormData
//         },
//         body: formData
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to send message');
//     }

//     const response = await res.json();
//     return response.data;
// };

// // Mark message as read
// export const markMessageAsRead = async (messageId: string): Promise<void> => {
//     const url = `${API_BASE_URL}/messages/${messageId}/read`;

//     const res = await fetch(url, {
//         method: 'PATCH',
//         headers: authHeaders()
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to mark message as read');
//     }
// };

// // Get message stats
// export const getMessageStats = async (teacherId: string): Promise<MessageStats> => {
//     const url = `${API_BASE_URL}/messages/stats/${teacherId}`;

//     const res = await fetch(url, {
//         headers: authHeaders()
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to fetch stats');
//     }

//     const response = await res.json();
//     return response.data;
// };

// // Delete message
// export const deleteMessage = async (messageId: string): Promise<void> => {
//     const url = `${API_BASE_URL}/messages/${messageId}`;

//     const res = await fetch(url, {
//         method: 'DELETE',
//         headers: authHeaders()
//     });

//     if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to delete message');
//     }
// };