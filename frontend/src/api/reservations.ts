import { api } from './client';
import { ReservationDTO, GetReservationsParams, CreateReservationDTO } from '../types/reservation';

// Base URL is handled by api client instance

export const getReservations = async (params: GetReservationsParams): Promise<ReservationDTO[]> => {
    const response = await api.get('/reservations', {
        params,
    });
    return response.data;
};

export const createReservation = async (data: CreateReservationDTO): Promise<any> => {
    const response = await api.post('/reservations', data);
    return response.data;
};

export const getReservation = async (id: string): Promise<ReservationDTO> => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
};

export const updateReservation = async (id: string, data: Partial<CreateReservationDTO>): Promise<any> => {
    const response = await api.patch(`/reservations/${id}`, data);
    return response.data;
};

export interface CompleteReservationData {
    totalPrice: number;
    paymentType: string;
    paymentMemo?: string;
}

export const completeReservation = async (id: string, data: CompleteReservationData): Promise<void> => {
    await api.post(`/reservations/${id}/complete`, data);
};

export const deleteReservation = async (id: string): Promise<void> => {
    await api.delete(`/reservations/${id}`);
};
