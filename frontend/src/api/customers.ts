import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
