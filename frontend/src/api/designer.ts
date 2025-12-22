import { api } from './client';


export interface DesignerDTO {
    designer_id: string; // BigInt -> string
    user_id: string;
    USERS: {
        name: string;
        phone: string; // Made required based on typical usage, check DTO
    };
    intro_text?: string;
    profile_img?: string;
    work_start?: string; // HH:mm
    work_end?: string;
    lunch_start?: string;
    lunch_end?: string;
    day_off?: string; // "Mon,Tue"
    is_active?: boolean;
}

export const getDesigners = async (shopId: number): Promise<DesignerDTO[]> => {
    const response = await api.get(`/shops/${shopId}/designers`);
    return response.data;
};

export const createDesigner = async (shopId: number, data: Partial<DesignerDTO>): Promise<DesignerDTO> => {
    const response = await api.post(`/shops/${shopId}/designers`, data);
    return response.data;
};

export const updateDesigner = async (shopId: number, id: number, data: Partial<DesignerDTO>): Promise<DesignerDTO> => {
    const response = await api.patch(`/shops/${shopId}/designers/${id}`, data);
    return response.data;
};
