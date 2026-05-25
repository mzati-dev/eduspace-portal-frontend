import React from 'react';
import { Save, X } from 'lucide-react';
import { Student } from '@/types/admin';

interface StudentFormProps {
    studentForm: {
        exam_number: string;
        name: string;
        class_id: string;
        photo_url: string;
        gender: string;
        // NEW FIELDS - ADD THESE
        emis_code?: string;                                     // <-- ADD THIS
        parent_name?: string;                                    // <-- ADD THIS
        parent_phone?: string;                                   // <-- ADD THIS
        parent_email?: string;                                   // <-- ADD THIS
        parent_national_id?: string;                             // <-- ADD THIS
        parent_relationship?: string;                            // <-- ADD THIS
        parent_alternate_phone?: string;                         // <-- ADD THIS
        parent_address?: string;                                 // <-- ADD THIS
        parent_occupation?: string;                              // <-- ADD THIS
        preferred_contact?: 'sms' | 'whatsapp' | 'email' | 'call'; // <-- ADD THIS
        emergency_contact_name?: string;                         // <-- ADD THIS
        emergency_contact_phone?: string;                        // <-- ADD THIS
        emergency_contact_relationship?: string;                 // <-- ADD THIS
        parent_password?: string;
        send_credentials?: boolean;
    };
    editingStudent: Student | null;
    classes: any[];
    setShowStudentForm: (show: boolean) => void;
    setEditingStudent: (student: Student | null) => void;
    setStudentForm: (form:
        {
            exam_number: string;
            name: string;
            class_id: string;
            photo_url: string;
            gender: string;
            emis_code?: string;                                      // <-- ADD THIS
            parent_name?: string;                                    // <-- ADD THIS
            parent_phone?: string;                                   // <-- ADD THIS
            parent_email?: string;                                   // <-- ADD THIS
            parent_national_id?: string;                             // <-- ADD THIS
            parent_relationship?: string;                            // <-- ADD THIS
            parent_alternate_phone?: string;                         // <-- ADD THIS
            parent_address?: string;                                 // <-- ADD THIS
            parent_occupation?: string;                              // <-- ADD THIS
            preferred_contact?: 'sms' | 'whatsapp' | 'email' | 'call'; // <-- ADD THIS
            emergency_contact_name?: string;                         // <-- ADD THIS
            emergency_contact_phone?: string;                        // <-- ADD THIS
            emergency_contact_relationship?: string;                 // <-- ADD THIS
            parent_password?: string;
            send_credentials?: boolean;

        }) => void;
    handleCreateStudent: (e: React.FormEvent) => Promise<void>;
    handleUpdateStudent: (e: React.FormEvent) => Promise<void>;

}

const StudentForm: React.FC<StudentFormProps> = ({
    studentForm,
    editingStudent,
    classes,
    setShowStudentForm,
    setEditingStudent,
    setStudentForm,
    handleCreateStudent,
    handleUpdateStudent,
}) => {
    const handleSubmit = editingStudent ? handleUpdateStudent : handleCreateStudent;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"> */}
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {editingStudent ? 'Edit Student' : 'Add New Student'}
                    </h3>
                    <button
                        onClick={() => { setShowStudentForm(false); setEditingStudent(null); }}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {studentForm.class_id && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-indigo-800">Auto-generated Exam Number</p>
                                    <p className="font-mono text-lg font-bold text-indigo-700">{studentForm.exam_number}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(studentForm.exam_number)}
                                    className="px-3 py-1 bg-white border border-indigo-300 text-indigo-600 rounded text-sm hover:bg-indigo-50 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="text-xs text-indigo-600 mt-2">
                                This exam number will be assigned to the student
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                            placeholder="Sean Mkweza"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                        <select
                            value={studentForm.gender || ''}
                            onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                        <select
                            value={studentForm.class_id}
                            onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">Select a class</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} - {cls.term} ({cls.academic_year})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Create new classes in "Manage Classes" tab first
                        </p>
                    </div>

                    {/* EMIS CODE - For Primary Students */}
                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Primary School Information</h4>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                EMIS Code <span className="text-xs text-slate-500">(for primary students only)</span>
                            </label>
                            <input
                                type="text"
                                value={studentForm.emis_code || ''}
                                onChange={(e) => setStudentForm({ ...studentForm, emis_code: e.target.value })}
                                placeholder="e.g., 123456789"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                EMIS number assigned by Ministry of Education
                            </p>
                        </div>
                    </div>
                    {/* PARENT/GUARDIAN INFORMATION */}
                    {/* PARENT/GUARDIAN INFORMATION */}
                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Parent/Guardian Information</h4>
                        <p className="text-xs text-amber-600 mb-3 bg-amber-50 p-2 rounded">
                            📱 Phone number will be used for parent login access
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Parent Name */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Parent/Guardian Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={studentForm.parent_name || ''}
                                    onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                                    placeholder="e.g., John Mkweza"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            {/* Relationship */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Relationship <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={studentForm.parent_relationship || ''}
                                    onChange={(e) => setStudentForm({ ...studentForm, parent_relationship: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="father">Father</option>
                                    <option value="mother">Mother</option>
                                    <option value="guardian">Guardian</option>
                                    <option value="grandparent">Grandparent</option>
                                    <option value="aunt">Aunt</option>
                                    <option value="uncle">Uncle</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Phone <span className="text-red-500">*</span>
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Login</span>
                                </label>
                                <input
                                    type="tel"
                                    value={studentForm.parent_phone || ''}
                                    onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })}
                                    placeholder="0999123456"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            {/* Alternate Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Alternate Phone
                                </label>
                                <input
                                    type="tel"
                                    value={studentForm.parent_alternate_phone || ''}
                                    onChange={(e) => setStudentForm({ ...studentForm, parent_alternate_phone: e.target.value })}
                                    placeholder="0888123456"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={studentForm.parent_email || ''}
                                    onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })}
                                    placeholder="parent@example.com"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* National ID */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    National ID
                                </label>
                                <input
                                    type="text"
                                    value={studentForm.parent_national_id || ''}
                                    onChange={(e) => setStudentForm({ ...studentForm, parent_national_id: e.target.value })}
                                    placeholder="123456789"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Occupation */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    value={studentForm.parent_occupation || ''}
                                    onChange={(e) => setStudentForm({ ...studentForm, parent_occupation: e.target.value })}
                                    placeholder="Teacher, Farmer, etc"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Address - spans both columns */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Home Address
                                </label>
                                <textarea
                                    value={studentForm.parent_address || ''}
                                    onChange={(e) => setStudentForm({ ...studentForm, parent_address: e.target.value })}
                                    placeholder="Village/Town, District"
                                    rows={2}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Preferred Contact - spans both columns */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Preferred Contact Method
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="preferred_contact"
                                            value="sms"
                                            checked={studentForm.preferred_contact === 'sms'}
                                            onChange={(e) => setStudentForm({ ...studentForm, preferred_contact: e.target.value as any })}
                                            className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm">SMS</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="preferred_contact"
                                            value="whatsapp"
                                            checked={studentForm.preferred_contact === 'whatsapp'}
                                            onChange={(e) => setStudentForm({ ...studentForm, preferred_contact: e.target.value as any })}
                                            className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm">WhatsApp</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="preferred_contact"
                                            value="call"
                                            checked={studentForm.preferred_contact === 'call'}
                                            onChange={(e) => setStudentForm({ ...studentForm, preferred_contact: e.target.value as any })}
                                            className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm">Phone Call</span>
                                    </label>
                                </div>
                            </div>

                            {/* ===== NEW: PARENT LOGIN CREDENTIALS SECTION ===== */}
                            <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Parent Login Credentials</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Username (auto-filled from phone) */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Username <span className="text-xs text-slate-500">(phone number)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={studentForm.parent_phone || ''}
                                            readOnly
                                            className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Parent will login using phone number</p>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={studentForm.parent_password || ''}
                                                onChange={(e) => setStudentForm({ ...studentForm, parent_password: e.target.value })}
                                                placeholder="Enter or generate password"
                                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // Generate random password: 8 chars, letters + numbers
                                                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
                                                    let password = '';
                                                    for (let i = 0; i < 8; i++) {
                                                        password += chars.charAt(Math.floor(Math.random() * chars.length));
                                                    }
                                                    setStudentForm({ ...studentForm, parent_password: password });
                                                }}
                                                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Parent will use this password to login</p>
                                    </div>
                                </div>

                                {/* Send credentials options */}
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={studentForm.send_credentials !== false}
                                            onChange={(e) => setStudentForm({ ...studentForm, send_credentials: e.target.checked })}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">
                                            Send login credentials to parent via {studentForm.preferred_contact || 'SMS'}
                                        </span>
                                    </label>
                                    <p className="text-xs text-slate-600 mt-1 ml-6">
                                        Credentials will be sent to {studentForm.parent_phone || 'parent\'s phone'}
                                    </p>
                                </div>
                            </div>

                            {/* Preferred Contact - spans both columns */}
                            {/* <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Preferred Contact Method
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="preferred_contact"
                                            value="sms"
                                            checked={studentForm.preferred_contact === 'sms'}
                                            onChange={(e) => setStudentForm({ ...studentForm, preferred_contact: e.target.value as any })}
                                            className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm">SMS</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="preferred_contact"
                                            value="whatsapp"
                                            checked={studentForm.preferred_contact === 'whatsapp'}
                                            onChange={(e) => setStudentForm({ ...studentForm, preferred_contact: e.target.value as any })}
                                            className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm">WhatsApp</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="preferred_contact"
                                            value="call"
                                            checked={studentForm.preferred_contact === 'call'}
                                            onChange={(e) => setStudentForm({ ...studentForm, preferred_contact: e.target.value as any })}
                                            className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm">Phone Call</span>
                                    </label>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setShowStudentForm(false); setEditingStudent(null); }}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {editingStudent ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;