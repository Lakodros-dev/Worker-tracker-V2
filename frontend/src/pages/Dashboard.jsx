import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { locationsAPI, settingsAPI } from '../api/client';
import { MapPin, Clock, CheckCircle, XCircle, Send, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function Dashboard() {
    const { user } = useAuth();
    const [status, setStatus] = useState(null);
    const [locations, setLocations] = useState([]);
    const [officeSettings, setOfficeSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statusRes, locationsRes, settingsRes] = await Promise.all([
                locationsAPI.getStatus(),
                locationsAPI.getToday(),
                settingsAPI.getOffice(),
            ]);
            setStatus(statusRes.data);
            setLocations(locationsRes.data);
            setOfficeSettings(settingsRes.data);
        } catch (err) {
            setError('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const sendLocation = async () => {
        setError('');
        setSuccess('');
        setSending(true);

        if (!navigator.geolocation) {
            setError('Brauzeringiz geolokatsiyani qo\'llab-quvvatlamaydi');
            setSending(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await locationsAPI.send(
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    if (res.data.is_valid) {
                        setSuccess('✅ Lokatsiya qabul qilindi! Siz ofis hududidasiz.');
                    } else {
                        setSuccess(`⚠️ Lokatsiya qabul qilindi, lekin siz ofis hududida emassiz. Masofa: ${res.data.distance?.toFixed(0)}m`);
                    }

                    loadData();
                } catch (err) {
                    setError(err.response?.data?.detail || 'Lokatsiya yuborishda xatolik');
                } finally {
                    setSending(false);
                }
            },
            (err) => {
                setError('Lokatsiyani olishda xatolik: ' + err.message);
                setSending(false);
            },
            { enableHighAccuracy: true }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const now = new Date();
    const isWorkHours = now.getHours() >= user.work_start_hour && now.getHours() < user.work_end_hour;

    // Map center
    const mapCenter = officeSettings?.use_area_mode
        ? [
            (officeSettings.office_area.point1_lat + officeSettings.office_area.point2_lat) / 2,
            (officeSettings.office_area.point1_lng + officeSettings.office_area.point2_lng) / 2,
        ]
        : [officeSettings?.office_location?.latitude || 41.2995, officeSettings?.office_location?.longitude || 69.2401];

    return (
        <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${status?.is_currently_in_office ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            {status?.is_currently_in_office ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Hozirgi holat</p>
                            <p className="font-semibold">
                                {status?.is_currently_in_office ? 'Ofisda' : 'Ofisda emas'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Bugungi lokatsiyalar</p>
                            <p className="font-semibold">
                                {status?.locations_count || 0} ta ({status?.valid_locations || 0} to'g'ri)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ish vaqti</p>
                            <p className="font-semibold">
                                {user.work_start_hour}:00 - {user.work_end_hour}:00
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Send Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Lokatsiya yuborish</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-800">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-green-800">
                        {success}
                    </div>
                )}

                {!isWorkHours && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-yellow-800">
                        ⏰ Hozir ish vaqti emas. Sizning ish vaqtingiz: {user.work_start_hour}:00 - {user.work_end_hour}:00
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={sendLocation}
                        disabled={sending || !isWorkHours}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        {sending ? 'Yuborilmoqda...' : 'Lokatsiya yuborish'}
                    </button>

                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Yangilash
                    </button>
                </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Xarita</h2>
                <MapContainer center={mapCenter} zoom={16} className="rounded-lg">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />

                    {/* Office Area */}
                    {officeSettings?.use_area_mode ? (
                        <Rectangle
                            bounds={[
                                [officeSettings.office_area.point1_lat, officeSettings.office_area.point1_lng],
                                [officeSettings.office_area.point2_lat, officeSettings.office_area.point2_lng],
                            ]}
                            pathOptions={{ color: 'blue', fillOpacity: 0.2 }}
                        />
                    ) : (
                        <Circle
                            center={[officeSettings?.office_location?.latitude, officeSettings?.office_location?.longitude]}
                            radius={officeSettings?.office_location?.radius || 100}
                            pathOptions={{ color: 'blue', fillOpacity: 0.2 }}
                        />
                    )}

                    {/* User Locations */}
                    {locations.map((loc, idx) => (
                        <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                            <Popup>
                                <div className="text-sm">
                                    <p><strong>#{idx + 1}</strong></p>
                                    <p>{loc.is_valid ? '✅ Ofisda' : '❌ Tashqarida'}</p>
                                    <p>Masofa: {loc.distance?.toFixed(0)}m</p>
                                    <p>{new Date(loc.timestamp).toLocaleTimeString('uz')}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Today's Locations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Bugungi lokatsiyalar</h2>

                {locations.length === 0 ? (
                    <p className="text-gray-500">Bugun lokatsiya yuborilmagan</p>
                ) : (
                    <div className="space-y-2">
                        {locations.map((loc, idx) => (
                            <div
                                key={loc.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${loc.is_valid ? 'bg-green-50' : 'bg-red-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-500">#{idx + 1}</span>
                                    {loc.is_valid ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <span className="text-sm">
                                        {loc.is_valid ? 'Ofis ichida' : 'Ofis tashqarida'}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {loc.distance?.toFixed(0)}m • {new Date(loc.timestamp).toLocaleTimeString('uz')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
