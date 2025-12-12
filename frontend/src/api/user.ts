import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface UserDTO {
    user_id: string; // BigInt -> string
    name: string;
    phone: string;
}

export const searchUsers = async (query: string): Promise<UserDTO[]> => {
    if (!query) return [];

    const response = await axios.get(`${API_BASE_URL}/users`, {
        params: { search: query }
    });
    return response.data;
};
