import { api } from './client';
import { ReservationDTO, GetReservationsParams, CreateReservationDTO } from '../types/reservation';

// Base URL is handled by api client instance

export const getReservations = async (shopId: number, params: GetReservationsParams): Promise<ReservationDTO[]> => {
    const response = await api.get(`/shops/${shopId}/reservations`, {
        params,
    });
    return response.data;
};

export const createReservation = async (shopId: number, data: CreateReservationDTO): Promise<any> => {
    const response = await api.post(`/shops/${shopId}/reservations`, data);
    return response.data;
};

export const getReservation = async (shopId: number, id: string): Promise<ReservationDTO> => {
    const response = await api.get(`/shops/${shopId}/reservations/${id}`);
    return response.data;
};

export const updateReservation = async (shopId: number, id: string, data: Partial<CreateReservationDTO>): Promise<any> => {
    const response = await api.patch(`/shops/${shopId}/reservations/${id}`, data);
    return response.data;
};

export interface CompleteReservationData {
    totalPrice: number;
    payments: { paymentType: string; amount: number }[];
    paymentMemo?: string;
}

export const completeReservation = async (shopId: number, id: string, data: CompleteReservationData): Promise<void> => {
    await api.post(`/shops/${shopId}/reservations/${id}/complete`, data);
};

export const deleteReservation = async (shopId: number, id: string): Promise<void> => {
    await api.delete(`/shops/${shopId}/reservations/${id}`);
};
