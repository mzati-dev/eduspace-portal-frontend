import React, { useRef, useState } from 'react';
import { Download, Printer, Edit2, Save, Upload, Plus, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TransferLetterProps {
    schoolName: string;
    schoolLogo?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    schoolEmail?: string;
    schoolDistrict?: string;
    schoolZone?: string;
    schoolEmis?: string;
}

const TransferLetter: React.FC<TransferLetterProps> = ({
    schoolName,
    schoolLogo,
    schoolAddress = '',
    schoolPhone = '',
    schoolEmail = '',
    schoolDistrict = '',
    schoolZone = '',
    schoolEmis = '',
}) => {
    const letterRef = useRef<HTMLDivElement>(null);
    const [showTemplate, setShowTemplate] = useState(false);
    const [isEditing, setIsEditing] = useState(true); // Start in edit mode when template opens
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        district: schoolDistrict,
        zone: schoolZone,
        emis: schoolEmis,
        schoolYear: '',
        term: '',
        pupilName: '',
        pupilCode: '',
        sex: '',
        dob: '',
        standard: '',
        conduct: '',
        performance: '',
        reason: '',
        headteacherName: '',
        headteacherPhone: ''
    });

    const currentDate = new Date().toLocaleDateString('en-GB');

    const handlePrint = () => {
        const printContent = letterRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    };

    const handleDownloadPDF = async () => {
        if (letterRef.current) {
            const canvas = await html2canvas(letterRef.current, {
                scale: 2,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${schoolName}_Transfer_Letter.pdf`);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignatureImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateNew = () => {
        setShowTemplate(true);
        setIsEditing(true);
        // Reset form data but keep school info
        setFormData({
            district: schoolDistrict,
            zone: schoolZone,
            emis: schoolEmis,
            schoolYear: '',
            term: '',
            pupilName: '',
            pupilCode: '',
            sex: '',
            dob: '',
            standard: '',
            conduct: '',
            performance: '',
            reason: '',
            headteacherName: '',
            headteacherPhone: ''
        });
        setSignatureImage(null);
    };

    if (!showTemplate) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all"
                >
                    <Plus className="w-6 h-6" />
                    <span className="text-lg font-medium">Create Transfer Letter</span>
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Transfer Letter</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowTemplate(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        <X className="w-4 h-4" /> Close
                    </button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        {isEditing ? 'Save' : 'Edit'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                </div>
            </div>

            {/* Transfer Letter Template */}
            <div ref={letterRef} className="bg-white border rounded-xl shadow-lg overflow-hidden">
                {/* Letterhead */}
                <div className="border-b p-6 text-center">
                    {schoolLogo ? (
                        <img src={schoolLogo} alt="School Logo" className="h-16 mx-auto mb-3" />
                    ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                            <span className="text-white font-bold text-2xl">{schoolName.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-indigo-800">{schoolName}</h1>
                    <p className="text-sm text-gray-600 mt-1">{schoolAddress}</p>
                    <p className="text-xs text-gray-500">Tel: {schoolPhone} | Email: {schoolEmail}</p>
                </div>

                {/* Title */}
                <div className="text-center py-4 border-b bg-gray-50">
                    <h2 className="text-xl font-semibold uppercase tracking-wide">Pupil Transfer Letter</h2>
                </div>

                {/* School Info Row */}
                <div className="grid grid-cols-3 gap-4 p-4 border-b bg-gray-50">
                    <div>
                        <p className="text-xs text-gray-500">District</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.district}
                                onChange={(e) => handleInputChange('district', e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm font-medium"
                                placeholder="Enter district"
                            />
                        ) : (
                            <p className="font-medium">{formData.district || '________'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Zone</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.zone}
                                onChange={(e) => handleInputChange('zone', e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm font-medium"
                                placeholder="Enter zone"
                            />
                        ) : (
                            <p className="font-medium">{formData.zone || '________'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">EMIS</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.emis}
                                onChange={(e) => handleInputChange('emis', e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm font-medium"
                                placeholder="Enter EMIS"
                            />
                        ) : (
                            <p className="font-medium">{formData.emis || '________'}</p>
                        )}
                    </div>
                </div>

                {/* Term and Date */}
                <div className="grid grid-cols-3 gap-4 p-4 border-b">
                    <div>
                        <p className="text-sm font-medium">School Year:</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.schoolYear}
                                onChange={(e) => handleInputChange('schoolYear', e.target.value)}
                                className="w-full border-b border-gray-300 focus:border-indigo-500 outline-none mt-1"
                                placeholder="e.g., 2025"
                            />
                        ) : (
                            <p className="text-gray-600 mt-1">{formData.schoolYear || '________'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium">Term:</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.term}
                                onChange={(e) => handleInputChange('term', e.target.value)}
                                className="w-full border-b border-gray-300 focus:border-indigo-500 outline-none mt-1"
                                placeholder="e.g., Term 1"
                            />
                        ) : (
                            <p className="text-gray-600 mt-1">{formData.term || '________'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium">Date:</p>
                        <p className="text-gray-600 mt-1">{currentDate}</p>
                    </div>
                </div>

                {/* Pupil Details */}
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Pupil Name:</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.pupilName}
                                    onChange={(e) => handleInputChange('pupilName', e.target.value)}
                                    className="w-full border-b border-gray-300 focus:border-indigo-500 outline-none mt-1"
                                    placeholder="Enter pupil name"
                                />
                            ) : (
                                <p className="text-gray-600 mt-1">{formData.pupilName || '_____________________'}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium">Pupil Code:</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.pupilCode}
                                    onChange={(e) => handleInputChange('pupilCode', e.target.value)}
                                    className="w-full border-b border-gray-300 focus:border-indigo-500 outline-none mt-1"
                                    placeholder="Enter pupil code"
                                />
                            ) : (
                                <p className="text-gray-600 mt-1">{formData.pupilCode || '_____________________'}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium">Sex:</p>
                            {isEditing ? (
                                <select
                                    value={formData.sex}
                                    onChange={(e) => handleInputChange('sex', e.target.value)}
                                    className="w-full border rounded px-2 py-1 mt-1"
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            ) : (
                                <p className="text-gray-600 mt-1">{formData.sex || '________'}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium">DOB:</p>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => handleInputChange('dob', e.target.value)}
                                    className="w-full border rounded px-2 py-1 mt-1"
                                />
                            ) : (
                                <p className="text-gray-600 mt-1">{formData.dob || '________'}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium">Standard:</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.standard}
                                    onChange={(e) => handleInputChange('standard', e.target.value)}
                                    className="w-full border-b border-gray-300 focus:border-indigo-500 outline-none mt-1"
                                    placeholder="e.g., Standard 4"
                                />
                            ) : (
                                <p className="text-gray-600 mt-1">{formData.standard || '________'}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium">Conduct:</p>
                        {isEditing ? (
                            <textarea
                                value={formData.conduct}
                                onChange={(e) => handleInputChange('conduct', e.target.value)}
                                className="w-full border rounded px-2 py-1 mt-1"
                                rows={2}
                                placeholder="e.g., Good, Excellent, Satisfactory"
                            />
                        ) : (
                            <p className="text-gray-600 mt-1">{formData.conduct || '_____________________'}</p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-medium">Performance:</p>
                        {isEditing ? (
                            <textarea
                                value={formData.performance}
                                onChange={(e) => handleInputChange('performance', e.target.value)}
                                className="w-full border rounded px-2 py-1 mt-1"
                                rows={2}
                                placeholder="e.g., Above Average, Average"
                            />
                        ) : (
                            <p className="text-gray-600 mt-1">{formData.performance || '_____________________'}</p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-medium">Reason for Transfer:</p>
                        {isEditing ? (
                            <textarea
                                value={formData.reason}
                                onChange={(e) => handleInputChange('reason', e.target.value)}
                                className="w-full border rounded px-2 py-1 mt-1"
                                rows={3}
                                placeholder="e.g., Parent relocation, Change of school"
                            />
                        ) : (
                            <p className="text-gray-600 mt-1">{formData.reason || '_____________________'}</p>
                        )}
                    </div>
                </div>

                {/* Signature Section */}
                <div className="grid grid-cols-2 gap-8 p-6 border-t mt-4">
                    <div>
                        <p className="text-sm font-medium">Headteacher's Name:</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.headteacherName}
                                onChange={(e) => handleInputChange('headteacherName', e.target.value)}
                                className="w-full border-b border-gray-300 focus:border-indigo-500 outline-none mt-1"
                                placeholder="Enter headteacher name"
                            />
                        ) : (
                            <p className="text-gray-600 mt-1">{formData.headteacherName || '_____________________'}</p>
                        )}
                        <p className="text-sm font-medium mt-3">Phone Number:</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.headteacherPhone}
                                onChange={(e) => handleInputChange('headteacherPhone', e.target.value)}
                                className="w-full border-b border-gray-300 focus:border-indigo-500 outline-none mt-1"
                                placeholder="Enter phone number"
                            />
                        ) : (
                            <p className="text-gray-600 mt-1">{formData.headteacherPhone || '_____________________'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium">Headteacher's Signature:</p>
                        <div className="mt-1">
                            {signatureImage ? (
                                <img src={signatureImage} alt="Signature" className="h-12 object-contain" />
                            ) : (
                                <p className="text-gray-400">_____________________</p>
                            )}
                            {isEditing && (
                                <>
                                    <input
                                        type="file"
                                        ref={signatureInputRef}
                                        onChange={handleSignatureUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => signatureInputRef.current?.click()}
                                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                    >
                                        <Upload className="w-3 h-3" /> Upload Signature
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="text-sm font-medium mt-3">School Stamp:</p>
                        <p className="text-gray-400 mt-1">(Place stamp here)</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-3 border-t text-xs text-gray-400">
                    This is an official transfer letter. Please present to receiving school.
                </div>
            </div>
        </div>
    );
};

export default TransferLetter;