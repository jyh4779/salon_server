import api from './client';

export interface MenuDTO {
    menu_id: string; // BigInt -> string
    category?: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
    thumbnail_url?: string;
    is_deleted?: boolean;
    type?: 'MENU' | 'CATEGORY';
    sort_order?: number;
}

export const getMenus = async (shopId: number): Promise<MenuDTO[]> => {
    const response = await api.get(`/shops/${shopId}/menus`);
    return response.data;
};

export const createMenu = async (shopId: number, data: Partial<MenuDTO>): Promise<MenuDTO> => {
    const response = await api.post(`/shops/${shopId}/menus`, data);
    return response.data;
};

export const updateMenu = async (shopId: number, id: number, data: Partial<MenuDTO>): Promise<MenuDTO> => {
    const response = await api.patch(`/shops/${shopId}/menus/${id}`, data);
    return response.data;
};

export const deleteMenu = async (shopId: number, id: number): Promise<void> => {
    await api.delete(`/shops/${shopId}/menus/${id}`);
};
