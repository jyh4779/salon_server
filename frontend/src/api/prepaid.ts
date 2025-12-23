import { api } from './client';

export interface PrepaidTicket {
    ticket_id: number; // BigInt from backend comes as string or number depending on config, but usually safe to assume number for IDs < 2^53
    shop_id: number;
    name: string;
    price: number;
    credit_amount: number;
    validity_days?: number;
    is_active: boolean;
    created_at?: string;
}

export interface CreateTicketRequest {
    name: string;
    price: number; // Selling price
    credit_amount: number; // Actual value
    validity_days?: number;
}

export interface PrepaidBalance {
    balance: number;
    lastUsed: string | null;
}

export interface ChargePrepaidRequest {
    ticketId?: number;
    amount?: number;
    bonusAmount?: number;
    paymentMethod?: 'CARD' | 'CASH';
}

export const getPrepaidTickets = async (shopId: number): Promise<PrepaidTicket[]> => {
    const response = await api.get(`/shops/${shopId}/prepaid-tickets`);
    return response.data;
};

export const createPrepaidTicket = async (shopId: number, data: CreateTicketRequest): Promise<PrepaidTicket> => {
    const response = await api.post(`/shops/${shopId}/prepaid-tickets`, data);
    return response.data;
};

export const getCustomerPrepaidBalance = async (shopId: number, userId: number): Promise<PrepaidBalance> => {
    const response = await api.get(`/shops/${shopId}/customers/${userId}/prepaid`);
    return response.data;
};

export const chargePrepaid = async (shopId: number, userId: number, data: ChargePrepaidRequest): Promise<void> => {
    await api.post(`/shops/${shopId}/customers/${userId}/prepaid/charge`, data);
};
