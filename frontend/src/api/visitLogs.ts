import { api } from './client';

export interface CreateVisitLogDTO {
    customer_id: number;
    reservation_id: number;
    designer_id: number;
    admin_memo?: string;
    photo_urls?: string[];
}

export interface VisitLogDTO extends Omit<CreateVisitLogDTO, 'customer_id' | 'reservation_id' | 'designer_id'> {
    log_id: string;
    customer_id: string;
    reservation_id: string;
    designer_id: string;
    visited_at: string;
    menu_names?: string[];
    categories?: string[];
}

export const createVisitLog = async (shopId: number, data: CreateVisitLogDTO): Promise<VisitLogDTO> => {
    const response = await api.post(`/shops/${shopId}/visit-logs`, data);
    return response.data;
};

export const getVisitLogByReservation = async (shopId: number, reservationId: number): Promise<VisitLogDTO> => {
    const response = await api.get(`/shops/${shopId}/visit-logs/reservation/${reservationId}`);
    return response.data;
};

export const getVisitLogsByCustomer = async (shopId: number, customerId: number, page: number = 1, limit: number = 9): Promise<{ data: VisitLogDTO[], total: number }> => {
    const response = await api.get(`/shops/${shopId}/visit-logs/customer/${customerId}`, {
        params: { page, limit }
    });
    return response.data;
};
