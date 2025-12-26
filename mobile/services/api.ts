import axios from 'axios';
import { Platform } from 'react-native';

// For Android Emulator, use 10.0.2.2. For iOS/Web, localhost.
// If using specific IP for physical device, need env var.
const BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/app'
    : 'http://localhost:3000/api/app';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
});

export const GalleryApi = {
    getRecent: async () => {
        const response = await api.get('/gallery/recent');
        return response.data;
    }
};

export default api;
