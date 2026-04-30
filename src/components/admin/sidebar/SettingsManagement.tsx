import React, { useState, useEffect } from 'react';
import {
    Settings,
    Save,
    RefreshCw,
    Globe,
    Bell,
    Lock,
    Users,
    BookOpen,
    Calendar,
    DollarSign,
    FileText,
    Mail,
    Phone,
    MapPin,
    Camera,
    Upload,
    Trash2,
    Plus,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    AlertCircle,
    Shield,
    Smartphone,
    Printer,
    Download,
    MessageCircle
} from 'lucide-react';
import {
    fetchSchoolProfile,
    updateSchoolProfile,
    uploadSchoolLogo,
    fetchNotificationSettings,
    updateNotificationSettings,
    fetchSecuritySettings,
    updateSecuritySettings,
    fetchAcademicSettings,
    updateAcademicSettings,
    fetchFeeSettings,
    updateFeeSettings,
    fetchBackupSettings,
    updateBackupSettings,
    fetchBackupFiles,
    createBackup,
    restoreBackup,
    downloadBackup,
    testNotificationChannel,
    restoreSettingsToDefault,
    SchoolProfile,
    NotificationSettings,
    SecuritySettings,
    AcademicSettings,
    FeeSettings,
    BackupSettings,
    BackupFile,
    fetchSubjectMaxMarks,
    updateSubjectMaxMarks,
    fetchAssessmentNames,
    updateAssessmentNames,
    updateAssessmentTypes,
    changeSchoolAdminPassword,
} from '@/services/settingsService';
// import GradeConfigManagement from './GradeConfigManagement';
import { fetchGradeConfigurations, GradeConfiguration } from '@/services/gradeConfigService';
import GradeConfigManagement from '../GradeConfigManagement';

interface Props {
    classes: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

const SettingsManagement: React.FC<Props> = ({ classes, showMessage }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'academic' | 'notifications' | 'fees' | 'security' | 'backup'>('general');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [selectedClassForMaxMarks, setSelectedClassForMaxMarks] = useState<string>('');
    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // School Profile State
    const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>({
        name: '',
        motto: '',
        address: '',
        phone: '',
        alternativePhones: [],
        email: '',
        website: '',
        established: '',
        registrationNumber: '',
        taxId: '',
        currency: '',
        timezone: '',
        language: '',
        academicYear: '',
        terms: []
    });

    // Notification Settings State
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        emailEnabled: false,
        smsEnabled: false,
        whatsappEnabled: false,
        pushEnabled: false,
        parentNotifications: {
            attendance: false,
            fees: false,
            results: false,
            events: false,
            announcements: false
        },
        teacherNotifications: {
            attendance: false,
            results: false,
            meetings: false,
            announcements: false
        },
        studentNotifications: {
            attendance: false,
            results: false,
            events: false,
            announcements: false
        },
        reminderTiming: {
            fees: 0,
            events: 0,
            meetings: 0
        }
    });

    // Security Settings State
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        twoFactorAuth: false,
        passwordPolicy: {
            minLength: 0,
            requireNumbers: false,
            requireSymbols: false,
            requireUppercase: false,
            expiryDays: 0
        },
        sessionTimeout: 0,
        ipWhitelist: [],
        allowedDomains: [],
        loginAttempts: 0,
        lockoutDuration: 0
    });

    // Academic Settings State
    const [academicSettings, setAcademicSettings] = useState<AcademicSettings>({
        gradingSystem: 'percentage',
        gradeScale: [],
        subjects: [],
        assessmentTypes: [],
        passMark: 0,
        rankCalculation: 'average',
        allowRetakes: false
    });

    // Fee Settings State
    const [feeSettings, setFeeSettings] = useState<FeeSettings>({
        currency: '',
        paymentMethods: [],
        lateFeePercentage: 0,
        gracePeriod: 0,
        discounts: [],
        installments: [],
        receiptPrefix: '',
        invoicePrefix: ''
    });

    // Backup Settings State
    const [backupSettings, setBackupSettings] = useState<BackupSettings>({
        autoBackup: false,
        frequency: 'daily',
        time: '',
        retention: 0,
        backupLocation: 'local',
        includeMedia: false
    });

    const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);

    // NEW: Assessment Names State
    const [assessmentNames, setAssessmentNames] = useState({
        firstAssessment: 'Quick Assessment 1',
        secondAssessment: 'Quick Assessment 2',
        finalAssessment: 'End of Term Examination'
    });

    // NEW: Subject Max Marks State
    const [subjectMaxMarks, setSubjectMaxMarks] = useState<{ subjectId: string; subjectName: string; maxMarks: number }[]>([]);
    const [showMaxMarksModal, setShowMaxMarksModal] = useState(false);

    // NEW: Grade Config State
    const [gradeConfigs, setGradeConfigs] = useState<GradeConfiguration[]>([]);
    const [activeConfig, setActiveConfig] = useState<GradeConfiguration | null>(null);
    const [showConfigForm, setShowConfigForm] = useState(false);
    const [editingConfig, setEditingConfig] = useState<GradeConfiguration | null>(null);
    const [configForm, setConfigForm] = useState({
        configuration_name: '',
        calculation_method: 'end_of_term_only' as 'average_all' | 'end_of_term_only' | 'weighted_average',
        weight_qa1: 0,
        weight_qa2: 0,
        weight_end_of_term: 100,
        pass_mark: 50,
    });

    // Load all settings on mount
    useEffect(() => {
        loadAllSettings();
        loadGradeConfigs();
        loadSubjectMaxMarks();
        loadAssessmentNames();
    }, []);

    // Load backup files when backup tab is active
    useEffect(() => {
        if (activeTab === 'backup') {
            loadBackupFiles();
        }
    }, [activeTab]);

    const loadAllSettings = async () => {
        setLoadingData(true);
        try {
            const [school, notifications, security, academic, fees, backup] = await Promise.all([
                fetchSchoolProfile(),
                fetchNotificationSettings(),
                fetchSecuritySettings(),
                fetchAcademicSettings(),
                fetchFeeSettings(),
                fetchBackupSettings()
            ]);

            setSchoolProfile(school);
            setNotificationSettings(notifications);
            setSecuritySettings(security);
            setAcademicSettings(academic);
            setFeeSettings(fees);
            setBackupSettings(backup);
        } catch (error) {
            showMessage('Failed to load settings', true);
        } finally {
            setLoadingData(false);
        }
    };

    const loadGradeConfigs = async () => {
        try {
            const data = await fetchGradeConfigurations();
            setGradeConfigs(data);
            const active = data.find(c => c.is_active);
            setActiveConfig(active || null);
        } catch (error) {
            console.error('Failed to load grade configs:', error);
        }
    };
    const loadSubjectMaxMarks = async (classId?: string) => {
        try {
            if (!classId) {
                setSubjectMaxMarks([]);
                return;
            }
            const data = await fetchSubjectMaxMarks(classId);
            setSubjectMaxMarks(data);
        } catch (error) {
            console.error('Failed to load subject max marks:', error);
            setSubjectMaxMarks([]);
        }
    };

    const loadAssessmentNames = async () => {
        try {
            const data = await fetchAssessmentNames();
            setAssessmentNames(data);
        } catch (error) {
            console.error('Failed to load assessment names:', error);
            // Keep default values if API fails
            setAssessmentNames({
                firstAssessment: 'Quick Assessment 1',
                secondAssessment: 'Quick Assessment 2',
                finalAssessment: 'End of Term Examination'
            });
        }
    };

    const handleSaveAssessmentTypes = async () => {
        setLoading(true);
        try {
            await updateAssessmentTypes(academicSettings.assessmentTypes);
            showMessage('Assessment types saved successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to save assessment types', true);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('Please fill in all password fields', true);
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('New passwords do not match', true);
            return;
        }

        if (newPassword.length < 6) {
            showMessage('Password must be at least 6 characters', true);
            return;
        }

        setLoading(true);
        try {
            await changeSchoolAdminPassword(currentPassword, newPassword);
            showMessage('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showMessage(error.message || 'Failed to change password', true);
        } finally {
            setLoading(false);
        }
    };
    const handleAddAlternativePhone = () => {
        setSchoolProfile({
            ...schoolProfile,
            alternativePhones: [...(schoolProfile.alternativePhones || []), '']
        });
    };

    const handleUpdateAlternativePhone = (index: number, value: string) => {
        const newPhones = [...(schoolProfile.alternativePhones || [])];
        newPhones[index] = value;
        setSchoolProfile({ ...schoolProfile, alternativePhones: newPhones });
    };

    const handleRemoveAlternativePhone = (index: number) => {
        const newPhones = (schoolProfile.alternativePhones || []).filter((_, i) => i !== index);
        setSchoolProfile({ ...schoolProfile, alternativePhones: newPhones });
    };

    const handleSaveAssessmentNames = async () => {
        setLoading(true);
        try {
            await updateAssessmentNames(assessmentNames);
            showMessage('Assessment names saved successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to save assessment names', true);
        } finally {
            setLoading(false);
        }
    };


    const handleSaveMaxMarks = async () => {
        if (!selectedClassForMaxMarks) {
            showMessage('Please select a class first', true);
            return;
        }

        setLoading(true);
        try {
            await updateSubjectMaxMarks(selectedClassForMaxMarks, subjectMaxMarks);
            showMessage(`Subject max marks saved for ${classes.find(c => c.id === selectedClassForMaxMarks)?.name}`);
            setShowMaxMarksModal(false);
        } catch (error: any) {
            showMessage(error.message || 'Failed to save subject max marks', true);
        } finally {
            setLoading(false);
        }
    };

    const loadBackupFiles = async () => {
        try {
            const files = await fetchBackupFiles();
            setBackupFiles(files);
        } catch (error) {
            showMessage('Failed to load backup files', true);
        }
    };

    const handleSaveSettings = async (section: string) => {
        setLoading(true);
        try {
            switch (section) {
                case 'general':
                    await updateSchoolProfile(schoolProfile);
                    break;
                case 'notifications':
                    await updateNotificationSettings(notificationSettings);
                    break;
                case 'security':
                    await updateSecuritySettings(securitySettings);
                    break;
                case 'academic':
                    await updateAcademicSettings(academicSettings);
                    // TODO: Save assessment names and subject max marks
                    break;
                case 'fees':
                    await updateFeeSettings(feeSettings);
                    break;
                case 'backup':
                    await updateBackupSettings(backupSettings);
                    break;
            }
            showMessage(`${section} settings saved successfully`);
        } catch (error: any) {
            showMessage(error.message || 'Failed to save settings', true);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreDefaults = async (section: string) => {
        if (!confirm(`Reset ${section} settings to default?`)) return;

        setLoading(true);
        try {
            await restoreSettingsToDefault(section);
            await loadAllSettings();
            showMessage(`${section} settings restored to defaults`);
        } catch (error: any) {
            showMessage(error.message || 'Failed to restore settings', true);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async () => {
        if (!logoFile) return;

        setLoading(true);
        try {
            const result = await uploadSchoolLogo(logoFile);
            setSchoolProfile({ ...schoolProfile, logo: result.logoUrl });
            setLogoPreview(null);
            setLogoFile(null);
            showMessage('Logo uploaded successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to upload logo', true);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackup = async () => {
        setLoading(true);
        try {
            await createBackup();
            await loadBackupFiles();
            const updatedBackup = await fetchBackupSettings();
            setBackupSettings(updatedBackup);
            showMessage('Backup completed successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to create backup', true);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreBackup = async (backupId: string) => {
        if (!confirm('Restoring will overwrite current data. Continue?')) return;

        setLoading(true);
        try {
            await restoreBackup(backupId);
            showMessage('System restored from backup');
            await loadAllSettings();
        } catch (error: any) {
            showMessage(error.message || 'Failed to restore backup', true);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadBackup = async (backupId: string, fileName: string) => {
        try {
            const blob = await downloadBackup(backupId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showMessage('Backup downloaded successfully');
        } catch (error: any) {
            showMessage(error.message || 'Failed to download backup', true);
        }
    };

    const handleTestConnection = async (type: string) => {
        setLoading(true);
        try {
            await testNotificationChannel(type.toLowerCase() as any);
            showMessage(`${type} connection test successful`);
        } catch (error: any) {
            showMessage(error.message || `Failed to test ${type} connection`, true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTerm = () => {
        setSchoolProfile({
            ...schoolProfile,
            terms: [...schoolProfile.terms, `Term ${schoolProfile.terms.length + 1}`]
        });
    };

    const handleRemoveTerm = (index: number) => {
        const newTerms = schoolProfile.terms.filter((_, i) => i !== index);
        setSchoolProfile({ ...schoolProfile, terms: newTerms });
    };

    const handleAddGradeLevel = () => {
        setAcademicSettings({
            ...academicSettings,
            gradeScale: [
                ...academicSettings.gradeScale,
                { min: 0, max: 0, grade: '', points: 0 }
            ]
        });
    };

    const handleRemoveGradeLevel = (index: number) => {
        const newScale = academicSettings.gradeScale.filter((_, i) => i !== index);
        setAcademicSettings({ ...academicSettings, gradeScale: newScale });
    };

    const handleAddDiscount = () => {
        setFeeSettings({
            ...feeSettings,
            discounts: [...feeSettings.discounts, { name: '', percentage: 0, applicableTo: ['all'] }]
        });
    };

    const handleRemoveDiscount = (index: number) => {
        const newDiscounts = feeSettings.discounts.filter((_, i) => i !== index);
        setFeeSettings({ ...feeSettings, discounts: newDiscounts });
    };

    const handleAddInstallment = () => {
        setFeeSettings({
            ...feeSettings,
            installments: [...feeSettings.installments, { name: '', percentage: 0, dueDate: '' }]
        });
    };

    const handleRemoveInstallment = (index: number) => {
        const newInstallments = feeSettings.installments.filter((_, i) => i !== index);
        setFeeSettings({ ...feeSettings, installments: newInstallments });
    };

    const handleAddIpWhitelist = () => {
        setSecuritySettings({
            ...securitySettings,
            ipWhitelist: [...securitySettings.ipWhitelist, '']
        });
    };

    const handleRemoveIpWhitelist = (index: number) => {
        const newWhitelist = securitySettings.ipWhitelist.filter((_, i) => i !== index);
        setSecuritySettings({ ...securitySettings, ipWhitelist: newWhitelist });
    };

    // Grade Config Handlers
    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleActivateConfig = async (id: string) => {
        // Handled by GradeConfigManagement
    };

    const startEditConfig = (config: GradeConfiguration) => {
        setEditingConfig(config);
        setConfigForm({
            configuration_name: config.configuration_name,
            calculation_method: config.calculation_method,
            weight_qa1: config.weight_qa1,
            weight_qa2: config.weight_qa2,
            weight_end_of_term: config.weight_end_of_term,
            pass_mark: config.pass_mark,
        });
        setShowConfigForm(true);
    };

    const handleUpdateMaxMark = (subjectId: string, maxMarks: number) => {
        setSubjectMaxMarks(prev =>
            prev.map(s => s.subjectId === subjectId ? { ...s, maxMarks } : s)
        );
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleString();
    };

    if (loadingData) {
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
                    <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                    <p className="text-slate-500">Configure your school management system</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleRestoreDefaults(activeTab)}
                        disabled={loading}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Restore Defaults
                    </button>
                    <button
                        onClick={() => handleSaveSettings(activeTab)}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Settings Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-200 overflow-x-auto">
                    <div className="flex gap-2 p-2 min-w-max">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'general'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Globe className="w-4 h-4" />
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('academic')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'academic'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            Academic
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'notifications'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Bell className="w-4 h-4" />
                            Notifications
                        </button>
                        <button
                            onClick={() => setActiveTab('fees')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'fees'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <DollarSign className="w-4 h-4" />
                            Fees
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'security'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Shield className="w-4 h-4" />
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab('backup')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'backup'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Backup
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            {/* School Profile */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">School Profile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2 flex items-center gap-6">
                                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                            ) : schoolProfile.logo ? (
                                                <img src={schoolProfile.logo} alt="School Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-8 h-8 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                                id="logo-upload"
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm cursor-pointer"
                                            >
                                                Choose Logo
                                            </label>
                                            {logoFile && (
                                                <button
                                                    onClick={handleLogoUpload}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                                                >
                                                    Upload
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setLogoPreview(null);
                                                    setLogoFile(null);
                                                }}
                                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>

                                    {/* School Name - READ ONLY */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                                        <input
                                            type="text"
                                            value={schoolProfile.name}
                                            disabled
                                            className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg cursor-not-allowed"
                                        />
                                    </div>

                                    {/* School Motto - EDITABLE */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">School Motto</label>
                                        <input
                                            type="text"
                                            value={schoolProfile.motto}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, motto: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Address - EDITABLE */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                        <textarea
                                            value={schoolProfile.address}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Phone - EDITABLE */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={schoolProfile.phone}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Main Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Main Phone</label>
                                        <input
                                            type="tel"
                                            value={schoolProfile.phone}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Main contact number"
                                        />
                                    </div>

                                    {/* Alternative Phone Numbers */}
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-slate-700">Alternative Phone Numbers</label>
                                            <button
                                                type="button"
                                                onClick={handleAddAlternativePhone}
                                                className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Phone Number
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(schoolProfile.alternativePhones || []).map((phone, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => handleUpdateAlternativePhone(index, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                        placeholder={`Alternative phone ${index + 1}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAlternativePhone(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Add additional contact numbers for the school</p>
                                    </div>

                                    {/* Email - READ ONLY */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={schoolProfile.email}
                                            disabled
                                            className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Website - EDITABLE */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                                        <input
                                            type="url"
                                            value={schoolProfile.website}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, website: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Established Year - EDITABLE */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Established Year</label>
                                        <input
                                            type="text"
                                            value={schoolProfile.established}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, established: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Registration Number - EDITABLE */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                                        <input
                                            type="text"
                                            value={schoolProfile.registrationNumber}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, registrationNumber: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Tax ID - EDITABLE */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID</label>
                                        <input
                                            type="text"
                                            value={schoolProfile.taxId}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, taxId: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Regional Settings */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Regional Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                                        <select
                                            value={schoolProfile.currency}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, currency: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select Currency</option>
                                            <option value="MWK">MWK - Malawian Kwacha</option>
                                            <option value="USD">USD - US Dollar</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                                        <select
                                            value={schoolProfile.timezone}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, timezone: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select Timezone</option>
                                            <option value="Africa/Blantyre">Malawi Time (Africa/Blantyre)</option>
                                            <option value="Africa/Nairobi">East Africa Time</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                                        <select
                                            value={schoolProfile.language}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, language: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select Language</option>
                                            <option value="en">English</option>
                                            <option value="ny">Chichewa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Year Settings */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Year</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Academic Year</label>
                                        <input
                                            type="text"
                                            value={schoolProfile.academicYear}
                                            onChange={(e) => setSchoolProfile({ ...schoolProfile, academicYear: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g., 2024/2025"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Terms</label>
                                        <div className="space-y-2">
                                            {schoolProfile.terms.map((term, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={term}
                                                        onChange={(e) => {
                                                            const newTerms = [...schoolProfile.terms];
                                                            newTerms[index] = e.target.value;
                                                            setSchoolProfile({ ...schoolProfile, terms: newTerms });
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                    <button
                                                        onClick={() => handleRemoveTerm(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={handleAddTerm}
                                                className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Term
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Change Password Section */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Change Password</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Lock className="w-4 h-4" />
                                        {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Academic Settings */}
                    {/* Academic Settings */}
                    {activeTab === 'academic' && (
                        <div className="space-y-8">
                            {/* Grade Scale */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Grade Scale</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-left px-4 py-2 text-sm font-semibold text-slate-600">Min %</th>
                                                <th className="text-left px-4 py-2 text-sm font-semibold text-slate-600">Max %</th>
                                                <th className="text-left px-4 py-2 text-sm font-semibold text-slate-600">Grade</th>
                                                <th className="text-left px-4 py-2 text-sm font-semibold text-slate-600">Points</th>
                                                <th className="text-left px-4 py-2 text-sm font-semibold text-slate-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {academicSettings.gradeScale.map((grade, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            value={grade.min}
                                                            onChange={(e) => {
                                                                const newScale = [...academicSettings.gradeScale];
                                                                newScale[index].min = parseInt(e.target.value);
                                                                setAcademicSettings({ ...academicSettings, gradeScale: newScale });
                                                            }}
                                                            className="w-20 px-2 py-1 border border-slate-300 rounded"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            value={grade.max}
                                                            onChange={(e) => {
                                                                const newScale = [...academicSettings.gradeScale];
                                                                newScale[index].max = parseInt(e.target.value);
                                                                setAcademicSettings({ ...academicSettings, gradeScale: newScale });
                                                            }}
                                                            className="w-20 px-2 py-1 border border-slate-300 rounded"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="text"
                                                            value={grade.grade}
                                                            onChange={(e) => {
                                                                const newScale = [...academicSettings.gradeScale];
                                                                newScale[index].grade = e.target.value;
                                                                setAcademicSettings({ ...academicSettings, gradeScale: newScale });
                                                            }}
                                                            className="w-16 px-2 py-1 border border-slate-300 rounded"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            value={grade.points}
                                                            onChange={(e) => {
                                                                const newScale = [...academicSettings.gradeScale];
                                                                newScale[index].points = parseFloat(e.target.value);
                                                                setAcademicSettings({ ...academicSettings, gradeScale: newScale });
                                                            }}
                                                            className="w-20 px-2 py-1 border border-slate-300 rounded"
                                                            step="0.1"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <button
                                                            onClick={() => handleRemoveGradeLevel(index)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    onClick={handleAddGradeLevel}
                                    className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Grade Level
                                </button>
                            </div>

                            {/* Assessment Types - Dynamic */}
                            <div className="pt-6 border-t border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">Assessment Types</h3>
                                        <p className="text-sm text-slate-500">Configure the number and names of assessments</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const newTypes = [...academicSettings.assessmentTypes];
                                                newTypes.push(`Assessment ${newTypes.length + 1}`);
                                                setAcademicSettings({
                                                    ...academicSettings,
                                                    assessmentTypes: newTypes
                                                });
                                            }}
                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Assessment
                                        </button>
                                        <button
                                            onClick={handleSaveAssessmentTypes}
                                            disabled={loading}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            {loading ? 'Saving...' : 'Save Types'}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">Add, remove, and name assessments as needed</p>

                                <div className="space-y-3">
                                    {academicSettings.assessmentTypes.map((type, index) => (
                                        <div key={index} className="flex gap-3 items-center p-3 border border-slate-200 rounded-lg">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={type}
                                                    onChange={(e) => {
                                                        const newTypes = [...academicSettings.assessmentTypes];
                                                        newTypes[index] = e.target.value;
                                                        setAcademicSettings({ ...academicSettings, assessmentTypes: newTypes });
                                                    }}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="e.g., Test 1, Continuous Assessment, Quarterly Exam"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newTypes = academicSettings.assessmentTypes.filter((_, i) => i !== index);
                                                    setAcademicSettings({ ...academicSettings, assessmentTypes: newTypes });
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Assessment Type Names */}
                            <div className="pt-6 border-t border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">Assessment Type Names</h3>
                                        <p className="text-sm text-slate-500">Customize the names of the three main assessments</p>
                                    </div>
                                    <button
                                        onClick={handleSaveAssessmentNames}
                                        disabled={loading}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Saving...' : 'Save Names'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">First Assessment</label>
                                        <input
                                            type="text"
                                            value={assessmentNames.firstAssessment}
                                            onChange={(e) => setAssessmentNames({ ...assessmentNames, firstAssessment: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g., Test 1, QA1, CAT 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Second Assessment</label>
                                        <input
                                            type="text"
                                            value={assessmentNames.secondAssessment}
                                            onChange={(e) => setAssessmentNames({ ...assessmentNames, secondAssessment: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g., Test 2, QA2, CAT 2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Final Assessment</label>
                                        <input
                                            type="text"
                                            value={assessmentNames.finalAssessment}
                                            onChange={(e) => setAssessmentNames({ ...assessmentNames, finalAssessment: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g., End of Term, Quarterly Exam"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Subject Maximum Marks */}
                            <div className="pt-6 border-t border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">Subject Maximum Marks</h3>
                                        <p className="text-sm text-slate-500">Configure maximum marks for each subject</p>
                                    </div>
                                    <button
                                        onClick={() => setShowMaxMarksModal(true)}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center gap-1"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Configure
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {subjectMaxMarks.slice(0, 4).map(subject => (
                                        <div key={subject.subjectId} className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-sm font-medium text-slate-700">{subject.subjectName}</p>
                                            <p className="text-lg font-bold text-indigo-600">{subject.maxMarks}</p>
                                            <p className="text-xs text-slate-500">marks</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Grade Configuration Management */}
                            <div className="pt-6 border-t border-slate-200">
                                <GradeConfigManagement
                                    gradeConfigs={gradeConfigs}
                                    activeConfig={activeConfig}
                                    showConfigForm={showConfigForm}
                                    editingConfig={editingConfig}
                                    configForm={configForm}
                                    setShowConfigForm={setShowConfigForm}
                                    setEditingConfig={setEditingConfig}
                                    setConfigForm={setConfigForm}
                                    handleSaveConfig={handleSaveConfig}
                                    handleActivateConfig={handleActivateConfig}
                                    startEditConfig={startEditConfig}
                                    loadData={loadGradeConfigs}
                                />
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            {/* Channel Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Notification Channels</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <p className="font-medium text-slate-800">Email</p>
                                                <p className="text-xs text-slate-500">Send notifications via email</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.emailEnabled}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emailEnabled: e.target.checked })}
                                            className="rounded text-indigo-600"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <p className="font-medium text-slate-800">SMS</p>
                                                <p className="text-xs text-slate-500">Send text messages</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.smsEnabled}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, smsEnabled: e.target.checked })}
                                            className="rounded text-indigo-600"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <MessageCircle className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <p className="font-medium text-slate-800">WhatsApp</p>
                                                <p className="text-xs text-slate-500">WhatsApp Business API</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.whatsappEnabled}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsappEnabled: e.target.checked })}
                                            className="rounded text-indigo-600"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <p className="font-medium text-slate-800">Push</p>
                                                <p className="text-xs text-slate-500">Mobile app notifications</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.pushEnabled}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, pushEnabled: e.target.checked })}
                                            className="rounded text-indigo-600"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Parent Notifications */}
                            {/* Parent Notifications */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Parent Notifications</h3>
                                <p className="text-sm text-slate-500 mb-3">These notifications will be sent to parents/guardians</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.parentNotifications.attendance}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                parentNotifications: {
                                                    ...notificationSettings.parentNotifications,
                                                    attendance: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Attendance Alerts</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.parentNotifications.fees}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                parentNotifications: {
                                                    ...notificationSettings.parentNotifications,
                                                    fees: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Fee Reminders</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.parentNotifications.results}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                parentNotifications: {
                                                    ...notificationSettings.parentNotifications,
                                                    results: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Results Released</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.parentNotifications.events}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                parentNotifications: {
                                                    ...notificationSettings.parentNotifications,
                                                    events: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>School Events</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.parentNotifications.announcements}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                parentNotifications: {
                                                    ...notificationSettings.parentNotifications,
                                                    announcements: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>General Announcements</span>
                                    </label>
                                </div>
                            </div>

                            {/* Teacher Notifications */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Teacher Notifications</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.teacherNotifications.attendance}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                teacherNotifications: {
                                                    ...notificationSettings.teacherNotifications,
                                                    attendance: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Class Attendance</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.teacherNotifications.results}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                teacherNotifications: {
                                                    ...notificationSettings.teacherNotifications,
                                                    results: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Results Entry</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.teacherNotifications.meetings}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                teacherNotifications: {
                                                    ...notificationSettings.teacherNotifications,
                                                    meetings: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Staff Meetings</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.teacherNotifications.announcements}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                teacherNotifications: {
                                                    ...notificationSettings.teacherNotifications,
                                                    announcements: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Announcements</span>
                                    </label>
                                </div>
                            </div>

                            {/* Student Notifications */}


                            {/* Reminder Timing */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Reminder Timing (Days Before)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Fee Reminders</label>
                                        <input
                                            type="number"
                                            value={notificationSettings.reminderTiming.fees}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                reminderTiming: {
                                                    ...notificationSettings.reminderTiming,
                                                    fees: parseInt(e.target.value)
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="0"
                                            max="30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Event Reminders</label>
                                        <input
                                            type="number"
                                            value={notificationSettings.reminderTiming.events}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                reminderTiming: {
                                                    ...notificationSettings.reminderTiming,
                                                    events: parseInt(e.target.value)
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="0"
                                            max="30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Reminders</label>
                                        <input
                                            type="number"
                                            value={notificationSettings.reminderTiming.meetings}
                                            onChange={(e) => setNotificationSettings({
                                                ...notificationSettings,
                                                reminderTiming: {
                                                    ...notificationSettings.reminderTiming,
                                                    meetings: parseInt(e.target.value)
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="0"
                                            max="30"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Test Connection */}
                            <div className="pt-6 border-t border-slate-200">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleTestConnection('Email')}
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 disabled:opacity-50"
                                    >
                                        Test Email
                                    </button>
                                    <button
                                        onClick={() => handleTestConnection('SMS')}
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 disabled:opacity-50"
                                    >
                                        Test SMS
                                    </button>
                                    <button
                                        onClick={() => handleTestConnection('WhatsApp')}
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 disabled:opacity-50"
                                    >
                                        Test WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fee Settings */}
                    {activeTab === 'fees' && (
                        <div className="space-y-6">
                            {/* Payment Methods */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Methods</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={feeSettings.paymentMethods.includes('cash')}
                                            onChange={(e) => {
                                                const newMethods = e.target.checked
                                                    ? [...feeSettings.paymentMethods, 'cash']
                                                    : feeSettings.paymentMethods.filter(m => m !== 'cash');
                                                setFeeSettings({ ...feeSettings, paymentMethods: newMethods as any });
                                            }}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Cash</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={feeSettings.paymentMethods.includes('card')}
                                            onChange={(e) => {
                                                const newMethods = e.target.checked
                                                    ? [...feeSettings.paymentMethods, 'card']
                                                    : feeSettings.paymentMethods.filter(m => m !== 'card');
                                                setFeeSettings({ ...feeSettings, paymentMethods: newMethods as any });
                                            }}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Card</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={feeSettings.paymentMethods.includes('bank')}
                                            onChange={(e) => {
                                                const newMethods = e.target.checked
                                                    ? [...feeSettings.paymentMethods, 'bank']
                                                    : feeSettings.paymentMethods.filter(m => m !== 'bank');
                                                setFeeSettings({ ...feeSettings, paymentMethods: newMethods as any });
                                            }}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Bank Transfer</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={feeSettings.paymentMethods.includes('mobile')}
                                            onChange={(e) => {
                                                const newMethods = e.target.checked
                                                    ? [...feeSettings.paymentMethods, 'mobile']
                                                    : feeSettings.paymentMethods.filter(m => m !== 'mobile');
                                                setFeeSettings({ ...feeSettings, paymentMethods: newMethods as any });
                                            }}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Mobile Money</span>
                                    </label>
                                </div>
                            </div>

                            {/* Late Fees */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Late Payment Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Late Fee (%)</label>
                                        <input
                                            type="number"
                                            value={feeSettings.lateFeePercentage}
                                            onChange={(e) => setFeeSettings({ ...feeSettings, lateFeePercentage: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Grace Period (days)</label>
                                        <input
                                            type="number"
                                            value={feeSettings.gracePeriod}
                                            onChange={(e) => setFeeSettings({ ...feeSettings, gracePeriod: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="0"
                                            max="30"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Discounts */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Discounts</h3>
                                {feeSettings.discounts.map((discount, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={discount.name}
                                            onChange={(e) => {
                                                const newDiscounts = [...feeSettings.discounts];
                                                newDiscounts[index].name = e.target.value;
                                                setFeeSettings({ ...feeSettings, discounts: newDiscounts });
                                            }}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                                            placeholder="Discount name"
                                        />
                                        <input
                                            type="number"
                                            value={discount.percentage}
                                            onChange={(e) => {
                                                const newDiscounts = [...feeSettings.discounts];
                                                newDiscounts[index].percentage = parseInt(e.target.value);
                                                setFeeSettings({ ...feeSettings, discounts: newDiscounts });
                                            }}
                                            className="w-24 px-3 py-2 border border-slate-300 rounded-lg"
                                            placeholder="%"
                                        />
                                        <button
                                            onClick={() => handleRemoveDiscount(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddDiscount}
                                    className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Discount
                                </button>
                            </div>

                            {/* Installments */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Installment Plans</h3>
                                {feeSettings.installments.map((installment, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={installment.name}
                                            onChange={(e) => {
                                                const newInstallments = [...feeSettings.installments];
                                                newInstallments[index].name = e.target.value;
                                                setFeeSettings({ ...feeSettings, installments: newInstallments });
                                            }}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                                            placeholder="Installment name"
                                        />
                                        <input
                                            type="number"
                                            value={installment.percentage}
                                            onChange={(e) => {
                                                const newInstallments = [...feeSettings.installments];
                                                newInstallments[index].percentage = parseInt(e.target.value);
                                                setFeeSettings({ ...feeSettings, installments: newInstallments });
                                            }}
                                            className="w-24 px-3 py-2 border border-slate-300 rounded-lg"
                                            placeholder="%"
                                        />
                                        <input
                                            type="date"
                                            value={installment.dueDate}
                                            onChange={(e) => {
                                                const newInstallments = [...feeSettings.installments];
                                                newInstallments[index].dueDate = e.target.value;
                                                setFeeSettings({ ...feeSettings, installments: newInstallments });
                                            }}
                                            className="w-40 px-3 py-2 border border-slate-300 rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleRemoveInstallment(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddInstallment}
                                    className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Installment
                                </button>
                            </div>

                            {/* Receipt Settings */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Receipt & Invoice</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Prefix</label>
                                        <input
                                            type="text"
                                            value={feeSettings.receiptPrefix}
                                            onChange={(e) => setFeeSettings({ ...feeSettings, receiptPrefix: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Prefix</label>
                                        <input
                                            type="text"
                                            value={feeSettings.invoicePrefix}
                                            onChange={(e) => setFeeSettings({ ...feeSettings, invoicePrefix: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {/* Two Factor Auth */}
                            <div>
                                <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800">Two-Factor Authentication</p>
                                        <p className="text-sm text-slate-500">Require 2FA for admin accounts</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={securitySettings.twoFactorAuth}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                                        className="rounded text-indigo-600"
                                    />
                                </label>
                            </div>

                            {/* Password Policy */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Password Policy</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Length</label>
                                        <input
                                            type="number"
                                            value={securitySettings.passwordPolicy.minLength}
                                            onChange={(e) => setSecuritySettings({
                                                ...securitySettings,
                                                passwordPolicy: {
                                                    ...securitySettings.passwordPolicy,
                                                    minLength: parseInt(e.target.value)
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="6"
                                            max="20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Password Expiry (days)</label>
                                        <input
                                            type="number"
                                            value={securitySettings.passwordPolicy.expiryDays}
                                            onChange={(e) => setSecuritySettings({
                                                ...securitySettings,
                                                passwordPolicy: {
                                                    ...securitySettings.passwordPolicy,
                                                    expiryDays: parseInt(e.target.value)
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="0"
                                            max="365"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={securitySettings.passwordPolicy.requireNumbers}
                                            onChange={(e) => setSecuritySettings({
                                                ...securitySettings,
                                                passwordPolicy: {
                                                    ...securitySettings.passwordPolicy,
                                                    requireNumbers: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Require numbers</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={securitySettings.passwordPolicy.requireSymbols}
                                            onChange={(e) => setSecuritySettings({
                                                ...securitySettings,
                                                passwordPolicy: {
                                                    ...securitySettings.passwordPolicy,
                                                    requireSymbols: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Require symbols</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={securitySettings.passwordPolicy.requireUppercase}
                                            onChange={(e) => setSecuritySettings({
                                                ...securitySettings,
                                                passwordPolicy: {
                                                    ...securitySettings.passwordPolicy,
                                                    requireUppercase: e.target.checked
                                                }
                                            })}
                                            className="rounded text-indigo-600"
                                        />
                                        <span>Require uppercase letters</span>
                                    </label>
                                </div>
                            </div>

                            {/* Session & Login */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Session & Login</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Session Timeout (minutes)</label>
                                        <input
                                            type="number"
                                            value={securitySettings.sessionTimeout}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="5"
                                            max="120"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Max Login Attempts</label>
                                        <input
                                            type="number"
                                            value={securitySettings.loginAttempts}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="3"
                                            max="10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Lockout Duration (minutes)</label>
                                        <input
                                            type="number"
                                            value={securitySettings.lockoutDuration}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            min="5"
                                            max="60"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* IP Whitelist */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">IP Whitelist</h3>
                                <p className="text-sm text-slate-500 mb-4">Restrict admin access to specific IP addresses</p>
                                <div className="space-y-2">
                                    {securitySettings.ipWhitelist.map((ip, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={ip}
                                                onChange={(e) => {
                                                    const newWhitelist = [...securitySettings.ipWhitelist];
                                                    newWhitelist[index] = e.target.value;
                                                    setSecuritySettings({ ...securitySettings, ipWhitelist: newWhitelist });
                                                }}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                                                placeholder="e.g., 192.168.1.1"
                                            />
                                            <button
                                                onClick={() => handleRemoveIpWhitelist(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleAddIpWhitelist}
                                        className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add IP Address
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Backup Settings */}
                    {activeTab === 'backup' && (
                        <div className="space-y-6">
                            {/* Auto Backup */}
                            <div>
                                <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800">Automatic Backups</p>
                                        <p className="text-sm text-slate-500">Schedule regular system backups</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={backupSettings.autoBackup}
                                        onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                                        className="rounded text-indigo-600"
                                    />
                                </label>
                            </div>

                            {backupSettings.autoBackup && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                            <select
                                                value={backupSettings.frequency}
                                                onChange={(e) => setBackupSettings({ ...backupSettings, frequency: e.target.value as any })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                            <input
                                                type="time"
                                                value={backupSettings.time}
                                                onChange={(e) => setBackupSettings({ ...backupSettings, time: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Retention (days)</label>
                                            <input
                                                type="number"
                                                value={backupSettings.retention}
                                                onChange={(e) => setBackupSettings({ ...backupSettings, retention: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                min="1"
                                                max="365"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Backup Location</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="backupLocation"
                                                    value="local"
                                                    checked={backupSettings.backupLocation === 'local'}
                                                    onChange={(e) => setBackupSettings({ ...backupSettings, backupLocation: e.target.value as any })}
                                                    className="text-indigo-600"
                                                />
                                                <span>Local Storage</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="backupLocation"
                                                    value="cloud"
                                                    checked={backupSettings.backupLocation === 'cloud'}
                                                    onChange={(e) => setBackupSettings({ ...backupSettings, backupLocation: e.target.value as any })}
                                                    className="text-indigo-600"
                                                />
                                                <span>Cloud Storage</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={backupSettings.includeMedia}
                                                onChange={(e) => setBackupSettings({ ...backupSettings, includeMedia: e.target.checked })}
                                                className="rounded text-indigo-600"
                                            />
                                            <span>Include media files</span>
                                        </label>
                                    </div>
                                </>
                            )}

                            {/* Last Backup Info */}
                            <div className="pt-6 border-t border-slate-200">
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Last Backup</p>
                                            <p className="font-medium text-slate-800">{backupSettings.lastBackup || 'Never'}</p>
                                        </div>
                                        <button
                                            onClick={handleBackup}
                                            disabled={loading}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            {loading ? 'Backing up...' : 'Backup Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Restore Options */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Restore from Backup</h3>
                                <div className="space-y-2">
                                    {backupFiles.length === 0 ? (
                                        <p className="text-center text-slate-500 py-4">No backup files available</p>
                                    ) : (
                                        backupFiles.map(file => (
                                            <div key={file.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-slate-800">{file.name}</p>
                                                    <p className="text-sm text-slate-500">
                                                        Size: {formatFileSize(file.size)} • Created: {formatDate(file.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDownloadBackup(file.id, file.name)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRestoreBackup(file.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Subject Max Marks Modal */}
            {showMaxMarksModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-800">Configure Subject Maximum Marks</h3>
                            <button
                                onClick={() => setShowMaxMarksModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Class Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                                <select
                                    value={selectedClassForMaxMarks}
                                    onChange={(e) => {
                                        setSelectedClassForMaxMarks(e.target.value);
                                        loadSubjectMaxMarks(e.target.value);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Different classes can have different maximum marks</p>
                            </div>

                            {!selectedClassForMaxMarks && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <p className="text-sm text-yellow-700">Please select a class to configure subject maximum marks</p>
                                </div>
                            )}

                            {selectedClassForMaxMarks && (
                                <>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Set the maximum marks for each subject for {classes.find(c => c.id === selectedClassForMaxMarks)?.name}.
                                        This will affect how scores are calculated and displayed.
                                    </p>

                                    <div className="space-y-3">
                                        {subjectMaxMarks.map(subject => (
                                            <div key={subject.subjectId} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-slate-700">{subject.subjectName}</label>
                                                </div>
                                                <div className="w-32">
                                                    <input
                                                        type="number"
                                                        value={subject.maxMarks}
                                                        onChange={(e) => handleUpdateMaxMark(subject.subjectId, parseInt(e.target.value))}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                        min="0"
                                                        max="1000"
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-500">marks</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-2 mt-6">
                                        <button
                                            onClick={() => setShowMaxMarksModal(false)}
                                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveMaxMarks}
                                            disabled={loading}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsManagement;