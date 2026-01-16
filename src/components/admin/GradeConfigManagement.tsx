import React from 'react';
import { Plus, Settings, Edit2 } from 'lucide-react';
import { GradeConfiguration } from '@/services/gradeConfigService';
import GradeConfigForm from './forms/GradeConfigForm';

interface GradeConfigManagementProps {
    gradeConfigs: GradeConfiguration[];
    activeConfig: GradeConfiguration | null;
    showConfigForm: boolean;
    editingConfig: GradeConfiguration | null;
    configForm: {
        configuration_name: string;
        calculation_method: 'average_all' | 'end_of_term_only' | 'weighted_average';
        weight_qa1: number;
        weight_qa2: number;
        weight_end_of_term: number;
        pass_mark: number;
    };
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
    handleActivateConfig: (id: string) => Promise<void>;
    startEditConfig: (config: GradeConfiguration) => void;
    loadData: () => Promise<void>;
}

const GradeConfigManagement: React.FC<GradeConfigManagementProps> = ({
    gradeConfigs,
    activeConfig,
    showConfigForm,
    editingConfig,
    configForm,
    setShowConfigForm,
    setEditingConfig,
    setConfigForm,
    handleSaveConfig,
    handleActivateConfig,
    startEditConfig,
    loadData,
}) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Grade Calculation Configuration</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Configure how final grades are calculated for report cards
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowConfigForm(true);
                        setEditingConfig(null);
                        // setConfigForm({
                        //     configuration_name: '',
                        //     calculation_method: 'weighted_average',
                        //     weight_qa1: 30,
                        //     weight_qa2: 30,
                        //     weight_end_of_term: 40,
                        //     pass_mark: 50,
                        // });
                        setConfigForm({
                            configuration_name: '',
                            calculation_method: 'end_of_term_only',  // ← Change from 'weighted_average'
                            weight_qa1: 0,  // Optional: set to 0
                            weight_qa2: 0,  // Optional: set to 0
                            weight_end_of_term: 100,  // Optional: set to 100
                            pass_mark: 50,
                        });
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Configuration
                </button>
            </div>

            {activeConfig && (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                                    Active
                                </span>
                                <h3 className="text-lg font-semibold text-emerald-800">{activeConfig.configuration_name}</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-emerald-700">
                                    <span className="font-medium">Method:</span>{' '}
                                    {activeConfig.calculation_method === 'average_all' && 'Average of All Tests'}
                                    {activeConfig.calculation_method === 'end_of_term_only' && 'End of Term Only'}
                                    {activeConfig.calculation_method === 'weighted_average' && 'Weighted Average'}
                                </p>
                                {activeConfig.calculation_method === 'weighted_average' && (
                                    <div className="flex gap-6 text-sm text-emerald-700">
                                        <div><span className="font-medium">QA1:</span> {activeConfig.weight_qa1}%</div>
                                        <div><span className="font-medium">QA2:</span> {activeConfig.weight_qa2}%</div>
                                        <div><span className="font-medium">End Term:</span> {activeConfig.weight_end_of_term}%</div>
                                    </div>
                                )}
                                <p className="text-xs text-emerald-600">
                                    <span className="font-medium">Total Weight:</span> {activeConfig.weight_qa1 + activeConfig.weight_qa2 + activeConfig.weight_end_of_term}%
                                </p>
                                <p className="text-sm text-emerald-700">
                                    <span className="font-medium">Pass Mark:</span> {activeConfig.pass_mark || 50}%
                                </p>
                            </div>
                        </div>
                        <Settings className="w-8 h-8 text-emerald-600" />
                    </div>
                </div>
            )}

            {(showConfigForm || editingConfig) && (
                <GradeConfigForm
                    configForm={configForm}
                    editingConfig={editingConfig}
                    setShowConfigForm={setShowConfigForm}
                    setEditingConfig={setEditingConfig}
                    setConfigForm={setConfigForm}
                    handleSaveConfig={handleSaveConfig}
                />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">All Configurations</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Select a configuration to make it active for all report cards
                    </p>
                </div>
                <div className="divide-y divide-slate-100">
                    {gradeConfigs.map((config) => (
                        <div key={config.id} className="p-6 hover:bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold text-slate-800">{config.configuration_name}</h4>
                                        {config.is_active && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium">Method:</span>{' '}
                                            {config.calculation_method === 'average_all' && 'Average of All Tests'}
                                            {config.calculation_method === 'end_of_term_only' && 'End of Term Only'}
                                            {config.calculation_method === 'weighted_average' && 'Weighted Average'}
                                        </p>
                                        {config.calculation_method === 'weighted_average' && (
                                            <div className="flex gap-6 text-sm text-slate-600">
                                                <div><span className="font-medium">QA1:</span> {config.weight_qa1}%</div>
                                                <div><span className="font-medium">QA2:</span> {config.weight_qa2}%</div>
                                                <div><span className="font-medium">End Term:</span> {config.weight_end_of_term}%</div>
                                            </div>
                                        )}
                                        <p className="text-xs text-slate-500">
                                            Created: {new Date(config.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!config.is_active && (
                                        <button
                                            onClick={() => handleActivateConfig(config.id)}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
                                        >
                                            Activate
                                        </button>
                                    )}
                                    <button
                                        onClick={() => startEditConfig(config)}
                                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {gradeConfigs.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No configurations found. Create your first grade calculation configuration.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GradeConfigManagement;