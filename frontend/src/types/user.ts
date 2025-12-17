export type UserGender = 'MALE' | 'FEMALE';

export interface UserDTO {
    user_id: number;
    name: string;
    phone: string;
    gender?: UserGender;
    birthdate?: string;
}

export interface CreateUserDTO {
    name: string;
    phone: string;
    gender?: UserGender;
    birthdate?: string;
    memo?: string;
}
