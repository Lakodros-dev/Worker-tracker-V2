import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    ArrowLeft,
    Menu,
    X,
    ChevronRight,
    Bell,
    Search,
    Sparkles
} from 'lucide-react';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Hodimlar', icon: Users },
        { path: '/admin/reports', label: 'Hisobotlar', icon: FileText },
        { path: '/admin/settings', label: 'Sozlamalar', icon: Settings },
    ];

    return (
        <div className="min-h-screen animated-bg">
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar - Always hidden by default, slides from left */}
            <aside className={`
                fixed top-0 left-0 h-full z-50
                w-80 max-w-[85vw]
                transform transition-all duration-300 ease-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full sidebar-glass flex flex-col">
                    {/* Logo Section */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold gradient-text">HR-Tracker</h1>
                                    <p className="text-xs text-gray-400">Admin Panel v2.0</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 transition-all duration-200 hover:rotate-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">
                            Asosiy
                        </p>
                        <ul className="space-y-2">
                            {navItems.map(({ path, label, icon: Icon }, index) => {
                                const isActive = location.pathname === path;
                                return (
                                    <li key={path} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-up">
                                        <Link
                                            to={path}
                                            className={`
                                                flex items-center gap-3 px-4 py-3.5 rounded-2xl
                                                transition-all duration-300 group relative overflow-hidden
                                                ${isActive
                                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                                }
                                            `}
                                        >
                                            {!isActive && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
                                            )}
                                            <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                            <span className="font-medium">{label}</span>
                                            {isActive && (
                                                <ChevronRight className="w-4 h-4 ml-auto animate-pulse" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-white/10 space-y-3">
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="font-medium">Asosiy sahifa</span>
                        </Link>

                        <div className="flex items-center justify-between px-4 py-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                    {user?.full_name?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white truncate max-w-[140px]">
                                        {user?.full_name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Administrator
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300"
                                title="Chiqish"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="min-h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-30 header-glass">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Page Title */}
                            <div className="hidden sm:block">
                                <h2 className="text-lg font-semibold text-white">
                                    {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                                </h2>
                                <p className="text-xs text-gray-400">Boshqaruv paneli</p>
                            </div>
                        </div>

                        {/* Mobile Title */}
                        <h2 className="text-lg font-semibold text-white sm:hidden">
                            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h2>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Search - Desktop */}
                            <div className="hidden md:flex items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Qidirish..."
                                        className="w-48 lg:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                            </button>

                            {/* User Avatar */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
                            >
                                {user?.full_name?.charAt(0) || 'A'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}