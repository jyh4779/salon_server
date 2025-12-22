import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies
});

let accessToken: string | null = null;

// Callback to notify AuthContext of logout
let onUnauthorized: () => void = () => { };

export const setOnUnauthorized = (callback: () => void) => {
    onUnauthorized = callback;
};

// Deduplication Promise
let refreshPromise: Promise<any> | null = null;

export const refreshSession = async () => {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = api.post('/auth/refresh')
        .finally(() => {
            // Clear promise after short delay to allow concurrent requests to share it
            setTimeout(() => { refreshPromise = null; }, 1000);
        });

    return refreshPromise;
};

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

// Request Interceptor: Inject Token
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        // DEBUG: Log Request
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Silent Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loop
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
            originalRequest._retry = true;

            try {
                // Call Refresh Endpoint with Deduplication
                const response = await refreshSession();

                if (response.data && response.data.accessToken) {
                    setAccessToken(response.data.accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed (Session expired)
                // Refresh failed (Session expired)
                setAccessToken(null);
                onUnauthorized();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Auth Helper Functions
export const login = async (email: string, pass: string) => {
    const response = await api.post('/auth/login', { email, password: pass });
    if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
    }
    return response.data;
};

export const logout = async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
};

export default api;
