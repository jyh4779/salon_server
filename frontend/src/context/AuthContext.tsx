import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios'; // We will replace this with our custom client later, but for login call we need base logic
import { UserDTO } from '../api/user'; // Assuming UserDTO exists or define here
// We need to use the client instance we are about to create, but creating circular dependency might be tricky.
// Usually AuthContext uses API functions.
import { api, login as apiLogin, logout as apiLogout } from '../api/client';

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

    useEffect(() => {
        // App Start: Try to silent refresh to restore session
        const initAuth = async () => {
            try {
                // We attempt to call a protected route or a specific 'me' endpoint or just 'refresh'
                // Since our client interceptor handles 401->refresh, simply making a request to get user info 
                // or explicitly calling refresh endpoint is fine.
                // Let's call refresh directly to check if valid cookie exists.
                const response = await api.post('/auth/refresh');
                // If success, we get accessToken and user
                if (response.data && response.data.accessToken) {
                    // Access Token is handled by client interceptor/header injection? 
                    // No, usually we need to set it in client.defaults.headers or store in variable client can access.
                    // For this simple implementation, let's assume client.ts manages the token in a variable 
                    // provided via a setAccessToken function or similar.
                    // BUT strictly, let's keep it simple: 
                    // client.ts will export a `setAccessToken` function.

                    const { accessToken, user } = response.data;
                    // We need a way to pass token to client
                    // DO NOT import setAccessToken from client here directly if it causes circular dep.
                    // Better: Pass token to api function or use a callback.
                    // Let's assume we import `setAccessToken` from client.ts
                    // To avoid circular dependency, client.ts should not import AuthContext.
                    // AuthContext imports client.ts. This is fine. (Uni-directional)

                    require('../api/client').setAccessToken(accessToken);
                    setUser(user);
                }
            } catch (error) {
                // Not logged in or refresh failed
                console.log('Session restore failed, user needs to login.');
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
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
            require('../api/client').setAccessToken(null);
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
