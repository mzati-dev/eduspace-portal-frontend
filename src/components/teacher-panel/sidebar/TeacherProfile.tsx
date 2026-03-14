import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Users,
    Award,
    Edit2,
    Save,
    Camera,
    Lock,
    Bell,
    Globe,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    GraduationCap,
    Briefcase,
    Heart,
    FileText,
    Plus,
    Shield
} from 'lucide-react';

interface TeacherProfileData {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    religion?: string;
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';

    // Professional Info
    employeeId: string;
    designation: string;
    department: string;
    dateJoined: string;
    qualification: string;
    specialization: string;
    yearsOfExperience: number;
    previousSchool?: string;

    // Contact Info
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    alternateEmail?: string;

    // Account Settings
    username: string;
    lastLogin: string;
    twoFactorEnabled: boolean;

    // Stats
    totalClasses: number;
    totalStudents: number;
    totalSubjects: number;
    attendanceRate: number;
}

interface Props {
    teacherId: string;
    teacherName: string;
    teacherEmail?: string;
    classes?: any[];
    students?: any[];
    subjects?: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const TeacherProfile: React.FC<Props> = ({
    teacherId,
    teacherName,
    teacherEmail,
    classes = [],
    students = [],
    subjects = [],
    showMessage
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'account' | 'security'>('personal');
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Mock data - In production, fetch from API
    const [profile, setProfile] = useState<TeacherProfileData>({
        id: teacherId,
        name: teacherName,
        email: teacherEmail || 'teacher@school.edu',
        phone: '+123 456 7890',
        address: '123 Education Street, Learning City, ED 12345',
        dateOfBirth: '1985-06-15',
        gender: 'female',
        nationality: 'American',
        religion: 'Not Specified',
        maritalStatus: 'married',

        // Professional Info
        employeeId: 'TCH-2024-001',
        designation: 'Senior Teacher',
        department: 'Mathematics Department',
        dateJoined: '2019-08-15',
        qualification: 'M.Sc. in Mathematics, B.Ed',
        specialization: 'Algebra & Calculus',
        yearsOfExperience: 8,
        previousSchool: 'City High School',

        // Contact Info
        emergencyContactName: 'John Smith',
        emergencyContactPhone: '+123 456 7891',
        emergencyContactRelation: 'Spouse',
        alternateEmail: 'personal.email@example.com',

        // Account Settings
        username: 'teacher_jane',
        lastLogin: '2024-03-18 08:30 AM',
        twoFactorEnabled: false,

        // Stats
        totalClasses: classes.length,
        totalStudents: students.length,
        totalSubjects: subjects.length,
        attendanceRate: 98
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsEditing(false);
            showMessage('Profile updated successfully');
        }, 1500);
    };

    const handleChangePassword = () => {
        showMessage('Password change functionality coming soon');
    };

    const handleEnable2FA = () => {
        setProfile({ ...profile, twoFactorEnabled: !profile.twoFactorEnabled });
        showMessage(`2FA ${!profile.twoFactorEnabled ? 'enabled' : 'disabled'}`);
    };

    const handleExportData = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showMessage('Profile data exported successfully');
        }, 1500);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
                    <p className="text-slate-500">Manage your personal information and settings</p>
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
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleExportData}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                    >
                        Export Data
                    </button>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Profile Image */}
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                            {profileImage ? (
                                <img src={profileImage} alt={profile.name} className="w-full h-full object-cover" />
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
                        <p className="text-indigo-600">{profile.designation} • {profile.department}</p>
                        <div className="flex flex-wrap gap-4 mt-2">
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                <Mail className="w-4 h-4" />
                                {profile.email}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                <Phone className="w-4 h-4" />
                                {profile.phone}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                <Briefcase className="w-4 h-4" />
                                Employee ID: {profile.employeeId}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-indigo-600">{profile.totalClasses}</p>
                            <p className="text-xs text-slate-500">Classes</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{profile.totalStudents}</p>
                            <p className="text-xs text-slate-500">Students</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{profile.totalSubjects}</p>
                            <p className="text-xs text-slate-500">Subjects</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">{profile.attendanceRate}%</p>
                            <p className="text-xs text-slate-500">Attendance</p>
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
                        onClick={() => setActiveTab('professional')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'professional'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Briefcase className="w-4 h-4 inline mr-2" />
                        Professional
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'account'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Lock className="w-4 h-4 inline mr-2" />
                        Account
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'security'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Security
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
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={profile.dateOfBirth}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                <select
                                    value={profile.gender}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                                <input
                                    type="text"
                                    value={profile.nationality}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Religion (Optional)</label>
                                <input
                                    type="text"
                                    value={profile.religion}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Marital Status</label>
                                <select
                                    value={profile.maritalStatus}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                >
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea
                                    value={profile.address}
                                    disabled={!isEditing}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="pt-6 border-t border-slate-200">
                            <h4 className="font-semibold text-slate-800 mb-4">Emergency Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
                                    <input
                                        type="text"
                                        value={profile.emergencyContactName}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                                    <input
                                        type="tel"
                                        value={profile.emergencyContactPhone}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                                    <input
                                        type="text"
                                        value={profile.emergencyContactRelation}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'professional' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                                <input
                                    type="text"
                                    value={profile.employeeId}
                                    disabled
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                                <input
                                    type="text"
                                    value={profile.designation}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    value={profile.department}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date Joined</label>
                                <input
                                    type="date"
                                    value={profile.dateJoined}
                                    disabled
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Qualification</label>
                                <input
                                    type="text"
                                    value={profile.qualification}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                                <input
                                    type="text"
                                    value={profile.specialization}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                                <input
                                    type="number"
                                    value={profile.yearsOfExperience}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Previous School</label>
                                <input
                                    type="text"
                                    value={profile.previousSchool}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                        </div>

                        {/* Certifications & Achievements */}
                        <div className="pt-6 border-t border-slate-200">
                            <h4 className="font-semibold text-slate-800 mb-4">Certifications & Achievements</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                                    <Award className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm text-slate-700">Certified Mathematics Teacher - National Board</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                    <Award className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-slate-700">Excellence in Teaching Award 2023</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                    <Award className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm text-slate-700">Completed Advanced Pedagogy Training</span>
                                </div>
                                {isEditing && (
                                    <button className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1">
                                        <Plus className="w-4 h-4" />
                                        Add Achievement
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'account' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={profile.username}
                                    disabled
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Last Login</label>
                                <input
                                    type="text"
                                    value={profile.lastLogin}
                                    disabled
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alternate Email</label>
                                <input
                                    type="email"
                                    value={profile.alternateEmail}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                />
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
                                        className="toggle-checkbox"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-slate-800">SMS Notifications</p>
                                            <p className="text-xs text-slate-500">Receive updates via SMS</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={false}
                                        disabled={!isEditing}
                                        className="toggle-checkbox"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium text-slate-800">Push Notifications</p>
                                            <p className="text-xs text-slate-500">Receive updates in browser</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled={!isEditing}
                                        className="toggle-checkbox"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Change Password */}
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-4">Change Password</h4>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter current password"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="pt-6 border-t border-slate-200">
                            <h4 className="font-semibold text-slate-800 mb-4">Two-Factor Authentication</h4>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg max-w-md">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-indigo-600" />
                                    <div>
                                        <p className="font-medium text-slate-800">2FA Status</p>
                                        <p className="text-xs text-slate-500">
                                            {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleEnable2FA}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${profile.twoFactorEnabled
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                >
                                    {profile.twoFactorEnabled ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="pt-6 border-t border-slate-200">
                            <h4 className="font-semibold text-slate-800 mb-4">Active Sessions</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-slate-800">Current Session</p>
                                            <p className="text-xs text-slate-500">Chrome on Windows • IP: 192.168.1.1</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-green-600">Active Now</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-800">Mobile App</p>
                                            <p className="text-xs text-slate-500">iPhone • Last active 2 hours ago</p>
                                        </div>
                                    </div>
                                    <button className="text-xs text-red-600 hover:text-red-700">
                                        Revoke
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Login History */}
                        <div className="pt-6 border-t border-slate-200">
                            <h4 className="font-semibold text-slate-800 mb-4">Recent Login History</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Today, 08:30 AM</span>
                                    <span className="text-slate-800">Chrome • Windows</span>
                                    <span className="text-green-600">Success</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Yesterday, 03:15 PM</span>
                                    <span className="text-slate-800">Safari • iPhone</span>
                                    <span className="text-green-600">Success</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Mar 15, 2024, 09:45 AM</span>
                                    <span className="text-slate-800">Edge • Windows</span>
                                    <span className="text-green-600">Success</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherProfile;