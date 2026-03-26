import React, { useState, useEffect } from 'react';
import { Star, ToggleRight, Edit, Users, DollarSign, Calendar, Save, XCircle } from 'lucide-react';

// Mock data for testing
const mockTutorProfile = {
    id: '1',
    userId: '1',
    title: 'Mr.',
    name: 'John Doe',
    bio: 'Experienced Mathematics and Physics tutor with 5 years of teaching experience. I help students understand complex concepts easily.',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    monthlyRate: 50000,
    isAvailableForNewStudents: true,
    user: {
        id: '1',
        name: 'John Doe',
        profileImageUrl: null
    }
};

const ProfileEditor = ({ profile, onSave, onCancel }) => {
    const [title, setTitle] = useState(profile?.title || 'Mr.');
    const [name, setName] = useState(profile?.name || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [subjects, setSubjects] = useState(profile?.subjects?.join(', ') || '');
    const [monthlyRate, setMonthlyRate] = useState(profile?.monthlyRate || '');

    useEffect(() => {
        if (profile) {
            setTitle(profile.title || 'Mr.');
            setName(profile.name || '');
            setBio(profile.bio || '');
            setSubjects(profile.subjects?.join(', ') || '');
            setMonthlyRate(profile.monthlyRate || '');
        }
    }, [profile]);

    const handleSave = () => {
        if (!name || !bio || !subjects) {
            alert("Please fill in all fields.");
            return;
        }
        onSave({
            title,
            name,
            bio,
            subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
            monthlyRate: Number(monthlyRate),
        });
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
                {profile?.bio ? 'Edit Your Public Profile' : 'Create Your Public Profile'}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
                This information will be visible to students looking for a tutor.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                    <select
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option>Mr.</option>
                        <option>Mrs.</option>
                        <option>Ms.</option>
                        <option>Dr.</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-1">Description / Bio</label>
                    <textarea
                        id="bio"
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell students about your teaching style, experience, and what makes you a great tutor."
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="subjects" className="block text-sm font-medium text-slate-300 mb-1">Subjects You Teach</label>
                    <input
                        type="text"
                        id="subjects"
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder="e.g., Biology, Chemistry, Physics"
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Separate subjects with a comma.</p>
                </div>
                <div>
                    <label htmlFor="monthlyRate" className="block text-sm font-medium text-slate-300 mb-1">Your Monthly Rate (in MWK)</label>
                    <input
                        type="number"
                        id="monthlyRate"
                        value={monthlyRate}
                        onChange={(e) => setMonthlyRate(e.target.value)}
                        placeholder="e.g., 50000"
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
                <button
                    onClick={handleSave}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition flex items-center justify-center">
                    <Save className="h-4 w-4 mr-2" />
                    {profile?.bio ? 'Save Changes' : 'Create My Profile'}
                </button>
                {profile?.bio && (
                    <button
                        onClick={onCancel}
                        className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold shadow-lg transition flex items-center justify-center">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

const TeacherProfileCard = ({ tutor, onEditRequest }) => {
    const nameParts = tutor.name.split(' ');
    const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : tutor.name;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex items-center mb-4">
                    {tutor.user?.profileImageUrl ? (
                        <img
                            src={tutor.user.profileImageUrl}
                            alt={tutor.name}
                            className="h-16 w-16 rounded-full object-cover flex-shrink-0 mr-4"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-2xl font-bold flex-shrink-0 mr-4">
                            {tutor.name.split(' ').pop()?.[0] || '?'}
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-white">{`${tutor.title} ${surname}`}</h3>
                        <div className="flex items-center text-sm text-yellow-400 mt-1"></div>
                    </div>
                </div>
                <p className="text-slate-400 text-sm mb-4">{tutor.bio}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                    {tutor.subjects.map((subject) => (
                        <span key={subject} className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                            {subject}
                        </span>
                    ))}
                </div>

                {tutor.monthlyRate ? (
                    <div className="border-t border-slate-700 pt-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="font-semibold text-white">
                                <span className="h-5 w-5 text-green-400">MWK </span>{tutor.monthlyRate.toLocaleString()}
                            </span>
                            <span className="text-slate-400">
                                monthly / subject
                            </span>
                        </div>
                    </div>
                ) : null}
                <button
                    onClick={onEditRequest}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 cursor-pointer rounded-lg font-semibold shadow-lg transition flex items-center justify-center">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit My Public Profile
                </button>
            </div>
        </div>
    );
};

function TeacherTutorDashboard({ user, updateTutor }) {
    const [tutorProfile, setTutorProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API loading
        setTimeout(() => {
            setTutorProfile(mockTutorProfile);
            setIsLoading(false);
        }, 1000);
    }, [user]);

    const handleProfileSave = (formData) => {
        const updatedProfile = {
            ...tutorProfile,
            ...formData,
            user: {
                ...tutorProfile.user,
                name: formData.name
            }
        };
        setTutorProfile(updatedProfile);
        setIsEditing(false);
        if (updateTutor) {
            updateTutor(updatedProfile);
        }
        alert('Profile saved successfully!');
    };

    const handleAvailabilityToggle = () => {
        if (!tutorProfile) return;

        const updatedProfile = {
            ...tutorProfile,
            isAvailableForNewStudents: !tutorProfile.isAvailableForNewStudents
        };
        setTutorProfile(updatedProfile);
        if (updateTutor) {
            updateTutor(updatedProfile);
        }
    };

    const initialProfileDataForEditor = tutorProfile || {
        name: user?.name || '',
        title: 'Mr.',
        bio: '',
        subjects: [],
        monthlyRate: null
    };

    if (isLoading) {
        return <main className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><p>Loading Your Profile...</p></main>;
    }

    return (
        <main className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold mb-4">My Tutoring Profile (Public View)</h2>
                    <div className="flex items-center gap-4 p-2 bg-slate-800 rounded-lg">
                        <span className={`font-semibold ${tutorProfile?.isAvailableForNewStudents ? 'text-green-400' : 'text-slate-400'}`}>
                            {tutorProfile?.isAvailableForNewStudents ? 'Available for new students' : 'Not currently available'}
                        </span>
                        <button
                            onClick={handleAvailabilityToggle}
                            disabled={!tutorProfile}
                            className="cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ToggleRight className={`h-10 w-10 transition-colors ${tutorProfile?.isAvailableForNewStudents ? 'text-green-500' : 'text-slate-600 rotate-180'}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            {isEditing ? (
                                <ProfileEditor
                                    profile={initialProfileDataForEditor}
                                    onSave={handleProfileSave}
                                    onCancel={() => setIsEditing(false)}
                                />
                            ) : tutorProfile ? (
                                <TeacherProfileCard
                                    tutor={tutorProfile}
                                    onEditRequest={() => setIsEditing(true)}
                                />
                            ) : (
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center text-slate-400">
                                    {user ? 'Loading Profile...' : 'Authenticating user...'}
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-3">
                            <h3 className="text-xl font-bold">Quick Actions</h3>
                            <button className="w-full flex items-center justify-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold">
                                <Calendar className="h-5 w-5" />Set My Availability
                            </button>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold mb-4">My Stats</h3>
                            <div className="space-y-3 text-slate-400">
                                <p>Total Students: 12</p>
                                <p>Active Students: 8</p>
                                <p>Completed Sessions: 45</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default TeacherTutorDashboard;