import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Pending from './pages/Pending';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// Layout
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Mock User Switcher Component
function MockUserSwitcher() {
    const { isMockMode, switchMockUser, user } = useAuth();
    const navigate = useNavigate();

    if (!isMockMode) return null;

    const handleSwitch = (type) => {
        const newUser = switchMockUser(type);
        if (newUser.is_admin) {
            navigate('/admin');
        } else {
            navigate('/');
        }
        window.location.reload();
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-yellow-100 border border-yellow-400 rounded-lg p-3 shadow-lg">
            <p className="text-xs text-yellow-800 mb-2 font-medium">🔧 Demo Mode</p>
            <div className="flex gap-2">
                <button
                    onClick={() => handleSwitch('admin')}
                    className={`px-3 py-1 text-xs rounded ${user?.is_admin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Admin
                </button>
                <button
                    onClick={() => handleSwitch('employee')}
                    className={`px-3 py-1 text-xs rounded ${!user?.is_admin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Hodim
                </button>
            </div>
        </div>
    );
}

// Token handler - automatically login with token from URL
function TokenHandler({ children }) {
    const [searchParams] = useSearchParams();
    const { loginWithToken, user, loading, isMockMode } = useAuth();
    const navigate = useNavigate();
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        // Skip token processing in mock mode
        if (isMockMode) return;

        const token = searchParams.get('token');
        if (token && !processed) {
            setProcessed(true);
            loginWithToken(token).then((loggedUser) => {
                window.history.replaceState({}, '', window.location.pathname);

                if (loggedUser) {
                    if (!loggedUser.is_approved) {
                        navigate('/pending');
                    } else if (loggedUser.is_admin) {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                }
            }).catch(() => {
                window.history.replaceState({}, '', window.location.pathname);
            });
        }
    }, [searchParams, loginWithToken, processed, navigate, isMockMode]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return children;
}


function ProtectedRoute({ children, requireApproval = true, requireAdmin = false }) {
    const { user, loading, isMockMode } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // In mock mode, always allow access
    if (isMockMode && user) {
        if (requireAdmin && !user.is_admin) {
            return <Navigate to="/" replace />;
        }
        return children;
    }

    if (!user) {
        return <NoAccess />;
    }

    if (requireAdmin && !user.is_admin) {
        return <Navigate to="/" replace />;
    }

    if (requireApproval && !user.is_approved) {
        return <Navigate to="/pending" replace />;
    }

    return children;
}

// No access page - tells user to use Telegram bot
function NoAccess() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">HR-Tracker V2</h1>
                <p className="text-gray-600 mb-6">
                    Tizimga kirish uchun Telegram botdan foydalaning
                </p>

                <a
                    href="https://t.me/your_hr_tracker_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.094.034.31.019.478z" />
                    </svg>
                    Telegram Botga O'tish
                </a>

                <p className="mt-4 text-sm text-gray-500">
                    Bot orqali /start bosing va saytga avtomatik kirasiz
                </p>
            </div>
        </div>
    );
}

function AppRoutes() {
    const { user, isMockMode } = useAuth();

    return (
        <TokenHandler>
            <Routes>
                {/* Pending page */}
                <Route path="/pending" element={
                    user ? (user.is_approved ? <Navigate to={user.is_admin ? "/admin" : "/"} replace /> : <Pending />) : <NoAccess />
                } />

                {/* Employee Routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="reports" element={<Reports />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute requireAdmin>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={user ? <Navigate to={user.is_admin ? "/admin" : "/"} replace /> : <NoAccess />} />
            </Routes>
            <MockUserSwitcher />
        </TokenHandler>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
