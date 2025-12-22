import { api } from './client';


export interface DesignerDTO {
    designer_id: string; // BigInt -> string
    user_id: string;
    USERS: {
        name: string;
        phone?: string;
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

export const getDesigners = async (shopId: number = 1): Promise<DesignerDTO[]> => {
    const response = await api.get(`/designers`, {
        params: { shop_id: shopId }
    });
    return response.data;
};

export const updateDesigner = async (id: number, data: Partial<DesignerDTO>): Promise<DesignerDTO> => {
    const response = await api.patch(`/designers/${id}`, data);
    return response.data;
};

export const createDesigner = async (shopId: number, data: { name: string; phone: string; intro_text?: string; profile_img?: string }): Promise<DesignerDTO> => {
    const response = await api.post(`/designers`, data, {
        params: { shop_id: shopId }
    });
    return response.data;
};
