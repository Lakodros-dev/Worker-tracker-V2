import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, usersAPI } from '../../api/client';
import { Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const [summary, setSummary] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [summaryRes, pendingRes] = await Promise.all([
                reportsAPI.adminGetTodaySummary(),
                usersAPI.getPending(),
            ]);
            setSummary(summaryRes.data);
            setPendingCount(pendingRes.data.length);
        } catch (err) {
            console.error('Error loading dashboard:', err);
        } finally {
            setLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Jami hodimlar</p>
                            <p className="text-2xl font-bold">{summary?.total_employees || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Bugun faol</p>
                            <p className="text-2xl font-bold">{summary?.employees_with_data || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Bugun faol emas</p>
                            <p className="text-2xl font-bold">
                                {(summary?.total_employees || 0) - (summary?.employees_with_data || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <Link to="/admin/users" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Kutish ro'yxati</p>
                            <p className="text-2xl font-bold">{pendingCount}</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Today's Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Bugungi holat - {summary?.date}</h2>
                    <button
                        onClick={loadData}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                        Yangilash
                    </button>
                </div>

                {summary?.employees?.length === 0 ? (
                    <p className="text-gray-500">Hodimlar yo'q</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Hodim</th>
                                    <th className="text-left py-3 px-4">Ish vaqti</th>
                                    <th className="text-left py-3 px-4">Lokatsiyalar</th>
                                    <th className="text-left py-3 px-4">Ofisda (soat)</th>
                                    <th className="text-left py-3 px-4">Kechikish</th>
                                    <th className="text-left py-3 px-4">Holat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary?.employees?.map((emp) => (
                                    <tr key={emp.user_id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium">{emp.full_name}</p>
                                                <p className="text-sm text-gray-500">@{emp.username}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm">{emp.work_hours}</td>
                                        <td className="py-3 px-4">
                                            {emp.locations_count} ({emp.valid_locations} to'g'ri)
                                        </td>
                                        <td className="py-3 px-4">{emp.present_hours?.toFixed(1) || 0}</td>
                                        <td className="py-3 px-4">
                                            {emp.late_minutes > 0 ? (
                                                <span className="text-red-600">{emp.late_minutes} daqiqa</span>
                                            ) : (
                                                <span className="text-green-600">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {emp.has_data ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Faol
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                                    <XCircle className="w-4 h-4" />
                                                    Faol emas
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
