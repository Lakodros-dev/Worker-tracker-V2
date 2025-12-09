import { useState, useEffect } from 'react';
import { usersAPI, reportsAPI } from '../../api/client';
import { Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReports() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await usersAPI.getApproved();
            setUsers(res.data);
        } catch (err) {
            console.error('Error loading users:', err);
        }
    };

    const loadReport = async () => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            const res = await reportsAPI.adminGetUserRange(selectedUser, startDate, endDate);
            setReport(res.data);
        } catch (err) {
            console.error('Error loading report:', err);
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    const selectedUserData = users.find(u => u.id === selectedUser);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Hodimlar hisoboti</h1>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hodim</label>
                        <select
                            value={selectedUser || ''}
                            onChange={(e) => setSelectedUser(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Tanlang...</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.full_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Boshlanish</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tugash</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={loadReport}
                            disabled={!selectedUser || loading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Yuklanmoqda...' : 'Hisobotni ko\'rish'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Report */}
            {report && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {selectedUserData?.full_name} - Hisobot
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Ish kunlari</p>
                                <p className="text-2xl font-bold">{report.total_days}</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-blue-600">Jami soat</p>
                                <p className="text-2xl font-bold text-blue-900">{report.total_work_hours?.toFixed(1)}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-green-600">Ofisda</p>
                                <p className="text-2xl font-bold text-green-900">{report.total_present_hours?.toFixed(1)}</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4">
                                <p className="text-sm text-red-600">Yo'qlik</p>
                                <p className="text-2xl font-bold text-red-900">{report.total_absent_hours?.toFixed(1)}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <p className="text-sm text-purple-600">Samaradorlik</p>
                                <p className="text-2xl font-bold text-purple-900">{report.efficiency_percent?.toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Kunlik tafsilot</h3>
                        {report.daily_details?.length === 0 ? (
                            <p className="text-gray-500">Ma'lumot yo'q</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4">Sana</th>
                                            <th className="text-left py-3 px-4">Keldi</th>
                                            <th className="text-left py-3 px-4">Ketdi</th>
                                            <th className="text-left py-3 px-4">Ish soati</th>
                                            <th className="text-left py-3 px-4">Ofisda</th>
                                            <th className="text-left py-3 px-4">Kechikish</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.daily_details?.map((day) => (
                                            <tr key={day.date} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">{format(new Date(day.date), 'dd.MM.yyyy')}</td>
                                                <td className="py-3 px-4">
                                                    {day.work_start_time ? format(new Date(day.work_start_time), 'HH:mm') : '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {day.work_end_time ? format(new Date(day.work_end_time), 'HH:mm') : '-'}
                                                </td>
                                                <td className="py-3 px-4">{day.total_work_hours?.toFixed(1)} soat</td>
                                                <td className="py-3 px-4">{day.present_hours?.toFixed(1)} soat</td>
                                                <td className="py-3 px-4">
                                                    {day.late_minutes > 0 ? (
                                                        <span className="text-red-600">{day.late_minutes} daqiqa</span>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!report && !loading && (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Hodimni tanlang va hisobotni ko'ring</p>
                </div>
            )}
        </div>
    );
}
