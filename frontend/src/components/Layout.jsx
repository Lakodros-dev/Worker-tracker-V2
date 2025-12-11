import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, FileText, LogOut, User, Settings, Menu, X, Home, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
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
        { path: '/', label: 'Bosh sahifa', icon: Home },
        { path: '/reports', label: 'Hisobotlar', icon: FileText },
    ];

    return (
        <div className="min-h-screen animated-bg">
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
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
                                    <p className="text-xs text-gray-400">Lokatsiya monitoring</p>
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
                            Menu
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
                                            <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                            <span className="font-medium">{label}</span>
                                        </Link>
                                    </li>
                                );
                            })}

                            {user?.is_admin && (
                                <li className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-indigo-400 hover:bg-indigo-500/20 transition-all duration-300 group"
                                    >
                                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                        <span className="font-medium">Admin Panel</span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between px-4 py-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white truncate max-w-[140px]">
                                        {user?.full_name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Online
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

            {/* Header */}
            <header className="sticky top-0 z-30 header-glass">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg font-bold gradient-text">HR-Tracker</h1>
                                    <p className="text-xs text-gray-400">Lokatsiya monitoring</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {user?.is_admin && (
                                <Link
                                    to="/admin"
                                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-all duration-300 border border-indigo-500/30"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="text-sm font-medium">Admin</span>
                                </Link>
                            )}

                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
                            >
                                {user?.full_name?.charAt(0) || 'U'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
                <div className="animate-fade-in">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 header-glass border-t border-white/10 px-4 py-3 z-30">
                <div className="flex justify-around">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${location.pathname === path
                                    ? 'text-indigo-400'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${location.pathname === path ? 'scale-110' : ''} transition-transform`} />
                            <span className="text-xs font-medium">{label}</span>
                        </Link>
                    ))}
                    {user?.is_admin && (
                        <Link
                            to="/admin"
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-500 hover:text-gray-300 transition-all"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="text-xs font-medium">Admin</span>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Bottom Padding for Mobile Nav */}
            <div className="sm:hidden h-20"></div>
        </div>
    );
}