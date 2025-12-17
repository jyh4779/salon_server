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

export const getCustomers = async (search?: string) => {
    const params = search ? { search } : {};
    const response = await axios.get<CustomerStats[]>(`${API_BASE_URL}/customers`, { params });
    return response.data;
};
