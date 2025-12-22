export type UserGender = 'MALE' | 'FEMALE';

export interface UserDTO {
    user_id: number;
    name: string;
    phone: string;
    email?: string;
    role?: 'OWNER' | 'DESIGNER' | 'CUSTOMER' | 'ADMIN';
    gender?: UserGender;
    birthdate?: string;
    profile_img?: string;
    grade?: string;
}

export interface CreateUserDTO {
    name: string;
    phone: string;
    gender?: UserGender;
    birthdate?: string;
    memo?: string;
}
