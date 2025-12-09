import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, RefreshCw } from 'lucide-react';

export default function Pending() {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.is_approved) {
            navigate(user.is_admin ? '/admin' : '/');
        }
    }, [user, navigate]);

    const handleRefresh = async () => {
        try {
            const updatedUser = await refreshUser();
            if (updatedUser.is_approved) {
                navigate(updatedUser.is_admin ? '/admin' : '/');
            }
        } catch (error) {
            // User will be logged out automatically
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-yellow-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Tasdiqlash kutilmoqda
                </h1>

                <p className="text-gray-600 mb-6">
                    Sizning so'rovingiz adminga yuborildi.
                    <br />
                    Admin tasdiqlashini kuting.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600">
                        <strong>Ism:</strong> {user?.full_name}
                        <br />
                        <strong>Username:</strong> @{user?.username || 'yo\'q'}
                        <br />
                        <strong>Telegram ID:</strong> {user?.telegram_id}
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleRefresh}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Holatni tekshirish
                    </button>

                    <button
                        onClick={logout}
                        className="w-full text-gray-600 py-2 hover:text-gray-900 transition-colors"
                    >
                        Chiqish
                    </button>
                </div>
            </div>
        </div>
    );
}
