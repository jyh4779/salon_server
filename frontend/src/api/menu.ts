import axios from 'axios';

import { API_BASE_URL } from '../constants/config';


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
