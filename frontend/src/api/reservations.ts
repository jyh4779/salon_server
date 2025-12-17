import axios from 'axios';
import { ReservationDTO, GetReservationsParams, CreateReservationDTO } from '../types/reservation';

// Base URL from environment variable
import { API_BASE_URL } from '../constants/config';


export const getReservations = async (params: GetReservationsParams): Promise<ReservationDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/reservations`, {
        params,
    });
    return response.data;
};

export const createReservation = async (data: CreateReservationDTO): Promise<void> => {
    await axios.post(`${API_BASE_URL}/reservations`, data);
};

export const getReservation = async (id: string): Promise<ReservationDTO> => {
    const response = await axios.get(`${API_BASE_URL}/reservations/${id}`);
    return response.data;
};

export const updateReservation = async (id: string, data: Partial<CreateReservationDTO>): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/reservations/${id}`, data);
};

export const deleteReservation = async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/reservations/${id}`);
};
