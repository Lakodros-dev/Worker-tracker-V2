import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, FileText, LogOut, User, Settings } from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Bosh sahifa', icon: MapPin },
        { path: '/reports', label: 'Hisobotlar', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">HR-Tracker</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-5 h-5" />
                            <span className="text-sm">{user?.full_name}</span>
                        </div>

                        {user?.is_admin && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                                <Settings className="w-4 h-4" />
                                Admin
                            </Link>
                        )}

                        <button
                            onClick={logout}
                            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                            <LogOut className="w-4 h-4" />
                            Chiqish
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-6">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${location.pathname === path
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}
