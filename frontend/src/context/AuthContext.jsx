import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';
import { MOCK_MODE, mockUsers } from '../api/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock mode - auto login
        if (MOCK_MODE) {
            const userType = localStorage.getItem('mockUserType') || 'admin';
            const mockUser = mockUsers[userType];
            setUser(mockUser);
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');

        if (token) {
            authAPI.getMe()
                .then(res => {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Login with token from URL (from Telegram bot)
    const loginWithToken = async (token) => {
        try {
            localStorage.setItem('token', token);
            const res = await authAPI.getMe();
            const userData = res.data;

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            return userData;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            throw error;
        }
    };

    // Switch mock user type (for demo)
    const switchMockUser = (userType) => {
        if (MOCK_MODE) {
            localStorage.setItem('mockUserType', userType);
            const mockUser = mockUsers[userType];
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return mockUser;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('mockUserType');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await authAPI.getMe();
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            return res.data;
        } catch (error) {
            logout();
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithToken,
            logout,
            refreshUser,
            switchMockUser,
            isMockMode: MOCK_MODE
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
