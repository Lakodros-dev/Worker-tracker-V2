import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, FileText, Settings, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Hodimlar', icon: Users },
        { path: '/admin/reports', label: 'Hisobotlar', icon: FileText },
        { path: '/admin/settings', label: 'Sozlamalar', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
                <div className="p-4 border-b border-gray-700">
                    <h1 className="text-xl font-bold">HR-Tracker</h1>
                    <p className="text-sm text-gray-400">Admin Panel</p>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <li key={path}>
                                <Link
                                    to={path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === path
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Asosiy saytga
                    </Link>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{user?.full_name}</span>
                        <button
                            onClick={logout}
                            className="text-red-400 hover:text-red-300"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-6">
                <Outlet />
            </main>
        </div>
    );
}
