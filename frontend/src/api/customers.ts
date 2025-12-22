import { api } from './client';


export interface CustomerStats {
    id: number;
    name: string;
    phone: string;
    gender: string;
    grade: string;
    created_at: string;
    visit_count: number;
    last_visit: string | null;
    total_pay: number;
    memo: string;
}

export const getCustomers = async (shopId: number, search?: string): Promise<CustomerStats[]> => {
    const response = await api.get(`/shops/${shopId}/customers`, {
        params: { search }
    });
    return response.data;
};

export interface CustomerDetail extends CustomerStats {
    history: {
        id: number;
        date: string;
        status: string;
        menus: string;
        price: number;
        designer: string;
    }[];
    memos: {
        id: number;
        content: string;
        created_at: string;
        type: 'RESERVATION' | 'GENERAL';
        source_id: number | null;
    }[];
}

export const getCustomer = async (shopId: number, id: number): Promise<CustomerDetail> => {
    const response = await api.get(`/shops/${shopId}/customers/${id}`);
    return response.data;
};

export const createMemo = async (shopId: number, id: number, content: string): Promise<void> => {
    await api.post(`/shops/${shopId}/customers/${id}/memos`, { content });
};
