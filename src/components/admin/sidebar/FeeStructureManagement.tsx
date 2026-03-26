import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    DollarSign,
    Calendar,
    Bus,
    Library,
    Trophy,
    Building,
    Utensils,
    FileText,
    PlusCircle,
    MinusCircle
} from 'lucide-react';
import {
    fetchFeeStructures,
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    FeeStructure
} from '@/services/feesService';

interface Props {
    classes: any[];
    showMessage: (msg: string, isError?: boolean) => void;
}

interface CustomFee {
    id: string;
    name: string;
    amount: number;
}

const FeeStructureManagement: React.FC<Props> = ({ classes, showMessage }) => {
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        term: 'Term 1',
        academicYear: new Date().getFullYear().toString(),
        tuition: 0,
        development: 0,
        sports: 0,
        library: 0,
        transport: 0,
        meal: 0,
        exam: 0,
        customFees: [] as CustomFee[],
        dueDate: '',
        classId: '',
        className: ''
    });

    // Available terms
    const terms = ['Term 1', 'Term 2', 'Term 3'];

    // Available years
    const years = [
        new Date().getFullYear().toString(),
        (new Date().getFullYear() + 1).toString(),
        (new Date().getFullYear() + 2).toString()
    ];

    useEffect(() => {
        loadFeeStructures();
    }, []);

    const loadFeeStructures = async () => {
        setLoading(true);
        try {
            const data = await fetchFeeStructures();
            setFeeStructures(data);
        } catch (error) {
            showMessage('Failed to load fee structures', true);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        const standardTotal = formData.tuition + formData.development + formData.sports +
            formData.library + formData.transport + formData.meal + formData.exam;
        const customTotal = formData.customFees.reduce((sum, fee) => sum + fee.amount, 0);
        return standardTotal + customTotal;
    };

    const addCustomFee = () => {
        setFormData({
            ...formData,
            customFees: [...formData.customFees, { id: Date.now().toString(), name: '', amount: 0 }]
        });
    };

    const removeCustomFee = (id: string) => {
        setFormData({
            ...formData,
            customFees: formData.customFees.filter(fee => fee.id !== id)
        });
    };

    const updateCustomFee = (id: string, field: 'name' | 'amount', value: string | number) => {
        setFormData({
            ...formData,
            customFees: formData.customFees.map(fee =>
                fee.id === id ? { ...fee, [field]: value } : fee
            )
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const total = calculateTotal();
            const data = {
                ...formData,
                total,
                academicYear: formData.academicYear,
                dueDate: formData.dueDate,
                customFees: formData.customFees.filter(f => f.name && f.amount > 0)
            };

            if (editingFee) {
                await updateFeeStructure(editingFee.id, data);
                showMessage('Fee structure updated successfully');
            } else {
                await createFeeStructure(data);
                showMessage('Fee structure created successfully');
            }

            setShowModal(false);
            resetForm();
            await loadFeeStructures();
        } catch (error: any) {
            showMessage(error.message || 'Failed to save fee structure', true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this fee structure?')) return;

        setLoading(true);
        try {
            await deleteFeeStructure(id);
            showMessage('Fee structure deleted successfully');
            await loadFeeStructures();
        } catch (error: any) {
            showMessage(error.message || 'Failed to delete fee structure', true);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            term: 'Term 1',
            academicYear: new Date().getFullYear().toString(),
            tuition: 0,
            development: 0,
            sports: 0,
            library: 0,
            transport: 0,
            meal: 0,
            exam: 0,
            customFees: [],
            dueDate: '',
            classId: '',
            className: ''
        });
        setEditingFee(null);
    };

    const openEditModal = (fee: FeeStructure) => {
        setEditingFee(fee);
        setFormData({
            term: fee.term,
            academicYear: fee.academicYear,
            tuition: fee.tuition || 0,
            development: fee.development || 0,
            sports: fee.sports || 0,
            library: fee.library || 0,
            transport: fee.transport || 0,
            meal: fee.meal || 0,
            exam: fee.exam || 0,
            customFees: fee.customFees || [],
            dueDate: fee.dueDate,
            classId: fee.classId || '',
            className: fee.className || ''
        });
        setShowModal(true);
    };

    const formatCurrency = (amount: number) => {
        return `MK ${amount.toLocaleString()}`;
    };

    // const renderFeeRow = (label: string, amount: number, onChange: (value: number) => void, icon?: React.ReactNode) => (
    //     <div className="flex justify-between items-center py-2 border-b border-slate-100">
    //         <span className="text-sm text-slate-600 flex items-center gap-2">
    //             {icon}
    //             {label}
    //         </span>
    //         <input
    //             type="number"
    //             value={amount}
    //             onChange={(e) => onChange(Number(e.target.value))}
    //             className="w-32 px-2 py-1 text-right border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
    //             min="0"
    //         />
    //     </div>
    // );
    const renderFeeRow = (label: string, amount: number, onChange: (value: number) => void, icon?: React.ReactNode) => (
        <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600 flex items-center gap-2">
                {icon}
                {label}
            </span>
            <input
                type="number"
                value={amount === 0 ? '' : amount}
                onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    onChange(value);
                }}
                className="w-32 px-2 py-1 text-right border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="0"
                placeholder=""
            />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Fee Structures</h2>
                    <p className="text-slate-500">Configure fees for different terms and classes</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Fee Structure
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            )}

            {/* Fee Structures List */}
            {!loading && feeStructures.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Fee Structures</h3>
                    <p className="text-slate-500 mb-4">Create your first fee structure to start collecting fees</p>
                    {/* <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Fee Structure
                    </button> */}
                </div>
            )}

            {/* Fee Structures Grid */}
            {!loading && feeStructures.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {feeStructures.map(fee => (
                        <div key={fee.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            {fee.term} {fee.academicYear}
                                        </h3>
                                        {fee.className && (
                                            <p className="text-sm text-indigo-600 mt-1">{fee.className}</p>
                                        )}
                                        {!fee.className && (
                                            <p className="text-sm text-slate-500 mt-1">All Classes</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(fee)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(fee.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {renderFeeRow('Tuition Fee', fee.tuition, () => { }, <DollarSign className="w-4 h-4" />)}
                                    {renderFeeRow('Development Fee', fee.development, () => { }, <Building className="w-4 h-4" />)}
                                    {renderFeeRow('Sports Fee', fee.sports, () => { }, <Trophy className="w-4 h-4" />)}
                                    {renderFeeRow('Library Fee', fee.library, () => { }, <Library className="w-4 h-4" />)}
                                    {renderFeeRow('Transport Fee', fee.transport, () => { }, <Bus className="w-4 h-4" />)}
                                    {renderFeeRow('Meal Fee', fee.meal || 0, () => { }, <Utensils className="w-4 h-4" />)}
                                    {renderFeeRow('Exam Fee', fee.exam || 0, () => { }, <FileText className="w-4 h-4" />)}
                                    {fee.customFees?.map((customFee, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-600">{customFee.name}</span>
                                            <span className="font-medium">{formatCurrency(customFee.amount)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-slate-50 rounded-lg p-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-800">Total Fees</span>
                                        <span className="text-xl font-bold text-indigo-600">
                                            {formatCurrency(fee.total)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Due Date
                                        </span>
                                        <span className="text-slate-700">{fee.dueDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            {editingFee ? 'Edit Fee Structure' : 'Create Fee Structure'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
                                    <select
                                        value={formData.term}
                                        onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        {terms.map(term => (
                                            <option key={term} value={term}>{term}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                                    <select
                                        value={formData.academicYear}
                                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {renderFeeRow('Tuition Fee (MK)', formData.tuition, (v) => setFormData({ ...formData, tuition: v }), <DollarSign className="w-4 h-4" />)}
                                {renderFeeRow('Development Fee (MK)', formData.development, (v) => setFormData({ ...formData, development: v }), <Building className="w-4 h-4" />)}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {renderFeeRow('Sports Fee (MK)', formData.sports, (v) => setFormData({ ...formData, sports: v }), <Trophy className="w-4 h-4" />)}
                                {renderFeeRow('Library Fee (MK)', formData.library, (v) => setFormData({ ...formData, library: v }), <Library className="w-4 h-4" />)}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {renderFeeRow('Transport Fee (MK)', formData.transport, (v) => setFormData({ ...formData, transport: v }), <Bus className="w-4 h-4" />)}
                                {renderFeeRow('Meal Fee (MK)', formData.meal, (v) => setFormData({ ...formData, meal: v }), <Utensils className="w-4 h-4" />)}
                            </div>

                            <div>
                                {renderFeeRow('Exam Fee (MK)', formData.exam, (v) => setFormData({ ...formData, exam: v }), <FileText className="w-4 h-4" />)}
                            </div>

                            {/* Custom Fees Section */}
                            <div className="border-t border-slate-200 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-slate-700">Custom Fees</label>
                                    <button
                                        type="button"
                                        onClick={addCustomFee}
                                        className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Add Custom Fee
                                    </button>
                                </div>
                                {formData.customFees.map((fee) => (
                                    <div key={fee.id} className="flex gap-3 mb-3">
                                        <input
                                            type="text"
                                            value={fee.name}
                                            onChange={(e) => updateCustomFee(fee.id, 'name', e.target.value)}
                                            placeholder="Fee name (e.g., Lab Fee, Activity Fee)"
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {/* <input
                                            type="number"
                                            value={fee.amount}
                                            onChange={(e) => updateCustomFee(fee.id, 'amount', Number(e.target.value))}
                                            placeholder="Amount"
                                            className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            min="0"
                                        /> */}
                                        <input
                                            type="number"
                                            value={fee.amount === 0 ? '' : fee.amount}
                                            onChange={(e) => updateCustomFee(fee.id, 'amount', e.target.value === '' ? 0 : Number(e.target.value))}
                                            placeholder="Amount"
                                            className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeCustomFee(fee.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <MinusCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Class (Optional)</label>
                                    <select
                                        value={formData.classId}
                                        onChange={(e) => {
                                            const selectedClass = classes.find(c => c.id === e.target.value);
                                            setFormData({
                                                ...formData,
                                                classId: e.target.value,
                                                className: selectedClass?.name || ''
                                            });
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Classes</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-slate-800">Total Fees</span>
                                    <span className="text-xl font-bold text-indigo-600">
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {editingFee ? 'Update' : 'Create'} Fee Structure
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeStructureManagement;

// // src/components/admin/fees/FeeStructureManagement.tsx
// import React, { useState, useEffect } from 'react';
// import {
//     Plus,
//     Edit2,
//     Trash2,
//     Save,
//     X,
//     DollarSign,
//     Calendar,
//     BookOpen,
//     Users,
//     Bus,
//     Library,
//     Trophy,
//     Building,
//     CheckCircle,
//     AlertCircle
// } from 'lucide-react';
// import {
//     fetchFeeStructures,
//     createFeeStructure,
//     updateFeeStructure,
//     deleteFeeStructure,
//     FeeStructure
// } from '@/services/feesService';

// interface Props {
//     classes: any[];
//     showMessage: (msg: string, isError?: boolean) => void;
// }

// const FeeStructureManagement: React.FC<Props> = ({ classes, showMessage }) => {
//     const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [showModal, setShowModal] = useState(false);
//     const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);

//     // Form state
//     const [formData, setFormData] = useState({
//         term: 'Term 1',
//         academicYear: new Date().getFullYear().toString(),
//         tuition: 0,
//         development: 0,
//         sports: 0,
//         library: 0,
//         transport: 0,
//         dueDate: '',
//         classId: '',
//         className: ''
//     });

//     // Available terms
//     const terms = ['Term 1', 'Term 2', 'Term 3'];

//     // Available years (current year + next 2 years)
//     const years = [
//         new Date().getFullYear().toString(),
//         (new Date().getFullYear() + 1).toString(),
//         (new Date().getFullYear() + 2).toString()
//     ];

//     useEffect(() => {
//         loadFeeStructures();
//     }, []);

//     const loadFeeStructures = async () => {
//         setLoading(true);
//         try {
//             const data = await fetchFeeStructures();
//             setFeeStructures(data);
//         } catch (error) {
//             showMessage('Failed to load fee structures', true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const calculateTotal = () => {
//         return formData.tuition + formData.development + formData.sports +
//             formData.library + formData.transport;
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const total = calculateTotal();
//             const data = {
//                 ...formData,
//                 total,
//                 academicYear: formData.academicYear,
//                 dueDate: formData.dueDate
//             };

//             if (editingFee) {
//                 await updateFeeStructure(editingFee.id, data);
//                 showMessage('Fee structure updated successfully');
//             } else {
//                 await createFeeStructure(data);
//                 showMessage('Fee structure created successfully');
//             }

//             setShowModal(false);
//             resetForm();
//             await loadFeeStructures();
//         } catch (error: any) {
//             showMessage(error.message || 'Failed to save fee structure', true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDelete = async (id: string) => {
//         if (!confirm('Are you sure you want to delete this fee structure?')) return;

//         setLoading(true);
//         try {
//             await deleteFeeStructure(id);
//             showMessage('Fee structure deleted successfully');
//             await loadFeeStructures();
//         } catch (error: any) {
//             showMessage(error.message || 'Failed to delete fee structure', true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             term: 'Term 1',
//             academicYear: new Date().getFullYear().toString(),
//             tuition: 0,
//             development: 0,
//             sports: 0,
//             library: 0,
//             transport: 0,
//             dueDate: '',
//             classId: '',
//             className: ''
//         });
//         setEditingFee(null);
//     };

//     const openEditModal = (fee: FeeStructure) => {
//         setEditingFee(fee);
//         setFormData({
//             term: fee.term,
//             academicYear: fee.academicYear,
//             tuition: fee.tuition,
//             development: fee.development,
//             sports: fee.sports,
//             library: fee.library,
//             transport: fee.transport,
//             dueDate: fee.dueDate,
//             classId: fee.classId || '',
//             className: fee.className || ''
//         });
//         setShowModal(true);
//     };

//     const formatCurrency = (amount: number) => {
//         return `MK ${amount.toLocaleString()}`;
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h2 className="text-2xl font-bold text-slate-800">Fee Structures</h2>
//                     <p className="text-slate-500">Configure fees for different terms and classes</p>
//                 </div>
//                 <button
//                     onClick={() => {
//                         resetForm();
//                         setShowModal(true);
//                     }}
//                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
//                 >
//                     <Plus className="w-4 h-4" />
//                     Create Fee Structure
//                 </button>
//             </div>

//             {/* Loading State */}
//             {loading && (
//                 <div className="text-center py-8">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
//                 </div>
//             )}

//             {/* Fee Structures List */}
//             {!loading && feeStructures.length === 0 && (
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
//                     <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
//                     <h3 className="text-lg font-semibold text-slate-800 mb-2">No Fee Structures</h3>
//                     <p className="text-slate-500 mb-4">Create your first fee structure to start collecting fees</p>
//                     <button
//                         onClick={() => setShowModal(true)}
//                         className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-2"
//                     >
//                         <Plus className="w-4 h-4" />
//                         Create Fee Structure
//                     </button>
//                 </div>
//             )}

//             {/* Fee Structures Grid */}
//             {!loading && feeStructures.length > 0 && (
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     {feeStructures.map(fee => (
//                         <div key={fee.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
//                             <div className="p-6">
//                                 <div className="flex justify-between items-start mb-4">
//                                     <div>
//                                         <h3 className="text-lg font-semibold text-slate-800">
//                                             {fee.term} {fee.academicYear}
//                                         </h3>
//                                         {fee.className && (
//                                             <p className="text-sm text-indigo-600 mt-1">{fee.className}</p>
//                                         )}
//                                         {!fee.className && (
//                                             <p className="text-sm text-slate-500 mt-1">All Classes</p>
//                                         )}
//                                     </div>
//                                     <div className="flex gap-2">
//                                         <button
//                                             onClick={() => openEditModal(fee)}
//                                             className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
//                                         >
//                                             <Edit2 className="w-4 h-4" />
//                                         </button>
//                                         <button
//                                             onClick={() => handleDelete(fee.id)}
//                                             className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                                         >
//                                             <Trash2 className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-3 mb-4">
//                                     <div className="flex justify-between items-center py-2 border-b border-slate-100">
//                                         <span className="text-sm text-slate-600 flex items-center gap-2">
//                                             <DollarSign className="w-4 h-4" />
//                                             Tuition Fee
//                                         </span>
//                                         <span className="font-medium">{formatCurrency(fee.tuition)}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center py-2 border-b border-slate-100">
//                                         <span className="text-sm text-slate-600 flex items-center gap-2">
//                                             <Building className="w-4 h-4" />
//                                             Development Fee
//                                         </span>
//                                         <span className="font-medium">{formatCurrency(fee.development)}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center py-2 border-b border-slate-100">
//                                         <span className="text-sm text-slate-600 flex items-center gap-2">
//                                             <Trophy className="w-4 h-4" />
//                                             Sports Fee
//                                         </span>
//                                         <span className="font-medium">{formatCurrency(fee.sports)}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center py-2 border-b border-slate-100">
//                                         <span className="text-sm text-slate-600 flex items-center gap-2">
//                                             <Library className="w-4 h-4" />
//                                             Library Fee
//                                         </span>
//                                         <span className="font-medium">{formatCurrency(fee.library)}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center py-2 border-b border-slate-100">
//                                         <span className="text-sm text-slate-600 flex items-center gap-2">
//                                             <Bus className="w-4 h-4" />
//                                             Transport Fee
//                                         </span>
//                                         <span className="font-medium">{formatCurrency(fee.transport)}</span>
//                                     </div>
//                                 </div>

//                                 <div className="bg-slate-50 rounded-lg p-4 mt-4">
//                                     <div className="flex justify-between items-center">
//                                         <span className="font-semibold text-slate-800">Total Fees</span>
//                                         <span className="text-xl font-bold text-indigo-600">
//                                             {formatCurrency(fee.total)}
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between items-center mt-2 text-sm">
//                                         <span className="text-slate-500 flex items-center gap-1">
//                                             <Calendar className="w-3 h-3" />
//                                             Due Date
//                                         </span>
//                                         <span className="text-slate-700">{fee.dueDate}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Create/Edit Modal */}
//             {showModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
//                         <button
//                             onClick={() => {
//                                 setShowModal(false);
//                                 resetForm();
//                             }}
//                             className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
//                         >
//                             <X className="w-5 h-5" />
//                         </button>

//                         <h3 className="text-lg font-semibold text-slate-800 mb-4">
//                             {editingFee ? 'Edit Fee Structure' : 'Create Fee Structure'}
//                         </h3>

//                         <form onSubmit={handleSubmit} className="space-y-6">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
//                                     <select
//                                         value={formData.term}
//                                         onChange={(e) => setFormData({ ...formData, term: e.target.value })}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                         required
//                                     >
//                                         {terms.map(term => (
//                                             <option key={term} value={term}>{term}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
//                                     <select
//                                         value={formData.academicYear}
//                                         onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                         required
//                                     >
//                                         {years.map(year => (
//                                             <option key={year} value={year}>{year}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Tuition Fee (MK)</label>
//                                     <input
//                                         type="number"
//                                         value={formData.tuition}
//                                         onChange={(e) => setFormData({ ...formData, tuition: Number(e.target.value) })}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                         required
//                                         min="0"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Development Fee (MK)</label>
//                                     <input
//                                         type="number"
//                                         value={formData.development}
//                                         onChange={(e) => setFormData({ ...formData, development: Number(e.target.value) })}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                         required
//                                         min="0"
//                                     />
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Sports Fee (MK)</label>
//                                     <input
//                                         type="number"
//                                         value={formData.sports}
//                                         onChange={(e) => setFormData({ ...formData, sports: Number(e.target.value) })}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                         required
//                                         min="0"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Library Fee (MK)</label>
//                                     <input
//                                         type="number"
//                                         value={formData.library}
//                                         onChange={(e) => setFormData({ ...formData, library: Number(e.target.value) })}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                         required
//                                         min="0"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-1">Transport Fee (MK)</label>
//                                 <input
//                                     type="number"
//                                     value={formData.transport}
//                                     onChange={(e) => setFormData({ ...formData, transport: Number(e.target.value) })}
//                                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     required
//                                     min="0"
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
//                                     <input
//                                         type="date"
//                                         value={formData.dueDate}
//                                         onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">Class (Optional)</label>
//                                     <select
//                                         value={formData.classId}
//                                         onChange={(e) => {
//                                             const selectedClass = classes.find(c => c.id === e.target.value);
//                                             setFormData({
//                                                 ...formData,
//                                                 classId: e.target.value,
//                                                 className: selectedClass?.name || ''
//                                             });
//                                         }}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                                     >
//                                         <option value="">All Classes</option>
//                                         {classes.map(cls => (
//                                             <option key={cls.id} value={cls.id}>{cls.name}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="bg-slate-50 rounded-lg p-4">
//                                 <div className="flex justify-between items-center">
//                                     <span className="font-semibold text-slate-800">Total Fees</span>
//                                     <span className="text-xl font-bold text-indigo-600">
//                                         {formatCurrency(calculateTotal())}
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-2 pt-4">
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setShowModal(false);
//                                         resetForm();
//                                     }}
//                                     className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
//                                 >
//                                     <Save className="w-4 h-4" />
//                                     {editingFee ? 'Update' : 'Create'} Fee Structure
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default FeeStructureManagement;