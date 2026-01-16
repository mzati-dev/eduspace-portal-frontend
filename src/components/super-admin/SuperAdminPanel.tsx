// src/components/super-admin/SuperAdminPanel.tsx
import React from 'react';
import SchoolsManagement from './SchoolsManagement';
// import SchoolsManagement from '../admin/SchoolsManagement';

interface SuperAdminPanelProps {
    onBack: () => void;
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-100">
            {/* Super Admin Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                            <p className="text-purple-200">Developer Portal - Manage All Schools</p>
                        </div>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SchoolsManagement />
            </div>
        </div>
    );
};

export default SuperAdminPanel;