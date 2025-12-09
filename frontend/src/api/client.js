import axios from 'axios';
import {
    MOCK_MODE,
    mockUsers,
    mockPendingUsers,
    mockApprovedUsers,
    mockTodayLocations,
    mockTodayStatus,
    mockDailyReport,
    mockMonthlyReport,
    mockTodaySummary,
    mockOfficeSettings
} from './mockData';

// Production: use env variable, Dev: proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// Helper to create mock response
const mockResponse = (data, delay = 300) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data });
        }, delay);
    });
};

// Get current mock user based on localStorage
const getCurrentMockUser = () => {
    const userType = localStorage.getItem('mockUserType') || 'admin';
    return mockUsers[userType];
};

export default client;

// Auth API
export const authAPI = MOCK_MODE ? {
    login: (telegramId, username, fullName) => {
        const userType = localStorage.getItem('mockUserType') || 'admin';
        return mockResponse({
            access_token: 'mock-token-' + Date.now(),
            token_type: 'bearer',
            user: mockUsers[userType]
        });
    },
    getMe: () => mockResponse(getCurrentMockUser()),
    getStatus: () => {
        const user = getCurrentMockUser();
        return mockResponse({
            is_approved: user.is_approved,
            is_admin: user.is_admin,
            is_active: user.is_active,
            message: user.is_approved ? "Tasdiqlangan" : "Tasdiqlanmagan"
        });
    },
} : {
    login: (telegramId, username, fullName) =>
        client.post('/auth/telegram', {
            telegram_id: telegramId,
            username,
            full_name: fullName,
        }),
    getMe: () => client.get('/auth/me'),
    getStatus: () => client.get('/auth/status'),
};

// Users API (Admin)
export const usersAPI = MOCK_MODE ? {
    getPending: () => mockResponse(mockPendingUsers),
    getApproved: () => mockResponse(mockApprovedUsers),
    getAll: () => mockResponse([...mockPendingUsers, ...mockApprovedUsers]),
    approve: (userId, workStartHour, workEndHour) => {
        const user = mockPendingUsers.find(u => u.id === userId);
        if (user) {
            user.is_approved = true;
            user.work_start_hour = workStartHour;
            user.work_end_hour = workEndHour;
        }
        return mockResponse(user || { message: "Tasdiqlandi" });
    },
    reject: (userId) => mockResponse({ message: "O'chirildi" }),
    revoke: (userId) => mockResponse({ message: "Bekor qilindi" }),
    updateWorkHours: (userId, workStartHour, workEndHour) => {
        const user = mockApprovedUsers.find(u => u.id === userId);
        if (user) {
            user.work_start_hour = workStartHour;
            user.work_end_hour = workEndHour;
        }
        return mockResponse(user);
    },
    getUser: (userId) => {
        const user = [...mockPendingUsers, ...mockApprovedUsers].find(u => u.id === userId);
        return mockResponse(user);
    },
} : {
    getPending: () => client.get('/users/pending'),
    getApproved: () => client.get('/users/approved'),
    getAll: () => client.get('/users/all'),
    approve: (userId, workStartHour, workEndHour) =>
        client.post(`/users/${userId}/approve`, {
            work_start_hour: workStartHour,
            work_end_hour: workEndHour,
        }),
    reject: (userId) => client.post(`/users/${userId}/reject`),
    revoke: (userId) => client.post(`/users/${userId}/revoke`),
    updateWorkHours: (userId, workStartHour, workEndHour) =>
        client.put(`/users/${userId}/work-hours`, {
            work_start_hour: workStartHour,
            work_end_hour: workEndHour,
        }),
    getUser: (userId) => client.get(`/users/${userId}`),
};

// Locations API
export const locationsAPI = MOCK_MODE ? {
    send: (latitude, longitude) => mockResponse({
        id: "loc-new",
        latitude,
        longitude,
        distance: Math.floor(Math.random() * 50),
        is_valid: true,
        timestamp: new Date().toISOString()
    }),
    getToday: () => mockResponse(mockTodayLocations),
    getStatus: () => mockResponse(mockTodayStatus),
    getHistory: (dateStr) => mockResponse(mockTodayLocations),
} : {
    send: (latitude, longitude) =>
        client.post('/locations/send', { latitude, longitude }),
    getToday: () => client.get('/locations/today'),
    getStatus: () => client.get('/locations/status'),
    getHistory: (dateStr) => client.get(`/locations/history/${dateStr}`),
};

// Reports API
export const reportsAPI = MOCK_MODE ? {
    getDaily: (dateStr) => mockResponse(mockDailyReport),
    getRange: (startDate, endDate) => mockResponse(mockMonthlyReport),
    getMonthly: (year, month) => mockResponse(mockMonthlyReport),
    adminGetUserDaily: (userId, dateStr) => mockResponse(mockDailyReport),
    adminGetUserRange: (userId, startDate, endDate) => mockResponse(mockMonthlyReport),
    adminGetTodaySummary: () => mockResponse(mockTodaySummary),
} : {
    getDaily: (dateStr) =>
        client.get('/reports/daily', { params: { date_str: dateStr } }),
    getRange: (startDate, endDate) =>
        client.get('/reports/range', { params: { start_date: startDate, end_date: endDate } }),
    getMonthly: (year, month) =>
        client.get('/reports/monthly', { params: { year, month } }),
    adminGetUserDaily: (userId, dateStr) =>
        client.get(`/reports/admin/user/${userId}/daily`, { params: { date_str: dateStr } }),
    adminGetUserRange: (userId, startDate, endDate) =>
        client.get(`/reports/admin/user/${userId}/range`, {
            params: { start_date: startDate, end_date: endDate },
        }),
    adminGetTodaySummary: () => client.get('/reports/admin/today-summary'),
};

// Settings API
export const settingsAPI = MOCK_MODE ? {
    getOffice: () => mockResponse(mockOfficeSettings),
    updateOfficeLocation: (latitude, longitude, radius) => {
        mockOfficeSettings.office_location = { latitude, longitude, radius };
        mockOfficeSettings.use_area_mode = false;
        return mockResponse({ message: "Yangilandi", mode: "circle" });
    },
    updateOfficeArea: (point1Lat, point1Lng, point2Lat, point2Lng) => {
        mockOfficeSettings.office_area = {
            point1_lat: point1Lat,
            point1_lng: point1Lng,
            point2_lat: point2Lat,
            point2_lng: point2Lng
        };
        mockOfficeSettings.use_area_mode = true;
        return mockResponse({ message: "Yangilandi", mode: "area" });
    },
    updateInterval: (minutes, gracePeriod) => {
        mockOfficeSettings.location_interval_minutes = minutes;
        mockOfficeSettings.grace_period_minutes = gracePeriod;
        return mockResponse({ message: "Yangilandi", minutes, grace_period: gracePeriod });
    },
} : {
    getOffice: () => client.get('/settings/office'),
    updateOfficeLocation: (latitude, longitude, radius) =>
        client.put('/settings/office/location', { latitude, longitude, radius }),
    updateOfficeArea: (point1Lat, point1Lng, point2Lat, point2Lng) =>
        client.put('/settings/office/area', {
            point1_lat: point1Lat,
            point1_lng: point1Lng,
            point2_lat: point2Lat,
            point2_lng: point2Lng,
        }),
    updateInterval: (minutes, gracePeriod) =>
        client.put('/settings/interval', { minutes, grace_period: gracePeriod }),
};
