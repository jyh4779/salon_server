import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import axios from 'axios'; // Removed unused import
import { UserDTO } from '../api/user'; // Assuming UserDTO exists or define here
// We need to use the client instance we are about to create, but creating circular dependency might be tricky.
// Usually AuthContext uses API functions.
import { api, login as apiLogin, logout as apiLogout, setAccessToken, setOnUnauthorized } from '../api/client';

interface AuthContextType {
    user: UserDTO | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module-level variable to deduplicate concurrent refresh requests (e.g. React StrictMode)
let globalRefreshPromise: Promise<any> | null = null;

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
                // Deduplication logic: If a refresh is already in flight, reuse it.
                if (!globalRefreshPromise) {
                    globalRefreshPromise = api.post('/auth/refresh')
                        .finally(() => {
                            // Keep the promise for a short while or clear immediately? 
                            // Clearing immediately depends on timing. 
                            // Better to let it resolve, then clear it later or just let it be GC'd if we don't need persistent promise.
                            // Ideally, we clear it so future manual refreshes act normally.
                            setTimeout(() => { globalRefreshPromise = null; }, 1000);
                        });
                }

                // Let's call refresh directly to check if valid cookie exists.
                const response = await globalRefreshPromise;

                // If success, we get accessToken and user. If null, we are not logged in.
                if (response.data && response.data.accessToken) {
                    console.log('[AuthContext] Session restored. User:', response.data.user.email);
                    const { accessToken, user } = response.data;
                    setAccessToken(accessToken);
                    setUser(user);
                } else {
                    // 200 OK but null token -> Not logged in
                    console.log('[AuthContext] Session check returned 200 but null token.');
                }
            } catch (error: any) {
                // Network error or other issues
                console.log('[AuthContext] Session check skipped or failed.', error.response?.status);
            } finally {
                setIsLoading(false);
            }
        };

        // Call immediately without timeout to ensure deduplication works vs StrictMode
        initAuth();

        // Register global logout handler for API 401s
        setOnUnauthorized(() => {
            console.log('[AuthContext] Session expired (401). Logging out.');
            setUser(null);
            setAccessToken(null);
        });

        return () => { };
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
