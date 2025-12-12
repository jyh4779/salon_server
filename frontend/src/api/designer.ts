import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface DesignerDTO {
    designer_id: string; // BigInt -> string
    user_id: string;
    USERS: {
        name: string;
    };
    intro_text?: string;
    profile_img?: string;
}

export const getDesigners = async (shopId: number = 1): Promise<DesignerDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/designers`, {
        params: { shop_id: shopId }
    });
    return response.data;
};
