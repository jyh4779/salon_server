import axios from 'axios';

import { API_BASE_URL } from '../constants/config';


export interface MenuDTO {
    menu_id: string; // BigInt -> string
    category?: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
    is_deleted?: boolean;
    type?: 'MENU' | 'CATEGORY';
    sort_order?: number;
}

export const getMenus = async (shopId: number = 1): Promise<MenuDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/menus`, {
        params: { shop_id: shopId }
    });
    return response.data;
};

export const createMenu = async (shopId: number, data: Partial<MenuDTO>): Promise<MenuDTO> => {
    const response = await axios.post(`${API_BASE_URL}/menus`, data, {
        params: { shop_id: shopId }
    });
    return response.data;
};

export const updateMenu = async (id: number, data: Partial<MenuDTO>): Promise<MenuDTO> => {
    const response = await axios.patch(`${API_BASE_URL}/menus/${id}`, data);
    return response.data;
};

export const deleteMenu = async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/menus/${id}`);
};
