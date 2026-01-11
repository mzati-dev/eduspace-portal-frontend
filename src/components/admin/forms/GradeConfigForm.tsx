import React from 'react';
import { Save, X, Lock, AlertTriangle } from 'lucide-react';
import { GradeConfiguration } from '@/services/gradeConfigService';

interface GradeConfigFormProps {
    configForm: {
        configuration_name: string;
        calculation_method: 'average_all' | 'end_of_term_only' | 'weighted_average';
        weight_qa1: number;
        weight_qa2: number;
        weight_end_of_term: number;
        pass_mark: number;
    };
    editingConfig: GradeConfiguration | null;
    setShowConfigForm: (show: boolean) => void;
    setEditingConfig: (config: GradeConfiguration | null) => void;
    setConfigForm: (form: {
        configuration_name: string;
        calculation_method: 'average_all' | 'end_of_term_only' | 'weighted_average';
        weight_qa1: number;
        weight_qa2: number;
        weight_end_of_term: number;
        pass_mark: number;
    }) => void;
    handleSaveConfig: (e: React.FormEvent) => Promise<void>;
    isSystemFrozen?: boolean; // ADD THIS PROP
}

const GradeConfigForm: React.FC<GradeConfigFormProps> = ({
    configForm,
    editingConfig,
    setShowConfigForm,
    setEditingConfig,
    setConfigForm,
    handleSaveConfig,
    isSystemFrozen = false, // DEFAULT VALUE
}) => {
    // ADD THIS CONDITIONAL RENDERING AT THE START
    if (isSystemFrozen) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800">
                            Configuration Unavailable
                        </h3>
                        <button
                            onClick={() => { setShowConfigForm(false); setEditingConfig(null); }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="text-center py-6">
                            <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-amber-700 mb-2">
                                Configuration Management Frozen
                            </h3>
                            <p className="text-amber-600 mb-4">
                                Cannot create or edit configurations while the system is in frozen mode.
                            </p>
                            <p className="text-sm text-slate-500 mb-6">
                                The system is currently using <strong>End of Term Only</strong> calculation method
                                because QA1/QA2 scores have been entered but End of Term scores are not yet available.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800 mb-1">
                                            System will automatically unfreeze when:
                                        </p>
                                        <ul className="text-sm text-amber-700 space-y-1">
                                            <li>• End of Term scores are entered for all students</li>
                                            <li>• The system switches back to the default calculation method</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowConfigForm(false); setEditingConfig(null); }}
                                className="mt-6 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // KEEP THE REST OF THE ORIGINAL FORM CODE AS IS
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {editingConfig ? 'Edit Configuration' : 'New Grade Configuration'}
                    </h3>
                    <button
                        onClick={() => { setShowConfigForm(false); setEditingConfig(null); }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSaveConfig} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Configuration Name
                            </label>
                            <input
                                type="text"
                                value={configForm.configuration_name}
                                onChange={(e) => setConfigForm({ ...configForm, configuration_name: e.target.value })}
                                placeholder="e.g., Standard Weighting, End Term Focus, etc."
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Calculation Method
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                    <input
                                        type="radio"
                                        name="calculation_method"
                                        value="average_all"
                                        checked={configForm.calculation_method === 'average_all'}
                                        onChange={(e) => setConfigForm({ ...configForm, calculation_method: e.target.value as any })}
                                        className="w-4 h-4 text-indigo-600"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-800">Average of All Tests</p>
                                        <p className="text-sm text-slate-500">(QA1 + QA2 + End of Term) ÷ 3</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                    <input
                                        type="radio"
                                        name="calculation_method"
                                        value="end_of_term_only"
                                        checked={configForm.calculation_method === 'end_of_term_only'}
                                        onChange={(e) => setConfigForm({ ...configForm, calculation_method: e.target.value as any })}
                                        className="w-4 h-4 text-indigo-600"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-800">End of Term Only</p>
                                        <p className="text-sm text-slate-500">Use only the End of Term score</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                    <input
                                        type="radio"
                                        name="calculation_method"
                                        value="weighted_average"
                                        checked={configForm.calculation_method === 'weighted_average'}
                                        onChange={(e) => setConfigForm({ ...configForm, calculation_method: e.target.value as any })}
                                        className="w-4 h-4 text-indigo-600"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-800">Weighted Average</p>
                                        <p className="text-sm text-slate-500">Custom weights for each assessment</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {configForm.calculation_method === 'weighted_average' && (
                            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h4 className="font-medium text-slate-800">Set Weights (Must total 100%)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">QA1 %</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={configForm.weight_qa1}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value) || 0;
                                                setConfigForm({ ...configForm, weight_qa1: value });
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">QA2 %</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={configForm.weight_qa2}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value) || 0;
                                                setConfigForm({ ...configForm, weight_qa2: value });
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">End Term %</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={configForm.weight_end_of_term}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value) || 0;
                                                setConfigForm({ ...configForm, weight_end_of_term: value });
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="text-center pt-2">
                                    <p className={`text-sm font-medium ${configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term === 100
                                        ? 'text-emerald-600'
                                        : 'text-red-600'
                                        }`}>
                                        Total: {configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term}%
                                        {configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term !== 100 &&
                                            ' (Must equal 100%)'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="font-medium text-slate-800">Pass Mark Configuration</h4>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Minimum Pass Mark (0-100%)
                                </label>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={configForm.pass_mark}
                                        onChange={(e) => setConfigForm({
                                            ...configForm,
                                            pass_mark: parseInt(e.target.value)
                                        })}
                                        className="w-full"
                                    />
                                    <div className="w-20 flex-shrink-0">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={configForm.pass_mark}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                pass_mark: parseInt(e.target.value) || 50
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                        <span className="text-xs text-slate-500">%</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mt-2">
                                    Students scoring below {configForm.pass_mark}% will receive grade 'F'
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer with buttons - Fixed */}
                <div className="p-6 border-t border-slate-200 flex-shrink-0">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setShowConfigForm(false); setEditingConfig(null); }}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                configForm.calculation_method === 'weighted_average' &&
                                configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term !== 100
                            }
                            onClick={handleSaveConfig}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {editingConfig ? 'Update' : 'Save'} Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradeConfigForm;

// import React from 'react';
// import { Save, X } from 'lucide-react';
// import { GradeConfiguration } from '@/services/gradeConfigService';

// interface GradeConfigFormProps {
//     configForm: {
//         configuration_name: string;
//         calculation_method: 'average_all' | 'end_of_term_only' | 'weighted_average';
//         weight_qa1: number;
//         weight_qa2: number;
//         weight_end_of_term: number;
//         pass_mark: number;
//     };
//     editingConfig: GradeConfiguration | null;
//     setShowConfigForm: (show: boolean) => void;
//     setEditingConfig: (config: GradeConfiguration | null) => void;
//     setConfigForm: (form: {
//         configuration_name: string;
//         calculation_method: 'average_all' | 'end_of_term_only' | 'weighted_average';
//         weight_qa1: number;
//         weight_qa2: number;
//         weight_end_of_term: number;
//         pass_mark: number;
//     }) => void;
//     handleSaveConfig: (e: React.FormEvent) => Promise<void>;
// }

// const GradeConfigForm: React.FC<GradeConfigFormProps> = ({
//     configForm,
//     editingConfig,
//     setShowConfigForm,
//     setEditingConfig,
//     setConfigForm,
//     handleSaveConfig,
// }) => {
//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
//                 {/* Header - Fixed */}
//                 <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
//                     <h3 className="text-lg font-semibold text-slate-800">
//                         {editingConfig ? 'Edit Configuration' : 'New Grade Configuration'}
//                     </h3>
//                     <button
//                         onClick={() => { setShowConfigForm(false); setEditingConfig(null); }}
//                         className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                     >
//                         <X className="w-5 h-5 text-slate-500" />
//                     </button>
//                 </div>

//                 {/* Scrollable Form Content */}
//                 <div className="flex-1 overflow-y-auto">
//                     <form onSubmit={handleSaveConfig} className="p-6 space-y-6">
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-1">
//                                 Configuration Name
//                             </label>
//                             <input
//                                 type="text"
//                                 value={configForm.configuration_name}
//                                 onChange={(e) => setConfigForm({ ...configForm, configuration_name: e.target.value })}
//                                 placeholder="e.g., Standard Weighting, End Term Focus, etc."
//                                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-3">
//                                 Calculation Method
//                             </label>
//                             <div className="space-y-3">
//                                 <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-lg transition-colors">
//                                     <input
//                                         type="radio"
//                                         name="calculation_method"
//                                         value="average_all"
//                                         checked={configForm.calculation_method === 'average_all'}
//                                         onChange={(e) => setConfigForm({ ...configForm, calculation_method: e.target.value as any })}
//                                         className="w-4 h-4 text-indigo-600"
//                                     />
//                                     <div>
//                                         <p className="font-medium text-slate-800">Average of All Tests</p>
//                                         <p className="text-sm text-slate-500">(QA1 + QA2 + End of Term) ÷ 3</p>
//                                     </div>
//                                 </label>

//                                 <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-lg transition-colors">
//                                     <input
//                                         type="radio"
//                                         name="calculation_method"
//                                         value="end_of_term_only"
//                                         checked={configForm.calculation_method === 'end_of_term_only'}
//                                         onChange={(e) => setConfigForm({ ...configForm, calculation_method: e.target.value as any })}
//                                         className="w-4 h-4 text-indigo-600"
//                                     />
//                                     <div>
//                                         <p className="font-medium text-slate-800">End of Term Only</p>
//                                         <p className="text-sm text-slate-500">Use only the End of Term score</p>
//                                     </div>
//                                 </label>

//                                 <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-lg transition-colors">
//                                     <input
//                                         type="radio"
//                                         name="calculation_method"
//                                         value="weighted_average"
//                                         checked={configForm.calculation_method === 'weighted_average'}
//                                         onChange={(e) => setConfigForm({ ...configForm, calculation_method: e.target.value as any })}
//                                         className="w-4 h-4 text-indigo-600"
//                                     />
//                                     <div>
//                                         <p className="font-medium text-slate-800">Weighted Average</p>
//                                         <p className="text-sm text-slate-500">Custom weights for each assessment</p>
//                                     </div>
//                                 </label>
//                             </div>
//                         </div>

//                         {configForm.calculation_method === 'weighted_average' && (
//                             <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
//                                 <h4 className="font-medium text-slate-800">Set Weights (Must total 100%)</h4>
//                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-slate-700 mb-1">QA1 %</label>
//                                         <input
//                                             type="number"
//                                             min="0"
//                                             max="100"
//                                             value={configForm.weight_qa1}
//                                             onChange={(e) => {
//                                                 const value = parseInt(e.target.value) || 0;
//                                                 setConfigForm({ ...configForm, weight_qa1: value });
//                                             }}
//                                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-slate-700 mb-1">QA2 %</label>
//                                         <input
//                                             type="number"
//                                             min="0"
//                                             max="100"
//                                             value={configForm.weight_qa2}
//                                             onChange={(e) => {
//                                                 const value = parseInt(e.target.value) || 0;
//                                                 setConfigForm({ ...configForm, weight_qa2: value });
//                                             }}
//                                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-slate-700 mb-1">End Term %</label>
//                                         <input
//                                             type="number"
//                                             min="0"
//                                             max="100"
//                                             value={configForm.weight_end_of_term}
//                                             onChange={(e) => {
//                                                 const value = parseInt(e.target.value) || 0;
//                                                 setConfigForm({ ...configForm, weight_end_of_term: value });
//                                             }}
//                                             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                                         />
//                                     </div>
//                                 </div>
//                                 <div className="text-center pt-2">
//                                     <p className={`text-sm font-medium ${configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term === 100
//                                         ? 'text-emerald-600'
//                                         : 'text-red-600'
//                                         }`}>
//                                         Total: {configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term}%
//                                         {configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term !== 100 &&
//                                             ' (Must equal 100%)'}
//                                     </p>
//                                 </div>
//                             </div>
//                         )}

//                         <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
//                             <h4 className="font-medium text-slate-800">Pass Mark Configuration</h4>
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                                     Minimum Pass Mark (0-100%)
//                                 </label>
//                                 <div className="flex flex-col sm:flex-row items-center gap-4">
//                                     <input
//                                         type="range"
//                                         min="0"
//                                         max="100"
//                                         step="5"
//                                         value={configForm.pass_mark}
//                                         onChange={(e) => setConfigForm({
//                                             ...configForm,
//                                             pass_mark: parseInt(e.target.value)
//                                         })}
//                                         className="w-full"
//                                     />
//                                     <div className="w-20 flex-shrink-0">
//                                         <input
//                                             type="number"
//                                             min="0"
//                                             max="100"
//                                             value={configForm.pass_mark}
//                                             onChange={(e) => setConfigForm({
//                                                 ...configForm,
//                                                 pass_mark: parseInt(e.target.value) || 50
//                                             })}
//                                             className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                                         />
//                                         <span className="text-xs text-slate-500">%</span>
//                                     </div>
//                                 </div>
//                                 <p className="text-sm text-slate-600 mt-2">
//                                     Students scoring below {configForm.pass_mark}% will receive grade 'F'
//                                 </p>
//                             </div>
//                         </div>
//                     </form>
//                 </div>

//                 {/* Footer with buttons - Fixed */}
//                 <div className="p-6 border-t border-slate-200 flex-shrink-0">
//                     <div className="flex gap-3">
//                         <button
//                             type="button"
//                             onClick={() => { setShowConfigForm(false); setEditingConfig(null); }}
//                             className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={
//                                 configForm.calculation_method === 'weighted_average' &&
//                                 configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term !== 100
//                             }
//                             onClick={handleSaveConfig}
//                             className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
//                         >
//                             <Save className="w-4 h-4" />
//                             {editingConfig ? 'Update' : 'Save'} Configuration
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default GradeConfigForm;


// import React from 'react';
// import { Save, X } from 'lucide-react';
// import { GradeConfiguration } from '@/services/gradeConfigService';

// interface GradeConfigFormProps {
//     configForm: {
//         configuration_name: string;
//         calculation_method: 'average_all' | 'end_of_term_only' | 'weighted_average';
//         weight_qa1: number;
//         weight_qa2: number;
//         weight_end_of_term: number;
//         pass_mark: number;
//     };
//     editingConfig: GradeConfiguration | null;
//     setShowConfigForm: (show: boolean) => void;
//     setEditingConfig: (config: GradeConfiguration | null) => void;
//     setConfigForm: (form: {
//         configuration_name: string;
//         calculation_method: 'average_all' | 'end_of_term_only' | 'weighted_average';
//         weight_qa1: number;
//         weight_qa2: number;
//         weight_end_of_term: number;
//         pass_mark: number;
//     }) => void;
//     handleSaveConfig: (e: React.FormEvent) => Promise<void>;
// }

// const GradeConfigForm: React.FC<GradeConfigFormProps> = ({
//     configForm,
//     editingConfig,
//     setShowConfigForm,
//     setEditingConfig,
//     setConfigForm,
//     handleSaveConfig,
// }) => {
//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
//                 <div className="flex items-center justify-between mb-6">
//                     <h3 className="text-lg font-semibold text-slate-800">
//                         {editingConfig ? 'Edit Configuration' : 'New Grade Configuration'}
//                     </h3>
//                     <button
//                         onClick={() => { setShowConfigForm(false); setEditingConfig(null); }}
//                         className="p-2 hover:bg-slate-100 rounded-lg"
//                     >
//                         <X className="w-5 h-5 text-slate-500" />
//                     </button>
//                 </div>

//                 <form onSubmit={handleSaveConfig} className="space-y-4">
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-1">Configuration Name</label>
//                         <input
//                             type="text"
//                             value={configForm.configuration_name}
//                             onChange={(e) => setConfigForm({ ...configForm, configuration_name: e.target.value })}
//                             placeholder="e.g., Standard Weighting, End Term Focus, etc."
//                             className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-3">Calculation Method</label>
//                         <div className="space-y-3">
//                             <label className="flex items-center gap-3 cursor-pointer">
//                                 <input
//                                     type="radio"
//                                     name="calculation_method"
//                                     value="average_all"
//                                     checked={configForm.calculation_method === 'average_all'}
//                                     onChange={(e) => setConfigForm({ ...configForm, calculation_method: e.target.value as any })}
//                                     className="w-4 h-4 text-indigo-600"
//                                 />
//                                 <div>
//                                     <p className="font-medium text-slate-800">Average of All Tests</p>
//                                     <p className="text-sm text-slate-500">(QA1 + QA2 + End of Term) ÷ 3</p>
//                                 </div>
//                             </label>

//                             <label className="flex items-center gap-3 cursor-pointer">
//                                 <input
//                                     type="radio"
//                                     name="calculation_method"
//                                     value="end_of_term_only"
//                                     checked={configForm.calculation_method === 'end_of_term_only'}
//                                     onChange={(e) => setConfigForm({ ...configForm, calculation_method: e.target.value as any })}
//                                     className="w-4 h-4 text-indigo-600"
//                                 />
//                                 <div>
//                                     <p className="font-medium text-slate-800">End of Term Only</p>
//                                     <p className="text-sm text-slate-500">Use only the End of Term score</p>
//                                 </div>
//                             </label>

//                             <label className="flex items-center gap-3 cursor-pointer">
//                                 <input
//                                     type="radio"
//                                     name="calculation_method"
//                                     value="weighted_average"
//                                     checked={configForm.calculation_method === 'weighted_average'}
//                                     onChange={(e) => setConfigForm({ ...configForm, calculation_method: e.target.value as any })}
//                                     className="w-4 h-4 text-indigo-600"
//                                 />
//                                 <div>
//                                     <p className="font-medium text-slate-800">Weighted Average</p>
//                                     <p className="text-sm text-slate-500">Custom weights for each assessment</p>
//                                 </div>
//                             </label>
//                         </div>
//                     </div>

//                     {configForm.calculation_method === 'weighted_average' && (
//                         <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
//                             <h4 className="font-medium text-slate-800">Set Weights (Must total 100%)</h4>
//                             <div className="grid grid-cols-3 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">QA1 %</label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         max="100"
//                                         value={configForm.weight_qa1}
//                                         onChange={(e) => {
//                                             const value = parseInt(e.target.value) || 0;
//                                             setConfigForm({ ...configForm, weight_qa1: value });
//                                         }}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">QA2 %</label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         max="100"
//                                         value={configForm.weight_qa2}
//                                         onChange={(e) => {
//                                             const value = parseInt(e.target.value) || 0;
//                                             setConfigForm({ ...configForm, weight_qa2: value });
//                                         }}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1">End Term %</label>
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         max="100"
//                                         value={configForm.weight_end_of_term}
//                                         onChange={(e) => {
//                                             const value = parseInt(e.target.value) || 0;
//                                             setConfigForm({ ...configForm, weight_end_of_term: value });
//                                         }}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="text-center">
//                                 <p className={`text-sm font-medium ${configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term === 100
//                                     ? 'text-emerald-600'
//                                     : 'text-red-600'
//                                     }`}>
//                                     Total: {configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term}%
//                                     {configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term !== 100 &&
//                                         ' (Must equal 100%)'}
//                                 </p>
//                             </div>
//                         </div>
//                     )}

//                     <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
//                         <h4 className="font-medium text-slate-800">Pass Mark Configuration</h4>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">
//                                 Minimum Pass Mark (0-100%)
//                             </label>
//                             <div className="flex items-center gap-4">
//                                 <input
//                                     type="range"
//                                     min="0"
//                                     max="100"
//                                     step="5"
//                                     value={configForm.pass_mark}
//                                     onChange={(e) => setConfigForm({
//                                         ...configForm,
//                                         pass_mark: parseInt(e.target.value)
//                                     })}
//                                     className="flex-1"
//                                 />
//                                 <div className="w-20">
//                                     <input
//                                         type="number"
//                                         min="0"
//                                         max="100"
//                                         value={configForm.pass_mark}
//                                         onChange={(e) => setConfigForm({
//                                             ...configForm,
//                                             pass_mark: parseInt(e.target.value) || 50
//                                         })}
//                                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                                     />
//                                     <span className="text-xs text-slate-500">%</span>
//                                 </div>
//                             </div>
//                             <p className="text-sm text-slate-600 mt-2">
//                                 Students scoring below {configForm.pass_mark}% will receive grade 'F'
//                             </p>
//                         </div>
//                     </div>

//                     <div className="flex gap-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={() => { setShowConfigForm(false); setEditingConfig(null); }}
//                             className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={
//                                 configForm.calculation_method === 'weighted_average' &&
//                                 configForm.weight_qa1 + configForm.weight_qa2 + configForm.weight_end_of_term !== 100
//                             }
//                             className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
//                         >
//                             <Save className="w-4 h-4" />
//                             {editingConfig ? 'Update' : 'Save'} Configuration
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default GradeConfigForm;