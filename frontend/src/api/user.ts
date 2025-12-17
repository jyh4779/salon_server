import axios from 'axios';
import { UserDTO, CreateUserDTO } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export type { UserDTO };

export const searchUsers = async (query: string): Promise<UserDTO[]> => {
    if (!query) return [];

    const response = await axios.get(`${API_BASE_URL}/users`, {
        params: { search: query }
    });
    return response.data;
};

export const createUser = async (data: CreateUserDTO): Promise<UserDTO> => {
    const response = await axios.post(`${API_BASE_URL}/users`, data);
    return response.data;
};
