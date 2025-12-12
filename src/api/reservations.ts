import axios from 'axios';
import { ReservationDTO, GetReservationsParams } from '../types/reservation';

// TODO: Move base URL to environment variable
const API_BASE_URL = 'http://localhost:3000';

export const getReservations = async (params: GetReservationsParams): Promise<ReservationDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/reservations`, {
        params,
    });
    return response.data;
};
