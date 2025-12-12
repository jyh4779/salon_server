import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface MenuDTO {
    menu_id: string; // BigInt -> string
    name: string;
    price: number;
    duration: number;
    description?: string;
}

export const getMenus = async (shopId: number = 1): Promise<MenuDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/menus`, {
        params: { shop_id: shopId }
    });
    return response.data;
};
