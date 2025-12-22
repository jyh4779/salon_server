import { api } from './client';
import { UserDTO, CreateUserDTO } from '../types/user';


export type { UserDTO };

export const searchUsers = async (query: string): Promise<UserDTO[]> => {
    if (!query) return [];

    const response = await api.get('/users', {
        params: { search: query }
    });
    return response.data;
};

export const createUser = async (data: CreateUserDTO): Promise<UserDTO> => {
    const response = await api.post('/users', data);
    return response.data;
};
