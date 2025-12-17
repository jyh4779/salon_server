import axios from 'axios';

import { API_BASE_URL } from '../constants/config';


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

export const getCustomers = async (search?: string): Promise<CustomerStats[]> => {
    const response = await axios.get(`${API_BASE_URL}/customers`, {
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

export const getCustomer = async (id: number): Promise<CustomerDetail> => {
    const response = await axios.get(`${API_BASE_URL}/customers/${id}`);
    return response.data;
};

export const createMemo = async (id: number, content: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/customers/${id}/memos`, { content });
};
