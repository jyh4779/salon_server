import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ShopDTO {
    shop_id: number;
    owner_id: number;
    name: string;
    tel?: string;
    address?: string;
    settlement_bank?: string;
    settlement_account?: string;
    open_time?: string; // HH:mm:ss string from DB Time type
    close_time?: string;
    created_at?: string;
}

export const getShop = async (id: number = 1): Promise<ShopDTO> => {
    const response = await axios.get(`${API_BASE_URL}/shops/${id}`);
    console.log(`[Frontend] API getShop(${id}) response:`, response.data);
    return response.data;
};
