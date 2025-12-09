import { useState, useEffect } from 'react';
import { reportsAPI } from '../api/client';
import { Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export default function Reports() {
    const [reportType, setReportType] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadReport();
    }, [reportType, selectedDate, selectedMonth]);

    const loadReport = async () => {
        setLoading(true);
        setError('');

        try {
            if (reportType === 'daily') {
                const res = await reportsAPI.getDaily(selectedDate);
                setReport(res.data);
            } else {
                const [year, month] = selectedMonth.split('-').map(Number);
                const res = await reportsAPI.getMonthly(year, month);
                setReport(res.data);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Hisobotni yuklashda xatolik');
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hisobot turi
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="daily">Kunlik</option>
                            <option value="monthly">Oylik</option>
                        </select>
                    </div>

                    {reportType === 'daily' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sana
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Oy
                            </label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Daily Report */}
            {!loading && reportType === 'daily' && report && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {format(new Date(selectedDate), 'dd.MM.yyyy')} - Kunlik hisobot
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600">Jami ish soati</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {report.total_work_hours?.toFixed(1)} soat
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600">Ofisda</p>
                            <p className="text-2xl font-bold text-green-900">
                                {report.present_hours?.toFixed(1)} soat
                            </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                            <p className="text-sm text-red-600">Yo'qlik</p>
                            <p className="text-2xl font-bold text-red-900">
                                {report.absent_hours?.toFixed(1)} soat
                            </p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm text-yellow-600">Kechikish</p>
                            <p className="text-2xl font-bold text-yellow-900">
                                {report.late_minutes || 0} daqiqa
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Kelgan vaqt</p>
                                <p className="font-medium">
                                    {report.work_start_time
                                        ? format(new Date(report.work_start_time), 'HH:mm')
                                        : '-'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Ketgan vaqt</p>
                                <p className="font-medium">
                                    {report.work_end_time
                                        ? format(new Date(report.work_end_time), 'HH:mm')
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Report */}
            {!loading && reportType === 'monthly' && report && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Oylik xulosa</h2>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Ish kunlari</p>
                                <p className="text-2xl font-bold">{report.total_days}</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-blue-600">Jami soat</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {report.total_work_hours?.toFixed(1)}
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-green-600">Ofisda</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {report.total_present_hours?.toFixed(1)}
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4">
                                <p className="text-sm text-red-600">Yo'qlik</p>
                                <p className="text-2xl font-bold text-red-900">
                                    {report.total_absent_hours?.toFixed(1)}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <p className="text-sm text-purple-600">Samaradorlik</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {report.efficiency_percent?.toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Daily Details */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Kunlik tafsilot</h2>

                        {report.daily_details?.length === 0 ? (
                            <p className="text-gray-500">Bu oyda ma'lumot yo'q</p>
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
                                                <td className="py-3 px-4">
                                                    {format(new Date(day.date), 'dd.MM.yyyy')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {day.work_start_time
                                                        ? format(new Date(day.work_start_time), 'HH:mm')
                                                        : '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {day.work_end_time
                                                        ? format(new Date(day.work_end_time), 'HH:mm')
                                                        : '-'}
                                                </td>
                                                <td className="py-3 px-4">{day.total_work_hours?.toFixed(1)} soat</td>
                                                <td className="py-3 px-4">{day.present_hours?.toFixed(1)} soat</td>
                                                <td className="py-3 px-4">
                                                    {day.late_minutes > 0 ? (
                                                        <span className="text-red-600">{day.late_minutes} daqiqa</span>
                                                    ) : (
                                                        <span className="text-green-600">-</span>
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
            )}

            {/* No Data */}
            {!loading && !report && !error && (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Bu sana uchun ma'lumot yo'q</p>
                </div>
            )}
        </div>
    );
}
