import { useState, useEffect } from 'react';
import { usersAPI } from '../../api/client';
import { UserPlus, UserMinus, Clock, Check, X, Edit2 } from 'lucide-react';

export default function AdminUsers() {
    const [tab, setTab] = useState('pending');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvalModal, setApprovalModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [workHours, setWorkHours] = useState({ start: 9, end: 18 });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const [pendingRes, approvedRes] = await Promise.all([
                usersAPI.getPending(),
                usersAPI.getApproved(),
            ]);
            setPendingUsers(pendingRes.data);
            setApprovedUsers(approvedRes.data);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!approvalModal) return;
        try {
            await usersAPI.approve(approvalModal.id, workHours.start, workHours.end);
            setApprovalModal(null);
            setWorkHours({ start: 9, end: 18 });
            loadUsers();
        } catch (err) {
            alert(err.response?.data?.detail || 'Xatolik yuz berdi');
        }
    };

    const handleReject = async (userId) => {
        if (!confirm('Rostdan ham rad etmoqchimisiz?')) return;
        try {
            await usersAPI.reject(userId);
            loadUsers();
        } catch (err) {
            alert(err.response?.data?.detail || 'Xatolik yuz berdi');
        }
    };

    const handleRevoke = async (userId) => {
        if (!confirm('Rostdan ham ruxsatni bekor qilmoqchimisiz?')) return;
        try {
            await usersAPI.revoke(userId);
            loadUsers();
        } catch (err) {
            alert(err.response?.data?.detail || 'Xatolik yuz berdi');
        }
    };

    const handleUpdateWorkHours = async () => {
        if (!editModal) return;
        try {
            await usersAPI.updateWorkHours(editModal.id, workHours.start, workHours.end);
            setEditModal(null);
            setWorkHours({ start: 9, end: 18 });
            loadUsers();
        } catch (err) {
            alert(err.response?.data?.detail || 'Xatolik yuz berdi');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Hodimlarni boshqarish</h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setTab('pending')}
                    className={`pb-3 px-1 border-b-2 transition-colors ${tab === 'pending'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Kutish ro'yxati ({pendingUsers.length})
                </button>
                <button
                    onClick={() => setTab('approved')}
                    className={`pb-3 px-1 border-b-2 transition-colors ${tab === 'approved'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Tasdiqlangan ({approvedUsers.length})
                </button>
            </div>

            {/* Pending Users */}
            {tab === 'pending' && (
                <div className="bg-white rounded-xl shadow-sm">
                    {pendingUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Kutish ro'yxati bo'sh</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {pendingUsers.map((user) => (
                                <div key={user.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{user.full_name}</p>
                                        <p className="text-sm text-gray-500">
                                            @{user.username || 'username yo\'q'} • ID: {user.telegram_id}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(user.created_at).toLocaleString('uz')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setApprovalModal(user);
                                                setWorkHours({ start: 9, end: 18 });
                                            }}
                                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            <Check className="w-4 h-4" />
                                            Tasdiqlash
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.id)}
                                            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                            Rad etish
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Approved Users */}
            {tab === 'approved' && (
                <div className="bg-white rounded-xl shadow-sm">
                    {approvedUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <UserMinus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Tasdiqlangan hodimlar yo'q</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {approvedUsers.map((user) => (
                                <div key={user.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{user.full_name}</p>
                                        <p className="text-sm text-gray-500">
                                            @{user.username || 'username yo\'q'} • ID: {user.telegram_id}
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Ish vaqti: {user.work_start_hour}:00 - {user.work_end_hour}:00
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditModal(user);
                                                setWorkHours({ start: user.work_start_hour, end: user.work_end_hour });
                                            }}
                                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Tahrirlash
                                        </button>
                                        <button
                                            onClick={() => handleRevoke(user.id)}
                                            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                            Ruxsatni bekor qilish
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Approval Modal */}
            {approvalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Hodimni tasdiqlash</h3>
                        <p className="text-gray-600 mb-4">
                            <strong>{approvalModal.full_name}</strong> uchun ish vaqtini belgilang:
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Boshlanish
                                </label>
                                <select
                                    value={workHours.start}
                                    onChange={(e) => setWorkHours({ ...workHours, start: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i}:00</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tugash
                                </label>
                                <select
                                    value={workHours.end}
                                    onChange={(e) => setWorkHours({ ...workHours, end: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i}:00</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setApprovalModal(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleApprove}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Tasdiqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Ish vaqtini tahrirlash</h3>
                        <p className="text-gray-600 mb-4">
                            <strong>{editModal.full_name}</strong>
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Boshlanish
                                </label>
                                <select
                                    value={workHours.start}
                                    onChange={(e) => setWorkHours({ ...workHours, start: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i}:00</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tugash
                                </label>
                                <select
                                    value={workHours.end}
                                    onChange={(e) => setWorkHours({ ...workHours, end: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i}:00</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditModal(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleUpdateWorkHours}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Saqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
