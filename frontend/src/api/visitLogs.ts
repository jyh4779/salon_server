import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

export interface CreateVisitLogDTO {
    customer_id: number;
    reservation_id: number;
    designer_id: number;
    admin_memo?: string;
    photo_urls?: string[];
}

export interface VisitLogDTO extends CreateVisitLogDTO {
    log_id: string;
    visited_at: string;
    menu_names?: string[];
}

export const createVisitLog = async (data: CreateVisitLogDTO): Promise<VisitLogDTO> => {
    const response = await axios.post(`${API_BASE_URL}/visit-logs`, data);
    return response.data;
};

export const getVisitLogByReservation = async (reservationId: number): Promise<VisitLogDTO | null> => {
    const response = await axios.get(`${API_BASE_URL}/visit-logs/reservation/${reservationId}`);
    return response.data || null;
};

export const getVisitLogsByCustomer = async (customerId: number): Promise<VisitLogDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/visit-logs/customer/${customerId}`);
    return response.data || [];
};
