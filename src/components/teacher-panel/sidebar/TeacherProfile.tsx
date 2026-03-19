import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Users,
    Edit2,
    Save,
    Camera,
    Bell,
    Globe,
    Clock,
    CheckCircle,
    AlertCircle,
    Briefcase,
    Heart
} from 'lucide-react';
import {
    // fetchTeacherProfile,
    updateTeacherProfile,
    uploadProfileImage,
    changePassword,
    fetchTeacherAssignments,
    fetchTeacherClasses,
    fetchTeacherSubjects
} from '@/services/teacherService';

interface TeacherProfileData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    profileImage?: string;

    // Emergency Contact
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;

    // Derived stats
    totalClasses?: number;
    totalStudents?: number;
    totalSubjects?: number;
    attendanceRate?: number;
}

interface Props {
    teacherId: string;
    teacherName: string;
    teacherEmail?: string;
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherProfile: React.FC<Props> = ({
    teacherId,
    teacherName,
    teacherEmail,
    showMessage
}) => {

    // ===== ADD THESE HELPER FUNCTIONS HERE =====
    const API_BASE_URL = 'https://eduspace-portal-backend.onrender.com';

    const getSchoolId = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.schoolId || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    });
    // ===== END ADDED FUNCTIONS =====
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'emergency' | 'account'>('personal');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profile, setProfile] = useState<TeacherProfileData>({
        id: teacherId,
        name: teacherName,
        email: teacherEmail || '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: 'other',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        totalClasses: 0,
        totalStudents: 0,
        totalSubjects: 0,
        attendanceRate: 0
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);

    // Load profile data and stats
    useEffect(() => {
        loadProfileData();
        loadTeacherStats();
    }, [teacherId]);

    // const loadProfileData = async () => {
    //     setLoading(true);
    //     try {
    //         const profileData = await fetchTeacherProfile(teacherId);
    //         setProfile(prev => ({
    //             ...prev,
    //             ...profileData
    //         }));
    //     } catch (error) {
    //         showMessage('Failed to load profile data', true);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const loadProfileData = async () => {
        setLoading(true);
        try {
            const schoolId = getSchoolId();
            const url = `${API_BASE_URL}/teachers?schoolId=${schoolId}&teacherId=${teacherId}`;

            const res = await fetch(url, {
                headers: authHeaders()
            });

            const response = await res.json();

            // ADD THIS CONSOLE LOG
            console.log('Backend response:', response);

            if (response.success && response.data) {

                // ADD THIS CONSOLE LOG
                console.log('Profile data from backend:', response.data);
                setProfile(prev => ({
                    ...prev,
                    ...response.data
                }));
            }
        } catch (error) {
            showMessage('Failed to load profile data', true);
        } finally {
            setLoading(false);
        }
    };

    const loadTeacherStats = async () => {
        try {
            const [classes, subjects, assignments] = await Promise.all([
                fetchTeacherClasses(teacherId),
                fetchTeacherSubjects(teacherId),
                fetchTeacherAssignments(teacherId)
            ]);

            // Calculate unique students count from classes
            // This is simplified - you might need a separate API for actual student count
            // const totalStudents = classes.reduce((sum: number, cls: any) =>
            //     sum + (cls.studentCount || 0), 0);

            setProfile(prev => ({
                ...prev,
                totalClasses: classes.length,
                totalSubjects: subjects.length,
                // totalStudents: totalStudents
                // attendanceRate would come from another API
            }));
        } catch (error) {
            console.error('Failed to load teacher stats:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        try {
            const imageUrl = await uploadProfileImage(teacherId, file);
            setProfile(prev => ({ ...prev, profileImage: imageUrl }));
            showMessage('Profile image updated successfully');
        } catch (error) {
            showMessage('Failed to upload profile image', true);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateTeacherProfile(teacherId, profile);
            setIsEditing(false);
            showMessage('Profile updated successfully');
        } catch (error) {
            showMessage('Failed to update profile', true);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('Passwords do not match', true);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showMessage('Password must be at least 6 characters', true);
            return;
        }

        setChangingPassword(true);
        try {
            await changePassword(teacherId, passwordData.currentPassword, passwordData.newPassword);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showMessage('Password changed successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to change password', true);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleInputChange = (field: keyof TeacherProfileData, value: any) => {
        setProfile({ ...profile, [field]: value });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
                    <p className="text-slate-500">Manage your personal information</p>
                </div>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    loadProfileData(); // Reset changes
                                }}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Profile Image */}
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                            {profileImage || profile.profileImage ? (
                                <img src={profileImage || profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                profile.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        {isEditing && (
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 shadow-sm">
                                <Camera className="w-4 h-4 text-slate-600" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-800">{profile.name}</h3>
                        <p className="text-indigo-600">Teacher</p>
                        <div className="flex flex-wrap gap-4 mt-2">
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                <Mail className="w-4 h-4" />
                                {profile.email}
                            </span>
                            {profile.phone && (
                                <span className="flex items-center gap-1 text-sm text-slate-500">
                                    <Phone className="w-4 h-4" />
                                    {profile.phone}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-indigo-600">{profile.totalClasses}</p>
                            <p className="text-xs text-slate-500">Classes</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{profile.totalSubjects}</p>
                            <p className="text-xs text-slate-500">Subjects</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{profile.totalStudents}</p>
                            <p className="text-xs text-slate-500">Students</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'personal'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <User className="w-4 h-4 inline mr-2" />
                        Personal Info
                    </button>
                    <button
                        onClick={() => setActiveTab('emergency')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'emergency'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Heart className="w-4 h-4 inline mr-2" />
                        Emergency Contact
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'account'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Account
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {activeTab === 'personal' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={profile.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Enter your phone number"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={profile.dateOfBirth || ''}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                <select
                                    value={profile.gender || 'other'}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Prefer not to say</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea
                                    value={profile.address || ''}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    disabled={!isEditing}
                                    rows={3}
                                    placeholder="Enter your address"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'emergency' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Name</label>
                                <input
                                    type="text"
                                    value={profile.emergencyContactName || ''}
                                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Full name"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Phone</label>
                                <input
                                    type="tel"
                                    value={profile.emergencyContactPhone || ''}
                                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Phone number"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                                <input
                                    type="text"
                                    value={profile.emergencyContactRelation || ''}
                                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="e.g., Spouse, Parent, Sibling"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            This information will only be used in case of emergency.
                        </p>
                    </div>
                )}

                {activeTab === 'account' && (
                    <div className="space-y-6 max-w-md">
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-4">Change Password</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        placeholder="Enter current password"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        placeholder="Enter new password (min. 6 characters)"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        placeholder="Confirm new password"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={changingPassword}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {changingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="pt-6 border-t border-slate-200">
                            <h4 className="font-semibold text-slate-800 mb-4">Notification Preferences</h4>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium text-slate-800">Email Notifications</p>
                                            <p className="text-xs text-slate-500">Receive updates via email</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled={!isEditing}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherProfile;
