import React from 'react';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
    onBack: () => void;

    // NEW (mobile): hamburger controls the sidebar drawer
    onMobileMenuClick?: () => void;
    isMobileMenuOpen?: boolean;

    // NEW (mobile/desktop): show school branding at top
    schoolName?: string;
    schoolInitial?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    onBack,
    onMobileMenuClick,
    isMobileMenuOpen = false,
    schoolName = 'School',
    schoolInitial = 'S'
}) => {

    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear any authentication tokens/data
        localStorage.clear(); // or localStorage.removeItem('token')
        sessionStorage.clear();

        // Redirect to login page
        navigate('/login');
    };
    return (
        <header className="bg-white shadow-sm border-b border-slate-200 relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* NEW (mobile): make space for the Logout button and keep it visible */}
                <div className="flex items-center justify-between gap-4 relative">
                    {/* NEW (mobile): hamburger + school branding at header top */}
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2 md:hidden">
                            <button
                                type="button"
                                onClick={onMobileMenuClick}
                                className="md:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                                aria-label={isMobileMenuOpen ? 'Close sidebar' : 'Open sidebar'}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5 text-slate-600" />
                                ) : (
                                    <Menu className="w-5 h-5 text-slate-600" />
                                )}
                            </button>

                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                    <span className="text-white font-bold text-lg">{schoolInitial}</span>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500 truncate">{schoolName}</p>
                                    {/* Keep the title below to meet "name/logo at the top of header" */}
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block text-center w-full">
                            <h1 className="text-xl font-bold text-indigo-600">{schoolName}</h1>
                            <p className="text-sm text-slate-500">Admin Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button className="relative p-2 hover:bg-slate-100 rounded-lg">
                                <Bell className="w-5 h-5 text-slate-600" />
                                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                            </button>
                        </div>

                        {/* Profile Button */}
                        <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold text-sm">A</span>
                            </div>
                            <span className="text-sm font-medium hidden sm:block">Admin</span>
                        </button>

                        {/* Logout Button */}
                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm whitespace-nowrap">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;