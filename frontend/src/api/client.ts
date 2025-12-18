import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

// Request Interceptor: Inject Token
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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
                // Call Refresh Endpoint
                // We use a separate instance implies we don't want to loop interceptors? 
                // But /refresh endpoint should not require Access Token generally (verified by cookie)
                // However, the interceptor above injects invalid token if present.
                // It's safer to use the same api instance but ensuring /refresh doesn't 401 itself in a way that triggers this loop? 
                // If /refresh 401s, it rejects.

                const response = await api.post('/auth/refresh');

                if (response.data && response.data.accessToken) {
                    setAccessToken(response.data.accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed (Session expired)
                setAccessToken(null);
                // Optionally redirect to login or let the error propagate
                // The AuthContext will likely catch this when initial loader fails or subsequent calls fail
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
