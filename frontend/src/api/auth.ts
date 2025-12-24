import { api } from './client';

export const verifyPassword = async (password: string) => {
    const response = await api.post('/auth/verify-password', { password });
    return response.data;
};
