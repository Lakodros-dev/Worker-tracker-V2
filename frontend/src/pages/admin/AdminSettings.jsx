import { useState, useEffect } from 'react';
import { settingsAPI } from '../../api/client';
import { MapPin, Clock, Save, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Rectangle, Circle, useMapEvents } from 'react-leaflet';

function LocationPicker({ mode, onSelect }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng);
        },
    });
    return null;
}

export default function AdminSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState('circle');

    // Circle mode
    const [circleCenter, setCircleCenter] = useState({ lat: 41.2995, lng: 69.2401 });
    const [radius, setRadius] = useState(100);

    // Area mode
    const [point1, setPoint1] = useState({ lat: 41.2995, lng: 69.2401 });
    const [point2, setPoint2] = useState({ lat: 41.3005, lng: 69.2411 });
    const [selectingPoint, setSelectingPoint] = useState(null);

    // Interval
    const [interval, setInterval] = useState(30);
    const [gracePeriod, setGracePeriod] = useState(5);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await settingsAPI.getOffice();
            const data = res.data;
            setSettings(data);
            setMode(data.use_area_mode ? 'area' : 'circle');

            if (data.office_location) {
                setCircleCenter({ lat: data.office_location.latitude, lng: data.office_location.longitude });
                setRadius(data.office_location.radius);
            }
            if (data.office_area) {
                setPoint1({ lat: data.office_area.point1_lat, lng: data.office_area.point1_lng });
                setPoint2({ lat: data.office_area.point2_lat, lng: data.office_area.point2_lng });
            }
            setInterval(data.location_interval_minutes);
            setGracePeriod(data.grace_period_minutes);
        } catch (err) {
            console.error('Error loading settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMapClick = (latlng) => {
        if (mode === 'circle') {
            setCircleCenter({ lat: latlng.lat, lng: latlng.lng });
        } else if (selectingPoint === 1) {
            setPoint1({ lat: latlng.lat, lng: latlng.lng });
            setSelectingPoint(2);
        } else if (selectingPoint === 2) {
            setPoint2({ lat: latlng.lat, lng: latlng.lng });
            setSelectingPoint(null);
        }
    };

    const saveOfficeLocation = async () => {
        setSaving(true);
        try {
            if (mode === 'circle') {
                await settingsAPI.updateOfficeLocation(circleCenter.lat, circleCenter.lng, radius);
            } else {
                await settingsAPI.updateOfficeArea(point1.lat, point1.lng, point2.lat, point2.lng);
            }
            alert('Ofis joyi saqlandi!');
            loadSettings();
        } catch (err) {
            alert(err.response?.data?.detail || 'Xatolik yuz berdi');
        } finally {
            setSaving(false);
        }
    };

    const saveInterval = async () => {
        setSaving(true);
        try {
            await settingsAPI.updateInterval(interval, gracePeriod);
            alert('Interval saqlandi!');
        } catch (err) {
            alert(err.response?.data?.detail || 'Xatolik yuz berdi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const mapCenter = mode === 'circle'
        ? [circleCenter.lat, circleCenter.lng]
        : [(point1.lat + point2.lat) / 2, (point1.lng + point2.lng) / 2];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>

            {/* Office Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Ofis joyi
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejim</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                value="circle"
                                checked={mode === 'circle'}
                                onChange={() => setMode('circle')}
                            />
                            Doira (nuqta + radius)
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                value="area"
                                checked={mode === 'area'}
                                onChange={() => setMode('area')}
                            />
                            To'rtburchak (2 nuqta)
                        </label>
                    </div>
                </div>

                {mode === 'circle' && (
                    <div className="mb-4 grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={circleCenter.lat}
                                onChange={(e) => setCircleCenter({ ...circleCenter, lat: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={circleCenter.lng}
                                onChange={(e) => setCircleCenter({ ...circleCenter, lng: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Radius (metr)</label>
                            <input
                                type="number"
                                value={radius}
                                onChange={(e) => setRadius(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                )}

                {mode === 'area' && (
                    <div className="mb-4">
                        <div className="flex gap-4 mb-2">
                            <button
                                onClick={() => setSelectingPoint(1)}
                                className={`px-4 py-2 rounded-lg ${selectingPoint === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                            >
                                1-nuqtani tanlash
                            </button>
                            <button
                                onClick={() => setSelectingPoint(2)}
                                className={`px-4 py-2 rounded-lg ${selectingPoint === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                            >
                                2-nuqtani tanlash
                            </button>
                        </div>
                        <p className="text-sm text-gray-500">
                            1-nuqta: {point1.lat.toFixed(6)}, {point1.lng.toFixed(6)} |
                            2-nuqta: {point2.lat.toFixed(6)}, {point2.lng.toFixed(6)}
                        </p>
                    </div>
                )}

                <div className="mb-4">
                    <MapContainer center={mapCenter} zoom={16} className="rounded-lg" style={{ height: '400px' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker mode={mode} onSelect={handleMapClick} />
                        {mode === 'circle' ? (
                            <Circle center={[circleCenter.lat, circleCenter.lng]} radius={radius} pathOptions={{ color: 'blue' }} />
                        ) : (
                            <Rectangle bounds={[[point1.lat, point1.lng], [point2.lat, point2.lng]]} pathOptions={{ color: 'blue' }} />
                        )}
                    </MapContainer>
                </div>

                <button
                    onClick={saveOfficeLocation}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saqlanmoqda...' : 'Ofis joyini saqlash'}
                </button>
            </div>

            {/* Interval Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Lokatsiya oralig'i
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Interval (daqiqa)
                        </label>
                        <select
                            value={interval}
                            onChange={(e) => setInterval(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            {[15, 30, 45, 60, 90, 120].map((v) => (
                                <option key={v} value={v}>{v} daqiqa</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grace period (daqiqa)
                        </label>
                        <select
                            value={gracePeriod}
                            onChange={(e) => setGracePeriod(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            {[5, 10, 15, 20, 30].map((v) => (
                                <option key={v} value={v}>{v} daqiqa</option>
                            ))}
                        </select>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                    Hodimlar har {interval} daqiqada lokatsiya yuborishlari kerak.
                    {gracePeriod} daqiqa kechikish ruxsat etiladi.
                </p>

                <button
                    onClick={saveInterval}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saqlanmoqda...' : 'Intervalni saqlash'}
                </button>
            </div>
        </div>
    );
}
