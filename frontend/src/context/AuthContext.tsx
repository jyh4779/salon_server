import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios'; // We will replace this with our custom client later, but for login call we need base logic
import { UserDTO } from '../api/user'; // Assuming UserDTO exists or define here
// We need to use the client instance we are about to create, but creating circular dependency might be tricky.
// Usually AuthContext uses API functions.
import { api, login as apiLogin, logout as apiLogout, setAccessToken } from '../api/client';

interface AuthContextType {
    user: UserDTO | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const initAuthCalled = React.useRef(false);

    useEffect(() => {
        // App Start: Try to silent refresh to restore session
        const initAuth = async () => {
            if (initAuthCalled.current) return;
            initAuthCalled.current = true;

            try {
                // Let's call refresh directly to check if valid cookie exists.
                const response = await api.post('/auth/refresh');

                // If success, we get accessToken and user. If null, we are not logged in.
                if (response.data && response.data.accessToken) {
                    const { accessToken, user } = response.data;
                    setAccessToken(accessToken);
                    setUser(user);
                } else {
                    // 200 OK but null token -> Not logged in
                    console.log('[DEBUG] Session check returned 200 but null token. Backend rejected reuse?');
                }
            } catch (error) {
                // Network error or other issues
                console.log('[DEBUG] Session check request failed (Network or 500).', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            initAuth();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const login = async (email: string, pass: string) => {
        const data = await apiLogin(email, pass);
        setUser(data.user);
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            setUser(null);
            setAccessToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
