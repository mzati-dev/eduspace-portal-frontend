import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
    onBack: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onBack }) => {
    return (
        <header className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
                            <p className="text-xs text-slate-500">Manage Classes, Students, Subjects, Results & Grade Configuration</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;