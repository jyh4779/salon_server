import { api } from './client';


export interface ShopDTO {
    shop_id: number;
    owner_id: number;
    name: string;
    tel?: string;
    address?: string;
    settlement_bank?: string;
    settlement_account?: string;
    open_time?: string; // HH:mm
    close_time?: string;
    closed_days?: string; // "Mon,Tue"
    created_at?: string;
}

export const getShop = async (id: number = 1): Promise<ShopDTO> => {
    const response = await api.get(`/shops/${id}`);
    return response.data;
};

export const updateShop = async (id: number = 1, data: Partial<ShopDTO>): Promise<ShopDTO> => {
    const response = await api.patch(`/shops/${id}`, data);
    return response.data;
};
